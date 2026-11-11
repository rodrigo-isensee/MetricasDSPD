## Objetivo
PR do K-172: branch `docs/k172-pronto-praticas` (worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`; texto 87079bef3a22cd3215d99576fd96a1d38e04f068 conferido; review aprovado em 7ce0d7c5), só documentação, classe T, para a develop.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/reviews/092-k172-pronto-praticas.md` (novo).

## Entregar
- "E2.3 (tech-lead): PR do K-172 para a develop; o merge é do dono." (E2.3)
- (E2) (E2.3) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-172`; o A1 do review como pendência com o cartão K-265) e esperar a CI verde em laços de até 170 s por chamada. Não mesclar (o merge é do dono, E2.3). Sem commit nem push nesta delegação.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head docs/k172-pronto-praticas --base develop --json number --jq .[].number` · espera: linhas=1
