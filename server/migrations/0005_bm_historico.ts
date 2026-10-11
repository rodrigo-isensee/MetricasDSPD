import { migracao } from '../src/plataforma/db/executar.js';
import {
  COD, COLETA_FK, DT, ENUM, ID, IDENT, appendOnly, drop, dropView, indice, tabela, type Ddl,
} from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

const B = 'businessmap' as const;

export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  const R = (t: string): string => `${DT('coletado_em')}, coleta_id bigint NOT NULL,
  ${COLETA_FK(s, t)}`;
  const tabelas: [string, string][] = [
    // Versão SCD2: a vigente é a de maior vigente_de por card; sem vigente_ate. `responsaveis` só para dspd_coletor (data-model §9).
    ['dim_card_versao', `${IDENT('card_versao_sk')} PRIMARY KEY,
  ${ID('card_id')}, ${DT('vigente_de')}, stg_card_sk bigint NOT NULL,
  titulo varchar(500) NULL, tipo ${COD} NULL, classe_servico ${COD} NULL,
  granularidade varchar(20) NULL, equipe varchar(60) NULL, ${ID('quadro_id', true)},
  ${ID('coluna_atual_id', true)}, sistema ${COD} NULL,
  area_solicitante ${COD} NULL, fornecedor ${COD} NULL, objetivo_estrategico ${COD} NULL,
  ${ID('card_pai', true)}, eh_subtarefa boolean NULL,
  data_acordada date NULL, responsabilidade_atraso ${COD} NULL, origem_demanda ${COD} NULL,
  fase_deteccao ${COD} NULL, severidade ${COD} NULL, causa_raiz ${COD} NULL,
  origem_bug varchar(40) NULL, adicionado_apos_inicio_pai boolean NULL,
  motivo_descarte ${COD} NULL, tamanho_declarado ${COD} NULL,
  responsaveis text[] NOT NULL DEFAULT '{}',
  ${R('dim_card_versao')},
  CONSTRAINT uq_dim_card_versao UNIQUE (card_id, vigente_de),
  CONSTRAINT fk_dim_card_versao_stg FOREIGN KEY (stg_card_sk) REFERENCES ${s}.stg_card (stg_sk)`],
    ['evt_card', `${IDENT('evt_sk')} PRIMARY KEY,
  ${ID('card_id')},
  ${ENUM('tipo', ['criado', 'arquivado', 'desarquivado', 'excluido_detectado', 'restaurado'])},
  ${DT('ocorrido_em')}, ${R('evt_card')},
  CONSTRAINT uq_evt_card UNIQUE (card_id, tipo, ocorrido_em)`],
    ['fato_transicao', `${IDENT('transicao_sk')} PRIMARY KEY,
  ${ID('card_id')}, ${ID('quadro_id', true)},
  ${ID('coluna_origem_id', true)}, ${ID('coluna_destino_id')},
  ${ENUM('tipo_coluna', ['fila', 'execucao'], true)}, ${ENUM('direcao', ['avanco', 'retorno'], true)},
  ${ENUM('fonte', ['revision', 'webhook'])}, id_origem varchar(64) NOT NULL CHECK (id_origem ~ '^[\\x21-\\x7E]+$'),
  ${DT('ocorrido_em')}, usuario text NULL, ${R('fato_transicao')},
  CONSTRAINT uq_fato_transicao UNIQUE (fonte, id_origem)`],
    ['rec_transicao_par', `${IDENT('par_sk')} PRIMARY KEY,
  transicao_webhook_sk bigint NOT NULL, transicao_revision_sk bigint NOT NULL,
  delta_ms integer NOT NULL, ${DT('casado_em')}, ${R('rec_transicao_par')},
  CONSTRAINT uq_rec_par_webhook UNIQUE (transicao_webhook_sk),
  CONSTRAINT uq_rec_par_revision UNIQUE (transicao_revision_sk),
  CONSTRAINT fk_rec_par_webhook FOREIGN KEY (transicao_webhook_sk) REFERENCES ${s}.fato_transicao (transicao_sk),
  CONSTRAINT fk_rec_par_revision FOREIGN KEY (transicao_revision_sk) REFERENCES ${s}.fato_transicao (transicao_sk)`],
    ['evt_bloqueio', `${IDENT('evt_sk')} PRIMARY KEY,
  ${ID('card_id')}, ${ID('id_origem')}, ${ENUM('tipo', ['inicio', 'fim'])},
  motivo_codigo ${COD} NULL, ${ID('coluna_id', true)}, fornecedor_codigo ${COD} NULL,
  ${DT('ocorrido_em')}, ${R('evt_bloqueio')},
  CONSTRAINT uq_evt_bloqueio UNIQUE (card_id, id_origem, tipo)`],
  ];
  const nomes = tabelas.map(([n]) => n);
  return {
    up: [
      ...tabelas.flatMap(([n, corpo]) => [tabela(S, B, n, corpo), indice(s, `ix_${n}_coleta`, n, 'coleta_id'), ...appendOnly(S, s, n)]),
      indice(s, 'ix_fato_transicao_card', 'fato_transicao', 'card_id, ocorrido_em'),
      indice(s, 'ix_fato_transicao_ocorrido', 'fato_transicao', 'ocorrido_em'),
      // Canônica: todas as revision + webhooks sem par (tolerância definida no casador, N-3). Sem `usuario` (data-model §3.2).
      `CREATE VIEW ${s}.vw_transicao_canonica WITH (security_invoker = true) AS
  SELECT t.transicao_sk, t.card_id, t.quadro_id, t.coluna_origem_id, t.coluna_destino_id, t.tipo_coluna, t.direcao,
         t.fonte, t.id_origem, t.ocorrido_em, t.sistema_origem, t.coletado_em, t.coleta_id
  FROM ${s}.fato_transicao t
  WHERE t.fonte = 'revision'
     OR NOT EXISTS (SELECT 1 FROM ${s}.rec_transicao_par p WHERE p.transicao_webhook_sk = t.transicao_sk)`,
    ],
    down: [dropView(`${s}.vw_transicao_canonica`), ...drop(...[...nomes].reverse().map((t) => `${s}.${t}`))],
  };
};
export const { up, down } = migracao(ddl);
