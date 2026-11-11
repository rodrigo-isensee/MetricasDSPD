## Objetivo
Volta 3 do L1 do pedido 097 (busca nos filtros): o review reprovou com dois bloqueantes. Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/097-l1-busca`, head d7623585 (código b5d206ef). É a última volta permitida (máx. 3); se algo não couber, pare e relate.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/reviews/097-l1-busca.md` (A1 a A4 e as sondas S1 e S2).
- `/home/rodrigoisensee/MetricasDSPD-052c/web/src/features/filtros/BarraFiltros.tsx` (perto da linha 217) e `FiltroMulti.tsx` (linhas 90 a 110 e 270 a 280).
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/tecnica/arquitetura-front.md`, seção 4 (filtros).

## Entregar
- "E3.1 (react-frontend): L1 do plano, busca no FiltroMulti (E3), na branch feature/097-l1-busca, worktree /home/rodrigoisensee/MetricasDSPD-052c." (E3.1) Nesta volta, o A1 e o A2 do review, e o A3 e o A4 se couberem.
- (E3) (E3.1) A1: na folha mobile, o Dialog decide pelo campo de busca focado (como o Popover): Esc com texto no campo focado só limpa esse texto; com o foco em outro filtro ou em "Ver resultados", o Esc fecha a folha, mesmo que outro campo tenha texto; testes das sondas S1 e S2. A2: registrar na seção 4 de `docs/tecnica/arquitetura-front.md` a busca nos filtros (estado local fora da URL e a regra do Esc entre o FiltroMulti e o Popover/Dialog). A3: a regra "Esc com texto limpa" num só lugar. A4: nome acessível de cada campo de busca diferente na folha (por exemplo "Buscar em Equipe"). Rodar `web/src/features/filtros` com no máximo 2 workers e a cobertura só do web (`pnpm --filter @metricas-dspd/web exec vitest run --coverage --maxWorkers=2`, em segundo plano, cerca de 9 min), conferindo os 100%. Commit com `Cartão: K-273` e a linha `teto:` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/097-l1-busca` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/features/filtros/, docs/tecnica/arquitetura-front.md

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c log -1 --format=%B origin/feature/097-l1-busca` · espera: contém 'Cartão: K-273'
