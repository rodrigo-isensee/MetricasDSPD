import { migracao } from '../src/plataforma/db/executar.js';
import { drop, tabelaPlana, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193), A1: lista de supressão da eliminação a pedido (ADR 0020, revisão 4, R4-6; A2 do review de modelagem; ADR 0025
 * item 8). `hash_usuario` = HMAC-SHA256 do `user_id` com o sal `PESSOA_ELIMINADA_SAL` do `.env` (nunca o id em claro, nunca o sal na
 * base). O projetor a consulta ANTES de chamar `/users` e de criar `dim_responsavel` ou `pessoa_ref`. `INSERT` só do `dspd_migrador`
 * (dono); `SELECT` só do `dspd_coletor`; nenhum privilégio ao `dspd_api`. Nunca apagada pelo procedimento normal.
 */
export const ddl = (S: Esquemas): Ddl => ({
  up: [
    tabelaPlana(S.bm, 'cfg_pessoa_eliminada', `hash_usuario bytea NOT NULL PRIMARY KEY CHECK (octet_length(hash_usuario) = 32),
  eliminada_em date NOT NULL`),
  ],
  down: drop(`${S.bm}.cfg_pessoa_eliminada`),
});
export const { up, down } = migracao(ddl);
