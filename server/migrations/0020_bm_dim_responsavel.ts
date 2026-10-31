import { migracao } from '../src/plataforma/db/executar.js';
import { DT, drop, tabela, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * F3 do plano 052 (K-182), Q-8 = B e ADR 0020 (revisão 3, R3-1 e R3-2): nome do responsável do card, resolvido por
 * `GET /users` (`fields=user_id,realname`). Projeção de valor atual (como `dim_card`): UPSERT pelo `dspd_coletor`, fora do
 * gatilho de imutabilidade (a linha pode ser apagada a pedido do titular, DT-3, pelo migrador). As duas colunas de pessoa
 * estão em `COLUNAS_PESSOA` e a tabela fica fora da API: sem nenhum GRANT ao `dspd_api` (nem de tabela, nem de coluna).
 * `atualizado_em` é a data da última leitura confirmada em `/users` (DT-2: releitura a cada 30 dias).
 */
export const ddl = (S: Esquemas): Ddl => ({
  up: [
    tabela(S, 'businessmap', 'dim_responsavel', `responsavel_id text NOT NULL PRIMARY KEY CHECK (responsavel_id ~ '^[0-9]{1,12}$'),
  responsavel_nome text NOT NULL CHECK (responsavel_nome <> '' AND char_length(responsavel_nome) <= 200),
  ${DT('atualizado_em')}`),
  ],
  down: drop(`${S.bm}.dim_responsavel`),
});
export const { up, down } = migracao(ddl);
