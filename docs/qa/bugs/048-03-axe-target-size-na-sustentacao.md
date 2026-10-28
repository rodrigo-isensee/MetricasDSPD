# 048-03 - Axe `target-size` (séria) na visão Sustentação a 1280 px
- Severidade: alta
- Responsável sugerido: forge:react-frontend
- Ambiente: feature/048-usabilidade, c984b0f5dc621751d488456d6dda19f4ee0d06e7, Chromium 1280x800, build de produção (mock)

## Passos para reproduzir
1. `/operacional?cadencia=sustentacao` a 1280 px; abrir "Mais métricas" (COMP-01) ou ativar a aba P3 da espera invisível (espera-invisivel-nos-paineis).
2. Rodar axe com as tags wcag2a, wcag2aa e wcag22aa.

## Resultado esperado
Zero violações críticas ou sérias. Na base (4137981e) os dois testes passam; a 375 px também passam na branch.

## Resultado obtido
Uma violação `target-size` (impacto sério) em cada teste, repetida em duas execuções: `div[data-testid="leia-junto-s7"] > .gap-x-3.list-none.p-0 > li > a` (COMP-01) e `#..-aba-p3` (espera invisível). Em uma execução isolada sem abrir complementares nem a aba, o axe não acusa (rodada de diagnóstico), o que aponta para o índice fixo novo (`IndiceDeSecoes`, sticky, z-30) sobrepondo o alvo quando a página rola até ele; a causa não foi confirmada no código (QA não corrige).

## Evidência
`e2e/tests/complementares.spec.ts:45` (COMP-01 sustentação, 1280 px) e `e2e/tests/espera-invisivel-nos-paineis.spec.ts:82` (1280 px): `[{"id":"target-size","impacto":"serious",...,"nos":1}]`.
