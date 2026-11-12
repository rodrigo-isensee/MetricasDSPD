---
tipo: qa
contrato: 1
pedido: 099-nenhuma-metrica-simulada
branch: fix/k292-leia-junto-alvo
commit: 0f4eb5208a58fb7f4386bd1b4974d91450a9c977
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-12
---
# QA: K-292, espaçamento vertical do leia-junto

Diff de três pontos contra `develop` (25e57350): um arquivo, uma linha, `web/src/features/complementares/LeiaJunto.tsx:42`. O `ul` do leia-junto ganhou `gap-y-2` (de `gap-x-3` para `gap-x-3 gap-y-2`). Texto, ordem e marcação dos links não mudaram. Sem especificação de UX nova: a obrigação é o bug `docs/qa/bugs/099-e2e-l3-08-target-size.md` (axe `target-size` intermitente no 3º link do `leia-junto-o15`, linha quebrada de `flex-wrap` sem folga vertical).

## Conferências
- **Só espaçamento:** o diff tem 1 linha mudada, só a classe; nenhuma alteração em `pares.map`, no `href`, no texto nem na ordem.
- **Efeito da correção:** com `flex-wrap` e sem `gap-y`, os alvos de linhas quebradas encostavam; `gap-y-2` (8 px) dá folga entre as linhas e o axe deixa de depender da geometria da quebra.

## Execução local (Chromium, `CI=1`, build `VITE_FONTE=mock`, nada contra a base real nem `.env*`)
- Vitest `web/src/features/complementares`: 9 arquivos, 308 de 308 passaram.
- L3-08 (`operacional-lote3.spec.ts:142`) com `--repeat-each=10 --workers=3 --retries=0`: 10 de 10 passaram.
- `complementares.spec.ts`, `a11y.spec.ts` e `operacional-lote3.spec.ts` inteiros (exercitam o leia-junto e o axe): 66 de 66 passaram, `--retries=0`.

## Critério, teste, resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Axe sem `target-size` no leia-junto do Operacional | L3-08, A11Y-03, A11Y-04 | alvo de toque 24 px em linha quebrada | passou |
| Texto e ordem dos links iguais | `leiajunto.test.tsx`, `complementares.spec.ts` | ordem dos pares | passou |

## Limites do parecer
- **Vermelho antes do verde e mutação:** não se aplicam de forma honesta. A falha original era intermitente e não reproduziu local em nenhum sha (bug 099-e2e-l3-08), então a base também passa local e não há vermelho determinístico para colar; a mudança é de classe CSS, sem teste novo nem lógica para mutar. A prova real é o CI repetido: o L3-08 deve passar nos próximos runs; se voltar a falhar, abrir o `trace.zip` e medir a caixa do link, e reabrir o cartão.
- A suíte inteira roda só no CI do PR; cite o check-run `bateria` do mesmo sha ali.

## Achados
