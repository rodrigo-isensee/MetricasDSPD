---
tipo: review
contrato: 1
pedido: 026-front-do-011-lote3
branch: docs/026-textos-lote3
commit: bbbef76f0c84f8f68755c08a69da27c598616291
parecer: reprovado
revisor: forge:tech-lead
data: 2026-10-28
---
# Review do E1.6: textos da especificação do lote 3 (K-154)

Escopo: `git diff d7c74b46..bbbef76f` (só `docs/ux/metricas-tambem-disponiveis/02-especificacao.md`, +8 -3). Documentação; sem lógica, sem segurança nem pessoa envolvida. Cruzado com `packages/metricas/src/businessmap/o26.ts`.

## Os três textos pedidos
- Mínimo de 20 do O26 (A12 do review = A7 do QA): presente na Visual (156), na Leitura (157) e no Mínimo (161). Bate com o código: percentual sobre o total do tipo com dado de passagens (`o26.ts:74`, `taxa(itens, dado.length)`), P85 por faixa sobre a janela de 12 semanas (`o26.ts:75`). Os números do exemplo fecham (36 de 87 = 41%). OK nesses três pontos.
- Tabela de decisões da §11 (A13): três linhas novas (416 a 418) com data e destino. A linha de A10 erra (A1 abaixo) e a de R8 aponta um destino que não foi escrito (A2).
- Vazio (A6 do QA): §6, linha 302, diz que com zero itens o cartão mostra só o estado vazio, sem "Amostra insuficiente: 0 de 20", e registra a pendência da tela. Bate com a decisão. OK.

## Achados
- A1 (bloqueante) docs/ux/metricas-tambem-disponiveis/02-especificacao.md:416 · Linha de A10 diz que o mínimo de 20 vale para percentual e P85 sobre o tipo; contradiz a linha 161 e o26.ts:75 (P85 exige 20 na faixa). Destino: ux-designer separa as duas regras, como na 161.
- A2 (bloqueante) docs/ux/metricas-tambem-disponiveis/02-especificacao.md:417 · A linha de R8 diz que o §5 O21 ignora a reabertura, mas a Leitura do O21 (linha 89) não traz a regra. Destino: ux-designer acrescenta a regra à Leitura do O21 ou muda a linha 417 para dizer que ainda falta.
- A3 (recomendado) docs/ux/metricas-tambem-disponiveis/02-especificacao.md:418 · Cita BadgeBase.tsx:41 e quatro cartões com número de linha, que envelhece. Destino: ux-designer cita só o arquivo ao reescrever; não devolve sozinho.

## Itens sem achado
Commits e padrão de mensagem conforme `praticas.md` §9 (`docs(...)`, `Cartão: K-154`, atribuição). Teto M14: só `.md`, fora da contagem. Sem decisão de código nem mecanismo novo (critério de reversão não se aplica). Pipeline e segurança: sem escopo.
