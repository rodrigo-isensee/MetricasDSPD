import type { TextoNota } from '@/components/ui'

/** Notas metodológicas do painel Operacional: um objeto por métrica, texto da spec de UX (seção 4). */
export const NOTAS_OPERACIONAL: Record<string, TextoNota> = {
  O4: {
    oQueE: 'Demandas entregáveis ao solicitante concluídas por semana.',
    comoSeCalcula:
      'Contagem por semana de entrega; subtarefas não contam; reabertos reabrem o original.',
    comoLer: 'Olhe a faixa, não só a média; ela é a base das previsões.',
    meta: 'Reduzir a amplitude da variação.',
    cuidados:
      'Vazão não é produtividade individual nem serve para comparar equipes; só prevê o próprio futuro.',
  },
}
