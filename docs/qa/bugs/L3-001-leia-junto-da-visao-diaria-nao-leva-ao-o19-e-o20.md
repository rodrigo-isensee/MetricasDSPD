# L3-001 - "Leia junto" da visão diária não leva ao O19 e ao O20
- Severidade: média
- Responsável sugerido: forge:react-frontend
- Ambiente: feature/026-lote3-operacionais, c72b955, Chromium

## Passos para reproduzir
1. Abrir `/operacional?cadencia=diaria`.
2. No cartão BLOQUEADOS (ou no O1), clicar em "Leia junto: O19 Bloqueios por causa" (O1: "O20 Fluxo cumulativo").

## Resultado esperado
Ir para `/operacional?cadencia=semanal#o19` (`#o20`), abrir "Mais métricas" e levar o foco ao cartão.

## Resultado obtido
Nada acontece: a URL segue em `cadencia=diaria` e o cartão não aparece. `LeiaJunto.tsx` trata O19 e O20 como "mesmo painel" (`c.painel === p.painel`) e chama `irParaComplementar`, mas esses complementares só existem na cadência semanal.

## Evidência
`e2e/tests/intensivo-sistemico.spec.ts:94` (SIS-CONS-02) falha com `bloqueados -> O19 ... não mostra o cartão O19` e `o1 -> O20 ... não mostra o cartão O20`.
