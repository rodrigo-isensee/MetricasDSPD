# Pedido 020 — PR do lote 1 (estratégicas) do back da fase 2 do 011

- **Data:** 2026-10-17
- **Origem:** pedido 011 (decisão do usuário de 2026-10-17: métricas por nível, em lotes separados; "4-seguir").
- **Modo:** implementar.
- **Divisão:** os PRs das táticas e das operacionais ficam nos pedidos 022 e 023, porque cada papel só pode ter uma etapa por pedido (regra do conferente).

## Escopo
- **E1:** PR da branch `feature/011-fase2-estrategicas` (E6, E7 com R$, E8) para a develop (squash), aberto depois de review, segurança e QA aprovados sobre o commit final, e mesclado com os checks verdes.

## Etapas
- E1.1 (forge:tech-lead): PR do lote 1 (estratégicas), mesclado na develop.

## Fora do escopo
- Os PRs dos lotes 2 e 3 (pedidos 022 e 023) e a promoção para a homolog (pedido 023).
- Mexer na `main` (R-MAIN).

## Andamento
- 2026-10-17 — O #104 foi aberto antes das revalidações (do merge da develop): review 82660ae, QA 23f3be3. Decisão técnica do time: fechar o #104 e abrir um PR novo da mesma branch, depois dos pareceres, para a ordem das etapas valer.
