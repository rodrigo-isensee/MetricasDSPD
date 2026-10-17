import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo, TipoCard } from '@metricas-dspd/contratos'
import { FAIXAS_PASSAGENS } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { calcularO26, EXTENSAO_TAMBEM_BM_VAZIA, type ExtensaoTambemBM } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const ctxDe = (cards: EspecCard[]) => criarContextoBM(umaBase(cards), HOJE_TESTE, CALENDARIO_PADRAO)
const extDe = (passagens: Record<string, number>): ExtensaoTambemBM => ({
  ...EXTENSAO_TAMBEM_BM_VAZIA,
  passagens,
})
/** Entrega `du` dias úteis depois do início (02/09 08:00; 07/09 é feriado). */
const ENTREGA_EM_DU: Record<number, string> = {
  1: '2026-09-03T08:00:00-03:00',
  2: '2026-09-04T08:00:00-03:00',
  3: '2026-09-08T08:00:00-03:00',
  4: '2026-09-09T08:00:00-03:00',
  5: '2026-09-10T08:00:00-03:00',
}
const entregue = (id: string, tipo: TipoCard, du: number): EspecCard => ({
  id,
  tipo,
  criado: '2026-09-01T08:00:00-03:00',
  trilha: trilhaSimples(
    '2026-09-01T08:00:00-03:00',
    '2026-09-01T09:00:00-03:00',
    '2026-09-02T08:00:00-03:00',
    ENTREGA_EM_DU[du] as string,
  ),
})
/** `n` entregas do tipo, todas com `passagens` passagens e ciclo de `du` dias úteis; devolve cards e o mapa. */
const grupo = (prefixo: string, n: number, tipo: TipoCard, passagens: number, du: number) => {
  const cards = Array.from({ length: n }, (_, i) => entregue(`${prefixo}-${i}`, tipo, du))
  return { cards, mapa: Object.fromEntries(cards.map((c) => [c.id, passagens])) }
}
const bloco = (r: ReturnType<typeof calcularO26>, tipo: TipoCard) =>
  r.porTipo.find((x) => x.tipo === tipo)
const faixa = (
  r: ReturnType<typeof calcularO26>,
  tipo: TipoCard,
  f: (typeof FAIXAS_PASSAGENS)[number],
) => bloco(r, tipo)?.faixas.find((x) => x.faixa === f)

describe("O26: passagens de mão (D-5' = B, Q-a = 1 passagem, Q-b = conta)", () => {
  it('sem extensão: toda entrega vai para semDado, nunca para "0 passagens"', () => {
    const r = calcularO26(
      ctxDe([entregue('a', 'Melhoria', 2), entregue('b', 'Melhoria', 2)]),
      F,
      undefined,
    )
    expect(bloco(r, 'Melhoria')).toMatchObject({ entregas: 0, semDado: 2 })
    expect(bloco(r, 'Melhoria')?.faixas.every((f) => f.itens === 0)).toBe(true)
    expect(SCHEMAS_RESULTADO.O26.safeParse(r).success).toBe(true)
  })

  it('faixas 0, 1, 2, 3 e 4 ou mais: 4, 5 e 6 passagens caem juntas em "4+"', () => {
    const gs = [0, 1, 2, 3, 4, 5, 6].map((p) => grupo(`p${p}`, 3, 'Melhoria', p, 2))
    const r = calcularO26(
      ctxDe(gs.flatMap((g) => g.cards)),
      F,
      extDe(Object.assign({}, ...gs.map((g) => g.mapa))),
    )
    expect(bloco(r, 'Melhoria')?.faixas.map((f) => [f.faixa, f.itens])).toEqual([
      ['0', 3],
      ['1', 3],
      ['2', 3],
      ['3', 3],
      ['4+', 9],
    ])
    expect(bloco(r, 'Melhoria')).toMatchObject({ entregas: 21, semDado: 0 })
  })

  it('o histograma (contagem) sai sempre; percentual e P85 só com 20 ou mais', () => {
    const pequeno = grupo('a', 19, 'Melhoria', 1, 2)
    const r = calcularO26(ctxDe(pequeno.cards), F, extDe(pequeno.mapa))
    const f1 = faixa(r, 'Melhoria', '1')
    expect(f1?.itens).toBe(19)
    expect(f1?.pct).toEqual({ status: 'insuficiente', k: 19, n: 19, minimo: 20 })
    expect(f1?.cicloP85).toMatchObject({ status: 'insuficiente', n: 19 })
    expect(f1?.cicloP85).not.toHaveProperty('valor')

    const exato = grupo('b', 20, 'Melhoria', 1, 2)
    const r20 = calcularO26(ctxDe(exato.cards), F, extDe(exato.mapa))
    const g1 = faixa(r20, 'Melhoria', '1')
    expect(g1?.pct).toEqual({ status: 'ok', k: 20, n: 20, pct: 100 })
    expect(g1?.cicloP85).toMatchObject({ status: 'ok', n: 20, valor: { p85: 2 } })
  })

  it('o P85 do ciclo é por faixa: o ciclo de cada faixa não se mistura com o das outras', () => {
    const lento = grupo('lento', 25, 'Melhoria', 3, 5)
    const rapido = grupo('rapido', 25, 'Melhoria', 0, 1)
    const r = calcularO26(
      ctxDe([...lento.cards, ...rapido.cards]),
      F,
      extDe({ ...lento.mapa, ...rapido.mapa }),
    )
    const v = (f: (typeof FAIXAS_PASSAGENS)[number]) => {
      const x = faixa(r, 'Melhoria', f)?.cicloP85
      return x?.status === 'ok' ? x.valor.p85 : null
    }
    expect(v('3')).toBe(5)
    expect(v('0')).toBe(1)
    expect(v('2')).toBeNull()
  })

  it('o percentual usa só as entregas com dado; passagens ausente, negativa ou fracionária é "sem dado"', () => {
    const g = grupo('a', 20, 'Melhoria', 2, 2)
    const sem = [
      entregue('sem1', 'Melhoria', 2),
      entregue('neg', 'Melhoria', 2),
      entregue('frac', 'Melhoria', 2),
    ]
    const r = calcularO26(ctxDe([...g.cards, ...sem]), F, extDe({ ...g.mapa, neg: -1, frac: 1.5 }))
    expect(bloco(r, 'Melhoria')).toMatchObject({ entregas: 20, semDado: 3 })
    expect(faixa(r, 'Melhoria', '2')?.pct).toEqual({ status: 'ok', k: 20, n: 20, pct: 100 })
    expect(r.base.n).toBe(23)
  })

  it('um bloco por tipo (regra 7): 20 em um tipo não destrava o outro', () => {
    const a = grupo('a', 20, 'Requisição', 1, 2)
    const b = grupo('b', 19, 'Melhoria', 1, 2)
    const r = calcularO26(ctxDe([...a.cards, ...b.cards]), F, extDe({ ...a.mapa, ...b.mapa }))
    expect(faixa(r, 'Requisição', '1')?.pct.status).toBe('ok')
    expect(faixa(r, 'Melhoria', '1')?.pct.status).toBe('insuficiente')
    expect(r.segmentoPor).toBe('tipo')
  })

  it('só entra entrega do período; o filtro de tipo recorta; bug interno fica fora', () => {
    const a = grupo('a', 3, 'Requisição', 1, 2)
    const b = grupo('b', 3, 'Melhoria', 1, 2)
    const bug = grupo('c', 3, 'Bug interno', 1, 2)
    const todos = [...a.cards, ...b.cards, ...bug.cards]
    const ext = extDe({ ...a.mapa, ...b.mapa, ...bug.mapa })
    expect(calcularO26(ctxDe(todos), F, ext).porTipo.map((x) => x.tipo)).toEqual([
      'Requisição',
      'Melhoria',
    ])
    expect(
      calcularO26(ctxDe(todos), { ...F, tipo: ['Melhoria'] }, ext).porTipo.map((x) => x.tipo),
    ).toEqual(['Melhoria'])
    expect(
      calcularO26(
        ctxDe(todos),
        { ...F, periodo: { tipo: 'custom', de: '2026-10-01', ate: '2026-10-09' } },
        ext,
      ).porTipo,
    ).toEqual([])
  })

  it('o resultado traz só inteiros e tempos: nenhum campo de pessoa', () => {
    const g = grupo('a', 20, 'Melhoria', 2, 2)
    const r = calcularO26(ctxDe(g.cards), F, extDe(g.mapa))
    expect(JSON.stringify(r)).not.toMatch(/Pessoa|responsave|usuario|owner/i)
    expect(Object.keys(bloco(r, 'Melhoria') ?? {}).sort()).toEqual([
      'entregas',
      'faixas',
      'semDado',
      'tipo',
    ])
  })
})
