## Objetivo
PR e integração do K-261 na develop: branch `fix/k261-teste-hermetico` (worktree `/home/rodrigoisensee/MetricasDSPD-056`, head 04a7eb6e; código 0c16aeb52601a49cf7404bb5bfb65a3cec37492b conferido; review d4d256df e QA 04a7eb6e aprovados nesse código). A suíte completa (o pronto da entrega) fica provada pelo CI do PR.

## Ler
- Na worktree: `docs/reviews/088-k261-teste-hermetico.md` (novo) e `docs/qa/088-k261-teste-hermetico.md` (novo).

## Entregar
- "E1.10 (tech-lead): PR do K-261 para a develop, depois do QA." (E1.10)
- (E1.10) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-261`; os achados A1 do review e do QA como pendências recomendadas), esperar a CI verde (`bateria` inclusa) em laços de até 170 s por chamada e, com a CI verde e o `forge-check pr` aprovado, mesclar por squash com `--match-head-commit` (pelo nome da branch; nunca `--admin`), como manda o CLAUDE.md (o tech-lead mescla na develop; decisão do dono de 2026-11-10 23:29, "vou dormir toque tudo."). Se o hook recusar o merge, pare e relate a mensagem literal (não contorne; o merge fica para o dono). Sem commit nem push nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head fix/k261-teste-hermetico --base develop --json number --jq .[].number` · espera: linhas=1
