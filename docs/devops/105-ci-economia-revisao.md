---
tipo: revisao-devops
contrato: 1
pedido: 105-ci-economia-revisao
branch: ci/105-ci-economia
commit: 06aecfda01fb7ee2981a4ce4f11309ac8a24ef15
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-17
---
# Review de devops: CI que gasta menos minutos (E7.597)

Aprovado, sem defeito provado nem gatilho de segurança. Escopo: `git diff origin/develop...06aecfda -- .github/workflows/ci.yml` (63 linhas), mais `changelog.d/ci-105-ci-economia.md` e a nota do autor `docs/devops/105-ci-economia.md`, lidos por diff. Sem workflow rodado e sem CI verde afirmado: o CI está parado por cobrança, e a suíte inteira fica para o CI do PR.

## O que conferi
- **Checks exigidos (nove, `docs/engineering/fluxo-homologacao.md:202`: `rapida`, `testes`, `build`, `e2e`, `filtro`, `banco`, `openapi`, `imagem`, `seguranca`).** Nenhum job foi renomeado nem removido. Os jobs pulados por `if` no nível do job ficam `skipped`, que o GitHub trata como sucesso no check exigido; `testes` e `e2e` rodam sempre. Se o `filtro` falhar, ele próprio (exigido) bloqueia, e o `e2e` falha porque `PESADO` vem vazio. A leitura da proteção (`gh api .../branches/develop/protection` e `/rulesets`) devolveu 403 (plano do repositório), então a lista vem da documentação, não da API: lacuna registrada.
- **Classificação "só documento".** Testei as quatro globs do passo `d` (`predicate-quantifier: every`) com o picomatch 4.0.7 do checkout principal: `docs/**/*.md`, `.md` da raiz e `changelog.d/**` saem como documento; `.json` e `.yaml` de `docs/` (fontes, snapshots, `docs/api`), `web/README-dev.md`, fixtures `.md` fora de `docs/` e `server/**` contam como código. É conservador no sentido certo. Os testes que leem `.md` usam fixtures embutidas (`tools/docs-contratos`, `tools/spec-check`), em caminhos de código. O que lê `docs/**/*.md` de verdade é `docs:check` e `spec:check`, que seguem no `testes` com `pesado=false`. O `rapida` (lint, `format:check`, typecheck) roda sempre.
- **Release e portão intactos.** `pesado=false` só em `pull_request` com base diferente de `homolog` e `main`, ou `push` em `develop`. PR para `homolog` ou `main`, push em `homolog`, `schedule` e `dispatch` rodam inteiros. `homolog.yml`, `homolog-aprovada.yml` e `homolog-reavalia.yml` não foram tocados.
- **Push em `main` deixa de disparar o CI.** Sem perda de portão: a `main` só recebe PR da `homolog`, que passa pelo `homolog.yml` e pelo `homolog-aprovada`, e o hotfix tem o CI no PR (base `main`, `pesado=true`). O `schedule` continua na `main` (branch padrão). Fica sem prova apenas o commit de merge pós-PR, que só difere do candidato se a `main` tiver andado (hotfix).
- **Sem afrouxamento (`R-VERIFY`, `R-CUSTO`).** Nenhum `continue-on-error`, retry, `[skip ci]` ou check desligado novo; custo novo zero. O agregador `e2e` aceita `skipped` apenas com `pesado=false`; em `pesado=true`, pulado ou cancelado falha (`R-REVIEW`, J11). Entrada não confiável (`github.base_ref`, `ref_name`, saída do filtro) passa por `env`, não por `run:`. `permissions`, `timeout-minutes` e ações fixadas por SHA preservados; nenhuma ação nova (a mesma `dorny/paths-filter` já fixada, segunda instância).
- **Arquivo protegido:** o PR precisa do rótulo `afrouxa-regra` do dono (catraca), como a nota do autor já avisa. Rollback: reverter o commit.

## Achados (nenhum bloqueia)
1. **`recomendado`, média: a renderização dos diagramas Mermaid deixa de rodar em PR só de documento.** O `docs:mermaid` (mermaid-cli com Chromium) está dentro do `e2e-parte` 1 (`ci.yml:257`), que agora é pulado com `pesado=false`. O `docs:check` valida só a estrutura (título, legenda, até 15 nós; `verificar-docs.ts:189`), não a sintaxe. Um `.md` de `docs/` com Mermaid inválido chega à `develop` e só aparece na próxima rodada inteira (release). Correção mínima: aceitar o risco, já que o diagrama quebrado em documento não afeta código, ou manter o `docs:mermaid` quando o PR altera `docs/**/*.md` (custa o container do Playwright). Esforço P. Dono: devops, com decisão do dono sobre o custo.
2. **`informativo`: a economia no push em `develop` tende a ser pequena.** Sem `base`, o `dorny/paths-filter` compara a `develop` com a branch padrão (`main`), então o diff acumulado da `develop` quase sempre inclui código e o `pesado` fica `true`. O resultado é seguro (nunca pula a mais), só economiza menos do que a nota estima para esse caso. O ganho garantido é o corte do push duplicado em branch de trabalho. Para medir de verdade no checkpoint da release (`gh run list`).
3. **`informativo`: `testes` agora depende do `filtro`.** Soma ao tempo de parede o do `filtro` (checkout e dois filtros, limite de 5 min) no caminho do `testes`, em troca do `pesado`. Se o `filtro` quebrar, o `testes` fica `skipped`, mas o `filtro` exigido barra o merge.

## Lacunas
- `actionlint` ausente do PATH (só `shellcheck`): workflow não validado por ele; o autor validou o YAML com `yaml.safe_load`.
- `pnpm run pronto` não rodou nesta worktree: o hook `R-CONFORMIDADE` impede o devops de executar `pnpm install` e não há `node_modules`. A mudança toca só YAML de workflow e notas; a suíte é do CI do PR e do PQ do autor.
- Proteção da `develop` e rulesets ilegíveis pela API (403).
