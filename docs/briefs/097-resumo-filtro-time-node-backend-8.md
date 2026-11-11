## Objetivo
Concluir o L4 do pedido 097 (equipe opcional nas duas tendências do Resumo). A primeira delegação deixou a implementação pronta, sem commit, na worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/097-l4-tendencia-equipe` (a partir da develop f4c122f15c05fbf5fea86797c9c348656d11ab36), e ficou mais de uma hora esperando o `pnpm run pronto` (trava da suíte única e colisão de cobertura com outras suítes). Não refazer o código.

## Ler
- `git -C /home/rodrigoisensee/MetricasDSPD-052g status --short` e `git -C /home/rodrigoisensee/MetricasDSPD-052g diff` (a mudança já feita).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/097-filtros-plano.md`, linha do L4.

## Entregar
- "E1.4 (node-backend): L4 do plano, equipe opcional nas duas tendências (parte servidor do E1), na branch feature/097-l4-tendencia-equipe, worktree /home/rodrigoisensee/MetricasDSPD-052g." (E1.4) Nesta delegação, só concluir.
- (E1) (E1.4) Conferir que a mudança cumpre o L4 (equipe opcional nas duas tendências, cada fonte com as suas equipes, sem comparação entre equipes, `docs:check` ok). Rodar `pnpm run pronto` da raiz da worktree com no máximo 2 workers, em primeiro plano, com `timeout 1500`; se a trava da suíte única estiver presa por processo que não existe mais, relate o arquivo da trava e pare (não apague trava de outro processo). Com o pronto verde, commit com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito por caminho) e push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/097-l4-tendencia-equipe` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: packages/contratos/, packages/metricas/, server/src/, server/tests/, docs/api/, docs/contratos/

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g log -1 --format=%B origin/feature/097-l4-tendencia-equipe` · espera: contém 'Cartão: K-273'
