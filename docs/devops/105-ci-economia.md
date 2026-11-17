# CI que gasta menos minutos (E7.594)

Nota do devops-engineer, branch `ci/105-ci-economia` (o parecer formal vem no review da entrega).

- **O que muda (`.github/workflows/ci.yml`):** `on.push` limitado a `develop` e `homolog`; o job `filtro` ganha o passo `pesado` (só documento = todo arquivo alterado é `.md` em `docs/`, `.md` da raiz ou `changelog.d/`). Com `pesado=false` (PR para `develop` ou push em `develop`), `build`, `openapi`, `imagem` e `e2e-parte` são pulados, e `testes` pula typecheck e cobertura mas mantém `spec:check` e `docs:check`.
- **Por que assim:** job pulado por `if` conta como sucesso nos checks exigidos, então nenhum fica pendente; `testes` roda sempre (confere documento). O agregador `e2e` só aceita `skipped` quando `pesado=false`. JSON de `docs/` (fontes, snapshots, `docs/api`) é lido pelo código e conta como código. Release (PR para `homolog` ou `main`), push em `homolog`, schedule e dispatch rodam inteiros; `homolog.yml`, `homolog-aprovada` e a rodada noturna não foram tocados.
- **Economia estimada** (medição de `105-k405-diagnostico.md`, seção 6): até 820 min em push de branch de trabalho duplicando o PR, e parte dos 317 min de branches só de documento (a suíte inteira cai para install + `docs:check`). Estimativa, a medir no checkpoint da release.
- **Custo e rollback:** custo zero (`R-CUSTO`). Rollback: reverter o commit. Arquivo protegido: o PR pede o rótulo `afrouxa-regra`. Lacuna: `actionlint` ausente do PATH, não executado (YAML validado com `yaml.safe_load`).
