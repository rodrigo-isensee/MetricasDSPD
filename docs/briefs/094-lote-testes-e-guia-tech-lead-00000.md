## Objetivo
PR do K-266: branch `fix/k266-seed-tmpdir` (worktree `/home/rodrigoisensee/MetricasDSPD-052d`, ponta 34b29e9a; código 1d7c4291 com review 52427ad2 e QA 34b29e9a aprovados), para a develop. O teste é `.pg`: o check com banco do CI do PR é a prova de execução.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/reviews/094-k266-seed-tmpdir.md` (novo) e `/home/rodrigoisensee/MetricasDSPD-052d/docs/qa/094-k266-seed-tmpdir.md` (novo).

## Entregar
- "E2.4 (tech-lead): PR do K-266; o merge é do dono." (E2.4)
- (E2) (E2.4) Abrir o PR para a develop pelo nome da branch, a partir da worktree (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`; `Cartão: K-266`; os dois pareceres; o A1 do review, trocar pelo ajudante do K-264 quando os dois estiverem na develop, como pendência) e esperar a CI verde, conferindo que o check com banco rodou o arquivo, em laços de até 170 s por chamada, com uma leitura final de `gh pr checks` depois do laço. Não mesclar (o merge é do dono, E2.4). Sem commit nem push nesta delegação.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --state all --head fix/k266-seed-tmpdir --base develop --json number --jq .[].number` · espera: linhas=1
