# Contratos por métrica: índice

Propósito: listar as métricas da API com domínio, rota, granularidade, mínimo de amostra e status das regras. Público: time (back-end, front-end, QA, gestão). Revisão: 2026-10-12.

<!-- gerado:inicio -->
Gerado por `pnpm run docs:gerar`. 51 métricas, uma página cada. Regras gerais, erros e cache: [http.md](../http.md).

| Métrica | Nome | Domínio | Rota | Granularidade | Mínimo | Status das regras |
|---|---|---|---|---|---|---|
| [`O1`](O1.md) | Trabalho em progresso e limite | businessmap | `/api/v1/metricas/O1` | story | 0 | pendente-usuario |
| [`O2`](O2.md) | Idade do trabalho em progresso | businessmap | `/api/v1/metricas/O2` | story | 20 | pendente-usuario |
| [`BLOQUEADOS`](BLOQUEADOS.md) | Bloqueados agora | businessmap | `/api/v1/metricas/BLOQUEADOS` | story | 0 | pendente-usuario |
| [`O3`](O3.md) | Tempo de ciclo | businessmap | `/api/v1/metricas/O3` | story | 20 | ok |
| [`O4`](O4.md) | Vazão semanal | businessmap | `/api/v1/metricas/O4` | story | 20 | ok |
| [`O7`](O7.md) | Entrada × saída por tipo | businessmap | `/api/v1/metricas/O7` | story | 0 | ok |
| [`O9`](O9.md) | Os três relógios do pedido | businessmap | `/api/v1/metricas/O9` | story | 20 | ok |
| [`O10`](O10.md) | Envelhecimento do backlog | businessmap | `/api/v1/metricas/O10` | story | 20 | pendente-usuario |
| [`O12`](O12.md) | Acordos e vencidos | businessmap | `/api/v1/metricas/O12` | story | 20 | ok |
| [`O15`](O15.md) | Onde os bugs são encontrados | businessmap | `/api/v1/metricas/O15` | story | 20 | ok |
| [`O18`](O18.md) | Entregas com e sem bug | businessmap | `/api/v1/metricas/O18` | story | 20 | ok |
| [`O5`](O5.md) | Eficiência de fluxo | businessmap | `/api/v1/metricas/O5` | story | 20 | ok |
| [`O6`](O6.md) | Previsibilidade | businessmap | `/api/v1/metricas/O6` | story | 20 | ok |
| [`O8`](O8.md) | Tamanho das demandas | businessmap | `/api/v1/metricas/O8` | story | 20 | ok |
| [`O11`](O11.md) | Composição do backlog | businessmap | `/api/v1/metricas/O11` | story | 0 | ok |
| [`O13`](O13.md) | Vazão de defeitos | businessmap | `/api/v1/metricas/O13` | story | 20 | ok |
| [`O14`](O14.md) | Origem da demanda | businessmap | `/api/v1/metricas/O14` | story | 0 | ok |
| [`O16`](O16.md) | Estoque e idade de bugs | businessmap | `/api/v1/metricas/O16` | story | 0 | ok |
| [`O17`](O17.md) | Defeitos por causa raiz e sistema | acelerato | `/api/v1/metricas/O17` | chamado | 0 | ok |
| [`T1`](T1.md) | Lead time ponta a ponta | businessmap | `/api/v1/metricas/T1` | story | 20 | ok |
| [`T2`](T2.md) | Aderência ao SLE | businessmap | `/api/v1/metricas/T2` | story | 20 | ok |
| [`T3`](T3.md) | Alocação da capacidade | businessmap | `/api/v1/metricas/T3` | story | 20 | ok |
| [`T4`](T4.md) | Demanda × capacidade | businessmap | `/api/v1/metricas/T4` | story | 20 | pendente-usuario |
| [`T5`](T5.md) | Demanda de falha | businessmap | `/api/v1/metricas/T5` | story | 20 | ok |
| [`T7`](T7.md) | Fluxo de frentes | businessmap | `/api/v1/metricas/T7` | frente | 20 | pendente-usuario |
| [`T9`](T9.md) | Avanço real e escopo | businessmap | `/api/v1/metricas/T9` | frente | 0 | pendente-usuario |
| [`T6`](T6.md) | Previsão probabilística | businessmap | `/api/v1/metricas/T6` | story | 20 | ok |
| [`T8`](T8.md) | Sprint | businessmap | `/api/v1/metricas/T8` | story | 20 | ok |
| [`E1`](E1.md) | Lead time de projetos | businessmap | `/api/v1/metricas/E1` | projeto | 20 | ok |
| [`E2`](E2.md) | Capacidade por objetivo estratégico | businessmap | `/api/v1/metricas/E2` | story | 20 | ok |
| [`E3`](E3.md) | Entrega × resultado | businessmap | `/api/v1/metricas/E3` | projeto | 0 | ok |
| [`E4`](E4.md) | Iniciadas × concluídas | businessmap | `/api/v1/metricas/E4` | projeto | 0 | ok |
| [`E5`](E5.md) | Previsão de término | businessmap | `/api/v1/metricas/E5` | frente | 20 | ok |
| [`S1`](S1.md) | Primeiro atendimento e restauração | acelerato | `/api/v1/metricas/S1` | chamado | 20 | ok |
| [`S2`](S2.md) | Aderência ao SLA | acelerato | `/api/v1/metricas/S2` | chamado | 20 | ok |
| [`S3`](S3.md) | Volume mensal por prioridade | acelerato | `/api/v1/metricas/S3` | chamado | 0 | ok |
| [`S4`](S4.md) | Onde o chamado foi resolvido | acelerato | `/api/v1/metricas/S4` | chamado | 20 | ok |
| [`S5`](S5.md) | Motivos da escalação | acelerato | `/api/v1/metricas/S5` | chamado | 20 | ok |
| [`S6`](S6.md) | Motivos de encerramento | acelerato | `/api/v1/metricas/S6` | chamado | 20 | ok |
| [`S7`](S7.md) | Reclassificação | acelerato | `/api/v1/metricas/S7` | chamado | 20 | ok |
| [`S8`](S8.md) | Taxa de reabertura | acelerato | `/api/v1/metricas/S8` | chamado | 20 | ok |
| [`S9`](S9.md) | Tempo em pendência | acelerato | `/api/v1/metricas/S9` | chamado | 20 | ok |
| [`S10`](S10.md) | Fila de atribuição | acelerato | `/api/v1/metricas/S10` | chamado | 20 | ok |
| [`S11`](S11.md) | Avaliação de Problema | acelerato | `/api/v1/metricas/S11` | chamado | 20 | ok |
| [`S12`](S12.md) | Volume por sistema | acelerato | `/api/v1/metricas/S12` | chamado | 20 | ok |
| [`PV1`](PV1.md) | Percepção de valor do serviço | pesquisa | `/api/v1/metricas/PV1` | resposta | 20 | ok |
| [`EI_FL1`](EI_FL1.md) | Espera invisível · Operacional | businessmap | `/api/v1/metricas/EI_FL1` | story | 20 | ok |
| [`EI_FL2`](EI_FL2.md) | Espera invisível · Tático | businessmap | `/api/v1/metricas/EI_FL2` | frente | 20 | ok |
| [`EI_FL3`](EI_FL3.md) | Espera invisível · Estratégico | businessmap | `/api/v1/metricas/EI_FL3` | projeto | 20 | ok |
| [`EI_SUST`](EI_SUST.md) | Espera invisível · Sustentação | acelerato | `/api/v1/metricas/EI_SUST` | chamado | 20 | ok |
| [`VISAO_GERAL`](VISAO_GERAL.md) | - | composicao | `/api/v1/metricas/VISAO_GERAL` | story, frente, projeto, chamado | 0 | ok |
<!-- gerado:fim -->
