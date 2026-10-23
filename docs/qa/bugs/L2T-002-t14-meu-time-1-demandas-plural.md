# L2T-002 - T14: "Meu time: 1 demandas" (plural fixo na linha do projeto com "outros times" oculto)
- Severidade: baixa
- Responsável sugerido: forge:react-frontend (`web/src/features/complementares/taticas.tsx:612`)
- Ambiente: feature/025-front-taticas @ b6c7673, Chromium, API local com o mock semeado

## Passos para reproduzir
1. Abrir `/tatico?equipe=erp-protheus`, abrir "Mais métricas deste painel", olhar o T14 em "Demandas".
2. Ler a linha do projeto P-0039 (único com "outros times" oculto em demandas).

## Resultado esperado
"Meu time: 1 demanda" (singular com k = 1).

## Resultado obtido
"Meu time: 1 demandas". O mesmo vale para "1 frentes" em frentes quando k = 1. Cosmético; a regra R-1 = B / T14-M1 = B está cumprida.

## Evidência
`innerText` do `t14-fatia-P-0039`: "Meu time: 1 demandas" (teste TT-11 compara o texto atual; ao corrigir o plural, ajustar a expectativa `Meu time: ${k} demandas` do TT-11 e do TT-12 para a forma singular quando k = 1).

## Reteste (2026-10-21, head 5108fcd)
Status: fechado. Corrigido: "Meu time: 1 demanda", "Meu time: 2 demandas", "Meu time: 1 frente"; sem `n` nem total. TT-11 e TT-12 passaram a esperar o singular quando k = 1 (antes do ajuste, os dois falharam contra o head, provando que o texto mudou). 19 de 19 em `tatico-011-lote2.spec.ts`.
