## Objetivo
PR do lote 1 do K-174 para a develop: branch `fix/k174-insumos-carga`, worktree `/home/rodrigoisensee/MetricasDSPD-052c`, head 9efaf446 (código e722029a na biblioteca de tempo; review aprovado em 3ec5fbe1; QA aprovado em 9efaf446 com A1 recomendado: ganho a frio medido de cerca de -6% no carregarInsumos e -24% na geração do mock, abaixo dos -34% do autor e do limiar de 30% do plano), base develop d8d52103c20837fce3ece3d5bed5f6c68c88c8a2.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052c/docs/reviews/092-k174-calendario.md`, `/home/rodrigoisensee/MetricasDSPD-052c/docs/qa/092-k174-calendario.md` e a seção do critério de parada de `/home/rodrigoisensee/Metricas/MetricasDSPD/docs/analises/092-k174-plano.md`.

## Entregar
- "E3.4 (tech-lead): PR do K-174 para a develop; o merge é do dono." (E3.4)
- (E3) (E3.4) Abrir o PR da branch para a `develop` (squash) pelo gh, com título e corpo curtos: o que mudou, review e QA com os caminhos dos pareceres, o diff acima do teto de 150 linhas por causa do teste de equivalência (declarado), o ganho medido pelo QA (não o do autor) e `Cartão: K-174`. No relatório, a decisão técnica sobre o A1 do QA à luz do critério de parada do plano: lote 2 vem, ou o cartão fecha com o ganho do lote 1, com o motivo. Se a branch estiver atrás da develop, atualizar só por merge da develop na branch (sem rebase nem force) e relatar o novo head. Esperar os checks do PR e relatar o estado de cada um (falha: nome do check e linha do erro). Não mesclar: o merge é do dono.
- (E1) (E2) (E5) (E6) Nada a entregar aqui: não nesta delegação.
- arquivos: packages/metricas/src/core/calendario.ts, packages/metricas/src/core/calendario-equivalencia.test.ts, docs/reviews/092-k174-calendario.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/k174-insumos-carga --state open --json number` · espera: contém 'number'
