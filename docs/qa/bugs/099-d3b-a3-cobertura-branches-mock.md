# 099-d3b-a3 - Cobertura de branches do mock em 99,86%
- Severidade: média
- Responsável sugerido: node-backend
- Ambiente: feature/099-d3b-dia-528 @ 079a492d, CI run 43401902961 (job testes)

## Passos para reproduzir
1. `cd packages/mock && TZ=UTC npx vitest run --coverage` no head.

## Resultado esperado
Branches 100% (limiar do projeto).

## Resultado obtido
733 de 734; linha 98 de `packages/mock/src/complementares.ts` (ramo falso de `if (y)` da reabertura) deixou de ser exercido: os chamados do mock mudaram com o calendário de 528 min.

## Evidência
Reproduzido local e no log do run 43401902961; parecer `docs/qa/099-d3b-dia-528.md`, achado A3.
