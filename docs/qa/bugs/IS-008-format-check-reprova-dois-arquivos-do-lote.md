# IS-008 - format:check do pronto reprova dois arquivos do lote
- Severidade: média (bloqueia `pnpm run pronto`; contorno trivial)
- Responsável sugerido: react-frontend (modelo.ts) e node-backend/qualquer dev (desempenho.test.ts)
- Ambiente: fix/bugs-intensivos, HEAD be4dfb1

## Passos para reproduzir
1. `pnpm run format:check` na raiz.

## Resultado esperado
Todos os arquivos formatados.

## Resultado obtido
`[warn] web/src/features/exportar/modelo.ts` e `[warn] packages/mock/src/desempenho.test.ts`. Os dois estavam formatados em 376d997; foram alterados pelo lote (0759413/03665ff e 0fec9b5). `pnpm run pronto` aborta nessa etapa.

## Evidência
Saída do `pnpm run pronto` de 2026-10-14; `prettier --check` do modelo.ts em 376d997 passa. Correção esperada: `prettier --write` nos dois arquivos, commit `style`.
