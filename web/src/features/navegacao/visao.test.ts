import { describe, expect, it } from 'vitest'
import { cartoesDoPainel } from '@metricas-dspd/contratos'
import {
  TABELA_HASH,
  entradasDaTabela,
  VISAO_PADRAO,
  comVisao,
  hrefDaVisao,
  lerVisao,
  resolverVisao,
  visaoDoHash,
} from './visao'

const P = (s: string) => new URLSearchParams(s)

describe('lerVisao (4.1)', () => {
  it.each([
    ['', 'resumo', null],
    ['cadencia=resumo', 'resumo', null],
    ['cadencia=diaria', 'diaria', null],
    ['cadencia=semanal', 'semanal', null],
    ['cadencia=sustentacao', 'sustentacao', null],
    ['cadencia=xyz', 'resumo', 'xyz'],
    ['cadencia=', 'resumo', ''],
  ])('%s -> %s', (busca, visao, invalido) => {
    expect(lerVisao(P(busca))).toEqual({ visao, invalido })
  })
  it('o padrão é o Resumo', () => expect(VISAO_PADRAO).toBe('resumo'))
})

describe('tabela hash -> visão (4.2)', () => {
  it.each([
    ['#o2', 'diaria'],
    ['#bloqueados', 'diaria'],
    ['#o1', 'diaria'],
    ['#o3', 'semanal'],
    ['#o4', 'semanal'],
    ['#o17', 'sustentacao'],
    ['#ei-fl1', 'semanal'],
    ['#tempo', 'semanal'],
    ['#fluxo', 'semanal'],
    ['#compromissos', 'semanal'],
    ['#backlog', 'semanal'],
    ['#qualidade', 'semanal'],
    ['#espera-invisivel', 'semanal'],
    ['#compl-por-que-demora', 'semanal'],
    ['#compl-qualidade-compl', 'semanal'],
    ['#s1', 'sustentacao'],
    ['#s12', 'sustentacao'],
    ['#ei-sust', 'sustentacao'],
    ['#pv1', 'sustentacao'],
    ['#prazos', 'sustentacao'],
    ['#volume', 'sustentacao'],
    ['#causas', 'sustentacao'],
    ['#espera', 'sustentacao'],
    ['#percepcao', 'sustentacao'],
    ['#compl-sust-por-que-demora', 'sustentacao'],
    ['#compl-sust-qualidade', 'sustentacao'],
    ['#compl-sust-o-que-entra', 'sustentacao'],
    ['#resumo-fluxo', 'resumo'],
    ['#resumo-sustentacao', 'resumo'],
    ['#tendencia-fluxo', 'resumo'],
    ['#tendencia-sustentacao', 'resumo'],
  ])('%s -> %s', (hash, visao) => expect(visaoDoHash(hash)).toBe(visao))

  it.each(['', '#', '#mais-metricas', '#desconhecido'])('%j não decide a visão', (hash) =>
    expect(visaoDoHash(hash)).toBeNull(),
  )

  it('ignora maiúsculas', () => {
    expect(visaoDoHash('#S2')).toBe('sustentacao')
    expect(visaoDoHash('#O3')).toBe('semanal')
    expect(visaoDoHash('#EI-SUST')).toBe('sustentacao')
  })

  it('todo cartão dos painéis operacional e sustentação tem visão, e nenhum hash pertence a duas visões', () => {
    for (const c of [...cartoesDoPainel('operacional'), ...cartoesDoPainel('sustentacao')])
      expect(visaoDoHash(`#${c.id}`), c.id).not.toBeNull()
    const cartoes = [...cartoesDoPainel('operacional'), ...cartoesDoPainel('sustentacao')].map(
      (c) => c.id,
    )
    expect(new Set(cartoes).size).toBe(cartoes.length)
    // Nenhuma âncora aparece duas vezes (nem na mesma visão, nem em visões diferentes).
    const ancoras = entradasDaTabela().map(([a]) => a)
    expect(new Set(ancoras).size).toBe(ancoras.length)
    expect(TABELA_HASH.size).toBe(ancoras.length)
  })

  it('os ids de seção complementar da sustentação não colidem com os do fluxo', () => {
    const doFluxo = new Set(cartoesDoPainel('operacional').map((c) => c.secao))
    for (const c of cartoesDoPainel('sustentacao').filter((x) => x.grupo === 'complementar'))
      expect(doFluxo.has(c.secao), c.secao).toBe(false)
  })
})

describe('resolverVisao', () => {
  it('sem parâmetro: Resumo, sem correção', () => {
    const r = resolverVisao(P(''), '')
    expect(r).toMatchObject({ visao: 'resumo', corrigir: false, invalido: null })
  })
  it('cadencia=resumo é aceito e removido', () => {
    const r = resolverVisao(P('cadencia=resumo&equipe=a'), '')
    expect(r.visao).toBe('resumo')
    expect(r.corrigir).toBe(true)
    expect(r.busca.toString()).toBe('equipe=a')
  })
  it('valor desconhecido: Resumo, corrige e informa o valor', () => {
    const r = resolverVisao(P('cadencia=xyz'), '')
    expect(r).toMatchObject({ visao: 'resumo', corrigir: true, invalido: 'xyz' })
    expect(r.busca.toString()).toBe('')
  })
  it('o hash vence a cadencia e a URL é corrigida', () => {
    const r = resolverVisao(P('cadencia=diaria&sust_prioridade=p1'), '#s1')
    expect(r.visao).toBe('sustentacao')
    expect(r.corrigir).toBe(true)
    expect(r.busca.get('cadencia')).toBe('sustentacao')
    expect(r.busca.get('sust_prioridade')).toBe('p1')
  })
  it('hash do Resumo remove a cadencia', () => {
    const r = resolverVisao(P('cadencia=semanal'), '#resumo-fluxo')
    expect(r.visao).toBe('resumo')
    expect(r.busca.has('cadencia')).toBe(false)
  })
  it('hash desconhecido ou #mais-metricas: vale a cadencia', () => {
    expect(resolverVisao(P('cadencia=sustentacao'), '#mais-metricas').visao).toBe('sustentacao')
    expect(resolverVisao(P('cadencia=semanal'), '#nada').visao).toBe('semanal')
    expect(resolverVisao(P('cadencia=semanal'), '#nada').corrigir).toBe(false)
  })
})

describe('comVisao e hrefDaVisao', () => {
  it('o Resumo remove cadencia; as outras gravam; o resto fica', () => {
    expect(comVisao(P('cadencia=semanal&o3=melhoria'), 'resumo').toString()).toBe('o3=melhoria')
    expect(comVisao(P('o3=melhoria'), 'diaria').get('cadencia')).toBe('diaria')
  })
  it('preserva os dois conjuntos de filtros e os parâmetros de cartão', () => {
    const h = hrefDaVisao('semanal', P('equipe=x&periodo=4s&sust_prioridade=p1&s3=prop&mock=vazio'))
    expect(h.pathname).toBe('/operacional')
    const q = new URLSearchParams(h.search)
    expect(q.get('equipe')).toBe('x')
    expect(q.get('periodo')).toBe('4s')
    expect(q.get('sust_prioridade')).toBe('p1')
    expect(q.get('s3')).toBe('prop')
    expect(q.get('cadencia')).toBe('semanal')
    // o link nunca propaga o mock (6.6)
    expect(q.has('mock')).toBe(false)
  })
  it('com mock pedido, mantém o mock; hash e Resumo sem busca', () => {
    expect(hrefDaVisao('diaria', P('mock=vazio'), { mock: true, hash: '#o2' })).toEqual({
      pathname: '/operacional',
      search: '?mock=vazio&cadencia=diaria',
      hash: '#o2',
    })
    expect(hrefDaVisao('resumo', P('cadencia=semanal'))).toEqual({
      pathname: '/operacional',
      search: '',
      hash: '',
    })
  })
})
