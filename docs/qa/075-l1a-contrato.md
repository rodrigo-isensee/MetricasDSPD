---
tipo: qa
contrato: 1
pedido: 075-bloqueios-reais
branch: feature/075-l1a-contrato
commit: 5f51fdcd72e9962e6fcbd3b63e41038cb73c8785
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-06
---
# QA: 075 lote 1a, contrato aceita "não classificado" (E1.8, K-204)

Código testado: `5f51fdc`. O HEAD `e6416c5` só soma `docs/reviews/075-l1a-contrato.md` e `docs/security/075-l1a-contrato.md` (conferido por `git diff --stat`). Obrigação: `docs/analises/075-plano.md`, seção Lote 1a, e CA-075-11. Sem especificação de UX com `CA-n` para este lote.

## Escopo
- Dentro: enum de motivo de BLOQUEADOS, O2 e O19; tipos em `estado.ts` e `modelo.ts`; fotografias, `openapi.json` e páginas de contrato.
- Fora: leitura/projeção do servidor (lote 1b), tela, E2E (sem mudança de tela), Postgres.

## Critério → teste → resultado
| Obrigação | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| 8 motivos aceitos e um nono recusado em BLOQUEADOS, O2 e O19 | `motivo-nao-classificado.test.ts` (3 casos `it.each`; recusa `outro motivo` e `Não classificado`) | valor logo fora do enum; caixa | passou |
| Os 7 do briefing intactos; texto exato | mesmo arquivo, caso 1 | tamanho 7 e igualdade da lista publicada | passou |
| CA-075-11: nenhuma chave de pessoa nos schemas | mesmo arquivo, caso 5 (percorre `shape`, `element` e `unwrap`) | chaves aninhadas | passou |
| `aceitas.json` sem diferença | `git diff 6754df7...HEAD -- docs/contratos/snapshots/aceitas.json` | uso único do aceite | vazio (0 bytes) |
| `web` compila | `pnpm run typecheck` em `web` (`tsc -b`) | consumidor do tipo | rc 0 |
| `docs:check` e `openapi:verificar` | CI do push em `5f51fdc` | fotografia e OpenAPI coerentes | success |

## Execução (2 workers, MemAvailable 16 GB, load 0,65)
- `packages/contratos`, `vitest run --maxWorkers=2`: `11 files, 213 passed`.
- `web`, `tsc -b`: sem erro.
- CI do push: `gh run list` devolveu run `5f51fdc` completed/success; a run do HEAD `e6416c5` estava `in_progress`, então vale a do `5f51fdc` (só documentos de parecer separam os dois).
- Diff conferido: schemas e `tambem.ts` trocam só o enum; `estado.ts` e `modelo.ts` só trocam o tipo; fotografias, `openapi.json` e `O2.md` só somam a linha `"não classificado"`.

## Vermelho antes do verde
`forge-testes --vermelho 6754df7` não serve aqui (`comum.ts` sem mapa; saída "nenhum teste prova a mudança"). Prova manual em cópia em `$TMPDIR`: `schemas.ts` e `tambem.ts` da base, o resto do head. Resultado: `Tests 3 failed | 2 passed (5)`; caem os três `aceita os 8 valores` com `AssertionError: não classificado: expected false to be true`. Os dois casos de texto e de CA-075-11 passam (guardam o que não mudou).

## Não feito
- Mutação: sem ferramenta declarada para o diff; o vermelho acima cobre o ponto que muda.
- Conferência de switch exaustivo no `web`: o typecheck compila; não busquei `MotivoBloqueio` em `web/src` além disso.

## Achados
- A1 (recomendado) packages/contratos/src/motivo-nao-classificado.test.ts:11 · a regex PESSOA do CA-075-11 só pega as chaves de hoje; manter alinhada à lista de campos de pessoa da ADR 0020 se ela crescer.
