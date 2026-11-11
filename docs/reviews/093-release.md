---
tipo: review
contrato: 1
pedido: 093-release-6b-homolog
branch: docs/093-release-b
commit: 1d1dc74ca30e03f9a3a35e2ff37615233673ddf0
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: release 093 (develop em 9fe4b61f contra a homolog)

## Parecer
Aprovado. A release é a `develop` em `9fe4b61f` contra a `homolog` em `c088168d`: 52 arquivos. A branch `docs/093-release-b` sai da `develop` em `9fe4b61f` e só acrescenta o CHANGELOG (commit `1d1dc74c`, 3 linhas) e este parecer, que substitui o anterior (sobre `ce704f9b`, develop em `c6e5fd8f`).

### O que já estava revisado (develop em c6e5fd8f)
- #298 `075-l6b-publicacao-real` (6b) com review, QA e segurança aprovados sobre `bd76128a`; resolução de conflito sem mudar o patch (conferido no parecer anterior). #302 retrospectivas, classe T.
- 6b inalterado nesta volta: `BLOQUEIOS_COM_DADO_REAL = true` em `packages/contratos/src/origem.ts:58` e `DATA_BLOQUEIO_COM_DADO_REAL = '2026-11-01'` em `packages/metricas/src/core/criterios.ts:127`.

### Delta lido (`c6e5fd8f..9fe4b61f`)
- #303 K-172 (`praticas.md`, 1 linha): só documentação; review `092-k172-pronto-praticas` aprovado sobre `87079bef`.
- #304 K-263 (`tools/homolog/src/aprovacao.ts` e teste): review, QA e segurança aprovados sobre `d1693a72`, devops sobre `e40524fd` (mesmo código; `d1693a72` só soma o parecer de devops). Patch mesclado igual ao revisado em `tools/` (`git diff d1693a72 18701297 -- tools/` vazio).
- #305 K-264 (testes de CLI do servidor, `ajuda-cli-filho.ts`): review e QA aprovados sobre `6d2e15be`; os seis arquivos do patch iguais no squash.
- #306: CHANGELOG e pareceres da release anterior.
- #307 K-121 (frontmatter `contrato: 0` em dez documentos antigos): só documentação; review `092-k121-frontmatter` aprovado sobre `80bfc064`.
- Nenhum PR do delta toca `packages/`, `web/`, `server/src/` nem migrações: os arquivos do 6b ficam como revisados. A última migração segue `0035_ac_previsao_retorno_booleano`.
- **CI:** CI do push na `develop` em `c6e5fd8f` (A3 anterior) e em `27db92c3` com sucesso; `5936334e` e `c6a0dae9` cancelados por push seguinte; em `9fe4b61f`, em andamento na hora do review. Os PRs entraram com os checks do PR exigidos pelo ruleset. Não repeti suíte (é do QA e do CI).
- **Regras invioláveis:** o delta não muda cálculo, não mistura BusinessMap e Acelerato e não traz dado de pessoa; `TMPDIR` repassado ao filho não herda o `.env` (K-261 preservado).
- **CHANGELOG:** #303 e #307 em Adicionado (Documentação), #304 e #305 em Corrigido, no formato da `[Não publicado]`.

Não toquei na base real nem no `.env`, e não rodei `pnpm run pronto` (é do QA).

## Achados
- A1 (recomendado) CHANGELOG.md:25 · a data 2026-11-01 corta a série do O1 e O1, O2, O5, O19 e BLOQUEADOS passam a dado real: o corpo do PR de release para a main deve dizer isso ao dono, que valida o painel Operacional na homolog (E1.6).
- A2 (recomendado) packages/contratos/src/origem.ts:55 · os quatro recomendados do review do 6b (motivo O5 sem uso, comentário "O19 a O26", teto excedido, L1 da análise 064) seguem abertos; confira se têm cartão no quadro.
- A3 (recomendado) CHANGELOG.md:37 · o CI do push na develop em 9fe4b61f estava em andamento no review; confira o resultado antes de abrir o PR para a homolog (E1.5).
- A4 (recomendado) docs/engineering/fluxo-homologacao.md:170 · os dois recomendados do review do K-263 (texto "sem espera paga" desatualizado; espera também com portão em curso) seguem abertos; confira se têm cartão no quadro.
