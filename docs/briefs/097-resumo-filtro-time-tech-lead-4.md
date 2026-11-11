## Objetivo
PR do K-272 para a develop: branch `fix/k272-ap-tipo-categoria`, worktree `/home/rodrigoisensee/Metricas/MetricasDSPD-041`, head 9b553443 (código 1d691f4e; QA aprovado em d7702b7b; review aprovado em 9b553443 com A3 recomendado). A develop andou (a ponta de `origin/develop` já tem os PRs 316 a 320).

## Ler
- `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/reviews/097-k272-ap-tipo.md` e `/home/rodrigoisensee/Metricas/MetricasDSPD-041/docs/qa/097-k272-ap-tipo.md`.

## Entregar
- "E6.4 (tech-lead): PR do K-272 para a develop; o merge é do dono." (E6.4)
- (E6) (E6.4) Atualizar a branch com a develop só por merge (sem rebase nem force) e relatar o novo head; rodar da worktree `forge-check pr 097-resumo-filtro-time --raiz-pedidos /home/rodrigoisensee/Metricas/MetricasDSPD` (pendência: pare e relate). Abrir o PR para a `develop` (squash) pelo gh, com corpo curto: o defeito (rótulo "Trabalho de produto" repetido no AP-TIPO), a decisão do dono "Agrupar", os pareceres de QA e review, o A3 recomendado, e `Cartão: K-272`. Esperar os checks e relatar cada um (falha: nome e linha do erro). Não mesclar: o merge é do dono.
- (E1) (E2) (E3) (E4) (E5) (E7) Nada a entregar aqui: não nesta delegação.
- arquivos: server/src/modulos/apontamento/, server/tests/apontamento-rota.test.ts, docs/reviews/097-k272-ap-tipo.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/k272-ap-tipo-categoria --state all --json number` · espera: contém 'number'
