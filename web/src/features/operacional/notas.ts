import type { TextoNota } from '@/components/ui'

/** Notas metodológicas do painel Operacional: um objeto por métrica, texto da spec de UX (seção 4). */
export const NOTAS_OPERACIONAL: Record<
  'O1' | 'O2' | 'BLOQUEADOS' | 'O3' | 'O4' | 'O7' | 'O9' | 'O10' | 'O12' | 'O15' | 'O18',
  TextoNota
> = {
  O1: {
    oQueE: 'Quantidade de itens em execução por coluna e no fluxo, contra o limite combinado.',
    comoSeCalcula:
      'Itens com início e sem entrega no dia; bloqueados e itens em colunas de fila contam.',
    comoLer:
      'O que importa é por quantos dias a linha ficou acima do limite e o que aconteceu com o tempo de ciclo depois de cada pico.',
    meta: 'Dentro do limite em 90% dos dias.',
    cuidados:
      'Se uma coluna de espera for criada fora do limite o número melhora e a entrega piora; aqui toda fila conta.',
  },
  O2: {
    oQueE: 'A idade de cada item ainda em andamento, posicionado na etapa onde está.',
    comoSeCalcula:
      'Dias úteis desde o início (primeira entrada em coluna de execução) até a data de corte; percentis calculados com os itens concluídos do tipo na janela de percentis. O destaque "sem mover" conta itens em andamento sem mudar de coluna há mais de 5 dias úteis; o percentual só sai com 20 itens em andamento ou mais, senão "k de n".',
    comoLer:
      'Percorra da direita para a esquerda; comece pelos itens acima da linha de 85%. A pergunta é "o que precisa acontecer hoje para este item andar?".',
    meta: 'Nenhum item acima do P95 sem plano de ação.',
    cuidados:
      'É um retrato de hoje e só olha o que ainda dá para salvar; não substitui o tempo de ciclo.',
  },
  BLOQUEADOS: {
    oQueE: 'Os itens que estão parados esperando alguém ou alguma coisa, e há quanto tempo.',
    comoSeCalcula:
      'Bloqueio marcado no card e ainda aberto hoje; o tempo é contado em dias úteis desde o início do bloqueio.',
    comoLer: 'Comece pelo mais antigo: a pergunta é quem pode destravar o quê.',
    meta: 'Sem meta numérica.',
    cuidados:
      'O bloqueio não move o card de coluna; o tempo continua na etapa onde o problema ocorreu. Esta lista não é a análise de bloqueios por causa.',
  },
  O3: {
    oQueE: 'Tempo entre o início efetivo e a entrega.',
    comoSeCalcula:
      'Dias úteis, da primeira entrada em coluna de execução até a entrega em produção, para os itens concluídos na janela de percentis; descartados saem; subtarefas não contam.',
    comoLer: 'Por percentil, não pela média: "85% em até Y dias" é a afirmação negociável.',
    meta: 'Reduzir o P85 em 20% no semestre.',
    cuidados:
      'Nunca misture tipos (um incidente de 4 horas e um projeto de 40 dias não têm distribuição comum); abaixo de 20 itens não há percentil.',
  },
  O4: {
    oQueE: 'Demandas entregáveis ao solicitante concluídas por semana.',
    comoSeCalcula:
      'Contagem por semana de entrega; subtarefas não contam; reabertos reabrem o original.',
    comoLer: 'Olhe a faixa, não só a média; ela é a base das previsões.',
    meta: 'Reduzir a amplitude da variação.',
    cuidados:
      'Vazão não é produtividade individual nem serve para comparar equipes; só prevê o próprio futuro.',
  },
  O7: {
    oQueE: 'Cards criados e concluídos por mês e tipo.',
    comoSeCalcula:
      'Entrada = criação do card (chegada do pedido); saída = entrega; saldo = entrada menos saída.',
    comoLer: 'Observe o saldo ao longo dos meses, não o de um mês isolado.',
    meta: 'Saída maior ou igual à entrada por tipo no trimestre.',
    cuidados:
      'Mês é um recorte grosseiro (feriados, férias, sazonalidade); dois meses não são tendência.',
  },
  O9: {
    oQueE: 'Três medidas do mesmo item com pontos de partida diferentes.',
    comoSeCalcula:
      'Cliente = entrada até entrega; equipe = compromisso até entrega; ciclo = início até entrega, em dias úteis; o aceite fica fora.',
    comoLer:
      'Cliente muito maior que equipe indica problema de priorização e fila; equipe muito maior que ciclo indica espera interna e bloqueio.',
    meta: 'Reduzir a distância entre o lead time do cliente e o cycle time.',
    cuidados:
      'Faixas largas escondem a distribuição; exige que o card nasça na chegada do pedido, senão o relógio do cliente não existe.',
  },
  O10: {
    oQueE: 'Idade dos itens que ainda não começaram.',
    comoSeCalcula:
      'Data de corte menos entrada (criação do card), em dias corridos; só itens sem início.',
    comoLer:
      'A barra da direita é a mais importante: item parado há mais de 180 dias provavelmente não será feito.',
    meta: 'Nenhum item acima de 180 dias sem decisão explícita de manter ou encerrar.',
    cuidados:
      'A visão do cliente costuma ter os itens mais velhos porque ninguém arquiva o pedido de outra pessoa; exige que o card nasça na chegada do pedido.',
  },
  O12: {
    oQueE:
      'Compromissos com data acordada, quantos venceram sem entrega e por responsabilidade de quem.',
    comoSeCalcula:
      'Data acordada no mês contra a entrega; responsabilidade registrada no vencimento.',
    comoLer:
      'A linha decrescente é o que se apresenta às áreas; a decomposição é a conversa interna.',
    meta: 'Zero vencidos por causa interna.',
    cuidados:
      'A responsabilidade precisa ser preenchida no vencimento, nunca depois; "Não classificado" mostra o que ficou sem preencher.',
  },
  O15: {
    oQueE: 'Distribuição dos bugs pela fase em que foram detectados.',
    comoSeCalcula:
      'Contenção = bugs detectados antes da homologação sobre o total; escape = bugs em produção sobre o total.',
    comoLer: 'Onde aparecem diz mais que quantos são.',
    meta: 'Elevar a contenção e reduzir o escape; não há meta sobre o volume de bugs internos.',
    cuidados:
      'Bug interno registrado é sinal de que a detecção funciona; cobrar o volume faz a equipe parar de registrar. Número baixo pode ser qualidade boa ou detecção ruim.',
  },
  O18: {
    oQueE: 'A vazão do mês decomposta em entregas limpas e com bug.',
    comoSeCalcula:
      'Bug vinculado até 30 dias após a entrega conta para o mês da entrega; depois disso entra como defeito em produção do mês corrente.',
    comoLer: 'Leia sempre ao lado da vazão (O4).',
    meta: 'Elevar a taxa de entrega limpa mantendo ou aumentando a vazão.',
    cuidados:
      'Sem o corte de 30 dias nenhum mês fecha; densidade entre os afetados bem maior que a geral aponta tamanho e complexidade, não qualidade geral.',
  },
}
