## Objetivo
PR do K-264: branch `fix/k264-cli-tmpdir` (worktree `/home/rodrigoisensee/MetricasDSPD-052g`, ponta 1c7ec288; código 6d2e15be27630e6f75d21ddb7876f7b3ed18b074 conferido; review 3b3affe9 e QA 1c7ec288 aprovados), para a develop.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052g/docs/reviews/092-k264-cli-tmpdir.md` (novo) e `/home/rodrigoisensee/MetricasDSPD-052g/docs/qa/092-k264-cli-tmpdir.md` (novo).

## Entregar
- "E5.4 (tech-lead): PR do K-264 para a develop; o merge é do dono." (E5.4)
- (E5) (E5.4) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-264`; os dois pareceres; o A1 do review, `server/tests/seed-recusa-real.pg.test.ts:108` com o mesmo padrão, como pendência) e esperar a CI verde em laços de até 170 s por chamada. Não mesclar (o merge é do dono, E5.4). Sem commit nem push nesta delegação.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head fix/k264-cli-tmpdir --base develop --json number --jq .[].number` · espera: linhas=1
