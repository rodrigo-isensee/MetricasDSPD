---
tipo: qa
contrato: 1
pedido: 097-resumo-filtro-time
branch: feature/097-l2-apontamento-equipe
commit: 5f4a8f3bad853d083d9cc8c1b68d2302ee9a6043
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: 097 L2, equipe no Apontamento (parte servidor), volta 2

**Veredito: aprovado.** Revalidação pelo delta `18424b56..5f4a8f3b`: só testes (`apontamento-rota.pg.test.ts` e `times-sem-comparacao.test.ts`); nenhum arquivo de `server/src` nem de `packages/` mudou. A tabela critério → teste da volta 1 e da primeira passada vale sem mudança. O A1 e o A3 do review estão atendidos.

## Execução (`VITEST_MAX_WORKERS=2`, sem `.env`, sem base real)
- `server`: `tests/apontamento-rota.test.ts` + `tests/times-sem-comparacao.test.ts`: `Test Files 2 passed (2)`, `Tests 89 passed (89)`.
- `apontamento-rota.pg.test.ts` precisa de banco e roda no job `banco` do CI; o `.verde` local não vale como prova. Conferi por leitura que o caso novo é coerente com o SQL de `lerCardsIncompletos` e com as fixtures (FILHO no Time Alfa, OUTRO no Time Beta, SOLTO sem time; fatos de 2031-05-03 a 06; estado atual por `DISTINCT ON ... cobertura_sk DESC`).

## Critério → teste → resultado (delta)
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| A1: incompletos por equipe ponta a ponta (time existente, `sem-time`, slug inexistente) | `.pg` "cards incompletos filtrados por equipe ponta a ponta ..." (sem filtro = 3; alfa = FILHO; beta = OUTRO; `sem-time` = SOLTO; `nao-existe` = `[]`) | filtro ativo sem nome resolvido nunca vira "todos"; `sem-time` | a conferir no CI (job banco) |
| A1: o caso limpa o que grava | mesmo teste: `finally` regrava `completo` para os 3 cards (tabela append-only, estado atual volta a completo) | vazamento entre casos | a conferir no CI |
| A3: recorte por time provado pelo schema, não por contagem de texto | `times-sem-comparacao`: aceita `time-alfa` e `time-alfa,sem-time`; recusa `Time Alfa` (não é slug), `porEquipe` (consulta estrita) e 51 slugs (teto 50) | formato do slug, máximo 50, sem chave de agrupamento | passou |

## Mutação (uma, restaurada, árvore limpa)
| Mutante | Resultado |
|---|---|
| `packages/contratos/src/apontamento.ts:143`: comentar o campo `equipe` da consulta | morto: `times-sem-comparacao` caiu (`expected false to be true`; 1 falha, 6 passaram) |

Restaurado com `git checkout`; `git status` limpo.

## Achados
