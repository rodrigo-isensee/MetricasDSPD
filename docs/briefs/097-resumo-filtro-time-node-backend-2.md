## Objetivo
Volta 1 do K-272: o review (docs/reviews/097-k272-ap-tipo.md, reprovado em d4f4037f) achou um bloqueante. Worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, branch `fix/k272-ap-tipo-categoria`, head d4f4037f (código 59fd6ba9).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/097-k272-ap-tipo.md` (só `## Achados` e as sondas) e `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/097-k272-ap-tipo.md` (a observação sobre "Sem tipo").
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/server/src/modulos/apontamento/servico.ts` (linhas 120 a 170) e `repositorio.ts`.

## Entregar
- "E6.1 (node-backend): K-272, agrupar por categoria no AP-TIPO, no filtro tipo e em lerCardsIncompletos, na branch fix/k272-ap-tipo-categoria, worktree /home/rodrigoisensee/Metricas/MetricasDSPD-041." (E6.1) Nesta volta, o A1 e o A2 do review.
- (E6) (E6.1) A1 (bloqueante): o id da opção de cada categoria e o conjunto de type_id que um valor `tipo=` cobre saem do histórico (todas as datas), não só das linhas da janela; assim um link guardado com qualquer type_id da categoria filtra todos os type_id dela em qualquer período. Sem mudar o contrato. A2: teste do caso do A1 (janela sem o menor type_id, link com o menor type_id, a categoria não zera) e teste da linha "Sem tipo" em `porTipo`. Rodar `pnpm run pronto` da raiz da worktree. Commit com `Cartão: K-272` (por `git commit -F` de arquivo gravado por Write no scratchpad, `git add` explícito); push em segundo plano, esperando o fim, com `env PATH=/home/rodrigoisensee/.nvm/versions/node/v24.22.1/bin:/usr/local/bin:/usr/bin:/bin git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 push origin HEAD:refs/heads/fix/k272-ap-tipo-categoria` (`github.com` em allowed_domains); commit e push em chamadas separadas; sem PR.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: server/src/modulos/apontamento/, server/tests/

## Pronto quando
- PQ-1 (cmd): `git -C /home/rodrigoisensee/Metricas/MetricasDSPD-041 log -1 --format=%B origin/fix/k272-ap-tipo-categoria` · espera: contém 'Cartão: K-272'
