import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo, TipoCard } from '@metricas-dspd/contratos'
import { FAIXAS_PRIMEIRO_TOQUE } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CALENDARIO_PADRAO, instanteDeIso } from '../core/calendario'
import { calcularO22, EXTENSAO_TAMBEM_BM_VAZIA, type ExtensaoTambemBM } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const t = (iso: string) => instanteDeIso(iso, CALENDARIO_PADRAO)
const ctxDe = (cards: EspecCard[]) => criarContextoBM(umaBase(cards), HOJE_TESTE, CALENDARIO_PADRAO)
const extDe = (primeiroToque: Record<string, number | null>): ExtensaoTambemBM => ({
  ...EXTENSAO_TAMBEM_BM_VAZIA,
  primeiroToque,
})

/** Criado na terça 01/09 às 08:00 (início do expediente); expediente 8-12 e 13-17 (8 h = 1 dia útil). */
const CRIADO = '2026-09-01T08:00:00-03:00'
/** Instante do toque `horas` horas úteis depois das 08:00 da terça 01/09 (turnos 8-12 e 13-17, dias úteis seguintes). */
const TOQUES_EM_HORAS: Record<number, string> = {
  2: '2026-09-01T10:00:00-03:00', // 0,25 du
  4: '2026-09-01T12:00:00-03:00', // 0,5 du (limite: entra na faixa 0,5–1)
  6: '2026-09-01T15:00:00-03:00', // 0,75 du
  8: '2026-09-02T08:00:00-03:00', // 1 du (limite: 1–2)
  12: '2026-09-02T12:00:00-03:00', // 1,5 du
  16: '2026-09-03T08:00:00-03:00', // 2 du (limite: 2–5)
  24: '2026-09-04T08:00:00-03:00', // 3 du
  40: '2026-09-09T08:00:00-03:00', // 5 du (limite: 5–10); 07/09 é feriado
  56: '2026-09-11T08:00:00-03:00', // 7 du
  80: '2026-09-16T08:00:00-03:00', // 10 du (limite: 10+)
  96: '2026-09-18T08:00:00-03:00', // 12 du
}

const pedido = (id: string, tipo: TipoCard, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  tipo,
  criado: CRIADO,
  trilha: trilhaSimples(
    CRIADO,
    '2026-09-02T08:00:00-03:00',
    '2026-09-03T08:00:00-03:00',
    '2026-09-30T10:00:00-03:00',
  ),
  ...extra,
})
const aberto = (
  id: string,
  tipo: TipoCard,
  criado: string,
  extra: Partial<EspecCard> = {},
): EspecCard => ({
  id,
  tipo,
  criado,
  trilha: [['Aguardando priorização', criado]],
  ...extra,
})
/** n pedidos do tipo, o toque de cada um `horas[i % horas.length]` horas úteis depois da criação. */
const tocados = (n: number, tipo: TipoCard, horas: number[], prefixo = tipo) => {
  const cards = Array.from({ length: n }, (_, i) => pedido(`${prefixo}-${i}`, tipo))
  const toques = Object.fromEntries(
    cards.map((c, i) => [c.id, t(TOQUES_EM_HORAS[horas[i % horas.length] as number] as string)]),
  )
  return { cards, toques }
}
const doTipo = (r: ReturnType<typeof calcularO22>, tipo: TipoCard) =>
  r.porTipo.find((x) => x.tipo === tipo)

describe("O22: primeiro toque (D-9', CA-43)", () => {
  it('sem extensão (ou sem o campo do card): vazio, no schema, nunca erro', () => {
    const ctx = ctxDe([pedido('a', 'Requisição')])
    for (const ext of [undefined, EXTENSAO_TAMBEM_BM_VAZIA]) {
      const r = calcularO22(ctx, F, ext)
      expect(r.porTipo).toEqual([])
      expect(r.base.n).toBe(0)
      expect(SCHEMAS_RESULTADO.O22.safeParse(r).success).toBe(true)
    }
  })

  it('P50/P85/P95 em dias úteis e histograma nas faixas fixas, com os limites inclusivos à esquerda', () => {
    const { cards, toques } = tocados(22, 'Requisição', [2, 4, 6, 8, 12, 16, 24, 40, 56, 80, 96])
    const r = calcularO22(ctxDe(cards), F, extDe(toques))
    const b = doTipo(r, 'Requisição')
    expect(b?.distribuicao.status).toBe('ok')
    // 11 valores, cada um duas vezes: 0,25 0,5 0,75 1 1,5 2 3 5 7 10 12 (du); percentil tipo 7 sobre os 22
    expect(b?.histograma?.map((x) => x.faixa)).toEqual([...FAIXAS_PRIMEIRO_TOQUE])
    expect(b?.histograma?.map((x) => x.itens)).toEqual([2, 4, 4, 4, 4, 4])
    expect(b?.histograma?.reduce((s, x) => s + x.itens, 0)).toBe(22)
    const v = b?.distribuicao.status === 'ok' ? b.distribuicao.valor : null
    expect(v).toEqual({ p50: 2, p85: 9.55, p95: 11.9 })
    expect(r.base).toMatchObject({ n: 22, unidade: 'pedidos com primeiro toque' })
    expect(SCHEMAS_RESULTADO.O22.safeParse(r).success).toBe(true)
  })

  it('fronteira 19/20: com 19 pedidos tocados do tipo só "k de n" e sem histograma; com 20, publica', () => {
    const c19 = tocados(19, 'Requisição', [6])
    const c20 = tocados(20, 'Requisição', [6])
    const r19 = doTipo(calcularO22(ctxDe(c19.cards), F, extDe(c19.toques)), 'Requisição')
    const r20 = doTipo(calcularO22(ctxDe(c20.cards), F, extDe(c20.toques)), 'Requisição')
    expect(r19?.distribuicao).toMatchObject({ status: 'insuficiente', n: 19, minimo: 20 })
    expect(r19?.distribuicao).not.toHaveProperty('valor')
    expect(r19?.histograma).toBeNull()
    expect(r20?.distribuicao).toMatchObject({ status: 'ok', n: 20 })
    expect(r20?.histograma).not.toBeNull()
  })

  it('um bloco por tipo: o tipo com 20 publica e o com 19 não, e as contagens nunca se misturam (regra 7)', () => {
    const a = tocados(20, 'Requisição', [6])
    const b = tocados(19, 'Melhoria', [24])
    const r = calcularO22(ctxDe([...a.cards, ...b.cards]), F, extDe({ ...a.toques, ...b.toques }))
    expect(doTipo(r, 'Requisição')?.distribuicao).toMatchObject({ status: 'ok', n: 20 })
    expect(doTipo(r, 'Melhoria')?.distribuicao).toMatchObject({ status: 'insuficiente', n: 19 })
    expect(r.segmentoPor).toBe('tipo')
    expect(r.porTipo.map((x) => x.tipo)).toEqual(['Requisição', 'Melhoria'])
  })

  it('o filtro de tipo recorta: só o tipo pedido aparece', () => {
    const a = tocados(20, 'Requisição', [6])
    const b = tocados(20, 'Melhoria', [24])
    const r = calcularO22(
      ctxDe([...a.cards, ...b.cards]),
      { ...F, tipo: ['Melhoria'] },
      extDe({ ...a.toques, ...b.toques }),
    )
    expect(r.porTipo.map((x) => x.tipo)).toEqual(['Melhoria'])
  })

  it('só conta toque depois da criação, até a data de corte e dentro da janela de 12 semanas', () => {
    const { cards, toques } = tocados(20, 'Requisição', [6])
    const fora = [
      pedido('antes', 'Requisição'),
      pedido('futuro', 'Requisição'),
      pedido('velho', 'Requisição', {
        criado: '2026-06-01T08:00:00-03:00',
        trilha: trilhaSimples(
          '2026-06-01T08:00:00-03:00',
          '2026-06-02T08:00:00-03:00',
          '2026-06-03T08:00:00-03:00',
          '2026-06-30T10:00:00-03:00',
        ),
      }),
    ]
    const r = calcularO22(
      ctxDe([...cards, ...fora]),
      F,
      extDe({
        ...toques,
        antes: t('2026-08-31T10:00:00-03:00'),
        futuro: t('2026-10-20T10:00:00-03:00'),
        velho: t('2026-06-01T10:00:00-03:00'),
      }),
    )
    expect(doTipo(r, 'Requisição')?.distribuicao).toMatchObject({ status: 'ok', n: 20 })
  })

  it('"ainda sem toque": só pedido aberto com campo nulo; idade do mais antigo em dias úteis; entregue e arquivado ficam fora', () => {
    const ctxCards = [
      aberto('novo', 'Requisição', '2026-10-07T08:00:00-03:00'),
      aberto('velho', 'Requisição', '2026-09-25T08:00:00-03:00'),
      aberto('tocado', 'Requisição', '2026-09-25T08:00:00-03:00'),
      aberto('sem-dado', 'Requisição', '2026-09-01T08:00:00-03:00'),
      pedido('entregue-sem-toque', 'Requisição'),
      aberto('arquivado', 'Requisição', '2026-09-01T08:00:00-03:00'),
    ]
    const base = umaBase(ctxCards)
    base.cards = base.cards.map((c) =>
      c.card_id === 'arquivado' ? { ...c, arquivado_em: t('2026-09-10T08:00:00-03:00') } : c,
    )
    const ctx = criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO)
    const r = calcularO22(
      ctx,
      F,
      extDe({
        novo: null,
        velho: null,
        tocado: t('2026-09-26T10:00:00-03:00'),
        'entregue-sem-toque': null,
        arquivado: null,
      }),
    )
    const b = doTipo(r, 'Requisição')
    expect(b?.semToque.itens).toBe(2)
    // 25/09 08:00 até 09/10 (fim do expediente): 11 dias úteis (25/09, 28/09 a 02/10 e 05/10 a 09/10)
    expect(b?.semToque.maisAntigoDiasUteis).toBe(11)
  })

  it('bug interno não é pedido do solicitante e fica fora', () => {
    const { cards, toques } = tocados(25, 'Bug interno', [6])
    const r = calcularO22(ctxDe(cards), F, extDe(toques))
    expect(r.porTipo).toEqual([])
  })

  it('o resultado não traz campo de pessoa nem de texto: só tipo, contagens e tempos', () => {
    const { cards, toques } = tocados(20, 'Requisição', [6])
    const r = calcularO22(ctxDe(cards), F, extDe(toques))
    expect(Object.keys(r.porTipo[0] ?? {}).sort()).toEqual([
      'distribuicao',
      'histograma',
      'semToque',
      'tipo',
    ])
    expect(JSON.stringify(r)).not.toMatch(/Pessoa|autor|comentario|texto/i)
  })
})
