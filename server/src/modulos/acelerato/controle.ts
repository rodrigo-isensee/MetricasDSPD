import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import type { ConfigAcelerato } from './config.js';
import { ErroColeta } from './erros.js';
import { CAMPOS_ETAPA_F3, COLUNAS_DA_LINHA, NOMES_CAMPO_FATIA_F1, TABELA_ORIGEM, campoDominioEtapa } from './listas-fechadas.js';
import { CAMPO_ETAPA_FLUXO } from './referencia.js';
import { sha256Texto, sqlSha256 } from './sql.js';

/**
 * Controle da coleta (`ctl_coleta`, `ctl_coleta_contagem`, `ctl_coleta_falha`; data-model §4). A linha de `ctl_coleta` é
 * gravada UMA vez, ao fim, com o resultado final: o papel do coletor só tem UPDATE em quatro colunas, e `parametros`
 * não é uma delas. Marca d'água só em sucesso (ADR 0006): linha de falha nunca carrega marca.
 */
export const VERSAO_COLETOR = 'acelerato-f1/1';
export type TarefaAcelerato = 'coleta_incremental' | 'varredura';

/** Parâmetros registrados: hashes do que identifica a origem e as listas (nunca host, banco ou senha em claro). */
export type ParametrosColeta = {
  host_sha256: string; banco_sha256: string; tabela: string; colunas_sha256: string; campos_sha256: string;
  sql_sha256: string; tls_sha256: string; fluxo_sha256: string; recorte_sha256: string; vocabulario_sha256: string; sincronizado_em_max: string | null;
};
/** Mudança de qualquer uma destas, sem a opção de reconhecer, recusa a coleta (CA-8); com a opção, as listas ainda exigem versão de critério (`exigirVersaoDasListas`). */
export const CHAVES_COMPARADAS = ['host_sha256', 'banco_sha256', 'tabela', 'colunas_sha256', 'campos_sha256', 'sql_sha256', 'tls_sha256', 'fluxo_sha256', 'recorte_sha256', 'vocabulario_sha256'] as const;

/**
 * SHA-256 da lista de posições das etapas (`codigo|ordem`, uma por linha, ordenada por `codigo`). Trocar a lista muda o valor decidido dos campos
 * repetidos, então entra nos parâmetros comparados: mudança sem reconhecimento recusa a coleta (CA-8, T2.6). Só números; nenhum valor de campo.
 */
export const fluxoSha256 = (ordem: ReadonlyMap<number, number>): string =>
  sha256Texto([...ordem].sort(([a], [b]) => a - b).map(([codigo, posicao]) => `${codigo}|${posicao}`).join('\n'));

/** Campos de `ref_dominio` do recorte (o que entra no WHERE da Q1) e do vocabulário (allow-list de valores); `cpe_*` entram pelas linhas lidas. */
export const CAMPOS_RECORTE = ['tipo_recorte', 'organizacao_recorte', 'equipe'] as const;
export const CAMPOS_VOCABULARIO = ['etapa', 'prioridade', 'categoria', 'descricao_workflow'] as const;
export type LinhaLista = { campo: string; codigo: string; rotulo: string };
/** Hashes das listas de `ref_dominio` lidas na partida (CA-8, K-224). Só hash: nunca o valor das listas. */
export type HashesListas = { recorte_sha256: string; vocabulario_sha256: string };

/**
 * SHA-256 de uma lista de `ref_dominio` vigente: uma linha `campo|codigo|rotulo` por item, ordenada por `campo` e `codigo` (a ordem de chegada e a
 * `ordem` de exibição não entram). Lista vazia tem hash estável (o da string vazia).
 */
export const listasSha256 = (linhas: readonly LinhaLista[]): string =>
  sha256Texto([...linhas].sort((a, b) => (a.campo < b.campo ? -1 : a.campo > b.campo ? 1 : a.codigo < b.codigo ? -1 : a.codigo > b.codigo ? 1 : 0))
    .map((l) => `${l.campo}|${l.codigo}|${l.rotulo}`).join('\n'));

/** `recorte_sha256` (tipo, organização, equipe) e `vocabulario_sha256` (etapa, prioridade, categoria, workflow e os domínios `cpe_*`). */
export function hashesDasListas(linhas: readonly LinhaLista[], linhasDominiosEtapa: readonly LinhaLista[]): HashesListas {
  const recorte: readonly string[] = CAMPOS_RECORTE, vocab: readonly string[] = CAMPOS_VOCABULARIO;
  return {
    recorte_sha256: listasSha256(linhas.filter((l) => recorte.includes(l.campo))),
    vocabulario_sha256: listasSha256([...linhas.filter((l) => vocab.includes(l.campo)), ...linhasDominiosEtapa]),
  };
}

export function montarParametros(config: ConfigAcelerato, sincronizadoEmMax: string | null, ordemFluxo: ReadonlyMap<number, number>, listas: HashesListas): ParametrosColeta {
  return {
    host_sha256: sha256Texto(config.host), banco_sha256: sha256Texto(config.banco), tabela: TABELA_ORIGEM,
    colunas_sha256: sha256Texto(COLUNAS_DA_LINHA.join(',')), campos_sha256: sha256Texto([...NOMES_CAMPO_FATIA_F1, ...CAMPOS_ETAPA_F3.map((c) => `${c.nome}|${c.tratamento}`)].join('\n')),
    sql_sha256: sqlSha256(), tls_sha256: config.tlsSha256, fluxo_sha256: fluxoSha256(ordemFluxo), ...listas, sincronizado_em_max: sincronizadoEmMax,
  };
}

/** Nomes (nunca valores) dos parâmetros que mudaram. */
export const parametrosDiferentes = (atual: ParametrosColeta, anterior: Partial<ParametrosColeta>): string[] =>
  CHAVES_COMPARADAS.filter((k) => atual[k] !== anterior[k]);

export type UltimoSucesso = { marca: Date | null; parametros: Partial<ParametrosColeta> | null; finalizadoEm: Date | null };

/** Chave de hash de lista -> campos de `ref_dominio` que ela cobre; só constantes do código, nunca da entrada (E10, Lote 2). */
export const GRUPOS_DE_LISTA = {
  recorte_sha256: [...CAMPOS_RECORTE],
  vocabulario_sha256: [...CAMPOS_VOCABULARIO, ...CAMPOS_ETAPA_F3.filter((c) => c.tratamento === 'lista').map((c) => campoDominioEtapa(c.chave))],
  fluxo_sha256: [CAMPO_ETAPA_FLUXO],
} as const satisfies Partial<Record<keyof ParametrosColeta, readonly string[]>>;
const PREFIXO_VERSAO_LISTA = '056:ref-dominio:';
const FUSO_MS = 3 * 3_600_000; // -03:00 (P-DS-2)

/**
 * Opção C (P-E10-1): ao reconhecer mudança, cada lista mudada precisa de vigência nova (`vigente_de` ou `vigente_ate` na data civil do último sucesso ou depois)
 * e, para cada data nova, da versão `056:ref-dominio:` do `ac:ref-sync`. Sem vigência nova: `lista-sobrescrita`; sem versão: `reconhecimento-sem-versao`.
 * Chave ausente na linha anterior não é conferida. O erro leva só o nome da chave.
 */
export async function exigirVersaoDasListas(
  db: Consultavel, S: Esquemas, atual: ParametrosColeta, anterior: Partial<ParametrosColeta>, finalizadoEm: Date | null,
): Promise<void> {
  const dia = finalizadoEm === null ? '1970-01-01' : new Date(finalizadoEm.getTime() - FUSO_MS).toISOString().slice(0, 10);
  for (const chave of Object.keys(GRUPOS_DE_LISTA) as (keyof typeof GRUPOS_DE_LISTA)[]) {
    if (anterior[chave] === undefined || anterior[chave] === atual[chave]) continue;
    const datas = await db.query<{ tem_versao: boolean }>(
      `SELECT EXISTS (SELECT 1 FROM ${S.core}.ref_versao_criterio v WHERE v.dominio = 'acelerato' AND starts_with(v.referencia, $3) AND v.vigente_desde = d.data) AS tem_versao
         FROM (SELECT vigente_de AS data FROM ${S.ac}.ref_dominio WHERE campo = ANY($1::text[]) AND vigente_de >= $2::date
               UNION SELECT vigente_ate FROM ${S.ac}.ref_dominio WHERE campo = ANY($1::text[]) AND vigente_ate >= $2::date) d`,
      [GRUPOS_DE_LISTA[chave], dia, PREFIXO_VERSAO_LISTA]);
    if (datas.rows.length === 0) throw new ErroColeta('lista-sobrescrita', { coluna: chave });
    if (datas.rows.some((r) => !r.tem_versao)) throw new ErroColeta('reconhecimento-sem-versao', { coluna: chave });
  }
}

export async function ultimoSucesso(db: Consultavel, S: Esquemas): Promise<UltimoSucesso> {
  const p = await db.query<{ parametros: Partial<ParametrosColeta> | null; finalizado_em: Date | null }>(
    `SELECT parametros, finalizado_em FROM ${S.ac}.ctl_coleta WHERE status = 'sucesso' AND tarefa IN ('coleta_incremental', 'varredura') ORDER BY coleta_id DESC LIMIT 1`);
  const m = await db.query<{ marca: Date | null }>(
    `SELECT max(marca_dagua_ate) AS marca FROM ${S.ac}.ctl_coleta WHERE tarefa = 'coleta_incremental' AND status = 'sucesso'`);
  return { marca: m.rows[0]?.marca ?? null, parametros: p.rows[0]?.parametros ?? null, finalizadoEm: p.rows[0]?.finalizado_em ?? null };
}

export type EntradaCtl = {
  tarefa: TarefaAcelerato; iniciadoEm: Date; finalizadoEm: Date; marcaDe: Date | null; marcaAte: Date | null;
  sobreposicaoS: number; parametros: ParametrosColeta;
};

export async function registrarSucesso(db: Consultavel, S: Esquemas, e: EntradaCtl): Promise<number> {
  const r = await db.query<{ coleta_id: string }>(
    `INSERT INTO ${S.ac}.ctl_coleta
       (tarefa, iniciado_em, finalizado_em, status, marca_dagua_de, marca_dagua_ate, sobreposicao_s, versao_coletor, parametros)
     VALUES ($1, $2, $3, 'sucesso', $4, $5, $6, $7, $8::jsonb) RETURNING coleta_id`,
    [e.tarefa, e.iniciadoEm, e.finalizadoEm, e.marcaDe, e.marcaAte, e.sobreposicaoS, VERSAO_COLETOR, JSON.stringify(e.parametros)]);
  return Number(r.rows[0]!.coleta_id);
}

export type Contagem = { entidade: string; lidos: number; inseridos: number; jaExistentes: number; falhas: number };

export async function registrarContagens(db: Consultavel, S: Esquemas, coletaId: number, contagens: readonly Contagem[]): Promise<void> {
  for (const c of contagens) {
    await db.query(
      `INSERT INTO ${S.ac}.ctl_coleta_contagem (coleta_id, entidade, lidos, inseridos, ja_existentes, falhas)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [coletaId, c.entidade, c.lidos, c.inseridos, c.jaExistentes, c.falhas]);
  }
}

/** Falha: uma linha em `ctl_coleta` (status `falha`, sem marca) e uma em `ctl_coleta_falha`, só com código, entidade e `id_origem`. */
export async function registrarFalha(
  db: Consultavel, S: Esquemas, e: { tarefa: TarefaAcelerato; iniciadoEm: Date; finalizadoEm: Date; erro: ErroColeta; tentativas: number },
): Promise<void> {
  const resumo = e.erro.coluna === undefined ? e.erro.codigo : `${e.erro.codigo} (${e.erro.coluna})`;
  const r = await db.query<{ coleta_id: string }>(
    `INSERT INTO ${S.ac}.ctl_coleta (tarefa, iniciado_em, finalizado_em, status, versao_coletor, erro_resumo)
     VALUES ($1, $2, $3, 'falha', $4, $5) RETURNING coleta_id`,
    [e.tarefa, e.iniciadoEm, e.finalizadoEm, VERSAO_COLETOR, resumo]);
  await db.query(
    `INSERT INTO ${S.ac}.ctl_coleta_falha (coleta_id, entidade, id_origem, tentativas, erro) VALUES ($1, $2, $3, $4, $5)`,
    [Number(r.rows[0]!.coleta_id), e.erro.entidade ?? 'coleta', e.erro.idOrigem ?? null, e.tentativas, resumo]);
}
