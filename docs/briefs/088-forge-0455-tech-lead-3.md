Agente destino: forge:tech-lead
Pedido: 088-forge-0455
Tipo: codigo
Branch: fix/k261-teste-hermetico   Base: develop   Base-sha: 129fc3d5ba918789e17d3dc1b663039795c4a9e6
Etapa: codigo   Cobre: E1.10

## Objetivo
PR e integração do K-261 na develop: branch `fix/k261-teste-hermetico` (worktree `/home/rodrigoisensee/MetricasDSPD-056`, head 04a7eb6e; código 0c16aeb52601a49cf7404bb5bfb65a3cec37492b conferido; review d4d256df e QA 04a7eb6e aprovados nesse código). A suíte completa (o pronto da entrega) fica provada pelo CI do PR.

## Ler
- Na worktree: `docs/reviews/088-k261-teste-hermetico.md` (novo) e `docs/qa/088-k261-teste-hermetico.md` (novo).

## Entregar
- "E1.10 (tech-lead): PR do K-261 para a develop, depois do QA." (E1.10)
- (E1.10) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-261`; os achados A1 do review e do QA como pendências recomendadas), esperar a CI verde (`bateria` inclusa) em laços de até 170 s por chamada e, com a CI verde e o `forge-check pr` aprovado, mesclar por squash com `--match-head-commit` (pelo nome da branch; nunca `--admin`), como manda o CLAUDE.md (o tech-lead mescla na develop; decisão do dono de 2026-11-10 23:29, "vou dormir toque tudo."). Se o hook recusar o merge, pare e relate a mensagem literal (não contorne; o merge fica para o dono). Sem commit nem push nesta delegação.

## Decisões e restrições (linhas `DECISÃO DO DONO` copiadas literalmente do pedido)
- decisões: pedido 088-forge-0455 até 80faea8e93bd74c8642a8b15c879cde3e9d6be9fb4fd0c141a199c072007273d (2 linhas DECISÃO DO DONO em 1 fontes: docs/pedidos/088-forge-0455.md; valem todas, leia-as nas fontes)
- aplicáveis a E1.10 (copiadas literalmente):
- - 2026-11-10 23:29: DECISÃO DO DONO (literal): "feito". PR 296 (Forge 0.45.5) mesclado na develop pelo dono (2026-11-11 02:28 UTC). Falta: K-261 (E1.7 a E1.10) e a retrospectiva (E1.6).
- O agente não abre, lê nem edita arquivos `.env*` e não roda nada contra a base real. Recusa de hook, sandbox ou classificador: pare e relate a mensagem literal. Nunca `--no-verify` nem `--force`. Caminhos literais, sem `$VAR`.
- NÃO tocar: código, testes, os pareceres de outros papéis, outras worktrees, a `develop`, a `homolog` e a `main`; nenhum commit nem push.

## Fora do escopo (outras etapas do pedido, sem a marca; R-BRIEF)
- "E1.1 (dono): trocar o ref do marketplace do Forge de v0.45.2 para v0.45.5, atualizar o plugin e reiniciar a sessão." · etapa de outra delegação; continua no pedido
- "E1.2 (Jarvis, por ordem do dono, como no 084): `forge-upgrade` numa worktree limpa a partir da develop e envio da branch." · etapa de outra delegação; continua no pedido
- "E1.3 (tech-lead): review." · etapa de outra delegação; continua no pedido
- "E1.4 (qa-engineer): QA (`pnpm run pronto`)." · etapa de outra delegação; continua no pedido
- "E1.5 (tech-lead): PR para a develop, depois do QA; o merge é do dono." · etapa de outra delegação; continua no pedido
- "E1.6 (agile-coach): retrospectiva curta." · etapa de outra delegação; continua no pedido
- "E1.7 (node-backend): correção do BUG-088-QA1 (K-261): o teste `server/tests/ref-sync-apontamento-entrada.test.ts` do caso sem configuração fica hermético (não depende do .env da máquina), na branch fix/k261-teste-hermetico a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-056." · etapa de outra delegação; continua no pedido
- "E1.8 (tech-lead): review do K-261." · etapa de outra delegação; continua no pedido
- "E1.9 (qa-engineer): QA do K-261." · etapa de outra delegação; continua no pedido

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head fix/k261-teste-hermetico --base develop --json number --jq .[].number` · espera: linhas=1
## Relatório
Até 8 linhas, resultado real; depois o bloco `Provas:`, uma linha por `PQ-n` com a saída copiada da ferramenta, ou "não cumprido" e o motivo. Última linha: `Melhoria vista:` com o problema e a evidência, ou `nenhuma` (`R-DECISAO`).
