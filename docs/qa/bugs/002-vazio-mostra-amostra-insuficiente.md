# 002 - Estado vazio do O4 exibe também "Amostra insuficiente: 0 de 20"
- Severidade: média
- Responsável sugerido: react-frontend
- Ambiente: develop @ 252bed4, vite preview (VITE_MOCK_LATENCIA=0), Chromium 1280x800

## Passos para reproduzir
1. Abrir /operacional?mock=vazio (ou tipo=bug-interno&equipe=dados).
2. Ler o cartão O4.

## Resultado esperado
Spec 6.2 e critério 88: "Nenhum item encontrado" (0 itens) e "Amostra insuficiente" (1 a 19) são estados distintos; o vazio não mostra o selo de amostra insuficiente.

## Resultado obtido
O cartão mostra ao mesmo tempo "Amostra insuficiente: 0 de 20 itens mínimos" (BadgeBase, baseVariante insuficiente) e "Nenhum item encontrado". Causa provável: CartaoO4 passa baseVariante='insuficiente' quando faixa.status é insuficiente, inclusive com n=0.

## Evidência
e2e/tests/estados.spec.ts (ST-05), falha reproduzível; docs/qa/evidencias/fase-a/estado-vazio-*.png
