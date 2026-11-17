import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { NIVEIS_PRIORIDADE_BM } from '@metricas-dspd/contratos';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type PoolLike } from '../../plataforma/db/pool.js';
import { dataCivilValida, textoSeguro } from './dominio-acelerato.js';

/**
 * Carregador do prazo de referência (SLE) do BusinessMap (pedido 105, K-214, D-T2): grava `dspd_bm.ref_sle` a partir do arquivo versionado
 * `docs/architecture/fontes/businessmap-sle.json`. Cada linha: prioridade nativa (a coluna `classe_servico` carrega o nível), prazo em dias úteis e data de
 * aprovação (vira `vigente_de`); equipe global `*` e percentil 85, os que a leitura do T2 usa (`lerSle`). O arquivo nasce vazio: sem prazo aprovado nada é
 * gravado e o T2 segue "não definido". Só INSERT e `UPDATE (vigente_ate)` (papel `dspd_ref`, sem GRANT novo): prazo gravado nunca é alterado nem apagado;
 * prazo novo para a mesma prioridade só entra com data de aprovação posterior à vigente (fecha a anterior em `vigente_ate`). Linha que sai do arquivo não
 * apaga nada. O arquivo inteiro é validado antes de qualquer escrita e a gravação é tudo ou nada, numa transação. Mensagens de erro trazem só o nome do
 * campo e a posição da linha, nunca valor. Sem dado de pessoa.
 */
export const ARQUIVO_SLE_BM = new URL('../../../../docs/architecture/fontes/businessmap-sle.json', import.meta.url);
export const EQUIPE_SLE = '*';
export const PERCENTIL_SLE = 85;
/** Métricas que a mudança afeta (T2.6): o T2 (aderência ao prazo) e o O3 (que perde a nota "SLE não definido"). */
export const METRICAS_SLE = ['T2', 'O3'] as const;
export const TAMANHO_MAXIMO_ARQUIVO_SLE = 64 * 1024;

export class ErroSle extends Error {
  constructor(readonly tipo: 'arquivo' | 'vigencia', mensagem: string) {
    super(mensagem);
    this.name = 'ErroSle';
  }
}

/** Dias úteis `> 0`, uma casa (`numeric(6,1)`), até 9999,9. */
const diasUteis = z.number().gt(0).max(9999.9).refine((d) => Math.round(d * 10) / 10 === d, 'no máximo uma casa decimal');
const prazoSchema = z.object({
  prioridade: z.enum(NIVEIS_PRIORIDADE_BM),
  dias_uteis: diasUteis,
  aprovado_em: z.string().refine(dataCivilValida, 'data inválida'),
}).strict();

export const esquemaSleBm = z.object({
  versao: z.literal(1),
  regra: textoSeguro(3000),
  versao_criterio: z.object({ descricao: textoSeguro(300), motivo: textoSeguro(500) }).strict(),
  prazos: z.array(prazoSchema).max(NIVEIS_PRIORIDADE_BM.length),
}).strict().superRefine((d, ctx) => {
  const vistas = new Set<string>();
  for (const [i, p] of d.prazos.entries()) {
    if (vistas.has(p.prioridade)) ctx.addIssue({ code: 'custom', path: ['prazos', i, 'prioridade'], message: 'prioridade repetida' });
    vistas.add(p.prioridade);
  }
});
export type ArquivoSleBm = z.infer<typeof esquemaSleBm>;
export interface SleBmLido { arquivo: ArquivoSleBm; sha256: string }

/** Lê e valida o texto (nunca grava nada). O erro nomeia o campo (caminho do esquema, linhas como `#n`), nunca o valor. O hash é o do texto exato. */
export function analisarSleBm(texto: string): SleBmLido {
  if (texto.length > TAMANHO_MAXIMO_ARQUIVO_SLE) throw new ErroSle('arquivo', 'o arquivo de SLE do BusinessMap passa do tamanho máximo');
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    throw new ErroSle('arquivo', 'o arquivo de SLE do BusinessMap não é um JSON válido');
  }
  const r = esquemaSleBm.safeParse(bruto);
  if (!r.success) {
    const campos = [...new Set(r.error.issues.map((i) => {
      const caminho = i.path.map((p) => (typeof p === 'number' ? `#${p + 1}` : String(p))).join('.') || 'raiz';
      return i.code === 'unrecognized_keys' ? `${caminho} (campo desconhecido)` : caminho;
    }))];
    throw new ErroSle('arquivo', `o arquivo de SLE do BusinessMap é inválido (campo: ${campos.join(', ')})`);
  }
  return { arquivo: r.data, sha256: createHash('sha256').update(texto, 'utf8').digest('hex') };
}

/** Caminho constante (sem argumento); o tamanho é conferido em `analisarSleBm`, antes do JSON. */
export const lerSleBm = (): SleBmLido => analisarSleBm(readFileSync(ARQUIVO_SLE_BM, 'utf8'));

export const referenciaDaVersaoSle = (sha256: string): string => `105:sle-bm:${sha256}`;

export interface SleVigente { classe: string; diasUteis: number; vigenteDe: string }
export interface PlanoSle {
  inserir: { classe: string; diasUteis: number; vigenteDe: string }[];
  fechar: { classe: string; ate: string }[];
}

/**
 * Plano puro: `vigentes` = linhas abertas (`vigente_ate` nulo) e `ultimas` = maior data (`vigente_de` ou `vigente_ate`) já registrada por prioridade.
 * Prazo igual ao vigente não grava. Prazo diferente exige `aprovado_em` posterior à última data registrada (não há períodos sobrepostos nem data
 * passada); data de aprovação no futuro (depois de `hoje`) é recusada. Qualquer recusa lança `ErroSle('vigencia')` com a prioridade, sem gravar nada.
 */
export function planejarSle(arquivo: ArquivoSleBm, vigentes: readonly SleVigente[], ultimas: ReadonlyMap<string, string>, hoje: string): PlanoSle {
  const plano: PlanoSle = { inserir: [], fechar: [] };
  for (const p of arquivo.prazos) {
    const atual = vigentes.find((v) => v.classe === p.prioridade);
    if (atual !== undefined && Number(atual.diasUteis) === p.dias_uteis) continue;
    if (p.aprovado_em > hoje) throw new ErroSle('vigencia', `sle ${p.prioridade}: aprovado_em é posterior a hoje (${hoje})`);
    const ultima = ultimas.get(p.prioridade);
    if (ultima !== undefined && p.aprovado_em <= ultima) {
      throw new ErroSle('vigencia', `sle ${p.prioridade}: aprovado_em tem de ser posterior à última vigência registrada (${ultima}); o histórico não é sobrescrito`);
    }
    if (atual !== undefined) plano.fechar.push({ classe: p.prioridade, ate: p.aprovado_em });
    plano.inserir.push({ classe: p.prioridade, diasUteis: p.dias_uteis, vigenteDe: p.aprovado_em });
  }
  return plano;
}

export interface ResultadoSleBm { sha256: string; prazos: number; inseridas: number; fechadas: number; versaoRegistrada: boolean }

/**
 * Lê as vigentes, planeja e grava numa transação só. Sem diferença nada é gravado; com diferença registra a versão de critério (T2.6, domínio
 * `businessmap`, métricas `METRICAS_SLE`) com o hash do arquivo, uma vez por hash, com a vigência da aprovação mais recente gravada agora.
 */
export async function sincronizarSleBm(pool: PoolLike, S: Esquemas, lido: SleBmLido, hoje: string, agora: Date): Promise<ResultadoSleBm> {
  return emTransacao(pool, async (db) => {
    const vigentes = (await db.query<{ classe: string; dias: string; de: string }>(
      `SELECT classe_servico AS classe, dias_uteis::text AS dias, vigente_de::text AS de FROM ${S.bm}.ref_sle
        WHERE vigente_ate IS NULL AND equipe = $1 AND percentil = $2`, [EQUIPE_SLE, PERCENTIL_SLE])).rows;
    const ultimas = (await db.query<{ classe: string; ultima: string }>(
      `SELECT classe_servico AS classe, max(greatest(vigente_de, coalesce(vigente_ate, vigente_de)))::text AS ultima FROM ${S.bm}.ref_sle
        WHERE equipe = $1 AND percentil = $2 GROUP BY classe_servico`, [EQUIPE_SLE, PERCENTIL_SLE])).rows;
    const plano = planejarSle(
      lido.arquivo, vigentes.map((v) => ({ classe: v.classe, diasUteis: Number(v.dias), vigenteDe: v.de })), new Map(ultimas.map((u) => [u.classe, u.ultima])), hoje);
    for (const f of plano.fechar) {
      await db.query(
        `UPDATE ${S.bm}.ref_sle SET vigente_ate = $1 WHERE vigente_ate IS NULL AND equipe = $2 AND classe_servico = $3 AND percentil = $4`, [f.ate, EQUIPE_SLE, f.classe, PERCENTIL_SLE]);
    }
    for (const i of plano.inserir) {
      await db.query(
        `INSERT INTO ${S.bm}.ref_sle (equipe, classe_servico, percentil, vigente_de, dias_uteis) VALUES ($1, $2, $3, $4, $5)`, [EQUIPE_SLE, i.classe, PERCENTIL_SLE, i.vigenteDe, i.diasUteis]);
    }
    let versaoRegistrada = false;
    if (plano.inserir.length > 0) {
      const referencia = referenciaDaVersaoSle(lido.sha256);
      const existe = await db.query(`SELECT 1 FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = $1`, [referencia]);
      if (existe.rows.length === 0) {
        const v = lido.arquivo.versao_criterio;
        const desde = plano.inserir.map((i) => i.vigenteDe).sort().at(-1)!;
        const nova = await db.query<{ versao_id: string }>(
          `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
           VALUES ($1, 'businessmap', $2, $3, $4, $5) RETURNING versao_id`, [desde, v.descricao, v.motivo, referencia, agora.toISOString()]);
        for (const m of METRICAS_SLE) {
          await db.query(`INSERT INTO ${S.core}.ref_versao_criterio_metrica (versao_id, metrica_id) VALUES ($1, $2)`, [nova.rows[0]!.versao_id, m]);
        }
        versaoRegistrada = true;
      }
    }
    return { sha256: lido.sha256, prazos: lido.arquivo.prazos.length, inseridas: plano.inserir.length, fechadas: plano.fechar.length, versaoRegistrada };
  });
}
