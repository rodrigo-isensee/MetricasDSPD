---
tipo: review
contrato: 1
pedido: 026-front-do-011-lote3
branch: docs/026-textos-lote3
commit: 081d2f1f7850959f993e814d67491cf8ec9f87c0
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-28
---
# Review do E1.6: textos da especificação do lote 3 (K-154)

Escopo da 1a rodada: `git diff d7c74b46..bbbef76f` (só `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`, +8 -3). Documentação; sem lógica, sem segurança nem pessoa envolvida. Cruzado com `packages/metricas/src/businessmap/o26.ts`.

## Os três textos pedidos
- Mínimo de 20 do O26 (A12 do review = A7 do QA): presente na Visual (156), na Leitura (157) e no Mínimo (161). Bate com o código: percentual sobre o total do tipo com dado de passagens (`o26.ts:74`, `taxa(itens, dado.length)`), P85 por faixa sobre a janela de 12 semanas (`o26.ts:75`). Os números do exemplo fecham (36 de 87 = 41%). OK nesses três pontos.
- Tabela de decisões da §11 (A13): três linhas novas (416 a 418) com data e destino. A linha de A10 erra (A1 abaixo) e a de R8 aponta um destino que não foi escrito (A2).
- Vazio (A6 do QA): §6, linha 302, diz que com zero itens o cartão mostra só o estado vazio, sem "Amostra insuficiente: 0 de 20", e registra a pendência da tela. Bate com a decisão. OK.

## Achados
- A1 (bloqueante, resolvido) docs/ux/metricas-tambem-disponiveis/02-especificacao.md:416 · A linha de A10 agora separa os dois mínimos de 20 (percentual sobre o total do tipo; P85 sobre a faixa na janela), como na 161 e em o26.ts:74-75. Nada a fazer.
- A2 (bloqueante, resolvido) docs/ux/metricas-tambem-disponiveis/02-especificacao.md:89 · A Leitura do O21 traz a regra R8 (a volta mais comum ignora a reabertura; "reaberto" segue na linha própria), de acordo com a linha 417. Nada a fazer.
- A3 (recomendado, resolvido) docs/ux/metricas-tambem-disponiveis/02-especificacao.md:418 · A linha cita só o arquivo BadgeBase.tsx, sem número de linha. Nada a fazer.

## Revalidação (segunda rodada)
Delta lido: `git diff 8064502..081d2f1`, só a especificação (+3 -3), três linhas, uma por achado. Já lido, sem releitura: o restante da especificação e os três textos pedidos da primeira rodada. Conferido de novo o par 161/o26.ts:74-75. Sem contradição com as decisões do dono (A10 opção A, R8 opção A). Commits só de parecer saem sem `pronto` (decisão técnica do Jarvis, 2026-10-28); o `pronto` rodou no 081d2f1.

## Itens sem achado
Commits e padrão de mensagem conforme `praticas.md` §9 (`docs(...)`, `Cartão: K-154`, atribuição). Teto M14: só `.md`, fora da contagem. Sem decisão de código nem mecanismo novo (critério de reversão não se aplica). Pipeline e segurança: sem escopo.
