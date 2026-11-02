import { migracao } from '../src/plataforma/db/executar.js';
import { appendOnly, COD, COLETA_FK, drop, DT, IDENT, IDN, indice, tabela, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193), A1: staging do worklog do BusinessMap (ADR 0025 itens 5 e 6; ADR 0020, revisão 4, R4-2). Append-only (gatilho),
 * uma linha por versão do apontamento: `UNIQUE (logged_time_id, registro_sha256)` com `ON CONFLICT ON CONSTRAINT ... DO NOTHING`.
 * SEM coluna de pessoa (o `user_id` fica só em memória até o projetor) e SEM texto livre (o comentário nunca chega aqui: só a saída da
 * classificação, lista fechada e inteiros). Ids são só dígitos; horas em segundos inteiros de 1 a 86 400 (A4 do review de modelagem).
 * `flags_qualidade` é máscara de bits da lista fechada (5 bits: 0 a 31).
 */
export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      tabela(S, 'businessmap', 'stg_apontamento', `${IDENT('stg_sk')} PRIMARY KEY,
  ${IDN('logged_time_id')}, ${IDN('card_id')}, ${IDN('parent_card_id', true)}, ${IDN('subtask_id', true)},
  ${IDN('lane_id', true)}, ${IDN('column_id', true)}, ${IDN('category_id', true)},
  data_apontamento date NOT NULL, segundos integer NOT NULL CHECK (segundos BETWEEN 1 AND 86400), ${DT('registrado_em', true)},
  subgrupo_codigo ${COD} NOT NULL, flags_qualidade smallint NOT NULL CHECK (flags_qualidade BETWEEN 0 AND 31),
  qtd_palavras smallint NOT NULL CHECK (qtd_palavras >= 0), versao_dicionario varchar(40) NOT NULL CHECK (versao_dicionario <> ''),
  registro_sha256 bytea NOT NULL CHECK (octet_length(registro_sha256) = 32),
  ${DT('coletado_em')}, coleta_id bigint NOT NULL,
  CONSTRAINT uq_stg_apontamento UNIQUE (logged_time_id, registro_sha256),
  ${COLETA_FK(s, 'stg_apontamento')}`),
      indice(s, 'ix_stg_apontamento_ultima', 'stg_apontamento', 'logged_time_id, stg_sk DESC'),
      indice(s, 'ix_stg_apontamento_card', 'stg_apontamento', 'card_id'),
      indice(s, 'ix_stg_apontamento_coleta', 'stg_apontamento', 'coleta_id'),
      ...appendOnly(S, s, 'stg_apontamento'),
    ],
    down: drop(`${s}.stg_apontamento`),
  };
};
export const { up, down } = migracao(ddl);
