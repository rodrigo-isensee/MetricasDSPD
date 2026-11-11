## Objetivo
PR e integração do lote 6b do pedido 075 na develop: branch `feature/075-l6b-publicacao-real` (worktree `/home/rodrigoisensee/MetricasDSPD-052d`; código bd76128a9fde6822f9e126ceaf4c24462fc7b865 conferido; review fecdb3c4 e segurança aprovados; QA aprovado no mesmo código, parecer na branch). O parecer de segurança `docs/security/075-l6b-publicacao-real.md` está gravado e sem commit na worktree.

## Ler
- Na worktree: `docs/reviews/075-l6b-publicacao-real.md` (novo), `docs/security/075-l6b-publicacao-real.md` (novo) e `docs/qa/075-l6b-publicacao-real.md` (novo).

## Entregar
- "E1.9 (tech-lead): PR por lote, depois do QA." (E1.9) Nesta delegação, só o lote 6b.
- (E1) (E4) (E1.9) Levar o parecer de segurança à branch: commit só dele com `Cartão: K-204` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/feature/075-l6b-publicacao-real` (`github.com` em allowed_domains); commit e push em chamadas separadas. Depois, abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-204`; `teto: excedido, 455 linhas` com o motivo do A3 do review; os achados recomendados do review, da segurança e do QA como pendências; o lote 9a/9b como próximo passo), esperar a CI verde (`testes` e `e2e`) em laços de até 170 s por chamada e, com a CI verde e o `forge-check pr` aprovado, mesclar por squash com `--match-head-commit` (pelo nome da branch; nunca `--admin`), como manda o CLAUDE.md (o tech-lead mescla na develop; decisão do dono de 2026-11-10 23:29, "vou dormir toque tudo.", registrada no pedido 090). Se o PR estiver atrás da develop, `gh pr update-branch` pelo nome da branch e esperar a CI de novo. Se o hook ou o sistema de permissões recusar o merge, pare e relate a mensagem literal (não contorne; o merge fica para o dono).
- (E2, E3, E5) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/security/075-l6b-publicacao-real.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head feature/075-l6b-publicacao-real --base develop --json number --jq .[].number` · espera: linhas=1
