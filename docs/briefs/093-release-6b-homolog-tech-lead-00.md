## Objetivo
Release 093, segundo degrau: PR da branch `docs/093-release` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`; CHANGELOG ce704f9b61bb23ae2b1e197d50b71394f4dbf622, review 56e4e8af, segurança e5b17cfd e QA d2e2d5ec, todos aprovados; o pronto local caiu só nos testes de CLI do server pelo sandbox, K-264) para a develop.

## Ler
- Na worktree: `docs/reviews/093-release.md` (novo), `docs/security/093-release.md` (novo) e `docs/qa/093-release.md` (novo).

## Entregar
- "E1.4 (tech-lead): PR da docs/093-release para a develop, CI verde; o merge é do dono." (E1.4)
- (E1) (E1.4) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-204`; os três pareceres e os achados recomendados; o aviso ao dono sobre o corte do O1 e os bloqueios reais, A3 do QA, para o PR de release) e esperar a CI verde (`testes` e `e2e`) em laços de até 170 s por chamada. Não mesclar (o merge é do dono, E1.4). Sem commit nem push nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head docs/093-release --base develop --json number --jq .[].number` · espera: linhas=1
