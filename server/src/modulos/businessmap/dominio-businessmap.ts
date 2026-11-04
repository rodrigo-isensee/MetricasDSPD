import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type PoolLike } from '../../plataforma/db/pool.js';
import { ErroDominio, planejarDominio, textoSeguro, type LinhaVigente } from '../referencia/index.js';
import { CAMPOS_CUSTOMIZADOS_FORA, COLUNAS_LISTA, VALOR_DESCONHECIDO } from './allow-list.js';

/**
 * Mapa `field_id` -> coluna de `dim_card` e domínios dos campos customizados do BusinessMap, carregados do arquivo versionado
 * `docs/architecture/fontes/businessmap-dominio.json` para `dspd_bm.ref_dominio` pela entrada `bm:ref-sync` (pedido 069, L2-a; modelo de
 * ameaças `docs/security/069-modelo-ameacas.md`). Fronteira de segurança: o que está no `ref_dominio` decide que campo sai da fonte.
 * Por isso (1) o esquema do arquivo é fechado (`strict`), com lista positiva de `type`, enum de colunas e texto seguro; (2) os fields 36 e 42
 * são recusados no arquivo e removidos de novo na leitura do banco; (3) nada de GRANT novo: o `dspd_ref` já escreve `ref_`.
 * Mensagens de erro trazem só caminho do esquema, nunca valor.
 */
export const ARQUIVO_DOMINIO_BM = new URL('../../../../docs/architecture/fontes/businessmap-dominio.json', import.meta.url);
export const TAMANHO_MAXIMO_ARQUIVO = 512 * 1024;
/** Valor de `ref_dominio.campo` da linha que liga `field_id` (codigo) à coluna (rotulo). */
export const CAMPO_CUSTOMIZADO = 'campo_customizado';

/**
 * Lista POSITIVA dos `type` de campo customizado aceitos (A3 do modelo de ameaças): só seleção única. Vazia até o diagnóstico (P-L2-1) mostrar os
 * tipos reais; o PR que preencher o arquivo preenche esta constante, com parecer de segurança. Vazia, toda carga com campo é recusada.
 */
export const TIPOS_SELECAO_UNICA: readonly string[] = [];

const ID_CAMPO = /^\d{1,10}$/;
// Mesma regra de `textoSeguro` para o código lido do banco: sem controle, invisível, separador de linha nem arroba.
const CODIGO_SEGURO = /^[^\p{Cc}\p{Cf}\p{Zl}\p{Zp}@]{1,80}$/u;

const valorDominio = z.object({ codigo: textoSeguro(80), rotulo: textoSeguro(120) }).strict();
const criarCampo = (tipos: readonly string[]) =>
  z
  .object({
    field_id: z.string().regex(ID_CAMPO),
    type: z.string().max(40).refine((t) => tipos.includes(t), 'tipo não aceito'),
    coluna: z.enum(COLUNAS_LISTA),
    valores: z.array(valorDominio).min(1).max(500),
  })
  .strict();

export const criarEsquemaDominioBm = (tipos: readonly string[] = TIPOS_SELECAO_UNICA) => z
  .object({
    versao: z.literal(1),
    versao_criterio: z
      .object({ dominio: z.literal('businessmap'), descricao: textoSeguro(300), motivo: textoSeguro(500), referencia: textoSeguro(300) })
      .strict(),
    schema: z.literal('dspd_bm'),
    tabela: z.literal('ref_dominio'),
    regra: textoSeguro(2000),
    campos: z.array(criarCampo(tipos)).max(40),
  })
  .strict()
  .superRefine((d, ctx) => {
    const ids = new Set<string>();
    const colunas = new Set<string>();
    for (const [i, c] of d.campos.entries()) {
      // `Number` normaliza "042" e "0042": o coletor casa por `String(field_id)`, mas a recusa não depende dessa sorte.
      if ((CAMPOS_CUSTOMIZADOS_FORA as readonly string[]).includes(String(Number(c.field_id)))) {
        ctx.addIssue({ code: 'custom', path: ['campos', i, 'field_id'], message: 'field proibido' });
      }
      if (ids.has(c.field_id)) ctx.addIssue({ code: 'custom', path: ['campos', i, 'field_id'], message: 'field_id repetido' });
      if (colunas.has(c.coluna)) ctx.addIssue({ code: 'custom', path: ['campos', i, 'coluna'], message: 'coluna repetida' });
      ids.add(c.field_id);
      colunas.add(c.coluna);
      const codigos = new Set<string>();
      const rotulos = new Set<string>();
      for (const [j, v] of c.valores.entries()) {
        // `desconhecido` é o código reservado do valor fora do domínio.
        if (codigos.has(v.codigo) || v.codigo === VALOR_DESCONHECIDO) ctx.addIssue({ code: 'custom', path: ['campos', i, 'valores', j, 'codigo'], message: 'código repetido ou reservado' });
        if (rotulos.has(v.rotulo)) ctx.addIssue({ code: 'custom', path: ['campos', i, 'valores', j, 'rotulo'], message: 'rótulo repetido' });
        codigos.add(v.codigo);
        rotulos.add(v.rotulo);
      }
    }
  });
export type ArquivoDominioBm = z.infer<ReturnType<typeof criarEsquemaDominioBm>>;
export interface DominioBmLido { arquivo: ArquivoDominioBm; sha256: string }

/** Lê e valida o texto (nunca grava nada). O hash é o do texto exato do arquivo. */
export function analisarDominioBm(texto: string, tipos: readonly string[] = TIPOS_SELECAO_UNICA): DominioBmLido {
  if (texto.length > TAMANHO_MAXIMO_ARQUIVO) throw new ErroDominio('arquivo', 'o arquivo de domínio do BusinessMap passa do tamanho máximo');
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    throw new ErroDominio('arquivo', 'o arquivo de domínio do BusinessMap não é um JSON válido');
  }
  const r = criarEsquemaDominioBm(tipos).safeParse(bruto);
  if (!r.success) {
    const onde = [...new Set(r.error.issues.map((i) => i.path.slice(0, 3).map((p) => (typeof p === 'number' ? '#' : 'item')).join('.') || 'raiz'))].join(', ');
    throw new ErroDominio('arquivo', `o arquivo de domínio do BusinessMap é inválido (${onde})`);
  }
  return { arquivo: r.data, sha256: createHash('sha256').update(texto, 'utf8').digest('hex') };
}

/** Caminho constante (sem argumento); o tamanho máximo é conferido em `analisarDominioBm`, antes do JSON. */
export function lerDominioBm(): DominioBmLido {
  return analisarDominioBm(readFileSync(ARQUIVO_DOMINIO_BM, 'utf8'));
}

/** O arquivo como listas de `ref_dominio`: `campo_customizado` (field_id -> coluna) e, por coluna, os valores. Sempre traz `campo_customizado`, mesmo vazio, para fechar o que saiu. */
export function listasDoArquivo(a: ArquivoDominioBm): Record<string, { codigo: string; rotulo: string }[]> {
  const listas: Record<string, { codigo: string; rotulo: string }[]> = {
    [CAMPO_CUSTOMIZADO]: a.campos.map((c) => ({ codigo: c.field_id, rotulo: c.coluna })),
  };
  for (const c of a.campos) listas[c.coluna] = c.valores;
  return listas;
}

export const referenciaDaVersaoBm = (sha256: string): string => `069:ref-bm-campos:${sha256}`;

export interface ResultadoDominioBm { sha256: string; campos: number; inseridas: number; fechadas: number; versaoRegistrada: boolean }

/**
 * Lê as vigentes, planeja e grava numa transação só (tudo ou nada); só INSERT de vigência nova e UPDATE de `vigente_ate`. Sem diferença nada é
 * gravado; com diferença registra a versão de critério (T2.6, domínio `businessmap`) com o hash do arquivo, uma vez por hash. A versão não marca
 * métrica: quais métricas a mudança afeta (O6, O10 e os filtros) é decisão de negócio, registrada quando o arquivo ganhar campos.
 */
export async function sincronizarDominioBm(pool: PoolLike, S: Esquemas, lido: DominioBmLido, hoje: string, agora: Date): Promise<ResultadoDominioBm> {
  const listas = listasDoArquivo(lido.arquivo);
  return emTransacao(pool, async (db) => {
    const campos = Object.keys(listas);
    const vigentes = (await db.query<LinhaVigente>(
      `SELECT campo, codigo, rotulo, vigente_de FROM ${S.bm}.ref_dominio WHERE vigente_ate IS NULL AND campo = ANY($1::text[])`, [campos])).rows;
    const ultimas = (await db.query<{ campo: string; ultima: string }>(
      `SELECT campo, max(greatest(vigente_de, coalesce(vigente_ate, vigente_de)))::text AS ultima FROM ${S.bm}.ref_dominio WHERE campo = ANY($1::text[]) GROUP BY campo`, [campos])).rows;
    const plano = planejarDominio({ dominios: listas }, vigentes, hoje, new Map(ultimas.map((u) => [u.campo, u.ultima])));
    for (const f of plano.fechar) {
      await db.query(`UPDATE ${S.bm}.ref_dominio SET vigente_ate = $1 WHERE vigente_ate IS NULL AND campo = $2 AND codigo = $3`, [hoje, f.campo, f.codigo]);
    }
    for (const i of plano.inserir) {
      await db.query(
        `INSERT INTO ${S.bm}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ($1, $2, $3, $4, $5)`, [i.campo, i.codigo, hoje, i.rotulo, i.ordem]);
    }
    let versaoRegistrada = false;
    if (plano.inserir.length + plano.fechar.length > 0) {
      const referencia = referenciaDaVersaoBm(lido.sha256);
      const existe = await db.query(`SELECT 1 FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = $1`, [referencia]);
      if (existe.rows.length === 0) {
        const v = lido.arquivo.versao_criterio;
        await db.query(
          `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
           VALUES ($1, 'businessmap', $2, $3, $4, $5)`, [hoje, v.descricao, v.motivo, referencia, agora.toISOString()]);
        versaoRegistrada = true;
      }
    }
    return { sha256: lido.sha256, campos: lido.arquivo.campos.length, inseridas: plano.inserir.length, fechadas: plano.fechar.length, versaoRegistrada };
  });
}

export interface LinhaRefDominio { campo: string; codigo: string; rotulo: string }

/**
 * Lado do coletor (A4 do modelo de ameaças): monta `field_id` -> (valor recebido -> código) do `ref_dominio` vigente, desconfiando do banco.
 * Ignora linha `campo_customizado` com `field_id` não numérico, coluna fora do enum, field 36 ou 42 (depois da leitura, mesmo que o arquivo os
 * recuse) e `field_id` ligado a duas colunas; ignora valor com código inseguro ou reservado e rótulo que leva a dois códigos. Campo sem valor não entra.
 */
export function dominiosDeLinhas(linhas: readonly LinhaRefDominio[]): Map<string, Map<string, string>> {
  const colunas = COLUNAS_LISTA as readonly string[];
  const fora = CAMPOS_CUSTOMIZADOS_FORA as readonly string[];
  const colunaDe = new Map<string, string | null>();
  for (const l of linhas) {
    if (l.campo !== CAMPO_CUSTOMIZADO || !ID_CAMPO.test(l.codigo) || !colunas.includes(l.rotulo)) continue;
    if (fora.includes(l.codigo) || fora.includes(String(Number(l.codigo)))) continue;
    colunaDe.set(l.codigo, colunaDe.has(l.codigo) && colunaDe.get(l.codigo) !== l.rotulo ? null : l.rotulo);
  }
  const porColuna = new Map<string, Map<string, string | null>>();
  for (const l of linhas) {
    if (l.campo === CAMPO_CUSTOMIZADO || !colunas.includes(l.campo)) continue;
    if (!CODIGO_SEGURO.test(l.codigo) || l.codigo === VALOR_DESCONHECIDO || l.rotulo.length === 0) continue;
    const m = porColuna.get(l.campo) ?? new Map<string, string | null>();
    m.set(l.rotulo, m.has(l.rotulo) && m.get(l.rotulo) !== l.codigo ? null : l.codigo);
    porColuna.set(l.campo, m);
  }
  const mapa = new Map<string, Map<string, string>>();
  for (const [id, coluna] of colunaDe) {
    if (coluna === null) continue;
    const dominio = new Map<string, string>();
    for (const [rotulo, codigo] of porColuna.get(coluna) ?? []) if (codigo !== null) dominio.set(rotulo, codigo);
    if (dominio.size > 0) mapa.set(id, dominio);
  }
  return mapa;
}
