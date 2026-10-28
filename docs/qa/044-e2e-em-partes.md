---
tipo: qa
contrato: 1
pedido: 044-e2e-da-ci-dentro-do-teto
branch: feature/044-e2e-em-partes
commit: ef310bf62716e95f161a076c03758c175468496f
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-28
---

# Parecer de QA: E2E da CI em 2 partes com agregador `e2e` (044, K-155)

## Parecer
Aprovado. O run de workflow_dispatch no head ef310bf passou, com as 2 partes somando todos os testes da E2E e o `e2e` verde. Diff de código: só `.github/workflows/ci.yml`.

## Prova (run 40677944455, headSha ef310bf62716e95f161a076c03758c175468496f, conclusion success)
| Job | Resultado | Testes (`Running N tests`) | Duração do job |
|---|---|---|---|
| e2e-parte (1/2) | success | 358 (shard 1 of 2, 358 passed em 10,1 min) | 12 min 31 s |
| e2e-parte (2/2) | success | 358 (shard 2 of 2, 358 passed em 15,7 min) | 16 min 25 s |
| e2e (agregador) | success | n/a | 2 s |

- Soma das partes: 358 + 358 = 716.
- `playwright test --list --project=chromium` sobre o conteúdo de ef310bf (extraído por `git archive` fora da worktree, que não tem dependências instaladas, com `node_modules` do checkout principal por link): `Total: 716 tests in 26 files`. Soma igual ao total, sem sobra nem repetição.
- O review cita 726 testes; o valor medido é 716 (listagem e CI concordam). Divergência só de texto no review, sem efeito no workflow.

## Critério → teste → resultado
| Critério | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| As 2 partes cobrem toda a suíte | soma dos `Running N tests` contra a listagem | 716 = 716, ok | partição completa (sem sobra) |
| `e2e` (check do ruleset) verde só se as 2 partes passam | run com as 2 partes verdes e `e2e` success | ok | nome `e2e` mantido |
| Falha de parte deixa o `e2e` vermelho | leitura estática: `test "$RESULTADO" = "success"` cobre failure, cancelled e skipped; não exercitado com falha induzida (fora do escopo: não mudar o workflow) | por análise | resultado agregado da matriz |

## Achados
- A1 (recomendado) .github/workflows/ci.yml:231 · a parte 2 leva 16 min contra 12 da parte 1 (desbalanceada); se a suíte crescer, passar a matriz para 3 partes sem mexer no agregador.
- A2 (recomendado) .github/workflows/ci.yml:253 · o agregador não confere a quantidade de partes; se a matriz perder um valor o `e2e` segue verde com menos testes. Sem defeito hoje (soma 716 = listagem).
