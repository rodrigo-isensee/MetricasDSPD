# L2T-003 - /tatico com equipe escolhida tem CLS de 0,073 a 0,100 (já existente, não vem do lote 2)
- Severidade: baixa
- Responsável sugerido: forge:react-frontend (reserva de altura dos cartões do núcleo do Tático)
- Ambiente: feature/025-front-taticas @ b6c7673, Chromium 1366x768, API local com o mock semeado

## Passos para reproduzir
1. Rodar o F2 com a seção "Mais métricas" **fechada** e `?equipe=erp-protheus`: carregar `/tatico?equipe=erp-protheus`, esperar `networkidle`, ler o `layout-shift` acumulado (5 cargas).
2. Comparar com `/tatico` sem equipe (o caso do ADR 0003).

## Resultado esperado
CLS < 0,1 (ADR 0003, F2) também com equipe escolhida.

## Resultado obtido
Com a seção fechada e equipe escolhida: 0,100 0,073 0,073 0,073 0,073. Sem equipe (caso do ADR 0003): 0,035. A fonte maior é uma `SECTION` do núcleo que sobe 32 px (altura 163 para 195) aos ~500 ms. Nenhum cartão do lote 2 está renderizado nessas cargas; abrir a seção com T10 a T14 acrescenta 0,000 de CLS em 15 de 15 cargas. A S0 do pedido 037 viu 0,103 nesse estado.

## Evidência
`e2e/perf/perf.spec.ts` caso `perf-tatico-lote2`: "CLS da seção, pior de 15 cargas=0.000 (totais da página: 0.089 0.073 ...)". Fontes dos deslocamentos por `PerformanceObserver` (exploração de 2026-10-21): SECTION 605->573 h163->195 (0,072 a 514 ms).
