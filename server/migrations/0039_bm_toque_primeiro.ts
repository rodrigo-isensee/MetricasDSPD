import { migracao } from '../src/plataforma/db/executar.js';
import { appendOnly, COLETA_FK, drop, DT, ENUM, IDENT, IDN, indice, lista, tabela, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 105 (O22, B7b), ADR 0020 revisão 6 (R6-3, R6-4, R6-6, R6-8): base do primeiro toque do card.
 * - `stg_toque_instante`: um evento por atualização do card (`r<n>`) ou comentário (`c<id>`), só escalares: o instante e se conta como toque. Sem `payload`,
 *   sem autor, sem `user_id`, sem texto (R6-3). Append-only; `UNIQUE (card_id, evento_id)` com `ON CONFLICT DO NOTHING` deduplica a releitura.
 * - `ctl_toque_leitura`: uma linha por leitura de card (estado e motivo em código, R6-4); o estado vigente é a linha de maior `leitura_sk`. Só INSERT; fora do
 *   `dspd_api` (`TABELAS_FORA_DA_API`).
 * - `dim_card.primeiro_toque_em` e `toque_situacao` (R6-6): projeção, lida pela API; nenhuma é de pessoa.
 * - `ctl_coleta.tarefa` ganha `carga_toque` (a carga do passado e o incremental do toque têm fonte e marca próprias, como o worklog na 0021).
 */
const TAREFAS_ANTES = ['coleta_incremental', 'varredura', 'webhook', 'projecao', 'reconciliacao', 'apontamento'] as const;
const SITUACOES = ['com_toque', 'sem_toque', 'nao_lido', 'autor_pendente', 'leitura_incompleta'] as const;
const MOTIVOS = ['lista_com_buraco', 'lista_curta', 'lista_longa', 'instante_invalido', 'revisao_invalida', 'comentario_invalido'] as const;

export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      `ALTER TABLE ${s}.ctl_coleta DROP CONSTRAINT ctl_coleta_tarefa_check`,
      `ALTER TABLE ${s}.ctl_coleta ADD CONSTRAINT ctl_coleta_tarefa_check CHECK (tarefa IN (${lista([...TAREFAS_ANTES, 'carga_toque'])}))`,
      tabela(S, 'businessmap', 'stg_toque_instante', `${IDENT('toque_sk')} PRIMARY KEY,
  ${IDN('card_id')},
  evento_id text NOT NULL CHECK (evento_id ~ '^(r([2-9]|[1-9][0-9]{1,8})|c[1-9][0-9]{0,14})$'),
  ${DT('ocorrido_em')},
  conta_como_toque boolean NOT NULL,
  ${DT('coletado_em')}, coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_toque_instante UNIQUE (card_id, evento_id),
  ${COLETA_FK(s, 'stg_toque_instante')}`),
      indice(s, 'ix_stg_toque_instante_coleta', 'stg_toque_instante', 'coleta_id'),
      ...appendOnly(S, s, 'stg_toque_instante'),
      tabela(S, 'businessmap', 'ctl_toque_leitura', `${IDENT('leitura_sk')} PRIMARY KEY,
  ${IDN('card_id')},
  coleta_id bigint NOT NULL,
  revisao_lida integer NULL CHECK (revisao_lida IS NULL OR revisao_lida >= 1),
  ${DT('lido_em')},
  ${ENUM('estado', ['lido', 'autor_pendente', 'leitura_incompleta'])},
  ${ENUM('motivo', MOTIVOS, true)},
  CONSTRAINT uq_ctl_toque_leitura UNIQUE (card_id, coleta_id),
  CONSTRAINT ck_ctl_toque_leitura_motivo CHECK ((estado = 'leitura_incompleta') = (motivo IS NOT NULL)),
  CONSTRAINT ck_ctl_toque_leitura_revisao CHECK (revisao_lida IS NOT NULL OR coalesce(motivo, '') = 'revisao_invalida'),
  ${COLETA_FK(s, 'ctl_toque_leitura')}`),
      indice(s, 'ix_ctl_toque_leitura_card', 'ctl_toque_leitura', 'card_id, leitura_sk DESC'),
      indice(s, 'ix_ctl_toque_leitura_coleta', 'ctl_toque_leitura', 'coleta_id'),
      ...appendOnly(S, s, 'ctl_toque_leitura'),
      `ALTER TABLE ${s}.dim_card ADD COLUMN primeiro_toque_em timestamptz(3) NULL,
  ADD COLUMN toque_situacao text NULL CHECK (toque_situacao IN (${lista(SITUACOES)}))`,
    ],
    down: [
      `ALTER TABLE ${s}.dim_card DROP COLUMN toque_situacao, DROP COLUMN primeiro_toque_em`,
      ...drop(`${s}.ctl_toque_leitura`, `${s}.stg_toque_instante`),
      `ALTER TABLE ${s}.ctl_coleta DROP CONSTRAINT ctl_coleta_tarefa_check`,
      `ALTER TABLE ${s}.ctl_coleta ADD CONSTRAINT ctl_coleta_tarefa_check CHECK (tarefa IN (${lista(TAREFAS_ANTES)}))`,
    ],
  };
};
export const { up, down } = migracao(ddl);
