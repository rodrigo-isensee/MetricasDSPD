Agente destino: forge:react-frontend
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: codigo   Cobre: E1.3

## Objetivo
Volta 2 do 065 no web: corrigir a formatação de fluxo.tsx que falha no format:check (A2 do QA) (pedido 065, E1.3, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`, ponta e8eedda.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/qa/065-bloqueados.md` (A2); `/home/rodrigoisensee/MetricasDSPD-052d/web/src/features/complementares/fluxo.tsx`.

## Entregar
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." (E1.3)
- (E1) (E2) (E1.3) `git -C /home/rodrigoisensee/MetricasDSPD-052d branch --show-current` deve dar `feature/065-bloqueados`; rodar o prettier só em `web/src/features/complementares/fluxo.tsx` (sem mudar comportamento) e conferir `pnpm run format:check` verde; vitest do web com no máximo 2 workers; commit só desse arquivo com `Cartão: K-205`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- 2026-11-04 11:13: E1.5 cumprida pelo qa-engineer: aprovado sem bug em e8eedda8213abc0bff9ca7a596357f615d124706 (commit: 917ee0b, ponta com o teste novo); E2E novo e2e/tests-api/bloqueio-sem-dado-065.spec.ts 7/7 com API de teste sem banco (server/tests/pg/api-stub-065.ts), axe sem violação séria; suítes verdes; mutação em parte-sem-dado.ts com os 2 mutantes mortos; recomendados: A1 JSDoc fora de lugar (origem.ts:47), A2 format:check falha em web/src/features/complementares/fluxo.tsx (pode barrar o push e a CI), A3 o dono roda test:pg antes da release. O QA relatou ter gravado um script com Write e rodado com bash depois de uma recusa do hook conformidade (registrado como possível contorno para a retrospectiva). DECISÃO TÉCNICA (Jarvis): volta curta ao react-frontend só para o format:check do fluxo.tsx (A2), porque barra a CI; depois o tech-lead regrava o review com o delta (E2E, API de teste, formatação) e o QA regrava o parecer na ponta final; então o PR com a linha teto.
- O agente não abre, lê nem edita arquivos `.env*`.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: outros arquivos, `server/`, `packages/`, `e2e/`, os pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d diff --name-only e8eedda8213abc0bff9ca7a596357f615d124706 origin/feature/065-bloqueados` · espera: igual 'web/src/features/complementares/fluxo.tsx'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).