## Objetivo
QA do K-266: branch `fix/k266-seed-tmpdir`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, código em 1d7c4291 (1 linha em `server/tests/seed-recusa-real.pg.test.ts`), review aprovado (52427ad2), base develop 18701297fd058a6cf420c6361c08a264871dfc87. O teste é `.pg` (precisa de PostgreSQL): local ele é pulado; a execução real é o check com banco do CI do PR.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 18701297fd058a6cf420c6361c08a264871dfc87 1d7c4291`.
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/reviews/094-k266-seed-tmpdir.md` (novo).

## Entregar
- "E2.3 (qa-engineer): QA do K-266." (E2.3)
- (E2) (E2.3) Conferir pelo diff que o filho recebe só a pasta temporária a mais (quando definida) e que nenhuma asserção mudou; rodar o arquivo com no máximo 2 workers (R-TETO) e registrar que os casos são pulados sem banco; o typecheck do server. Registrar no parecer que a prova de execução é o check com banco do CI do PR. Grave `docs/qa/094-k266-seed-tmpdir.md` (novo) pela ferramenta Write, uma vez só, com `pedido: 094-lote-testes-e-guia`, `branch: fix/k266-seed-tmpdir`, `commit:` o sha40 de 1d7c4291, veredito, contagem de bugs fora do bloco `## Achados` e `## Achados` só com linhas de achado (vazio se não houver); `forge-check docs` sem erro nele. Commit só do parecer com `Cartão: K-266` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/fix/k266-seed-tmpdir` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/qa/094-k266-seed-tmpdir.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/fix/k266-seed-tmpdir:docs/qa/094-k266-seed-tmpdir.md` · espera: contém 'branch: fix/k266-seed-tmpdir'
