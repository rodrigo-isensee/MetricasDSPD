# B3-003 - Recorte da Visão geral com período ambíguo e texto diferente do plano
- Severidade: baixa
- Responsável sugerido: react-frontend
- Ambiente: e4ccab7 (K-026), Chromium

## Passos para reproduzir
1. Abrir `/` e ler `recorte-visao-geral`.

## Resultado esperado
VG-11: linha de recorte "Consolidado de todas as equipes · últimas 12 semanas".
## Resultado obtido
"Recorte fixo, igual ao dos painéis: Operacional e Tático em 18/07 a 09/10/2026; Estratégico em 10/10 a 09/10/2026; ...". O Estratégico lê como início posterior ao fim (o ano do início, 2025, é omitido).
## Evidência
`docs/qa/evidencias/b3/visao-geral-1280-claro.png`. Decisão pendente: o texto atual é aceito (então atualizo VG-11) ou volta ao do plano? Em qualquer caso, mostrar o ano do início quando diferente do fim.
