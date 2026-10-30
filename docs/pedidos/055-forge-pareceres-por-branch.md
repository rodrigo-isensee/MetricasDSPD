# Pedido 055: Forge escolhe parecer e conferência pela branch

- **Modo:** implementar
- **Objetivo:** corrigir na fábrica o defeito que trava o PR da 048d (DECISÃO DO DONO "A", 2026-10-30, pedido 048) e o defeito irmão que faz toda conferência de entrega desta sessão reprovar pelo Desde.
- **Clareza:** 2 confirmados (recibo aceito); 0 suposições; 0 perguntas
- **Depende de:** nenhum

## Escopo
- E1. `forge-check` (etapa pr, `cmd_pr`) escolhe o parecer de review e de QA do pedido pela branch do PR, não só por (data, caminho); com dois pareceres do mesmo pedido e da mesma data, vale o da branch · `confirmado` (dono, "A", 2026-10-30)
- E2. `forge-check brief mensagem --entrega` só usa como `Desde:` uma linha `conferida` cujo sha seja ancestral da branch da entrega; sem ela, omite o `Desde:` · `técnico` (6 conferências de entrega do 052 reprovadas só pelo Desde em 2026-10-30, mais 2 no 048 e no 053; não afrouxa controle)

## Etapas
- E1.1 (tech-lead): lote por arquivo (os dois itens mexem em `bin/forge-check`): no clone de contribuição `~/.forge-contrib/MetricasDSPD` (skill `contribuir-com-o-forge`), branch `melhoria/MetricasDSPD-pareceres-por-branch` a partir da `develop` do Forge, um commit por item (E1 e E2), cada um com o seu teste, fragmento de changelog, testes do Forge, `scripts/validar-plugin.sh` e `scripts/verificar-contribuicao.sh` verdes, e um PR para a `develop` do Forge citando E1 e E2; só propõe (R-CONTRIB).
- E3.1 (dono): mesclar no Forge até a `main`, publicar a versão e atualizar o plugin no projeto (`forge atualizar`).

## Fora do escopo
- Abrir o PR da 048d antes da versão corrigida chegar ao projeto · `confirmado` (dono, "A": sem exceção pontual)
- Editar o cache do plugin ou mexer em PR alheio no Forge · `técnico` (R-COPIA, R-CONTRIB)

DECISÃO DO DONO (2026-10-30): "A" (pedido 048, PR da 048d): corrigir na fábrica; o PR da 048d espera a correção chegar ao projeto pela main do Forge e a atualização do plugin; sem exceção pontual.
DECISÃO DO DONO (2026-10-30): "sim" (recibo do 055 aceito).

## Suposições
- nenhuma

## Histórico
- 2026-10-30 12:16: pedido aberto pela DECISÃO DO DONO "A" do pedido 048 (PR da 048d); recibo enviado ao dono.
- 2026-10-30 13:01: DECISÃO DO DONO: recibo do 055 aceito ("sim").
- 2026-10-30 13:01: DECISÃO TÉCNICA (Jarvis): E1 e E2 mexem no mesmo arquivo (`bin/forge-check`); pela regra de lote por arquivo da fábrica, viram um lote: uma branch, um commit por item com o seu teste, um PR que cita os dois (R-CONTRIB admite essa exceção à uma melhoria por PR). O recibo dizia dois PRs; o resultado para o dono não muda e o item com defeito sai do lote por revert do seu commit. Cartão K-187. A E2.1 foi absorvida pela E1.1.
- 2026-10-30 13:03: contagem do E2 atualizada pelo Histórico do 052 (E1.15, E1.16, E1.17, volta 1 da E1.15, revalidação da E1.16 e E1.18: 6 conferências reprovadas só pelo Desde hoje); brief tech-lead-1 reprovado na rodada 1 pela contagem antiga e corrigido.
- 2026-10-30 13:05: brief tech-lead-1 (E1.1) aprovado pelo conferente na rodada 2; delegado. DECISÃO TÉCNICA (Jarvis), sobre o aviso de etapa do conferente: o PR vai para a develop do Forge como proposta (R-CONTRIB); review, QA e pareceres desse PR são do lado do Forge, cujo checklist de merge (R-CONTRIB) os exige antes de mesclar; este projeto não mescla nada no Forge.
- 2026-10-30 13:27: DECISÃO DO DONO: "diminua o uso do cpu estou com dificuldades de usar o teams". Ação do Jarvis: suíte de testes do Forge (pedido 055) passada para prioridade mínima (nice 19); daqui em diante, um agente pesado (testes) por vez, em prioridade baixa, e nenhum agente novo de teste enquanto houver outro rodando.
- 2026-10-30 13:29: DECISÃO DO DONO: "nada do forge deve rodar aqui". Ação do Jarvis: suíte do Forge da E1.1 interrompida (processo encerrado); o trabalho do 055 no clone ~/.forge-contrib/MetricasDSPD fica parado neste computador até o dono dizer onde roda. K-187 em espera.
- 2026-10-30 13:29: DECISÃO DO DONO (esclarece a anterior): "apenas do projeto de metricas": neste computador só roda trabalho do MetricasDSPD; o trabalho no repositório do Forge (este pedido) não roda aqui. Estado deixado: clone ~/.forge-contrib/MetricasDSPD com 2 commits locais (59a2b67 E1, 3ac1ab5 E2) na melhoria/MetricasDSPD-pareceres-por-branch, sem push e sem PR. PERGUNTA na fila: onde o 055 continua (outro computador, sessão do Forge) ou se fica parado.
- 2026-10-30 13:30: DECISÃO DO DONO: "anote como melhoria para o forge e eu levo para o jarvis da propria forge". Melhorias registradas em docs/kanban/melhorias.md (6 itens de 2026-10-30, incluindo E1 e E2 deste pedido com os commits locais). O pedido 055 sai das mãos do time do projeto; K-187 fica com o dono.
