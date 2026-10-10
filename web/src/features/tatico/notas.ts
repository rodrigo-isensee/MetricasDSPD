import type { TextoNota } from '@/components/ui'

/** Notas metodológicas do painel Tático (spec de UX, seção 4). */
export const NOTAS_TATICO = {
  T1: {
    oQueE: 'Tempo do pedido à entrega, em quatro blocos.',
    comoSeCalcula:
      'Entrada → entrega, dividido pelos marcos e pelo tipo de coluna (fila/execução) das transições; a soma das medianas dos blocos não é a mediana do total (as duas aparecem separadas).',
    comoLer: 'Cada bloco tem um dono diferente.',
    meta: 'Publicar por classe e reduzir a fila.',
    cuidados:
      'Expor a fila costuma incomodar no primeiro ciclo; leia com a demanda × capacidade: "temos mais pedidos do que capacidade", não "o time é lento". Aceite fica fora (medido à parte).',
  },
  T2: {
    oQueE: 'Percentual de demandas entregues dentro do SLE publicado.',
    comoSeCalcula:
      'Entregues com tempo de ciclo ≤ SLE da classe, nas últimas 12 semanas; o SLE da classe é o P85 publicado (com data).',
    comoLer:
      'Um prazo por classe, não um prazo único; o mapa indica em que etapa o tempo se perdeu.',
    meta: '85% por classe.',
    cuidados:
      'Neste mock o SLE é um valor de configuração com data de publicação; só é válido após 60 dias de dados limpos e 20 itens por classe.',
  },
  T3: {
    oQueE: 'Distribuição das entregas por natureza do trabalho contra o acordo.',
    comoSeCalcula:
      'Itens entregues no período agrupados por natureza; acordo é o definido pela coordenação.',
    comoLer: 'A distância entre as barras é a decisão a tomar.',
    meta: 'Desvio máximo de 10 pontos percentuais.',
    cuidados:
      'Contar cards distorce quando os tamanhos diferem muito. Valores de acordo no mock são fictícios.',
  },
  T4: {
    oQueE: 'Chegada de pedidos contra a vazão.',
    comoSeCalcula:
      'Contagem semanal por classe de entradas (criação) e saídas (entrega); saldo = vazão − chegada.',
    comoLer:
      'Enquanto a linha de chegada estiver acima da de vazão, nenhuma melhoria de produtividade estabiliza o prazo.',
    meta: 'Razão entre 0,9 e 1,0.',
    cuidados: 'Calcule por classe; leia junto do lead time (T1).',
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
      'Concluídas ÷ total (originais + adicionadas); adicionadas = frentes marcadas como criadas após o início.',
    comoLer:
      'Um projeto pode entregar frentes e ainda estar mais longe do fim do que no mês anterior.',
    meta: 'Avanço calculado, nunca declarado.',
    cuidados:
      'Contar frentes é aproximação (têm tamanhos diferentes); escopo crescente é informação, não erro.',
  },
} satisfies Record<string, TextoNota>
