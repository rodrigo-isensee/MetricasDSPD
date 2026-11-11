## Objetivo
K-264: os testes de CLI do server (`server/tests/apontamento-entradas.test.ts`, `server/tests/ref-sync-ac-entrada.test.ts`, `server/tests/ref-sync-apontamento-entrada.test.ts`, `server/tests/ref-sync-businessmap-entrada.test.ts`, `server/tests/ref-sync-calendario-entrada.test.ts`) rodam o processo filho com um ambiente só com `PATH`; no sandbox dos agentes o `tsx` não acha pasta temporária gravável e 31 testes falham no `pnpm run pronto` local (no CI passam). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `fix/k264-cli-tmpdir` (a partir da develop 6e42dfb898eb94f1a1e397c6daa4b5ff60cc2f13).

## Ler
- Os cinco arquivos de teste acima, na worktree, e o ponto em que cada um monta o ambiente do processo filho.

## Entregar
- "E5.1 (node-backend): K-264, na branch fix/k264-cli-tmpdir, worktree /home/rodrigoisensee/MetricasDSPD-052g." (E5.1)
- (E5) (E5.1) Passar ao processo filho a variável da pasta temporária do processo do teste (`TMPDIR`, quando definida), sem herdar mais nada do ambiente e sem afrouxar o isolamento do K-261 (o `.env` real continua ignorado); de preferência por um ajudante comum aos cinco testes, só em arquivos de teste. Provar: os cinco arquivos passam rodados com no máximo 2 workers dentro do sandbox (vermelho antes do verde: antes da mudança caem por ENOENT), e o `pnpm run pronto` da raiz da worktree. Commit com `Cartão: K-264` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/fix/k264-cli-tmpdir` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR. Se precisar mudar código de produção, pare e relate antes.
- (E1) (E2) (E3) Nada a entregar aqui: não nesta delegação.
- arquivos: server/tests/apontamento-entradas.test.ts, server/tests/ref-sync-ac-entrada.test.ts, server/tests/ref-sync-apontamento-entrada.test.ts, server/tests/ref-sync-businessmap-entrada.test.ts, server/tests/ref-sync-calendario-entrada.test.ts, server/tests/ajuda-cli-filho.ts

## Pronto quando
- PQ-1 (cmd): `pnpm run pronto` (da raiz de `/home/rodrigoisensee/MetricasDSPD-052g`) · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g log -1 --format=%B origin/fix/k264-cli-tmpdir` · espera: contém 'Cartão: K-264'
