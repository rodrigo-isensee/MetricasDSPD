---
tipo: review
contrato: 1
pedido: 105-melhorias-15-11
branch: ci/105-timeout-testes
commit: 504266a0699ee28e6ef66180c33e892ba99143bd
parecer: aprovado
revisor: tech-lead
data: 2026-11-17
---

# Code review: aumento do tempo limite do CI (E7.534)

## Escopo lido
Diff `808a163c..504266a0`: `.github/workflows/ci.yml` (2 linhas) e `changelog.d/ci-105-timeout-testes.md` (novo).

- Confere com a decisão do dono 1 = A: `timeout-minutes` do job `testes` de 15 para 25 e do `e2e-parte` de 30 para 45. Nada mais muda no workflow: nenhum passo, filtro, `if` ou matriz alterado, nenhum teste pulado.
- Sem guarda nova ou mudada (só valores numéricos de limite); não há mutante a declarar.
- Changelog no formato `### Alterado`, cita o pedido e a etapa de implementação (E7.533).
- Tamanho: 2 linhas de código, dentro do teto M14.
- Risco: falha lenta de verdade passa a demorar até 10/15 min a mais para estourar; aceitável e decidido pelo dono. Critério de reversão implícito: se o tempo real dos jobs cair, voltar aos limites antigos.
- Ferramentas e CI: sem PR para a branch, a suíte fica para o CI do PR; não afirmo CI verde neste head e o brief não traz PQ do autor. O `docs/engineering/praticas.md` não traz regra "decidida por" que alcance estes arquivos.
- Pipeline: o parecer de pipeline é do `devops-engineer`; não o refaço.

## Achados
Nenhum.
