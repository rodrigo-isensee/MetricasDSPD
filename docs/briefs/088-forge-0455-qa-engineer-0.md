## Objetivo
QA do K-261 (BUG-088-QA1, achado A1 do QA do 088): branch `fix/k261-teste-hermetico`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, commit 0c16aeb52601a49cf7404bb5bfb65a3cec37492b (entrega conferida), em paralelo ao review no mesmo head.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff 129fc3d5ba918789e17d3dc1b663039795c4a9e6 0c16aeb52601a49cf7404bb5bfb65a3cec37492b`.
- `/home/rodrigoisensee/MetricasDSPD-056d/docs/qa/chore-forge-0455.md`: só o achado A1.

## Entregar
- "E1.9 (qa-engineer): QA do K-261." (E1.9)
- (E1.9) Rodar só `server/tests/ref-sync-apontamento-entrada.test.ts` com no máximo 2 workers, da raiz da worktree, e conferir que o caso "sem configuração" passa com um `.env` de mentira que define `PG_REF_URL` (o do próprio teste, em pasta temporária; nunca o `.env` real); uma mutação (tirar o módulo `--import` do filho) que o teste novo pega, restaurada antes do commit. Não rodar `pnpm run pronto` (suíte pesada na fila de outra worktree); a suíte completa fica com o CI do PR. Grave `docs/qa/088-k261-teste-hermetico.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 088-forge-0455`, `branch: fix/k261-teste-hermetico`, `commit: 0c16aeb52601a49cf7404bb5bfb65a3cec37492b`, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado; commit só do parecer com `Cartão: K-261` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/fix/k261-teste-hermetico` (`github.com` em allowed_domains); commit e push em chamadas separadas; se o push for recusado por o review ter chegado antes, `git pull --no-rebase` da branch e novo push; sem PR.
- arquivos: docs/qa/088-k261-teste-hermetico.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/fix/k261-teste-hermetico:docs/qa/088-k261-teste-hermetico.md` · espera: contém 'commit: 0c16aeb52601a49cf7404bb5bfb65a3cec37492b'
