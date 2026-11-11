## Objetivo
PR do K-272 para a develop: branch `fix/k272-ap-tipo-categoria`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, head 5fd965c5 (código 1d691f4e, já com o merge da develop em dbd120a4; QA revalidado em 39dabe31 e review revalidado em 5fd965c5, ambos aprovados, A3 recomendado). A branch já está em dia com a develop e enviada.

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/097-k272-ap-tipo.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/097-k272-ap-tipo.md`.

## Entregar
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." (E6.4)
- (E6) (E6.4) Se a develop andar de novo, atualizar só por merge (sem rebase nem force), relatar o novo head e parar antes do PR; rodar da worktree `forge-check pr 097-resumo-filtro-time --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD` (pendência: pare e relate). Abrir o PR para a `develop` (squash) pelo gh, com corpo curto: o defeito (rótulo "Trabalho de produto" repetido no AP-TIPO), a decisão do dono "Agrupar", os pareceres de QA e review, o A3 recomendado, e `Cartão: K-272`. Esperar os checks e relatar cada um (falha: nome e linha do erro). Não mesclar: o merge é do dono.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: server/src/modulos/apontamento/, server/tests/apontamento-rota.test.ts, docs/reviews/097-k272-ap-tipo.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/k272-ap-tipo-categoria --state all --json number` · espera: contém 'number'
