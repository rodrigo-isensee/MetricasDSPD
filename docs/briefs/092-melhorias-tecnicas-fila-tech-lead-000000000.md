## Objetivo
PR do K-121: branch `docs/k121-frontmatter` (worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, ponta 8ccf2196; frontmatter `contrato: 0` em dez documentos antigos, review aprovado sobre 80bfc064), só documentação, classe T, para a develop.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/092-k121-frontmatter.md` (novo).

## Entregar
- "E1.3 (tech-lead): PR do K-121 para a develop; o merge é do dono." (E1.3)
- (E1) (E1.3) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-121`; o parecer; o A1 do review como pendência recomendada) e esperar a CI verde em laços de até 170 s por chamada. Não mesclar (o merge é do dono, E1.3). Sem commit nem push nesta delegação.
- (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head docs/k121-frontmatter --base develop --json number --jq .[].number` · espera: linhas=1
