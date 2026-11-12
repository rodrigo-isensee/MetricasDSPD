---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k297-catalogo-sem-numero
commit: 6fd92647e517585003be3523f1638a05bc6006e1
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---

# QA: pedido 099, K-297 (parágrafo do catálogo sem número fixo)

Links: especificação `docs/ux/099-textos-sem-simulado.md` (linhas 29 e 32), pedido `docs/pedidos/099-nenhuma-metrica-simulada.md`, ADR 0030.

## Veredito
**Aprovado** sobre o HEAD 6fd92647 (worktree limpa na branch `fix/k297-catalogo-sem-numero`). O parágrafo em `CatalogoPage.tsx` é idêntico, caractere por caractere, ao "Texto novo" da especificação; nenhum "45 métricas" sobra na tela; a contagem-catalogo segue certa; os comentários de `CatalogoPage.tsx` e `linhas.ts` ficaram sem número.

## Critério, teste, resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Parágrafo de abertura igual ao texto novo da spec | `catalogo.test.tsx` "o parágrafo de abertura e a legenda..." (regex com a primeira frase; a segunda parte e a legenda no mesmo teste); diff conferido contra a spec | frase exata | passa |
| Nenhum "45 métricas" na tela | mesmo teste (`queryByText(/45 métricas/)` ausente) | número fixo antigo | passa |
| Contagem exata continua na linha contagem-catalogo (65) | e2e `complementares.spec.ts` COMP-03 e COMP-12 (chromium) | 65 linhas, Complementar 33 | passa |

## Execução
- Vitest: `npx vitest run src/features/catalogo` na `web/`: `Test Files 2 passed (2)`, `Tests 7 passed (7)`.
- Playwright (projeto chromium, fonte mock): `npx playwright test tests/complementares.spec.ts --project=chromium -g "COMP-03|COMP-12"`: 4 passed (COMP-03 a 1280 e 375 px, COMP-12 x2).
- Mutação no texto: troquei "acrescentadas depois dele" por "acrescentadas antes dele" em `CatalogoPage.tsx`; o Vitest caiu (`1 failed | 6 passed`, "o parágrafo de abertura e a legenda falam de dado real, sem dado fictício"). Restaurado por `git checkout -- ` do arquivo; `git status --short` vazio.
- Vermelho antes do verde: a asserção nova do texto e a de "45 métricas" falham contra o parágrafo antigo da base (que tinha "45 métricas do briefing + 1 de percepção"); a mutação acima mostra o teste sensível ao texto.
- Nota sem achado: o título do COMP-03 no e2e ainda diz "45 do briefing" (só nome de teste, não aparece na tela; fora do escopo do K-297).
- Suíte inteira: no CI do PR (check `bateria` do mesmo sha), não citada aqui. Nada contra base real nem `.env*`.

## Achados
