import type { Kysely } from 'kysely';
import { executar, stgVersionada, tabela, drop, COLETA_FK, DT, ID, type Ddl } from './_util.js';

const A = 'acelerato' as const;
const R = (t: string): string => `${DT('coletado_em')}, coleta_id BIGINT UNSIGNED NOT NULL,
  KEY ix_${t}_coleta (coleta_id), ${COLETA_FK('dspd_ac', t)}`;

export const ddl: Ddl = {
  up: [
    stgVersionada(A, 'stg_chamado', ['id_origem']),
    stgVersionada(A, 'stg_etapa', ['chamado_id', 'id_origem']),
    tabela(A, 'dim_chamado_versao', `chamado_versao_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ${ID('chamado_id')}, ${DT('vigente_de')}, stg_chamado_sk BIGINT UNSIGNED NOT NULL,
  natureza VARCHAR(30) NULL, equipe VARCHAR(60) NULL, prioridade VARCHAR(10) NULL, urgencia VARCHAR(20) NULL,
  impacto VARCHAR(20) NULL, status VARCHAR(40) NULL, etapa VARCHAR(80) NULL,
  ${DT('aberto_em', true)}, ${DT('data_finalizado', true)}, status_sla_r VARCHAR(20) NULL,
  motivo_escalacao VARCHAR(80) NULL, motivo_encerramento VARCHAR(80) NULL, avaliacao_problema VARCHAR(40) NULL,
  excluido TINYINT(1) NOT NULL DEFAULT 0,
  ${R('dim_chamado_versao')},
  PRIMARY KEY (chamado_versao_sk), UNIQUE KEY uq_dim_chamado_versao (chamado_id, vigente_de),
  KEY ix_dim_chamado_versao_vigente (chamado_id, vigente_de DESC),
  CONSTRAINT fk_dim_chamado_versao_stg FOREIGN KEY (stg_chamado_sk) REFERENCES dspd_ac.stg_chamado (stg_sk)`),
    tabela(A, 'evt_etapa_chamado', `evt_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ${ID('chamado_id')}, etapa VARCHAR(80) NOT NULL, ${DT('entrada_em')}, motivo_pendencia VARCHAR(80) NULL,
  ${R('evt_etapa_chamado')},
  PRIMARY KEY (evt_sk), UNIQUE KEY uq_evt_etapa_chamado (chamado_id, etapa, entrada_em)`),
  ],
  down: drop('dspd_ac.evt_etapa_chamado', 'dspd_ac.dim_chamado_versao', 'dspd_ac.stg_etapa', 'dspd_ac.stg_chamado'),
};
export const up = (db: Kysely<unknown>) => executar(db, ddl.up);
export const down = (db: Kysely<unknown>) => executar(db, ddl.down);
