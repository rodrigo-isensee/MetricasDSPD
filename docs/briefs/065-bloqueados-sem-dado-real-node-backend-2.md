Agente destino: forge:node-backend
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: codigo   Cobre: E1.2

## Objetivo
Volta 1 do 065 pela decisão B do dono: o O5 inteiro sai do mapa real e responde Sem dado real (pedido 065, E1.2, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`, ponta 2050521.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/analises/065-desenho.md`; `packages/contratos/src/origem.ts`, `server/src/modulos/metricas/parte-sem-dado.ts` e os testes do 065 em `/home/rodrigoisensee/MetricasDSPD-052d`.

## Entregar
- "E1.2 (node-backend): implementação no server e testes." (E1.2)
- (E1) (E2) (E1.2) `git -C /home/rodrigoisensee/MetricasDSPD-052d branch --show-current` deve dar `feature/065-bloqueados`; `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/065-bloqueados`; O5 sai de METRICAS_ORIGEM_REAL com motivo próprio pela falta de bloqueios coletados (como BLOQUEADOS); a parte parcial do O5 (null em horasBloqueio e a nota no O5) sai do server; O1 e O2 continuam como estão; testes ajustados; a versão de critério T2.6 passa a citar também o O5 inteiro; atualizar `/home/rodrigoisensee/MetricasDSPD-052d/docs/analises/065-desenho.md` com a decisão B; vitest com no máximo 2 workers; commits com `Cartão: K-205`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados` (se o pre-push barrar pelo web, pare e relate); sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- 2026-11-04 09:04: E1.7 cumprida pelo ux-designer: aprovado com ressalvas, sem commit na 052d (docs/ux/065-revisao-bloqueados.md, commit: 2050521): A1 alto, o Como se calcula e o O que é do O5 (web/src/features/complementares/notas.ts:44-46) seguem dizendo sem fila nem bloqueio e Não-execução = fila + bloqueio, e o percentual pode estar inflado (depende da Q-065-1); médios M1 (leitura do O5 diz o restante é fila) e M2 (nota em text-xs longe do gráfico); baixos B1 a B3 (repetições e motivo técnico). Conferente: entrega do back e do front não cumpriu só por forma: os briefs node-backend-1 e react-frontend-1 reprovam hoje no forge-check por não citar a E1.7, criada depois da aprovação deles; PQ-1, escopo pela união (17 arquivos), base e etapa ok. DECISÃO TÉCNICA (Jarvis): a conferência factual das entregas vale; gravo a conferida em 2050521; a Q-065-1 sobe na fila (bloqueia o texto do O5 e o A1 do UX) e o PR 213 espera, porque não trava nada; review e QA esperam a resposta. MELHORIA: etapa nova no pedido invalida brief já aprovado no gate (forge-check deveria julgar pelo pedido da aprovação).
- 2026-11-04 10:04: DECISÃO TÉCNICA (Jarvis): volta 1 do 065 pela decisão B: o node-backend tira o O5 do mapa real com motivo próprio (como BLOQUEADOS) e remove a parte parcial do O5 (null e nota), com testes e o desenho atualizado; depois o react-frontend tira o tratamento parcial do O5 no web (o estado Sem dado real do cartão inteiro já existe) e os testes; o A1 e o M1 do UX ficam resolvidos pelo cartão inteiro sem dado; M2 e B1 a B3 do UX ficam para o review avaliar.
- O agente não abre, lê nem edita arquivos `.env*`.
- Regras invioláveis do CLAUDE.md: todo cálculo pela biblioteca compartilhada; mudança de critério registrada com data (T2.6).
- O web fica para o react-frontend; não mexa em `web/`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: `web/`, a ADR 0026, o parecer de interface sem commit, outros documentos, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052d/server && pnpm exec vitest run --maxWorkers=2 --coverage tests` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --oneline 205052155dae9ff2e1465841130c197967b3a4d7..HEAD` · espera: linhas>=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).