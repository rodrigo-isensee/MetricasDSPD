import { migracao } from '../src/plataforma/db/executar.js';
import type { Ddl } from '../src/plataforma/db/ddl.js';
import { lista } from '../src/plataforma/db/ddl.js';
import type { Esquemas } from '../src/plataforma/db/esquemas.js';

/**
 * Pedido 105, E7.496 (T3 = A do dono, 2026-11-17): o tipo Enabler do BusinessMap vira a categoria `habilitador` em `ref_tipo_card.categoria`.
 * A migração 0018 criou a coluna com CHECK de seis valores; o `bm:ref-sync` com a categoria nova seria recusado pelo banco. Aqui o CHECK da
 * coluna passa a aceitar sete valores (`habilitador` entra; nenhum sai). Nenhuma linha é reescrita: a referência é versionada por vigência e
 * o `bm:ref-sync` fecha a vigência do Enabler e abre outra com a categoria nova; a reprojeção grava versão nova em `dim_card_versao` só nos
 * cards Enabler (nada é sobrescrito). `down` volta ao CHECK de seis valores (falha se já houver linha `habilitador`, de propósito: não apaga dado).
 */
const ANTES = ['bug_interno', 'defeito_producao', 'requisicao', 'divida_tecnica', 'melhoria', 'produto'] as const;
const DEPOIS = ['bug_interno', 'defeito_producao', 'requisicao', 'divida_tecnica', 'melhoria', 'habilitador', 'produto'] as const;
const NOME = 'ref_tipo_card_categoria_check';

const troca = (S: Esquemas, valores: readonly string[]): string[] => [
  `ALTER TABLE ${S.bm}.ref_tipo_card DROP CONSTRAINT IF EXISTS ${NOME}`,
  `ALTER TABLE ${S.bm}.ref_tipo_card ADD CONSTRAINT ${NOME} CHECK (categoria IN (${lista(valores)}))`,
];

export const ddl = (S: Esquemas): Ddl => ({
  up: troca(S, DEPOIS),
  down: troca(S, ANTES),
});
export const { up, down } = migracao(ddl);
