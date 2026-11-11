## Objetivo
Corrigir o BUG-088-QA1 (cartão K-261): no teste `server/tests/ref-sync-apontamento-entrada.test.ts`, o caso "sem configuração" (linha 53) depende do `.env` da raiz, que a entrada do comando carrega por `process.loadEnvFile`; em máquina com `.env` que define `PG_REF_URL`, o resultado vira "conexão" e o teste cai. No CI (sem `.env`) passa. Worktree `/home/rodrigoisensee/MetricasDSPD-056`, branch `fix/k261-teste-hermetico`, a partir da develop 129fc3d5.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-056/server/tests/ref-sync-apontamento-entrada.test.ts` (inteiro).
- A entrada do comando `bm:ref-sync-apontamento` que o teste executa (o caminho está no próprio teste) e o ponto onde ela chama `process.loadEnvFile`.
- `/home/rodrigoisensee/MetricasDSPD-056d/docs/qa/chore-forge-0455.md`: só o achado A1.

## Entregar
- "E1.7 (node-backend): correção do BUG-088-QA1 (K-261): o teste `server/tests/ref-sync-apontamento-entrada.test.ts` do caso sem configuração fica hermético (não depende do .env da máquina), na branch fix/k261-teste-hermetico a partir da develop, worktree /home/rodrigoisensee/MetricasDSPD-056." (E1.7)
- (E1.7) Tornar o caso hermético sem afrouxar a asserção (segue exigindo código 1 e exatamente `configuração: PG_REF_URL`): o processo filho do teste não pode herdar `PG_REF_URL` nem carregar o `.env` da raiz do repositório (por exemplo, rodar o filho com `cwd` numa pasta temporária sem `.env`, ou um mecanismo explícito e testado de não carregar o arquivo). Se a solução mudar a entrada de produção, a mudança é mínima, não muda o comportamento em produção (o `.env` continua sendo lido quando o comando roda normalmente) e ganha teste. Prova: o teste passa com um `.env` de mentira, criado pelo próprio teste numa pasta temporária, que define `PG_REF_URL`; nunca leia nem crie o `.env` real da raiz.
- (E1.7) Rodar só os testes afetados, com no máximo 2 workers, e o comando de pronto do projeto (`pnpm run pronto`, da raiz da worktree). Commit com `Cartão: K-261` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em primeiro plano, timeout de 600 s, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-056 push -u origin HEAD:refs/heads/fix/k261-teste-hermetico` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: server/tests/ref-sync-apontamento-entrada.test.ts

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-056 log -1 --format=%B origin/fix/k261-teste-hermetico` · espera: contém 'Cartão: K-261'
- PQ-2 (cmd): `pnpm run pronto` (da raiz da worktree) · espera: rc=0
