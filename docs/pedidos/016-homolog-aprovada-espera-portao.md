# Pedido 016 — homolog-aprovada espera o portão (K-108)

- **Data:** 2026-10-17
- **Origem:** corrida vista no #90, no #96 e no #101 (parecer de devops de 2026-10-16); saiu do pedido 012.
- **Modo:** implementar.

## Escopo
- **E1:** o check `homolog-aprovada` espera o portão de homolog do mesmo SHA terminar (poll com timeout) em vez de falhar na hora.

## Etapas
- E1.1 (forge:devops-engineer): homolog-aprovada espera o portão.
- E1.2 (forge:tech-lead): review do homolog-aprovada.

## Fora do escopo
- Mexer na `main` (R-MAIN).
