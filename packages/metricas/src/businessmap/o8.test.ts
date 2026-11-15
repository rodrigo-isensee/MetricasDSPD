import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { calcularO8 } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }

const cards = (prefixo: string, n: number, tipo: NonNullable<EspecCard['tipo']>): EspecCard[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `${prefixo}${i}`,
    tipo,
    criado: '2026-09-01T09:00-03:00',
    trilha: [
      ['Aguardando priorização', '2026-09-01T09:00-03:00'],
      ['Pronto para desenvolver', '2026-09-01T10:00-03:00'],
      ['Em desenvolvimento', '2026-09-02T08:00-03:00'],
      ['Entregue', '2026-09-03T12:00-03:00'],
    ],
  }))

describe('O8 divisão por tamanho por tipo (L24 a)', () => {
  const base = umaBase([...cards('M', 25, 'Melhoria'), ...cards('I', 25, 'Incidente')], [])
  const ctx = (comTamanhoEmMelhoria: boolean) =>
    criarContextoBM(
      {
        ...base,
        cards: base.cards.map((c) =>
          comTamanhoEmMelhoria && c.tipo === 'Melhoria'
            ? { ...c, tamanho_declarado: 'M' as const }
            : c,
        ),
      },
      HOJE_TESTE,
      CALENDARIO_PADRAO,
    )

  it('o tipo com tamanho publica a divisão; o tipo sem tamanho fica nulo, nunca tudo em "Sem tamanho"', () => {
    const r = calcularO8(ctx(true), F)
    const melhoria = r.tipos.find((t) => t.tipo === 'Melhoria')
    const incidente = r.tipos.find((t) => t.tipo === 'Incidente')
    expect(melhoria?.n).toBe(25)
    expect(incidente?.n).toBe(25)
    expect(melhoria?.porTamanho?.map((x) => x.tamanho)).toEqual(['M'])
    expect(incidente?.porTamanho).toBeNull()
    expect(r.motivoPorTamanho).toBeNull()
  })

  it('sem tamanho em nenhum tipo, todos ficam nulos e o motivo sai', () => {
    const r = calcularO8(ctx(false), F)
    expect(r.tipos.every((t) => t.porTamanho === null)).toBe(true)
    expect(r.motivoPorTamanho).not.toBeNull()
  })

  it('tipo com tamanho só em card fora da janela fica nulo, nunca tudo em "Sem tamanho" (A2)', () => {
    const antigo: EspecCard[] = [
      {
        id: 'ANTIGO',
        tipo: 'Melhoria',
        criado: '2025-01-02T09:00-03:00',
        trilha: [
          ['Aguardando priorização', '2025-01-02T09:00-03:00'],
          ['Em desenvolvimento', '2025-01-03T08:00-03:00'],
          ['Entregue', '2025-01-06T12:00-03:00'],
        ],
      },
    ]
    const b = umaBase([...antigo, ...cards('M', 25, 'Melhoria')], [])
    const c = criarContextoBM(
      {
        ...b,
        cards: b.cards.map((x) =>
          x.card_id === 'ANTIGO' ? { ...x, tamanho_declarado: 'G' as const } : x,
        ),
      },
      HOJE_TESTE,
      CALENDARIO_PADRAO,
    )
    const r = calcularO8(c, F)
    const melhoria = r.tipos.find((t) => t.tipo === 'Melhoria')
    expect(melhoria?.n).toBe(25)
    expect(melhoria?.porTamanho).toBeNull()
    expect(r.motivoPorTamanho).not.toBeNull()
  })
})
