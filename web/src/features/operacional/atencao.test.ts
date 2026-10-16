import { describe, expect, it } from 'vitest'
import {
  contarAvaliadasS1,
  contarAvaliadasS2,
  contarForaS1,
  contarForaS2,
  itensDiaria,
  itensSemanal,
  itensSustentacao,
} from './atencao'

const cel = (ok: boolean, meta: 'dentro' | 'fora' | 'sem-referencia') => ({
  taxa: ok
    ? { status: 'ok' as const, k: 20, n: 25, pct: 80 }
    : { status: 'insuficiente' as const, k: 1, n: 5, minimo: 20 as const },
  statusMeta: meta,
})
const s2 = (...ps: [boolean, 'dentro' | 'fora' | 'sem-referencia'][]) =>
  ({
    prioridades: ps.map(([ok, meta], i) => ({
      prioridade: `P${i + 1}`,
      primeiroAtendimento: cel(ok, 'dentro'),
      restauracao: cel(ok, meta),
    })),
  }) as never
const s1 = (...ps: ['dentro' | 'fora' | 'sem-referencia', boolean][]) =>
  ({
    prioridades: ps.map(([meta, ok], i) => ({
      prioridade: `P${i + 1}`,
      restauracao: {
        statusMeta: meta,
        estatistica: ok ? { status: 'ok' } : { status: 'insuficiente' },
      },
    })),
  }) as never

describe('atencao.ts: Diária', () => {
  it('sem dados, nada', () => expect(itensDiaria(undefined, undefined, undefined)).toEqual([]))
  it('O2 acima do P95, bloqueados e WIP acima do limite, com o plural certo', () => {
    const itens = itensDiaria(
      { acimaP95: 1 } as never,
      { itens: [1, 2] } as never,
      { hoje: { acimaDoLimite: 3 } } as never,
    )
    expect(itens.map((i) => [i.id, i.para, i.texto])).toEqual([
      ['o2', '#o2', '1 item acima do P95'],
      ['bloqueados', '#bloqueados', '2 bloqueados'],
      ['o1', '#o1', 'WIP 3 acima do limite'],
    ])
    expect(itensDiaria({ acimaP95: 4 } as never, undefined, undefined)[0]?.texto).toBe(
      '4 itens acima do P95',
    )
    expect(
      itensDiaria(
        { acimaP95: 0 } as never,
        { itens: [] } as never,
        { hoje: { acimaDoLimite: 0 } } as never,
      ),
    ).toEqual([])
  })
})

describe('atencao.ts: Semanal', () => {
  it('sem dados, nada', () => expect(itensSemanal(undefined, undefined, undefined)).toEqual([]))
  it('P85 que subiu por tipo, backlog parado e vencidos por causa interna', () => {
    const o3 = {
      classes: [
        { tipo: 'Melhoria', variacaoP85: { status: 'ok', variacaoPct: 12.4 } },
        { tipo: 'Bug', variacaoP85: { status: 'ok', variacaoPct: -3 } },
        { tipo: 'X', variacaoP85: { status: 'indisponivel', variacaoPct: null } },
        { tipo: 'Y', variacaoP85: { status: 'ok', variacaoPct: null } },
      ],
    } as never
    const itens = itensSemanal(
      o3,
      { acimaDe180: { time: 1 } } as never,
      { vencidosCausaInterna: 2 } as never,
    )
    expect(itens.map((i) => i.texto)).toEqual([
      'P85 do tempo de ciclo subiu: Melhoria (+12%)',
      '1 item do backlog com mais de 180 dias',
      '2 vencidos por causa interna',
    ])
    expect(
      itensSemanal(
        undefined,
        { acimaDe180: { time: 5 } } as never,
        { vencidosCausaInterna: 1 } as never,
      ).map((i) => i.texto),
    ).toEqual(['5 itens do backlog com mais de 180 dias', '1 vencido por causa interna'])
  })
})

describe('atencao.ts: Sustentação e contagens', () => {
  it('sem dados as contagens são zero', () => {
    expect(contarForaS2(undefined)).toBe(0)
    expect(contarAvaliadasS2(undefined)).toBe(0)
    expect(contarForaS1(undefined)).toBe(0)
    expect(contarAvaliadasS1(undefined)).toBe(0)
    expect(itensSustentacao(undefined, undefined)).toEqual([])
  })
  it('conta prioridades fora (S2: qualquer das duas células) e avaliadas (taxa publicada)', () => {
    const d = s2([true, 'fora'], [true, 'dentro'], [false, 'sem-referencia'], [true, 'fora'])
    expect(contarForaS2((d as { prioridades: never }).prioridades)).toBe(2)
    expect(contarAvaliadasS2((d as { prioridades: never }).prioridades)).toBe(3)
    const primeiro = {
      prioridades: [
        {
          prioridade: 'P1',
          primeiroAtendimento: cel(true, 'fora'),
          restauracao: cel(false, 'sem-referencia'),
        },
      ],
    }
    expect(contarForaS2(primeiro.prioridades as never)).toBe(1)
    expect(contarAvaliadasS2(primeiro.prioridades as never)).toBe(1)
  })
  it('S1: fora do alvo e com mediana publicada', () => {
    const d = s1(['fora', true], ['dentro', true], ['sem-referencia', false])
    expect(contarForaS1((d as { prioridades: never }).prioridades)).toBe(1)
    expect(contarAvaliadasS1((d as { prioridades: never }).prioridades)).toBe(2)
  })
  it('itens "Pede atenção" da Sustentação, com o singular e o plural', () => {
    const a = itensSustentacao(s2([true, 'fora']), s1(['fora', true], ['fora', true]))
    expect(a.map((i) => [i.id, i.para, i.texto])).toEqual([
      ['s2', '#s2', 'Aderência ao SLA abaixo de 90% em 1 prioridade'],
      ['s1', '#s1', 'Mediana acima do alvo em 2 prioridades'],
    ])
    expect(itensSustentacao(s2([true, 'dentro']), s1(['dentro', true]))).toEqual([])
  })
})
