---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/105-recs-texto-s11-o24
commit: 02ee136620fb9b4ca72ec7901bab032939194328
parecer: aprovado
revisor: tech-lead
data: 2026-11-15
---

# Code review: recomendados de texto do S11 e do O24 (E6.40)

Branch `fix/105-recs-texto-s11-o24` contra `develop`, commit `0fd1187f` (6 arquivos, 14 linhas a mais e 11 a menos; só texto e teste).

## Parecer
**Aprovado** no head `02ee1366`. O bloqueante A1 do `0fd1187f` foi corrigido: os dois comentários trocaram de lugar e cada um agora descreve a forma da própria constante.

## Achados
- A1 (bloqueante) packages/contratos/src/origem.ts:87 · o comentário da constante do O12 virou "Frase completa", mas o valor do O12 segue em minúsculas e sem ponto (linha 90); o do S11 (linha 107) ainda diz "minúsculas sem ponto final" e o valor é frase completa. Troque os dois comentários de lugar. Resolvido em 02ee1366 (ver Revalidação).

## Revalidação
- Delta lido com `forge-check parecer delta docs/reviews/105-recs-texto-s11-o24.md`: intervalo `0fd1187f..02ee1366`, um arquivo no domínio (`packages/contratos/src/origem.ts`), duas linhas de comentário trocadas, nenhum valor de constante alterado.
- Conferido no head: o comentário do O12 descreve `'aguardando o campo de responsabilidade ...'` (minúsculas, sem ponto) e o do S11 descreve `'Aguardando o vínculo do chamado com o Registro de Problema.'` (frase completa). Os dois batem.
- CI do head `02ee1366` (run 43790481019): `success`.
- QA aprovado no código (`docs/qa/105-recs-texto-s11-o24.md`, parecer aprovado); a mudança é só comentário, não altera o que o QA testou.

## O que conferi
- Sem mudança de cálculo nem de forma do contrato: só o valor da string em `origem.ts`; o schema não foi tocado. O componente (`web/src/features/complementares/sustentacao.tsx:301`) concatena `motivoConversao` após "sem dado real. ", então a frase com maiúscula e ponto lê bem.
- Testes: `origem.test.ts` agora exige maiúscula e ponto final e continua barrando "fict|mock|simulad"; `estados.test.tsx` usa a constante exportada em vez de um texto solto e a expectativa literal bate com o valor.
- `docs/contratos/metricas/S11.md`: o exemplo gerado traz a mesma frase do código.
- `docs/api/metricas.md`: S11 saiu da lista de mock do catálogo (T8, E4, S8 e S12 ficam), com a nota de que é origem real e só a conversão fica sem dado; bate com `origemDaMetrica('S11') === 'real'` do teste.
- CHANGELOG: `cards_com_etiqueta` descrito como leituras de card com ao menos uma etiqueta, não cards distintos.
- CI do head: em andamento na hora do parecer; a decisão não depende dele, pois o bloqueante é de leitura.
