---
tipo: qa
contrato: 1
pedido: 093-release-6b-homolog
branch: docs/093-release
commit: ce704f9b61bb23ae2b1e197d50b71394f4dbf622
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: release 093 (develop em c6e5fd8f: PR 298, lote 6b, e PR 302)

## Parecer
Aprovado, com uma ressalva de ambiente (A1). Nenhum bug de produto. A release não tem especificação de UX nova: o 6b já passou por QA no PR 298 (`docs/qa/075-l6b-publicacao-real.md`) e o patch mesclado é idêntico ao revisado (review e segurança desta release). Aqui rodei as suítes na ponta da branch, que contém a `develop` em `c6e5fd8f`.

## Execução (`pnpm run pronto` na worktree, node v24.22.1)
Sem teste novo nesta release, então não há vermelho-antes-do-verde nem mutação a rodar (diff de produção: dois símbolos de publicação e dois comentários; testes do 6b já provados no PR 298).

| Pacote | Resultado |
|---|---|
| test:trava, lint, format:check | ok |
| tools/spec-check | 14/14 |
| tools/homolog | 73/73 |
| packages/contratos | 219/219 |
| tools/pesquisa | 33/33 |
| packages/metricas | 1278/1278 |
| packages/mock | 258/258 |
| server | 1914 passaram, 274 puladas, 31 falharam (5 arquivos, todos de CLI) |
| web (`pnpm run pronto` na pasta: typecheck, cobertura, build, size) | 98 arquivos, 1505/1505, rc 0 |

O `pronto` da raiz saiu com rc 1 por causa do server; o web não foi alcançado pela raiz e rodei à parte (rc 0).

Falhas do server: `apontamento-entradas`, `ref-sync-ac-entrada`, `ref-sync-apontamento-entrada`, `ref-sync-businessmap-entrada` e `ref-sync-calendario-entrada`. Todas spawnam a CLI com `tsx`, que falha com `ENOENT: mkdir '/tmp/tsx-1000'` no sandbox (10 ocorrências no log), e o teste vê status 1 em vez do esperado. É o K-264, ainda fora da develop; nenhum desses arquivos nem o código da CLI está no diff da release. Não é bug do produto; a suíte completa fica provada pelo CI do PR (check-run `bateria` do mesmo sha), que cito na abertura do PR E1.4/E1.5.

## Critério, teste, resultado
| Critério (release) | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| 6b publica BLOQUEADOS, O1, O2, O5, O19 com dado real | `server/tests/painel-real-f6.test.ts` e testes de `packages/contratos` (origem) e `packages/metricas` | passam (server, contratos, metricas) | n/a |
| Versão de critério com data 2026-11-01 e corte da série O1 (T2.6) | testes de `packages/metricas` (criterios) | passam | corte do O1 em `null` |
| Sem pessoa nem texto livre do motivo | S6 do `painel-real-f6.test.ts` | passa (ver A2) | motivo fora do domínio vira "não classificado" |
| Painel Operacional no web | `web`: 98 arquivos | passam | n/a |
| Sem migração nova | review: diff sem a pasta de migração | confere | n/a |

## Achados
- A1 (recomendado) server/tests/apontamento-entradas.test.ts:18 · 31 testes de CLI do server falham por ENOENT em /tmp/tsx-1000 no sandbox (K-264); fora do diff da release. Prova da suíte completa: check-run bateria do PR, no mesmo sha.
- A2 (recomendado) server/tests/painel-real-f6.test.ts:339 · a regex PESSOA do S6 não cobre bloquead[oa]_?por, quem, coment nem observ (A1 do parecer de segurança); sem cartão confirmado, vale abrir um para o QA.
- A3 (recomendado) CHANGELOG.md:50 · o 6b muda o corte do O1 e leva O1, O2, O5, O19 e BLOQUEADOS a dado real: o PR de release deve avisar o dono para validar o Operacional na homolog (E1.6) com os bloqueios reais.
