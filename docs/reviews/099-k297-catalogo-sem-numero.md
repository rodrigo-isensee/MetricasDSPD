---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k297-catalogo-sem-numero
commit: ec0f46b74bd936ce19bd97e4375fc1f78a3231c5
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-12
---
# Review: K-297, parágrafo e comentários do catálogo sem número fixo (E2.12, K-275)

## Achados
- A1 (recomendado) web/src/features/catalogo/catalogo.test.tsx:10 · fora do diff: o nome do teste diz "45 do briefing + a PV1 + 3 níveis extras" (soma 49), mas afirma 65 linhas; pela contagem da especificação (45 + 16 complementares + PV1 + 3 níveis) o nome fica sem número, como o K-297 fez nos comentários. Cartão próprio, não bloqueia.

## Sondas

## Parecer
Aprovado sobre ec0f46b7 (código em 6fd92647, base develop f3dd14c3; o ec0f46b7 só soma o parecer do QA).

- **Texto igual à especificação:** o parágrafo de `CatalogoPage.tsx:27-31` é, palavra por palavra, o "Texto novo (K-297, 2026-11-12)" do WB-1 em `docs/ux/099-textos-sem-simulado.md:32` da árvore principal. Os comentários de `CatalogoPage.tsx:10` e `linhas.ts:28` seguem a frase da especificação ("o catálogo das métricas do briefing, das complementares e da percepção, com a espera invisível em uma linha por nível"); o de `linhas.ts` mantém a nota da PV1 como terceira fonte, que é informação de contrato e não número. A contagem exata segue na linha `contagem-catalogo` (`CatalogoPage.tsx:63`), coberta pelos testes de 65 e 33 linhas.
- **Especificação na branch:** a `develop` ainda tem o texto antigo em `docs/ux/099-textos-sem-simulado.md:32` (com "45 métricas"); a versão K-297 está só na árvore principal e entra no próximo PR de documentos, como o Jarvis registrou no pedido (06:04). Não é achado deste diff, mas o PR de documentos precisa entrar para a especificação e o código baterem na `develop`.
- **Teste:** `catalogo.test.tsx:75-80` afirma o parágrafo novo inteiro (até "por nível.") e a ausência de "45 métricas"; o alvo do teste de ausência é o texto antigo que o diff tirou, e o teste positivo ao lado impede que a ausência passe com a página vazia. QA provou vermelho antes do verde e mutação morta (`docs/qa/099-k297-catalogo-sem-numero.md`).
- **Execução:** `VITEST_MAX_WORKERS=2 pnpm --filter web exec vitest run src/features/catalogo/` em ec0f46b7: `Test Files 2 passed (2)`, `Tests 7 passed (7)`.
- **Regras:** sem guarda nova (só texto e comentário), sem gatilho de `R-SEGURANCA`, sem dado pessoal nem número de exemplo; regras invioláveis intactas. Tamanho: +13 -6 em 3 arquivos. Commit `fix(catalogo): ...` com `Cartão: K-275`, mensagem clara.
