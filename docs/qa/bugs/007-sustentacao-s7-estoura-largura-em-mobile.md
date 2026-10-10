# 007 - Sustentação: seção S7 por prioridade estoura a largura em 320 e 375 px
- Severidade: alta (reflow WCAG 1.4.10; rolagem horizontal da página)
- Responsável sugerido: react-frontend
- Ambiente: develop dd1be98, Chromium

## Passos para reproduzir
1. Abrir `/sustentacao` com viewport 375 px (ou 320).
2. Medir `documentElement.scrollWidth - clientWidth`.

## Resultado esperado
Sem rolagem horizontal da página (RESP-01).
## Resultado obtido
Sobra de 130 px em 375 e 185 px em 320. `section#s7-prioridade`, `h4`, `p[data-testid=s7-justificados]` e a `figure` terminam em x=505 contra 342 do cartão.
## Evidência
`e2e/tests/responsivo.spec.ts` RESP-01 (2 falhas); `docs/qa/evidencias/final/sustentacao-s7-overflow-375.png`.
