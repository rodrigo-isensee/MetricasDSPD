# SNO-005 - Primeira consulta de cada fonte depois de subir a API passa de 300 ms (A1 fria)
- Severidade: baixa (pré-existente; a demanda herda, não cria)
- Responsável sugerido: node-backend (pré-aquecimento da base em memória na subida e após cada carga, risco R2 do plano)
- Ambiente: worktree `/home/rodrigoisensee/MetricasDSPD-sust`, HEAD 67624ba; API real com Postgres do Compose e seed de 24 meses (`MOCK_MESES_HISTORICO=24 bash scripts/com-api-mock.sh ...`); máquina com carga de 5 a 7 (outros agentes rodando)

## Passos para reproduzir
1. Subir a API (`scripts/com-api-mock.sh`).
2. Medir a primeira chamada de qualquer métrica (`curl -w %{time_total} -H 'cache-control: no-cache' $API_URL/api/v1/metricas/<id>`).

## Resultado esperado
A1 da ADR 0003: p95 menor que 300 ms.

## Resultado obtido
A primeira chamada de cada fonte carrega a base em memória e leva de 112 ms a 741 ms sob carga, **independente da métrica**; a segunda e a terceira levam 1 a 8 ms.

| Ordem das chamadas (API recém-subida) | 1ª chamada | 2ª | 3ª |
|---|---|---|---|
| VISAO_GERAL, O1, TENDENCIA_SUST | 459 ms (VISAO_GERAL) | 1 ms | 1 ms |
| O1, VISAO_GERAL, TENDENCIA_SUST | 259 ms (O1); VISAO_GERAL 310 ms; TENDENCIA_SUST 8 ms | 3 ms | 1 ms |
| TENDENCIA_SUST, O1, VISAO_GERAL | 167 ms (TENDENCIA_SUST); O1 224 ms; VISAO_GERAL 113 ms | 1 ms | 1 ms |

O `perf-api` (A1 no navegador, n = 10 por rota) reprova só pela rota `/` (Visão geral, que roda primeiro): p95 = 626 ms e 741 ms nas duas execuções com carga alta, porque com n = 10 o p95 é a própria amostra fria. Todas as demais rotas ficam abaixo de 300 ms (Resumo 68 a 132 ms, Sustentação 46 a 48 ms, Semanal 40 a 67 ms, Diária 6 a 7 ms, Tático 44 a 57 ms, Estratégico 14 a 26 ms; p95 geral 48 a 52 ms). Na execução 3 a "A1 isolada fria" também reprovou (p95 585 ms, uma amostra).

## Evidência
`/tmp/claude-1000/a1b-perf.log`, `a1c-perf.log` e `frio.log` (excertos no parecer, seção A1/A2). `e2e/perf-results/resultado-api.json` (não versionado).

## Decisão de QA
Não bloqueia. Cobre também o CT-77 (carga posterior à coleta, evidência). Repetir a medição com a máquina ociosa antes de qualquer decisão sobre a meta.
