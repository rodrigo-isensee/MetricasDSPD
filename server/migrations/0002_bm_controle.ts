import { migracao } from '../src/plataforma/db/executar.js';
import { COLETA_FK, DT, ENUM, IDENT, dropView, drop, indice, tabela, type Ddl, type Sistema } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

const sis: Sistema = 'businessmap';

export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      tabela(S, sis, 'ctl_coleta', `${IDENT('coleta_id')} PRIMARY KEY,
  ${ENUM('tarefa', ['coleta_incremental', 'varredura', 'webhook', 'projecao', 'reconciliacao'])},
  ${DT('iniciado_em')}, ${DT('finalizado_em', true)},
  ${ENUM('status', ['em_andamento', 'sucesso', 'parcial', 'falha'])},
  ${DT('marca_dagua_de', true)}, ${DT('marca_dagua_ate', true)},
  sobreposicao_s integer NOT NULL DEFAULT 0 CHECK (sobreposicao_s >= 0),
  versao_coletor varchar(40) NOT NULL,
  parametros jsonb NULL,
  erro_resumo varchar(500) NULL`, false),
      indice(s, 'ix_ctl_coleta_tarefa', 'ctl_coleta', 'tarefa, status, finalizado_em'),
      tabela(S, sis, 'ctl_coleta_contagem', `coleta_id bigint NOT NULL,
  entidade varchar(40) NOT NULL,
  lidos integer NOT NULL DEFAULT 0 CHECK (lidos >= 0), inseridos integer NOT NULL DEFAULT 0 CHECK (inseridos >= 0),
  ja_existentes integer NOT NULL DEFAULT 0 CHECK (ja_existentes >= 0), falhas integer NOT NULL DEFAULT 0 CHECK (falhas >= 0),
  PRIMARY KEY (coleta_id, entidade),
  ${COLETA_FK(s, 'ctl_coleta_contagem')}`, false),
      tabela(S, sis, 'ctl_coleta_falha', `${IDENT('falha_sk')} PRIMARY KEY,
  coleta_id bigint NOT NULL,
  entidade varchar(40) NOT NULL,
  id_origem varchar(64) NULL CHECK (id_origem ~ '^[\\x21-\\x7E]+$'),
  tentativas smallint NOT NULL DEFAULT 1 CHECK (tentativas >= 0),
  erro varchar(500) NOT NULL,
  ${COLETA_FK(s, 'ctl_coleta_falha')}`, false),
      indice(s, 'ix_ctl_coleta_falha_coleta', 'ctl_coleta_falha', 'coleta_id'),
      tabela(S, sis, 'ctl_reconciliacao', `dia date NOT NULL,
  entidade varchar(40) NOT NULL,
  tipo varchar(40) NOT NULL,
  contagem_ferramenta integer NOT NULL CHECK (contagem_ferramenta >= 0),
  contagem_base integer NOT NULL CHECK (contagem_base >= 0),
  divergencia_pct numeric(7,4) NOT NULL,
  PRIMARY KEY (dia, entidade, tipo)`, false),
      `CREATE VIEW ${s}.vw_marca_dagua WITH (security_invoker = true) AS
  SELECT c.tarefa, n.entidade, max(c.marca_dagua_ate) AS marca_dagua_ate
  FROM ${s}.ctl_coleta c JOIN ${s}.ctl_coleta_contagem n ON n.coleta_id = c.coleta_id
  WHERE c.status = 'sucesso' GROUP BY c.tarefa, n.entidade`,
    ],
    down: [
      dropView(`${s}.vw_marca_dagua`),
      ...drop(`${s}.ctl_reconciliacao`, `${s}.ctl_coleta_falha`, `${s}.ctl_coleta_contagem`, `${s}.ctl_coleta`),
    ],
  };
};
export const { up, down } = migracao(ddl);
