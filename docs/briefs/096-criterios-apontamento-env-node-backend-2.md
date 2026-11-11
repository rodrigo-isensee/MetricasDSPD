## Objetivo
K-271: os recomendados da segurança e do review do K-270 na entrada `criterios-apontamento` (já na develop pelo PR 319). Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041b`, branch `fix/k271-criterios-robustez` (a partir da develop 00758ca1151a23148b5e41880c515098e47f75d2).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/security/096-criterios-apontamento-env.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/docs/reviews/096-criterios-apontamento-env.md` (só `## Achados`).
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041b/server/src/entradas/criterios-apontamento.ts` e `ref-sync-apontamento.ts` (o modelo de tratamento de erro e de data).

## Entregar
- "E2.1 (node-backend): K-271, recomendados da segurança (A1 erro do banco só pela categoria; A2 data por dataCivilValida e quantidade de argumentos) e do review (A2 uso com o nome do script; A3 teste do ramo não ENOENT) na entrada criterios-apontamento, na branch fix/k271-criterios-robustez, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041b." (E2.1)
- (E3) (E2.1) Na falha do banco, imprimir só a categoria (`categoriaDoErro`), nunca a pilha, host, porta ou usuário; validar a data com `dataCivilValida` e recusar argumento a mais, com a mensagem de uso trazendo o nome do script `bm:criterios-apontamento`; teste do ramo de falha que não é ENOENT na leitura do `.env`. Sem extrair o carregador repetido (é outro cartão). Rodar `pnpm run pronto` da raiz da worktree, com no máximo 2 workers (teto do dono). Commit com `Cartão: K-271` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b push origin HEAD:refs/heads/fix/k271-criterios-robustez` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) Nada a entregar aqui: não nesta delegação.
- arquivos: server/src/entradas/criterios-apontamento.ts, server/tests/criterios-apontamento-entrada.test.ts

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041b log -1 --format=%B origin/fix/k271-criterios-robustez` · espera: contém 'Cartão: K-271'
