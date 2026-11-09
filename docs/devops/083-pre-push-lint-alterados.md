---
tipo: revisao-devops
contrato: 1
pedido: 083-pre-push-lint-alterados
branch: feature/083-pre-push-lint
commit: 54f02c42b51aba3355e9f0428f058113f916c4c9
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-08
---
# Review de devops: 083-pre-push-lint-alterados

## Parecer
Aprovado, com uma pendência do dono. Esta entrega traz `scripts/lint-alterados.sh` (eslint só nos `.ts`/`.tsx` alterados contra `origin/develop`, com `--cache`; sem nenhum, pula o lint; sem `origin/develop`, cai em `pnpm run lint`), seu teste `scripts/lint-alterados.test.sh` (6 casos, pnpm falso, repositório descartável) e o registro do teste em `test:trava` no `package.json`. `bash scripts/lint-alterados.test.sh` sai com os 6 casos verdes.

Causa do caso que falhava (".ts/.tsx alterados vão ao eslint com cache"): o script estava certo; a asserção esperava `velho.ts` antes de `dir com espaco/novo.tsx`, mas o `git diff --name-only` ordena por caminho e lista `dir com espaco/novo.tsx` primeiro. O caminho com espaço chega íntegro ao eslint (um argumento por arquivo, array no bash). Corrigida a ordem na asserção.

### Pendência do dono (R-CONFORMIDADE): troca em `.githooks/pre-push`
A troca NÃO foi aplicada: `.githooks/` é do dono. Até ela, o hook continua com `pnpm run lint` inteiro e o ganho do pedido não existe. Diff a aplicar (linha 13):

```diff
-if ! { pnpm run lint && pnpm run typecheck; } >&2; then
+if ! { bash scripts/lint-alterados.sh && pnpm run typecheck; } >&2; then
```

O restante do hook (bloqueio da `main`, tratamento de árvore suja, Siegard) fica igual. O push só deve sair depois dessa troca.

## Achados
- `scripts/lint-alterados.sh:17` · `git diff --name-only` sem `-z` quebra nomes com quebra de linha ou caracteres que o git escapa entre aspas (ex.: acentos sem `core.quotepath=off`); o espaço funciona · irreal em `.ts`/`.tsx` do projeto · recomendado
- `scripts/lint-alterados.sh:8` · a base é `origin/develop` fixa; numa branch cuja base é `homolog` o conjunto alterado inclui o que já está na `homolog` e não na `develop`, só aumentando o lint, nunca pulando erro · sem ação · recomendado
- Typecheck segue inteiro (fora do escopo do pedido), e a CI segue com `eslint .` inteiro: o hook mais curto não afrouxa o portão.

Ferramentas: `shellcheck` usado (SC2164 do `cd` corrigido com `|| exit 1`; sem outros avisos); `actionlint` não se aplica (nada em `.github/`).

## Custo e rollback
Sem minutos de CI nem recurso novo (`R-CUSTO`); nada em `.github/`. Rollback: o dono reverte a linha 13 do hook para `pnpm run lint`; os scripts ficam inertes sem a troca.
