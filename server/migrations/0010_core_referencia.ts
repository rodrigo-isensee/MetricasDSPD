import { migracao } from '../src/plataforma/db/executar.js';
import { DT, ENUM, IDENT, drop, indice, tabelaPlana, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

const DOMINIOS = ['businessmap', 'acelerato'] as const;

export const ddl = (S: Esquemas): Ddl => {
  const s = S.core;
  return {
    up: [
      tabelaPlana(s, 'ref_versao_criterio', `${IDENT('versao_id')} PRIMARY KEY,
  vigente_desde date NOT NULL, ${ENUM('dominio', DOMINIOS)},
  descricao varchar(300) NOT NULL, motivo varchar(500) NOT NULL, referencia varchar(200) NOT NULL,
  ${DT('registrado_em')}`),
      indice(s, 'ix_ref_versao_criterio_dom', 'ref_versao_criterio', 'dominio, vigente_desde'),
      tabelaPlana(s, 'ref_versao_criterio_metrica', `versao_id bigint NOT NULL, metrica_id varchar(40) NOT NULL,
  PRIMARY KEY (versao_id, metrica_id),
  CONSTRAINT fk_ref_vcm_versao FOREIGN KEY (versao_id) REFERENCES ${s}.ref_versao_criterio (versao_id)`),
      tabelaPlana(s, 'ref_calendario', `calendario_id smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, nome varchar(80) NOT NULL,
  offset_minutos smallint NOT NULL, descricao varchar(300) NULL, CONSTRAINT uq_ref_calendario_nome UNIQUE (nome)`),
      tabelaPlana(s, 'ref_calendario_turno', `calendario_id smallint NOT NULL, dia_semana smallint NOT NULL,
  inicio_min smallint NOT NULL, vigente_de date NOT NULL, fim_min smallint NOT NULL, vigente_ate date NULL,
  PRIMARY KEY (calendario_id, dia_semana, inicio_min, vigente_de),
  CONSTRAINT ck_turno_dia CHECK (dia_semana BETWEEN 0 AND 6), CONSTRAINT ck_turno_inicio CHECK (inicio_min >= 0),
  CONSTRAINT ck_turno_fim CHECK (fim_min > inicio_min),
  CONSTRAINT fk_turno_calendario FOREIGN KEY (calendario_id) REFERENCES ${s}.ref_calendario (calendario_id)`),
      indice(s, 'uq_ref_calendario_turno_vigente', 'ref_calendario_turno', 'calendario_id, dia_semana, inicio_min', 'vigente_ate IS NULL', true),
      tabelaPlana(s, 'ref_feriado', `calendario_id smallint NOT NULL, data date NOT NULL,
  ${ENUM('escopo', ['nacional', 'estadual', 'municipal', 'ponto_facultativo'])}, descricao varchar(200) NOT NULL,
  incluido_por_versao_id bigint NOT NULL, PRIMARY KEY (calendario_id, data),
  CONSTRAINT fk_feriado_calendario FOREIGN KEY (calendario_id) REFERENCES ${s}.ref_calendario (calendario_id),
  CONSTRAINT fk_feriado_versao FOREIGN KEY (incluido_por_versao_id) REFERENCES ${s}.ref_versao_criterio (versao_id)`),
      tabelaPlana(s, 'ref_calendario_aplicacao', `${ENUM('dominio', DOMINIOS)}, classe varchar(60) NOT NULL,
  vigente_de date NOT NULL, calendario_id smallint NOT NULL, vigente_ate date NULL,
  PRIMARY KEY (dominio, classe, vigente_de),
  CONSTRAINT fk_cal_aplic_calendario FOREIGN KEY (calendario_id) REFERENCES ${s}.ref_calendario (calendario_id)`),
      indice(s, 'uq_ref_calendario_aplicacao_vigente', 'ref_calendario_aplicacao', 'dominio, classe', 'vigente_ate IS NULL', true),
    ],
    down: drop(...['ref_calendario_aplicacao', 'ref_feriado', 'ref_calendario_turno', 'ref_calendario',
      'ref_versao_criterio_metrica', 'ref_versao_criterio'].map((t) => `${s}.${t}`)),
  };
};
export const { up, down } = migracao(ddl);
