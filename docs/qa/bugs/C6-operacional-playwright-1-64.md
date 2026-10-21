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

## Sonda S0 (2026-10-20)
Etapa E2.1 do pedido 037 (K-113), antes de qualquer código da ADR 0021. Código: worktree `MetricasDSPD-037` em 1f715e8 (difere da develop 12018de só por este arquivo de docs). Playwright 1.64.1, Chromium 156.0.8078.4, Node v24.21.0, WSL2. Sem `flock` (o hook recusa): sem processo de teste (`pgrep -fa 'playwright|vitest'`) antes de cada execução.

### 1. perf-api (a SPA só renderiza; a API gera e calcula)
Comando: `bash scripts/com-api-mock.sh bash -c 'cd e2e && E2E_API_URL=$API_URL PERF_VARIANTE=api PERF_RODADAS_C6=3 PERF_REPETICOES_C6=5 pnpm exec playwright test --project=perf-api -g "F2 CLS e C6 tarefa longa em" --reporter=list'` (nas execuções 2 e 3 o filtro limitou às 3 rotas). C6 = mediana agregada de 15 amostras, em ms; entre parênteses, p85 / máximo.

| Execução | load 1 min antes | / | /operacional (Resumo) | /operacional?cadencia=diaria |
|---|---|---|---|---|
| 1 | 2,15 | 0 (0 / 67) | 0 (54 / 77) | 0 (76 / 113) |
| 2 | 2,57 | 0 (0 / 54) | **113** (135 / 182; rodadas 115/113/91) | 0 (67 / 83) |
| 3 | 4,96 (entrou carga de outra suíte) | 0 (0 / 65) | 0 (0 / 86) | 0 (0 / 62) |

A mediana é 0 quando a maioria das cargas não tem tarefa longa (o `longtask` só conta o que passa de 50 ms). O pior caso foi a execução 2 de `/operacional`: 113 ms. Nenhuma execução teve load < 2 (meta preferida; o menor foi 2,15). Na execução 1 ainda: `/operacional?cadencia=semanal` 81 ms; `/tatico` com CLS 0,103 (F2 pede < 0,1), o que interrompeu o bloco (`/estrategico` e `/sustentacao` não rodaram). O CLS do `/tatico` não é objeto da S0 e fica para a medição E2.3.

### 2. Perfis do Chromium (Performance, com pilha) de `/operacional` no build mock
Build `web` padrão (mock), `vite preview`, 1366x768, CDP `Profiler` a 200 us, uma carga por perfil. Ficam fora do repositório, em `/tmp/claude-1000/-home-rodrigoisensee-MetricasDSPD/fcc322bd-e180-45cd-a290-9782de4f5226/scratchpad/perfil/`: `com-latencia.cpuprofile`, `com-latencia-2.cpuprofile`, `sem-latencia-1.cpuprofile`, `sem-latencia-2.cpuprofile`, mais o script `perfilar.mjs` (a latência 0 é `?latencia=0`). O profiler infla a duração (long tasks de 160 a 290 ms, contra 0 a 113 ms sem ele): vale a ordem e a atribuição, não o valor absoluto.

| Perfil | Maior tarefa | Função (minificada, papel) | Segunda maior |
|---|---|---|---|
| Latência ligada (2 cargas) | corrida contínua de 162 e 233 ms; long task de 293 e 239 ms | `it` (gerarMock, chunk `src`) com `De` (gerador do BusinessMap, 48 a 95 ms), `q` (gerador do Acelerato, 10 a 33 ms), `xe` (normalização) e `O`/`w`/`c` do chunk `modelo` (cálculo) | 96 e 113 ms: render do React (`Mf`/`Df`/`kf`/`Fd`, commit do Resumo; `Mu` e `Au` os maiores em tempo próprio) |
| Latência 0 (2 cargas) | corrida de 160 e 149 ms; long task de 160 e 175 ms | a mesma: `it` com `De` (70 a 76 ms), `_e`/`G`/`$` e `modelo` (`w`, `c`) | 104 e 71 ms: render do React |

Nos dois perfis a maior tarefa é a geração e o cálculo do mock na thread principal (`it`/`De`), não o render. A latência não muda a função (só atrasa a resposta, depois da geração); o render do React vem em tarefa separada, de 71 a 113 ms com o profiler.

### Veredito (condição de parada, proposta 037 seção 4)
Mediana do C6 do render sozinho em `/operacional` (Resumo): 0, 113 e 0 ms; o pior caso, 113 ms, fica **abaixo de 120 ms**. `/` e `/operacional?cadencia=diaria` ficaram em 0 ms (máximo individual 113 ms, abaixo de 170). **Veredito: faixa < 120 ms; o react-frontend pode começar o Web Worker da ADR 0021, sem o render fatiado.** Ressalvas: a margem do pior caso é curta (113 contra 120, com load 2,57) e nenhuma execução teve load < 2; a medição do pronto (E2.3, mediana < 150 ms nas 7 rotas) volta a olhar o render depois do Worker.
