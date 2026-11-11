## Objetivo
PR do K-265: branch `docs/k265-guia-pronto` (worktree `/home/rodrigoisensee/MetricasDSPD-052c`, ponta d1d28369; texto 26511df5 com review aprovado), só documentação, classe T, para a develop.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/reviews/094-k265-guia-pronto.md` (novo).

## Entregar
- "E1.3 (tech-lead): PR do K-265; o merge é do dono." (E1.3)
- (E1) (E1.3) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-265`; o parecer) e esperar a CI verde em laços de até 170 s por chamada, com uma leitura final de `gh pr checks` depois do laço. Não mesclar (o merge é do dono, E1.3). Sem commit nem push nesta delegação.
- (E2) (E3) Nada a entregar aqui: não nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head docs/k265-guia-pronto --base develop --json number --jq .[].number` · espera: linhas=1
