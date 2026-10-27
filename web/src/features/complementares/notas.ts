import type { TextoNota } from '@/components/ui'

type Id =
  | 'O5'
  | 'O6'
  | 'O8'
  | 'O11'
  | 'O13'
  | 'O14'
  | 'O16'
  | 'O17'
  | 'O19'
  | 'O20'
  | 'O21'
  | 'O22'
  | 'O24'
  | 'O25'
  | 'O26'
  | 'T6'
  | 'T10'
  | 'T11'
  | 'T12'
  | 'T13'
  | 'T14'
  | 'T8'
  | 'E4'
  | 'E5'
  | 'E6'
  | 'E7'
  | 'E8'
  | 'E9'
  | 'S8'
  | 'S9'
  | 'S10'
  | 'S11'
  | 'S12'

const SEM_ALVO = 'Sem meta numérica. Não vale como alvo de volume nem para comparar times.'

/** Notas das métricas complementares (briefing seção 06 e regras 4.x e 7.2). Valores finais de regra ainda pendentes são ditos no texto. */
export const NOTAS_COMPLEMENTARES: Record<Id, TextoNota> = {
  O5: {
    oQueE:
      'A parte do tempo de ciclo em que o item esteve em coluna de execução, sem fila nem bloqueio.',
    comoSeCalcula:
      'Horas úteis em execução ÷ horas úteis do ciclo (início à entrega), por tipo. Não-execução = fila + bloqueio. Mostra a mediana das razões por item e a razão agregada (soma ÷ soma).',
    comoLer:
      'Uma eficiência baixa diz que o tempo está na espera, não no trabalho. Leia ao lado do tempo de ciclo (O3).',
    meta: SEM_ALVO,
    cuidados:
      'Bloqueio conta como não-execução mesmo dentro de coluna de execução: o tempo bloqueado sai do tempo de execução (decisão de 11/10). Itens de tipos diferentes não se somam.',
  },
  O6: {
    oQueE: 'O quanto o prazo varia: a razão entre o P85 e o P50 do tempo de ciclo.',
    comoSeCalcula:
      'P85 ÷ P50 do tempo de ciclo, por classe de serviço, na janela de percentis. Só com 20 itens ou mais.',
    comoLer: 'Razão próxima de 1 é previsível; acima de 2,5 o prazo varia demais.',
    meta: 'Referência do briefing: abaixo de 2,5.',
    cuidados: 'Use junto com O3 e O8. Não compara times.',
  },
  O8: {
    oQueE:
      'O tamanho das demandas, medido pelo tempo em execução, e quantas passam do P85 anterior.',
    comoSeCalcula:
      'Mediana, média e P85 do tempo em execução (dias úteis) por tipo, cruzados com o tamanho declarado (P, M, G). Só com 20 itens ou mais.',
    comoLer: 'Olhe a mediana e o P85 juntos; a média aparece sempre ao lado deles, nunca sozinha.',
    meta: 'Sem meta; leia com O3 e O4.',
    cuidados:
      'A média isolada esconde itens muito grandes. O tamanho declarado é do card, não da pessoa.',
  },
  O11: {
    oQueE: 'O backlog dividido em itens ainda em definição e itens prontos para começar.',
    comoSeCalcula:
      'Retrato no fim de cada mês, por tipo. "Semanas de backlog pronto" = prontos ÷ vazão semanal mediana (em definição = seção Requested; pronto = In Progress, já comprometido; mede o intervalo de Requested até In Progress).',
    comoLer:
      'Pouco pronto significa que o time pode ficar sem o que fazer; muito pronto parado envelhece.',
    meta: SEM_ALVO,
    cuidados: 'É um retrato mensal, não uma série diária.',
  },
  O13: {
    oQueE: 'Quantos defeitos em produção foram entregues no mês e quanto pesam na vazão total.',
    comoSeCalcula:
      'Contagem mensal de entregues do tipo Defeito em produção e o percentual sobre a vazão de demandas. Abaixo de 20 entregas, só "k de n".',
    comoLer:
      'Leia junto com Onde os bugs são encontrados (O15). Mais defeitos não significa mais valor.',
    meta: 'Sem alvo de volume.',
    cuidados: 'Nunca vale como meta de volume, nem por equipe nem por pessoa.',
  },
  O14: {
    oQueE: 'De onde vem a demanda: volume por área solicitante ou por sistema.',
    comoSeCalcula:
      'Itens entregues e criados na janela, por área ou sistema, abertos por tipo. As dez maiores origens aparecem e as demais ficam agrupadas.',
    comoLer: 'Serve para conversar sobre priorização com as áreas, não para cobrar quem pede.',
    meta: 'Sem meta numérica.',
    cuidados: 'Nunca por pessoa. Um cartão sem área informada entra em "Sem área".',
  },
  O16: {
    oQueE:
      'A entrada e a correção de bugs por mês, o estoque aberto, por severidade, e a idade dos mais antigos.',
    comoSeCalcula:
      'Bugs = Bug interno + Defeito em produção. Idade em dias úteis; densidade = bugs por entrega concluída no mês (com 20 entregas ou mais).',
    comoLer: 'Veja se o estoque cresce. Leia junto com Onde os bugs são encontrados (O15).',
    meta: 'Sem alvo de volume.',
    cuidados: 'Os itens mais antigos aparecem pelo identificador do card, sem nome de pessoa.',
  },
  O17: {
    oQueE: 'A causa raiz e o sistema dos incidentes já encerrados.',
    comoSeCalcula:
      'Contagem de incidentes encerrados por causa raiz (campo do Acelerato, lido pelo Metabase; lista proposta pelo time) e por sistema. Sem mínimo de amostra: é contagem. Se o campo ainda não tem fonte, a métrica diz isso e não publica número.',
    comoLer: 'Concentração indica onde investir em prevenção.',
    meta: SEM_ALVO,
    cuidados:
      'Só a lista de causas é provisória: é uma proposta do time, e o campo causa raiz virá do Metabase. Por sistema, nunca por pessoa.',
  },
  T6: {
    oQueE: 'Uma previsão de prazo ou de quantidade de itens a partir da vazão semanal real.',
    comoSeCalcula:
      'Simulação de Monte Carlo sobre a vazão semanal de uma classe de serviço na janela de percentis. Mostra P50, P85 e P95; só com 20 itens ou mais.',
    comoLer: 'Para um compromisso externo use o P85. O P50 é uma chance de meio a meio.',
    meta: 'Compromisso externo no P85.',
    cuidados:
      'Vale se o escopo não crescer. Uma classe por vez; stories de classes diferentes não se misturam.',
  },
  T8: {
    oQueE: 'O que a sprint entregou do que comprometeu, o que sobrou e o que entrou depois.',
    comoSeCalcula:
      'Entregue do comprometido ÷ comprometido, carry-over e entrada não planejada = itens que entraram após o início ÷ itens da sprint. Cada sprint é um card com filhos; mostra por sprint, sem comparar times.',
    comoLer: 'Leia sempre junto com a entrada não planejada. 100% não é objetivo.',
    meta: 'Sem alvo de 100%.',
    cuidados: 'Não compara sprints entre times nem usa pontos como meta.',
  },
  E4: {
    oQueE: 'Quantos projetos começaram e quantos terminaram por trimestre.',
    comoSeCalcula:
      'Projetos com início e conclusão no trimestre, acumulado em aberto e a proporção entre manter e evoluir (natureza do projeto).',
    comoLer: 'Muito começar e pouco terminar enche o fluxo de projetos abertos.',
    meta: SEM_ALVO,
    cuidados: 'Poucos projetos por trimestre: a leitura é de tendência, não de precisão.',
  },
  E5: {
    oQueE: 'Uma previsão de término de cada projeto, pela vazão das frentes concluídas.',
    comoSeCalcula:
      'Monte Carlo sobre a vazão semanal de frentes (não de stories) na janela, para as frentes que restam. Só com 20 frentes ou mais.',
    comoLer: 'Sempre ao lado do crescimento de escopo. Para compromisso externo use o P85.',
    meta: 'Compromisso externo no P85.',
    cuidados:
      'Frentes adicionadas após o início atrasam o término; nunca leia a previsão sem elas.',
  },
  S8: {
    oQueE:
      'A parcela dos incidentes abertos que são reincidentes, isto é, voltaram como novo chamado com o ticket anterior informado.',
    comoSeCalcula:
      'Reincidentes ÷ incidentes abertos, por mês de abertura; o próprio chamado reincidente conta no mês em que foi aberto. Reincidente = chamado com o campo de reincidência preenchido com o ticket anterior.',
    comoLer: 'Reabertura alta sugere correção que não resolveu.',
    meta: 'Abaixo de 5%.',
    cuidados:
      'Depende do preenchimento do campo de reincidência: o cartão mostra em quantos chamados ele foi informado.',
  },
  S9: {
    oQueE:
      'O tempo que o chamado passa em Pendente, por motivo, e se o retorno veio no prazo prometido.',
    comoSeCalcula:
      'Horas úteis na etapa Pendente (P50, P85 e P95 por motivo) e retornos até a previsão ÷ pendências com previsão.',
    comoLer: 'Mostra onde o chamado espera por alguém de fora da sustentação.',
    meta: SEM_ALVO,
    cuidados: 'Motivos com menos de 20 pendências não publicam percentis.',
  },
  S10: {
    oQueE: 'Quanto o chamado espera entre a escalação e o aceite por alguém.',
    comoSeCalcula:
      'Horas úteis em Aguardando atribuição (P50, P85, P95 e histograma) e o percentual aceito em até 15 minutos, por prioridade.',
    comoLer: 'Fila longa antes do aceite pesa na restauração (S1).',
    meta: 'Aceite em até 15 minutos.',
    cuidados: 'Prioridades com menos de 20 chamados não publicam percentis.',
  },
  S11: {
    oQueE:
      'Se os chamados que pedem análise de causa (P1, P2 e encerrados por contorno) receberam avaliação de Problema.',
    comoSeCalcula:
      '% com avaliação registrada e conversão: avaliações que viraram Registro de Problema ÷ avaliações.',
    comoLer: 'Baixa avaliação deixa causas sem tratamento.',
    meta: SEM_ALVO,
    cuidados:
      'Os grupos se sobrepõem: um P1 pode ter contorno. O campo de Registro de Problema é fictício por ora.',
  },
  S12: {
    oQueE:
      'Quais sistemas geram mais chamados, a reincidência por sistema e a exceção de SLA por registro posterior.',
    comoSeCalcula:
      'Chamados por sistema no mês; reincidentes (campo de reincidência preenchido) e proporção por sistema na janela de 12 semanas; % com exceção de SLA por registro posterior.',
    comoLer: 'Reincidência alta em um sistema sugere olhar a causa.',
    meta: 'Sem meta; por sistema, nunca por pessoa.',
    cuidados: 'Reincidência depende do preenchimento do campo.',
  },
  O19: {
    oQueE: 'Quantos dias úteis de bloqueio cada causa somou e quantas vezes ela travou o trabalho.',
    comoSeCalcula:
      'Bloqueios encerrados no período, por motivo do domínio fechado (7). Soma em dias úteis e contagem sempre; o percentual é sobre os dias úteis bloqueados e, com P50 e P85 da duração, só com 20 bloqueios ou mais na causa. Bloqueios ainda abertos ficam fora da soma (estão em "Bloqueados agora").',
    comoLer:
      'As causas aparecem da que mais somou dias para a que menos somou: o motivo não é pessoa. Leia junto com os bloqueados agora e a eficiência de fluxo (O5).',
    meta: 'Sem meta numérica.',
    cuidados:
      'Mostra onde o fluxo trava, não quem bloqueou. Não vale como nota de pessoa nem de time.',
  },
  O20: {
    oQueE:
      'Quantos itens estão em cada etapa do quadro, dia a dia, para ver onde o trabalho se acumula.',
    comoSeCalcula:
      'Contagem diária (censo) de itens por coluna, com uma equipe filtrada, ou por papel da coluna, com "Todas". A frase de leitura aponta a fila a partir do compromisso com maior crescimento no período; o Backlog nunca é o destaque. Cards arquivados e excluídos permanecem até o instante do arquivamento.',
    comoLer:
      'Uma faixa que engorda enquanto as entregas ficam estáveis indica acúmulo naquela etapa. A linha tracejada marca mudança de critério de cálculo. Leia junto com o WIP e o limite (O1) e a entrada × saída (O7).',
    meta: 'Sem meta numérica.',
    cuidados: 'Não é estatística: é contagem. Sem transição no período, não há o que mostrar.',
  },
  O21: {
    oQueE: 'Quanto das entregas voltou para uma etapa anterior e por onde essa volta acontece.',
    comoSeCalcula:
      'Entregas do período com ao menos uma transição de retorno até a conclusão. Matriz de origem e destino só com retornos; o retorno a partir de "Entregue" é a reabertura. P50 e P85 do ciclo com × sem retorno, por tipo, só se cada grupo tiver 20 entregas ou mais. Percentual só com 20 entregas ou mais.',
    comoLer:
      'Mostra o peso do retrabalho no prazo, não de quem errou. Com "Todas" as equipes, a matriz usa o papel da coluna. Leia junto com a vazão de defeitos (O13) e a eficiência de fluxo (O5).',
    meta: 'Sem meta numérica.',
    cuidados: 'Abaixo de 20 entregas, só "k de n". Não compara times.',
  },
  O22: {
    oQueE: 'Quanto tempo um pedido espera até alguém reagir a ele.',
    comoSeCalcula:
      'Dias úteis da criação ao primeiro comentário humano, por tipo. P50, P85 e P95 na janela móvel de 12 semanas, só com 20 pedidos tocados no tipo. Mudança de coluna e atribuição não contam como toque; comentário de automação também não. Guarda-se só o instante, nunca quem comentou nem o texto.',
    comoLer:
      'Um tipo por vez. O bloco "Ainda sem toque" é o retrato de hoje: pedidos abertos sem nenhuma reação e a idade do mais antigo. Leia junto com os três relógios (O9) e o envelhecimento do backlog (O10).',
    meta: 'Sem meta numérica.',
    cuidados: 'Não mede quem reage, só o tempo da fila.',
  },
  O24: {
    oQueE:
      'Quantos pedidos começaram antes de outros mais antigos e quanto esperaram os que foram ultrapassados.',
    comoSeCalcula:
      'Só classe Padrão, mesmo tipo, na fila de cada equipe. Um início é "fora de ordem" se havia um pedido mais antigo ainda não iniciado. Espera: dias úteis entre o início do primeiro item que passou na frente e o início do ultrapassado. Percentual só com 20 inícios; P50 e P85 só com 20 ultrapassados no tipo.',
    comoLer:
      'A ordem de chegada é a política da classe Padrão. Urgente, Prazo fixo e Intangível têm regra própria e ficam fora. O cartão mostra o custo de passar na frente, não um erro. Leia junto com o envelhecimento do backlog (O10) e a aderência ao SLE (T2).',
    meta: 'Sem meta numérica.',
    cuidados: 'Não aponta quem escolheu o que começar.',
  },
  O25: {
    oQueE: 'Quanto do que encerrou foi descartado e quanto esforço já tinha sido consumido.',
    comoSeCalcula:
      'Descartados (estado nativo "descartado" e card excluído sem entrega) ÷ encerrados (entregues + descartados) no período, só com 20 encerrados ou mais. Tempo consumido: do início ao descarte, em dias úteis, separando antes e depois do início. O mês corrente é parcial. Motivo preenchido sem descarte vira aviso de preenchimento e fica fora da taxa.',
    comoLer:
      'Descartar cedo é saudável; o custo está no que foi descartado depois de começar. Leia junto com a vazão (O4) e a entrada × saída (O7).',
    meta: 'Sem meta numérica.',
    cuidados:
      'A divisão por motivo só aparece quando a integração lê o catálogo de motivos do BusinessMap; sem ela, o cartão mostra a taxa e o tempo consumido.',
  },
  O26: {
    oQueE: 'Quantas vezes o responsável por uma demanda mudou até ela ser entregue.',
    comoSeCalcula:
      'Número de trocas de responsável por card entregue (alguém sai e outro entra, ou o conjunto é substituído; incluir um co-responsável não conta). Histograma por faixa (0, 1, 2, 3, 4 ou mais) e P85 do ciclo por faixa, por tipo; percentual e P85 só com 20 entregas ou mais na faixa. Entregas sem a contagem ficam à parte.',
    comoLer:
      'Conta trocas, nunca quem. Não existe filtro nem abertura por pessoa. Leia junto com a eficiência de fluxo (O5) e o tempo de ciclo (O3).',
    meta: 'Sem meta numérica.',
    cuidados: 'Não é avaliação de pessoa nem de time.',
  },
  T10: {
    oQueE:
      'Quanto tempo o trabalho fica bloqueado esperando cada fornecedor e quantas vezes isso aconteceu.',
    comoSeCalcula:
      'Bloqueios encerrados com fornecedor informado, de qualquer motivo, por fornecedor (maiúsculas, minúsculas e espaços não separam o mesmo nome). Contagem e dias úteis somados pelo período do painel; P50 e P85 da duração na janela móvel de 12 semanas, só com 20 bloqueios ou mais no fornecedor. Bloqueio sem fornecedor fica de fora.',
    comoLer:
      'A barra vai até o P85 e a marca indica o P50. Os fornecedores aparecem em ordem alfabética, sem ordem de melhor ou pior. Leia junto com os bloqueados agora e os acordos e vencidos (O12).',
    meta: 'Sem meta numérica.',
    cuidados:
      'Nesta fase não há prazo contratado: o cartão não compara com contrato nem diz "dentro" ou "acima". Não vale como nota do fornecedor nem de pessoa.',
  },
  T11: {
    oQueE: 'Quantas demandas chegam em cada mês, ano a ano, para ver o que se repete.',
    comoSeCalcula:
      'Contagem (censo) de demandas criadas por mês, nos 24 meses fechados mais o mês corrente. O período do painel não atua: a janela é fixa. A média mensal é só uma referência de contagem, não estatística de tempo.',
    comoLer:
      'O número está em cada célula; a cor só reforça. Um tipo de demanda por vez ou todos. O mês corrente é parcial. Leia junto com demanda × capacidade (T4) e a previsão (T6).',
    meta: 'Sem meta numérica.',
    cuidados:
      'Com menos de dois anos de histórico, ainda não dá para separar padrão de acaso. Mostra chegada de demanda, não desempenho.',
  },
  T12: {
    oQueE: 'Quanto das demandas de cada área precisou de ida e volta antes de começar.',
    comoSeCalcula:
      '"Ida e volta" é o bloqueio com motivo "Falta de informação no chamado" antes do início, ou o retorno do card da coluna de compromisso para o backlog. Por área solicitante, em ordem de volume. Percentual só com 20 demandas ou mais na área; abaixo, "k de n".',
    comoLer:
      'Mede a clareza do pedido que chega, para combinar com a área o que um pedido precisa trazer. Não é nota da área.',
    meta: 'Sem meta numérica.',
    cuidados: 'Não compara áreas nem times. Leia junto com a origem da demanda (O14).',
  },
  T13: {
    oQueE: 'Quanto das entregas dependeu de trabalho de outro quadro.',
    comoSeCalcula:
      'Entregas com vínculo predecessor com card de outro quadro (pai/filho e relacionado não contam; o vínculo removido antes da entrega conta). Percentual só com 20 entregas ou mais. O par P50/P85 do lead time com × sem dependência é por tipo, só se cada grupo tiver 20 ou mais. Demandas ou frentes, uma granularidade por vez.',
    comoLer:
      'Mostra o peso da dependência no prazo. O outro quadro não é identificado, para não virar comparação entre times. Leia junto com o lead time ponta a ponta (T1).',
    meta: 'Sem meta numérica.',
    cuidados:
      'Entregas com quadro do vínculo desconhecido ficam à parte, nunca contam como "não dependeu"..',
  },
  T14: {
    oQueE: 'Que parte de cada projeto em andamento é do meu time.',
    comoSeCalcula:
      'Demandas do projeto (frentes, se escolhido) pelo campo "Time responsável" do card: meu time, outros times (somados) e sem time informado. Percentual só com 20 demandas ou mais com time informado. A equipe escolhida no filtro define "meu time". Projetos ordenados pelo total de demandas.',
    comoLer:
      'Mostra a parte do projeto que é do meu time, para entender a cobrança por entregas em que atuo pouco. Quando os outros times somam poucas pessoas, só a fatia do meu time é mostrada, sem o total do projeto.',
    meta: 'Sem meta numérica; não existe participação mínima esperada.',
    cuidados:
      'Não é nota do time nem comparação: nenhum outro time é nomeado, listado nem ordenado..',
  },
  E6: {
    oQueE: 'Se a data comprometida de um projeto se confirma: o deslize de cada projeto concluído.',
    comoSeCalcula:
      'Dias úteis entre a data comprometida (a registrada no compromisso) e a conclusão, com sinal: negativo é antes, 0 é na data. Tolerância zero: entregar até a data é cumprir. Alterações posteriores da data contam como replanejamentos. Percentual e P50/P85 só com 20 projetos ou mais; abaixo, os pontos e o "k de n".',
    comoLer:
      'Cada ponto é um projeto; a forma mostra os replanejamentos (círculo 0, losango 1, triângulo 2 ou mais). Leia junto com a previsão de término (E5) e o avanço real (T9).',
    meta: 'Sem meta numérica.',
    cuidados:
      'Poucos projetos terminam por ano: é esperado ficar abaixo de 20. Projeto concluído sem data comprometida registrada fica fora da conta e é contado à parte..',
  },
  E7: {
    oQueE:
      'Quanto das entregas do período vai para cada sistema do parque, por natureza do trabalho.',
    comoSeCalcula:
      'Contagem de demandas entregues por sistema ÷ total de entregas do período, sem subtarefa, dividida nas quatro naturezas do T3 (Sustentação, Evolução, Projetos, Dívida técnica). Percentual só com 20 entregas ou mais no sistema; abaixo, "k de n". Sistemas de menos volume ficam no fim.',
    comoLer:
      'Mostra onde as entregas se concentram, em ordem de volume. Leia junto com a alocação da capacidade (T3) e a capacidade por objetivo (E2).',
    meta: 'Sem meta numérica.',
    cuidados:
      'É participação nas entregas, não esforço medido nem valor em dinheiro. Nunca horas apontadas, nunca por equipe nem por pessoa. Não inclui os chamados da sustentação (Acelerato), que estão no S12.',
  },
  E8: {
    oQueE:
      'Quantos sistemas tiveram as entregas feitas por uma só pessoa, por duas, ou por três ou mais.',
    comoSeCalcula:
      'Contagem de sistemas por faixa de pessoas distintas nas entregas dos últimos 12 meses. O número de pessoas por sistema chega já contado; com menos de 5 sistemas com entregas, as faixas não são mostradas.',
    comoLer:
      'Mede o risco de continuidade do parque. Mostra só quantos sistemas estão em cada faixa, sem nomear sistema nem pessoa.',
    meta: 'Sem meta numérica.',
    cuidados:
      'Não mostra nem avalia pessoas. Não há filtro por equipe nem por sistema, para não apontar quem entrega..',
  },
  E9: {
    oQueE: 'Quanto tempo um projeto aprovado espera para começar.',
    comoSeCalcula:
      'Retrato do dia dos projetos aprovados e ainda não iniciados, com a espera em dias úteis desde a criação do card de projeto (que nasce com a aprovação na comissão), em faixas de 0–30, 31–90, 91–180 e mais de 180. A linha de referência é o P85 do tempo antes do início dos projetos concluídos do mesmo tipo (E1), só com 20 projetos concluídos no tipo.',
    comoLer:
      'Cada ponto é um projeto; a forma indica a faixa. Um tipo de projeto por vez. Leia junto com o lead time de projetos (E1) e as iniciadas × concluídas (E4).',
    meta: 'Sem meta numérica.',
    cuidados:
      'O filtro de período não se aplica: é o retrato de hoje. Iniciativa e Melhoria nunca entram no mesmo P85.',
  },
}
