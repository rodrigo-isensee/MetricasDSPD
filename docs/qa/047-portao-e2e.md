---
tipo: qa
contrato: 1
pedido: 047-pendencias-decididas-2026-10-28
branch: docs/047-portao-e2e
commit: 359cec16e357eab59e6e2c28a52a5e454c3e5d20
parecer: aprovado
escopo: completo
bugs_criticos: 0
bugs_altos: 0
bugs_medios: 0
bugs_baixos: 0
data: 2026-10-28
---

# Parecer de QA: portão da homolog com a E2E completa em 2 partes (047, K-144 e K-172)

## Parecer
Aprovado, por verificação estática do diff `4137981..359cec1` em `.github/workflows/homolog.yml` (único arquivo de código alterado) e do `e2e/playwright.config.ts`. Não houve disparo de workflow nem E2E local, por instrução do pedido. Review (aprovado, achados só recomendados, de texto do parecer de devops) e segurança (aprovado, achados informativos) lidos no veredito e nos achados.

## Critério, verificação, resultado
| Critério | Verificação | Fronteira protegida | Resultado |
|---|---|---|---|
| E2.4: as 2 partes somam a E2E completa | A matriz `parte: [1, 2]` roda `test:chromium --shard=N/2`; o script `test:chromium` (e2e/package.json:10) é o mesmo de antes (`--project=chromium --project=chromium-semente-alt`), então nenhum projeto ou teste entra ou sai; o shard do Playwright particiona a lista total de testes em 2 faixas disjuntas e completas | máximo (união = suíte inteira) | passou |
| E2: o agregador `e2e` falha se uma parte não é `success` | `homolog.yml` agregador: `needs: [escopo, e2e-parte]`, `if: always()` e escopo `codigo`, `test "$RESULTADO" = "success"` com igualdade literal; `needs.e2e-parte.result` da matriz é `failure` se qualquer parte falhar e `cancelled` se cancelada; `fail-fast: false` deixa as duas partes terminarem | uma parte vermelha, cancelada ou pulada | passou |
| E: sem timeout maior | partes com `timeout-minutes: 30` (o do job único anterior); agregador 5 | limite de tempo | passou |
| E: sem retry | o diff não adiciona retry, `continue-on-error` nem repetição de job; o `retries: CI ? 1 : 0` do `playwright.config.ts:27` é anterior ao diff e não mudou | n/a | passou |
| E5: o `portao` continua consumindo `e2e` | `homolog.yml:262` `needs: [escopo, portao-docs, qualidade, banco, e2e, perf, migracao-smoke]`; o id e o nome `e2e-homolog` foram mantidos; `skipped` do agregador vira falha no `portao` (linha 283) | agregador pulado | passou |
| Passo Mermaid só na parte 1 | `if: matrix.parte == 1` | n/a | passou |

## Pendência
A prova real é a próxima promoção `develop` para `homolog`: conferir que as duas partes rodam, que somam o total de testes da E2E e que o `e2e-homolog` fica verde. Sem essa execução, o comportamento do `--shard` neste workflow é só verificado por leitura (o mesmo mecanismo do `ci.yml`, provado no parecer `docs/qa/044-e2e-em-partes.md`).

## Achados
- A1 (recomendado) e2e/playwright.config.ts:27 · `retries: CI ? 1 : 0` é anterior a este pedido e vale para as duas partes; a decisão K-150 proíbe retry só no teste do back-end, então informativo, sem correção agora. Destino: devops-engineer, se o dono quiser portão sem retry.
- A2 (recomendado) docs/devops/047-portao-e2e.md:7 · `commit:` do parecer de devops aponta 403e12b, não 359cec1 (já apontado pelo review como A2). Destino: devops-engineer.
