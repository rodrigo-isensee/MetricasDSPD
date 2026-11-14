---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k297-catalogo-sem-numero
commit: 510ed67b540cd14e8a5ff9cf0b4b9647380bbf4c
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-13
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

## Revalidação (junção com a develop, 510ed67b; escopo incremental)
Delta lido: `forge-check parecer delta` (catálogo: `CatalogoPage.tsx`, `catalogo.test.tsx`, `linhas.ts`) e `git diff 9edc8894 04fefc16 -- web/`. Novo no catálogo: anotação de métrica parcial (S12: "Parcial: volume por sistema; reincidência sem fonte"), exibida sob o nome; `dados` segue só `Real | Sem dado real`. O resto do diff de `web/` veio da develop.

| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Parágrafo e contagem sem número fixo (anteriores) | `catalogo.test.tsx` | número fixo antigo | passa |
| S12 mostra a anotação de parcial, sem virar terceiro valor de `dados` | `catalogo.test.tsx` linha S12 `toHaveTextContent`; contagem "Sem dado real" = 65 - reais | só S12 anotada; 65 linhas | passa |

- Vitest: `npx vitest run src/features/catalogo src/features/complementares --maxWorkers=2`: `Test Files 13 passed (13)`, `Tests 324 passed (324)`.
- Mutação: cortei "; reincidência sem fonte" da anotação em `linhas.ts`; caiu `catalogo.test.tsx` (`1 failed | 6 passed`). Restaurado por `git show HEAD:` do arquivo; sem mudança em rastreados.
- CI do PR 396 (`gh pr checks 396`), na leitura: build, filtro, imagem, openapi, rapida, seguranca e banco passam; `testes` (bateria) e `e2e-parte` seguem `pending`. Suíte inteira não citada como verde: depende desse check no mesmo sha.

## Achados
