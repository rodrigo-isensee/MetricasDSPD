import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 105, E7.238 (decisão B do dono sobre o S1): `dim_chamado.escala_p` diz se a prioridade do chamado foi escrita na escala P1 a P5 da
 * matriz (`P<n> - ...`, verdadeiro) ou em outra escala (famílias DSPD-* e SSSC-*, com prazos próprios, que a D-12 só mapeia para P; falso).
 * Nulo = sem prioridade (sem prazo) ou projeção anterior a esta coluna. Booleano derivado do texto da prioridade, nunca o texto; não é dado
 * de pessoa: o GRANT de SELECT ao `dspd_api` vem da regra geral das projeções (o migrador reaplica os GRANTs ao fim). Só `dim_chamado`
 * (projeção refeita pelo projetor); `dim_chamado_versao` e o staging não mudam e nenhuma linha é reescrita aqui: a coluna nasce nula e só a
 * reprojeção (`ac:reprojetar-escala`, do dono) a preenche. `down` tira a coluna (derivada, refeita pelo projetor).
 */
export const ddl = (S: Esquemas): Ddl => ({
  up: [`ALTER TABLE ${S.ac}.dim_chamado ADD COLUMN IF NOT EXISTS escala_p boolean NULL`],
  down: [`ALTER TABLE ${S.ac}.dim_chamado DROP COLUMN IF EXISTS escala_p`],
});
export const { up, down } = migracao(ddl);
