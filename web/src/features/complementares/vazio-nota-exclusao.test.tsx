import { screen, waitFor, within } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { CartaoS1 } from '@/features/sustentacao/components/CartaoS1'
import { CartaoS5 } from '@/features/sustentacao/components/CartaoS5'
import { CartaoS6 } from '@/features/sustentacao/components/CartaoS6'
import { CartaoS7 } from '@/features/sustentacao/components/CartaoS7'
import {
  FILTROS_FLUXO,
  FILTROS_SUSTENTACAO,
  FonteAjustada,
} from '@/features/painel/testes/fonteFixa'
import { renderizarCartao } from '@/test/helpers'
import { CartaoO19 } from './operacionais'
import { CartaoE6 } from './estrategicas'
import { CartaoS11, CartaoS8 } from './sustentacao'

// K-373 (pedido 105, E7.450): o cartão em estado vazio (base.n = 0) mostra a nota de exclusão que a
// métrica já tem no corpo; sem itens de fora, nenhuma nota.
type Dto = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const CASOS: {
  id: string
  cartao: (f: never) => ReactElement
  filtros: unknown
  testid: string
  esvaziar: (x: Dto, fora: number) => void
  texto: RegExp
}[] = [
  {
    id: 'O19',
    cartao: (f) => <CartaoO19 filtros={f} />,
    filtros: FILTROS_FLUXO,
    testid: 'o19-abertos',
    esvaziar: (x, fora) => {
      x.motivos = []
      x.base.n = 0
      x.abertosForaDaSoma = fora
    },
    texto: /2 bloqueios ainda abertos não entram na soma/,
  },
  {
    id: 'E6',
    cartao: (f) => <CartaoE6 filtros={f} />,
    filtros: FILTROS_FLUXO,
    testid: '',
    esvaziar: (x, fora) => {
      x.projetos = []
      x.base.n = 0
      x.semData = fora
    },
    texto: /2 projetos concluídos sem data comprometida registrada ficaram fora desta conta/,
  },
  {
    id: 'S8',
    cartao: (f) => <CartaoS8 filtros={f} />,
    filtros: FILTROS_SUSTENTACAO,
    testid: 's8-nota-vazio',
    esvaziar: (x, fora) => {
      x.base.n = 0
      x.cobertura = { n: 0, total: fora }
      x.semResposta = fora
    },
    texto: /2 incidentes sem resposta no campo/,
  },
  {
    id: 'S11',
    cartao: (f) => <CartaoS11 filtros={f} />,
    filtros: FILTROS_SUSTENTACAO,
    testid: 's11-fora-do-fluxo',
    esvaziar: (x, fora) => {
      x.base.n = 0
      x.semFluxo = fora
    },
    texto: /2 chamados ficaram fora desta métrica/,
  },
  {
    id: 'S5',
    cartao: (f) => <CartaoS5 filtros={f} />,
    filtros: FILTROS_SUSTENTACAO,
    testid: 's5-fora-do-fluxo',
    esvaziar: (x, fora) => {
      x.base.n = 0
      x.foraDoFluxo = fora
    },
    texto: /2 chamados ficaram fora desta métrica/,
  },
  {
    id: 'S6',
    cartao: (f) => <CartaoS6 filtros={f} />,
    filtros: FILTROS_SUSTENTACAO,
    testid: 's6-fora-do-fluxo',
    esvaziar: (x, fora) => {
      x.base.n = 0
      x.foraDoFluxo = fora
    },
    texto: /2 chamados ficaram fora desta métrica/,
  },
  {
    id: 'S7',
    cartao: (f) => <CartaoS7 filtros={f} />,
    filtros: FILTROS_SUSTENTACAO,
    testid: 's7-fora-do-fluxo',
    esvaziar: (x, fora) => {
      x.base.n = 0
      x.foraDoFluxo = fora
    },
    texto: /2 chamados ficaram fora desta métrica/,
  },
  {
    id: 'S1',
    cartao: (f) => <CartaoS1 filtros={f} />,
    filtros: FILTROS_SUSTENTACAO,
    testid: 's1-fora-da-matriz',
    esvaziar: (x, fora) => {
      x.base.n = 0
      x.foraDaMatriz = { outrasEscalas: fora, semPrazo: 0 }
    },
    texto: /Fora da conta: 2 de outras escalas/,
  },
]

async function vazio(caso: (typeof CASOS)[number], fora: number) {
  renderizarCartao(caso.cartao(caso.filtros as never), {
    fonte: new FonteAjustada({ [caso.id]: (x: Dto) => caso.esvaziar(x, fora) }),
  })
  const el = await screen.findByTestId(`metrica-${caso.id}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'vazio'), { timeout: 8000 })
  return el
}

describe('K-373: cartão vazio mostra a nota de exclusão da métrica', () => {
  for (const caso of CASOS) {
    it(`${caso.id}: vazio com itens de fora mostra a nota`, async () => {
      const el = await vazio(caso, 2)
      if (caso.testid) expect(within(el).getByTestId(caso.testid)).toHaveTextContent(caso.texto)
      else expect(el).toHaveTextContent(caso.texto)
    })

    it(`${caso.id}: vazio sem itens de fora não mostra a nota`, async () => {
      const el = await vazio(caso, 0)
      if (caso.testid) expect(within(el).queryByTestId(caso.testid)).toBeNull()
      else expect(el).not.toHaveTextContent(/fora desta conta/)
    })
  }
})
