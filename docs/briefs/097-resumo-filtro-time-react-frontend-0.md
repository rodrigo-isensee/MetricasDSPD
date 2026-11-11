## Objetivo
L1 do plano do pedido 097: busca digitando em todo filtro de lista (`FiltroMulti`), aceita pelo dono ("faca suas recomendacoes", 14:05). Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/097-l1-busca` (a partir da develop f4c122f15c05fbf5fea86797c9c348656d11ab36).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/ux/097-filtros-time-busca.md`: a parte da busca (CA-10 a CA-16) e a Q-1 (busca também em listas curtas).
- `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/097-filtros-plano.md`, linha do L1.
- `/home/rodrigoisensee/MetricasDSPD-052c/web/src/features/filtros/FiltroMulti.tsx` e os testes de filtros.

## Entregar
- "E3.1 (react-frontend): L1 do plano, busca no FiltroMulti (E3), na branch feature/097-l1-busca, worktree /home/rodrigoisensee/MetricasDSPD-052c." (E3.1)
- (E3) (E3.1) Campo "Buscar" em todo `FiltroMulti` (também nas listas curtas), que ignora maiúsculas e acentos, anuncia a contagem a leitores de tela, mantém aplicada a seleção que ficou fora da busca, funciona no teclado e na folha mobile, como a especificação; testes dos critérios. Sem mudar quais opções aparecem nem o rótulo dos filtros (outros lotes). Rodar `pnpm run pronto` da raiz da worktree, com no máximo 2 workers (teto do dono: dois terços da máquina). Commits com `Cartão: K-273` e a linha `teto:` se passar de 150 linhas (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/097-l1-busca` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/features/filtros/

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c log -1 --format=%B origin/feature/097-l1-busca` · espera: contém 'Cartão: K-273'
