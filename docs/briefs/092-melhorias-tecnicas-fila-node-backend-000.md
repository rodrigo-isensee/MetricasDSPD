## Objetivo
K-174, segunda tentativa: na primeira tentativa (branch fix/k174-docs-contratos-carga, sem PR), o teste "as páginas geradas coincidem com o código" de `tools/docs-contratos/src/insumos.test.ts` gastou só 26 a 67 ms; o custo real é o `carregarInsumos(RAIZ)` no nível do módulo, cerca de 1,2 s a frio, que sob carga derruba o arquivo e o pronto. Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `fix/k174-insumos-carga` (a partir da develop 7b2325a91a80f78f309755d7bc69afee71ec3608).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052c/tools/docs-contratos/src/insumos.ts` e `/home/rodrigoisensee/MetricasDSPD-052c/tools/docs-contratos/src/insumos.test.ts`.
- O Histórico do pedido 092 de 09:22 (medição da primeira tentativa).

## Entregar
- "E3.1 (node-backend): K-174, na branch fix/k174-docs-contratos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052g." (E3.1) Nesta volta, na branch `fix/k174-insumos-carga` (worktree 052c), com a pista da primeira tentativa.
- (E3) (E3.1) Medir onde o `carregarInsumos` gasta o tempo a frio (perfil simples por etapa) e torná-lo mais barato sem mudar o que ele devolve (mesmos insumos, mesma ordem, mesmas páginas geradas): por exemplo, ler e analisar cada arquivo uma vez, evitar trabalho repetido ou importar menos na carga. Se o ganho exigir mudar o contrato do módulo, pare e relate. Sem aumentar timeout nem retry. Prova: tempo a frio antes e depois, os testes de `tools/docs-contratos` verdes com no máximo 2 workers (R-TETO), `pnpm run docs:check` igual (mesmas páginas) e o `pnpm run pronto` da raiz da worktree. Commit com `Cartão: K-174` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/fix/k174-insumos-carga` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR (o PR vem depois da release 093).
- (E1) (E2) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: tools/docs-contratos/src/insumos.ts, tools/docs-contratos/src/insumos.test.ts

## Pronto quando
- PQ-1 (cmd): `pnpm --dir /home/rodrigoisensee/MetricasDSPD-052c/tools/docs-contratos test` · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c log -1 --format=%B origin/fix/k174-insumos-carga` · espera: contém 'Cartão: K-174'
