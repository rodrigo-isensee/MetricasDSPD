---
tipo: review
contrato: 1
pedido: 093-release-6b-homolog
branch: docs/093-release
commit: ce704f9b61bb23ae2b1e197d50b71394f4dbf622
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: release 093 (develop em c6e5fd8f contra a homolog)

## Parecer
Aprovado. A release é a `develop` em `c6e5fd8f` (PRs 302 e 298) contra a `homolog` em `c088168d`: 22 arquivos. A branch `docs/093-release` só acrescenta o CHANGELOG (commit `ce704f9b`, 3 linhas trocadas) e este parecer.

- **Reviews:** #298 `075-l6b-publicacao-real` aprovado sobre `bd76128a`, com QA e segurança aprovados no mesmo commit, sem bloqueante (quatro recomendados); #302 `090-retros-2026-11-11` aprovado sobre `1925530d` (classe T, só documentação).
- **Conflito do #298:** depois dos pareceres a branch recebeu três merges da `develop`. Comparei o patch revisado (`129fc3d5..bd76128a`) com o squash mesclado (`c6e5fd8f^..c6e5fd8f`), fora das pastas de parecer: linhas idênticas. A resolução não mudou o patch e os pareceres seguem válidos.
- **CI:** os dois entraram por squash, estado `MERGED`, com os checks do PR sem falha (sucesso ou pulado). O CI do push na `develop` em `c6e5fd8f` estava em andamento na hora do review; o portão do PR para a `homolog` (E1.5) o cobre. Não repeti a suíte (é do QA e do CI).
- **6b:** `BLOQUEIOS_COM_DADO_REAL = true` em `packages/contratos/src/origem.ts:58`; `DATA_BLOQUEIO_COM_DADO_REAL = '2026-11-01'` em `packages/metricas/src/core/criterios.ts:127`, ponto único do id, da versão e do corte do O1. BLOQUEADOS, O5 e O19 voltam a `METRICAS_ORIGEM_REAL`; T10 e T12 não estão no conjunto (só no comentário de `:27`).
- **Migrações:** nenhuma nova; o diff não toca a pasta de migração e a última segue `0035_ac_previsao_retorno_booleano`.
- **Regras invioláveis:** o 6b é só BusinessMap, sem mistura com o Acelerato e sem dado de pessoa novo; a versão de critério tem data e marca (T2.6) e o piso de 20 segue nos percentis.
- **CHANGELOG:** número do PR na nota do 6b, a mudança de critério do bloqueio com dado real em Mudanças de critério de cálculo e as retrospectivas do #302, no formato da `[Não publicado]`.

Não toquei na base real nem no `.env`, e não rodei `pnpm run pronto` (é do QA).

## Achados
- A1 (recomendado) CHANGELOG.md:50 · a data 2026-11-01 corta a série do O1 e o O1, O2, O5, O19 e BLOQUEADOS passam a dado real: o corpo do PR de release para a main deve dizer isso ao dono, que valida o painel Operacional na homolog (E1.6).
- A2 (recomendado) packages/contratos/src/origem.ts:55 · os quatro recomendados do review do 6b (motivo O5 sem uso, comentário "O19 a O26", teto excedido, L1 da análise 064) seguem abertos; confira se têm cartão no quadro.
- A3 (recomendado) CHANGELOG.md:25 · o CI do push na develop em c6e5fd8f estava em andamento no review; confira o resultado antes de abrir o PR para a homolog (E1.5).
