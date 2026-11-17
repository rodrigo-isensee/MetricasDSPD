---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: ci/105-ci-economia
commit: 06aecfda01fb7ee2981a4ce4f11309ac8a24ef15
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: CI econômico (105, E7.594, review E7.595)

Commit revisado: `06aecfda` (`ci(economia): push só em develop e homolog; pula jobs pesados em mudança só de documento`), contra `origin/develop` (`acb62951`). Diff: `.github/workflows/ci.yml` (+53 −10), `changelog.d/ci-105-ci-economia.md` e a nota `docs/devops/105-ci-economia.md`. Tamanho: 63 linhas de workflow, abaixo da orientação de 150 (M14); um comportamento só.

## Verificadores
- **`pnpm run pronto`** (raiz da worktree 059, no head `06aecfda`): `rc=0`. Cobertura 100% em todos os pacotes (server 5338/5338, web 5088/5088, metricas 3248/3248 linhas) e `docs:check: ok (1763 páginas Markdown, 70 métricas, 2 eventos)`. Supre a lacuna do autor, que não o rodou.
- **CI:** parado por cobrança; não há PR nem run para este SHA. Este parecer **não** afirma CI verde; a suíte do workflow novo só se prova no primeiro PR.
- **`actionlint`:** ausente do PATH também aqui; não rodou. Fica como pendência do devops (E7.597).
- **Proteção da `develop`/`homolog`:** `gh api .../branches/develop/protection` e `.../rulesets/25003880` responderam `HTTP 403` ("Upgrade to GitHub Pro"). A lista dos checks exigidos foi lida da documentação: `docs/engineering/fluxo-homologacao.md` §15 (nove checks: `rapida`, `testes`, `build`, `e2e`, `filtro`, `banco`, `openapi`, `imagem`, `seguranca`).

## Riscos do detalhe, conferidos
1. **Check exigido pendente ou sumido:** nenhum job foi renomeado, criado ou removido; os nove nomes seguem iguais. `openapi`, `imagem` e `build` com `if` falso ficam `skipped`, que conta como sucesso no ruleset; `testes` roda sempre (fora do `schedule`). O agregador `e2e` segue com `if: always()` e falha em tudo que não seja `success`, salvo `skipped` com `pesado=false` (sonda S2). Se o `filtro` falhar, `testes`, `build`, `openapi` e `imagem` ficam pulados, mas o `filtro` é exigido e o `e2e` do PR fica vermelho (`PESADO` vazio, S2): o merge continua barrado.
2. **"Só documento" que afeta código:** o filtro `every` com `**` e as negações `!docs/**/*.md`, `!changelog.d/**`, `!*.md` foi emulado com o picomatch 4.0.7 do lockfile, `dot: true` (S3): JSON de `docs/architecture/fontes/` e `docs/api/openapi.json` (lidos por `server/src/modulos/referencia/*.ts`, `conferencia.ts`, `dicionario.ts` e `entradas/openapi.ts`) contam como código; `.md` fora de `docs/` e da raiz (`server/README.md`, `e2e/*.md`) também. Os `.md` de `docs/` que o código lê (`tools/docs-contratos`, `tools/spec-check`) continuam conferidos, porque `spec:check` e `docs:check` rodam no caminho leve. Nenhum teste de `server/`, `web/` ou `e2e/` importa `.md` (busca por `import ... .md` e `readFileSync` de `.md`).
3. **Push em `main` sem CI:** a `main` só recebe o PR de release e o de hotfix, ambos com `pull_request` para `main`, que roda inteiro (`pesado=true`). O `homolog-aprovada` lê execuções do `homolog.yml` (portão) e, para hotfix, o `ci.yml` com evento `pull_request` (`tools/homolog/src/aprovacao.ts:145`), nunca push em `main`. O `schedule` (perf noturno) continua lido da main. Nenhuma garantia some.
4. **Afrouxamento:** sem `continue-on-error` novo (o único é o de `seguranca`, que já existia), sem retry, sem `[skip ci]`, sem teste pulado em mudança de código (S1: `pesado=true` em todo evento com arquivo fora da lista, em PR para `homolog`/`main`, push em `homolog` e dispatch). Ações novas: nenhuma (o segundo `dorny/paths-filter` usa o mesmo SHA fixado). `permissions` intactas. Custo novo: zero (`R-CUSTO`).

## Regras de leitura que alcançam o diff
- `praticas.md` §10 (Pipeline de CI) e §10.1 (gates intactos): nomes dos jobs obrigatórios preservados; cobertura, lint, typecheck e e2e não afrouxados em mudança de código. A descrição da §10 ficou desatualizada (A3).
- `praticas.md` §9 (changelog por fragmento): fragmento presente, seção válida (`Desempenho`), conferido pelo `changelog conferir` dentro do `pronto` ("8 fragmento(s) válido(s)").

## Sondas
- S1 · passo `pesado` (`ci.yml:128-140`), 9 combinações de evento, base, ref e FORA · espera: `false` só em PR para develop ou push em develop sem código · obtido: igual; PR para homolog/main, push homolog, dispatch e FORA=true dão `true`; FORA vazio dá `false` (A1).
- S2 · agregador `e2e` (`ci.yml:283-289`) com `PESADO/RESULTADO` · espera: só `false/skipped` e `*/success` passam · obtido: `false/skipped` rc 0, `true/skipped` rc 1, vazio/`skipped` rc 1, `false/failure` rc 1, `true/success` rc 0, `true/cancelled` rc 1.
- S3 · predicado `every` no picomatch 4.0.7 `{dot:true}` · espera: só .md de docs/, .md da raiz e changelog.d/ são documento · obtido: igual; `docs/architecture/fontes/calendario.json`, `docs/api/openapi.json`, `docs/x.md.json`, `server/README.md`, `e2e/snap.md`, `ci.yml` são código.

## Achados
- A1 (recomendado) .github/workflows/ci.yml:136 · `[ "$FORA" != 'true' ]` falha aberto: saída vazia ou inesperada do filtro vira `pesado=false` (S1). Hoje o `dorny/paths-filter` sempre escreve `true`/`false` e a falha do passo derruba o job antes, então não há gatilho; trocar por `[ "$FORA" = 'false' ]` deixa o padrão no lado seguro.
- A2 (recomendado) .github/workflows/ci.yml:115 · em push para `develop`, o filtro sem `base` compara com o branch padrão (`main`), não com o `before`: `pesado=false` quase nunca ocorre. Economia a menos, não portão; usar `base: ${{ github.ref_name }}` ou tirar a promessa da nota.
- A3 (recomendado) docs/engineering/praticas.md:133 · a §10 diz que todo PR roda `testes` com cobertura, `openapi`, `imagem`, `build` e `e2e`; com o diff, PR só de documento para `develop` roda só `spec:check` e `docs:check`. Atualizar a §10 (e a §5 do `fluxo-homologacao.md`, se citar o mesmo) na mesma entrega ou na próxima.
- A4 (recomendado) .github/workflows/ci.yml:118 · `actionlint` não rodou em nenhuma das duas pontas (autor e review); a semântica do `predicate-quantifier: every` com negações só foi emulada (S3), não executada no Actions. Pendência para o devops (E7.597) ou para o primeiro PR com CI.

## Pendências
- CI do PR não rodou (cobrança): a primeira execução real é a prova de que os checks `skipped` liberam o ruleset; o PR deve levar o rótulo `afrouxa-regra` do dono (arquivo protegido em `.github/`).
- Observação fora do diff: o `test:trava` (com `changelog conferir`) não roda em nenhum job do `ci.yml`, embora a §9 do `praticas.md` diga que roda "dentro da suíte"; vale cartão próprio.

## Parecer
**Aprovado** no commit `06aecfda`. Os quatro achados são recomendados.
