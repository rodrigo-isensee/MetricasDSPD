import type { Esquemas } from './esquemas.js';

/** Uma migração = listas de instruções SQL explícitas (pgm.sql executa cada uma; DDL é transacional no Postgres). */
export interface Ddl {
  up: string[];
  down: string[];
}
export type Sistema = 'businessmap' | 'acelerato';
export const schemaDe = (S: Esquemas, sis: Sistema): string => (sis === 'businessmap' ? S.bm : S.ac);

/** Tipo de toda coluna que guarda código de `ref_dominio.codigo` (data-model §2; teste estático compara). */
export const COD = 'varchar(80)';

/** Chave natural da origem: ASCII visível, até 32 caracteres (prov., confirmar no T2.1). */
export const ID = (c: string, nulo = false): string =>
  `${c} varchar(32) ${nulo ? 'NULL' : 'NOT NULL'} CHECK (${c} ~ '^[\\x21-\\x7E]+$')`;
export const DT = (c: string, nulo = false): string => `${c} timestamptz(3) ${nulo ? 'NULL' : 'NOT NULL'}`;
export const HASH = `payload_sha256 bytea NOT NULL CHECK (octet_length(payload_sha256) = 32)`;
export const IDENT = (c: string): string => `${c} bigint GENERATED ALWAYS AS IDENTITY`;
export const lista = (valores: readonly string[]): string => valores.map((v) => `'${v}'`).join(',');
export const ENUM = (c: string, valores: readonly string[], nulo = false): string =>
  `${c} text ${nulo ? 'NULL' : 'NOT NULL'} CHECK (${c} IN (${lista(valores)}))`;

const rastro = (t: string, sis: Sistema): string =>
  `sistema_origem text NOT NULL DEFAULT '${sis}',
  CONSTRAINT ck_${t}_sis CHECK (sistema_origem = '${sis}')`;

export const COLETA_FK = (s: string, t: string): string =>
  `CONSTRAINT fk_${t}_coleta FOREIGN KEY (coleta_id) REFERENCES ${s}.ctl_coleta (coleta_id)`;

/** Tabela com rastro de origem (staging não versionado, eventos, projeções, controle). */
export function tabela(S: Esquemas, sis: Sistema, nome: string, corpo: string, comRastro = true): string {
  return `CREATE TABLE ${schemaDe(S, sis)}.${nome} (
  ${corpo}${comRastro ? `,
  ${rastro(nome, sis)}` : ''}
)`;
}

/** Tabela de referência/controle sem rastro de origem. */
export const tabelaPlana = (schema: string, nome: string, corpo: string): string =>
  `CREATE TABLE ${schema}.${nome} (\n  ${corpo}\n)`;

export const indice = (schema: string, nome: string, tabelaNome: string, colunas: string, onde?: string, unico = false): string =>
  `CREATE ${unico ? 'UNIQUE ' : ''}INDEX ${nome} ON ${schema}.${tabelaNome} (${colunas})${onde ? ` WHERE ${onde}` : ''}`;

/** Gatilhos de imutabilidade (data-model §1): UPDATE/DELETE por linha e TRUNCATE por instrução, para qualquer papel. */
export const appendOnly = (S: Esquemas, schema: string, t: string): string[] => [
  `CREATE TRIGGER tg_${t}_imutavel BEFORE UPDATE OR DELETE ON ${schema}.${t} FOR EACH ROW EXECUTE FUNCTION ${S.core}.proibir_alteracao()`,
  `CREATE TRIGGER tg_${t}_sem_truncate BEFORE TRUNCATE ON ${schema}.${t} FOR EACH STATEMENT EXECUTE FUNCTION ${S.core}.proibir_alteracao()`,
];

/**
 * Staging versionado: só INSERT; cadeia linear por UNIQUE NULLS NOT DISTINCT (chave do item, anterior_sk).
 * anterior_sk = stg_sk da versão anterior do item (NULL na primeira). Constraint nomeada uq_<tabela> para ON CONFLICT.
 */
export function stgVersionada(
  S: Esquemas, sis: Sistema, nome: string, chave: string[], extras: string[] = [],
): string[] {
  const s = schemaDe(S, sis);
  const cols = chave.join(', ');
  return [
    `CREATE TABLE ${s}.${nome} (
  ${IDENT('stg_sk')} PRIMARY KEY,
  ${chave.map((c) => ID(c)).join(',\n  ')},
  anterior_sk bigint NULL,
  ${HASH},
  payload jsonb NOT NULL,
  ${extras.map((e) => e + ',').join('\n  ')}
  ${rastro(nome, sis)},
  coletado_em timestamptz(3) NOT NULL,
  coleta_id bigint NOT NULL,
  CONSTRAINT uq_${nome} UNIQUE NULLS NOT DISTINCT (${cols}, anterior_sk),
  ${COLETA_FK(s, nome)}
)`,
    indice(s, `ix_${nome}_ultima`, nome, `${cols}, stg_sk DESC`),
    indice(s, `ix_${nome}_coleta`, nome, 'coleta_id'),
    indice(s, `ix_${nome}_coletado`, nome, 'coletado_em'),
    ...appendOnly(S, s, nome),
  ];
}

/** Vigência de referência: a vigente é única por chave (índice parcial). */
export const VIG = 'vigente_de date NOT NULL, vigente_ate date NULL';
export const refVigencia = (schema: string, nome: string, corpo: string, chave: string): string[] => [
  tabelaPlana(schema, nome, corpo),
  indice(schema, `uq_${nome}_vigente`, nome, chave, 'vigente_ate IS NULL', true),
];

export const drop = (...nomes: string[]): string[] => nomes.map((n) => `DROP TABLE IF EXISTS ${n}`);
export const dropView = (n: string): string => `DROP VIEW IF EXISTS ${n}`;

/**
 * Atributos de `Chamado` (packages/metricas) que vivem em `dim_chamado` e `dim_chamado_versao`, fora `justificativa_ajuste`
 * (texto livre, só no staging, data-model §9). Fonte única: tabela, versão e views usam esta lista; teste de paridade com a biblioteca.
 */
export const ATRIBUTOS_CHAMADO: readonly (readonly [nome: string, definicao: string])[] = [
  ['natureza', `natureza ${COD} NULL`],
  ['equipe', `equipe ${COD} NULL`],
  ['organizacao', `organizacao ${COD} NULL`],
  ['tipo', `tipo ${COD} NULL`],
  ['categoria_sistema', `categoria_sistema ${COD} NULL`],
  ['excluido', 'excluido boolean NOT NULL DEFAULT false'],
  ['status', `status ${COD} NULL`],
  ['impacto', `impacto ${COD} NULL`],
  ['urgencia', `urgencia ${COD} NULL`],
  ['prioridade', `prioridade ${COD} NULL`],
  ['prioridade_ajustada_manualmente', 'prioridade_ajustada_manualmente boolean NOT NULL DEFAULT false'],
  ['aberto_em', 'aberto_em timestamptz(3) NULL'],
  ['primeiro_atendimento_em', 'primeiro_atendimento_em timestamptz(3) NULL'],
  ['restaurado_em', 'restaurado_em timestamptz(3) NULL'],
  ['data_finalizado', 'data_finalizado timestamptz(3) NULL'],
  // Briefing 3.2: só estes dois valores; NULL só em aberto (C2).
  ['status_sla_r', `status_sla_r varchar(32) NULL CHECK (status_sla_r IN ('REALIZADO_NO_PRAZO','REALIZADO_APOS_VENCIMENTO'))`],
  // Nome e valores hipotéticos (P5): sem CHECK até a confirmação.
  ['status_sla_pa', 'status_sla_pa varchar(32) NULL'],
  ['motivo_escalacao', `motivo_escalacao ${COD} NULL`],
  ['motivo_pendencia_atual', `motivo_pendencia_atual ${COD} NULL`],
  ['previsao_retorno', 'previsao_retorno timestamptz(3) NULL'],
  ['motivo_encerramento', `motivo_encerramento ${COD} NULL`],
  ['avaliacao_problema', `avaliacao_problema ${COD} NULL`],
  ['excecao_sla_registro_posterior', 'excecao_sla_registro_posterior boolean NOT NULL DEFAULT false'],
  ['incidente_critico_coordenado', 'incidente_critico_coordenado boolean NOT NULL DEFAULT false'],
  ['nivel_resolucao', `nivel_resolucao ${COD} NULL`],
  ['etapa', `etapa ${COD} NULL`],
];
