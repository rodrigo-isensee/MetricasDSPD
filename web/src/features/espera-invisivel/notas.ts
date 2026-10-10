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
    cuidados:
      'Em Sustentação o tempo de vida inclui esperas do solicitante e de outros times, e vem de outra fonte (Acelerato): não compare com os níveis do BusinessMap. Horas úteis, por prioridade.',
  },
}
