# 099 - Textos sem "simulado" (L4, E2.16)

Para o react-frontend aplicar depois do L2b e L2c. Base: ADR 0030 (nada simulado na web). Hoje todo cartão sem dado real mostra "Sem dado real" e o motivo; por isso as frases sobre "dado fictício" perdem o sentido.

Números de linha são os da cópia principal em 2026-11-11 (podem diferir da varredura 099; confira pelo texto atual).

## Notas dos cartões

| Item | Arquivo:linha | Texto atual | Texto novo | Motivo |
|---|---|---|---|---|
| OP-21 | `web/src/features/complementares/notas.ts:177` (S11, cuidados) | "Os grupos se sobrepõem: um P1 pode ter contorno. O campo de Registro de Problema é fictício por ora." | "Os grupos se sobrepõem: um P1 pode ter contorno." | A frase sobre o campo falava do simulado; o cartão já mostra "Sem dado real" e o motivo. |
| TA-16 | `web/src/features/tatico/notas.ts:22` (T2, cuidados) | "Neste mock o SLE é um valor de configuração com data de publicação; só é válido após 60 dias de dados limpos e 20 itens por classe." | "O SLE é um valor de configuração com data de publicação; só é válido após 60 dias de dados limpos e 20 itens por classe." | Só tira "Neste mock"; a regra dos 60 dias e 20 itens continua igual. |
| TA-17 | `web/src/features/tatico/notas.ts:31` (T3, cuidados) | "Contar cards distorce quando os tamanhos diferem muito. Valores de acordo no mock são fictícios." | "Contar cards distorce quando os tamanhos diferem muito." | Tirar a segunda frase; fala do simulado. |
| TA-18a | `web/src/features/complementares/notas.ts:226` (T13, cuidados) | "...nunca contam como "não dependeu". Dado fictício até a coleta real." | "Entregas com quadro do vínculo desconhecido ficam à parte, nunca contam como "não dependeu"." | Tirar a frase final. |
| TA-18b | `web/src/features/complementares/notas.ts:236` (T14, cuidados) | "...nenhum outro time é nomeado, listado nem ordenado. Dado fictício até a coleta real." | "Não é nota do time nem comparação: nenhum outro time é nomeado, listado nem ordenado." | Tirar a frase final. |
| ES-11 | `web/src/features/estrategico/notas.ts:29` (E3, cuidados) | "Sem esse fechamento o painel mede movimento, não valor. Valores são fictícios." | "Sem esse fechamento o painel mede movimento, não valor." | Tirar a segunda frase. |
| ES-12a | `web/src/features/complementares/notas.ts:246` (E6, cuidados) | "...é contado à parte. Dado fictício até a coleta real." | "Poucos projetos terminam por ano: é esperado ficar abaixo de 20. Projeto concluído sem data comprometida registrada fica fora da conta e é contado à parte." | Tirar a frase final. |
| ES-12b | `web/src/features/complementares/notas.ts:268` (E8, cuidados) | "...para não apontar quem entrega. Dado fictício até a coleta real." | "Não mostra nem avalia pessoas. Não há filtro por equipe nem por sistema, para não apontar quem entrega." | Tirar a frase final. |

Observação: a varredura cita TA-18 em `:300` e `:310` e ES-12 em `:320` e `:342`; na cópia atual as quatro frases estão em `:226`, `:236`, `:246` e `:268`. A frase é a mesma ("Dado fictício até a coleta real.").

Depois de aplicar: `grep -rniE "fict|mock|simulad" web/src/features/*/notas.ts` não deve achar nada nesses arquivos. O texto de nota em `notas.ts` de outros cartões que citam "exemplo" não foi tocado (fora do pedido).

## Catálogo (WB-1)

### Parágrafo de abertura (`web/src/features/catalogo/CatalogoPage.tsx:26-31`)

Texto atual:
"Tudo o que existe no DSPD: 45 métricas do briefing + 1 de percepção (a pesquisa de valor do serviço); a espera invisível aparece em uma linha por nível. As complementares ficam na seção "Mais métricas" da visão. Até a coleta real existir, todas as métricas usam dados fictícios; a coluna "Dados" lembra isso."

Texto novo (K-297, aprovado em 2026-11-12 na branch fix/k297-catalogo-sem-numero; sem número que mude a cada métrica nova, a contagem fica no contador "contagem-catalogo" da página):
"Tudo o que existe no DSPD: as métricas do briefing, as complementares acrescentadas depois dele e a de percepção (a pesquisa de valor do serviço); a espera invisível aparece em uma linha por nível. As complementares ficam na seção "Mais métricas" da visão. A coluna "Dados" diz se a métrica já usa dado real ou ainda está sem dado real; nenhuma mostra número de exemplo."

Motivo: o texto antigo afirma que tudo é fictício, o que é falso para as métricas do mapa real, e a frase nova só descreve a coluna. Sem número porque o catálogo tem 65 linhas e 62 códigos (60 métricas, EI e PV1) e o "45 + 1" não bate com o código; o texto igual está em `docs/ux/099-k297-k314.md`.

### Coluna "Dados" (`linhas.ts:14-15` tipo e `:39` valor; `CatalogoPage.tsx:68` legenda)

- Tipo: trocar `'Fictícios'` por `'Real' | 'Sem dado real'`; apagar o comentário "Decisão 20" (fala de dados fictícios).
- Valor por métrica: derivar de `origemDaMetrica` (origem.ts, o mapa real que a varredura cita em `origem.ts:12-40`). Se a métrica está no mapa real: "Real". Se não está: "Sem dado real". Não inventar um terceiro estado ("em coleta", "parcial"): o código só sabe esses dois. Observação: não achei `origemDaMetrica` na cópia principal que li; o react-frontend confirma o nome e a função na branch do L1 e L2.
- Legenda da tabela (`CatalogoPage.tsx:68`): "natureza dos dados" passa a "situação dos dados (real ou sem dado real)".
- Teste (`catalogo.test.tsx:80,86,91`) espera 'Fictícios': passa a esperar "Real" ou "Sem dado real" por linha (ajuste do react-frontend).
- Linhas com a mesma métrica em vários níveis (espera invisível, uma linha por nível) usam a mesma regra, por métrica. Se o mapa real for por cartão e não por métrica, ver pergunta 1.

Acessibilidade: o texto da coluna já diz a situação por palavra, sem depender de cor. Se o react-frontend colorir, manter a palavra visível (`lido`, não medido).

## Perguntas ao dono

1. Uma métrica que aparece em vários cartões (ex.: espera invisível, um por nível), com dado real em um e sem em outro: a coluna mostra "Real" ou "Sem dado real"? Recomendação: "Sem dado real" se qualquer cartão dela estiver sem; só "Real" quando todos tiverem. Assim a coluna nunca promete dado que algum cartão não mostra. Sem decisão, o react-frontend segue essa recomendação e avisa no PR.
2. Nada mais. Nenhuma regra de negócio nova foi criada neste documento.
