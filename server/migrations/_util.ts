import { sql, type Kysely } from 'kysely';

/** Uma migração = listas de instruções SQL explícitas (MySQL não tem DDL transacional). */
export interface Ddl {
  up: string[];
  down: string[];
}

export async function executar(db: Kysely<unknown>, instrucoes: string[]): Promise<void> {
  for (const instrucao of instrucoes) await sql.raw(instrucao).execute(db);
}

export type Sistema = 'businessmap' | 'acelerato';
export const SCHEMA: Record<Sistema, string> = { businessmap: 'dspd_bm', acelerato: 'dspd_ac' };

const rastro = (t: string, sis: Sistema): string =>
  `sistema_origem VARCHAR(16) CHARACTER SET ascii NOT NULL DEFAULT '${sis}',
   CONSTRAINT ck_${t}_sis CHECK (sistema_origem = '${sis}')`;

export const ID = (c: string): string => `${c} VARCHAR(32) CHARACTER SET ascii NOT NULL`;

/**
 * Staging versionado: só INSERT; cadeia linear por UNIQUE (chave do item, anterior_sk).
 * anterior_sk = stg_sk da versão anterior do item (0 na primeira; NOT NULL porque UNIQUE aceita vários NULL).
 */
export function stgVersionada(
  sis: Sistema, tabela: string, chave: string[], extras: string[] = [], coletaFk = true,
): string {
  const s = SCHEMA[sis];
  const t = `${s}.${tabela}`;
  const cols = chave.join(', ');
  return `CREATE TABLE ${t} (
  stg_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ${chave.map(ID).join(',\n  ')},
  anterior_sk BIGINT UNSIGNED NOT NULL,
  payload_sha256 BINARY(32) NOT NULL,
  payload JSON NOT NULL,
  ${extras.map((e) => e + ',').join('\n  ')}
  ${rastro(tabela, sis)},
  coletado_em DATETIME(3) NOT NULL,
  coleta_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (stg_sk),
  UNIQUE KEY uq_${tabela}_cadeia (${cols}, anterior_sk),
  KEY ix_${tabela}_ultima (${cols}, stg_sk),
  KEY ix_${tabela}_coleta (coleta_id),
  KEY ix_${tabela}_coletado (coletado_em)${coletaFk ? `,
  CONSTRAINT fk_${tabela}_coleta FOREIGN KEY (coleta_id) REFERENCES ${s}.ctl_coleta (coleta_id)` : ''}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
}

/** Tabela imutável de rastro simples (staging não versionado, eventos). */
export function tabela(sis: Sistema, nome: string, corpo: string, comRastro = true): string {
  const s = SCHEMA[sis];
  return `CREATE TABLE ${s}.${nome} (
  ${corpo}${comRastro ? `,
  ${rastro(nome, sis)}` : ''}
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
}

export const drop = (...nomes: string[]): string[] => nomes.map((n) => `DROP TABLE IF EXISTS ${n}`);
export const dropView = (n: string): string => `DROP VIEW IF EXISTS ${n}`;
export const COLETA_FK = (s: string, t: string): string =>
  `CONSTRAINT fk_${t}_coleta FOREIGN KEY (coleta_id) REFERENCES ${s}.ctl_coleta (coleta_id)`;
export const DT = (c: string, nulo = false): string => `${c} DATETIME(3) ${nulo ? 'NULL' : 'NOT NULL'}`;
