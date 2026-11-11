## Objetivo
PR do front-end do pedido 089: a `feature/089-apontamento-d2-d3-web` (head e2140735; código em dafb325a214bdb6bd7a9dc287e02faf846b11ea2 conferido; parecer de UX e6e6446c, review 1b1ecee8 e QA e2140735 aprovados) vai para a develop por squash com a CI verde. Worktree `/home/rodrigoisensee/MetricasDSPD-052f`. O PR do back-end é o 293 (rascunho, CI verde).

## Ler
- Na worktree: `docs/reviews/089-apontamento-d2-d3-web.md` ou o parecer de review do front, `docs/qa/089-apontamento-d2-d3-web.md` e `docs/ux/089-revisao-apontamento.md`.

## Entregar
- "E1.7 (tech-lead): PR (o merge é do dono)." (E1) (E2) (E1.7) Nesta delegação, só a branch do front: abrir o PR para a develop (corpo gravado por Write num arquivo do scratchpad e passado com `--body-file`, em chamada separada; `Cartão: K-213`; a dependência do PR 293 do back-end, que entra antes; o achado A1 do QA (fixture do E2E sem o subgrupo execucao-tecnica) como pendência registrada; PR pelo nome da branch, a partir da worktree) e esperar a CI verde. Não mesclar. Sem commit nem push nesta delegação.

## Pronto quando
- PQ-1 (cmd): `gh pr list --repo rodrigo-isensee/MetricasDSPD --head feature/089-apontamento-d2-d3-web --base develop --json number --jq .[].number` · espera: linhas=1
