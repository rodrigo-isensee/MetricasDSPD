# Melhorias arquivadas (M-001 a M-013)

Anteriores ao formato do placar, arquivadas em 17/11/2026. Conteúdo sem alteração; o placar lê só `melhorias.md`.

| ID | Hipótese | Mudança | Métrica | Critério de reversão | Início | Revisão | Resultado |
|---|---|---|---|---|---|---|---|
| M-001 | Limites menores onde há um único agente (QA 2, Aguardando validação 2) evitam fila e PRs acumulados | QA de 3 para 2; Aguardando sua validação de sem limite para 2 | Tempo médio na coluna (valores individuais até 20 itens); nº de cartões parados em QA e Aguardando | não declarado | 2026-10-09 | Fim do pedido 001 | Em curso |
| M-002 | Dividir cartões grandes reduz idade do WIP e antecipa feedback do code review | K-004 em A1 (dados) e A2 (shell); fase B em 8 cartões por conjunto de métricas | Idade dos cartões em Em andamento; devoluções do Code review/QA | não declarado | 2026-10-09 | Fim do pedido 001 | Em curso |
| M-003 | Tirar reuniões e cartões de processo do WIP libera vagas reais e limpa as métricas de fluxo | Faixa "Processo" fora do WIP e das métricas | WIP real de entrega no resumo; ausência de cartão de processo nos cálculos | não declarado | 2026-10-09 | Fim do pedido 001 | Em curso |
| M-004 | Bloqueantes detectáveis por máquina deixam de chegar ao review | Portão `npm run pronto` + `npm run gate` antes do review | Bloqueantes "a máquina deveria ter pegado" por cartão | não declarado | 2026-10-09 20:46 | Fim do 001 | — |
| M-005 | Regras do briefing executáveis evitam erro de regra de negócio | Matriz `REGRAS_METRICA` + testes de propriedade | Bloqueantes de regra de negócio no review | não declarado | 2026-10-09 20:46 | Fim do 001 | — |
| M-006 | Lote pequeno reduz retrabalho e tempo de review | 1 cartão / 3–5 métricas / ~30 min | Bloqueantes por cartão; duração do review; rodadas | não declarado | 2026-10-09 20:46 | Fim do 001 | — |
| M-007 | Parecer imutável e controle de instâncias evitam perda de achados | Arquivo por rodada; checagem de atividade antes de relançar | Adendos; instâncias duplicadas | não declarado | 2026-10-09 20:46 | Fim do 001 | — |
| M-008/M-009 | Molde aprovado e checklist reduzem achados de UX | O4 de referência + checklist por cartão | Achados de UX altos/médios por painel | não declarado | 2026-10-09 20:46 | Fim do 001 | — |
| M-010 | QA em paralelo e por cartão evita gargalo | Aceitação antes; verificação de 15 min em paralelo ao review | Espera por QA; itens "verificar" | não declarado | 2026-10-09 20:46 | Fim do 001 | — |
| M-011 | Reunião curta por entrega mantém melhoria contínua | Ata por entrega | Atas por entrega | não declarado | 2026-10-09 20:46 | Fim do 001 | — |
| M-012 | Instâncias paralelas na fase B encurtam o calendário sem subir o retrabalho | 3 instâncias de react-frontend (exceção ao WIP 1 por agente, aprovada pelo usuário) | Tempo até as 3 entregas; devoluções por integração | não declarado | 2026-10-09 23:03 | Fim do 001 | Funcionou com ressalva (ver retro 001) |
| M-013 | Contar PRs, não cartões, no limite de Aguardando sua validação | Esclarecimento de política (proposto) | Cartões × limite no quadro | não declarado | 2026-10-10 | Próximo pedido | Proposto |
