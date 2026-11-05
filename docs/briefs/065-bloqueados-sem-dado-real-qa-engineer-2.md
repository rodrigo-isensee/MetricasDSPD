Agente destino: forge:qa-engineer
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: qa   Cobre: E1.5

## Objetivo
Regravar o parecer de QA do 065 na ponta 742e4f3fdecb553b2ef2a39305225560f2e1ebb8 (pedido 065, E1.5, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 917ee0b 742e4f3fdecb553b2ef2a39305225560f2e1ebb8 --stat` (só a formatação do fluxo.tsx); o seu parecer `/home/rodrigoisensee/MetricasDSPD-052d/docs/qa/065-bloqueados.md`.

## Entregar
- "E1.5 (qa-engineer): QA." (E1.5)
- (E1) (E2) (E1.5) `git -C /home/rodrigoisensee/MetricasDSPD-052d pull --ff-only origin feature/065-bloqueados`; rodar de novo o vitest do web (2 workers) e o E2E `e2e/tests-api/bloqueio-sem-dado-065.spec.ts` (2 workers), sem mudar teste nenhum; atualizar o parecer com `commit: 742e4f3fdecb553b2ef2a39305225560f2e1ebb8`, o resultado real e veredito; commit só do parecer com `git -C /home/rodrigoisensee/MetricasDSPD-052d commit -m <mensagem> -m 'Cartão: K-205' -- docs/qa/065-bloqueados.md` (sem heredoc e sem pipe); push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- ADR 0002 (citada no pedido): imports entre pacotes; o A7 do review fica como recomendado, sem mudança nesta etapa
- 2026-11-04 11:48: E1.4 cumprida pelo tech-lead: formatação commitada em 742e4f3fdecb553b2ef2a39305225560f2e1ebb8; review regravado em 545924e3c6f72780b2766c1b7d29615d93d7740a (commit: 742e4f3), aprovado sem bloqueante; A2 do QA resolvido; A7 recomendado: a API de teste importa por caminho relativo entre pacotes (ADR 0002), passa porque server/tests/pg está fora do lint; lote com 563 linhas, o PR precisa da linha teto. DECISÃO TÉCNICA (Jarvis): o QA regrava o parecer citando 742e4f3 (depois só entra parecer); depois o PR (E1.6).
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código.
- O agente não abre, lê nem edita arquivos `.env*`.
- Recursos: uma tarefa pesada por vez, vitest e playwright com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
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
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/feature/065-bloqueados:docs/qa/065-bloqueados.md` · espera: contém 'commit: 742e4f3fdecb553b2ef2a39305225560f2e1ebb8'

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).