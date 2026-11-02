# 052-SR-001 - `format:check` reprova origem.ts e origem.test.ts e o `pnpm run pronto` sai vermelho
- Estado: FECHADO (E2.127, commit 1f821a0; revalidado pelo QA na E2.128: `pnpm run pronto` rc 0, `format:check` ok)
- Severidade: média (bloqueia o pronto e o envio; correção mecânica, sem efeito em comportamento)
- Responsável sugerido: node-backend
- Ambiente: `feature/052-sust-real`, commit 671e8d718c5f2a0f161af60fe4ce05eaaecb9426 (e a ponta 0f38ab6, só documento depois dele); Linux/WSL, pnpm

## Passos para reproduzir
1. Na raiz da worktree: `pnpm run pronto`.
2. Ou só: `pnpm exec prettier --check packages/contratos/src/origem.ts packages/contratos/src/origem.test.ts`.

## Resultado esperado
Prettier sem aviso; `pnpm run pronto` com rc 0.

## Resultado obtido
rc 1 em `format:check`:
```
[warn] packages/contratos/src/origem.test.ts
[warn] packages/contratos/src/origem.ts
[warn] Code style issues found in 2 files. Run Prettier with --write to fix.
```
`prettier` quer quebrar em duas linhas as três constantes `MOTIVO_AGUARDANDO_CAMPO_CHAMADO`, `MOTIVO_S9_MOTIVO_PENDENCIA` e `MOTIVO_S12_REGISTRO_POSTERIOR` (`origem.ts:35-37`) e o `toBe(...)` do S12 (`origem.test.ts:36`). Os dois arquivos entram no delta da E2.115 e da E2.117; o autor não rodou o pronto completo (o review já registrava isso).

## Evidência
Saída acima, do `pnpm run pronto` e do `prettier --check`; `prettier` sobre os dois arquivos mostra só essas quebras de linha. As demais etapas do pronto (lint, trava, `pnpm -r run pronto`) passam.

## Correção
`pnpm exec prettier --write packages/contratos/src/origem.ts packages/contratos/src/origem.test.ts`, commit, e novo `pnpm run pronto`.
