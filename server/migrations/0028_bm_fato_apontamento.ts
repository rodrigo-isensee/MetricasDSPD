import { migracao } from '../src/plataforma/db/executar.js';
import { COD, drop, DT, IDN, indice, tabela, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193), A1: estado atual de cada apontamento (plano 059 §3.3; ADR 0020, revisão 4, R4-4 e R4-6). Projeção (fora do
 * gatilho de imutabilidade: a eliminação a pedido anula `pessoa_ref`). Reconstruível da staging, MENOS `pessoa_ref` (a staging não tem
 * pessoa): a reconstrução preserva o valor gravado. `pessoa_ref` é a única referência a pessoa (pseudônimo, `COLUNAS_PESSOA`), sem FK
 * para `dim_responsavel` (o procedimento de eliminação apaga a linha da pessoa e depois anula o vínculo). `iniciativa_card_id` é a raiz
 * de `dim_card_raiz` na mesma transação (A6 do review); `excluido_em` vem dos eventos (`excluido_detectado` sem `reaparecido`
 * posterior) e tira o apontamento das somas, sem apagar nada. Índices parciais com `excluido_em` nulo (A5 do review).
 */
export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  return {
    up: [
      tabela(S, 'businessmap', 'fato_apontamento', `${IDN('logged_time_id')} PRIMARY KEY,
  ${IDN('card_id')}, ${IDN('parent_card_id', true)}, ${IDN('subtask_id', true)}, ${IDN('lane_id', true)}, ${IDN('column_id', true)}, ${IDN('category_id', true)},
  data_apontamento date NOT NULL, segundos integer NOT NULL CHECK (segundos BETWEEN 1 AND 86400), ${DT('registrado_em', true)},
  subgrupo_codigo ${COD} NOT NULL, flags_qualidade smallint NOT NULL CHECK (flags_qualidade BETWEEN 0 AND 31),
  qtd_palavras smallint NOT NULL CHECK (qtd_palavras >= 0), versao_dicionario varchar(40) NOT NULL,
  registro_sha256 bytea NOT NULL CHECK (octet_length(registro_sha256) = 32),
  ${IDN('iniciativa_card_id', true)}, pessoa_ref bigint NULL CHECK (pessoa_ref > 0),
  versoes smallint NOT NULL CHECK (versoes >= 1), ${DT('excluido_em', true)},
  ${DT('atualizado_em')}, atualizado_por_coleta_id bigint NOT NULL`),
      indice(s, 'ix_fato_apontamento_data', 'fato_apontamento', 'data_apontamento', 'excluido_em IS NULL'),
      indice(s, 'ix_fato_apontamento_pessoa', 'fato_apontamento', 'pessoa_ref, data_apontamento', 'excluido_em IS NULL'),
      indice(s, 'ix_fato_apontamento_iniciativa', 'fato_apontamento', 'iniciativa_card_id, data_apontamento', 'excluido_em IS NULL'),
      indice(s, 'ix_fato_apontamento_card', 'fato_apontamento', 'card_id'),
    ],
    down: drop(`${s}.fato_apontamento`),
  };
};
export const { up, down } = migracao(ddl);
