# Pedido 015 — montecarlo.test.ts instável por semente aleatória (K-107)

- **Data:** 2026-10-17
- **Origem:** falha no PR #96 (parecer de devops de 2026-10-16); saiu do pedido 012.
- **Modo:** implementar.

## Escopo
- **E1:** corrigir a propriedade "mais itens nunca terminam antes (mesma semente)" do `montecarlo.test.ts` (semente fixa, tolerância à interpolação ou mais simulações), sem afrouxar o que ela prova.

## Etapas
- E1.1 (forge:node-backend): corrigir o montecarlo.test.ts instável.
- E1.2 (forge:tech-lead): review do montecarlo.
- E1.3 (forge:qa-engineer): QA do montecarlo.

## Fora do escopo
- Mexer na `main` (R-MAIN).
