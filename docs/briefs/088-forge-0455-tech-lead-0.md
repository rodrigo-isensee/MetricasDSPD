## Objetivo
Code review do K-261 (BUG-088-QA1): branch `fix/k261-teste-hermetico`, worktree `/home/rodrigoisensee/MetricasDSPD-056`, commit 0c16aeb52601a49cf7404bb5bfb65a3cec37492b (entrega conferida), base develop 129fc3d5. Só um arquivo de teste mudou; a entrada de produção ficou intacta.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-056 diff 129fc3d5ba918789e17d3dc1b663039795c4a9e6 0c16aeb52601a49cf7404bb5bfb65a3cec37492b`.
- `/home/rodrigoisensee/MetricasDSPD-056d/docs/qa/chore-forge-0455.md`: só o achado A1.

## Entregar
- "E1.8 (tech-lead): review do K-261." (E1.8)
- (E1.8) Review do diff: o caso "sem configuração" segue exigindo código 1 e exatamente `configuração: PG_REF_URL`; o módulo `--import` que neutraliza `process.loadEnvFile` só vale no processo filho do teste e não muda produção; o caso do `.env` de mentira cria o arquivo só em pasta temporária e nunca toca o `.env` real; o controle prova que o arquivo falso seria lido. Parecer `docs/reviews/088-k261-teste-hermetico.md` (novo) pela ferramenta Write, com `pedido: 088-forge-0455`, `branch: fix/k261-teste-hermetico`, `commit: 0c16aeb52601a49cf7404bb5bfb65a3cec37492b` e o veredito. Commit só do parecer com `Cartão: K-261` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push origin HEAD:refs/heads/fix/k261-teste-hermetico` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Não rodar `pnpm run pronto` (suíte pesada na fila de outra worktree).
- arquivos: docs/reviews/088-k261-teste-hermetico.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 show origin/fix/k261-teste-hermetico:docs/reviews/088-k261-teste-hermetico.md` · espera: contém 'commit: 0c16aeb52601a49cf7404bb5bfb65a3cec37492b'
