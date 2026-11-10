---
tipo: qa
contrato: 1
pedido: 077-tendencias-dado-real
branch: feature/077-l1a-janela
commit: 6058609f3d36060e6bb07cfe27c56cf5d600ddbf
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-06
---
# QA: 077 lote 1a, janela incompleta na biblioteca e no contrato das tendências (E2.3, K-211)

Código testado: `6058609f`. O HEAD `b55f3af8` só soma `docs/reviews/077-l1a-janela.md`. Obrigação: `docs/analises/077-desenho.md` (§3 regra da janela, §4 contrato, "Lote 1a") e `docs/ux/077-tendencias.md` (CA-1, CA-3, CA-4, CA-15). Este lote não aplica a janela a nenhuma tendência (Lote 1b) nem toca tela.

## Escopo
- Dentro: `janelaIncompleta` em `core/series.ts`; campo opcional e refine nos dois schemas; artefatos gerados.
- Fora: cálculo das tendências (1b), servidor (3a), tela (4a, 4b), E2E e acessibilidade (sem mudança de tela).

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Fronteira: `inicio = historicoDesde` completa, um dia antes incompleta (§3 A4) | `series.janela-incompleta.test.ts`, caso 1 | igualdade e um dia | passou |
| Ausente = falso | mesmo arquivo, caso 2 (omitido e `undefined`) | campo ausente | passou |
| CA-1: nunca zero no lugar do ponto; refine recusa mês com `janelaIncompleta` e estatística, nos dois schemas | `tendencia-janela.test.ts`, caso 2 | mês marcado com estatística | passou |
| CA-4: mês marcado só com contagens é aceito (sem "poucos itens" no mês) | `tendencia-janela.test.ts`, caso 3 | listas vazias com marca | passou |
| CA-3: mês sem marca com estatística segue aceito (aditivo) | `tendencia-janela.test.ts`, caso 1 | campo ausente | passou |
| CA-15: campo extra de pessoa some no parse | `tendencia-janela.test.ts`, caso 4 | chave extra | passou |
| Mudança aditiva, sem `aceitas.json`; `server/` e `web/` intactos | `git diff --stat 78cf396c 6058609f -- server web docs/contratos/snapshots/aceitas.json` | uso único do aceite | vazio |
| Artefatos gerados batem com o schema | `pnpm docs:check` na worktree; CI `openapi` | fotografia e OpenAPI | `docs:check: ok (1045 páginas Markdown, 69 métricas, 2 eventos)`; CI success |

Nota: CA-1 e CA-4 na tela e no cálculo (30 e 14 itens) só se provam nos Lotes 1b e 4a; aqui vale a recusa e a aceitação do formato.

## Execução (máx. 2 workers)
- `packages/contratos`: `vitest run src/tendencia-janela.test.ts`, 1 arquivo, 4 passed.
- `packages/metricas`: `vitest run src/core/series.janela-incompleta.test.ts`, 1 arquivo, 2 passed.
- Suíte: CI do push, `gh run view 42274952850 --json headSha,conclusion` devolveu `{"conclusion":"success","headSha":"6058609f3d36060e6bb07cfe27c56cf5d600ddbf"}`.
- Diff conferido (`-w`): `series.ts` soma 5 linhas; `schemas.ts` só inclui o campo, o refine e a constante da mensagem, o resto é reindentação; sem `.strict()`.

## Vermelho antes do verde
Cópia em `$TMPDIR/qa-engineer-077-l1a/` com `schemas.ts` e `series.ts` da base `78cf396c` e o resto do head:
- `tendencia-janela.test.ts`: `Tests 1 failed | 3 passed (4)`; cai `refine recusa mês com janelaIncompleta e estatística`. Os outros três guardam o que a base já fazia (aceitar e descartar chave extra).
- `series.janela-incompleta.test.ts`: `Tests 2 failed`, `TypeError: janelaIncompleta is not a function` (prova só a ausência do código, então a mutação abaixo).

## Mutação à mão (cópia em `$TMPDIR`)
| Mutante | Resultado |
|---|---|
| M1 `<` vira `<=` na fronteira | morto (1 failed) |
| M3 `<` vira `>` | morto (1 failed) |
| M2 tira `historicoDesde !== undefined &&` | sobrevive; equivalente em runtime (`texto < undefined` é falso em JS), a guarda vale para o tipo |
| M4 refine de `p85PorTipo` vira `>= 0` (sempre verdadeiro) | morto |
| M5 refine de `prioridades` vira `true` | morto |
| M6 refine de `p85PorTipo` vira `!m.janelaIncompleta` (recusa toda marca) | morto (2 failed, inclui o caso de contagens) |
| M7 campo deixa de ser `optional` | morto |

## Não feito
- Teste da data com hora no `historicoDesde` (A1 do review): fica para o Lote 3a, que valida AAAA-MM-DD.
- E2E e acessibilidade: sem mudança de tela neste lote.

## Achados
- A1 (recomendado) packages/metricas/src/core/series.ts:117 · a comparação é de texto e só vale com as duas datas em AAAA-MM-DD; o Lote 3a precisa de teste de fronteira com o formato validado.
