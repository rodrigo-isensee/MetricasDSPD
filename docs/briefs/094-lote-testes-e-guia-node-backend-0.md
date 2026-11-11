## Objetivo
K-266: `server/tests/seed-recusa-real.pg.test.ts`, linha 108, roda o processo filho (`pnpm exec tsx`) só com `PATH` e `HOME`, sem a pasta temporária; no sandbox dos agentes o `tsx` falha por ENOENT, o mesmo padrão corrigido no K-264, que criou um ajudante comum na branch dele (ajuda-cli-filho, novo, ainda fora da develop). Worktree `/home/rodrigoisensee/MetricasDSPD-052d`, branch `fix/k266-seed-tmpdir` (a partir da develop 18701297fd058a6cf420c6361c08a264871dfc87, que ainda não tem o K-264).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/server/tests/seed-recusa-real.pg.test.ts`.
- O ajudante do K-264, que só existe na branch dele (`fix/k264-cli-tmpdir`, PR em aberto): ler com `git show` sobre essa branch, arquivo ajuda-cli-filho na pasta server/tests.

## Entregar
- "E2.1 (node-backend): K-266, na branch fix/k266-seed-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052d." (E2.1)
- (E2) (E2.1) Passar ao filho a pasta temporária do processo do teste (`TMPDIR`, quando definida), sem herdar mais nada e sem mudar asserção; como o ajudante do K-264 ainda não está na develop, fazer o ajuste local no próprio arquivo, do mesmo jeito do ajudante (o PR que entrar depois junta os dois). O teste é `.pg` (precisa de banco): não rodá-lo; provar com `pnpm --dir server exec tsc --noEmit` e o lint do arquivo, e deixar a execução ao check com banco do CI do PR. Commit com `Cartão: K-266` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052d push origin HEAD:refs/heads/fix/k266-seed-tmpdir` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: server/tests/seed-recusa-real.pg.test.ts

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052d log -1 --format=%B origin/fix/k266-seed-tmpdir` · espera: contém 'Cartão: K-266'
