---
tipo: review
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k297-catalogo-sem-numero
commit: 510ed67b540cd14e8a5ff9cf0b4b9647380bbf4c
parecer: aprovado
revisor: forge:tech-lead
data: 2026-11-13
---
# Review: K-297, parágrafo e comentários do catálogo sem número fixo (E2.12, K-275)

## Revalidação por delta (2026-11-13, E3.174)
Intervalo lido: `forge-check parecer delta`, `ec0f46b7..510ed67b` (HEAD revisado, PR 396). Entrou o parecer de review `9edc8894` e o merge `510ed67b` da `develop` (`699af53e`) na branch.
- Delta no domínio: `CatalogoPage.tsx`, `catalogo.test.tsx` e `linhas.ts`; o que muda nesses arquivos no intervalo é a anotação de métrica parcial da S12 (`ANOTACAO_PARCIAL`, campo `anotacao` e o teste da linha S12), que veio da `develop` e foi preservada na junção.
- Junção: `git show --remerge-diff 510ed67b` vazio, merge automático sem resolução manual.
- K-297 igual ao aprovado: as linhas `+`/`-` de `git diff 699af53e 510ed67b -- web/` são idênticas às de `git diff f3dd14c3 6fd92647 -- web/` (o patch aprovado); +13 -6 nos mesmos 3 arquivos.
- Execução: `pnpm --filter web exec vitest run src/features/catalogo/ --maxWorkers=2` em 510ed67b: `Test Files 2 passed (2)`, `Tests 7 passed (7)`.
- CI do PR 396 em 510ed67b: `gh pr checks 396` rc=0, todos os checks `pass` (testes, e2e-parte 1/2 e 2/2, banco, rapida, seguranca, build, openapi, imagem, filtro), perf e duplicatas `skipping`.
- Especificação: `docs/ux/099-textos-sem-simulado.md:29,32` na branch ainda tem "45 métricas"; segue a nota do parecer original (entra pelo PR de documentos), sem achado neste diff.

Veredito mantido: aprovado.

## Achados
- A1 (recomendado) web/src/features/catalogo/catalogo.test.tsx:10 · fora do diff: o nome do teste diz "45 do briefing + a PV1 + 3 níveis extras" (soma 49), mas afirma 65 linhas; pela contagem da especificação (45 + 16 complementares + PV1 + 3 níveis) o nome fica sem número, como o K-297 fez nos comentários. Cartão próprio, não bloqueia.

## Sondas

## Parecer
Aprovado sobre ec0f46b7 (código em 6fd92647, base develop f3dd14c3; o ec0f46b7 só soma o parecer do QA); revalidado sobre 510ed67b (acima).

- **Texto igual à especificação:** o parágrafo de `CatalogoPage.tsx:27-31` é, palavra por palavra, o "Texto novo (K-297, 2026-11-12)" do WB-1 em `docs/ux/099-textos-sem-simulado.md:32` da árvore principal. Os comentários de `CatalogoPage.tsx:10` e `linhas.ts:28` seguem a frase da especificação ("o catálogo das métricas do briefing, das complementares e da percepção, com a espera invisível em uma linha por nível"); o de `linhas.ts` mantém a nota da PV1 como terceira fonte, que é informação de contrato e não número. A contagem exata segue na linha `contagem-catalogo` (`CatalogoPage.tsx:63`), coberta pelos testes de 65 e 33 linhas.
- **Especificação na branch:** a `develop` ainda tem o texto antigo em `docs/ux/099-textos-sem-simulado.md:32` (com "45 métricas"); a versão K-297 está só na árvore principal e entra no próximo PR de documentos, como o Jarvis registrou no pedido (06:04). Não é achado deste diff, mas o PR de documentos precisa entrar para a especificação e o código baterem na `develop`.
- **Teste:** `catalogo.test.tsx:75-80` afirma o parágrafo novo inteiro (até "por nível.") e a ausência de "45 métricas"; o alvo do teste de ausência é o texto antigo que o diff tirou, e o teste positivo ao lado impede que a ausência passe com a página vazia. QA provou vermelho antes do verde e mutação morta (`docs/qa/099-k297-catalogo-sem-numero.md`).
- **Execução:** `VITEST_MAX_WORKERS=2 pnpm --filter web exec vitest run src/features/catalogo/` em ec0f46b7: `Test Files 2 passed (2)`, `Tests 7 passed (7)`.
- **Regras:** sem guarda nova (só texto e comentário), sem gatilho de `R-SEGURANCA`, sem dado pessoal nem número de exemplo; regras invioláveis intactas. Tamanho: +13 -6 em 3 arquivos. Commit `fix(catalogo): ...` com `Cartão: K-275`, mensagem clara.
