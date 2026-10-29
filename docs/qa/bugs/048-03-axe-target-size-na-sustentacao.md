# 048-03 - Axe `target-size` (séria) na visão Sustentação a 1280 px
- Estado: ABERTO (reteste em 3db78a9, 2026-10-29). COMP-01 e `aba-p3` passam; CT-29 cai e o percurso de CA-B (USAB-19) acha 5 posições. Causa agora confirmada: alvos parcialmente sob o cabeçalho fixo de 49 px mais o índice de 33 px (82 px).
- Severidade: média (rebaixada de alta: o alvo some só em posições de rolagem específicas; some ao rolar um pouco; a barra de filtros já não é a causa)
- Responsável sugerido: forge:react-frontend (ou UX, se CA-B for revisto: ver abaixo)
- Ambiente: feature/048-usabilidade, 3db78a933da28d41cc4acca3998f7fd0b1f52e62, Chromium 1280x720 e 1280x900, build de produção (mock)

## Passos para reproduzir
1. `/operacional?cadencia=sustentacao` a 1280x720; abrir "Mais métricas".
2. Rolar em passos de 100 px do topo ao fim e rodar axe (regra `target-size`) em cada posição: `e2e/tests/usabilidade-048.spec.ts`, USAB-19.
3. Ou: `sustentacao-no-operacional-qa.spec.ts:380` (CT-29, 1280 px).

## Resultado esperado
CA-B: zero violação séria em todas as posições. CT-29 verde.

## Resultado obtido
USAB-19: violações em y=1700 (`leia-junto-s2`, 3 links), y=1900 e y=4500 (link "ajuda#criterios" do `aviso-criterio`), y=8700 (S8: `alternar-tabela`, "Ocultar esta métrica") e y=9700 (O17, os mesmos botões). CT-29: `leia-junto-s7 li a`, link em top=5 px, altura 24 px, sob o cabeçalho (0 a 49 px) a y=7282.

## Evidência
Duas execuções de CT-29 e uma do USAB-19, todas falhando. Pergunta para o dono ou o UX: CA-B ("todas as posições") é alcançável com qualquer cabeçalho fixo (qualquer alvo que passa por baixo dele fica parcialmente coberto)? Se o critério for relaxado (por exemplo, ignorar alvo sob o cabeçalho em movimento), isso é decisão de UX, não do QA; o teste fica como está até lá. L3-04 caiu uma vez na suíte completa com a mesma regra (botão `aria-controls`) e passou em duas rodadas isoladas.
