import type { Kysely } from 'kysely';
import { executar, drop, type Ddl } from './_util.js';

const T = (n: string, corpo: string): string =>
  `CREATE TABLE dspd_core.${n} (\n  ${corpo}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;

export const ddl: Ddl = {
  up: [
    T('ref_versao_criterio', `versao_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  vigente_desde DATE NOT NULL, dominio ENUM('businessmap','acelerato') NOT NULL,
  descricao VARCHAR(300) NOT NULL, motivo VARCHAR(500) NOT NULL, referencia VARCHAR(200) NOT NULL,
  registrado_em DATETIME(3) NOT NULL, PRIMARY KEY (versao_id), KEY ix_ref_versao_criterio_dom (dominio, vigente_desde)`),
    T('ref_versao_criterio_metrica', `versao_id BIGINT UNSIGNED NOT NULL, metrica_id VARCHAR(40) NOT NULL,
  PRIMARY KEY (versao_id, metrica_id),
  CONSTRAINT fk_ref_vcm_versao FOREIGN KEY (versao_id) REFERENCES dspd_core.ref_versao_criterio (versao_id)`),
    T('ref_calendario', `calendario_id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT, nome VARCHAR(80) NOT NULL,
  offset_minutos SMALLINT NOT NULL, descricao VARCHAR(300) NULL, PRIMARY KEY (calendario_id), UNIQUE KEY uq_ref_calendario_nome (nome)`),
    T('ref_calendario_turno', `calendario_id SMALLINT UNSIGNED NOT NULL, dia_semana TINYINT UNSIGNED NOT NULL,
  inicio_min SMALLINT UNSIGNED NOT NULL, vigente_de DATE NOT NULL, fim_min SMALLINT UNSIGNED NOT NULL, vigente_ate DATE NULL,
  PRIMARY KEY (calendario_id, dia_semana, inicio_min, vigente_de),
  CONSTRAINT ck_turno_dia CHECK (dia_semana BETWEEN 0 AND 6), CONSTRAINT ck_turno_fim CHECK (fim_min > inicio_min),
  CONSTRAINT fk_turno_calendario FOREIGN KEY (calendario_id) REFERENCES dspd_core.ref_calendario (calendario_id)`),
    T('ref_feriado', `calendario_id SMALLINT UNSIGNED NOT NULL, data DATE NOT NULL,
  escopo ENUM('nacional','estadual','municipal','ponto_facultativo') NOT NULL, descricao VARCHAR(200) NOT NULL,
  incluido_por_versao_id BIGINT UNSIGNED NOT NULL, PRIMARY KEY (calendario_id, data),
  CONSTRAINT fk_feriado_calendario FOREIGN KEY (calendario_id) REFERENCES dspd_core.ref_calendario (calendario_id),
  CONSTRAINT fk_feriado_versao FOREIGN KEY (incluido_por_versao_id) REFERENCES dspd_core.ref_versao_criterio (versao_id)`),
    T('ref_calendario_aplicacao', `dominio ENUM('businessmap','acelerato') NOT NULL, classe VARCHAR(60) NOT NULL,
  vigente_de DATE NOT NULL, calendario_id SMALLINT UNSIGNED NOT NULL, vigente_ate DATE NULL,
  PRIMARY KEY (dominio, classe, vigente_de),
  CONSTRAINT fk_cal_aplic_calendario FOREIGN KEY (calendario_id) REFERENCES dspd_core.ref_calendario (calendario_id)`),
  ],
  down: drop(...['ref_calendario_aplicacao', 'ref_feriado', 'ref_calendario_turno', 'ref_calendario',
    'ref_versao_criterio_metrica', 'ref_versao_criterio'].map((t) => `dspd_core.${t}`)),
};
export const up = (db: Kysely<unknown>) => executar(db, ddl.up);
export const down = (db: Kysely<unknown>) => executar(db, ddl.down);
