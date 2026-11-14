---
tipo: review
contrato: 1
pedido: 097-resumo-filtro-time
branch: fix/k299-ap-projeto-l9
commit: 6279c8a40092d7826d3414a4801a886ecc2aeca8
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Review: K-299 do 097, ajustes do AP-PROJETO depois do L9 (E4.37)

Diff de `fix/k299-ap-projeto-l9` contra a `develop` (`e5092e05...6279c8a4`), um commit, 5 arquivos em `web/src/features/apontamento/`. Referências: revisão de UX do L9 (`docs/ux/097-revisao-l9.md`, M-1, M-2, B-2, B-3) e o A3 de `docs/reviews/097-l9-dez-maiores.md`.

## O que foi conferido
- **M-1 fechado:** o botão Ver todos / Ver só os 10 maiores ficou só com o rótulo que muda; o `aria-expanded` saiu (a recomendação do UX). Os testes passaram a afirmar a ausência do atributo e o texto do botão nos dois estados; o foco segue no mesmo botão (`toHaveFocus`).
- **M-2 fechado:** a frase "Mostrando..." deixou de sumir: é um `role="status"` sempre montado quando há corte, com `MAIORES.mostrandoTodos(n)` expandido e `MAIORES.mostrando(n)` recolhido. Como o nó persiste e só o texto troca, o leitor anuncia a mudança. O teste afirma os dois textos.
- **B-2 fechado:** `demaisIncompleto` olha só `todas.slice(corte.visiveis.length)`, que é exatamente o conjunto agregado em Demais (o `dezMaiores` corta a ordem recebida, sem reordenar), e o selo `SeloHorasIncompletas` entra na linha Demais. Testes do ramo positivo (`p11`) e dos dois negativos (incompleto entre os 10 e nenhum incompleto).
- **B-3 fechado:** `alturaGrafico` em `dezMaiores.ts`, função pura com piso 200, 40 por linha e teto 1200, constantes nomeadas; teste unitário das bordas (0, 5, 12, 30, 500) e teste de tela com 60 projetos.
- **A3 fechado:** vetor `ordem` com os 3 rótulos usados e sem a linha em branco na cadeia.
- **Regras invioláveis:** nada de métrica individual nem ranking por pessoa; o corte é por projeto e a altura é só apresentação. Nenhum cálculo de tempo, percentil ou previsão novo.
- **Mutantes à mão (restaurados pelo `git show HEAD:`):** `todas.slice(corte.visiveis.length).some` → `todas.some` morre em "B-2: sem incompleto entre os demais..."; tirar o `Math.min(ALTURA_MAXIMA_GRAFICO, ...)` morre no unitário e no teste de tela do B-3.
- **Testes do item:** `npx vitest run` de `dez-maiores.test.tsx` e `dezMaiores.test.ts`: 2 arquivos, 16 testes passando.
- **CI do head (check-runs de `6279c8a4`):** `rapida`, `build`, `testes`, `openapi`, `filtro`, `seguranca`, `imagem` em success; `banco`, `e2e`, `perf` skipped pelo filtro de caminhos.
- **Tamanho:** 66 adições e 20 remoções (86 linhas), dentro da orientação; um comportamento (ajustes de UX do cartão).
- **Commit:** um `fix(apontamento)` em Conventional Commits em português, com o cartão no assunto.

## Achados
- A1 (recomendado) web/src/features/apontamento/dez-maiores.test.tsx:180 · o teste de tela do B-3 acha a altura por `figure > div[style]`, marcação interna de `Barras`. Sugestão: `data-testid` no contêiner ou deixar a prova no unitário de `alturaGrafico`.
- A2 (recomendado) web/src/features/apontamento/dezMaiores.ts:7 · com teto de 1200 px a barra encolhe (60 projetos dão 20 px, 300 dão 4 px) e os rótulos podem se sobrepor. Observar no uso real, como o B-3 do UX já previa.

## Parecer
Aprovado em 6279c8a4. M-1, M-2, B-2, B-3 e o A3 do L9 fechados, com teste que discrimina; os dois achados são recomendados e não bloqueiam.
