import type { VersaoCriterio } from '@/contracts/comum'

/**
 * Neutro: usado pelos dois geradores (BusinessMap e Acelerato), que nunca se importam.
 * Mudanças de critério fictícias dentro do histórico (spec de UX 7.5, item 6).
 */
export const CRITERIOS_MOCK: VersaoCriterio[] = [
  {
    id: 'criterio-2026-03-02',
    data: '2026-03-02',
    descricao: 'Marco de entrada passou a ser a criação do card na chegada do pedido',
    afeta: ['O7', 'O9', 'O10', 'T1', 'EI_FL1', 'EI_FL2', 'EI_FL3'],
  },
  {
    id: 'criterio-2026-06-01',
    data: '2026-06-01',
    descricao: 'Novas etapas do Acelerato em produção e mapeamento dos totalizadores revisado',
    afeta: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'EI_SUST'],
  },
]
