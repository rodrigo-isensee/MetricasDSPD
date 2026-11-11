## Objetivo
Na implantação do apontamento, `pnpm --filter @metricas-dspd/server exec tsx src/entradas/criterios-apontamento.ts <data>` falha com "Configuração inválida (variáveis: PG_MIGRADOR_URL)" porque, ao contrário de `ref-sync-apontamento.ts` (que chama `process.loadEnvFile` com o `.env` da raiz), não lê o `.env`. Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `fix/k270-criterios-env` (a partir da develop eac38a64b0b580d7c920f4b2b501287f7fb56599).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052g/server/src/entradas/criterios-apontamento.ts` e `/home/rodrigoisensee/MetricasDSPD-052g/server/src/entradas/ref-sync-apontamento.ts` (linhas 1 a 30, o carregamento do `.env`).
- `/home/rodrigoisensee/MetricasDSPD-052g/server/package.json` (scripts `bm:*`) e o trecho de `CHANGELOG.md` que cita `criterios-apontamento`.

## Entregar
- "E1.1 (node-backend): script e roteiro, com teste de que o script existe e usa o mesmo carregador dos bm:*." (E1.1)
- (E1) (E1.1) `criterios-apontamento.ts` passa a carregar o `.env` da raiz do mesmo jeito que `ref-sync-apontamento.ts` (mesma mensagem de falha, nada do `.env` impresso); script `bm:criterios-apontamento` no `server/package.json`; teste que prova a falha honesta sem `.env` e a leitura com um `.env` de teste em diretório temporário (sem base real). Mudança mínima, sem refatorar os outros comandos.
- (E2) (E1.1) No `CHANGELOG.md`, o passo de critérios do roteiro passa a ser `pnpm --filter @metricas-dspd/server run bm:criterios-apontamento <data>`.
- Rodar `pnpm run pronto` da raiz da worktree (no máximo 2 workers, R-TETO). Commit com `Cartão: K-270` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/fix/k270-criterios-env` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- arquivos: server/src/entradas/criterios-apontamento.ts, server/package.json, server/tests/criterios-apontamento-entrada.test.ts, CHANGELOG.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g log -1 --format=%B origin/fix/k270-criterios-env` · espera: contém 'Cartão: K-270'
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g show origin/fix/k270-criterios-env:server/package.json` · espera: contém 'bm:criterios-apontamento'
