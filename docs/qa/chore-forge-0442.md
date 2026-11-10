---
tipo: qa
contrato: 1
pedido: chore-forge-0442
branch: chore/forge-0442
commit: 232bb85
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 1
bugs_baixos: 0
aceite_usuario: sim
data: 2026-11-09
---
# QA: upgrade do Forge para 0.44.2

Veredito: aprovado. O diff contra `origin/develop` é só `.forge/versao` (0.42.0 para 0.44.2): sem código, interface, `CA-n` nem teste novo, então vermelho antes do verde, mutação, E2E e acessibilidade não se aplicam. A falha de código observada é pré-existente e vira bug fora deste pedido.

## Achados

- A1 (recomendado) docs/qa/bugs/FORGE0442-001-falhas-preexistentes-do-pronto.md:1 · falhas pré-existentes (trava do teste 4 de suite-unica.test.sh, heap do eslint, cobertura do server 99,97% em spike.ts:71) não causadas pelo upgrade; tratar em pedido próprio.

## Critério → teste → resultado
| Critério | Teste | Fronteira protegida | Resultado |
|---|---|---|---|
| Diff só muda `.forge/versao` | `git diff origin/develop...HEAD --stat`: 1 arquivo, 1 inserção, 1 remoção | n/a | passou |
| Server sem regressão | pronto3.log: 1909 passaram, 274 skipped (PostgreSQL ausente; o job `banco` da CI cobre) | n/a | passou |
| Web sem regressão | pronto-web.log: 1487 passaram | n/a | passou |
| e2e typecheck e demais etapas do pronto | pronto3.log: ok | n/a | passou |
| Cobertura do server 100% | pronto3.log: 99,97% (spike.ts:71) | n/a | falhou, pré-existente (bug FORGE0442-001) |

## Cenários e resultado real
Suíte não reexecutada por ordem do pedido; evidência lida nos logs em /tmp/claude-0/-workspaces/b37d1e9f-be92-464b-b166-7229b98dd0fa/scratchpad/ (pronto3.log, pronto-web.log). No pronto3.log o teste de trava aparece `ok` até "suite-unica.test: tudo certo"; o relato de trava do teste 4 vem de outra execução. Aceite do usuário necessário por haver bug médio aberto.
