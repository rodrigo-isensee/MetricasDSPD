Agente destino: forge:tech-lead
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: review   Cobre: E1.4

## Objetivo
Commitar a formatação pendente do fluxo.tsx e regravar o review do 065 com o delta desde 21fffba (pedido 065, E1.4, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`, ponta e8eedda.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d status --short` (só `web/src/features/complementares/fluxo.tsx` modificado); `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 21fffba71a7d6e9133fdf4d97a417b0ab58d1159 origin/feature/065-bloqueados`; o seu parecer `/home/rodrigoisensee/MetricasDSPD-052d/docs/reviews/065-bloqueados.md`; o parecer de QA `/home/rodrigoisensee/MetricasDSPD-052d/docs/qa/065-bloqueados.md`.

## Entregar
- "E1.4 (tech-lead): code review." (E1.4)
- (E1) (E2) (E1.4) `git -C /home/rodrigoisensee/MetricasDSPD-052d add web/src/features/complementares/fluxo.tsx`; `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem curta citando o 065 e o A2 do QA> -m 'Cartão: K-205'` (sem heredoc e sem pipe, que o hook recusa); push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; anote a ponta; `forge-check delta --parecer docs/reviews/065-bloqueados.md`; revisar o delta: o E2E `e2e/tests-api/bloqueio-sem-dado-065.spec.ts`, a API de teste `server/tests/pg/api-stub-065.ts` (lugar, se não entra em produção, se segue a ADR 0002) e a formatação; atualizar o parecer com `commit:` = a ponta anotada e veredito; commit só do parecer; push; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- 2026-11-04 11:13: E1.5 cumprida pelo qa-engineer: aprovado sem bug em e8eedda8213abc0bff9ca7a596357f615d124706 (commit: 917ee0b, ponta com o teste novo); E2E novo e2e/tests-api/bloqueio-sem-dado-065.spec.ts 7/7 com API de teste sem banco (server/tests/pg/api-stub-065.ts), axe sem violação séria; suítes verdes; mutação em parte-sem-dado.ts com os 2 mutantes mortos; recomendados: A1 JSDoc fora de lugar (origem.ts:47), A2 format:check falha em web/src/features/complementares/fluxo.tsx (pode barrar o push e a CI), A3 o dono roda test:pg antes da release. O QA relatou ter gravado um script com Write e rodado com bash depois de uma recusa do hook conformidade (registrado como possível contorno para a retrospectiva). DECISÃO TÉCNICA (Jarvis): volta curta ao react-frontend só para o format:check do fluxo.tsx (A2), porque barra a CI; depois o tech-lead regrava o review com o delta (E2E, API de teste, formatação) e o QA regrava o parecer na ponta final; então o PR com a linha teto.
- 2026-11-04 11:22: formatação do fluxo.tsx feita pelo react-frontend (prettier só nesse arquivo; uma linha juntada no texto do O5, sem mudança de comportamento; format:check rc=0; 307 testes de complementares verdes), sem commit: o hook conformidade recusou a chamada de commit com heredoc e pipe, e o agente parou sem contornar. DECISÃO TÉCNICA (Jarvis): o tech-lead commita essa formatação no começo da regravação do review, com `git commit -m` (a forma que o próprio hook indica), e revisa o delta desde 21fffba (E2E e API de teste do QA, formatação); depois o QA regrava o parecer na ponta final.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código.
- O agente não abre, lê nem edita arquivos `.env*`.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- O pre-push e o `forge-check docs` barram frase de regra copiada (cite só o ID) e achado com mais de 300 caracteres.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código além do commit da formatação, testes, outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --format=%H -1 origin/feature/065-bloqueados -- web/src/features/complementares/fluxo.tsx` · espera: linhas=1
- PQ-2 (sha): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --format=%H -1 origin/feature/065-bloqueados -- docs/reviews/065-bloqueados.md` · espera: linhas=1
- PQ-3 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d status --short` · espera: linhas=0

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).