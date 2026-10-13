# Medição do F4 antes e depois do FIL-04

Pergunta: o F4 (resposta visual ao trocar filtro, limite 100 ms, ADR 0003) piorou com a correção do `FiltroMulti` (91a878d)?

## Método
- Modo mock, projeto `perf`, teste "F3 INP, F4 e F5 na troca de filtro" (`e2e/perf/perf.spec.ts`), n=20 trocas por rodada, build de produção em `vite preview`, Chromium.
- Antes: `91a878d^` (354072c). Depois: `origin/develop` (953e1e8; inclui 91a878d e mais três commits sem relação com o filtro).
- 5 rodadas por lado, em worktree temporária (removida), com `flock /tmp/metricas-pesado.lock`.
- Load (1 min) antes de cada rodada. Antes: 1,81 / 2,59 / 2,97 / 3,58 / 3,29 (as rodadas 4 e 5 passaram de 3; o aumento veio das próprias rodadas e do build, a máquina estava ociosa no início, sem aborto). Depois: 1,93 / 2,72 / 2,97 / 2,92 / 2,61 (com espera automática se load >= 3).

## Resultados (ms)
| Rodada | Antes mediana | Antes p95 | Depois mediana | Depois p95 |
|---|---|---|---|---|
| 1 | 130,0 | 309,6 | 121,6 | 171,5 |
| 2 | 80,7 | 221,4 | 138,6 | 185,1 |
| 3 | 110,1 | 155,5 | 141,2 | 285,6 (n=19) |
| 4 | 80,2 | 92,9 | 83,5 | 102,6 |
| 5 | 83,7 | 103,6 | 75,7 | 109,4 |
| Mediana das 5 | 83,7 | 155,5 | 121,6 | 171,5 |

## Conclusão
- Os dois lados reprovam o limite de 100 ms na maioria das rodadas, inclusive antes do FIL-04: a reprovação não nasceu com ele.
- A dispersão entre rodadas do mesmo lado (mediana 80 a 130 ms; p95 93 a 310 ms) é maior que a diferença entre os lados. As faixas se sobrepõem, e as rodadas 4 e 5 dos dois lados ficam em 76 a 84 ms de mediana e 93 a 109 ms de p95.
- A mediana das medianas é maior depois (121,6 contra 83,7), puxada pelas rodadas 1 a 3, mas as rodadas 4 e 5 mostram o contrário na rodada 5 e empate na 4. Com 5 rodadas e esse ruído, não há evidência de regressão atribuível ao `FiltroMulti`. Resultado: ruído (a máquina não ficou estável o bastante, load 2 a 3,6, e o teste sofre com CPU compartilhada), com a ressalva de que uma pequena piora (algumas dezenas de ms nas medianas) não pode ser descartada.
- Para decidir de vez: repetir com load < 1,5 de ponta a ponta, 10 ou mais rodadas intercaladas (antes/depois alternados) e descartar a primeira rodada de cada build. Sem correção de código nesta tarefa.
