---
tipo: qa
contrato: 1
pedido: 100-release-bloqueios-simulador
branch: docs/100-release-b
commit: 27ac9064fc4ffad4e7f3bf18241aa1979912c009
parecer: aprovado
escopo: incremental
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: release 100 (develop 27ac9064 contra a homolog, PRs 315 a 325), volta sobre o K-271

Links: review `docs/reviews/100-release.md`, segurança `docs/security/100-release.md`, ADR 0030, parecer do K-271 `docs/qa/096-k271-criterios-robustez.md` (aprovado, 0 bugs).

## Escopo

Release sem especificação nova: não há plano antecipado nem `CA-n` próprio. O parecer anterior (branch `docs/100-release`, sobre 77c208a9) conferiu a suíte local e o CI do range dos PRs 315 a 324. Esta volta é incremental: o PR 325 (K-271, c7c3e092) entrou na develop depois dele. O QA confere o delta `77c208a9..27ac9064`: 8 arquivos, dos quais o código é `server/src/entradas/criterios-apontamento.ts` (+19/-11 linhas) e `server/tests/criterios-apontamento-entrada.test.ts` (+33), mais pareceres e CHANGELOG. De c7c3e092 a 27ac9064 só há documentação (CHANGELOG e três pareceres, `git diff --stat`: 4 arquivos).

## Resultado do range anterior (mantido)

Pareceres de QA dos PRs 320, 323, 321, 322, 319 e 318: todos aprovados, 0 bugs. A suíte inteira local e o CI do range 315 a 324 (run 43084376256, 77c208a9: `banco` e demais jobs success; `e2e` verde no PR 324) valem como no parecer anterior; o limiar de cobertura de `server` e `web` tem como prova o job `testes` do CI.

## Execução desta volta

- `server/tests/criterios-apontamento-entrada.test.ts` com 2 workers (`VITEST_MAX_WORKERS=2`, `--maxWorkers=2`): 1 arquivo, 8 testes verdes em 4,4 s, rc=0. Cobre os ramos do K-271 (falha do banco só com a categoria, data validada, argumento a mais recusado com o uso, falha do `.env` que não é ENOENT com exit 2).
- Vermelho antes do verde e mutação do K-271: tratados no parecer do próprio PR (`docs/qa/096-k271-criterios-robustez.md`); não se repetem aqui.

## CI da develop

| Sha | Run | Resultado |
|---|---|---|
| c7c3e092 (K-271) | 43088790240, `push` | success: `build`, `filtro`, `testes`, `rapida`, `openapi`, `imagem`, `seguranca`, `banco`; `e2e`, `e2e-parte`, `perf` skipped por desenho (só rodam em `pull_request` e `workflow_dispatch`) |
| 27ac9064 | 43096344190, `push` | `queued` na consulta (sem jobs iniciados, sem conclusão); o delta sobre c7c3e092 é só documentação |

O run do 27ac9064 não tinha terminado quando este parecer foi gravado; ele não pode virar prova até concluir. O código é idêntico ao de c7c3e092, cujo run está verde, por isso o parecer não fica bloqueado, mas o tech-lead deve conferir o run 43096344190 antes do PR.

## Tabela critério, teste, resultado

| Critério | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Delta K-271 funciona na ponta da develop | `server/tests/criterios-apontamento-entrada.test.ts` (8 testes) | verde | data inválida, argumento a mais, falha do `.env` |
| CI do código da ponta | run 43088790240 (c7c3e092) | success | `banco` real |
| CI do sha final 27ac9064 | run 43096344190 | pendente (queued) | n/a |
| Range 315 a 324 | parecer anterior e run 43084376256 | atendido | n/a |

## Achados

- A1 (recomendado) server/tests/painel-real-f6.test.ts:246 · sob carga o `pronto` local deu timeout em 4 testes do server e 4 do web (30 a 60 s; web em preferencias.test.tsx:263 e visoes.test.tsx:28); verdes sozinhos. Rever timeout ou paralelismo de `pnpm -r` sob teto de 2 workers.
- A2 (recomendado) .github/workflows/ci.yml:1 · o run 43096344190 (27ac9064) estava `queued` sem jobs ao fim desta volta; conferir que conclui verde antes do PR para a develop.
