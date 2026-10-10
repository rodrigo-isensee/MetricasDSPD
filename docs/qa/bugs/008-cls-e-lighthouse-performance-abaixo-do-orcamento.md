# 008 - CLS alto e Lighthouse Performance abaixo de 90 nos painéis; tarefa longa > 200 ms
- Severidade: alta (itens bloqueantes do orçamento da ADR 0003: F2, F10, C6)
- Responsável sugerido: react-frontend
- Ambiente: develop dd1be98, build com VITE_MOCK_LATENCIA=0, Chromium 1366x768, WSL2

## Passos para reproduzir
`cd e2e && npm run lighthouse` e `E2E_SEM_ALT=1 npx playwright test --project=perf -g "F2"`.

## Resultado esperado
CLS dentro do orçamento, Lighthouse Performance >= 90 em todas as rotas, maior tarefa longa < 200 ms.
## Resultado obtido
Lighthouse Performance: / 95, /espera-invisivel 94, /estrategico 91, /sustentacao 82, /tatico 79-80, /operacional 76. CLS no Lighthouse: operacional 0,54; tatico 0,32; sustentacao 0,28; estrategico 0,18; EI 0,13. CLS no perf: tatico 0,189, demais 0,04-0,08. Maior tarefa longa: / 276 ms, /operacional 226, /espera-invisivel 220, /sustentacao 214, /tatico 207, /estrategico 205 ms (C6 < 200 reprovado em todas as 6 rotas, 3 execuções em /). Provável causa: cartões trocam de altura ao hidratar (CLS) e render síncrono dos gráficos (tarefa longa). Acessibilidade Lighthouse 100 em todas.
## Evidência
`e2e/lighthouse/relatorios/*.json`, `e2e/perf-results/resultado.json`.
