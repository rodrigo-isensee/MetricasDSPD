### Adicionado

- T8 (sprint) com dado real do BusinessMap: a janela da sprint vai do primeiro início à primeira conclusão de execução do próprio card Sprint; sprint com mais de 30 dias úteis ou sem as duas datas fica fora da conta e é contada na nota do cartão; mostra o comprometido entregue, o carry-over e a entrada não planejada (filho criado depois do início da sprint, porque o BusinessMap não guarda a data do vínculo); abaixo de 20 sprints não publica estatística. O coletor passa a guardar a janela da Sprint (`dim_sprint`) e o vínculo filho-Sprint (`fato_sprint_filho`, só ids, append-only); versão de critério `criterio-2026-11-17-t8-dado-real` (pedido 105, E7.499, D-T8 "A").

### Alterado

- T8: a sprint entra no período pela conclusão (primeira conclusão dentro do período); a contagem de sprints fora da conta considera só as sprints do período, e a sprint sem primeira conclusão fica de fora até concluir (pedido 105, E7.536, decisão 2 = A).
