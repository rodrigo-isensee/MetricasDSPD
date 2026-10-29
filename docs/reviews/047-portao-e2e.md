---
tipo: review
contrato: 1
pedido: 047-pendencias-decididas-2026-10-28
branch: docs/047-portao-e2e
commit: 359cec16e357eab59e6e2c28a52a5e454c3e5d20
parecer: aprovado
revisor: forge:tech-lead
data: 2026-10-28
---
# Code review: 047-portao-e2e (K-144, K-172)

## Parecer
Aprovado. O `homolog.yml` divide a E2E do portão em 2 partes com o mesmo mecanismo do `ci.yml:190-252` (#154), sem timeout maior e sem retry. O parecer de devops tem uma incoerência de texto (A1, recomendada), que não devolve a entrega.

Escopo lido: o diff `4137981..359cec1` (2 arquivos, 26+/4- em `homolog.yml`; teto M14 respeitado) e `homolog.yml` (job `portao`). Sem regra "ferramenta" configurada para esses arquivos; `actionlint` não rodou (lacuna que o devops já declarou, A3 do parecer dele).

## Conferido no `homolog.yml`
- Matriz `e2e-parte`: `parte: [1, 2]`, `fail-fast: false`, `--shard=${{ matrix.parte }}/2`, Mermaid só na parte 1, `timeout-minutes: 30` por parte (igual ao que havia, agora por metade da suíte), artefato `e2e-relatorio-N` sem colisão. Sem `retries` nem aumento de timeout.
- Agregador: job id `e2e`, nome `e2e-homolog`, `needs: [escopo, e2e-parte]`, `if: always()` no escopo `codigo`, falha quando `needs.e2e-parte.result` não é `success` (o resultado agregado da matriz é `failure`, `cancelled` ou `skipped` se qualquer parte não passar). O `portao` segue lendo `needs.e2e.result` e exige `success`; no escopo `docs` o agregador fica `skipped` como antes, coberto pelo ramo `docs` do `portao`.
- Padrão idêntico ao do `ci.yml` (`RESULTADO` em `env`, sem interpolação direta em `run`).

## Revalidação
O E2.8 (4463338) mudou só `docs/devops/047-portao-e2e.md`, sem código; o veredito segue aprovado e o `commit:` deste parecer continua em 359cec1.

## Achados
- A1 (recomendado) docs/devops/047-portao-e2e.md:14 · Resumo e evidências do parecer de devops descreviam o workflow antigo (job único). Resolvido no E2.8 (4463338).
- A2 (recomendado) docs/devops/047-portao-e2e.md:7 · `commit:` do parecer de devops desalinhado. Resolvido no E2.8 (4463338), agora 359cec1.
