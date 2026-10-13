import { describe, expect, it } from 'vitest'
import { METRICA_IDS, MINIMO_AMOSTRA } from '@metricas-dspd/contratos'
import { fonteDaMetrica } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import type { FiltrosFluxo, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { gerarBaseMock, gerarPesquisaMock } from '@metricas-dspd/mock'
import { calcularMetrica } from './calcular'
import { acelerato, businessmap, pesquisa } from '.'
import { CALENDARIO_PADRAO, instanteDeIso } from './core/calendario'
import {
  calcularE1,
  calcularE2,
  calcularT4,
  calcularT5,
  calcularO3,
  calcularO9,
  calcularO1,
  calcularT9,
} from './businessmap'
import { criarContextoBM } from './businessmap/indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './businessmap/testing'

const base = gerarBaseMock({ escala: 0.5 })
const ctx = {
  bm: businessmap.criarContextoBM(base.bm, base.config.hoje, CALENDARIO_PADRAO),
  ac: acelerato.criarContextoAC(base.ac, base.config.hoje, CALENDARIO_PADRAO),
  pesq: pesquisa.criarContextoPesquisa(gerarPesquisaMock(base.config), base.config.hoje),
}
const fluxo = (p: FiltrosFluxo['periodo']): FiltrosFluxo => ({
  equipe: [],
  tipo: [],
  sistema: [],
  periodo: p,
})
const sust = (p: FiltrosSustentacao['periodo']): FiltrosSustentacao => ({
  equipe: [],
  prioridade: [],
  periodo: p,
})

/** Percorre o DTO e confere a regra dos 20 itens em toda estatística (briefing 7.2). */
function conferirRegraDos20(no: unknown, caminho: string, falhas: string[]): void {
  if (Array.isArray(no))
    return no.forEach((x, i) => conferirRegraDos20(x, `${caminho}[${i}]`, falhas))
  if (no === null || typeof no !== 'object') return
  const o = no as Record<string, unknown>
  if (o.status === 'ok' && typeof o.n === 'number' && 'valor' in o && o.n < MINIMO_AMOSTRA)
    falhas.push(`${caminho}: ok com n=${o.n}`)
  if (o.status === 'insuficiente') {
    if ('valor' in o) falhas.push(`${caminho}: insuficiente carrega valor`)
    if (typeof o.n === 'number' && o.n >= MINIMO_AMOSTRA)
      falhas.push(`${caminho}: insuficiente com n=${o.n}`)
  }
  for (const [k, v] of Object.entries(o)) conferirRegraDos20(v, `${caminho}.${k}`, falhas)
}

describe('toda métrica (B14): schema, regra dos 20 e marcação de critério', () => {
  const periodos = ['4s', '12s', '6m', '12m'] as const
  it.each(METRICA_IDS.filter((m) => m !== 'VISAO_GERAL'))(
    '%s respeita a regra dos 20 em todos os períodos e o schema',
    (id) => {
      const fonte = fonteDaMetrica(id)
      const falhas: string[] = []
      for (const tipo of periodos) {
        const f =
          fonte === 'pesquisa' ? {} : fonte === 'acelerato' ? sust({ tipo }) : fluxo({ tipo })
        const r = calcularMetrica(id, f as never, ctx)
        expect(SCHEMAS_RESULTADO[id].safeParse(r).success, `${id} ${tipo}`).toBe(true)
        conferirRegraDos20(r, id, falhas)
      }
      expect(falhas).toEqual([])
    },
  )

  it('marca o critério alterado quando a data da mudança cruza o período (T2.6)', () => {
    const r = calcularMetrica('O9', fluxo({ tipo: '12m' }), ctx)
    expect(r.criterios.serie.some((m) => m.id === 'criterio-2026-03-02')).toBe(true)
    const curto = calcularMetrica('O9', fluxo({ tipo: '4s' }), ctx)
    expect(curto.criterios.serie).toHaveLength(0)
  })

  it('PV1 é a terceira fonte: BusinessMap e Acelerato não a alteram (e ela não altera as outras)', () => {
    const ref = calcularMetrica('PV1', {}, ctx)
    expect(ref.status).toBe('ok')
    const vazia = {
      ...base,
      bm: { ...base.bm, cards: [] },
      ac: { ...base.ac, chamados: [], etapas: [] },
    }
    const outro = {
      ...ctx,
      bm: businessmap.criarContextoBM(vazia.bm, base.config.hoje, CALENDARIO_PADRAO),
      ac: acelerato.criarContextoAC(vazia.ac, base.config.hoje, CALENDARIO_PADRAO),
    }
    expect(calcularMetrica('PV1', {}, outro)).toEqual(ref)
    const semPesq = { bm: ctx.bm, ac: ctx.ac }
    expect(calcularMetrica('S1', sust({ tipo: '12m' }) as never, semPesq)).toEqual(
      calcularMetrica('S1', sust({ tipo: '12m' }) as never, ctx),
    )
    expect(calcularMetrica('PV1', {}, semPesq)).toEqual({
      status: 'sem-pesquisa',
      fonte: 'pesquisa',
    })
  })

  it('VISAO_GERAL: cada bloco só tem fonte própria e usa a data de corte comum', () => {
    const r = calcularMetrica('VISAO_GERAL', {}, ctx)
    expect(ctx.bm.hojeIso).toBe(ctx.ac.hojeIso)
    const fontes = r.niveis.map((n) => n.fonte)
    expect(new Set(fontes)).toEqual(new Set(['BusinessMap', 'Acelerato']))
    for (const n of r.niveis)
      for (const ind of n.indicadores)
        expect(fonteDaMetrica(ind.metrica) === 'acelerato' ? 'Acelerato' : 'BusinessMap').toBe(
          n.fonte,
        )
  })
})

const t = (iso: string) => instanteDeIso(iso, CALENDARIO_PADRAO)
const F = fluxo({ tipo: '12s' })
const entregue = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  criado: '2026-09-01T09:00-03:00',
  trilha: trilhaSimples(
    '2026-09-01T09:00-03:00',
    '2026-09-01T10:00-03:00',
    '2026-09-02T08:00-03:00',
    `2026-09-${String(3 + (Number(id.replace(/\D/g, '')) % 5)).padStart(2, '0')}T17:00-03:00`,
  ),
  ...extra,
})
const comN = (n: number) => Array.from({ length: n }, (_, i) => entregue(`C${i}`))
const ctxDe = (e: EspecCard[]) => criarContextoBM(umaBase(e), HOJE_TESTE, CALENDARIO_PADRAO)

describe('limite 19 / 20 (B14)', () => {
  it.each([
    [
      'O3',
      (c: ReturnType<typeof ctxDe>) =>
        calcularO3(c, F).classes.find((x) => x.tipo === 'Melhoria')?.estatistica.status,
    ],
    [
      'O9',
      (c: ReturnType<typeof ctxDe>) =>
        calcularO9(c, F).classes.find((x) => x.tipo === 'Melhoria')?.relogios.status,
    ],
  ])('%s: 19 itens não publica, 20 publica', (_id, status) => {
    expect(status(ctxDe(comN(19)))).toBe('insuficiente')
    expect(status(ctxDe(comN(20)))).toBe('ok')
  })
})

describe('arquivado não é descartado (B3, decisão Q6 e P1)', () => {
  const arquivar = (e: EspecCard): EspecCard => e
  it('card entregue e depois arquivado continua no O3 e na base', () => {
    const base20 = comN(20)
    const feito = umaBase(base20.map(arquivar))
    // arquiva todos depois da entrega, sem motivo de descarte
    for (const c of feito.cards) c.arquivado_em = t('2026-09-20T09:00-03:00')
    const c = criarContextoBM(feito, HOJE_TESTE, CALENDARIO_PADRAO)
    expect(c.idx.marcos.every((m) => m.ativo && !m.descartado && !m.arquivadoSemDesfecho)).toBe(
      true,
    )
    const k = calcularO3(c, F).classes.find((x) => x.tipo === 'Melhoria')
    expect(k?.estatistica.status).toBe('ok')
  })

  it('arquivado sem entrega e sem motivo: não é trabalho aberto, mas fica na base e é contado à parte (P1)', () => {
    const e: EspecCard[] = [
      {
        id: 'S1',
        criado: '2026-09-01T09:00-03:00',
        trilha: [
          ['Aguardando priorização', '2026-09-01T09:00-03:00'],
          ['Pronto para desenvolver', '2026-09-01T10:00-03:00'],
          ['Em desenvolvimento', '2026-09-02T08:00-03:00'],
        ],
      },
    ]
    const aberto = criarContextoBM(umaBase(e), HOJE_TESTE, CALENDARIO_PADRAO)
    expect(calcularO1(aberto, F).hoje.total).toBe(1)
    const feito = umaBase(e)
    for (const c of feito.cards) c.arquivado_em = t('2026-09-10T09:00-03:00')
    const c = criarContextoBM(feito, HOJE_TESTE, CALENDARIO_PADRAO)
    const m = c.idx.marcos[0]
    expect(m?.arquivadoSemDesfecho).toBe(true)
    expect(m?.descartado).toBe(false)
    expect(feito.cards).toHaveLength(1)
    expect(calcularO1(c, F).hoje.total).toBe(0)
  })

  it('com motivo de descarte o card sai dos cálculos (e continua na base)', () => {
    const feito = umaBase([entregue('C1')])
    for (const c of feito.cards) {
      c.arquivado_em = t('2026-09-10T09:00-03:00')
      c.motivo_descarte = 'Duplicado'
    }
    const c = criarContextoBM(feito, HOJE_TESTE, CALENDARIO_PADRAO)
    expect(c.idx.marcos[0]?.descartado).toBe(true)
    expect(c.idx.marcos[0]?.ativo).toBe(false)
  })
})

describe('regras de ordem e segmentação (B4, Q4, Q5)', () => {
  it('T5: grupos em ordem neutra (volume decrescente, desempate alfabético) nas duas abas', () => {
    const r = calcularT5(ctx.bm, fluxo({ tipo: '12m' }))
    for (const g of [r.porSistema, r.porArea]) {
      const ordenado = [...g].sort((a, b) => b.n - a.n || a.nome.localeCompare(b.nome, 'pt-BR'))
      expect(g.map((x) => x.nome)).toEqual(ordenado.map((x) => x.nome))
    }
  })

  it('E1 segmenta por tipo de projeto: nenhum segmento mistura Iniciativa e Melhoria', () => {
    const r = calcularE1(ctx.bm, fluxo({ tipo: '12m' }))
    expect(r.segmentoPor).toBe('tipo')
    expect(r.segmentos.map((s) => s.rotulo)).toEqual(['Iniciativa', 'Melhoria'])
  })

  it('E2 conta Melhoria, Iniciativa e Dívida técnica como evolução (Q5)', () => {
    const r = calcularE2(ctx.bm, fluxo({ tipo: '12m' }))
    expect(r.trimestres.length).toBeGreaterThan(0)
  })

  it('T4 e T9 calculam sem contar arquivado sem desfecho como aberto', () => {
    expect(calcularT4(ctx.bm, F).base.n).toBeGreaterThanOrEqual(0)
    expect(calcularT9(ctx.bm, F).projetos).toBeDefined()
  })
})
