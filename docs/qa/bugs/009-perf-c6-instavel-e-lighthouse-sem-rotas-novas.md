# 009 - Perf C6 instável e Lighthouse sem /preferencias e /dados
- Severidade: média
- Responsável sugerido: react-frontend (orçamentos e config do Lighthouse em `e2e/`); investigar tarefa longa
- Ambiente: develop 2193c78, Chromium headless local (WSL2), Docker ativo em paralelo

## Passos para reproduzir
1. `pnpm run test:perf` na suíte completa.
2. Ver `/estrategico` em "F2 CLS e C6 tarefa longa".
3. `pnpm run lighthouse` e conferir as URLs (`e2e/lighthouse/lighthouserc.cjs`, lista `rotas`).

## Resultado esperado
C6 < 200 ms de forma estável; Lighthouse cobre todas as rotas, incluindo `/preferencias` e `/dados`.

## Resultado obtido
- 1ª execução: tarefa longa 244 ms em /estrategico (falhou). 3 repetições isoladas: 126 a 172 ms (passaram). Margem pequena, flaky sob carga.
- Lighthouse só audita 6 rotas; as duas novas ficaram fora (auditadas manualmente por QA, sem avisos).
- Aviso de CLS 0,121 em `/` (limite 0,1).

## Evidência
Falha: "Error: C6 tarefa longa, Expected: < 200, Received: 244" em `e2e/perf/perf.spec.ts:66`.
