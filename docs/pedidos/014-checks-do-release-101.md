# Pedido 014 — Checks do PR #101

- **Data:** 2026-10-17
- **Origem:** retomada de 2026-10-17; saiu do pedido 012.
- **Modo:** implementar.

## Escopo
- **E1:** checks vermelhos do PR #101 (homolog → main): `perf` e `homolog-aprovada`. Diagnosticar e rerodar; o merge é do dono.

## Etapas
- E1.1 (forge:devops-engineer): checks vermelhos do #101.
- E1.2 (dono): merge do #101 na main.

## Fora do escopo
- A espera do `homolog-aprovada` pelo portão (K-108): pedido 016.
- Mexer na `main` (R-MAIN).

## Suposições
- O #101 só leva o registro da versão 0.16.0 (#99/#100); os checks vermelhos são a mesma corrida e o mesmo ruído do #96. Base: parecer de devops de 2026-10-16, seção "Release #96".
