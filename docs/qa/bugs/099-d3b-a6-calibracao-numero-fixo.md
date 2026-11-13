# 099-d3b-a6 - calibracao.test.tsx fixa o número do mock que o D3b mudou
- Severidade: média (só teste; o produto não regrediu). Estado: resolvido em 3084d59b
- Responsável sugerido: react-frontend
- Ambiente: feature/099-d3b-dia-528 em 8deaa7a2 (código igual a 09b21da3), run CI 43405362537, job `testes`, passo `pnpm run cobertura` (web)

## Passos para reproduzir
1. `cd web && TZ=UTC npx vitest run src/features/coleta/calibracao.test.tsx`

## Resultado esperado
Os 15 testes passam: a linha da base mock regravada (hashAcelerato b047a163) é a verdade do D3b.

## Resultado obtido
1 falha, linha 163: espera `88,9% · 144 de 162` na tabela `tabela-S2-detalhe` e recebe, para P2, `89,6% · 146 de 163` (restauração 74,2% · 121 de 163). O mock do Acelerato gera chamados medidos pelo dia de 528 min, então k e n mudam. Reproduzido local.

## Evidência
Run 43405362537 (testes: failure); local: `Tests 1 failed | 14 passed (15)`. O arquivo não foi tocado pelo D3b (`git diff 4c4a7a33 -- web/src/features/coleta/calibracao.test.tsx` vazio). Escapou ao QA no E3.97 porque os testes web rodados foram só os de sustentação, complementares, preferências, formatar e paridade.
