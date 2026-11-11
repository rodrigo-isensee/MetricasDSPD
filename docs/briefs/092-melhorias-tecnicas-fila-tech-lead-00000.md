## Objetivo
Review do K-264: branch `fix/k264-cli-tmpdir`, worktree `/home/rodrigoisensee/MetricasDSPD-052g`, commit 6d2e15be (base develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13), `pnpm run pronto` verde pelo autor dentro do sandbox.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g diff 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13 6d2e15be`.

## Entregar
- "E5.2 (tech-lead): review do K-264." (E5.2)
- (E5) (E5.2) Review: o ajudante `server/tests/ajuda-cli-filho.ts` repassa ao filho só `PATH` e, quando definida, a pasta temporária, mais o que cada teste pede; o `.env` real continua ignorado (isolamento do K-261 mantido); nenhuma asserção dos cinco testes foi afrouxada; nada de produção mudou. Rodar os cinco arquivos com no máximo 2 workers (R-TETO). Parecer `docs/reviews/092-k264-cli-tmpdir.md` (novo) pela ferramenta Write, com `pedido: 092-melhorias-tecnicas-fila`, `branch: fix/k264-cli-tmpdir`, `commit:` o sha40 de 6d2e15be e o veredito; `## Achados` só com linhas de achado de até 300 caracteres; `forge-check docs` sem erro nele. Commit só do parecer com `Cartão: K-264` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/fix/k264-cli-tmpdir` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/092-k264-cli-tmpdir.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/fix/k264-cli-tmpdir:docs/reviews/092-k264-cli-tmpdir.md` · espera: contém 'branch: fix/k264-cli-tmpdir'
