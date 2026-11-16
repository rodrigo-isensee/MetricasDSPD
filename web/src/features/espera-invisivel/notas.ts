import type { TextoNota } from '@/components/ui'

const BASE: TextoNota = {
  oQueE: 'A fração do tempo do cliente que acontece fora da gestão do time.',
  comoSeCalcula:
    '(visão do cliente − visão do time) ÷ visão do cliente, sobre as medianas da mesma janela e dos mesmos itens, em uma classe por vez (aba). Com menos de 20 itens em qualquer das duas visões, nenhuma é publicada.',
  comoLer:
    'Os dois números são verdadeiros e medem coisas diferentes; o valor está na distância entre eles. A visão do cliente é a que vai para fora; a do time orienta a melhoria interna.',
  meta: 'Reduzir; acima de 50% a discussão é de fila.',
  cuidados:
    'Só é comparável se os marcos estiverem registrados com disciplina: se o card nascer só quando o trabalho começa, a visão do cliente não existe e o índice dá zero quando deveria ser o mais alto. Nunca compare tipos entre si como ranking.',
}

/** Notas da Espera invisível por nível (spec de UX, seção "Espera invisível"). */
export const NOTAS_EI: Record<'FL1' | 'FL2' | 'FL3' | 'SUST', TextoNota> = {
  FL1: BASE,
  FL2: BASE,
  FL3: BASE,
  SUST: {
    ...BASE,
    oQueE:
      'A fração do tempo do chamado fechado que ficou parada em espera, fora do trabalho do time (fila inicial, solicitante, fornecedor, janela de mudança, validação e pendência).',
    comoSeCalcula:
      'Visão do cliente: soma do tempo de todas as etapas do chamado, sem as etapas finais (Concluído, Encerramento, Causa Raiz e Revisão). Visão do time: a do cliente menos as esperas (Pendente, Aguardando Solicitante, Suporte Terceiros, Fornecedor, Janela de Mudança e Validação, as mesmas que pausam o SLA) e a fila inicial (Novo, Novo Atendimento, Em triagem e Aguardando Atribuição). Índice = (cliente − time) ÷ cliente, sobre as medianas da mesma janela, por prioridade. Com menos de 20 chamados na prioridade, nenhuma das duas visões é publicada.',
    cuidados:
      'Aguardando Equipe Interna, Aprovação, Mudança e Data Acordada ainda não foram classificadas: contam como tempo do time, então o índice sai conservador (menor), e o tempo nelas é informado à parte. Vem de outra fonte (Acelerato): não compare com os níveis do BusinessMap. Horas úteis, por prioridade.',
  },
}
