import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo, TipoCard } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CALENDARIO_PADRAO, instanteDeIso } from '../core/calendario'
import {
  calcularT13,
  EXTENSAO_TAMBEM_BM_VAZIA,
  type ExtensaoTambemBM,
  type VinculoPredecessor,
} from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const t = (iso: string) => instanteDeIso(iso, CALENDARIO_PADRAO)
const ctxDe = (cards: EspecCard[]) => criarContextoBM(umaBase(cards), HOJE_TESTE, CALENDARIO_PADRAO)
const extDe = (vinculos: VinculoPredecessor[]): ExtensaoTambemBM => ({
  ...EXTENSAO_TAMBEM_BM_VAZIA,
  vinculos,
})

/** Entrega em 30/09 10:00, dentro do período (12 semanas até 09/10). O lead time vai de 01/09 até a entrega. */
const entregue = (
  id: string,
  tipo: TipoCard = 'Melhoria',
  extra: Partial<EspecCard> = {},
): EspecCard => ({
  id,
  tipo,
  criado: '2026-09-01T08:00:00-03:00',
  trilha: trilhaSimples(
    '2026-09-01T08:00:00-03:00',
    '2026-09-02T08:00:00-03:00',
    '2026-09-03T08:00:00-03:00',
    '2026-09-30T10:00:00-03:00',
  ),
  ...extra,
})
const vinculo = (card_id: string, extra: Partial<VinculoPredecessor> = {}): VinculoPredecessor => ({
  card_id,
  relacionado_id: `rel-${card_id}`,
  tipo: 'predecessor',
  outro_quadro: true,
  criado_em: t('2026-09-10T09:00:00-03:00'),
  removido_em: null,
  ...extra,
})
const story = (r: ReturnType<typeof calcularT13>) =>
  r.porGranularidade.find((g) => g.granularidade === 'story')
const frente = (r: ReturnType<typeof calcularT13>) =>
  r.porGranularidade.find((g) => g.granularidade === 'frente')

describe("T13: dependências entre quadros (D-14' = A, R-4 = sim)", () => {
  it('sem fonte de vínculos: toda entrega é semDado, nunca "não dependeu"', () => {
    const r = calcularT13(ctxDe([entregue('a'), entregue('b')]), F, undefined)
    expect(story(r)?.semDado).toBe(2)
    expect(story(r)?.entregas).toMatchObject({ k: 0, n: 0 })
    expect(SCHEMAS_RESULTADO.T13.safeParse(r).success).toBe(true)
  })

  it('vínculo de outro quadro vigente antes da entrega conta; o removido antes da entrega também (R-4, CA-40)', () => {
    const cards = ['vigente', 'removido', 'sem-vinculo'].map((id) => entregue(id))
    const r = calcularT13(
      ctxDe(cards),
      F,
      extDe([
        vinculo('vigente'),
        vinculo('removido', { removido_em: t('2026-09-15T09:00:00-03:00') }),
      ]),
    )
    expect(story(r)?.entregas).toEqual({ status: 'insuficiente', k: 2, n: 3, minimo: 20 })
    expect(story(r)?.semDado).toBe(0)
  })

  it('vínculo criado só depois da entrega, de mesmo quadro ou que não é predecessor não conta', () => {
    const cards = ['depois', 'mesmo', 'ok'].map((id) => entregue(id))
    const r = calcularT13(
      ctxDe(cards),
      F,
      extDe([
        vinculo('depois', { criado_em: t('2026-10-05T09:00:00-03:00') }),
        vinculo('mesmo', { outro_quadro: false }),
        vinculo('ok'),
      ]),
    )
    expect(story(r)?.entregas).toMatchObject({ k: 1, n: 3 })
  })

  it('quadro desconhecido vai para semDado; se outro vínculo do mesmo card é de outro quadro, ele depende', () => {
    const cards = ['so-desconhecido', 'desconhecido-e-conhecido', 'limpo'].map((id) => entregue(id))
    const r = calcularT13(
      ctxDe(cards),
      F,
      extDe([
        vinculo('so-desconhecido', { outro_quadro: null }),
        vinculo('desconhecido-e-conhecido', { outro_quadro: null }),
        vinculo('desconhecido-e-conhecido', { relacionado_id: 'outro' }),
      ]),
    )
    expect(story(r)?.semDado).toBe(1)
    expect(story(r)?.entregas).toMatchObject({ k: 1, n: 2 })
  })

  it('fronteira 19/20 da taxa: percentual só com 20 entregas com dado', () => {
    for (const [n, status] of [
      [19, 'insuficiente'],
      [20, 'ok'],
    ] as const) {
      const cards = Array.from({ length: n }, (_, i) => entregue(`c${i}`))
      const r = calcularT13(ctxDe(cards), F, extDe(cards.slice(0, 5).map((c) => vinculo(c.id))))
      expect(story(r)?.entregas.status, `n=${n}`).toBe(status)
      expect(story(r)?.entregas).toMatchObject({ k: 5, n })
    }
  })

  const grupo = (prefixo: string, n: number, tipo: TipoCard, depende: boolean) => {
    const cards = Array.from({ length: n }, (_, i) => entregue(`${prefixo}${i}`, tipo))
    return { cards, vinculos: depende ? cards.map((c) => vinculo(c.id)) : [] }
  }

  it('par com × sem do lead time (T1): só com 20 em cada grupo do mesmo tipo (CA-6); diz qual grupo faltou', () => {
    const com = grupo('c', 20, 'Melhoria', true)
    const sem19 = grupo('s', 19, 'Melhoria', false)
    const r19 = calcularT13(ctxDe([...com.cards, ...sem19.cards]), F, extDe(com.vinculos))
    const c19 = story(r19)?.comparacoes.find((c) => c.tipo === 'Melhoria')
    expect(c19?.grupoAbaixoDoMinimo).toBe('sem')
    expect(c19?.com.status).toBe('ok')
    expect(c19?.sem).toMatchObject({ status: 'insuficiente', n: 19 })
    expect(c19?.sem).not.toHaveProperty('valor')

    const sem20 = grupo('s', 20, 'Melhoria', false)
    const r20 = calcularT13(ctxDe([...com.cards, ...sem20.cards]), F, extDe(com.vinculos))
    const c20 = story(r20)?.comparacoes.find((c) => c.tipo === 'Melhoria')
    expect(c20?.grupoAbaixoDoMinimo).toBeNull()
    expect(c20?.com).toMatchObject({ status: 'ok', n: 20 })
    expect(c20?.sem).toMatchObject({ status: 'ok', n: 20 })
    // lead time ponta a ponta: criado 01/09 08:00 até 30/09 10:00 (20 dias úteis e 2 h, com o feriado de 07/09)
    const v = c20?.com.status === 'ok' ? c20.com.valor : null
    expect(v?.p50).toBeCloseTo(v?.p85 ?? 0, 5)
    expect(v?.p50).toBeCloseTo(20.25, 2)
  })

  it('o par nunca mistura tipos: 20 com em um tipo e 20 sem em outro não formam comparação', () => {
    const com = grupo('c', 20, 'Melhoria', true)
    const sem = grupo('s', 20, 'Requisição', false)
    const r = calcularT13(ctxDe([...com.cards, ...sem.cards]), F, extDe(com.vinculos))
    const porTipo = Object.fromEntries(
      story(r)?.comparacoes.map((c) => [c.tipo, c.grupoAbaixoDoMinimo]) ?? [],
    )
    expect(porTipo).toEqual({ Melhoria: 'sem', Requisição: 'com' })
  })

  it('entrega sem compromisso conta na taxa, mas sem lead time ponta a ponta fica fora do par (T1)', () => {
    const semCompromisso: EspecCard = {
      id: 'sem-comp',
      criado: '2026-09-01T08:00:00-03:00',
      trilha: [
        ['Aguardando priorização', '2026-09-01T08:00:00-03:00'],
        ['Em desenvolvimento', '2026-09-03T08:00:00-03:00'],
        ['Entregue', '2026-09-30T10:00:00-03:00'],
      ],
    }
    const com = grupo('c', 20, 'Melhoria', true)
    const r = calcularT13(
      ctxDe([...com.cards, semCompromisso]),
      F,
      extDe([...com.vinculos, vinculo('sem-comp')]),
    )
    expect(story(r)?.entregas).toMatchObject({ k: 21, n: 21 })
    expect(story(r)?.comparacoes.find((c) => c.tipo === 'Melhoria')?.com).toMatchObject({
      status: 'ok',
      n: 20,
    })
  })

  it('demandas e frentes ficam em blocos separados, nunca somadas (CA-8)', () => {
    const demandas = ['d1', 'd2'].map((id) => entregue(id))
    const frentes = ['f1', 'f2', 'f3'].map((id) => entregue(id, 'Melhoria', { gran: 'frente' }))
    const r = calcularT13(
      ctxDe([...demandas, ...frentes]),
      F,
      extDe([vinculo('d1'), vinculo('f1'), vinculo('f2')]),
    )
    expect(r.porGranularidade.map((g) => g.granularidade)).toEqual(['story', 'frente'])
    expect(story(r)?.entregas).toMatchObject({ k: 1, n: 2 })
    expect(frente(r)?.entregas).toMatchObject({ k: 2, n: 3 })
    expect(r.base).toMatchObject({
      n: 2,
      unidade: 'demandas entregues',
      complemento: { n: 3, unidade: 'frentes entregues' },
    })
  })

  it('só entrega do período entra; o filtro de tipo recorta as demandas', () => {
    const cards = [entregue('a', 'Melhoria'), entregue('b', 'Requisição')]
    const ext = extDe([vinculo('a'), vinculo('b')])
    expect(
      story(calcularT13(ctxDe(cards), { ...F, tipo: ['Melhoria'] }, ext))?.entregas,
    ).toMatchObject({ k: 1, n: 1 })
    const fora = calcularT13(
      ctxDe(cards),
      { ...F, periodo: { tipo: 'custom', de: '2026-10-01', ate: '2026-10-09' } },
      ext,
    )
    expect(story(fora)?.entregas).toMatchObject({ k: 0, n: 0 })
  })

  it('a resposta não traz quadro, equipe, card relacionado nem pessoa: só o booleano agregado', () => {
    const cards = [entregue('a')]
    const r = calcularT13(ctxDe(cards), F, extDe([vinculo('a', { relacionado_id: 'SEGREDO-Q-9' })]))
    const txt = JSON.stringify(r)
    expect(txt).not.toMatch(/SEGREDO|rel-|quadro|equipe|Pessoa/i)
    expect(Object.keys(story(r) ?? {}).sort()).toEqual([
      'comparacoes',
      'entregas',
      'granularidade',
      'semDado',
    ])
  })
})
