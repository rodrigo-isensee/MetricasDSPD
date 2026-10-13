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

## Status: CORRIGIDO (2026-10-12)
- Lighthouse já cobre `/preferencias` e `/dados`; CLS de `/` corrigido em e7080e1.
- C6: o teste (`e2e/perf/perf.spec.ts`) usa a mediana de 5 cargas por rodada e, se a rodada passa de 200 ms, repete até 3 rodadas (`PERF_RODADAS_C6`) e vale a melhor mediana. **Revisado em 2026-10-12 (code review do K-036, I-4):** o critério "melhor de 3" afrouxava a proteção (uma regressão intermitente passava com cerca de 69% de chance). Agora vale a **mediana agregada de todas as amostras** (rodadas x 5 cargas, sem repetir até passar); o `resultado.json` traz as medianas por rodada e o p85 agregado; na CI `PERF_RODADAS_C6=1` (runner exclusivo); localmente o perf roda sob o `flock /tmp/metricas-pesado.lock`. Limite inalterado (200 ms) e teste ligado. Antes dessa mudança, 2 de 3 execuções seguidas falharam sob carga (medianas de 346 e 307 ms em rodadas inteiras); depois, 3 execuções seguidas verdes (6 de 6 rotas cada).
