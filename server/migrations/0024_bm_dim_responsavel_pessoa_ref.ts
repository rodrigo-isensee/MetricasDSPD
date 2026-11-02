import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193), A1: chave opaca de pessoa (ADR 0020, revisão 4, R4-4). `pessoa_ref` é sequencial, sem relação com o `user_id`
 * do BusinessMap, e é a única referência a pessoa que o fato do apontamento guarda. É pseudônimo (dado pessoal, LGPD art. 13 §4): entra
 * em `COLUNAS_PESSOA` e a tabela continua fora do `dspd_api`. O sequencial revela a ordem de descoberta (A7 do review: aceito e declarado).
 */
export const ddl = (S: Esquemas): Ddl => ({
  up: [`ALTER TABLE ${S.bm}.dim_responsavel ADD COLUMN pessoa_ref bigint GENERATED ALWAYS AS IDENTITY UNIQUE`],
  down: [`ALTER TABLE ${S.bm}.dim_responsavel DROP COLUMN IF EXISTS pessoa_ref`],
});
export const { up, down } = migracao(ddl);
