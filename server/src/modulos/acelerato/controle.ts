import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import type { ConfigAcelerato } from './config.js';
import type { ErroColeta } from './erros.js';
import { COLUNAS_DA_LINHA, NOMES_CAMPO_FATIA_F1, TABELA_ORIGEM } from './listas-fechadas.js';
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
  sql_sha256: string; tls_sha256: string; sincronizado_em_max: string | null;
};
/** Mudança de qualquer uma destas, sem versão de critério reconhecida, recusa a coleta (CA-8). */
export const CHAVES_COMPARADAS = ['host_sha256', 'banco_sha256', 'tabela', 'colunas_sha256', 'campos_sha256', 'sql_sha256', 'tls_sha256'] as const;

export function montarParametros(config: ConfigAcelerato, sincronizadoEmMax: string | null): ParametrosColeta {
  return {
    host_sha256: sha256Texto(config.host), banco_sha256: sha256Texto(config.banco), tabela: TABELA_ORIGEM,
    colunas_sha256: sha256Texto(COLUNAS_DA_LINHA.join(',')), campos_sha256: sha256Texto(NOMES_CAMPO_FATIA_F1.join('\n')),
    sql_sha256: sqlSha256(), tls_sha256: config.tlsSha256, sincronizado_em_max: sincronizadoEmMax,
  };
}

/** Nomes (nunca valores) dos parâmetros que mudaram. */
export const parametrosDiferentes = (atual: ParametrosColeta, anterior: Partial<ParametrosColeta>): string[] =>
  CHAVES_COMPARADAS.filter((k) => atual[k] !== anterior[k]);

export type UltimoSucesso = { marca: Date | null; parametros: Partial<ParametrosColeta> | null };

export async function ultimoSucesso(db: Consultavel, S: Esquemas): Promise<UltimoSucesso> {
  const p = await db.query<{ parametros: Partial<ParametrosColeta> | null }>(
    `SELECT parametros FROM ${S.ac}.ctl_coleta WHERE status = 'sucesso' ORDER BY coleta_id DESC LIMIT 1`);
  const m = await db.query<{ marca: Date | null }>(
    `SELECT max(marca_dagua_ate) AS marca FROM ${S.ac}.ctl_coleta WHERE tarefa = 'coleta_incremental' AND status = 'sucesso'`);
  return { marca: m.rows[0]?.marca ?? null, parametros: p.rows[0]?.parametros ?? null };
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
