import type { TextoNota } from '@/components/ui'

/** Notas metodológicas do painel Sustentação (spec de UX, seção "Sustentação"). */
export const NOTAS_SUSTENTACAO: Record<string, TextoNota> = {
  S1: {
    oQueE:
      'Tempo até o primeiro atendimento (MTTA) e até a restauração validada (MTTR), em cada prioridade.',
    comoSeCalcula:
      'Tempo útil pelo calendário de expediente (dia útil = 8 horas úteis); no MTTR, as pendências são descontadas do relógio; exceções de registro posterior saem desta apuração.',
    comoLer: 'Cada barra é comparada ao alvo da sua prioridade (100% = alvo).',
    meta: 'Os prazos da matriz Impacto × Urgência.',
    cuidados:
      'O pedido de informação ao solicitante, sendo o primeiro comentário, já marca o primeiro atendimento. Use mediana e P85; a média aparece só na tabela, nunca sozinha. Nunca agregue prioridades.',
  },
  S2: {
    oQueE: 'Percentual de chamados dentro do prazo, por prioridade e tipo de prazo.',
    comoSeCalcula:
      'Chamados fechados com REALIZADO_NO_PRAZO ÷ fechados; primeiro atendimento e restauração separados; exceções de registro posterior ficam de fora.',
    comoLer:
      'Falhar no primeiro atendimento é problema de triagem e fila; falhar na restauração é diagnóstico, escalação ou dependência.',
    meta: 'Acima de 90%.',
    cuidados: 'P1 e P5 têm compromissos incomparáveis; nunca agregar.',
  },
  S3: {
    oQueE: 'Contagem mensal de chamados por prioridade.',
    comoSeCalcula: 'Chamados abertos no mês, pela prioridade da matriz Impacto × Urgência.',
    comoLer:
      'Mês com menos aderência pode ser piora do atendimento ou só mais P1 e P2. O mês em andamento aparece listrado.',
    meta: 'Proporção de P1 e P2 estável (texto, sem status).',
    cuidados:
      'Inflação de prioridade (prioridade como fila preferencial) desloca a distribuição sem que o ambiente piore; cruze com S7.',
  },
  S4: {
    oQueE: 'Onde o chamado foi resolvido e quanto tempo passou em cada etapa, por prioridade.',
    comoSeCalcula:
      'O nível vem da etapa de atendimento (fonte da verdade), não da equipe atribuída. Percentuais e tempos somem com menos de 20 chamados na prioridade ou na combinação prioridade × nível.',
    comoLer:
      'Mede a eficácia da base de conhecimento do N1 e a carga no N3, o recurso mais escasso. Leia ao lado de S1 e da reabertura.',
    meta: 'Nenhuma isolada.',
    cuidados:
      'Se o N1 for cobrado por resolver, vai segurar chamados que deveriam escalar e o custo aparece no tempo de restauração. Não é comparação de níveis nem de pessoas.',
  },
  S5: {
    oQueE: 'A distribuição dos motivos de escalação.',
    comoSeCalcula: 'Campo "Motivo da escalação", obrigatório na saída de "Em diagnóstico".',
    comoLer:
      'Cada motivo aponta para uma ação diferente; o último, ainda que pequeno, merece leitura própria.',
    meta: 'Reduzir a escalação por falta de conhecimento técnico no N1 (texto).',
    cuidados: 'Distingue escalação legítima de escalação por comodidade.',
  },
  S6: {
    oQueE: 'A distribuição do motivo de encerramento.',
    comoSeCalcula:
      'Campo "Motivo de encerramento" no encerramento (domínio fechado de cinco valores).',
    comoLer:
      'Contorno é o insumo da Gestão de Problemas; reclassificado mede qualidade da entrada; sem retorno e duplicado medem higiene.',
    meta: 'Acompanhamento contínuo da taxa de contorno (texto).',
    cuidados:
      'Um quinto a um terço por contorno significa causa raiz viva. Motivo vazio aparece como "Não informado".',
  },
  S7: {
    oQueE:
      'Dois fenômenos diferentes, medidos separados: ajuste manual de prioridade e reclassificação de tipo.',
    comoSeCalcula:
      'Ajuste manual = campo "Prioridade ajustada manualmente = Sim", e justificado = campo de justificativa preenchido (não vazio); tipo = motivo de encerramento "Reclassificado, não é incidente".',
    comoLer:
      'Ajuste de prioridade alto e estável indica matriz mal calibrada; de tipo, catálogo confuso.',
    meta: 'Sempre justificada; reduzir a reclassificação de tipo.',
    cuidados:
      'As razões ficam em campo livre e ainda não há lista fechada; por isso esta tela não lista motivos. Os dois blocos nunca são somados.',
  },
}
