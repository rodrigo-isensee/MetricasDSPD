import type { Kysely } from 'kysely';
import { executar, tabela, drop, DT, ID, type Ddl } from './_util.js';

const B = 'businessmap' as const;
// Projeções: sem FK física de/para evento, versão ou staging (reconstruíveis por RENAME TABLE, ver data-model §2).
const PROJ = `${DT('coletado_em')}, atualizado_por_coleta_id BIGINT UNSIGNED NOT NULL`;

export const ddl: Ddl = {
  up: [
    tabela(B, 'dim_card', `${ID('card_id')},
  tipo VARCHAR(40) NULL, classe_servico VARCHAR(40) NULL, sistema VARCHAR(60) NULL,
  area_solicitante VARCHAR(60) NULL, fornecedor VARCHAR(60) NULL, objetivo_estrategico VARCHAR(60) NULL,
  card_pai VARCHAR(32) CHARACTER SET ascii NULL,
  ${DT('criado_em', true)}, ${DT('comprometido_em', true)}, ${DT('iniciado_em', true)}, ${DT('concluido_em', true)},
  ${DT('arquivado_em', true)}, motivo_descarte VARCHAR(60) NULL, tamanho_declarado VARCHAR(20) NULL,
  titulo VARCHAR(500) NULL, granularidade VARCHAR(20) NULL, equipe VARCHAR(60) NULL,
  quadro_id VARCHAR(32) CHARACTER SET ascii NULL, coluna_atual_id VARCHAR(32) CHARACTER SET ascii NULL,
  ${DT('excluido_em', true)}, eh_subtarefa TINYINT(1) NULL, data_acordada DATE NULL,
  responsabilidade_atraso VARCHAR(40) NULL, origem_demanda VARCHAR(40) NULL, fase_deteccao VARCHAR(40) NULL,
  severidade VARCHAR(20) NULL, causa_raiz VARCHAR(60) NULL, origem_bug VARCHAR(40) NULL,
  adicionado_apos_inicio_pai TINYINT(1) NULL,
  ${PROJ},
  PRIMARY KEY (card_id),
  KEY ix_dim_card_equipe (equipe, granularidade, tipo, concluido_em),
  KEY ix_dim_card_sistema (granularidade, sistema, concluido_em),
  KEY ix_dim_card_abertos (concluido_em, iniciado_em),
  KEY ix_dim_card_criado (criado_em),
  KEY ix_dim_card_pai (card_pai)`),
    tabela(B, 'fato_bloqueio', `bloqueio_sk BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ${ID('card_id')}, ${ID('id_origem')}, motivo VARCHAR(60) NULL, coluna_em_que_bloqueou VARCHAR(32) CHARACTER SET ascii NULL,
  fornecedor VARCHAR(60) NULL, ${DT('inicio')}, ${DT('fim', true)},
  duracao_horas_uteis DECIMAL(10,2) NULL, ${PROJ},
  PRIMARY KEY (bloqueio_sk), UNIQUE KEY uq_fato_bloqueio (card_id, id_origem),
  KEY ix_fato_bloqueio_card (card_id, inicio), KEY ix_fato_bloqueio_periodo (inicio, fim)`),
  ],
  down: drop('dspd_bm.fato_bloqueio', 'dspd_bm.dim_card'),
};
export const up = (db: Kysely<unknown>) => executar(db, ddl.up);
export const down = (db: Kysely<unknown>) => executar(db, ddl.down);
