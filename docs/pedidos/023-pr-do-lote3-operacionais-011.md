# Pedido 023 — PR do lote 3 (operacionais) do back da fase 2 do 011 e promoção para a homolog

- **Data:** 2026-10-17
- **Origem:** pedido 020 (divisão: uma etapa do tech-lead por pedido).
- **Modo:** implementar.

## Escopo
- **E1:** PR da branch `feature/011-fase2-operacionais` (O22, O26) para a develop (squash), depois do merge do lote 2 e de review, segurança e QA aprovados sobre o commit final; em seguida, a promoção develop → homolog (merge commit), com o portão verde.

## Etapas
- E1.1 (forge:tech-lead): PR do lote 3 (operacionais), mesclado na develop, e promoção para a homolog.
- E1.2 (dono): merge do release homolog → main.

## Decisões do usuário
- 2026-10-17 (noite): "Vou dormir toque tudo que puder até a homolog": o time avança sozinho até a promoção develop → homolog; decisões de produto esperam a manhã. A promoção sai depois do pedido 024 (E7 sem R$) e do front do lote 1 (pedido 028) na develop, para a homolog não receber o E7 em R$ com o front já sem R$ (D2 = A, pedido 011).

## Fora do escopo
- Mexer na `main` (R-MAIN).
