---
tipo: qa
contrato: 1
pedido: 093-release-6b-homolog
branch: docs/093-release-b
commit: 1d1dc74ca30e03f9a3a35e2ff37615233673ddf0
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: release 093 (develop em 9fe4b61f: PR 298 lote 6b, PR 302, 303, 304, 305 e 307)

## Parecer
Aprovado. Nenhum bug de produto. A release não tem especificação de UX nova: o 6b já passou por QA no PR 298 (`docs/qa/075-l6b-publicacao-real.md`) e o patch mesclado é idêntico ao revisado. Nesta volta a branch contém a `develop` em `9fe4b61f`, com o K-264 (PR 305), e o `pnpm run pronto` da raiz passa inteiro dentro do sandbox. A ressalva de ambiente da primeira rodada (A1 antigo, ENOENT em `/tmp/tsx-1000`) está resolvida.

## Execução (`pnpm run pronto` na worktree, node v24.22.1, sozinho na máquina)
Comando rodado em segundo plano, saída em arquivo; rc 0. Sem teste novo de correção ou de regra nesta release (PRs 303, 304, 305 e 307 são ajuste de CI, de teste de CLI e de frontmatter), então não há vermelho-antes-do-verde nem mutação a rodar; o K-264 é o próprio conserto do ambiente de teste e se prova pelo verde do server abaixo.

| Pacote | Resultado |
|---|---|
| test:trava, lint, format:check | ok |
| tools/spec-check | 14/14 |
| tools/homolog | 78/78 |
| packages/contratos | 219/219 |
| tools/pesquisa | 33/33 |
| packages/metricas | 1278/1278 |
| packages/mock | 258/258 |
| server | 1945 passaram, 274 puladas (puladas por desenho, 41 arquivos), 0 falhas; cobertura 100% |
| web | 98 arquivos, 1505/1505 |
| tools/docs-contratos | 102/102; `docs:check` ok (1178 páginas, 69 métricas, 2 eventos) |

Zero ocorrências de ENOENT no log. Nenhuma falha de carga. A suíte completa também fica provada pelo check-run `bateria` do PR, no mesmo sha, que o tech-lead cita ao abrir E1.4 e E1.5.

## Critério, teste, resultado
| Critério (release) | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| 6b publica BLOQUEADOS, O1, O2, O5, O19 com dado real | `server/tests/painel-real-f6.test.ts`, testes de `packages/contratos` (origem) e `packages/metricas` | passam | n/a |
| Versão de critério com data 2026-11-01 e corte da série O1 (T2.6) | testes de `packages/metricas` (criterios) | passam | corte do O1 em `null` |
| Sem pessoa nem texto livre do motivo | S6 do `painel-real-f6.test.ts` | passa (ver A1) | motivo fora do domínio vira "não classificado" |
| Painel Operacional no web | `web`: 98 arquivos | passam | n/a |
| CLI do server roda no sandbox (K-264) | cinco arquivos `*-entrada` e `apontamento-entradas` | passam (server 0 falhas) | TMPDIR repassado ao filho |
| Sem migração nova | review: diff sem a pasta de migração | confere | n/a |

## Achados
- A1 (recomendado) server/tests/painel-real-f6.test.ts:339 · a regex PESSOA do S6 não cobre bloquead[oa]_?por, quem, coment nem observ (A1 do parecer de segurança); abrir cartão no quadro, sem bloquear a release.
- A2 (recomendado) CHANGELOG.md:25 · o 6b muda o corte do O1 e leva O1, O2, O5, O19 e BLOQUEADOS a dado real: o PR de release avisa o dono para validar o Operacional na homolog (E1.6) com os bloqueios reais.
