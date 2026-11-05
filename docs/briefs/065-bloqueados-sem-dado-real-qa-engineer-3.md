Agente destino: forge:qa-engineer
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: qa   Cobre: E1.5

## Objetivo
Acertar a forma do parecer de QA do 065 para o forge-check pr (pedido 065, E1.5, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`.

## Ler
- o seu parecer `/home/rodrigoisensee/MetricasDSPD-052d/docs/qa/065-bloqueados.md` (bloco `## Achados`).

## Entregar
- "E1.5 (qa-engineer): QA." (E1.5)
- (E1) (E2) (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/065-bloqueados`; regravar `docs/qa/065-bloqueados.md` inteiro pela ferramenta Write (não Edit), com o mesmo conteúdo e `commit: 742e4f3fdecb553b2ef2a39305225560f2e1ebb8`, trocando a linha A2 para `- A2 (recomendado) web/src/features/complementares/fluxo.tsx:64 · resolvido em 742e4f3: o format:check do Prettier falhava neste arquivo.`; sem rodar testes; conferir `forge-check pr 065-bloqueados-sem-dado-real --ref HEAD --base origin/develop` sem linha sobre `docs/qa/065-bloqueados.md`; commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-205' -- docs/qa/065-bloqueados.md`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- ADR 0002 (citada no pedido): imports entre pacotes; o A7 do review fica como recomendado, sem mudança nesta etapa
- 2026-11-04 11:59: E1.5 parecer de QA regravado em 1f343f3 (commit: 742e4f3), aprovado; web 1425 e E2E 7/7. forge-check pr recusa o parecer: a linha A2 do bloco Achados tem "(recomendado, resolvido em 742e4f3)" fora do formato, e não há registro de autoria do papel qa nesta versão. DECISÃO TÉCNICA (Jarvis): o QA regrava o parecer pela ferramenta Write com a linha A2 no formato (severidade só entre parênteses; o resolvido vai no texto), sem rodar testes de novo; depois o PR.
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código.
- O agente não abre, lê nem edita arquivos `.env*`.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal, sem contornar por script nem por outro comando. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, testes, outros pareceres, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/065-bloqueados:docs/qa/065-bloqueados.md` · espera: contém '- A2 (recomendado) web/src/features/complementares/fluxo.tsx:64'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).