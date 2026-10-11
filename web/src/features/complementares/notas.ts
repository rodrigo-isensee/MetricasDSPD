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
  | 'T6'
  | 'T8'
  | 'E4'
  | 'E5'
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
    comoLer: 'Leia junto com a taxa de escape (O15). Mais defeitos não significa mais valor.',
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
    comoLer: 'Veja se o estoque cresce. Leia junto com a taxa de escape (O15).',
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
      'A lista de causas é provisória até a decisão final do critério. Por sistema, nunca por pessoa.',
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
}
