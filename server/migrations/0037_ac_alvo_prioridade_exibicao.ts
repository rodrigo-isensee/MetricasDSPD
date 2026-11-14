import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 099, K-314 B1 (plano docs/architecture/features/099-k314-unidade-exibicao.md, Q-099-11): cada prazo de `ref_alvo_prioridade` ganha a
 * unidade em que o PROC o escreve (`exibir_pa` e `exibir_r`: `min`, `h` ou `dia`). É só exibição: o cálculo continua em horas, pela biblioteca
 * compartilhada. Sem DEFAULT e sem preencher as linhas que já existem: elas ficam nulas ("vigência anterior ao K-314"), porque preencher seria
 * inferir a unidade pelas horas ou reescrever vigência gravada. Linha nova diz a unidade (o carregador exige); os CHECK impedem metade
 * preenchida e "dia corrido" (não definido no PROC). `down` tira as restrições e as colunas: a unidade de exibição não é dado de cálculo e se
 * reconstrói do `texto_proc` do arquivo versionado.
 */
const T = 'ref_alvo_prioridade';

export const ddl = (S: Esquemas): Ddl => {
  const t = `${S.ac}.${T}`;
  return {
    up: [
      `ALTER TABLE ${t} ADD COLUMN exibir_pa text NULL CHECK (exibir_pa IN ('min','h','dia'))`,
      `ALTER TABLE ${t} ADD COLUMN exibir_r text NULL CHECK (exibir_r IN ('min','h','dia'))`,
      `ALTER TABLE ${t} ADD CONSTRAINT ck_ref_alvo_exibir_par CHECK ((exibir_pa IS NULL) = (exibir_r IS NULL))`,
      `ALTER TABLE ${t} ADD CONSTRAINT ck_ref_alvo_exibir_relogio CHECK (NOT (unidade_pa = 'corrido' AND exibir_pa = 'dia') AND NOT (unidade_r = 'corrido' AND exibir_r = 'dia'))`,
    ],
    down: [
      `ALTER TABLE ${t} DROP CONSTRAINT ck_ref_alvo_exibir_relogio`,
      `ALTER TABLE ${t} DROP CONSTRAINT ck_ref_alvo_exibir_par`,
      `ALTER TABLE ${t} DROP COLUMN exibir_r`,
      `ALTER TABLE ${t} DROP COLUMN exibir_pa`,
    ],
  };
};
export const { up, down } = migracao(ddl);
