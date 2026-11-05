Agente destino: forge:react-frontend
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: feature/065-bloqueados   Base: develop   Base-sha: 1f1da673b0fbb8210f2cd5cae5c3a4525afff901
Etapa: codigo   Cobre: E1.3

## Objetivo
Volta 1 do 065 no web pela decisão B: o cartão O5 inteiro mostra Sem dado real; sai o tratamento parcial do O5 (pedido 065, E1.3, K-205). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `feature/065-bloqueados`, ponta 26692ba.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/analises/065-desenho.md` (seção 8); `web/src/features/complementares/fluxo.tsx`, `CartaoComplementar.tsx` (prop notasDoCartao) e `web/src/features/operacional/bloqueio-sem-dado.test.tsx`.

## Entregar
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." (E1.3)
- (E1) (E2) (E1.3) `git -C /home/rodrigoisensee/MetricasDSPD-052d branch --show-current` deve dar `feature/065-bloqueados`; o O5 passa a usar o estado Sem dado real do cartão inteiro que o web já tem (motivo do servidor); sai a lógica parcial do O5 (leitura o restante é fila, rodapé bloqueio: sem dado real e o que só servia a ela); O1 e O2 ficam como estão; testes ajustados (o W do O5 passa a provar o cartão inteiro sem dado); typecheck e lint verdes; vitest do web com no máximo 2 workers; commit com `Cartão: K-205`; push com `git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/065-bloqueados`; sem PR.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- 2026-11-04 10:04: DECISÃO TÉCNICA (Jarvis): volta 1 do 065 pela decisão B: o node-backend tira o O5 do mapa real com motivo próprio (como BLOQUEADOS) e remove a parte parcial do O5 (null e nota), com testes e o desenho atualizado; depois o react-frontend tira o tratamento parcial do O5 no web (o estado Sem dado real do cartão inteiro já existe) e os testes; o A1 e o M1 do UX ficam resolvidos pelo cartão inteiro sem dado; M2 e B1 a B3 do UX ficam para o review avaliar.
- 2026-11-04 10:14: volta 1 do back entregue pelo node-backend: 26692ba (push ok): O5 fora de METRICAS_ORIGEM_REAL (17 ids) com motivo próprio; parte parcial do O5 removida (METRICAS_COM_PARTE_DE_BLOQUEIO = O1 e O2); T2.6 cita o O5 inteiro; docs/api/metricas.md e o desenho (seção 8) atualizados; server 1622 com cobertura; schema do O5 intacto (horasBloqueio nullable sem uso). DECISÃO TÉCNICA (Jarvis): volta 1 do front em seguida; a conferência das duas voltas sai junta pela união dos briefs.
- O agente não abre, lê nem edita arquivos `.env*`.
- Não mexa em `server/` nem em `packages/`; o arquivo docs/ux/065-revisao-bloqueados.md sem commit fica como está.
- Recursos: uma tarefa pesada por vez, vitest com no máximo 2 workers, MemAvailable acima de 3000 MB e load abaixo de 4 antes.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. O GitHub precisa de `github.com` em `allowed_domains`. R-VERIFY: nunca `--no-verify` nem `--force`. `git add` explícito por caminho.
- NÃO tocar: `server/`, `packages/`, o parecer de interface, a ADR 0026, o `CLAUDE.md`, os arquivos `.env*`, outras worktrees e a `main`.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `cd /home/rodrigoisensee/MetricasDSPD-052d/web && pnpm exec vitest run --maxWorkers=2` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log --oneline 26692ba..origin/feature/065-bloqueados` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).