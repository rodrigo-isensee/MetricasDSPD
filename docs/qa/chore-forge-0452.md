---
tipo: qa
contrato: 1
pedido: 084-forge-0450
branch: forge/upgrade-0.45.2
commit: 378c05685d2bd8fa52b0d03297b24e692f4622a1
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-11-10
---
# QA: upgrade do Forge para 0.45.2

Veredito: aprovado. O diff de `378c0568` contra `origin/develop` (528ae770) é só `.forge/versao` (0.44.2 para 0.45.2): sem código, interface, `CA-n` nem teste novo, então vermelho antes do verde, mutação, E2E e acessibilidade não se aplicam. Nenhuma falha nova: tudo o que o `pronto` cobre passou, e a única anomalia (trava do teste de trava sob `pnpm run pronto`) é a mesma já registrada no QA do 0.44.2, sem relação com a versão.

## Achados

- A1 (recomendado) scripts/suite-unica.test.sh:54 · `pnpm run pronto` pendura no teste 4 (caminho padrão da trava): a 2ª chamada espera a trava que o próprio pronto segura. Pré-existente (QA 0.44.2); tratar em pedido próprio.
- A2 (recomendado) server/tests/ref-sync-calendario-entrada.test.ts:8 · no sandbox, 25 testes de entrada (4 arquivos) caem por ENOENT em `/tmp/tsx-1000` (tsx); fora do sandbox passam 31/31. Ambiental, sem relação com a versão.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Diff só muda `.forge/versao` | `git diff origin/develop...378c0568 --stat`: 1 arquivo, 1 inserção, 1 remoção (`0.44.2` para `0.45.2`) | n/a | passou |
| Trava, lint e typecheck dos alterados | `lint-alterados.test.sh`, `typecheck-alterados.test.sh`: rc 0; `suite-unica.test.sh`: testes 1 a 6 ok, depois trava (A1) | n/a | passou, com A1 |
| `pnpm run lint` e `format:check` | rc 0 e rc 0 | n/a | passou |
| `pnpm -r --if-present run pronto` (typecheck, lint, cobertura, build, size) | rc 0 | n/a | passou |
| Server sem regressão | 1909 passaram, 274 skipped (PostgreSQL ausente; o job `banco` da CI cobre), 99 arquivos | n/a | passou |
| Web sem regressão | 1487 passaram, 98 arquivos | n/a | passou |
| Pacotes e ferramentas | contratos 219, metricas 1278, mock 258, spec-check 14, homolog 73, pesquisa 33, docs-contratos 102: todos passaram | n/a | passou |

## Cenários e resultado real
Ambiente: worktree `/home/rodrigoisensee/MetricasDSPD-052h`, HEAD 41bb2efb (378c0568 mais o parecer de review, que só toca `docs/reviews/`). Execução: `pnpm run pronto` (pendeu em A1, interrompido); depois as etapas dele uma a uma, uma tarefa pesada por vez. Primeira rodada do `pronto -r` no sandbox: 25 falhas em `apontamento-entradas`, `ref-sync-businessmap-entrada`, `ref-sync-calendario-entrada`, `ref-sync-ac-entrada` (`ENOENT mkdir '/tmp/tsx-1000'`, A2); os 4 arquivos fora do sandbox: 31 passaram; `pronto -r` inteiro fora do sandbox: rc 0 (server 1909 passaram, web 1487). O E2E em si não faz parte do `pronto`. Sem bug aberto.
