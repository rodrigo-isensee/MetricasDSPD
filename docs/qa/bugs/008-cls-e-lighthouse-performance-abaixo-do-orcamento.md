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

## Revisão 2 (develop 45049ff): REABERTO PARCIALMENTE (somente mobile)
Corrigido em desktop: Lighthouse (mediana de 3) 96-99 nas 6 rotas, CLS 0,002-0,041; perf F2/C6 isolado passa (tarefa longa 127-162 ms). Todos dentro do orçamento.
Persiste em 375 px (esqueletos com altura medida no desktop), CLS total (layout-shift, sem latência extra, mock com latência padrão): /operacional 0,205; /operacional?cadencia=semanal 0,204 (primeira rodada); /tatico 0,251; /sustentacao 0,197; /estrategico 0,210; / 0,074. Orçamento F2 < 0,1.
Fontes: troca esqueleto->conteúdo com altura diferente em 375: `#prazos` 89->41 (S), `#publicado` 271->223 e depois 223->3 (T), grid de cartões 181->153 e 133->5 (O). Em 1280 o /tatico mostrou 0,154 numa medição com espera longa (`#publicado` 427->371), contra 0,037 na do perf: o esqueleto do `#publicado` também erra no desktop quando o conteúdo chega tarde.
Responsável: react-frontend. Pedir alturas de esqueleto por breakpoint (ou min-height por conteúdo) e cartão vazio sem colapso para ~0.

## Revisão 3: FECHADO
K-049 e K-050 (13d35e6): CLS a 375 px 0,000-0,019 no `perf-375` (15/15 perf passam), Lighthouse 99-100.
