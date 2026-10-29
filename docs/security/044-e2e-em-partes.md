---
tipo: revisao-seguranca
contrato: 1
pedido: 044-e2e-da-ci-dentro-do-teto
branch: feature/044-e2e-em-partes
commit: 19549b9c6dc80704a40dadf22fc81860cb16308c
parecer: aprovado
revisor: forge:security-engineer
data: 2026-10-28
---
# Review de segurança: E2E da CI em 2 partes com agregador `e2e` (pedido 044, K-155)

Gatilho: CI/CD. Escopo: diff `9cc84d3..19549b9` em `.github/workflows/ci.yml` (linhas 190-253); só leitura estática. Veredito: aprovado, sem bloqueante.

## Conferências
- Permissões: `permissions: contents: read` fica no topo (ci.yml:14-15) e vale para os dois jobs; o agregador não pede escopo novo.
- Ações: checkout, pnpm/action-setup e upload-artifact seguem fixadas por sha com comentário de versão; nenhuma ação nova.
- Injeção: `needs.e2e-parte.result` entra por `env: RESULTADO` e o `run` usa `"$RESULTADO"` (ci.yml:247-252), forma correta; o valor é enum do GitHub. `matrix.parte` é literal `[1, 2]` do próprio arquivo, sem entrada externa.
- Artefatos: `e2e-relatorio-<parte>` só em falha, retenção de 3 dias, mesmos caminhos de antes (relatório e resultados do Playwright); nenhum segredo novo, nenhum `secrets.` no diff.
- Contorno do check: `test "$RESULTADO" = "success"` falha em failure, cancelled e skipped; `fail-fast: false` deixa as duas partes terminarem, e o resultado agregado é failure se uma falhar. O `if: always()` só liga o agregador mesmo com parte falha, sem forçar verde.
- Condição de execução: agregador e partes têm o mesmo filtro de evento (pull_request e workflow_dispatch); em `push` e `schedule` ambos ficam skipped, como o `e2e` único já ficava; nada piora.
- Fora do diff: o nome `e2e` do check obrigatório é mantido; o ruleset não foi tocado.

## Achados
- A1 (recomendado) .github/workflows/ci.yml:253 · O agregador não confere a quantidade de partes: se um dia a matriz perder um valor, o check continua verde com menos testes. A cobertura (726 testes) é do QA, não de segurança; sem caminho de ataque.

## Lacunas
- zizmor e actionlint não foram rodados neste parecer (revisão manual do diff); o CI do projeto mantém as varreduras.
