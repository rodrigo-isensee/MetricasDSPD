# Pedido 074: auditoria do quadro (cartões parados com entrega já feita)

- **Modo:** analisar
- **Objetivo:** dizer, com prova, o estado real de cada cartão do `KANBAN.md` fora da coluna Pronto (PR mesclado, pedido encerrado, decisão pendente ou ainda aberto), para o Jarvis acertar o quadro
- **Clareza:** 0 confirmado; 2 técnico; 0 suposição; 0 perguntas (manutenção do quadro, papel do Jarvis e políticas do agile-coach)
- **Depende de:** nenhum

## Escopo
- E1. Tabela por cartão fora de Pronto: estado real, prova (PR, commit, linha do pedido) e coluna proposta · `técnico`
- E2. Cartões duplicados ou sem dono e propostas de fechamento, sem decidir regra de negócio · `técnico`

## Etapas
- E1.1 (agile-coach): levantamento só leitura, sem editar o KANBAN.md, gravado em docs/kanban/auditoria-2026-11-06.md, sem commit.

## Fora do escopo
- Editar o KANBAN.md nesta etapa (é do Jarvis, depois do levantamento) · `técnico`
- Decidir cartão que depende do dono · `técnico`

## Suposições

## Perguntas na fila

## Histórico
- 2026-11-06 11:00: pedido aberto (Jarvis): o quadro tem cerca de 90 cartões fora de Pronto, muitos com entrega já mesclada (ex.: K-219 da release 068, K-208 a K-210 do 069). DECISÃO TÉCNICA (Jarvis): com o 073 esperando a CI do PR 242 e a decisão do dono no E9, o agile-coach faz o levantamento E1.1 só leitura; o Jarvis aplica depois. Sem recibo ao dono: é manutenção do quadro (papel do Jarvis), avisada no resumo.
- 2026-11-06 11:20: E1.1 entregue pelo agile-coach: docs/kanban/auditoria-2026-11-06.md (93 cartões fora de Pronto, prova por PR ou linha do pedido); 22 propostos a Pronto (K-197 depende de confirmação), 16 esperando o dono, pares sobrepostos K-200/K-216, K-191/K-192, K-125/K-223 e o lote 048d. DECISÃO TÉCNICA (Jarvis): aplicados os 21 com prova; K-197 fica; os de espera do dono ficam na coluna atual até o Jarvis consolidar a lista ao dono num resumo; a auditoria vai num commit da branch do Jarvis. MELHORIA (agile-coach): Entrada mistura entregue, backlog e espera do dono; Pronto para fazer com 12 cartões contra o limite 5.
