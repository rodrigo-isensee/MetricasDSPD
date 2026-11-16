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
    // 105 (E7.102): as seis faixas sempre, na mesma ordem; só a M tem entregas (25 >= 20) e mediana
    expect(melhoria?.porTamanho?.map((x) => x.tamanho)).toEqual(['PP', 'P', 'M', 'G', 'GG', 'XG'])
    expect(melhoria?.porTamanho?.map((x) => x.n)).toEqual([0, 0, 25, 0, 0, 0])
    expect(melhoria?.porTamanho?.map((x) => x.mediana === null)).toEqual([
      true,
      true,
      false,
      true,
      true,
      true,
    ])
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

// Pedido 105 (E7.102): a divisão pelas seis faixas da régua; o tamanho de cada card já vem da régua do time (o projetor), aqui só se divide.
describe('O8 divisão por tamanho: seis faixas da régua (E7.102)', () => {
  const FAIXAS = ['PP', 'P', 'M', 'G', 'GG', 'XG']
  type Faixa = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG' | null
  /** n cards entregues da Melhoria, divididos pelas faixas dadas (`null` = sem tamanho); ids únicos. */
  const ctxComFaixas = (porFaixa: [Faixa, number][]) => {
    const lista = porFaixa.flatMap(([f, n]) =>
      cards(`${f ?? 'S'}-`, n, 'Melhoria').map((c) => ({ c, f })),
    )
    const faixaDe = new Map(lista.map(({ c, f }) => [c.id, f]))
    const b = umaBase(
      lista.map(({ c }) => c),
      [],
    )
    return criarContextoBM(
      {
        ...b,
        cards: b.cards.map((x) => ({ ...x, tamanho_declarado: faixaDe.get(x.card_id) ?? null })),
      },
      HOJE_TESTE,
      CALENDARIO_PADRAO,
    )
  }
  const divisao = (porFaixa: [Faixa, number][]) =>
    calcularO8(ctxComFaixas(porFaixa), F).tipos.find((t) => t.tipo === 'Melhoria')?.porTamanho

  it('as seis faixas saem sempre, na mesma ordem, mesmo as vazias; faixa vazia tem n 0 e mediana nula, nunca 0', () => {
    const d = divisao([['G', 25]])!
    expect(d.map((x) => x.tamanho)).toEqual(FAIXAS)
    expect(d.map((x) => x.n)).toEqual([0, 0, 0, 25, 0, 0])
    for (const v of d.filter((x) => x.n === 0)) expect(v.mediana).toBeNull()
    expect(d.find((x) => x.tamanho === 'G')?.mediana).not.toBeNull()
  })

  it('fronteira do mínimo por faixa: 19 entregas = insuficiente (sem mediana); 20 = publica a mediana', () => {
    const d19 = divisao([
      ['M', 19],
      ['GG', 20],
    ])!
    expect(d19.find((x) => x.tamanho === 'M')).toMatchObject({ n: 19, mediana: null })
    expect(d19.find((x) => x.tamanho === 'GG')).toMatchObject({ n: 20 })
    expect(d19.find((x) => x.tamanho === 'GG')?.mediana).not.toBeNull()
    const d20 = divisao([
      ['M', 20],
      ['GG', 19],
    ])!
    expect(d20.find((x) => x.tamanho === 'M')?.mediana).not.toBeNull()
    expect(d20.find((x) => x.tamanho === 'GG')).toMatchObject({ n: 19, mediana: null })
  })

  it('card sem tamanho (sem size, size fora da régua ou time sem régua) vai para "Sem tamanho", por último e só com entregas; nunca para uma faixa', () => {
    const r = divisao([
      ['P', 20],
      [null, 7],
    ])!
    expect(r.map((x) => x.tamanho)).toEqual([...FAIXAS, 'Sem tamanho'])
    expect(r.find((x) => x.tamanho === 'Sem tamanho')).toMatchObject({ n: 7, mediana: null })
    expect(r.filter((x) => FAIXAS.includes(x.tamanho)).reduce((s, x) => s + x.n, 0)).toBe(20)
    // sem nenhum card sem tamanho, "Sem tamanho" não aparece
    expect(divisao([['P', 20]])!.some((x) => x.tamanho === 'Sem tamanho')).toBe(false)
  })

  it('time sem régua: se nenhum card tem tamanho, a divisão é nula com o motivo (nunca tudo em "Sem tamanho")', () => {
    const r = calcularO8(ctxComFaixas([[null, 25]]), F)
    expect(r.tipos[0]?.porTamanho).toBeNull()
    expect(r.motivoPorTamanho).not.toBeNull()
  })

  it('com a divisão publicada o motivo é nulo; a resposta não traz time nem régua (nenhuma comparação entre times)', () => {
    const r = calcularO8(
      ctxComFaixas([
        ['P', 20],
        ['XG', 20],
      ]),
      F,
    )
    expect(r.motivoPorTamanho).toBeNull()
    const json = JSON.stringify(r)
    expect(json).not.toMatch(/equipe|time_id|regua|Equipe A/i)
    expect(r.tipos[0]?.porTamanho?.map((x) => Object.keys(x).sort())).toSatisfy((ks: string[][]) =>
      ks.every((k) => k.join() === 'mediana,n,tamanho'),
    )
  })

  it('o consolidado soma os cards de todas as faixas em n: a soma das faixas e de "Sem tamanho" é o n do tipo', () => {
    const r = calcularO8(
      ctxComFaixas([
        ['PP', 21],
        ['P', 5],
        ['XG', 30],
        [null, 3],
      ]),
      F,
    )
    const t = r.tipos[0]!
    expect(t.n).toBe(59)
    expect(t.porTamanho?.reduce((s, x) => s + x.n, 0)).toBe(59)
  })
})
