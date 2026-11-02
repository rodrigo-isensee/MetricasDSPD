---
tipo: qa
contrato: 1
pedido: 059-aba-apontamento
branch: docs/059-excecao-apontamento
commit: 89f5c9617c7a5c964ce6f2c21d83e3c4cee0c1ad
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-02
---
# QA: exceção da aba Apontamento no CLAUDE.md e no briefing (E1.8, K-193)

PR só de documentação. Base conferida: 5c679da (develop). Ponta testada: 89f5c96, igual à origem (`pull --ff-only` sem novidade). O diff contra a base tem 3 arquivos: 1 linha acrescentada em `CLAUDE.md`, 1 em `docs/briefing-execucao-metricas.md` (§7.1) e o parecer de review. Nenhuma linha removida nem alterada nos dois arquivos de regra.

## Achados

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Texto 1.1 no `CLAUDE.md` igual ao aprovado, com a frase da ADR ajustada e as quatro cláusulas | CT-01: diff do item contra o plano §1.1 e §1.3 | posição (depois do item de avaliação individual, antes de "Métricas proibidas") | passou |
| Texto 1.2 no briefing §7.1 igual ao aprovado, com as quatro cláusulas | CT-02: diff do parágrafo contra o plano §1.2 e §1.3 | posição (fim da lista, antes do §7.2); itens existentes intactos | passou |
| Cláusulas o1 a o4 na redação registrada em 2026-11-01 21:30 | CT-03: comparação literal nos dois arquivos | o3 piso de 20 apontamentos; o4 fora da exportação | passou |
| Nenhuma outra mudança nos dois arquivos | CT-04: numstat (1 e 0, 1 e 0) | nenhuma remoção | passou |
| Limites da exceção preservados (sem meta por pessoa, sem comparação entre times, Acelerato fora, horas nunca como esforço) | CT-05: leitura dos dois textos | proibições mantidas dentro da aba | passou |
| Nenhum nome de pessoa nos textos | CT-06: leitura | n/a | passou |
| Verificação de documentação | CT-07: `pnpm -C /home/rodrigoisensee/MetricasDSPD-052b run docs:check` | n/a | passou |

## Cenários e resultado real

- CT-01: o item de `CLAUDE.md` (linha 14) é o texto 1.1 do plano. Diferença única: a última frase antes das cláusulas passa de "está na ADR 0020, revisão 4" para "será registrado na revisão da ADR 0020 da fatia de código da aba", como a decisão técnica de 21:20 manda. As quatro cláusulas fecham o item.
- CT-02: o parágrafo do briefing é o texto 1.2 do plano, com as quatro cláusulas ao fim. Os itens anteriores do §7.1 continuam como estavam, e "horas apontadas como proxy de esforço entregue" segue proibido no restante do sistema.
- CT-03: o1 "a lista de pessoas vem em ordem neutra (alfabética); ordenar por total é escolha de quem lê", o2 "a utilização por pessoa não tem semáforo, faixa de bom ou ruim, nem comparação com a média", o3 "percentual por pessoa só aparece com 20 apontamentos ou mais; abaixo disso, só soma e contagem", o4 "a aba fica fora da exportação do painel": iguais ao registro, nos dois arquivos, só com a maiúscula inicial de frase.
- CT-04: `git diff --numstat` da base à ponta nos dois arquivos: 1 e 0 em cada.
- CT-07: `docs:check: ok (846 páginas Markdown, 69 métricas, 2 eventos)`. O review registrou 845; a página a mais é o próprio parecer de review.
- Fora do alcance desta etapa: a validade jurídica da finalidade e a retenção (DPO) e a revisão 4 da ADR 0020, que ficam com a segurança e o dono. O merge é do dono.
- Mutação e vermelho antes do verde: não se aplicam (sem código nem teste novo).
