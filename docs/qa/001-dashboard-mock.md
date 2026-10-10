# Parecer final de QA - pedido 001 (dashboard mock), revisão 2
Data: 2026-10-10 · develop 45049ff (K-047, K-048) · Chromium local (WSL2; libs via `setup-chromium-local.sh`) contra `vite preview` após `npm run build`.
Links: `docs/pedidos/001-dashboard-mock.md`, `docs/qa/plano-testes-dashboard-mock.md`, `docs/qa/001-B3.md`, `docs/qa/001-B12.md`.

## Resultado real (revisão 2)
| Execução | Resultado |
|---|---|
| `npm run pronto` | exit 0. Unitários 261 + 26 + 174 passando. Bundle inicial 175,07 KB (<200), gráficos 111,6 KB (<130) |
| `cd e2e && npm run gate` | APROVADO |
| E2E chromium + semente-alt (181) | 180 passaram, 1 falha (FIL-10), que era corrida do page object (lia o rótulo antes dos cartões carregarem; 3 falhas em 5 repetições). Ajustado em `e2e/pages/BarraFiltros.ts` (espera aria-busy=0); 8/8 repetições passam. Não é defeito do produto |
| axe (dentro da suíte E2E) | zero violações; Lighthouse Acessibilidade 100 nas 6 rotas |
| `npm run test:perf` isolado | 9/9 passam: F1 p95 116 ms, F3 INP 56 ms, F4 p95 55 ms, F5 p95 336 ms (com latência simulada, <500), CLS desktop 0,001-0,037, tarefa longa 127-162 ms. C5 heap segue NaN (alerta, medição indisponível). Rodando junto da suíte inteira em paralelo, C6 de /espera-invisivel deu 212 ms (ruído de carga; instável sob paralelismo, reportado, não skipado) |
| Lighthouse 6 rotas x 3 (desktop) | lhci aprovado (exit 0). Performance, mediana: 96-99; execuções soltas de 67 a 76 em ruído. CLS 0,002-0,041 |
| CLS em 375 px (medição própria, 5 rotas) | REPROVADO: 0,197 a 0,251 em /operacional, /tatico, /sustentacao, /estrategico (orçamento < 0,1); / 0,074 |

## Bugs
- 007 (S7 estoura largura em mobile): FECHADO (RESP-01 em 320 e 375 passa).
- B12-002 (EI compacto nos níveis): FECHADO.
- 008 (CLS/Lighthouse/tarefa longa): REABERTO PARCIALMENTE; desktop corrigido, mobile 375 px com CLS 0,2-0,25 (detalhes no bug).
- Baixa: C5 heap NaN no harness; 001 gerador Acelerato (histórico) e 006 setup Chromium sem mudança.

Capturas (`docs/qa/evidencias/final/`): `sustentacao-s7-375-sem-overflow`, `sustentacao-s2-tabela-375` (tabela com rolagem), `tatico-t7-rotulos-1280`.

## Veredito: REPROVADO (por 008 em mobile)
Um bug alto aberto: CLS em 375 px acima do orçamento F2 (< 0,1) nos painéis principais. Todo o resto aprovado. Aprova após alturas de esqueleto por breakpoint e nova medição em 375 px (e do `#publicado` do Tático em desktop com carga tardia).
