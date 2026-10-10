import type { Kysely } from 'kysely';
import { executar, tabela, drop, dropView, COLETA_FK, DT, ID, type Ddl } from './_util.js';

const A = 'acelerato' as const;
const VIG = `vigente_de DATE NOT NULL, vigente_ate DATE NULL`;
const REF = (n: string, corpo: string): string =>
  `CREATE TABLE dspd_ac.${n} (\n  ${corpo}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`;
const PROJ = `${DT('coletado_em')}, atualizado_por_coleta_id BIGINT UNSIGNED NOT NULL`;

export const ddl: Ddl = {
  up: [
    tabela(A, 'dim_chamado', `${ID('chamado_id')}, natureza VARCHAR(30) NULL, equipe VARCHAR(60) NULL,
  organizacao VARCHAR(80) NULL, tipo VARCHAR(80) NULL,
  prioridade VARCHAR(10) NULL, urgencia VARCHAR(20) NULL, impacto VARCHAR(20) NULL, status VARCHAR(40) NULL,
  etapa VARCHAR(80) NULL, ${DT('aberto_em', true)}, ${DT('data_finalizado', true)}, status_sla_r VARCHAR(20) NULL,
  motivo_escalacao VARCHAR(80) NULL, motivo_encerramento VARCHAR(80) NULL, avaliacao_problema VARCHAR(40) NULL,
  excluido TINYINT(1) NOT NULL DEFAULT 0, ${PROJ},
  PRIMARY KEY (chamado_id),
  KEY ix_dim_chamado_equipe (equipe, prioridade, data_finalizado),
  KEY ix_dim_chamado_abertos (data_finalizado, aberto_em)`),
    tabela(A, 'fato_etapa_chamado', `${ID('chamado_id')}, etapa VARCHAR(80) NOT NULL, ${DT('entrada')}, ${DT('saida', true)},
  motivo_pendencia VARCHAR(80) NULL, totalizador VARCHAR(40) NULL, ${PROJ},
  PRIMARY KEY (chamado_id, etapa, entrada), KEY ix_fato_etapa_etapa (etapa, entrada)`),
    REF('ref_etapa_totalizador', `natureza VARCHAR(30) NOT NULL, etapa_origem VARCHAR(80) NOT NULL, ${VIG},
  totalizador VARCHAR(40) NOT NULL, PRIMARY KEY (natureza, etapa_origem, vigente_de)`),
    REF('ref_dominio', `campo VARCHAR(40) NOT NULL, codigo VARCHAR(80) NOT NULL, ${VIG},
  rotulo VARCHAR(120) NOT NULL, ordem SMALLINT UNSIGNED NOT NULL, PRIMARY KEY (campo, codigo, vigente_de)`),
    REF('ref_alvo_prioridade', `prioridade VARCHAR(10) NOT NULL, ${VIG},
  prazo_horas_uteis DECIMAL(8,2) NOT NULL, PRIMARY KEY (prioridade, vigente_de)`),
    // Ações da automação: append-only; resultado conhecido depois = nova tentativa.
    tabela(A, 'ctl_automacao', `automacao_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ${ID('chamado_id')}, regra VARCHAR(60) NOT NULL, ${DT('momento_gatilho')}, tentativa SMALLINT UNSIGNED NOT NULL,
  acao VARCHAR(80) NOT NULL, modo ENUM('simulacao','ativo') NOT NULL, resultado VARCHAR(200) NULL,
  registrado_no_chamado TINYINT(1) NOT NULL DEFAULT 0, ${DT('coletado_em')}, coleta_id BIGINT UNSIGNED NULL,
  PRIMARY KEY (automacao_sk), UNIQUE KEY uq_ctl_automacao (chamado_id, regra, momento_gatilho, tentativa),
  ${COLETA_FK('dspd_ac', 'ctl_automacao')}`),
    // Recorte do DSPD-SSSC sobre a nossa cópia; valores vêm de ref_dominio, não fixos (T5.1).
    `CREATE VIEW dspd_ac.vw_populacao_sssc AS
  SELECT c.* FROM dspd_ac.dim_chamado c
  WHERE c.excluido = 0
    AND c.organizacao IN (SELECT codigo FROM dspd_ac.ref_dominio WHERE campo = 'organizacao_recorte' AND vigente_ate IS NULL)
    AND c.tipo IN (SELECT codigo FROM dspd_ac.ref_dominio WHERE campo = 'tipo_recorte' AND vigente_ate IS NULL)
    AND c.equipe IN (SELECT codigo FROM dspd_ac.ref_dominio WHERE campo = 'equipe' AND vigente_ate IS NULL)`,
    `CREATE VIEW dspd_ac.vw_fechados_sla AS
  SELECT p.*, (p.status_sla_r = 'dentro') AS dentro_sla FROM dspd_ac.vw_populacao_sssc p
  WHERE p.status = 'Concluído' AND p.data_finalizado IS NOT NULL`,
    `CREATE VIEW dspd_ac.vw_abertos AS
  SELECT p.* FROM dspd_ac.vw_populacao_sssc p WHERE p.data_finalizado IS NULL`,
  ],
  down: [dropView('dspd_ac.vw_abertos'), dropView('dspd_ac.vw_fechados_sla'), dropView('dspd_ac.vw_populacao_sssc'),
    ...drop(...['ctl_automacao', 'ref_alvo_prioridade', 'ref_dominio', 'ref_etapa_totalizador', 'fato_etapa_chamado',
      'dim_chamado'].map((t) => `dspd_ac.${t}`))],
};
export const up = (db: Kysely<unknown>) => executar(db, ddl.up);
export const down = (db: Kysely<unknown>) => executar(db, ddl.down);
