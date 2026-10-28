---
tipo: revisao-devops
contrato: 1
pedido: 044-e2e-da-ci-dentro-do-teto
branch: feature/044-e2e-em-partes
commit: b0c0f69d5ded8ee349317b25598eb8c2a5de1a5d
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-10-28
---
# Review de devops: 044-e2e-em-partes (K-155)

## Parecer
Aprovado. O job `e2e` (28 min com 588 de 726 testes, estourando o teto de 30 min) virou `e2e-parte`, matriz `parte: [1, 2]` com `--shard=N/2` do Playwright, `timeout-minutes: 30` em cada parte (teto e retries inalterados), `fail-fast: false`. Um job `e2e` (mesmo `name`, o check obrigatório do ruleset) depende das duas partes e só passa se `needs.e2e-parte.result` for `success`; com `if: always()` e o mesmo gatilho de antes, falha, cancelamento ou skip das partes o deixam vermelho, e fora de pull_request e workflow_dispatch ele fica pulado como hoje. Mermaid só na parte 1. Artefato de falha `e2e-relatorio-1` e `e2e-relatorio-2`. Nenhuma ação nova; SHAs mantidos; `permissions` do workflow continua `contents: read`; o agregador não faz checkout nem usa segredo, e o resultado entra por variável de ambiente.

## Medição (run de workflow_dispatch 40674397824, sha b0c0f69, success)
- e2e-parte (1/2): 13 min 10 s
- e2e-parte (2/2): 19 min 13 s (a divisão por shard não é perfeitamente equilibrada; a maior parte fica 36% abaixo do teto)
- e2e (agregador): 3 s
Os 726 testes somados e a conferência por parte são do parecer de QA (E1.4).

## Achados
- recomendado: o ruleset exige `e2e`; as partes aparecem como checks novos `e2e-parte (1/2)` e `e2e-parte (2/2)`, que não devem ser exigidos (o agregador cobre). Nada a mudar no ruleset (é do dono).
- recomendado: a parte 2 leva 6 min a mais; se o volume crescer, subir para 3 partes é mudança de matriz, sem mexer no agregador (`--shard=N/3`).
- Custo: o tempo total de runner sobe pouco (instalação duplicada, uma parte a mais); dentro da franquia (repositório público ou privado a conferir no checkpoint de release), custo de dinheiro zero (`R-CUSTO`). Rollback: reverter o commit.
- Lacuna: `actionlint` ausente do PATH, não executado; o YAML foi validado pelo próprio run do GitHub. Segurança do workflow: parecer do `security-engineer` (E1.3) pendente.
