---
tipo: review
contrato: 1
pedido: 083-pre-push-lint-alterados
branch: feature/083-pre-push-lint
commit: e19c23b3674a660cad88150b218c7897a6d77d5a
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-09
---
# Review: 083-pre-push-lint-alterados

## Parecer
Aprovado. O diff (base 54f02c42...e19c23b3) tem 99 linhas de código e teste (25 do script, 73 do teste, 1 do hook, 1 do package.json, contando adições e remoções; teto de 150 respeitado) e carrega um comportamento só.

- `scripts/lint-alterados.sh`: lista com `git diff --name-only --diff-filter=d origin/develop...HEAD -- '*.ts' '*.tsx'`, que exclui removidos; array do bash preserva caminho com espaço; sem arquivo, imprime "lint pulado" e sai 0; sem `refs/remotes/origin/develop`, avisa e executa `pnpm run lint`; usa `--cache` com `--no-warn-ignored`, então os `ignores` do `eslint.config.js` valem sem aviso.
- `scripts/lint-alterados.test.sh`: 6 casos executados por mim, todos verdes (só docs pula, só docs não chama pnpm, .ts/.tsx vão ao eslint com cache, não-ts fica fora, .ts removido não vai, sem origin/develop cai no lint inteiro). Cada um reprova o ramo que nomeia (afrouxar o filtro, tirar `--diff-filter=d` ou o fallback quebra o caso correspondente). Pnpm falso confere os argumentos literais.
- `.githooks/pre-push`: só a linha 13 mudou (`bash scripts/lint-alterados.sh && pnpm run typecheck`); typecheck, bloqueio da main e o aviso com árvore suja ficaram intactos. O `shellcheck` do hook só acusa SC2034 antigos (variáveis do `read`), fora do diff.
- Sem diff em `.github/`, `server/`, `web/` e `packages/`; a CI segue com `eslint .`. `node_modules/.cache/eslint` é ignorado pelo git.
- Devops: parecer em `docs/devops/083-pre-push-lint-alterados.md` citado, não refeito. Seu campo `commit` aponta 54f02c42 (a base) e o texto ainda diz que a troca do hook não foi aplicada, o que deixou de ser verdade. Sim: o devops-engineer deve regravar o parecer (`commit: e19c23b3...` e a seção da pendência do dono), para o `forge-check pr` não o tratar como parecer de outro patch. Não bloqueia este review.
- Segurança: sem segredo, entrada externa ou dado pessoal; os nomes de arquivo vão como argumentos, sem `eval`.

## Achados
- A1 (recomendado) docs/devops/083-pre-push-lint-alterados.md:5 · commit aponta a base 54f02c42 e a pendência do hook está desatualizada; o devops-engineer regrava com e19c23b3
- A2 (recomendado) scripts/lint-alterados.sh:17 · sem `-z`, nome com caractere que o git escapa não chega íntegro ao eslint; irreal em .ts/.tsx do projeto
