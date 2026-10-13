# IF-007 - Base do cartão com período de 12 meses mostra "10/10 a 09/10/2026" (início sem o ano)
- Severidade: baixa
- Responsável sugerido: react-frontend
- Ambiente: main @ 0af552a, `vite preview`, Chromium 1248

## Passos para reproduzir
1. Abrir `/estrategico` (padrão 12 meses) ou `/tatico?periodo=12m`.
2. Ler a base do E2: "Base: 3.137 itens entregues · 10/10 a 09/10/2026".

## Resultado esperado
Quando o ano do início difere do ano do fim, mostrar o ano no início ("10/10/2025 a 09/10/2026"), como já foi decidido para o recorte da Visão geral (B3-003).

## Resultado obtido
`CartaoMetrica` monta a janela com `fmtDataCurta(inicio)` sempre; com 12 meses o intervalo lê como início depois do fim.

## Evidência
Sonda Playwright em `/estrategico`: `base-E2=Base: 3.137 itens entregues· 10/10 a 09/10/2026`.
