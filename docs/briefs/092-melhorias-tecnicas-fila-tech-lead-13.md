## Objetivo
PR do K-268 para a develop: branch `fix/k268-simulado-intermitente`, worktree `/home/rodrigoisensee/MetricasDSPD-052d`, head a20b357c (código 52aa703d só em `web/src/features/coleta/simulado.test.tsx`; review aprovado em 41ce5e3d; QA aprovado em a20b357c, 0 bugs, 20 de 20), base develop d8d52103c20837fce3ece3d5bed5f6c68c88c8a2.

## Ler
- `/home/rodrigoisensee/MetricasDSPD-052d/docs/reviews/092-k268-simulado.md` e `/home/rodrigoisensee/MetricasDSPD-052d/docs/qa/092-k268-simulado.md`.

## Entregar
- "E6.4 (tech-lead): PR do K-268; o merge é do dono." (E6.4)
- (E6) (E6.4) Abrir o PR da branch para a `develop` (squash) pelo gh, com título e corpo curtos (o que mudou, review e QA com os caminhos dos pareceres, `Cartão: K-268`); se a branch estiver atrás da develop, atualizar só por merge da develop na branch (sem rebase nem force) e relatar o novo head. Esperar os checks do PR e relatar o estado de cada um (falha: nome do check e linha do erro). Não mesclar: o merge é do dono.
- (E1) (E2) (E3) (E5) Nada a entregar aqui: não nesta delegação.
- arquivos: web/src/features/coleta/simulado.test.tsx, docs/reviews/092-k268-simulado.md

## Pronto quando
- PQ-1 (cmd): `gh pr list --head fix/k268-simulado-intermitente --state open --json number` · espera: contém 'number'
