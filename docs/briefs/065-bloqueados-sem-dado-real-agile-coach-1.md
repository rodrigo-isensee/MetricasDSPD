Agente destino: forge:agile-coach
Pedido: 065-bloqueados-sem-dado-real
Tipo: codigo
Branch: docs/jarvis-2026-10-23   Base: develop   Base-sha: ae009a75d4383c3d6c9a8ba4851f9b5b2ba5dbb8
Etapa: codigo   Cobre: E1.10

## Objetivo
Retrospectiva do pedido 065 (BLOQUEADOS e O5 sem dado real, até o PR 214) (pedido 065, E1.10, K-205).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/pedidos/065-bloqueados-sem-dado-real.md` (Histórico inteiro); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/conferencias.md` (linhas do 065); `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/kanban/historico.md` (K-205).

## Entregar
- "E1.10 (agile-coach): retrospectiva do pedido 065." (E1.10)
- (E1.10) retrospectiva em `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-11-04-065-bloqueados-sem-dado-real.md`, gravada só com Write ou Edit: o que foi bem, o que custou tempo (hora de cada evento do Histórico), rodadas e reprovações de brief por classe de causa, e linhas `MELHORIA:` (uma por linha: problema, evidência por data e arquivo, medida do efeito, Forge ou projeto). Avalie pelo menos: o contrato incompatível que o review e o QA não pegaram (docs-contratos só na CI); a cobertura do web que o pronto local não pegou; os pareceres regravados várias vezes por commits de teste e de formatação depois do review; as rodadas de brief por placeholder e por decisões da dependência; a carga da máquina barrando agentes; o laço sem pausa de um despachante. Um commit só da retrospectiva com `Cartão: K-205`, `git -C /home/rodrigoisensee/Metricas/MetricasDSPD add docs/retrospectivas/2026-11-04-065-bloqueados-sem-dado-real.md` explícito; sem push.
- (E1, E2) Nada a entregar aqui: não nesta delegação (outras etapas do pedido).

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- DECISÃO DO DONO (2026-11-04): "C" (bloqueados no mapa real, pedido 064): fazer A agora (tirar a tela de bloqueados do mapa real; ela mostra "Sem dado real" até a coleta gravar bloqueios) e B depois (corrigir a coleta para gravar os bloqueios), como cartão.
- DECISÃO DO DONO (2026-11-04): "isso" (recibo do 065): tirar BLOQUEADOS do mapa real e mostrar "Sem dado real" também nas partes do O1 (bloqueados), do O2 (motivo do bloqueio) e do O5 (horas bloqueadas), em vez de zero; a coleta gravar bloqueios fica no K-204.
- DECISÃO DO DONO (2026-11-04): "B" (Q-065-1, percentual de eficiência do O5): o O5 inteiro mostra "Sem dado real" até a coleta gravar bloqueios (K-204), em vez de publicar o percentual com ressalva.
- ADR 0026 (citada no pedido): métrica fora do mapa real responde Sem dado real; o texto ainda está sem commit, na worktree 052b
- ADR 0002 (citada no pedido): imports entre pacotes; não muda nesta etapa
- (064-lacunas-dado-real) DECISÃO DO DONO (2026-11-04): "A" (levantamento das lacunas de dado real): o software-architect e o qa-engineer comparam cada tela das operacionais, do apontamento e da sustentação com o dado real da base e listam o que falta, sem mudar código. [Nota do Jarvis: o "sem mudar código" vale para este levantamento; as correções viram pedidos próprios, como o 065, decidido pelo dono na "C".]
- O agente não abre, lê nem edita arquivos `.env*`.
- Implementar melhoria não é desta etapa; o quadro e o arquivo do pedido são do Jarvis.
- Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. R-VERIFY: nunca `--no-verify` nem `--force`.
- NÃO tocar: código, `KANBAN.md`, `docs/kanban/historico.md`, o arquivo do pedido, outros documentos, o `CLAUDE.md`, os arquivos `.env*` e a `main`; sem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (software-architect): desenho curto: onde tirar do mapa real (origem.ts e o mapa da ADR 0026) e como O1, O2 e O5 mostram a parte sem dado." · etapa de outra delegação; continua no pedido
- "E1.2 (node-backend): implementação no server e testes." · etapa de outra delegação; continua no pedido
- "E1.3 (react-frontend): ajuste de tela, se o desenho pedir." · etapa de outra delegação; continua no pedido
- "E1.4 (tech-lead): code review." · etapa de outra delegação; continua no pedido
- "E1.5 (qa-engineer): QA." · etapa de outra delegação; continua no pedido
- "E1.6 (tech-lead): PR para a develop e merge." · etapa de outra delegação; continua no pedido
- "E1.7 (ux-designer): revisão de interface dos cartões O1, O2 e O5 e da tela de bloqueados com a parte Sem dado real, sem commit (o tech-lead commita no começo do review)." · etapa de outra delegação; continua no pedido
- "E1.8 (software-architect): decisão de contrato pela política de mudança (aceite na v1 em aceitas.json ou contrato /api/v2) para O1, O3 e O5, que o tech-lead aprova depois." · etapa de outra delegação; continua no pedido
- "E1.9 (tech-lead): aprovar ou recusar a decisão de contrato do arquiteto (política, §5)." · etapa de outra delegação; continua no pedido
- As outras etapas do pedido.

## Pronto quando
- PQ-1 (cmd): `grep -c '^MELHORIA:' /home/rodrigoisensee/Metricas/MetricasDSPD/docs/retrospectivas/2026-11-04-065-bloqueados-sem-dado-real.md` · espera: rc=0
- PQ-2 (sha): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD log -1 --format=%H -- docs/retrospectivas/2026-11-04-065-bloqueados-sem-dado-real.md` · espera: linhas=1

## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).