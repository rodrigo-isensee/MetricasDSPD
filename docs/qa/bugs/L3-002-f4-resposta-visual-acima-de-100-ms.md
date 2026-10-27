# L3-002 - F4 resposta visual do Operacional acima do orçamento
- Severidade: média
- Responsável sugerido: forge:react-frontend (causa não isolada)
- Ambiente: feature/026-lote3-operacionais, c72b955, Chromium, 1 e 2 workers

## Passos para reproduzir
1. `cd e2e && pnpm exec playwright test perf/perf.spec.ts:93 --retries=0 --workers=1`

## Resultado esperado
F4 p95 < 100 ms (ADR 0003).

## Resultado obtido
134,4 ms (2 workers, suíte completa) e 141,5 ms (1 worker, sozinho). Não é uma das 3 falhas do 041. Não medi a `develop` (fora do escopo), então não sei se a regressão é do lote 3 (que toca CartaoO1/O2/O7/O9/T2 e o registro) ou do ambiente.

## Evidência
`perf/perf.spec.ts:126`, `expect.soft(rv.p95, 'F4')`.
