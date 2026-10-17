# Pedido 032 — Nova promoção develop → homolog e PR de release aberto para a main

- **Data:** 2026-10-17
- **Origem:** pedido 031 (o antigo E4 saiu dele: uma etapa do tech-lead por pedido, regra do conferente); usuário: "Depois atualize a hml e deixe o pr aberto para main".
- **Modo:** implementar.
- **Clareza:** alta; depende do pedido 031 concluído (documentação do quadro na develop).

## Escopo
- E1. Promover a develop para a homolog, com parecer próprio de review e de QA da promoção (decisão do dono de 2026-10-17, pedido 023), e abrir o PR de release homolog → main, sem mesclar. · `confirmado`

## Etapas
- E1.1 (forge:tech-lead): parecer de review da promoção, PR de documentação dos pareceres, promoção develop → homolog e PR de release aberto.
- E1.2 (forge:qa-engineer): parecer de QA da promoção.
- E1.3 (dono): validar a homolog e mesclar o PR de release na `main`.

## Decisões do usuário
- 2026-10-17 — DECISÃO DO DONO (pedido 023): "A regra do projeto nunca passa sobre a fábrica"; a promoção tem parecer próprio de review e de QA.

## Fora do escopo
- Os PRs do Dependabot e o pedido 030 (não prontos); mexer na `main` (R-MAIN).
