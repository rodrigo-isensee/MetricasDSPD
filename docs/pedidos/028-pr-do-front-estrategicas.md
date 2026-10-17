# Pedido 028 — PR do front do lote 1 (estratégicas) do 011

- **Data:** 2026-10-17
- **Origem:** pedido 021 (front do lote 1; uma etapa do tech-lead por pedido, regra do conferente).
- **Modo:** implementar.

## Escopo
- E1. PR da branch `feature/011-front-estrategicas` (E9, E6, E7 sem R$, E8) para a develop (squash), depois de review, UX e QA aprovados sobre o commit final; mesclado com os checks verdes; branch e worktree apagadas. · `delegado`

## Etapas
- E1.1 (forge:tech-lead): PR do front do lote 1, mesclado na develop.
- E1.2 (forge:ux-designer): reconferência de UX do delta de `web/src` entre ae3ea92 e e850788, antes do merge (acrescentada em 2026-10-17: aviso do conferente no brief 4; 075a5a8 e 65fcd72 mudaram a interface depois da seção 9).
- E1.3 (forge:tech-lead): volta 8 do review sobre b13dfe68b696e6622b6d5661ad82e56de2678cd8, só o commit de docs da UX (acrescentada em 2026-10-17: o forge-check pr invalidou os pareceres por esse commit).
- E1.4 (forge:qa-engineer): revalidação do QA sobre o head depois da volta 8, com a CI do PR como prova da suíte (acrescentada em 2026-10-17, mesmo motivo).

## Fora do escopo
- Mexer na `main` (R-MAIN).

## Decisões técnicas do time
- 2026-10-17 — A develop exige a branch atualizada (ruleset; o #108 ficou BEHIND depois do #107). Ordem de merge: primeiro o #109 (operacionais, já atualizado sobre 8516ff8), depois o #108: o tech-lead traz a develop para `feature/011-front-estrategicas` (merge, sem rebase nem `--force`), o review revalida só o que o merge trouxe e o QA revalida com a CI do PR sobre o novo head; então o merge. O pedido 024 vem por último e também traz a develop. Base: relatório do tech-lead (PR #108, merge recusado por "head branch is not up to date").
- 2026-10-17 — O commit de docs da UX (b13dfe6) depois do review e do QA invalidou os dois pareceres no forge-check pr (R-REVIEW, R-QA). Decisão técnica do time: não contornar; volta 8 do review e revalidação do QA só sobre esse commit, depois o merge pelo brief 5 (retomado). Base: relatório do tech-lead (brief 5) e R-CONFORMIDADE.
- 2026-10-17 — Conferência da entrega da volta 8 (brief 6): PQ-1 a PQ-3 cumpridos, etapa em ordem; o "escopo: fora" vem do diff acumulado da branch desde a develop (lotes anteriores). Os commits deste brief (b13dfe6...cb68ace) tocam só `docs/reviews/011-front-estrategicas.md`. Decisão técnica do Jarvis: entrega aceita, não conta como retrabalho. Base: diff dos commits do brief citado pelo próprio conferente.
