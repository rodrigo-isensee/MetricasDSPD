import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193), E2.27, R4-6 da ADR 0020 (revisão 4): responsável do procedimento de eliminação a pedido, na medida em que cabe sem dado de
 * pessoa. `executado_por` guarda só o PAPEL DE BANCO que gravou a linha (`current_user`, por exemplo `dspd_migrador`): nome de papel não é
 * dado de pessoa e não entra em `COLUNAS_PESSOA`. Quem pediu a eliminação e quem a autorizou não cabem aqui (seriam dado de pessoa ou texto livre)
 * e ficam fora da base. As linhas já gravadas ficam com o papel de quem rodou a migração.
 */
export const ddl = (S: Esquemas): Ddl => ({
  up: [`ALTER TABLE ${S.bm}.cfg_pessoa_eliminada ADD COLUMN executado_por varchar(63) NOT NULL DEFAULT current_user CHECK (executado_por <> '')`],
  down: [`ALTER TABLE ${S.bm}.cfg_pessoa_eliminada DROP COLUMN IF EXISTS executado_por`],
});
export const { up, down } = migracao(ddl);
