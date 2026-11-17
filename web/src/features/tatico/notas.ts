import type { TextoNota } from '@/components/ui'

/** Notas metodológicas do painel Tático (spec de UX, seção 4). */
export const NOTAS_TATICO = {
  T1: {
    oQueE: 'Tempo do pedido à entrega, em quatro blocos.',
    comoSeCalcula:
      'Entrada → entrega, dividido pelos marcos e pelo tipo de coluna (fila/execução) das transições; a soma das medianas dos blocos não é a mediana do total (as duas aparecem separadas).',
    comoLer: 'Cada bloco tem um dono diferente.',
    meta: 'Publicar por prioridade e reduzir a fila.',
    cuidados:
      'Expor a fila costuma incomodar no primeiro ciclo; leia com a demanda × capacidade: "temos mais pedidos do que capacidade", não "o time é lento". Aceite fica fora (medido à parte).',
  },
  T2: {
    oQueE: 'Percentual de demandas entregues dentro do SLE publicado.',
    comoSeCalcula:
      'Entregues com tempo de ciclo ≤ SLE da prioridade, nas últimas 12 semanas; o SLE da prioridade é o P85 publicado (com data). Cartão sem prioridade fica fora e é contado à parte.',
    comoLer:
      'Um prazo por prioridade, não um prazo único; o mapa indica em que etapa o tempo se perdeu.',
    meta: '85% por prioridade.',
    cuidados:
      'O SLE é um valor de configuração com data de publicação; só é válido após 60 dias de dados limpos e 20 itens por prioridade. Enquanto o dono não aprovar os prazos, o SLE fica não definido. A contagem dos 60 dias recomeça desde a troca de critério marcada no gráfico, quando a separação passou a ser pela prioridade do cartão.',
  },
  T3: {
    oQueE: 'Como as entregas se dividiram entre quatro fatias do trabalho, pelo tipo do card.',
    comoSeCalcula:
      'Itens entregues no período agrupados pelo tipo do card: Produto (Item de trabalho, História, Gestão, Acompanhamento de atividades e qualquer tipo sem categoria própria), Habilitador (Enabler), Correção em produção (Incidente de Produção, Bug de Produção, Chamado) e Saúde técnica e de processo (Débito técnico, Processos, Kaizen, Otimização de processo). Bug interno fica fora, projeto e frente acima não mudam a fatia, e o setor é só filtro.',
    comoLer:
      'Mostra a divisão realizada, sem comparar com combinado. Fatia com menos de 20 entregas mostra só a contagem, sem percentual, e a soma dos percentuais mostrados pode ficar abaixo de 100%.',
    meta: 'Sem meta numérica.',
    cuidados:
      'Contar cards distorce quando os tamanhos diferem muito; use o tempo em execução para conferir. Critério com data: o Enabler passou a ser Habilitador em 17/11/2026 (marca no gráfico).',
  },
  T4: {
    oQueE: 'Chegada de pedidos contra a vazão.',
    comoSeCalcula:
      'Contagem semanal por prioridade de entradas (criação) e saídas (entrega); saldo = vazão − chegada.',
    comoLer:
      'Enquanto a linha de chegada estiver acima da de vazão, nenhuma melhoria de produtividade estabiliza o prazo.',
    meta: 'Razão entre 0,9 e 1,0.',
    cuidados: 'Calcule por prioridade; leia junto do lead time (T1).',
  },
  T5: {
    oQueE: 'Parcela da demanda que chega por falha anterior.',
    comoSeCalcula: 'Demanda de falha ÷ demanda total, por origem da demanda, no período.',
    comoLer: 'É a parcela da carga que pode ser eliminada em vez de acelerada.',
    meta: '−15% ao semestre nos dois sistemas mais afetados.',
    cuidados: 'Mostra sistemas e áreas, não pessoas ou equipes; não use para ranquear.',
  },
  T7: {
    oQueE: 'WIP, envelhecimento e tempo de ciclo de features e pacotes.',
    comoSeCalcula:
      'Mesmas definições do nível operacional, na granularidade de frente (feature e pacote contam igual).',
    comoLer: 'Um time pode ter WIP baixo de stories e estar dividido entre seis frentes.',
    meta: 'Limite explícito de frentes.',
    cuidados:
      'Frente que não cabe em 1 ou 2 sprints precisa ser quebrada; a granularidade de frente nunca entra no histograma de story.',
  },
  T9: {
    oQueE: 'Percentual de frentes concluídas e quanto o escopo cresceu.',
    comoSeCalcula:
      'Concluídas ÷ total (originais + adicionadas); adicionadas = frentes criadas depois do início do projeto.',
    comoLer:
      'Um projeto pode entregar frentes e ainda estar mais longe do fim do que no mês anterior.',
    meta: 'Avanço calculado, nunca declarado.',
    cuidados:
      'Contar frentes é aproximação (têm tamanhos diferentes); escopo crescente é informação, não erro.',
  },
} satisfies Record<string, TextoNota>
