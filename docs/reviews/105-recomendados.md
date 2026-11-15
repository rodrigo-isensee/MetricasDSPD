---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: fix/099-recomendados-o8-o16-o21
commit: e7bd8dfa34d20440c6f63764d7df1d4fea590046
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-15
---
# Review: recomendados do O21, O16 e O8 (E1.2; K-348, K-352, K-353)

resultado: aprovado sobre e7bd8dfa, com dois recomendados e uma nota de integração.

## Achados
- A1 (recomendado) server/tests/painel-real-f6.pg.test.ts:134 · o (d2) usa a regra antiga (tamanho na base inteira); com o K-359 (por tipo, entregues da janela) o `else` fica vermelho com cálculo certo. Passa hoje só porque o seed dá tamanho a toda story. Ver "O que foi lido".
- A2 (recomendado) server/tests/painel-real-f6.pg.test.ts:138 · o comentário "caso do seed, WS1 pendente" está errado: o seed traz tamanho (gerador.ts:399), então no CI o ramo `if` não roda. Quem prova o caso sem tamanho é o (d3). Corrigir o comentário junto com o A1.

## Sondas
- S1 · merge local de `origin/develop` (be03b1b1, K-359) sobre e7bd8dfa, conflito resolvido com a versão da develop · espera: `o8-motivo-por-tamanho.test.ts`, `o8.test.ts` e `complementares.test.ts` verdes · obtido: 7/7 e 28/28 verdes
- S2 · mesmo merge, `calcularO8` do K-359 nos dois cenários do `o8.test.ts` (Melhoria com tamanho e Incidente sem; nenhum com tamanho) validado por `SCHEMAS_RESULTADO.O8.safeParse` · espera: aceito nos dois · obtido: aceito nos dois (1/1)
- S3 · mutante `every` → `some` no superRefine (schemas.ts) · espera: morto · obtido: morto (1 falha de 7)
- S4 · mutante `r.tipos.length > 0` → `true` · espera: morto · obtido: morto (1 falha de 7)
- S5 · mutante `r.motivoPorTamanho === null` → `true` · espera: morto · obtido: morto (1 falha de 7)

## O que foi lido
Diff `204924b2...e7bd8dfa` (base `Base-sha` do brief): 10 arquivos.
- **Ponto central (K-359):** o superRefine vale na raiz e só quando `motivoPorTamanho` é nulo, a lista de tipos não é vazia e **todos** os tipos têm `porTamanho` nulo (schemas.ts:930-942). O K-359 grava `motivoPorTamanho` nulo só quando algum tipo publica (`algumPublica`, o8.ts da develop), então todo resultado dele cumpre a regra. O caso "um tipo nulo e motivo nulo quando outro publica" está no teste do contrato (o8-motivo-por-tamanho.test.ts:43). Não quebra o K-359 (S1, S2).
- **Merge com a develop:** dá conflito de texto em `packages/metricas/src/businessmap/o8.ts` (o comentário novo da linha 35 encosta na linha `tipoComTamanho` do K-359) e no `CHANGELOG.md`. A resolução fica com as duas linhas, sem mudar o patch. Quem resolver não decide o alcance: roda o `forge-check pr`.
- **A1 em detalhe:** o (d2) conta `tamanho_declarado` na `dim_card` inteira e, no `else`, exige `motivoPorTamanho` nulo e `porTamanho` não vazio em todo tipo. Pela L24 (a), um card com tamanho só fora da janela, ou um tipo sem tamanho ao lado de outro com, quebra essa afirmação. O seed preenche P/M/G em packages/mock/src/businessmap/gerador.ts:399. Sugestão: afirmar `motivoPorTamanho === null` se e só se algum tipo publica, e por tipo `porTamanho === null || length > 0`.
- **O21 (K-348):** os textos de origem.ts:92 e :108 e de docs/api/metricas.md batem com o mapa real (O19, O20, O21 e O25 estão em `METRICAS_ORIGEM_REAL`). A suposição do seed está comentada no o21 pg.
- **O16 (K-352):** o caso (a) afirma laço não vazio e a severidade exata de cada bug do teste (a semente grava Crítica, Alta e Baixa nos três primeiros). Os casos a2, b e c têm a guarda do seed. No (b), o laço vazio é esperado e está comentado.
- **O8 (K-353):** comentário de granularidade em o8.ts e caso do contrato no complementares.test.ts:216. O (d3) prova o caso sem tamanho com o motivo exato.
- **Tamanho (M14):** código e teste somam 179 linhas, das quais 65 são a reindentação do `resultadoO8` em `.object(...).superRefine(...)`. O corpo do PR leva `teto: excedido, 179 linhas, reindentação do schema do O8 pelo superRefine`.
- **Ferramentas:** CI do e7bd8dfa verde (`gh run list`, CI `success`); o `format:check` do 07c534d6 foi corrigido no e7bd8dfa. Não rodei a suíte de novo.
- Sem dado de pessoa, credencial ou consulta nova. Nenhuma regra inviolável é tocada: só BusinessMap, sem estatística nova.

## Parecer
Aprovado sobre e7bd8dfa. O contrato aceita os dois estados que o K-359 produz e recusa o estado incoerente. Os três mutantes do superRefine morrem. A1 e A2 são recomendados (teste frágil e comentário), sem defeito provado no CI.
