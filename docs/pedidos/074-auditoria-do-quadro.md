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
- 2026-11-06 10:18: pedido aberto (Jarvis): o quadro tem cerca de 90 cartões fora de Pronto, muitos com entrega já mesclada (ex.: K-219 da release 068, K-208 a K-210 do 069). DECISÃO TÉCNICA (Jarvis): com o 073 esperando a CI do PR 242 e a decisão do dono no E9, o agile-coach faz o levantamento E1.1 só leitura; o Jarvis aplica depois. Sem recibo ao dono: é manutenção do quadro (papel do Jarvis), avisada no resumo.
- 2026-11-06 10:24: E1.1 entregue pelo agile-coach: docs/kanban/auditoria-2026-11-06.md (93 cartões fora de Pronto, prova por PR ou linha do pedido); 22 propostos a Pronto (K-197 depende de confirmação), 16 esperando o dono, pares sobrepostos K-200/K-216, K-191/K-192, K-125/K-223 e o lote 048d. DECISÃO TÉCNICA (Jarvis): aplicados os 21 com prova; K-197 fica; os de espera do dono ficam na coluna atual até o Jarvis consolidar a lista ao dono num resumo; a auditoria vai num commit da branch do Jarvis. MELHORIA (agile-coach): Entrada mistura entregue, backlog e espera do dono; Pronto para fazer com 12 cartões contra o limite 5.
- 2026-11-06 10:29: DECISÃO DO DONO (literal): "ainda nao estamos na vm entao podemos fazer tudo por aqui por enquanto." e "vou migrar para vmsemana que vem, entao faca tudo por aqui." Leitura do Jarvis: os passos de publicação que estavam marcados para a VM (K-200, K-216: migração 0034, coleta do apontamento, conferência Q20; e o ref:sync-calendario) passam a ser feitos no ambiente local desta máquina até a migração para a VM na semana que vem. Ordem ampla: o que mexe na base real local ou no .env vai ao dono num recibo antes (R-DECISAO, falar-com-o-dono).
- 2026-11-06 10:29: PERGUNTA (recibo ao dono): vou fazer no ambiente local, com o devops-engineer: migração pendente (0034 em diante) na base local, ref:sync-calendario na base local, uma coleta do apontamento e a Q20 de conferência; e abrir o pedido 075 dos bloqueios reais (K-204), começando pelo discovery. Não vou: editar o .env (senha do dspd_api_apontamento e PG_APONTAMENTO_URL são do dono), agendar coleta diária na máquina, nem nada na VM. É isso?
- 2026-11-06 10:32: DECISÃO DO DONO: "isso" (recibo das 10:29 confirmado): no ambiente local, migrações pendentes, ref:sync-calendario, uma coleta do apontamento e a Q20, com o devops-engineer (pedido 076); e o pedido 075 dos bloqueios reais (K-204) pelo discovery; sem .env, sem coleta agendada, nada na VM. [Leitura: "sem .env" é o "Não vou: editar o .env" do recibo de 10:29; carregar o .env no comando é a P-076-2 "A" do pedido 076, 11:11]
- 2026-11-06 11:10: Dono pediu "me traga as decisoes": o Jarvis entregou de uma vez a lista das decisões abertas (P-076-2; P-075-1 a P-075-8; P-E10-1 a P-E10-4; merge do PR 243; checks obrigatórios na develop; K-211), cada uma com opções e recomendação, para resposta por código.
