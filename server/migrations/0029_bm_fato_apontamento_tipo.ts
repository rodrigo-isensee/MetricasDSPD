import { migracao } from '../src/plataforma/db/executar.js';
import { IDN, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193), E2.19: tipo do card em `fato_apontamento` (`type_id` do BusinessMap, só dígitos), para o filtro por tipo da aba (CA do
 * contrato: consulta `tipo` = lista de `type_id`). Vem do tipo do card do apontamento (ou do card pai, quando o apontamento é de subtarefa),
 * lido pela coleta na mesma referência que a classificação usa. Coluna anulável: as linhas já gravadas ficam sem tipo até a próxima leitura
 * delas (a varredura relê e o projetor preenche). Sem índice: o filtro vem sempre junto da janela de datas, que já tem índice parcial.
 */
export const ddl = (S: Esquemas): Ddl => ({
  up: [`ALTER TABLE ${S.bm}.fato_apontamento ADD COLUMN ${IDN('type_id', true)}`],
  down: [`ALTER TABLE ${S.bm}.fato_apontamento DROP COLUMN IF EXISTS type_id`],
});
export const { up, down } = migracao(ddl);
