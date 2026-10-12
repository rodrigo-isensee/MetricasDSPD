# Métricas do CI (linha de base)

Medido em 2026-10-11 sobre os últimos 20 runs do workflow `CI` (`gh run list` e `gh run view --json jobs`; duração = `startedAt` a `completedAt` do job; jobs pulados excluídos). Rotina de comparação: `praticas.md` §10.1.

| Job | Execuções | Média (s) | p95 (s) | Falhas |
|---|---|---|---|---|
| filtro | 20 | 6 | 7 | 0 |
| imagem | 20 | 23 | 30 | 0 |
| openapi | 20 | 21 | 28 | 0 |
| build | 20 | 35 | 44 | 0 |
| banco | 8 | 45 | 54 | 0 |
| rapida | 20 | 72 | 83 | 0 |
| testes | 19 | 210 | 263 | 0 |
| perf | 5 | 404 | 431 | 0 |
| e2e | 7 | 436 | 486 | 0 |

Observações
- Caminho crítico de um PR: `e2e` (~7 min), seguido de `testes` (~3,5 min). Os demais jobs rodam em paralelo.
- p95 calculado sobre amostras pequenas (5 a 20); tratar como indicativo.
- 3 runs de 20 foram cancelados pelo `concurrency` (comportamento esperado, não é falha).
- Sharding do e2e não foi adotado: uma matriz renomearia o check `e2e` (obrigatório na `main`) e cada shard repetiria os dois builds do webServer.
- Cache de camadas Docker não foi adotado: o `server/Dockerfile` faz `COPY . .` antes do install, então o cache quase nunca acertaria; o job `imagem` leva ~23 s.

## Acompanhamento semanal
| Semana | testes (média) | e2e (média) | rapida (média) | Falhas | Cache hit Playwright | Notas |
|---|---|---|---|---|---|---|
| 2026-10-11 (base) | 210 s | 436 s | 72 s | 0 | n/d (cache novo) | linha de base |
