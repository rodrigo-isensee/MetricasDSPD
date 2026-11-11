---
tipo: qa
contrato: 1
pedido: 100-release-bloqueios-simulador
branch: docs/100-release
commit: fc0f952ab1d746fbd0a4cd1728cf086126a66cfb
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---

# QA: release 100 (develop 77c208a9 contra a homolog, PRs 315 a 324)

Links: review `docs/reviews/100-release.md` (a71366af), segurança `docs/security/100-release.md` (aeba81a0), ADR 0030. A árvore revisada (aeba81a0) só soma ao código de 77c208a9 o CHANGELOG e os dois pareceres (`git diff --stat 77c208a9 HEAD`: 3 arquivos, só docs).

## Escopo

Release sem especificação nova: não há plano antecipado nem `CA-n` próprio. O QA confere (1) que os pareceres de QA de cada PR de código do range estão aprovados e sem bug aberto, (2) a suíte inteira (`pnpm run pronto`) na ponta da develop, e (3) os jobs `banco` e `e2e` no CI, porque os testes `.pg` e de navegador não rodam na estação.

## Pareceres de QA do range

| PR | Parecer em `docs/qa/` | Resultado | Bugs |
|---|---|---|---|
| #320 | `075-l9a-web` | aprovado | 0 |
| #323 | `075-l9b-contrato` | aprovado | 0 |
| #321 | `097-k272-ap-tipo` | aprovado | 0 |
| #322 | `099-l1-sem-simulador` | aprovado | 0 |
| #319 | `096-criterios-apontamento-env` | aprovado | 0 |
| #318 | `095-runner-ubuntu-2404` | aprovado | 0 |

Os recomendados abertos nesses pareceres (título do S9b em `server/tests/painel-real-f6.test.ts:484`; falta de teste que injete a nota removida na resposta do O2) não são bugs e não seguram a release.

## Execução local: `pnpm run pronto` (2 workers, `VITEST_MAX_WORKERS=2`)

- Espera pela trava da suíte única (`scripts/suite-unica.sh`): cerca de 6 min nesta tentativa (início 16:45, execução de fato a partir de 16:51; outra suíte de outra worktree segurava a trava). Uma 1ª tentativa, lançada com `nohup`, morreu com o shell e foi descartada; a 2ª é a que vale.
- Duração da execução: 16:51 a 17:10 (cerca de 19 min).
- **rc=1.** Passaram integralmente: `tools/spec-check` 14, `tools/homolog` 78, `packages/contratos` 219, `tools/pesquisa` 33, `packages/mock` 258 (cobertura 100%), `packages/metricas` 1299; `test:trava`, `lint`, `format:check`, e no `server` o `typecheck` e o `lint`.
- **Falhas por carga (timeout), não por defeito:** `server` 4 testes (`tests/metricas.test.ts`: "filtros da sustentação" e "O2: paginação dos itens"; `tests/painel-real-f6.test.ts`: "sem coluna com limite (0)" e "L3: modo mock mantém o número do S3"; "Test timed out in 30000ms/60000ms", 112 a 425 s no relógio) e `web` 4 testes (`preferencias.test.tsx` 2, `visoes.test.tsx` 2; 118 a 435 s). Na mesma execução o `server` e o `web` rodam em paralelo, cada um com 2 workers, e a estação estava saturada.
- **Reteste de cada arquivo sozinho (2 workers):** `server` `tests/metricas.test.ts` e `tests/painel-real-f6.test.ts`: 2 arquivos, 107 testes verdes em 20,5 s, rc=0. `web` `preferencias.test.tsx` e `visoes.test.tsx`: 2 arquivos, 57 testes verdes em 38,7 s, rc=0. Prova de que o problema é de carga, não de regra.
- Como o `pronto` encerra no primeiro passo vermelho do `server`, o limiar de cobertura do `server` e do `web` não foi medido localmente; a prova deles é o job `testes` do CI.

## CI da develop e dos PRs

| Job | Onde | Resultado |
|---|---|---|
| `banco` (testes `.pg`) | run 43084376256, headSha 77c208a9, `push` em develop | success |
| demais jobs (`testes`, `openapi`, `filtro`, `rapida`, `seguranca`, `imagem`, `build`) | mesmo run | success |
| `e2e`, `e2e-parte`, `perf` | mesmo run | skipped, por desenho: `ci.yml:193` e `:233` só rodam em `pull_request` e `workflow_dispatch` |
| `e2e-parte` 1/2 e 2/2, `e2e` | PR #324 (cabeça dd89c22b, mesclado como 77c208a9 por squash) | success (19:18, 19:28, 19:28) |

O `e2e` verde é o do PR #324, na cabeça dele, e não no sha 77c208a9 (o squash muda o sha). O portão da homolog, ao receber a develop, roda o `e2e` e o `banco` de novo contra o candidato.

## Tabela critério, teste, resultado

| Critério | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| Cada PR de código do range tem QA aprovado | pareceres listados acima | atendido | n/a |
| Suíte inteira na ponta da develop | `pnpm run pronto` local (parcial por carga) e job `testes` do CI | verde no CI; local com 8 timeouts por carga, verdes sozinhos | carga da estação |
| Testes `.pg` | job `banco` do run 43084376256 | verde | banco real |
| Testes de navegador | job `e2e` do PR #324 | verde | navegador |

Vermelho antes do verde e mutação: não se aplicam à release (nenhum teste novo escrito aqui; os de cada PR foram tratados nos pareceres deles).

## Achados

- A1 (recomendado) server/tests/painel-real-f6.test.ts:246 · sob carga o `pronto` local deu timeout em 4 testes do server e 4 do web (30 a 60 s; web em preferencias.test.tsx:263 e visoes.test.tsx:28); verdes sozinhos. Rever timeout ou paralelismo de `pnpm -r` sob teto de 2 workers.
