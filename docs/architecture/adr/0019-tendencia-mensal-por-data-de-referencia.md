# 0019 - Tendência mensal calculada por data de referência na biblioteca compartilhada
- Status: aceita
- Data: 2026-10-13

## Contexto
A visão Resumo do Operacional (demanda `sustentacao-no-operacional`, spec 5.9.3) mostra a tendência dos últimos 6 meses fechados, um bloco por fonte. O usuário decidiu (Q1) que cada ponto mensal de percentil ou de aderência é "o valor que o painel mostraria no último dia do mês": a janela móvel de 12 semanas terminando nesse dia, com mínimo de 20 itens. As contagens (itens concluídos, volume de chamados) são do mês-calendário.

Hoje nenhuma métrica devolve uma série assim. O3 tem `serieP85` semanal por tipo, calculada com o contexto de hoje; S2 não tem série. A API já aceita `dataReferencia` por métrica, e o serviço monta o contexto com o corte dessa data.

Regras que limitam a solução: todo cálculo de tempo, percentil e taxa passa pela biblioteca (T2.5); BusinessMap e Acelerato nunca se misturam; percentis e taxas só dentro da classe estatística (`REGRAS_METRICA.segmentacao`); carga incremental (arquivados e excluídos permanecem).

## Decisão
1. Duas métricas novas de composição, uma por fonte: `TENDENCIA_FLUXO` (BusinessMap) e `TENDENCIA_SUST` (Acelerato). Nenhuma recebe o contexto da outra fonte. Não existe "tendência geral".
2. Cada ponto de distribuição é calculado chamando a função da métrica de origem (`calcularO3`, `calcularS2`) com um contexto criado para o corte `AAAA-MM-últimodia T23:59:59-03:00` e `periodo: 12s`. Não existe fórmula nova: o ponto é, por construção, o que o cartão mostraria naquela data. Um teste de propriedade garante a equivalência.
3. As contagens mensais reusam a seleção das métricas de origem (O4: data de conclusão; S3: a base do cartão S3, pendente de P4 no plano).
4. Os meses são os 6 últimos meses-calendário com último dia menor ou igual à data de referência da consulta. A interface manda a mesma `dataReferencia` para as duas consultas (a mais antiga entre as duas coletas, como já faz a `VISAO_GERAL`), para que os dois blocos tenham o mesmo eixo.
5. A resposta traz `criterios` (T2.6) para marcar mudança de critério no eixo, e cada ponto traz `n` e o status (`ok` ou `insuficiente`), nunca o valor abaixo de 20 itens.
6. O cache do serviço é o atual (chave por métrica, versão de carga, versão de critério e data de referência). Os pontos de meses passados só são recalculados quando muda a versão de carga.

## Alternativas consideradas
- **Percentil só com os itens do mês-calendário.** Simples e barato, mas troca a janela de 12 semanas por uma de 4 a 5 semanas. Rejeitada pelo usuário (Q1).
- **Séries com o contexto de hoje, recortando janelas passadas** (como faz `serieP85`). Mais barata (um contexto só), mas não é "como se estivesse naquela data": um card reaberto, descartado ou reclassificado depois do fim do mês muda o ponto passado. Fica como plano B só se a medição estourar o orçamento e com nova ADR, porque muda a semântica.
- **A interface fazer 6 chamadas por métrica com `dataReferencia`.** Não exige contrato novo, mas são 12 requisições a mais na página padrão do Operacional, e a contagem de "k de 5" e o recorte de meses ficariam espalhados pelo front. Rejeitada.
- **Um endpoint `RESUMO` único com as duas fontes.** Menos requisições, mas junta BusinessMap e Acelerato numa resposta e num cache só. Rejeitada pela regra inviolável.

## Consequências
- Mais fácil: o ponto mensal herda todas as regras da métrica de origem (mínimo de 20, classe estatística, arquivados, calendário de dias e horas úteis); uma mudança no cálculo de O3 ou S2 chega à tendência sem duplicação.
- Mais difícil: custo de cálculo de até 6 contextos por fonte na primeira consulta depois de uma carga. Precisa ser medido contra o orçamento A1 (< 300 ms p95) e C3/C4 da ADR 0003. Se estourar: pré-cálculo na carga (worker), não troca de semântica.
- `MetricaId` passa a ter dois valores a mais: `REGRAS_METRICA`, `SCHEMAS_RESULTADO`, `CALCULOS`, a varredura de fonte e a documentação de contratos precisam das linhas novas (o compilador força as três primeiras).
- O contrato expõe só agregados: nenhum id, título ou dado de pessoa entra nas séries.
