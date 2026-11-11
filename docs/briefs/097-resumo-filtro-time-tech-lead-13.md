Agente destino: forge:tech-lead
Pedido: 097-resumo-filtro-time
Tipo: codigo
Branch: fix/k272-ap-tipo-categoria   Base: develop   Base-sha: f4c122f15c05fbf5fea86797c9c348656d11ab36
Etapa: codigo   Cobre: E6.4

## Objetivo
Destravar o PR do K-272 sem contornar nenhum portão. Branch `fix/k272-ap-tipo-categoria`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, head b93e012a (código 1d691f4e; merge da develop em dbd120a4; QA e review revalidados no head dbd120a4, ambos aprovados, pareceres gravados pela ferramenta Write pelos papéis). O `forge-check entrega` do pedido 097 recusa: com o brief mais novo de QA, o parecer de review aparece "fora do declarado no brief"; com o brief de PR do tech-lead, o de QA aparece "fora do declarado" (o parecer reescrito com remoção só passa se declarado no brief da entrega ou se reescrito por um portão de um pedido `<X>-REV`, função `reescrito_por_portao` do forge-check). Sem a linha "entrega conferida" do head, o `forge-check pr` não libera o PR.

## Ler
- A saída de `forge-check entrega --pedido 097-resumo-filtro-time --worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041 --branch fix/k272-ap-tipo-categoria --etapa codigo --sem-gravar`, rodado da raiz `/home/rodrigoisensee/Metricas/MetricasDSPD`.
- No forge-check do plugin (`/home/rodrigoisensee/.claude/plugins/cache/forge/forge/0.45.5/bin/forge-check`), as funções `reescrito_por_portao`, `pedido_da_revalidacao` e o trecho da conferência de escopo (linhas 2370 a 2420), e a skill do Forge sobre revalidação de parecer, se houver.

## Entregar
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." (E6.4) Nesta delegação, o diagnóstico de como a revalidação depois do merge da develop deve ser feita para a ferramenta aceitar, e a proposta.
- (E6) (E6.4) Relatar ao Jarvis, sem mudar arquivos: (a) o caminho previsto pelo Forge para revalidar pareceres depois de atualizar a branch com a develop (por exemplo, o pedido `<X>-REV` e o formato dos briefs dele), com a citação da função ou da regra; (b) os passos concretos para o K-272 e para o L1 do pedido 099 (branch `fix/099-l1-sem-simulador`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, que tem a mesma situação); (c) se a regra do Forge tem um defeito (o `forge-check parecer delta` diz "nenhum arquivo do domínio mudou" e mesmo assim o `pr` pede revalidação), a proposta de correção para o Forge. Nenhum push, nenhum PR e nenhuma edição de parecer nesta delegação.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: nenhum

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 097-resumo-filtro-time até b7f2fcada9845b5ac84cedf4736a2da181634dbdb635cbc49fef3ca98c67fc23 (11 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/097-resumo-filtro-time.md; valem todas, leia-as nas fontes)
- ADRs citadas no pedido (valem como as decisões): ADR 0024
- aplicáveis a E6.4 (copiadas literalmente):
- - 2026-11-11 13:51: DECISÃO DO DONO repassada pela sessão "WSL ativação" (literal do dono): "Agrupar". P-097-7 respondida pela opção (a): no AP-TIPO e na lista do filtro tipo do Apontamento, uma linha e uma opção por categoria do contrato (dim_card.tipo), somando todos os type_id dela; filtrar por categoria cobre todos os type_id; lerCardsIncompletos deixa de filtrar por type_id; "Sem tipo" segue à parte; teste com dois type_id da mesma categoria. E6 (K-272) começa já, na worktree 041, branch fix/k272-ap-tipo-categoria, a partir da develop eac38a64.
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, arquivos fora da lista `- arquivos:`, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum merge.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (ux-designer): discovery da interface de E1 a E4 e protótipo para o dono validar." · etapa de outra delegação; continua no pedido
- "E1.2 (software-architect): viabilidade e dados de E1 a E4 (time no apontamento, opções de filtro do dado real), em paralelo ao UX." · etapa de outra delegação; continua no pedido
- "E1.3 (ux-designer): segunda rodada do protótipo com E5 (recolher cartão e os 10 maiores do AP-PROJETO) e E7 (filtro Setor), rótulo "Equipe", na branch docs/097-ux-recolher-setor, worktree /home/rodrigoisensee/MetricasDSPD-052d." · etapa de outra delegação; continua no pedido
- "E1.4 (node-backend): L4 do plano, equipe opcional nas duas tendências (parte servidor do E1), na branch feature/097-l4-tendencia-equipe, worktree /home/rodrigoisensee/MetricasDSPD-052g." · etapa de outra delegação; continua no pedido
- "E3.1 (react-frontend): L1 do plano, busca no FiltroMulti (E3), na branch feature/097-l1-busca, worktree /home/rodrigoisensee/MetricasDSPD-052c." · etapa de outra delegação; continua no pedido
- "E3.2 (tech-lead): review por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.3 (qa-engineer): QA por lote do 097." · etapa de outra delegação; continua no pedido
- "E3.4 (tech-lead): PR por lote do 097; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO, no filtro tipo e em lerCardsIncompletos, na branch fix/k272-ap-tipo-categoria, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." · etapa de outra delegação; continua no pedido
- "E6.2 (tech-lead): review do K-272." · etapa de outra delegação; continua no pedido
- "E6.3 (qa-engineer): QA do K-272." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 status --short` · espera: rc=0
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
