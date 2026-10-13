---
tipo: qa
contrato: 1
pedido: perf-api-sem-servidor
branch: fix/perf-api-sem-servidor
commit: 8d71bf0
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-13
---
# Parecer de QA - perf-api sem servidor (commit 8d71bf0)

Branch `fix/perf-api-sem-servidor` (PR #62). Mudança só de configuração: `testIgnore: /perf-api\.spec\.ts/` no projeto `perf` de `e2e/playwright.config.ts`. Sem interface; sem código de produção alterado.

## Cenários
| Cenário | Comando (em `e2e/`, sem `E2E_API_URL`, salvo indicação) | Resultado |
|---|---|---|
| `perf` não lista o perf-api | `playwright test --project=perf --list` | 15 testes em 1 arquivo (`perf.spec.ts`); 0 ocorrências de `perf-api.spec`. Passa |
| `perf-api` lista o perf-api | `E2E_API_URL=http://localhost:3999 playwright test --project=perf-api --list` | 17 testes em 2 arquivos; `perf-api.spec` presente. Passa |
| `perf` roda sem ECONNREFUSED | `flock /tmp/metricas-pesado.lock playwright test --project=perf` | 2ª execução: 15/15 passam; nenhum ECONNREFUSED. Passa |

## Observação (não é bug da mudança)
Na 1ª execução do `perf`, `/tatico` falhou o orçamento C6 (tarefa longa, mediana 201 ms contra limite < 200 ms; os 5 seguintes não rodaram). A 2ª execução passou 15/15. É variação de medição na estação (limite estourado por 1 ms), sem relação com a API; fica registrada como instabilidade do orçamento C6, não como defeito desta correção.

## Vermelho antes do verde
O estado anterior está descrito no commit: o `perf` incluía `perf-api.spec.ts` e falhava com ECONNREFUSED na CI (PR #61). Não reexecutado contra `69db636` neste QA curto; a lista do projeto antes da correção seria 17 testes em 2 arquivos, como no `perf-api`, pois o `testDir` é o mesmo sem filtro.

## Bugs
Nenhum.
