import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 099, D1 (1a; recorte do arquiteto, E3.240): `dim_chamado.fluxo` guarda o workflow em que o chamado correu, base para os motivos da
 * Sustentação. É o único `descricao_workflow` (domínio fechado, nunca texto livre) das etapas do chamado no staging; nulo quando o chamado
 * não tem etapa ("sem fluxo") e nulo, com a contagem `fluxo_multiplo` no projetor, quando as etapas trazem mais de um workflow (nenhum é
 * escolhido). Não é dado de pessoa: o GRANT de SELECT ao `dspd_api` vem da regra geral das projeções (o migrador reaplica os GRANTs ao fim).
 * Só `dim_chamado` (projeção refeita pelo projetor); `dim_chamado_versao` e o staging não mudam e nenhuma linha é reescrita aqui: a coluna
 * nasce nula e só a reprojeção, que é do dono, a preenche. `down` tira a coluna (derivada, refeita pelo projetor).
 */
export const ddl = (S: Esquemas): Ddl => ({
  up: [`ALTER TABLE ${S.ac}.dim_chamado ADD COLUMN IF NOT EXISTS fluxo text NULL`],
  down: [`ALTER TABLE ${S.ac}.dim_chamado DROP COLUMN IF EXISTS fluxo`],
});
export const { up, down } = migracao(ddl);
