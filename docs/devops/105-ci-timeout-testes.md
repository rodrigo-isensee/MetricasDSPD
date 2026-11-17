---
tipo: revisao-devops
contrato: 1
pedido: 105-ci-timeout-testes
branch: ci/105-timeout-testes
commit: 504266a0699ee28e6ef66180c33e892ba99143bd
parecer: aprovado
revisor: forge:devops-engineer
data: 2026-11-17
---
# Review de devops: 105-ci-timeout-testes (E7.533, E7.535)

## Parecer
Aprovado. O diff sobre a base 808a163c tem 2 arquivos: `.github/workflows/ci.yml` (`timeout-minutes` do job `testes` de 15 para 25, linha 42, e do `e2e-parte` de 30 para 45, linha 200) e `changelog.d/ci-105-timeout-testes.md` (seção Alterado, cita o pedido e diz que nenhum teste foi pulado). Decisão do dono 1 = A. Nenhuma outra linha do workflow mudou: sem `continue-on-error`, sem `[skip ci]`, sem teste pulado, sem check desligado (`R-VERIFY`); ações continuam fixadas por SHA; `permissions` e `concurrency` intactos; nenhum job novo, então o agregador `e2e` e os checks exigidos não mudam. Só sobe o teto de tempo, não troca runner nem serviço: custo de dinheiro zero (`R-CUSTO`); o teto só é consumido em execução que já estaria travada ou lenta.

## Achados
- recomendado: o teto novo esconde menos, mas não resolve a causa; se a duração real passar de ~20 min no `testes` ou ~35 min no `e2e-parte`, abrir cartão para particionar (3 partes, `--shard=N/3`) em vez de subir de novo. Medir pelo `gh run list` no checkpoint de release.
- recomendado: com o teto, o pior caso de minutos por PR sobe (25 + 2x45 = 115 min contra 75); confirmar no checkpoint que continua dentro da franquia gratuita.
- Rollback: reverter o commit (2 linhas).
- Mudança em `.github/workflows/ci.yml`, arquivo protegido: pode exigir o rótulo `afrouxa-regra` do dono no PR (catraca); o `tech-lead` avalia. O envio de workflow é do dono (escopo `workflow`).
- Lacuna: `actionlint` ausente do PATH, não executado; a mudança é de dois inteiros em chaves já existentes.
- Sem PR para a branch: a suíte inteira fica para o CI do PR; este parecer não afirma CI verde.
