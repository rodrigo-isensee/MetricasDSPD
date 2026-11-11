## Objetivo
Volta 2 do L1 do pedido 097 (busca nos filtros): o QA reprovou de novo por um furo de cobertura. Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/097-l1-busca`, head 6b7f8730 (código 86a6c85e).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/qa/097-l1-busca.md` (o A1).
- `/home/rodrigoisensee/MetricasDSPD-052c/web/src/features/filtros/FiltroMulti.tsx` (linhas 90 a 110).

## Entregar
- "E3.1 (react-frontend): L1 do plano, busca no FiltroMulti (E3), na branch feature/097-l1-busca, worktree /home/rodrigoisensee/MetricasDSPD-052c." (E3.1) Nesta volta, o A1 do QA.
- (E3) (E3.1) A cobertura do web tem de voltar a 100%: o `setBusca('')` do Esc em `aoTeclarLista` (`FiltroMulti.tsx:101`, foco numa caixa de opção com texto na busca) não tem teste. Cobrir com teste no Popover e na folha (Esc com o foco numa opção limpa a busca, como o CA-16), ou remover a linha se o comportamento não for o especificado, dizendo qual. Rodar `web/src/features/filtros` com no máximo 2 workers e depois a cobertura só do web (`pnpm --filter @metricas-dspd/web exec vitest run --coverage --maxWorkers=2`, em segundo plano, cerca de 9 min), conferindo os 100%. Commit com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/097-l1-busca` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/features/filtros/

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c log -1 --format=%B origin/feature/097-l1-busca` · espera: contém 'Cartão: K-273'
