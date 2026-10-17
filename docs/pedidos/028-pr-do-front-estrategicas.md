# Pedido 028 — PR do front do lote 1 (estratégicas) do 011

- **Data:** 2026-10-17
- **Origem:** pedido 021 (front do lote 1; uma etapa do tech-lead por pedido, regra do conferente).
- **Modo:** implementar.

## Escopo
- **E1:** PR da branch `feature/011-front-estrategicas` (E9, E6, E7 sem R$, E8) para a develop (squash), depois de review, UX e QA aprovados sobre o commit final; mesclado com os checks verdes; branch e worktree apagadas.

## Etapas
- E1.1 (forge:tech-lead): PR do front do lote 1, mesclado na develop.

## Fora do escopo
- Mexer na `main` (R-MAIN).

## Decisões técnicas do time
- 2026-10-17 — A develop exige a branch atualizada (ruleset; o #108 ficou BEHIND depois do #107). Ordem de merge: primeiro o #109 (operacionais, já atualizado sobre 8516ff8), depois o #108: o tech-lead traz a develop para `feature/011-front-estrategicas` (merge, sem rebase nem `--force`), o review revalida só o que o merge trouxe e o QA revalida com a CI do PR sobre o novo head; então o merge. O pedido 024 vem por último e também traz a develop. Base: relatório do tech-lead (PR #108, merge recusado por "head branch is not up to date").
