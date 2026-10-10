import type { Kysely } from 'kysely';
import { executar, tabela, drop, dropView, COLETA_FK, DT, ID, type Ddl } from './_util.js';

const B = 'businessmap' as const;
const R = (t: string): string => `${DT('coletado_em')}, coleta_id BIGINT UNSIGNED NOT NULL,
  KEY ix_${t}_coleta (coleta_id), ${COLETA_FK('dspd_bm', t)}`;

export const ddl: Ddl = {
  up: [
    // Versão SCD2: a vigente é a de maior vigente_de por card; sem vigente_ate (sem índice parcial).
    tabela(B, 'dim_card_versao', `card_versao_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ${ID('card_id')}, ${DT('vigente_de')}, stg_card_sk BIGINT UNSIGNED NOT NULL,
  titulo VARCHAR(500) NULL, tipo VARCHAR(40) NULL, classe_servico VARCHAR(40) NULL,
  granularidade VARCHAR(20) NULL, equipe VARCHAR(60) NULL, quadro_id VARCHAR(32) CHARACTER SET ascii NULL,
  coluna_atual_id VARCHAR(32) CHARACTER SET ascii NULL, sistema VARCHAR(60) NULL,
  area_solicitante VARCHAR(60) NULL, fornecedor VARCHAR(60) NULL, objetivo_estrategico VARCHAR(60) NULL,
  card_pai VARCHAR(32) CHARACTER SET ascii NULL, eh_subtarefa TINYINT(1) NULL,
  data_acordada DATE NULL, responsabilidade_atraso VARCHAR(40) NULL, origem_demanda VARCHAR(40) NULL,
  fase_deteccao VARCHAR(40) NULL, severidade VARCHAR(20) NULL, causa_raiz VARCHAR(60) NULL,
  origem_bug VARCHAR(40) NULL, adicionado_apos_inicio_pai TINYINT(1) NULL,
  motivo_descarte VARCHAR(60) NULL, tamanho_declarado VARCHAR(20) NULL,
  ${R('dim_card_versao')},
  PRIMARY KEY (card_versao_sk),
  UNIQUE KEY uq_dim_card_versao (card_id, vigente_de),
  CONSTRAINT fk_dim_card_versao_stg FOREIGN KEY (stg_card_sk) REFERENCES dspd_bm.stg_card (stg_sk)`),
    tabela(B, 'evt_card', `evt_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ${ID('card_id')},
  tipo ENUM('criado','arquivado','desarquivado','excluido_detectado','restaurado') NOT NULL,
  ${DT('ocorrido_em')}, ${R('evt_card')},
  PRIMARY KEY (evt_sk), UNIQUE KEY uq_evt_card (card_id, tipo, ocorrido_em)`),
    tabela(B, 'fato_transicao', `transicao_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ${ID('card_id')}, quadro_id VARCHAR(32) CHARACTER SET ascii NULL,
  coluna_origem_id VARCHAR(32) CHARACTER SET ascii NULL, ${ID('coluna_destino_id')},
  tipo_coluna ENUM('fila','execucao') NULL, direcao ENUM('avanco','retorno') NULL,
  fonte ENUM('revision','webhook') NOT NULL, id_origem VARCHAR(64) CHARACTER SET ascii NOT NULL, ${DT('ocorrido_em')}, ${R('fato_transicao')},
  PRIMARY KEY (transicao_sk),
  UNIQUE KEY uq_fato_transicao (fonte, id_origem),
  KEY ix_fato_transicao_card (card_id, ocorrido_em), KEY ix_fato_transicao_ocorrido (ocorrido_em)`),
    tabela(B, 'rec_transicao_par', `par_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  transicao_webhook_sk BIGINT UNSIGNED NOT NULL, transicao_revision_sk BIGINT UNSIGNED NOT NULL,
  delta_ms INT NOT NULL, ${DT('casado_em')}, ${R('rec_transicao_par')},
  PRIMARY KEY (par_sk),
  UNIQUE KEY uq_rec_par_webhook (transicao_webhook_sk), UNIQUE KEY uq_rec_par_revision (transicao_revision_sk),
  CONSTRAINT fk_rec_par_webhook FOREIGN KEY (transicao_webhook_sk) REFERENCES dspd_bm.fato_transicao (transicao_sk),
  CONSTRAINT fk_rec_par_revision FOREIGN KEY (transicao_revision_sk) REFERENCES dspd_bm.fato_transicao (transicao_sk)`),
    tabela(B, 'evt_bloqueio', `evt_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ${ID('card_id')}, ${ID('id_origem')}, tipo ENUM('inicio','fim') NOT NULL,
  motivo_codigo VARCHAR(40) NULL, coluna_id VARCHAR(32) CHARACTER SET ascii NULL, fornecedor_codigo VARCHAR(40) NULL,
  ${DT('ocorrido_em')}, ${R('evt_bloqueio')},
  PRIMARY KEY (evt_sk), UNIQUE KEY uq_evt_bloqueio (card_id, id_origem, tipo)`),
    // Canônica: todas as revision + webhooks sem par (tolerância definida no casador, N-3).
    `CREATE VIEW dspd_bm.vw_transicao_canonica AS
  SELECT t.* FROM dspd_bm.fato_transicao t
  WHERE t.fonte = 'revision'
     OR NOT EXISTS (SELECT 1 FROM dspd_bm.rec_transicao_par p WHERE p.transicao_webhook_sk = t.transicao_sk)`,
  ],
  down: [dropView('dspd_bm.vw_transicao_canonica'),
    ...drop(...['rec_transicao_par', 'evt_bloqueio', 'fato_transicao', 'evt_card', 'dim_card_versao'].map((t) => `dspd_bm.${t}`))],
};
export const up = (db: Kysely<unknown>) => executar(db, ddl.up);
export const down = (db: Kysely<unknown>) => executar(db, ddl.down);
