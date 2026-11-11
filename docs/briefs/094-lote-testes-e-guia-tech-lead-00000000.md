## Objetivo
PR do K-267: branch `fix/k267-regex-pessoa` (worktree `/home/rodrigoisensee/MetricasDSPD-052f`, ponta c90340ee; código 914480843f9988b10bdceb18d38fac248f6839a5 com review b653e6d4 e QA c90340ee aprovados), para a develop.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052f/docs/reviews/094-k267-regex-pessoa.md` (novo) e `/home/rodrigoisensee/MetricasDSPD-052f/docs/qa/094-k267-regex-pessoa.md` (novo).

## Entregar
- "E3.4 (tech-lead): PR do K-267; o merge é do dono." (E3.4)
- (E3) (E3.4) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-267`; os dois pareceres; o A3 do review, `QUEM` em maiúsculas, como pendência recomendada) e esperar a CI verde em laços de até 170 s por chamada, com uma leitura final de `gh pr checks` depois do laço. Não mesclar (o merge é do dono, E3.4). Sem commit nem push nesta delegação.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head fix/k267-regex-pessoa --base develop --json number --jq .[].number` · espera: linhas=1
