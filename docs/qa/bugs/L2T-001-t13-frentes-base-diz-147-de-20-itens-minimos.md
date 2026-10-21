# L2T-001 - T13 em "Frentes" mostra "Amostra insuficiente: 147 de 20 itens mínimos"
- Severidade: baixa
- Responsável sugerido: forge:react-frontend (`web/src/features/complementares/taticas.tsx:411`, `baseVariante` do `CartaoT13`)
- Ambiente: feature/025-front-taticas @ b6c7673, Chromium, API local com o mock semeado (`scripts/com-api-mock.sh`)

## Passos para reproduzir
1. `bash scripts/com-api-mock.sh bash -c 'cd e2e && E2E_API_URL=$API_URL pnpm exec playwright test --project=chromium-api'` (ou abrir `/tatico?equipe=erp-protheus`, abrir "Mais métricas deste painel").
2. No cartão T13, trocar de "Demandas" para "Frentes".
3. Ler a linha da base no cabeçalho do cartão.

## Resultado esperado
A base do cartão acompanha a granularidade exibida: com "Frentes" (4 frentes entregues, abaixo de 20), algo como "4 de 20 itens mínimos"; ou a base fica fixa em "147 demandas entregues" sem o selo de amostra insuficiente.

## Resultado obtido
O cabeçalho passa a "Amostra insuficiente: 147 de 20 itens mínimos": o selo de insuficiência (calculado sobre as frentes) usa o `n` de demandas (147). O texto se contradiz (147 é maior que 20) e o rodapé segue com "Granularidade: demanda". Não há número de estatística indevido publicado; é só o texto da base.

## Evidência
Texto do cartão capturado na exploração de 2026-10-21 (innerText do `metrica-T13` com "Frentes" selecionada): "Amostra insuficiente: 147 de 20 itens mínimos · 18/07 a 09/10/2026 · 4 frentes entregues". O mesmo aparece no mock embutido do navegador (onde o T13 sai sem vínculo).
