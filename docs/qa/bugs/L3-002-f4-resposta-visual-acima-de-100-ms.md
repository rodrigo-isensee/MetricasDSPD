# L3-002 - F4 resposta visual do Operacional acima do orçamento
- Severidade: média
- Status: resolvido (reteste QA 2026-10-28, 15ad62a)
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

## Reteste (2026-10-28, head 15ad62a)
Pela regra nova da ADR 0003 (primeira medição fora do p95, n >= 20): F4 n=20 em 40 trocas, mediana 37,4 ms, p95 44,1 ms (limite 100 ms). Primeira medição a frio, reportada à parte: 131,5 ms (informativa). As leituras de 134 a 141 ms eram pela regra antiga. Sem regressão na branch, então a develop não precisou ser medida. Resolvido.
