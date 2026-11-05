Agente destino: forge:tech-lead
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: review   Cobre: E1.4

## Objetivo
Code review do 065 (BLOQUEADOS e O5 fora do mapa real; parte de bloqueio do O1 e do O2 como Sem dado real), depois de commitar o parecer de interface (pedido 065, E1.4, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`, ponta ae729b2.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 1f1da673b0fbb8210f2cd5cae5c3a4525afff901 origin/feature/065-bloqueados` e o desenho `/home/rodrigoisensee/MetricasDSPD-052d/docs/analises/065-desenho.md`; o parecer de interface `/home/rodrigoisensee/MetricasDSPD-052d/docs/ux/065-revisao-bloqueados.md` (sem commit).

## Entregar
- "E1.4 (tech-lead): code review." (E1.4)
- (E1) (E2) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/065-bloqueados`; commit só de `docs/ux/065-revisao-bloqueados.md` com `git -C /home/rodrigoisensee/MetricasDSPD-052d add -N docs/ux/065-revisao-bloqueados.md` e `git -C /home/rodrigoisensee/MetricasDSPD-052d commit --only -m <mensagem com Cartão: K-205> -- docs/ux/065-revisao-bloqueados.md`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; anote a ponta; review nessa ponta: mapa real e motivos (BLOQUEADOS e O5), null nunca 0 no O1, nota no O1 e no O2, contrato e docs/api, versão de critério T2.6, testes C, S e W, e se o A1 e o M1 do UX ficaram resolvidos pelo O5 inteiro sem dado (M2 e B1 a B3 também); vitest do server e do web com no máximo 2 workers; parecer em `docs/reviews/065-bloqueados.md` pela ferramenta Write com `commit:` = a ponta anotada, veredito e achados de até 300 caracteres; commit só do parecer; push; sem PR. Achado bloqueante vai ao parecer, sem corrigir código.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- 2026-11-04 09:04: E1.7 cumprida pelo ux-designer: aprovado com ressalvas, sem commit na 052d (docs/ux/065-revisao-bloqueados.md, commit: 2050521): A1 alto, o Como se calcula e o O que é do O5 (web/src/features/complementares/notas.ts:44-46) seguem dizendo sem fila nem bloqueio e Não-execução = fila + bloqueio, e o percentual pode estar inflado (depende da Q-065-1); médios M1 (leitura do O5 diz o restante é fila) e M2 (nota em text-xs longe do gráfico); baixos B1 a B3 (repetições e motivo técnico). Conferente: entrega do back e do front não cumpriu só por forma: os briefs node-backend-1 e react-frontend-1 reprovam hoje no forge-check por não citar a E1.7, criada depois da aprovação deles; PQ-1, escopo pela união (17 arquivos), base e etapa ok. DECISÃO TÉCNICA (Jarvis): a conferência factual das entregas vale; gravo a conferida em 2050521; a Q-065-1 sobe na fila (bloqueia o texto do O5 e o A1 do UX) e o PR 213 espera, porque não trava nada; review e QA esperam a resposta. MELHORIA: etapa nova no pedido invalida brief já aprovado no gate (forge-check deveria julgar pelo pedido da aprovação).
- 2026-11-04 10:26: volta 1 do front entregue pelo react-frontend: ae729b2 (push ok): CartaoO5 sem a lógica parcial, o cartão inteiro usa o estado Sem dado real do servidor; W4 prova o O5 inteiro sem dado; web 1425 verdes, typecheck e lint limpos. DECISÃO TÉCNICA (Jarvis): E1.4 com o tech-lead: commit do parecer de interface (que viu 2050521, antes da decisão B) e review do lote na ponta seguinte, avaliando se o A1 e o M1 do UX ficaram resolvidos pelo O5 inteiro sem dado; a conferência das voltas sai pela união dos briefs, em paralelo.
- O agente não abre, lê nem edita arquivos `.env*`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes; test:pg e pronto ficam com o dono.
- O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: código, testes, outros documentos, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --format=%H -1 origin/feature/065-bloqueados -- docs/reviews/065-bloqueados.md` · espera: linhas=1
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --format=%H -1 origin/feature/065-bloqueados -- docs/ux/065-revisao-bloqueados.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).