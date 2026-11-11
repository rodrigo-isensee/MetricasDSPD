## Objetivo
L4 do plano do pedido 097: parâmetro `equipe` opcional nas duas tendências do Resumo (parte servidor do E1; os cartões do Resumo já aceitam `equipe`). Worktree `/home/rodrigoisensee/MetricasDSPD-052g`, branch `feature/097-l4-tendencia-equipe` (a partir da develop f4c122f15c05fbf5fea86797c9c348656d11ab36).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/097-filtros-plano.md`, a parte (c) e a linha do L4.
- `/home/rodrigoisensee/MetricasDSPD-052g/docs/contratos/politica-de-mudanca.md` (entrada nova opcional).

## Entregar
- "E1.4 (node-backend): L4 do plano, equipe opcional nas duas tendências (parte servidor do E1), na branch feature/097-l4-tendencia-equipe, worktree /home/rodrigoisensee/MetricasDSPD-052g." (E1.4)
- (E1) (E1.4) `equipe` opcional no contrato das duas tendências (`queryTendenciaSchema`), validado pelo mesmo `idSlug`, aplicado na biblioteca de fluxo e na de sustentação, cada uma com as equipes da sua fonte (nunca misturar BusinessMap e Acelerato); sem agregação que compare equipes; testes de contrato e de filtro; `docs:check` (mudança compatível). Rodar `pnpm run pronto` da raiz da worktree, com no máximo 2 workers (teto do dono: dois terços da máquina). Commits com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052g push origin HEAD:refs/heads/feature/097-l4-tendencia-equipe` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E2) (E3) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: packages/contratos/, packages/metricas/, server/src/, server/tests/, docs/api/, docs/contratos/

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052g log -1 --format=%B origin/feature/097-l4-tendencia-equipe` · espera: contém 'Cartão: K-273'
