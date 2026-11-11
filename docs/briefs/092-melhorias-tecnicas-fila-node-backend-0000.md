## Objetivo
K-174, lote 1 do plano do arquiteto (`docs/analises/092-k174-plano.md`): na biblioteca compartilhada de tempo, os feriados passam a ser guardados como número de dia (só para as datas que fazem a ida e volta exata) e `criarCalendario` copia o `Set`, para o `ehDiaUtil` não montar uma string por dia. Nenhum resultado muda. Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `fix/k174-insumos-carga` (limpa, a partir da develop 7b2325a9; trazer a develop atual antes).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/092-k174-plano.md` (inteiro: lote 1, prova e critério de parada).
- Na worktree: `packages/metricas/src/core/calendario.ts` e os testes dela.

## Entregar
- "E3.1 (node-backend): K-174, na branch fix/k174-insumos-carga, worktree /home/rodrigoisensee/MetricasDSPD-052c (primeira tentativa em fix/k174-docs-contratos-carga, 052g, sem PR)." (E3.1) Nesta volta, o lote 1 do plano.
- (E3) (E3.1) Primeiro, o critério de parada do plano: reproduzir o estouro do `insumos.test.ts` sob carga antes de mudar (se não reproduzir em tentativas razoáveis, pare e relate com a medição; a mudança não segue). Reproduzido: trazer a develop (`git merge origin/develop`, sem rebase), implementar o lote 1 só em `calendario.ts`, com o teste novo que compara o código atual e o novo bit a bit (mesmos resultados para um conjunto amplo de datas, turnos e calendários), cobertura de 100% mantida, `hash-base-mock.mjs --comparar` igual e as páginas do `insumos.test.ts` iguais; medir o tempo a frio do `carregarInsumos` antes e depois (mediana de 10 execuções a frio; alvo do plano: pelo menos 30% menos) e o estouro sumir sob a mesma carga. Testes do pacote com no máximo 2 workers (R-TETO) e o `pnpm run pronto` da raiz. Commit com `Cartão: K-174` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/fix/k174-insumos-carga` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: packages/metricas/src/core/calendario.ts, packages/metricas/src/core/calendario.test.ts, packages/metricas/src/core/calendario-equivalencia.test.ts

## Pronto quando
- PQ-1 (cmd): `pnpm run pronto` (da raiz de `/home/rodrigoisensee/MetricasDSPD-052c`) · espera: rc=0
- PQ-2 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c log -1 --format=%B origin/fix/k174-insumos-carga` · espera: contém 'Cartão: K-174'
