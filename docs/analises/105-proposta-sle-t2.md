# Proposta de prazo de referência (SLE) por prioridade nativa — T2

Pedido 105-melhorias-15-11, etapa E7.484. Decisão D-T2 do dono (16/11): o time propõe o prazo de cada prioridade nativa do BusinessMap pelo P85 das últimas 12 semanas; **o dono aprova**. Nada aqui está publicado: a configuração do SLE (`ref_sle`) continua vazia até a aprovação.

## Proposta

Tempo em dias úteis (8 h por dia útil), tempo de ciclo da história pela biblioteca compartilhada (T2.5), a mesma grandeza que o T2 compara com o prazo.

| Prioridade | n (entregas) | P50 (dias úteis) | P85 (dias úteis) | P95 (dias úteis) | Prazo proposto (P85) |
|---|---|---|---|---|---|
| Crítica | 715 | 1,2 | 12,5 | 22,1 | 12,5 dias úteis (arredondar a 13, a decidir) |
| Alta | 237 | 1,0 | 5,8 | 12,9 | 5,8 dias úteis (arredondar a 6, a decidir) |
| Média | 1287 | 0,5 | 11,2 | 33,2 | 11,2 dias úteis (arredondar a 11, a decidir) |
| Baixa | 22 | 0,0 | 2,1 | 15,7 | amostra no limite (n = 22, mínimo 20); ver observação 3 |

Sem prioridade no BusinessMap (campo nulo): 424 entregas na janela, fora da tabela e contadas à parte, nunca somadas a um nível (nunca Média por omissão).

Valores sem arredondamento: P85 Crítica 12,537; Alta 5,840; Média 11,217; Baixa 2,058.

## Corte

- Fonte: base local PostgreSQL (`metricasdspd-postgres-1`, banco `metricas`, schema `dspd_bm`), só leitura. Última coleta do BusinessMap com sucesso: coleta 36, finalizada em 16/11/2026 21:05 UTC; data de corte 2026-11-16.
- Janela móvel de 12 semanas: 2026-08-25 a 2026-11-16 (84 dias corridos), pela data de entrega do card.
- População (a mesma do T2 no painel): granularidade história (story), tipo que é demanda, não excluído, não subtarefa, não descartado, com entrega e com tempo de ciclo fechado; arquivados permanecem; sem filtro de equipe, sistema, tipo ou setor.
- Prioridade: a nativa do card (`dim_card.severidade`: Crítica, Alta, Média, Baixa), estado atual do card, como na E7.100.
- Percentis 50/85/95 por interpolação linear (tipo 7, `percentil` da biblioteca), sobre o tempo de ciclo em horas úteis convertido por `diasUteis` (horas / 8). Mínimo de publicação: 20 itens (abaixo, "amostra insuficiente"); os quatro níveis atingem o mínimo.
- BusinessMap apenas; nenhum dado do Acelerato entra.

## Comando

Nenhum código do repositório foi alterado. A conta rodou um script descartável (fora do repositório) que:

1. lê a base local só com `SELECT` (sessão `default_transaction_read_only=on`, via `docker exec ... psql`), com as mesmas funções de leitura do servidor (`lerCards`, `lerTransicoes`, etc.) e `ServicoMetricas.carregarBM`;
2. monta o contexto com `businessmap.criarContextoBM` e o calendário da base;
3. seleciona com `selecionar`, `ehDemanda`, `dentro` e `du` e calcula com `percentil`/`publicavel` da biblioteca T2.5.

Conferência independente em SQL (cards `story` concluídos na janela, não excluídos): Alta 206, Baixa 26, Crítica 685, Média 1103, sem prioridade 491. Os números diferem do n da tabela porque o SQL usa `concluido_em` e não tira subtarefas e descartados, enquanto a biblioteca usa a transição de entrega e o tempo de ciclo fechado; a ordem de grandeza confere.

## Observações para o dono

1. **O prazo de Crítica (12,5) fica acima do de Alta (5,8) e quase igual ao de Média (11,2).** O P85 pela regra decidida não é monótono com a prioridade, o que um SLE em geral seria. Pode indicar que a prioridade no BusinessMap não é usada como urgência real ou é ajustada depois (a prioridade lida é a atual do card, não a do momento da entrega). Decisão do dono: aprovar os valores como saem, ou pedir uma regra de monotonicidade (não inferida pelo time).
2. **Distribuição de cauda longa.** P50 abaixo de 1,2 dia útil contra P95 de 12,9 a 33,2: a maioria das histórias fecha rápido e poucas levam semanas. O P85 captura bem a maior parte, mas o P95 de Média (33,2) mostra itens muito longos.
3. **Baixa tem só 22 entregas** (mínimo é 20): o P85 de 2,1 dias é publicável pela regra, mas frágil; um ou dois itens a menos e cai para "amostra insuficiente". Sugestão: o dono decide se aprova o valor ou se mantém Baixa sem prazo até a amostra crescer.
4. **Prazo ainda não existe na configuração**: `ref_sle` está vazia, então hoje o T2 mostra "sem referência" nos quatro níveis. Depois da aprovação o valor entra pela configuração (WS1), com data de publicação, e o cartão do T2 explica este cálculo numa observação (D-T2).
5. Não é meta por pessoa nem comparação entre times: a análise é de fluxo, no total das histórias do BusinessMap.
