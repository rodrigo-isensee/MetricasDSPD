import { migracao } from '../src/plataforma/db/executar.js';
import { COD, DT, ID, IDENT, drop, indice, tabela, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

const B = 'businessmap' as const;
// Projeções: sem FK física de/para evento, versão ou staging (refeitas por DELETE + INSERT em transação, data-model §1-§2).
const PROJ = `${DT('coletado_em')}, atualizado_por_coleta_id bigint NOT NULL`;

export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      tabela(S, B, 'dim_card', `${ID('card_id')} PRIMARY KEY,
  tipo ${COD} NULL, classe_servico ${COD} NULL, sistema ${COD} NULL,
  area_solicitante ${COD} NULL, fornecedor ${COD} NULL, objetivo_estrategico ${COD} NULL,
  ${ID('card_pai', true)},
  ${DT('criado_em', true)}, ${DT('comprometido_em', true)}, ${DT('iniciado_em', true)}, ${DT('concluido_em', true)},
  ${DT('arquivado_em', true)}, motivo_descarte ${COD} NULL, tamanho_declarado ${COD} NULL,
  responsaveis text[] NOT NULL DEFAULT '{}',
  titulo varchar(500) NULL, granularidade varchar(20) NULL, equipe varchar(60) NULL,
  ${ID('quadro_id', true)}, ${ID('coluna_atual_id', true)},
  ${DT('excluido_em', true)}, eh_subtarefa boolean NULL, data_acordada date NULL,
  responsabilidade_atraso ${COD} NULL, origem_demanda ${COD} NULL, fase_deteccao ${COD} NULL,
  severidade ${COD} NULL, causa_raiz ${COD} NULL, origem_bug varchar(40) NULL,
  adicionado_apos_inicio_pai boolean NULL,
  ${PROJ}`),
      indice(s, 'ix_dim_card_equipe', 'dim_card', 'equipe, granularidade, tipo, concluido_em'),
      indice(s, 'ix_dim_card_sistema', 'dim_card', 'granularidade, sistema, concluido_em'),
      indice(s, 'ix_dim_card_abertos', 'dim_card', 'iniciado_em', 'concluido_em IS NULL'),
      indice(s, 'ix_dim_card_criado', 'dim_card', 'criado_em'),
      indice(s, 'ix_dim_card_pai', 'dim_card', 'card_pai'),
      tabela(S, B, 'fato_bloqueio', `${IDENT('bloqueio_sk')} PRIMARY KEY,
  ${ID('card_id')}, ${ID('id_origem')}, motivo ${COD} NULL, ${ID('coluna_em_que_bloqueou', true)},
  fornecedor ${COD} NULL, ${DT('inicio')}, ${DT('fim', true)},
  duracao_horas_uteis numeric(12,2) NULL, ${PROJ},
  CONSTRAINT uq_fato_bloqueio UNIQUE (card_id, id_origem)`),
      indice(s, 'ix_fato_bloqueio_card', 'fato_bloqueio', 'card_id, inicio'),
      indice(s, 'ix_fato_bloqueio_abertos', 'fato_bloqueio', 'inicio', 'fim IS NULL'),
    ],
    down: drop(`${s}.fato_bloqueio`, `${s}.dim_card`),
  };
};
export const { up, down } = migracao(ddl);
