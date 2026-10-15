# SNO-005 - Primeira consulta de cada fonte depois de subir a API passa de 300 ms (A1 fria)
- Status: **fechado** em d76947b (2026-10-15), corrigido por 59dedb5 e 19c5cf9 e verificado pelo QA.
- Severidade: baixa (pré-existente; a demanda herda, não cria)
- Responsável sugerido: node-backend (pré-aquecimento da base em memória na subida, risco R2 do plano)
- Ambiente: worktree `/home/rodrigoisensee/MetricasDSPD-sust`, aberto em 67624ba; API real com Postgres do Compose e seed de 24 meses (`MOCK_MESES_HISTORICO=24`); máquina com carga de 5 a 7 (outros agentes rodando)

## Passos para reproduzir
1. Subir a API (`scripts/com-api-mock.sh`).
2. Medir a primeira chamada de qualquer métrica (`curl -w %{time_total} -H 'cache-control: no-cache' $API_URL/api/v1/metricas/<id>`).

## Resultado esperado
A1 da ADR 0003: p95 menor que 300 ms.

## Resultado obtido (na abertura)
A primeira chamada de cada fonte carregava a base em memória e levava de 112 ms a 741 ms sob carga, independente da métrica; a segunda e a terceira, 1 a 8 ms. O `perf-api` reprovava pela rota `/` (p95 = 626 e 741 ms) e, numa execução, pela "A1 isolada fria" (585 ms).

## Verificação do fechamento (QA, HEAD d76947b)
Correção: `aquecer()` carrega as duas bases e calcula as 52 métricas com a chave de cache da rota, no `onReady`, antes do `listen` (59dedb5). A espera é limitada a 5 s (`PRAZO_ESPERA_AQUECIMENTO_MS`), abaixo do `pluginTimeout` de 10 s do Fastify (19c5cf9, V6-1); o log de falha só leva a classe do erro (V6-2).

Medido contra o Postgres do Compose, seed de 24 meses, `perf-api` completo, `PERF_REPETICOES_A1=10`:
| Medida | Antes (aberto) | Depois (HEAD) |
|---|---|---|
| `perf-api` | reprovava (`/` com p95 626 e 741 ms) | **23 de 23 passaram** |
| A1 a frio, rota `/` (Visão geral), n = 10 | p95 626 a 741 ms | p95 15 ms (máx. 15 ms) |
| A1 isolada fria, 16 ids | 585 ms (máx. 1.506 ms numa amostra) | p95 15 ms (máx. 15 ms); quente p95 14 ms |
| A1 no navegador, geral (n = 460) | 44 a 52 ms | p95 20 ms |
| Tempo de subida (`listen`, com o aquecimento de 52 métricas) | n/a | 1.120 ms (log "aquecimento concluído": 1.111 ms, `falhas: []`) |

Subida com o banco inalcançável (entrada real `src/entradas/api.ts`, mock, sem tocar no Postgres compartilhado):
- Conexão recusada (porta 5999): a API aceita conexões 780 ms depois do início, registra "aquecimento falhou; a primeira consulta carrega a base" e `/health` responde 503 (certo: o banco está fora).
- Host que não responde (10.255.255.1, pacotes descartados): a porta aceita conexões **6,1 s** depois do início do processo (cerca de 1 s de partida do `tsx` mais o prazo de 5 s), registra "aquecimento não terminou no prazo; a API sobe e ele continua em segundo plano" e depois "aquecimento falhou". Não há `FST_ERR_HOOK_TIMEOUT`.

Memória: o RSS do processo do teste não serve como número da API, porque o harness semeia o banco no mesmo processo. O que se mede é o custo do aquecimento: com `--expose-gc`, **+56 MB de RSS (312 para 368 MB; heap de 41 para 83 MB)** depois de aquecer, sem a base de semeadura liberada. Pico do processo com harness: 449 MB. O RSS da API isolada contra uma base real fica para a homolog (limite do container: 384 MB).

Prova do vermelho: o `perf-api` reprovava no código anterior (valores acima, três execuções do parecer); o teste de unidade do V6-1 (banco lento com temporizador falso) reprova o código sem o prazo, conforme o review da volta 7. A medição pós-coleta (V6-5) segue sem cartão e não faz parte deste bug.
