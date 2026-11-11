## Objetivo
Release 093, segundo degrau (volta sobre a develop 9fe4b61f): PR da branch `docs/093-release-b` (worktree `/home/rodrigoisensee/MetricasDSPD-052h`; CHANGELOG da volta 1d1dc74ca30e03f9a3a35e2ff37615233673ddf0, review f632f8a6, segurança 9bbf0e80 e QA f7c556a1, todos aprovados; pronto rc=0 dentro do sandbox) para a develop.

## Ler
- Na worktree: `docs/reviews/093-release.md` (novo), `docs/security/093-release.md` (novo) e `docs/qa/093-release.md` (novo).

## Entregar
- "E1.4 (tech-lead): PR da docs/093-release para a develop, CI verde; o merge é do dono." (E1.4)
- (E1) (E1.4) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-204`; os três pareceres e os achados recomendados; o aviso ao dono sobre o corte do O1 e os bloqueios reais, A2 do QA, para o PR de release; o A1 do QA, regex de pessoa, é o K-267, PR próprio) e esperar a CI verde (`testes` e `e2e`) em laços de até 170 s por chamada. Não mesclar (o merge é do dono, E1.4). Sem commit nem push nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head docs/093-release-b --base develop --json number --jq .[].number` · espera: linhas=1
