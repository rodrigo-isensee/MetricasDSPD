## Objetivo
Volta 1 do L1 do pedido 097 (busca nos filtros): o QA reprovou por um bug médio. Worktree `/home/rodrigoisensee/MetricasDSPD-052c`, branch `feature/097-l1-busca`, head 7a41ae85 (código b3b1a6cd).

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/qa/097-l1-busca.md` (o B1).
- `/home/rodrigoisensee/MetricasDSPD-052c/web/src/features/filtros/FiltroMulti.tsx` (linhas 80 a 110 e 260 a 290).

## Entregar
- "E3.1 (react-frontend): L1 do plano, busca no FiltroMulti (E3), na branch feature/097-l1-busca, worktree /home/rodrigoisensee/MetricasDSPD-052c." (E3.1) Nesta volta, o B1 do QA.
- (E3) (E3.1) B1: na folha mobile (variante `lista`, dentro do Dialog), Esc com texto no campo tem de só limpar o texto, sem fechar a folha; sem texto, fecha e devolve o foco, como no Popover (CA-14 e CA-16). Teste que cobre o Esc na folha com e sem texto. Rodar `pnpm run pronto` da raiz da worktree com no máximo 2 workers, em primeiro plano, com `timeout 1500` (se a trava da suíte única estiver presa por processo que não existe mais, relate e pare). Commit com `Cartão: K-273` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/MetricasDSPD-052c push origin HEAD:refs/heads/feature/097-l1-busca` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E4) (E5) (E6) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/features/filtros/

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/MetricasDSPD-052c log -1 --format=%B origin/feature/097-l1-busca` · espera: contém 'Cartão: K-273'
