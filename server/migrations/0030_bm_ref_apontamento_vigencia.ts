import { migracao } from '../src/plataforma/db/executar.js';
import { indice, type Ddl } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 059 (K-193), E2.27: vigência no dicionário do apontamento, para a troca do arquivo poder mudar ou retirar termo (item 4 da DECISÃO DO
 * DONO de 2026-11-02: ajuste posterior é troca de arquivo). `vigente_de` e `vigente_ate` em `ref_apontamento_*`, como nas demais `ref_` com
 * vigência (0018): termo novo abre linha, termo mudado fecha a antiga (`vigente_ate`) e abre a nova, termo retirado só fecha. Nada é apagado.
 * - Escrita do `dspd_ref`: INSERT e `UPDATE (vigente_ate)` (o grant por coluna sai de `gerarGrants`, que já cobre toda `ref_` com a coluna) e
 *   o gatilho `proibir_alteracao_vigencia` (0018) recusa qualquer outro UPDATE, o reabrir de linha fechada, DELETE e TRUNCATE, para qualquer papel.
 * - Chave: `vigencia_id` (identidade) no lugar da chave natural, que passa a ser única só entre as linhas vigentes (índice parcial). Assim o mesmo
 *   termo pode ter várias vigências, inclusive na mesma data. A identidade não pede privilégio de sequência.
 * - Sem FK de termo e de regra para o subgrupo: a referência é o `codigo` (identidade estável do subgrupo), que agora repete entre vigências e não
 *   é mais chave. A carga grava subgrupo, termo e regra numa transação só e o arquivo já é validado contra subgrupo inexistente.
 * - Linhas já gravadas ganham `vigente_de` = `vigente_desde` da versão de critério que as incluiu (`incluido_por_versao_id`).
 * O `down` é para ambiente de desenvolvimento: apaga as linhas já fechadas para voltar à chave natural (é a única remoção de histórico, fora do
 * fluxo normal, e só com os gatilhos desligados).
 */
const TABELAS = ['ref_apontamento_subgrupo', 'ref_apontamento_termo', 'ref_apontamento_regra_tipo'] as const;

export const ddl = (S: Esquemas): Ddl => {
  const s = S.bm;
  const vigencia = (t: string): string[] => [
    `ALTER TABLE ${s}.${t} ADD COLUMN vigente_de date NULL, ADD COLUMN vigente_ate date NULL`,
    `UPDATE ${s}.${t} x SET vigente_de = COALESCE((SELECT v.vigente_desde FROM ${S.core}.ref_versao_criterio v WHERE v.versao_id = x.incluido_por_versao_id), CURRENT_DATE)`,
    `ALTER TABLE ${s}.${t} ALTER COLUMN vigente_de SET NOT NULL`,
    `ALTER TABLE ${s}.${t} ADD CONSTRAINT ck_${t}_vigencia CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_de)`,
  ];
  const chaveNova = (t: string): string[] => [`ALTER TABLE ${s}.${t} DROP CONSTRAINT ${t}_pkey`, `ALTER TABLE ${s}.${t} ADD COLUMN vigencia_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY`];
  return {
    up: [
      `ALTER TABLE ${s}.ref_apontamento_termo DROP CONSTRAINT fk_ref_apontamento_termo_subgrupo`,
      `ALTER TABLE ${s}.ref_apontamento_regra_tipo DROP CONSTRAINT fk_ref_apontamento_regra_subgrupo`,
      `ALTER TABLE ${s}.ref_apontamento_subgrupo DROP CONSTRAINT uq_ref_apontamento_subgrupo_prioridade`,
      ...TABELAS.flatMap((t) => [...vigencia(t), ...chaveNova(t)]),
      indice(s, 'uq_ref_apontamento_subgrupo_vigente', 'ref_apontamento_subgrupo', 'codigo', 'vigente_ate IS NULL', true),
      indice(s, 'uq_ref_apontamento_subgrupo_prioridade_vigente', 'ref_apontamento_subgrupo', 'prioridade', 'vigente_ate IS NULL', true),
      indice(s, 'uq_ref_apontamento_termo_vigente', 'ref_apontamento_termo', 'termo_normalizado, subgrupo_codigo', 'vigente_ate IS NULL', true),
      indice(s, 'uq_ref_apontamento_regra_tipo_vigente', 'ref_apontamento_regra_tipo', 'type_id, condicao', 'vigente_ate IS NULL', true),
      ...TABELAS.flatMap((t) => [
        `CREATE TRIGGER tg_${t}_vigencia BEFORE UPDATE OR DELETE ON ${s}.${t} FOR EACH ROW EXECUTE FUNCTION ${S.core}.proibir_alteracao_vigencia()`,
        `CREATE TRIGGER tg_${t}_sem_truncate BEFORE TRUNCATE ON ${s}.${t} FOR EACH STATEMENT EXECUTE FUNCTION ${S.core}.proibir_alteracao_vigencia()`,
      ]),
    ],
    down: [
      ...TABELAS.flatMap((t) => [`DROP TRIGGER IF EXISTS tg_${t}_vigencia ON ${s}.${t}`, `DROP TRIGGER IF EXISTS tg_${t}_sem_truncate ON ${s}.${t}`]),
      `DROP INDEX IF EXISTS ${s}.uq_ref_apontamento_regra_tipo_vigente`,
      `DROP INDEX IF EXISTS ${s}.uq_ref_apontamento_termo_vigente`,
      `DROP INDEX IF EXISTS ${s}.uq_ref_apontamento_subgrupo_prioridade_vigente`,
      `DROP INDEX IF EXISTS ${s}.uq_ref_apontamento_subgrupo_vigente`,
      ...TABELAS.map((t) => `DELETE FROM ${s}.${t} WHERE vigente_ate IS NOT NULL`),
      `ALTER TABLE ${s}.ref_apontamento_regra_tipo DROP COLUMN vigencia_id, DROP COLUMN vigente_ate, DROP COLUMN vigente_de, ADD PRIMARY KEY (type_id, condicao)`,
      `ALTER TABLE ${s}.ref_apontamento_termo DROP COLUMN vigencia_id, DROP COLUMN vigente_ate, DROP COLUMN vigente_de, ADD PRIMARY KEY (termo_normalizado, subgrupo_codigo)`,
      `ALTER TABLE ${s}.ref_apontamento_subgrupo DROP COLUMN vigencia_id, DROP COLUMN vigente_ate, DROP COLUMN vigente_de, ADD PRIMARY KEY (codigo), ADD CONSTRAINT uq_ref_apontamento_subgrupo_prioridade UNIQUE (prioridade)`,
      `ALTER TABLE ${s}.ref_apontamento_termo ADD CONSTRAINT fk_ref_apontamento_termo_subgrupo FOREIGN KEY (subgrupo_codigo) REFERENCES ${s}.ref_apontamento_subgrupo (codigo)`,
      `ALTER TABLE ${s}.ref_apontamento_regra_tipo ADD CONSTRAINT fk_ref_apontamento_regra_subgrupo FOREIGN KEY (subgrupo_codigo) REFERENCES ${s}.ref_apontamento_subgrupo (codigo)`,
    ],
  };
};
export const { up, down } = migracao(ddl);
