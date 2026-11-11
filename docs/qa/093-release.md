---
tipo: qa
contrato: 1
pedido: 093-release-6b-homolog
branch: docs/093-release-c
commit: 773876f7a2cd3a1e766ff7fbb4484e274207095a
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-11
---
# QA: release 093 (develop em 7b2325a9: PR 298 lote 6b e PRs 302 a 311)

## Parecer
Aprovado. Nenhum bug de produto. A release não tem especificação de UX nova: o 6b já passou por QA no PR 298 (`docs/qa/075-l6b-publicacao-real.md`) e o patch mesclado é idêntico ao revisado. Esta segunda volta cobre a `develop` em `7b2325a9`, com os PRs 308 (K-266, TMPDIR do CLI do seed), 309 e 310 (K-267, regex de pessoa do S6) além dos da volta anterior. O `pnpm run pronto` da raiz passa inteiro dentro do sandbox. O A1 da volta anterior (regex PESSOA do S6) está resolvido: `server/tests/painel-real-f6.test.ts:339` agora cobre `bloqueado por`, `comentário`, `observação` e `quem` (palavra inteira, sem casar `esquema`).

## Execução (`pnpm run pronto` na worktree, node v24.22.1, sozinho na máquina)
Rodado em segundo plano, saída em arquivo; rc 0. A primeira tentativa foi interrompida por mim (o processo morreu junto com o shell de lançamento, sem rc gravado) e refeita do zero; só a segunda conta. Sem teste novo de correção ou de regra no diff desta volta do QA que precise de vermelho-antes-do-verde (o vermelho dos PRs 309 e 310 pertence aos pareceres deles); a branch só soma CHANGELOG e pareceres sobre a develop. Sem mutação a rodar (nenhum arquivo de `bin/`, `hooks/` ou catraca no diff).

| Pacote | Resultado |
|---|---|
| test:trava, lint, format:check | ok |
| tools/spec-check | 14/14 |
| tools/homolog | 78/78 |
| packages/contratos | 219/219 |
| tools/pesquisa | 33/33 |
| packages/metricas | 1278/1278 |
| packages/mock | 258/258 |
| server | 102 arquivos passaram, 41 pulados (por desenho); 1946 testes passaram, 274 pulados, 0 falhas |
| web | 98 arquivos, 1505/1505 |
| tools/docs-contratos | 102/102; `docs:check` ok (1183 páginas, 69 métricas, 2 eventos) |

Zero ocorrências de ENOENT no log. Nenhuma falha de carga nem intermitente (o `simulado.test.tsx` passou nos 98 arquivos do web). A suíte completa também fica provada pelo check-run `bateria` do PR, no mesmo sha, que o tech-lead cita ao abrir E1.4 e E1.5.

## Critério, teste, resultado
| Critério (release) | Teste | Resultado | Fronteira protegida |
|---|---|---|---|
| 6b publica BLOQUEADOS, O1, O2, O5, O19 com dado real | `server/tests/painel-real-f6.test.ts`, testes de `packages/contratos` (origem) e `packages/metricas` | passam | n/a |
| Versão de critério com data 2026-11-01 e corte da série O1 (T2.6) | testes de `packages/metricas` (criterios) | passam | corte do O1 em `null` |
| Sem pessoa nem texto livre do motivo | S6 do `painel-real-f6.test.ts` (regex ampliada pelo K-267) | passa | motivo fora do domínio vira "não classificado"; chave `esquema` não é pessoa |
| Painel Operacional no web | `web`: 98 arquivos | passam | n/a |
| CLI do server roda no sandbox (K-264, K-266) | arquivos `*-entrada` e `apontamento-entradas`, teste do CLI do seed | passam (server 0 falhas) | TMPDIR repassado ao filho |
| Sem migração nova | review: diff sem a pasta de migração | confere | n/a |

## Achados
- A1 (recomendado) CHANGELOG.md:25 · o 6b muda o corte do O1 e leva O1, O2, O5, O19 e BLOQUEADOS a dado real: o PR de release avisa o dono para validar o Operacional na homolog (E1.6) com os bloqueios reais.
