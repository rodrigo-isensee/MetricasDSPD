## Objetivo
Review do K-266: branch `fix/k266-seed-tmpdir`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, commit 1d7c4291 (1 linha em `server/tests/seed-recusa-real.pg.test.ts`), base develop 18701297fd058a6cf420c6361c08a264871dfc87. O teste é `.pg` (com banco) e não roda local; o CI com banco prova.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052d diff 18701297fd058a6cf420c6361c08a264871dfc87 1d7c4291`.

## Entregar
- "E2.2 (tech-lead): review do K-266." (E2.2)
- (E2) (E2.2) Review: o filho passa a receber só a pasta temporária a mais (quando definida), sem herdar outro ambiente e sem mudar asserção; mesma forma do ajudante do K-264. Parecer `docs/reviews/094-k266-seed-tmpdir.md` (novo) pela ferramenta Write, com `pedido: 094-lote-testes-e-guia`, `branch: fix/k266-seed-tmpdir`, `commit:` o sha40 de 1d7c4291 e o veredito; `## Achados` com linhas de até 300 caracteres. Commit só do parecer com `Cartão: K-266` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/fix/k266-seed-tmpdir` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: docs/reviews/094-k266-seed-tmpdir.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d show origin/fix/k266-seed-tmpdir:docs/reviews/094-k266-seed-tmpdir.md` · espera: contém 'branch: fix/k266-seed-tmpdir'
