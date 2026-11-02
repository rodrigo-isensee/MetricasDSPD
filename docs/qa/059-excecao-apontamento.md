---
tipo: qa
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-dicionario-radicais
commit: 1723a74e13490e45f0cf48c4784e4bd14a7f29de
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

## Renovação por delta (E2.66, K-193)

Branch do PR 195, ponta testada afe05d521b2c2fa6d33fce855601291789c3f339 (develop 76fffa5 mesclada). O forge-check apontou o parecer desatualizado porque `docs/architecture/fontes/apontamento-dicionario.json` mudou depois de 89f5c96; esse arquivo não faz parte do texto da exceção.

- Texto da exceção intacto: o diff de 89f5c96 até a ponta em `CLAUDE.md` e `docs/briefing-execucao-metricas.md` sai vazio; as cláusulas o1 a o4 seguem nos dois arquivos (CT-01 a CT-04 e CT-06 inalterados).
- CT-07 refeito: `docs:check: ok (857 páginas Markdown, 69 métricas, 2 eventos)`.
- Teste que a branch muda e não afeta a exceção: `packages/contratos/src/apontamento.test.ts`, 16 de 16 passaram (vitest, um arquivo).
- Mutação e vermelho antes do verde: não se aplicam (nenhum teste novo nesta renovação).
- Conclusão: a exceção continua valendo na ponta nova, sem achado novo.

## Renovação por delta (E2.71, K-193)

Branch do PR 195, ponta testada 29c64aaed34d84ca3443c49404f188d5ebba4fa9 (merge da develop com o squash do PR 194, 8cd657f). Delta 2321a1aa6dd6c8ffad3b919d4f03698ec35d96fc..29c64aaed34d84ca3443c49404f188d5ebba4fa9: 16 arquivos; 12 de packages passam à versão da develop (trilha B, aprovada em `docs/qa/059-alfa.md`), mais index.ts e classificarApontamento.test.ts combinados com o 70b70a9. O forge-check apontou este parecer desatualizado porque `packages/contratos/src/apontamento.test.ts` mudou; esse arquivo não faz parte do texto da exceção. Depois de 29c64aa a branch só recebeu os pareceres de review e segurança (2 arquivos de docs).

- Texto da exceção intacto: o diff de afe05d5 até a cabeça local em `CLAUDE.md` e `docs/briefing-execucao-metricas.md` sai vazio; as cláusulas o1 a o4 seguem nos dois arquivos (CT-01 a CT-06 inalterados).
- Combinação conferida: contra a develop, em packages/metricas a branch difere só pelo 70b70a9 (subcaminho ./coletor no package.json, três testes de guarda relaxados e o comentário do index.ts); `apontamento.test.ts` e o contrato são iguais à develop.
- CT-07 refeito: `docs:check: ok (860 páginas Markdown, 69 métricas, 2 eventos)`.
- Testes que o merge toca: vitest em `packages/contratos/src/apontamento.test.ts`, `packages/metricas/src/coletor` e `packages/metricas/src/businessmap/apontamento`, 5 arquivos, 193 de 193 passaram.
- `forge-check pr` sobre `origin/feature/059-coleta-worklog` acusa os três pareceres (review, QA, segurança) por `apontamento.test.ts`, porque a ponta remota ainda é 29c64aa e os pareceres renovados estão só locais; deve sair limpo depois do push.
- Mutação e vermelho antes do verde: não se aplicam (nenhum teste novo nesta renovação, só versão da develop já testada).
- Conclusão: a exceção continua valendo na ponta nova, sem achado novo.

## Renovação por delta (E2.66, K-193, dicionário em radicais)

Branch do dicionário em radicais, ponta testada 1723a74e13490e45f0cf48c4784e4bd14a7f29de (develop 32ebf3a mesclada, com o squash do PR 195). O forge-check apontou este parecer desatualizado porque `docs/architecture/fontes/apontamento-dicionario.json` mudou (termos em radicais, E2.61); esse arquivo não faz parte do texto da exceção.

- Texto da exceção intacto: o diff de 89f5c96 até a ponta em `CLAUDE.md` e `docs/briefing-execucao-metricas.md` sai vazio; as cláusulas o1 a o4 seguem nos dois arquivos (CT-01 a CT-06 inalterados).
- CT-07 refeito: `docs:check: ok (862 páginas Markdown, 69 métricas, 2 eventos)`.
- Testes que o parecer citou: vitest em `packages/contratos/src/apontamento.test.ts`, `packages/metricas/src/coletor` e `packages/metricas/src/businessmap/apontamento`, 5 arquivos, 193 de 193 passaram. A branch não muda nada em `packages/` contra a base do dicionário.
- Mutação e vermelho antes do verde: não se aplicam (nenhum teste novo nesta renovação; os testes do dicionário da branch são do parecer `docs/qa/059-epsilon.md`).
- Conclusão: a exceção continua valendo na ponta nova, sem achado novo.
