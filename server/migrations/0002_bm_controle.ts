import type { Kysely } from 'kysely';
import { executar, tabela, drop, dropView, COLETA_FK, DT, type Ddl, type Sistema } from './_util.js';

const sis: Sistema = 'businessmap';
const s = 'dspd_bm';

export const ddl: Ddl = {
  up: [
    tabela(sis, 'ctl_coleta', `coleta_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tarefa ENUM('coleta_incremental','varredura','webhook','projecao','reconciliacao') NOT NULL,
  ${DT('iniciado_em')}, ${DT('finalizado_em', true)},
  status ENUM('em_andamento','sucesso','parcial','falha') NOT NULL,
  ${DT('marca_dagua_de', true)}, ${DT('marca_dagua_ate', true)},
  sobreposicao_s INT UNSIGNED NOT NULL DEFAULT 0,
  versao_coletor VARCHAR(40) NOT NULL,
  parametros JSON NULL,
  erro_resumo VARCHAR(500) NULL,
  PRIMARY KEY (coleta_id),
  KEY ix_ctl_coleta_tarefa (tarefa, status, finalizado_em)`, false),
    tabela(sis, 'ctl_coleta_contagem', `coleta_id BIGINT UNSIGNED NOT NULL,
  entidade VARCHAR(40) NOT NULL,
  lidos INT UNSIGNED NOT NULL DEFAULT 0, inseridos INT UNSIGNED NOT NULL DEFAULT 0,
  ja_existentes INT UNSIGNED NOT NULL DEFAULT 0, falhas INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (coleta_id, entidade),
  ${COLETA_FK(s, 'ctl_coleta_contagem')}`, false),
    tabela(sis, 'ctl_coleta_falha', `falha_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  coleta_id BIGINT UNSIGNED NOT NULL,
  entidade VARCHAR(40) NOT NULL,
  id_origem VARCHAR(64) CHARACTER SET ascii NULL,
  tentativas SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  erro VARCHAR(500) NOT NULL,
  PRIMARY KEY (falha_sk),
  KEY ix_ctl_coleta_falha_coleta (coleta_id),
  ${COLETA_FK(s, 'ctl_coleta_falha')}`, false),
    tabela(sis, 'ctl_reconciliacao', `dia DATE NOT NULL,
  entidade VARCHAR(40) NOT NULL,
  tipo VARCHAR(40) NOT NULL,
  contagem_ferramenta INT UNSIGNED NOT NULL,
  contagem_base INT UNSIGNED NOT NULL,
  divergencia_pct DECIMAL(7,4) NOT NULL,
  PRIMARY KEY (dia, entidade, tipo)`, false),
    `CREATE VIEW ${s}.vw_marca_dagua AS
  SELECT c.tarefa, n.entidade, MAX(c.marca_dagua_ate) AS marca_dagua_ate
  FROM ${s}.ctl_coleta c JOIN ${s}.ctl_coleta_contagem n ON n.coleta_id = c.coleta_id
  WHERE c.status = 'sucesso' GROUP BY c.tarefa, n.entidade`,
  ],
  down: [
    dropView(`${s}.vw_marca_dagua`),
    ...drop(`${s}.ctl_reconciliacao`, `${s}.ctl_coleta_falha`, `${s}.ctl_coleta_contagem`, `${s}.ctl_coleta`),
  ],
};
export const up = (db: Kysely<unknown>) => executar(db, ddl.up);
export const down = (db: Kysely<unknown>) => executar(db, ddl.down);
