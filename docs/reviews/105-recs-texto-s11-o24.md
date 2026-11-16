---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-recs-texto-s11-o24
commit: 0fd1187fb449da8b13641479bcbdcf137ef258d7
parecer: reprovado
revisor: tech-lead
data: 2026-11-15
---

# Code review: recomendados de texto do S11 e do O24 (E6.40)

Branch `fix/105-recs-texto-s11-o24` contra `develop`, commit `0fd1187f` (6 arquivos, 14 linhas a mais e 11 a menos; só texto e teste).

## Parecer
**Reprovado por um bloqueante de comentário**: o comentário que diz "frase completa" foi trocado na constante errada. O resto confere.

## Achados
- A1 (bloqueante) packages/contratos/src/origem.ts:87 · o comentário da constante do O12 virou "Frase completa", mas o valor do O12 segue em minúsculas e sem ponto (linha 90); o do S11 (linha 107) ainda diz "minúsculas sem ponto final" e o valor é frase completa. Troque os dois comentários de lugar.

## O que conferi
- Sem mudança de cálculo nem de forma do contrato: só o valor da string em `origem.ts`; o schema não foi tocado. O componente (`web/src/features/complementares/sustentacao.tsx:301`) concatena `motivoConversao` após "sem dado real. ", então a frase com maiúscula e ponto lê bem.
- Testes: `origem.test.ts` agora exige maiúscula e ponto final e continua barrando "fict|mock|simulad"; `estados.test.tsx` usa a constante exportada em vez de um texto solto e a expectativa literal bate com o valor.
- `docs/contratos/metricas/S11.md`: o exemplo gerado traz a mesma frase do código.
- `docs/api/metricas.md`: S11 saiu da lista de mock do catálogo (T8, E4, S8 e S12 ficam), com a nota de que é origem real e só a conversão fica sem dado; bate com `origemDaMetrica('S11') === 'real'` do teste.
- CHANGELOG: `cards_com_etiqueta` descrito como leituras de card com ao menos uma etiqueta, não cards distintos.
- CI do head: em andamento na hora do parecer; a decisão não depende dele, pois o bloqueante é de leitura.
