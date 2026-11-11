---
tipo: review
contrato: 1
pedido: 093-release-6b-homolog
branch: docs/093-release-c
commit: 773876f7a2cd3a1e766ff7fbb4484e274207095a
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-11
---
# Review: release 093 (develop em 7b2325a9 contra a homolog)

## Parecer
Aprovado. A release é a `develop` em `7b2325a9` contra a `homolog` em `c088168d`: 59 arquivos. A branch `docs/093-release-c` sai da `develop` em `7b2325a9` e só acrescenta o CHANGELOG (commit `773876f7`, 3 linhas a mais e 2 a menos) e este parecer, que substitui o anterior (sobre `1d1dc74c`, develop em `9fe4b61f`, mesclado pelo #311).

### O que já estava revisado (develop em 9fe4b61f)
- #298 `075-l6b-publicacao-real` (6b) com review, QA e segurança aprovados sobre `bd76128a`; #302 a #307 conferidos no parecer anterior (K-172, K-263, K-264, K-121, CHANGELOG da release anterior).
- 6b inalterado nesta volta: `BLOQUEIOS_COM_DADO_REAL = true` em `packages/contratos/src/origem.ts:58` e `DATA_BLOQUEIO_COM_DADO_REAL = '2026-11-01'` em `packages/metricas/src/core/criterios.ts:127`.

### Delta lido (`9fe4b61f..7b2325a9`)
- #308 K-265 (`docs/engineering/guia-do-desenvolvedor.md`, 1 linha): só documentação; review `094-k265-guia-pronto` aprovado sobre `26511df5`; o arquivo mesclado é igual ao revisado (`git diff 26511df5 87eaef8f` vazio no arquivo).
- #309 K-266 (`server/tests/seed-recusa-real.pg.test.ts`, 1 linha): só teste; review e QA `094-k266-seed-tmpdir` aprovados sobre `1d7c4291`; arquivo igual no squash. O filho recebe só `TMPDIR`, não o `.env` (K-261 preservado).
- #310 K-267 (`server/tests/painel-real-f6.test.ts`, regex de pessoa do S6 e caso S6b): só teste; review e QA `094-k267-regex-pessoa` aprovados sobre `91448084`; arquivo igual no squash.
- #311: CHANGELOG e pareceres da primeira volta desta release.
- Nenhum PR do delta toca `packages/`, `web/`, `server/src/` nem migrações (`git diff 9fe4b61f 7b2325a9` vazio nesses caminhos): os arquivos do 6b e o código de produção ficam como revisados. O parecer de segurança da release segue valendo.
- **CI:** CI do push na `develop` em `9fe4b61f` (A3 anterior) e em `87eaef8f` com sucesso; `ce401fd5` e `72f8b45b` cancelados por push seguinte; em `7b2325a9`, em andamento na hora do review. Os PRs entraram com os checks do PR exigidos pelo ruleset. Não repeti suíte (é do QA e do CI).
- **Regras invioláveis:** o delta não muda cálculo nem critério, não mistura BusinessMap e Acelerato e não traz dado de pessoa; o K-267 só endurece a sonda que procura dado de pessoa na resposta da API.
- **CHANGELOG:** #308 em Adicionado (Documentação), junto de #303 e #307; #309 e #310 em Corrigido (Testes), no formato da `[Não publicado]`.

Não toquei na base real nem no `.env`, e não rodei `pnpm run pronto` (é do QA).

## Achados
- A1 (recomendado) CHANGELOG.md:25 · a data 2026-11-01 corta a série do O1 e O1, O2, O5, O19 e BLOQUEADOS passam a dado real: o corpo do PR de release para a main deve dizer isso ao dono, que valida o painel Operacional na homolog (E1.6).
- A2 (recomendado) packages/contratos/src/origem.ts:55 · os quatro recomendados do review do 6b (motivo O5 sem uso, comentário "O19 a O26", teto excedido, L1 da análise 064) seguem abertos; confira se têm cartão no quadro.
- A3 (recomendado) CHANGELOG.md:39 · o CI do push na develop em 7b2325a9 estava em andamento no review; confira o resultado antes de abrir o PR para a homolog (E1.5).
- A4 (recomendado) docs/engineering/fluxo-homologacao.md:170 · os dois recomendados do review do K-263 (texto "sem espera paga" desatualizado; espera também com portão em curso) seguem abertos; confira se têm cartão no quadro.
