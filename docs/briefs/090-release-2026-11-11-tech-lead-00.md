## Objetivo
Release 090, segundo degrau: PR da branch `docs/090-release` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`; CHANGELOG 81e30293048c0448066ca1ebd831074e5c82ddfb, review 6e819bad, segurança b4c981a3 e QA bf341ede, todos aprovados; QA com `pnpm run pronto` rc=0) para a develop.

## Ler
- Na worktree: `docs/reviews/090-release.md` (novo), `docs/security/090-release.md` (novo) e `docs/qa/090-release.md` (novo).

## Entregar
- "E1.4 (tech-lead): PR da docs/090-release para a develop, squash com a CI verde, antes da E1.5; o merge é do dono (K-250)." (E1.4)
- (E1) (E1.4) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-262`; os três pareceres e os achados recomendados) e esperar a CI verde (`testes` e `e2e`) em laços de até 170 s por chamada. Não mesclar (o merge é do dono, E1.4). Sem commit nem push nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head docs/090-release --base develop --json number --jq .[].number` · espera: linhas=1
