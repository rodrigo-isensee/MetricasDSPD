import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type Consultavel, type PoolLike } from '../../plataforma/db/pool.js';
import { dataCivilValida, textoSeguro } from './dominio-acelerato.js';
import { lerTurnosVigentes } from './repositorio.js';

/**
 * Carregador dos alvos de prioridade do Acelerato (pedido 099, D3; Q-099-5a e Q-099-11): grava `ref_alvo_prioridade` a partir do arquivo
 * versionado `docs/architecture/fontes/acelerato-alvos.json` (os 10 prazos do PROC 30.000.010 v002, em horas, cada um com a unidade
 * `corrido` ou `util`). Só INSERT e `UPDATE (vigente_ate)`: valor gravado nunca é alterado (mudança = nova vigência) e o arquivo inteiro é
 * validado antes de qualquer escrita (tudo ou nada, numa transação). Com mudança, registra uma versão de critério (T2.6) só com a S1 (exceção
 * à D-3, decidida na Q-099-11). D3b (Decisão 13): `versao` 2 traz `horas_por_dia_util` (8,8), a conversão de dias em horas do PROC; antes de gravar, o carregador recusa se o expediente vigente
 * do calendário da Sustentação (`ref_calendario_turno`) não somar essas horas (rode `ref:sync-calendario` antes). Sem dado de pessoa. Escrita pelo papel de referência (`dspd_ref`); chamado pelo `ac:ref-sync`.
 */
export const ARQUIVO_ALVOS = new URL('../../../../docs/architecture/fontes/acelerato-alvos.json', import.meta.url);

export const PRIORIDADES_ALVO = ['P1', 'P2', 'P3', 'P4', 'P5'] as const;
export const UNIDADES_PRAZO = ['corrido', 'util'] as const;
export type UnidadeAlvo = (typeof UNIDADES_PRAZO)[number];
/** Métricas que mudam com a unidade do alvo: a S1 (Q-099-11) e a Visão geral, que lê `calcularS1` (A1 do QA; T2.6). */
export const METRICAS_ALVOS: readonly string[] = ['S1', 'VISAO_GERAL'];

export class ErroAlvos extends Error {
  constructor(readonly tipo: 'arquivo' | 'vigencia', mensagem: string) {
    super(mensagem);
    this.name = 'ErroAlvos';
  }
}

/** Horas `> 0`, até duas casas e dentro de `numeric(8,2)`: o que a coluna guarda exatamente. */
const horas = z.number().gt(0).lt(1_000_000).refine((h) => Math.round(h * 100) / 100 === h, 'no máximo duas casas decimais');
const prazo = z.object({ horas, unidade: z.enum(UNIDADES_PRAZO), texto_proc: textoSeguro(80) }).strict();
const alvoSchema = z.object({ prioridade: z.enum(PRIORIDADES_ALVO), primeiro_atendimento: prazo, restauracao: prazo }).strict();

export const esquemaAlvos = z.object({
  versao: z.literal(2),
  /** Horas do dia útil da Sustentação usadas para converter os prazos em dias do PROC (Decisão 13: 8,8). Tem de bater com o expediente gravado. */
  horas_por_dia_util: z.number().gt(0).max(24).refine((h) => Math.round(h * 100) / 100 === h, 'no máximo duas casas decimais'),
  fonte: textoSeguro(80),
  versao_criterio: z.object({ descricao: textoSeguro(300), motivo: textoSeguro(500) }).strict(),
  alvos: z.array(alvoSchema).length(PRIORIDADES_ALVO.length),
}).strict().superRefine((d, ctx) => {
  const vistas = new Set<string>();
  for (const [i, a] of d.alvos.entries()) {
    if (vistas.has(a.prioridade)) ctx.addIssue({ code: 'custom', path: ['alvos', i, 'prioridade'], message: 'prioridade repetida' });
    vistas.add(a.prioridade);
  }
});
export type ArquivoAlvos = z.infer<typeof esquemaAlvos>;
export interface AlvosLidos { arquivo: ArquivoAlvos; sha256: string }

/** Lê e valida o texto (nunca grava nada). O hash é o do texto exato do arquivo. */
export function analisarAlvos(texto: string): AlvosLidos {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    throw new ErroAlvos('arquivo', 'o arquivo de alvos não é um JSON válido');
  }
  const r = esquemaAlvos.safeParse(bruto);
  if (!r.success) {
    const onde = [...new Set(r.error.issues.map((i) => i.path.slice(0, 3).join('.') || 'raiz'))].join(', ');
    throw new ErroAlvos('arquivo', `o arquivo de alvos é inválido (${onde})`);
  }
  return { arquivo: r.data, sha256: createHash('sha256').update(texto, 'utf8').digest('hex') };
}
export const lerArquivoAlvos = (caminho: URL | string = ARQUIVO_ALVOS): AlvosLidos => analisarAlvos(readFileSync(caminho, 'utf8'));

export const referenciaDaVersaoAlvos = (sha256: string): string => `099:alvos:${sha256}`;
const PREFIXO_REFERENCIA = '099:alvos:';

export interface VigenteAlvo { vigenteDe: string; paHoras: number; unidadePa: UnidadeAlvo; rHoras: number; unidadeR: UnidadeAlvo }
export interface EstadoAlvos {
  /** Vigência aberta (`vigente_ate` nulo) por prioridade. */
  vigentes: ReadonlyMap<string, VigenteAlvo>;
  /** Maior data (`vigente_de` ou `vigente_ate`) já registrada por prioridade. */
  ultimas: ReadonlyMap<string, string>;
  /** Maior `vigente_desde` das versões deste carregador. */
  ultimaVersao: string | undefined;
}
export interface LinhaAlvoNova { prioridade: string; paHoras: number; unidadePa: UnidadeAlvo; rHoras: number; unidadeR: UnidadeAlvo }
export interface PlanoAlvos { inserir: LinhaAlvoNova[]; fechar: string[]; mudou: boolean }

/**
 * Compara o arquivo com o que está gravado e devolve o que gravar, sem tocar no banco. Vigente igual (valor e unidade): nada. Diferente: fecha a
 * vigente e abre a nova. Recusa (ErroAlvos) data que não seja posterior à última vigência da prioridade (sem períodos sobrepostos) e versão de
 * critério com data anterior à última registrada.
 */
export function planejarAlvos(arquivo: ArquivoAlvos, estado: EstadoAlvos, hoje: string): PlanoAlvos {
  const plano: PlanoAlvos = { inserir: [], fechar: [], mudou: false };
  for (const a of arquivo.alvos) {
    const novo: LinhaAlvoNova = {
      prioridade: a.prioridade, paHoras: a.primeiro_atendimento.horas, unidadePa: a.primeiro_atendimento.unidade,
      rHoras: a.restauracao.horas, unidadeR: a.restauracao.unidade,
    };
    const v = estado.vigentes.get(a.prioridade);
    if (v !== undefined && v.paHoras === novo.paHoras && v.unidadePa === novo.unidadePa && v.rHoras === novo.rHoras && v.unidadeR === novo.unidadeR) continue;
    const ultima = estado.ultimas.get(a.prioridade);
    if (ultima !== undefined && hoje <= ultima) {
      throw new ErroAlvos('vigencia', `alvo ${a.prioridade}: a data ${hoje} não é posterior à última vigência (${ultima}); use uma data posterior`);
    }
    if (v !== undefined) plano.fechar.push(a.prioridade);
    plano.inserir.push(novo);
  }
  plano.mudou = plano.inserir.length > 0;
  if (plano.mudou && estado.ultimaVersao !== undefined && hoje < estado.ultimaVersao) {
    throw new ErroAlvos('vigencia', `alvos: a data ${hoje} é anterior à última versão de critério dos alvos (${estado.ultimaVersao}); use essa data ou uma posterior`);
  }
  return plano;
}

async function lerEstado(db: Consultavel, S: Esquemas): Promise<EstadoAlvos> {
  const linhas = (await db.query<{ prioridade: string; vigente_de: string; vigente_ate: string | null; prazo_pa_horas: string; unidade_pa: UnidadeAlvo; prazo_r_horas: string; unidade_r: UnidadeAlvo }>(
    `SELECT prioridade, vigente_de::text AS vigente_de, vigente_ate::text AS vigente_ate, prazo_pa_horas, unidade_pa, prazo_r_horas, unidade_r
       FROM ${S.ac}.ref_alvo_prioridade WHERE prioridade = ANY($1::text[])`, [PRIORIDADES_ALVO])).rows;
  const vigentes = new Map<string, VigenteAlvo>();
  const ultimas = new Map<string, string>();
  for (const l of linhas) {
    if (l.vigente_ate === null) {
      vigentes.set(l.prioridade, { vigenteDe: l.vigente_de, paHoras: Number(l.prazo_pa_horas), unidadePa: l.unidade_pa, rHoras: Number(l.prazo_r_horas), unidadeR: l.unidade_r });
    }
    const fim = l.vigente_ate !== null && l.vigente_ate > l.vigente_de ? l.vigente_ate : l.vigente_de;
    if (fim > (ultimas.get(l.prioridade) ?? '')) ultimas.set(l.prioridade, fim);
  }
  const v = (await db.query<{ ultima: string | null }>(
    `SELECT max(vigente_desde)::text AS ultima FROM ${S.core}.ref_versao_criterio WHERE dominio = 'acelerato' AND referencia LIKE $1`, [`${PREFIXO_REFERENCIA}%`])).rows[0];
  return { vigentes, ultimas, ultimaVersao: v?.ultima ?? undefined };
}

/** Guarda do D3b: alvo de dias x 8,8 h só com expediente de 528 min gravado (senão medida e alvo usariam dias úteis diferentes). */
async function conferirExpediente(db: Consultavel, S: Esquemas, horasPorDiaUtil: number): Promise<void> {
  const turnos = await lerTurnosVigentes(db, S, 'acelerato', 'sustentacao');
  const minutos = turnos.reduce((n, t) => n + (t.fimMin - t.inicioMin), 0);
  if (minutos !== Math.round(horasPorDiaUtil * 60)) {
    throw new ErroAlvos('vigencia', `alvos: o dia útil do arquivo (${horasPorDiaUtil} h) difere do expediente gravado da Sustentação (${minutos} min); rode o ref:sync-calendario antes`);
  }
}

export interface ResultadoAlvos { sha256: string; inseridos: number; fechados: number; versaoRegistrada: boolean }

/**
 * Lê o estado, planeja e grava numa transação só (tudo ou nada). Sem diferença nada é gravado (idempotente); com diferença grava as vigências e
 * registra a versão de critério (uma por hash do arquivo) com a S1.
 */
export async function sincronizarAlvos(pool: PoolLike, S: Esquemas, lido: AlvosLidos, hoje: string, agora: Date): Promise<ResultadoAlvos> {
  if (!dataCivilValida(hoje)) throw new ErroAlvos('vigencia', 'data de vigência inválida');
  return emTransacao(pool, async (db) => {
    const plano = planejarAlvos(lido.arquivo, await lerEstado(db, S), hoje);
    if (plano.mudou) await conferirExpediente(db, S, lido.arquivo.horas_por_dia_util);
    let versaoRegistrada = false;
    if (plano.mudou) {
      const referencia = referenciaDaVersaoAlvos(lido.sha256);
      const existe = await db.query<{ versao_id: string }>(`SELECT versao_id FROM ${S.core}.ref_versao_criterio WHERE dominio = 'acelerato' AND referencia = $1`, [referencia]);
      if (existe.rows[0] === undefined) {
        const v = lido.arquivo.versao_criterio;
        const r = await db.query<{ versao_id: string }>(
          `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
           VALUES ($1, 'acelerato', $2, $3, $4, $5) RETURNING versao_id`, [hoje, v.descricao, v.motivo, referencia, agora.toISOString()]);
        for (const m of METRICAS_ALVOS) await db.query(`INSERT INTO ${S.core}.ref_versao_criterio_metrica (versao_id, metrica_id) VALUES ($1, $2)`, [r.rows[0]!.versao_id, m]);
        versaoRegistrada = true;
      }
      for (const p of plano.fechar) {
        await db.query(`UPDATE ${S.ac}.ref_alvo_prioridade SET vigente_ate = $1 WHERE vigente_ate IS NULL AND prioridade = $2`, [hoje, p]);
      }
      for (const a of plano.inserir) {
        await db.query(
          `INSERT INTO ${S.ac}.ref_alvo_prioridade (prioridade, vigente_de, prazo_pa_horas, unidade_pa, prazo_r_horas, unidade_r) VALUES ($1, $2, $3, $4, $5, $6)`,
          [a.prioridade, hoje, a.paHoras, a.unidadePa, a.rHoras, a.unidadeR]);
      }
    }
    return { sha256: lido.sha256, inseridos: plano.inserir.length, fechados: plano.fechar.length, versaoRegistrada };
  });
}
