# IS-007 - Teste de desempenho C5 (heap JS) nunca mede: imprime "NaN MB" e anota "ok"
- Severidade: baixa (item de alerta do orçamento sem medição; sem efeito no produto)
- Responsável sugerido: qa-engineer (código de teste `e2e/perf/perf.spec.ts`, teste "C5 heap JS após abrir todos os painéis")
- Ambiente: main 0af552a, build de produção (`vite preview`), Chromium headless shell 1248 do Playwright 1.64, 1366x768

## Passos para reproduzir
1. `cd e2e && pnpm run test:perf`.
2. Ler a linha do C5 na saída.

## Resultado esperado
O heap JS usado depois de abrir todos os painéis, em MB, comparado ao alerta de 150 MB (ADR 0003, C5).

## Resultado obtido
`[perf] C5 heap após todos os painéis: NaN MB (alerta > 150 MB)` e a anotação `alerta-C5` diz `ok: NaN MB` (porque `NaN > 150` é falso). O teste passa sem medir nada.

Causa: o teste chama `Performance.getMetrics` pelo CDP sem antes chamar `Performance.enable`; sem o domínio habilitado a lista volta vazia, `JSHeapUsedSize` não existe e o valor cai no `Number.NaN` do `?? Number.NaN`. Sonda feita pelo QA (script fora do repositório, mesma build, mesmas rotas): sem `Performance.enable`, `getMetrics` devolve 0 métricas; com `Performance.enable`, o heap depois de abrir Visão geral, Operacional (diária e semanal), Tático, Estratégico e Sustentação e coletar o lixo é **30,1 MB** (dentro do alerta de 150 MB).

## Evidência
Saída do `pnpm run test:perf` em 2026-10-13 19:27 (load 1 min 4,89): `[perf] C5 heap após todos os painéis: NaN MB (alerta > 150 MB)` / `✓ 9 [perf] › perf/perf.spec.ts:134:3 › perf › C5 heap JS após abrir todos os painéis (alerta < 150 MB)`. Sugestão: `await cdp.send('Performance.enable')` antes do `getMetrics` e falhar o teste quando o valor não for finito (medição ausente não é "ok").

Correção: 838f774
