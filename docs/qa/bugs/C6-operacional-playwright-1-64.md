# C6-operacional-playwright-1-64 - C6 de /operacional: o @playwright/test 1.64.1 do #130 explica?
- Severidade: média (alerta de portão: bloqueia o #131 na CI, sem defeito funcional)
- Responsável sugerido: forge:software-architect (K-113)
- Ambiente: main 9180c7e (worktree `MetricasDSPD-main`) × develop 12018de (worktree `MetricasDSPD-037`, mesmo conteúdo da homolog do #131); WSL2, Node v24.21.0, 2026-10-20, load médio de 1 min entre 1,9 e 2,5 durante as medições

## Passos para reproduzir
1. Em cada worktree: `cd e2e` e `pnpm exec playwright install chromium`.
2. Garantir `pgrep -fa 'playwright|vitest'` vazio (uma suíte pesada por vez).
3. `pnpm exec playwright test --project=perf -g "/operacional$" --reporter=list` (modo local do teste: 3 rodadas x 5 cargas = 15 amostras; o C6 é a mediana agregada, linha `[perf] /operacional: ... maiorTarefaLonga(mediana agregada de 15)`). O filtro pega também o teste F2 a 375x812, que não entra na comparação.
4. 5 execuções por lado, alternando os lados (main, develop, main, ...), para o ruído de máquina cair nos dois igualmente.

## Versões
| Item | main 9180c7e | develop 12018de |
|---|---|---|
| @playwright/test (e2e) | 1.64.0 | 1.64.1 |
| playwright (pacote) | 1.64.0 | 1.64.1 |
| playwright-core (`pnpm exec playwright --version`) | 1.64.0 | 1.64.0 |
| Chromium (Chrome for Testing, revisão 1248) | 156.0.8078.4 | 156.0.8078.4 |

O mesmo navegador serve aos dois lados (`~/.cache/ms-playwright/chromium-1248`): o #130 mudou só o pacote do runner (1.64.0 para 1.64.1, patch), não o Chromium nem o playwright-core.

## Medições (C6, mediana agregada de 15 amostras, ms; limite < 200)
| Execução | main (1.64.0) | develop (1.64.1) |
|---|---|---|
| 1 | 195 | 180 |
| 2 | 211 (falhou o limite) | 173 |
| 3 | 194 | 182 |
| 4 | 179 | 181 |
| 5 | 171 | 173 |
| Mediana das 5 | 194 | 180 |
| Mínimo a máximo | 171 a 211 | 173 a 182 |

Medianas por rodada (3 por execução) e p85 estão na saída de cada execução; o máximo individual de uma carga chegou a 315 ms nos dois lados.

## Resultado esperado
Se o @playwright/test 1.64.1 explicasse, o lado develop mediria acima do lado main de forma consistente, e a CI (225 ms e 208 ms) seria reproduzível na develop.

## Resultado obtido
Conclusão: **o Playwright novo não explica**.
- O lado develop (1.64.1) mediu 173 a 182 ms, sempre abaixo de 200, e não ficou pior que o main (194 de mediana, 171 a 211).
- O main, com a versão antiga, também estourou o limite uma vez (211 ms) e ficou a 195 e 194 em duas: a variação entre execuções do mesmo código é maior (40 ms) que a diferença entre os lados.
- O navegador é o mesmo (Chromium 156.0.8078.4) e o playwright-core também; só o pacote do runner mudou, em patch.
- Local, em 10 execuções, o #131 passaria em 9; a CI mediu 225 e 208 ms, ou seja, o runner está acima do local. A causa mais provável é a mesma já registrada no K-113 (188 a 215 ms): C6 está perto do limite e sensível à máquina; não há regressão atribuível ao #130 nesta medição.

## Para o forge:software-architect (K-113)
- Decidir o tratamento sem afrouxar o limite de 200 ms (ADR 0003): a opção prevista na ADR para C6 fora do orçamento é mover geração e cálculo para Web Worker atrás da `MockFonteMetricas` (linha 125); alternativa é reduzir o trabalho na carga de /operacional.
- Hipótese não testada aqui: diferença de CPU entre o runner da CI e esta estação (a CI mede 208 a 227 ms; local, 171 a 211 ms). Medir na CI com `PERF_RODADAS_C6` maior ou comparar a CPU dos runners é decisão dele.
- Não foi tocado: limite, teste de perf, #131, homolog, main.

## Evidência
Saída das 10 execuções no terminal (linhas `[perf] /operacional: CLS=0.004 maiorTarefaLonga(mediana agregada de 15)=<N> ms`); `git status --short` da worktree main vazio ao final.
