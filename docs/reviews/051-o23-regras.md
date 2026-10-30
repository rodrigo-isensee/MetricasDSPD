---
tipo: review
contrato: 1
pedido: 051-operacionais-separadas
branch: docs/051-o23-regras
commit: 38bbb9474f43b8cebf1bb770d01d656630937937
parecer: aprovado
revisor: tech-lead
data: 2026-10-29
---

# Code review: O23 sem lacunas (051, E5.3, cartão K-180)

Intervalo revisado: `739bdbf69574304c87ad9671715537746db987ac..38bbb9474f43b8cebf1bb770d01d656630937937`. Um arquivo, só documentação: `docs/contratos/metricas/O23.md`. Sem código nem teste: teto da M14 não se aplica (0 linhas contadas); isento de QA.

## Conferências
- Decisão U-11 (opção A, 2026-10-29): linha "Parado" diz que "parado há mais de uma semana" = mais de 5 dias úteis, por decisão do dono; a lacuna saiu. Escrita como decidida.
- Decisão parado e bloqueado (opção A, 2026-10-29): nova linha "Parado e bloqueado" diz que conta como parado, o bloqueio não altera `semMoverHaDiasUteis` e o motivo segue na lista. Escrita como decidida.
- A1 (048-ajustes-back) corrigido: linha "Quebra" não afirma mais soma igual; confere com `o2.ts:40-70` (com uma equipe, `etapas` só tem colunas de papel `trabalho` ou `homologacao`, então item fora delas não entra em `porEtapa`).
- A2 corrigido: a lacuna U-11 que contradizia "Status ok" foi removida.
- A3 corrigido: citados só o nome `BlocoParados` e o `data-testid` `o23-parados`, sem faixa de linhas.
- Nenhuma regra nova: o comportamento do bloqueio já constava na lacuna antiga; as demais linhas descrevem o código.

## Comandos
Nenhum rodado: diff só de texto `.md`, leitura.

## Achados
Nenhum.
