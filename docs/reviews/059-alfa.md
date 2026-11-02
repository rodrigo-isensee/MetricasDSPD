---
tipo: review
contrato: 1
pedido: 059-aba-apontamento
branch: feature/059-contrato-biblioteca
commit: ff47cbd7dfea974248c2b099579e9d479296e736
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-02
---
# Review: 059-aba-apontamento, trilha B (contrato, classificarApontamento e cálculos, E2.17, K-193)

**Veredito: aprovado** em `ff47cbd`. Segunda renovação por delta: `0bb64b5..ff47cbd` traz só o ajuste do comentário sem palavra (decisão do dono de 2026-11-02, E2.41), sem achado novo. A aprovação anterior, em `a8871e3`, renovou por delta o parecer reprovado em `51d9ed4` (commit do parecer `ab4b25e`). A1 (CI vermelha no orçamento) e A2 (`outra-area` tratada como uma pessoa) estão resolvidos, com teste. Os recomendados A4 a A6 foram aplicados. O A3 (decisão M14) fica resolvido pela decisão do dono de 2026-11-02 sobre o teto por PR da aba: um PR por branch, com a linha `teto: excedido` e o motivo no corpo. Sobra um recomendado novo, o A7, que não devolve a entrega.

## Escopo lido (delta)
- `git log ab4b25e..origin/feature/059-contrato-biblioteca`: 4 commits, `ee1c55a` (A1), `ee08882` (A2), `7add30e` (A4 e A6) e `a8871e3` (A5 e a decisão técnica de 09:20). De `51d9ed4` a `ab4b25e` só entrou o parecer anterior, então o código revisado parte de `51d9ed4`.
- `forge-check delta --parecer docs/reviews/059-alfa.md`, intervalo `51d9ed4..a8871e3`: 8 arquivos, todos lidos por inteiro no diff. São eles `classificarApontamento.ts` e, em `businessmap/apontamento/`, `comum.ts`, `filtros.ts`, `capacidade.ts`, `diario.ts`, `qualidade.ts`, `index.ts` e `apontamento.test.ts` (+97 linhas, 7 testes novos). Fora do delta, conferi em `matriz.ts`, `distribuicao.ts` e `achados.ts` que nenhum deles precisava trocar `comPessoa` por `doTime`.
- **Já lido** no parecer anterior e sem mudança no delta: o contrato `packages/contratos/src/apontamento.ts` (forma do §3.9, `outra-area`, piso o3), a normalização e a truncagem do classificador, `achados.ts`, `distribuicao.ts`, `matriz.ts`, `classificarApontamento.test.ts` (o teto de 5 s do teste de orçamento não mudou) e as conferências de o1, o2 e T2.5.

## Renovação por delta em ff47cbd (E2.41)
- `forge-check delta --parecer docs/reviews/059-alfa.md`, intervalo `a8871e3..ff47cbd`: 2 arquivos, `classificarApontamento.ts` (+3 -1) e `classificarApontamento.test.ts` (+22 -6), lidos por inteiro no diff. O resto da branch é **já lido** no parecer anterior.
- `classificarApontamento.ts:178-180`: `semComentario` passa a ser `palavras.length === 0`, no lugar de `normalizado === ''`. Só pontuação ou símbolos (`- - -`) recebe `sem-comentario` e nunca `generico` (`:197` exige `!semComentario`). A regra por tipo de condição sem-comentario (`:189`) e o subgrupo não classificado (`:192`) usam a mesma variável, então ficam coerentes. Atende à decisão do dono; nada além disso mudou.
- Testes: os casos que fixavam o comportamento anterior (`[ ]`, barra invertida, `- -` e `- - -`) foram invertidos; o teste novo cobre `...`, `?!`, `*** ###`, emoji, a regra por tipo e a borda `- ok -`, que volta a ser comentário escrito. O oráculo do teste de propriedade (`:586`) seguiu a regra nova. Nenhum teto de orçamento mudou.
- A7 segue recomendado e não devolve.

## Conferência dos achados anteriores
- **A1, orçamento:** resolvido em `ee1c55a`. `preparar` (`classificarApontamento.ts:157`) ordena as regras e os termos uma vez por dicionário e guarda o resultado num `WeakMap`. `termosQueCasam` (`:133`) faz um caminhar duplo sobre palavras e termos ordenados, no lugar da busca binária por termo. A saída é a mesma. As palavras abaixo do índice atual são menores que o termo anterior, que é menor ou igual ao termo atual, então a primeira palavra maior ou igual ao termo nunca fica para trás. O `.sort()` padrão compara por unidade de código UTF-16, como o `<` de antes. O teste de orçamento não mudou nem afrouxou o teto. CI da ponta: run 41415817732 em `a8871e3`, `success`, job `testes` verde.
- **A2, `outra-area` fora dos blocos por pessoa:** resolvido em `ee08882` e `a8871e3`. `doTime` (`comum.ts:30`) tira `outra-area` de dia atípico (`filtros.ts:16`), capacidade por pessoa e mensal, inclusive no realizado (`capacidade.ts:32` e `:90`), mapa diário (`diario.ts:38`) e qualidade por pessoa (`qualidade.ts:38`). A qualidade geral, a distribuição, a matriz e os totais seguem com `outra-area`, como pede a decisão técnica de 2026-11-02 09:20. O caso do review anterior (três pessoas de 6 h no mesmo dia) virou teste em cada bloco, e o teste de ponta a ponta de `calcularApontamento` confere tudo junto.
- **A3, decisão M14:** resolvido pela decisão do dono de 2026-11-02 sobre o teto por PR da aba. Recontagem com `git diff --numstat --no-renames origin/develop...HEAD`, sem `.md`: 3805 linhas. O corpo do PR para a develop precisa levar `teto: excedido, 3805 linhas, <motivo>` (número recontado na abertura). Sem essa linha, o achado volta.
- **A4:** aplicado em `7add30e`. `pessoasAtivas` conta só o time (`index.ts:74`), como a decisão técnica de 09:20 manda.
- **A5:** aplicado em `a8871e3`. `outra-area` não tem linha no mapa diário, então não tem faixa.
- **A6:** aplicado em `7add30e`, com um único import de `./comum` (`index.ts:11`).

## Achados
- A1 (bloqueante) packages/metricas/src/coletor/classificarApontamento.test.ts:776 · CI vermelha em 51d9ed4: 10 000 comentários em 5919 ms, acima dos 5 s do §3.4. Resolvido em ee1c55a (regras e termos preparados uma vez por dicionário); CI verde em a8871e3 (run 41415817732).
- A2 (bloqueante) packages/metricas/src/businessmap/apontamento/filtros.ts:267 · outra-area tratada como uma pessoa em dia atípico e capacidade. Resolvido em ee08882 e a8871e3: doTime (comum.ts:30) a tira dos blocos por pessoa e dia, com testes em cada bloco.
- A3 (bloqueante) packages/metricas/src/businessmap/apontamento/index.ts:1 · decisão M14, 3805 linhas e três comportamentos. Resolvido pela decisão do dono de 2026-11-02 (um PR por branch da aba com a linha teto: excedido no corpo). Sem a linha no PR, o achado volta.
- A4 (recomendado) packages/metricas/src/businessmap/apontamento/index.ts:230 · pessoasAtivas contava outra-area. Aplicado em 7add30e (index.ts:74, só o time).
- A5 (recomendado) packages/metricas/src/businessmap/apontamento/diario.ts:149 · faixa do mapa diário na linha outra-area. Aplicado em a8871e3: outra-area sem linha no mapa diário.
- A6 (recomendado) packages/metricas/src/businessmap/apontamento/index.ts:174 · import duplicado de ./comum. Aplicado em 7add30e (index.ts:11).
- A7 (recomendado) packages/metricas/src/coletor/classificarApontamento.ts:155 · o cache por identidade supõe que o dicionário não muda depois da primeira chamada, mas versao, termos e regrasPorTipo não são readonly (:34). Marque os campos readonly para o tipo garantir isso.

## Ferramentas e outros pareceres
- O `docs/engineering/praticas.md` não tem regra "decidida por: `<comando>`". Segue como pendência do tech-lead com o arquiteto, sem review manual de lint ou formatação.
- CI de `a8871e3` (run 41415817732): `rapida`, `openapi`, `seguranca`, `imagem`, `build`, `filtro`, `banco` e `testes` verdes; `e2e` e `perf` pulados pelo filtro. No log, `classificarApontamento.test.ts` passa os 84 testes em 6943 ms no arquivo todo, sob cobertura. Não refiz a suíte.
- Segurança: `docs/security/059-alfa.md` é do security-engineer. Não o refiz. O delta mexe no casamento do classificador (`termosQueCasam`), que o parecer dele conferiu na forma de busca binária. A equivalência está argumentada acima, e a renovação dele fica com ele.
- QA: ainda não houve. Vem depois deste review.
