# 105-001 - div mt-2 vazio no estado vazio de S5, S6, S7 e S11
- Severidade: baixa
- Status: fechado (288a04d7)
- Responsável sugerido: react-frontend
- Ambiente: fix/105-vazio-espaco-nota, 5bdb0a25

## Passos para reproduzir
1. Abrir S5, S6, S7 ou S11 em estado vazio com `foraDoFluxo` ou `semFluxo` igual a 0.
2. Inspecionar o DOM abaixo de EstadoVazio.

## Resultado esperado
Nenhum elemento extra (div só quando há conteúdo).
## Resultado obtido
`<div class="mt-2"></div>` vazio: `NotaForaDoFluxo` devolve null com n<=0, mas o elemento passado é truthy.
## Evidência
Leitura: CartaoMetrica.tsx:395 e comuns.tsx (`if (n <= 0) return null`); S5, S6 e S7 passam o prop quando há `d`; S11 sempre.
## Fechamento
288a04d7: a nota só é passada com n > 0. Os 4 testes novos falham no 5bdb0a25 (4 failed | 16 passed) e passam no 288a04d7 (20/20).
