import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { calcularO1 } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase } from './testing'
import type { BaseBM } from './modelo'

// H-12 (plano 052, F6): o limite do O1 vem do `limite_wip` de cada coluna do quadro; limite 0 = sem limite (WIP sem aderência).
const F: FiltrosFluxo = { equipe: ['equipe-a'], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const trilha = trilhaSimples(
  '2026-09-01T09:00-03:00',
  '2026-09-01T10:00-03:00',
  '2026-09-02T08:00-03:00',
  '2026-09-30T17:00-03:00',
).slice(0, 3)

function base(limiteFluxo: Record<string, number>, colunasDoTime: boolean): BaseBM {
  const b = umaBase([{ id: 'W1', criado: '2026-09-01T09:00-03:00', trilha }])
  return {
    ...b,
    config: {
      ...b.config,
      limite_wip_fluxo: limiteFluxo,
      ...(colunasDoTime ? { limite_wip_por_coluna: true } : {}),
    },
    // base real: o quadro não segue `quadro-<slug>`; a coluna diz o time do workflow dela
    colunas: colunasDoTime
      ? b.colunas.map((c) => ({
          ...c,
          quadro_id: '35',
          equipe: 'Equipe A',
          limite_wip: c.coluna === 'Em desenvolvimento' ? 3 : null,
        }))
      : b.colunas,
  }
}

describe('O1 contra o limite da coluna (H-12)', () => {
  it('coluna de time na base real: o detalhe por coluna usa o time e o limite_wip da coluna', () => {
    const b = base({ 'Equipe A': 3 }, true)
    b.cards[0]!.quadro_id = '35'
    const r = calcularO1(criarContextoBM(b, HOJE_TESTE, CALENDARIO_PADRAO), F)
    expect(r.porColuna?.find((c) => c.coluna === 'Em desenvolvimento')).toMatchObject({
      itens: 1,
      limite: 3,
    })
    expect(r.hoje).toMatchObject({ total: 1, limite: 3, acimaDoLimite: 0 })
  })

  it('base semeada: sem `equipe` na coluna vale o quadro `quadro-<slug>` (comportamento anterior)', () => {
    const b = base({ 'Equipe A': 5 }, false)
    const r = calcularO1(criarContextoBM(b, HOJE_TESTE, CALENDARIO_PADRAO), F)
    expect(r.porColuna).toEqual([]) // o quadro de teste não é `quadro-equipe-a`: nenhuma coluna casa
  })

  it('sem limite (0): o WIP aparece, nada fica acima do limite e a taxa de aderência não é publicada', () => {
    const b = base({}, true)
    b.cards[0]!.quadro_id = '35'
    const r = calcularO1(criarContextoBM(b, HOJE_TESTE, CALENDARIO_PADRAO), F)
    expect(r.hoje).toMatchObject({ total: 1, limite: 0, acimaDoLimite: 0 })
    expect(r.serie.every((s) => !s.acimaDoLimite)).toBe(true)
    expect(r.diasDentroDoLimite.status).toBe('insuficiente')
    expect(r.statusMeta).toBe('sem-referencia')
  })

  it('base semeada com limite 0 mantém a regra anterior (tudo acima do limite)', () => {
    const r = calcularO1(criarContextoBM(base({}, false), HOJE_TESTE, CALENDARIO_PADRAO), {
      ...F,
      equipe: [],
    })
    expect(r.hoje).toMatchObject({ total: 1, limite: 0, acimaDoLimite: 1 })
  })

  it('acima do limite configurado continua contando', () => {
    const b = base({ 'Equipe A': 1 }, true)
    b.cards[0]!.quadro_id = '35'
    const r = calcularO1(
      criarContextoBM(
        {
          ...b,
          cards: [...b.cards, { ...b.cards[0]!, card_id: 'W2' }],
          transicoes: [...b.transicoes, ...b.transicoes.map((t) => ({ ...t, card_id: 'W2' }))],
        },
        HOJE_TESTE,
        CALENDARIO_PADRAO,
      ),
      F,
    )
    expect(r.hoje.acimaDoLimite).toBe(1)
    expect(r.serie.some((s) => s.acimaDoLimite)).toBe(true)
  })
})
