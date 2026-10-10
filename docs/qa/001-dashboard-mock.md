# Parecer final de QA - pedido 001 (dashboard mock)
Data: 2026-10-10 · develop dd1be98 · Chromium local (WSL2) contra `vite preview`, `VITE_MOCK_LATENCIA=0`.
Links: `docs/pedidos/001-dashboard-mock.md`, `docs/qa/plano-testes-dashboard-mock.md`, `docs/qa/001-B3.md`, `docs/qa/001-B12.md`.

## Resultado real
| Execução | Resultado |
|---|---|
| `npm run pronto` (lint, format, typecheck incl. e2e, unitários, build, size) | exit 0. Unitários: 261 + 26 + 174 testes passando. Bundle: inicial 174,85 KB (<200), gráficos 111,6 KB (<130), mock 7,8 KB fora do inicial |
| `cd e2e && npm run gate` | APROVADO (fronteiras, hash da base idêntico à fase A, tamanho) |
| E2E completa (chromium + semente-alt, 181 testes), 1ª rodada | 175 passaram, 6 falharam |
| Falhas 1-4 (b12-fluxo OP-02, OP-03, TAT-01, EST-01) | defasagem do teste (cartão EI compacto agora presente nos três níveis; link "Ver BLOQUEADOS"). Teste ajustado; 39/39 passando. Não é defeito do produto |
| Falhas 5-6 (RESP-01 @320 e @375 em /sustentacao) | defeito real, bug 007 |
| axe WCAG 2.2 AA, todas as rotas, dois temas, estados, popover/nota/tabela, 375 px | passou, zero violações |
| Perf (ADR 0003) | F1 LCP / p95 436 ms (<2 s) ok; F3 INP 56 ms ok; F4 p95 61 ms ok; F5 p95 120 ms (<500) ok; C5 heap não medido (NaN, alerta); F2 CLS e C6 tarefa longa REPROVADOS (bug 008) |
| Lighthouse (6 rotas x 3) | Acessibilidade 100 em todas. Performance: 95, 94, 91, 82, 80, 76 (meta 90): reprovado em /sustentacao, /tatico, /operacional (bug 008) |
| `npm install && npm run dev` em `web/` | HTTP 200, h1 "Visão geral", zero erros de página |

Observação: a suíte perf é serial; a primeira falha de C6 pula os demais testes, então F3/C5 foram rodados isolados.
Correções de infraestrutura de teste feitas: `e2e/playwright.config.ts` e `e2e/lighthouse/lighthouserc.cjs` (o servidor extra rodava com cwd em `e2e/` e o Vite não achava `index.html`; agora `cd ../web`).

## Revalidação de bugs fechados
002, 003, 004, 005, B3-001, B3-002, B3-003, B12-001, B12-003: cobertos pela suíte E2E (passando); B12-001/003 validados no OP-03. Os dois ALTOS da UX B12: tabelas agora em contêiner com rolagem horizontal (`overflow-x: auto`, verificado em S1/S2) e rótulos do T7 truncados; ver capturas.
Capturas (`docs/qa/evidencias/final/`): `sustentacao-s2-tabela-375`, `tatico-t7-rotulos-1280`, `estrategico-e2-1280`, `operacional-faixa-375`, `operacional-cabecalho-375`, `sustentacao-s7-overflow-375` (defeito).

## Bugs abertos
- Alta: 007 (S7 estoura largura em mobile), 008 (CLS, Lighthouse Performance, tarefa longa).
- Baixa/sem registro: C5 heap retorna NaN no harness (medição indisponível).
- Existentes e não reavaliados: 001 gerador Acelerato (histórico), 006 setup Chromium, B12-002 (EI compacto: agora presente, fechar).

## Veredito: REPROVADO
Há dois bugs de severidade alta abertos e itens bloqueantes de performance fora do orçamento. Aprovação depende de corrigir 007 e 008 e repetir RESP-01, perf F2/C6 e Lighthouse.
