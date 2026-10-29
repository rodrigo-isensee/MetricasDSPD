# 0022 - Coleta incremental como fonte de verdade do BusinessMap, webhook condicionado e staging negado por padrão

Estado: proposta. Data: 2026-10-29.
Propósito: fixar como os dados reais do BusinessMap entram na base (polling primeiro, webhook depois) e o que o coletor pode gravar no staging enquanto não há lista fechada. Público: node-backend, security-engineer, tech-lead, QA. Revisão: 2026-11-29.

## Contexto
- Pedido 052: a integração real passa à frente do 048 (decisão do dono, 2026-10-29). O dono pediu a recomendação do time para o item 8 do roteiro §7 de `docs/integracao/businessmap-api-configuracao.md` ("facarecomendacao").
- O briefing põe a T2.3 (webhook) dependente da T2.2 (coleta incremental) e mede a T2.3 contra a API: "divergência entre webhook e API abaixo de 1% em uma semana de operação paralela".
- O receptor `POST /webhooks/businessmap` existe (`server/src/modulos/businessmap/webhook.ts`), mas o formato do payload é suposto: o artigo de webhooks da Kanbanize dá 403 (conferido de novo em 2026-10-29). Não há consumidor de `bm.webhook.recebido` no worker.
- A API escuta em 127.0.0.1 (ADR 0014); expor o webhook exige URL pública com TLS, que não existe hoje.
- O modelo de ameaças do 052 (`docs/security/052-integracao-businessmap-ameacas.md`, S-2) recomenda só polling na primeira entrega.
- A ADR 0020 fixou listas fechadas para card, revisão e webhook, mas não para `stg_bloqueio`, `stg_vinculo`, `stg_custom_field` e `stg_coluna`. O achado B-K3 de `docs/security/k084-coletor-allow-list.md` atribuiu ao arquiteto a parte (a): declarar que essas tabelas são negadas por padrão. Isso não estava registrado em nenhuma ADR.

## Decisão
1. **Polling é a fonte de verdade.** A coleta incremental diária (com varredura semanal de presença) é o caminho canônico de cards, revisões e transições. A revisão (`/cards/{id}/revisions`) define o instante canônico da transição (`data-model.md` §3.2).
2. **Webhook é acelerador, condicionado.** O consumidor do webhook e a exposição do receptor só entram depois de três fatos: URL pública com TLS disponível; formato do payload confirmado (artigo lido ou evento real capturado); T2.2 pronta (sete execuções consecutivas sem falha). Até lá, o receptor existente não é exposto fora de 127.0.0.1. Recomendação do time ao dono (opção C do plano 052, §3); vira vigente com a confirmação dele.
3. **Staging negado por padrão.** O coletor só grava em uma tabela `stg_` que tenha lista fechada de campos registrada em ADR (hoje: `stg_card`, `stg_revision`, `stg_webhook_evento`, pela ADR 0020). `stg_bloqueio`, `stg_vinculo`, `stg_custom_field` e `stg_coluna` ficam sem gravação até a revisão 3 da ADR 0020, escrita a partir da forma real do spike F1 e lida pelo security-engineer. Um teste estrutural garante que todo INSERT em `stg_` passa por uma função `registro*` da allow-list.
4. **Carga inicial só manual.** A primeira carga (sem marca d'água) roda por comando, com o dono presente, nunca pelo agendador; a tarefa agendada só é registrada no worker depois da WS1 confirmada.

## Alternativas
- **Só polling para sempre (A):** menor superfície, mas não cumpre a T2.3, que é critério de pronto do briefing.
- **Polling e webhook na primeira entrega (B):** cumpre T2.2 e T2.3 juntas, mas exige topologia pública e formato de payload que ainda não existem, e a semana de operação paralela não tem base estável para comparar.
- **Polling a cada hora no lugar do webhook (D):** reduz latência sem exposição, mas não cumpre a T2.3 e consome a cota (30/min, 600/h) usada pela carga inicial e pela varredura. Pode complementar a decisão se o dono pedir latência menor.
- **Gravar os staging restantes com a forma suposta:** rejeitada; repetiria o risco que a ADR 0020 fechou (campo de pessoa não previsto chegando ao banco).

## Consequências
- Melhora: T2.2 entregue sem depender de infraestrutura pública; nenhum risco de pessoa novo antes da forma real ser vista; o código do receptor já feito é reaproveitado depois.
- Piora: latência de até 24 h nos painéis até o webhook; bloqueios e vínculos reais só aparecem depois da revisão 3 da ADR 0020 (afeta as métricas de bloqueio no intervalo, que seguem do mock até lá).
- A manter: o teste estrutural dos INSERT em `stg_`; a lista de condições do item 2 como checklist da fatia F7.

## Por que o existente não basta
O mecanismo novo é o teste estrutural dos INSERT em `stg_`. O existente: a allow-list de `allow-list.ts` cobre card, revisão e webhook, e seus testes conferem o que essas funções devolvem; nada impede um INSERT direto em `stg_bloqueio` ou `stg_vinculo` sem passar por lista. A evidência é a própria revisão do K-084 (`docs/security/k084-coletor-allow-list.md`, B-K3), que achou as quatro tabelas sem lista e sem barreira. O resto da decisão é ordem de entrega, não mecanismo.

## Critério de reversão
Se a semana de operação paralela da T2.3 medir divergência entre webhook e API acima de 1% por atraso ou perda da coleta incremental (e não do webhook), a fonte canônica é revista.

## Leituras
| Data | Medida | Veredito (manter, ajustar, reverter) |
|---|---|---|
| 2026-11-29 | divergência webhook × API na semana paralela (se F7 liberada); execuções consecutivas sem falha da coleta | pendente |
