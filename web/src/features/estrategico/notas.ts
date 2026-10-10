import type { TextoNota } from '@/components/ui'

/** Notas metodológicas do painel Estratégico (spec de UX, seção 4). */
export const NOTAS_ESTRATEGICO = {
  E1: {
    oQueE: 'Tempo da aprovação na comissão até a entrega.',
    comoSeCalcula:
      'Criação do card do projeto → entrega, em dias úteis, decomposto em antes e depois do início. Projetos de tipos diferentes (Iniciativa, Melhoria) nunca entram no mesmo cálculo: um tipo por vez.',
    comoLer: 'Mais da metade antes do início aponta para priorização, não para execução.',
    meta: '−25% da mediana ao ano.',
    cuidados:
      'O tempo do TAP anterior à aprovação está fora do escopo; poucos projetos por ano tornam a amostra pequena (abaixo de 20 não publicamos mediana nem P85).',
  },
  E2: {
    oQueE: 'Percentual da capacidade entregue por objetivo estratégico.',
    comoSeCalcula:
      'Itens entregues no trimestre, agrupados pelo objetivo estratégico do projeto de origem. Evolução = Melhoria, Iniciativa e Dívida técnica.',
    comoLer:
      'É o teste de coerência entre discurso e execução; "Fora de objetivo" é o que merece explicação.',
    meta: '≥ 60% da evolução vinculada a objetivos declarados.',
    cuidados:
      'Manutenção e obrigação legal são categorias legítimas; forçar tudo em um objetivo gera classificação decorativa.',
  },
  E3: {
    oQueE: 'O ganho medido contra o previsto.',
    comoSeCalcula: 'Ganho medido ÷ ganho previsto, com o previsto declarado antes do início.',
    comoLer: 'Entregar não é o mesmo que resolver; 40% do ganho é aprendizado, não falha.',
    meta: '100% das iniciativas com resultado declarado antes do início.',
    cuidados: 'Sem esse fechamento o painel mede movimento, não valor. Valores são fictícios.',
  },
} satisfies Record<string, TextoNota>
