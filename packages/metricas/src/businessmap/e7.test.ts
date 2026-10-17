import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo, TipoCard } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { gerarBaseMock } from '@metricas-dspd/mock'
import { CALENDARIO_PADRAO } from '../core/calendario'
import { calcularE7 } from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, trilhaSimples, umaBase, type EspecCard } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const ctxDe = (cards: EspecCard[]) => criarContextoBM(umaBase(cards), HOJE_TESTE, CALENDARIO_PADRAO)

/** Demanda entregue em 30/09, dentro das 12 semanas que terminam em 09/10. */
const entregue = (id: string, extra: Partial<EspecCard> = {}): EspecCard => ({
  id,
  criado: '2026-08-03T08:00:00-03:00',
  trilha: trilhaSimples(
    '2026-08-03T08:00:00-03:00',
    '2026-08-04T08:00:00-03:00',
    '2026-08-05T08:00:00-03:00',
    '2026-09-30T10:00:00-03:00',
  ),
  ...extra,
})
const varios = (
  n: number,
  sistema: string,
  extra: (i: number) => Partial<EspecCard> = () => ({}),
) => Array.from({ length: n }, (_, i) => entregue(`${sistema}-${i}`, { sistema, ...extra(i) }))

/** Nomes de campo que indicariam valor em dinheiro; se qualquer um voltar à saída do E7, o teste falha (D2 = A). */
const CHAVE_DE_DINHEIRO =
  /custo|rateio|rateado|valor|preco|preço|reais|brl|dinheiro|orcamento|orçamento|moeda/i

function chaves(v: unknown, saida: string[] = []): string[] {
  if (Array.isArray(v)) v.forEach((x) => chaves(x, saida))
  else if (v !== null && typeof v === 'object')
    for (const [k, x] of Object.entries(v)) {
      saida.push(k)
      chaves(x, saida)
    }
  return saida
}

describe('E7: entregas por sistema, sem R$ (D2 = A, D-2, CA-23)', () => {
  it('nenhum campo de valor em dinheiro na saída, no mock e em fixture; o schema estrito recusa um campo de custo', () => {
    const mock = gerarBaseMock()
    const ctxMock = criarContextoBM(mock.bm, mock.config.hoje, CALENDARIO_PADRAO)
    const saidas = [
      calcularE7(ctxMock, F),
      calcularE7(ctxDe([...varios(30, 'Protheus'), ...varios(25, 'Fluig')]), F),
    ]
    for (const r of saidas) {
      expect(chaves(r).filter((k) => CHAVE_DE_DINHEIRO.test(k))).toEqual([])
      expect(JSON.stringify(r)).not.toMatch(/R\$/)
    }
    const s = saidas[1]
    const comCusto = { ...s, sistemas: [{ ...s?.sistemas[0], custoTotal: 1 }] }
    expect(SCHEMAS_RESULTADO.E7.safeParse(comCusto).success).toBe(false)
  })

  it('participação por contagem de entregas; a de maior volume primeiro; sem R$', () => {
    const r = calcularE7(
      ctxDe([...varios(30, 'Protheus'), ...varios(50, 'Fluig'), ...varios(20, 'Senior')]),
      F,
    )
    expect(r.total).toBe(100)
    expect(r.sistemas.map((s) => [s.sistema, s.entregas])).toEqual([
      ['Fluig', 50],
      ['Protheus', 30],
      ['Senior', 20],
    ])
    expect(r.sistemas[0]?.participacao).toEqual({ status: 'ok', k: 50, n: 100, pct: 50 })
    expect(JSON.stringify(r)).not.toMatch(/R\$/)
    expect(SCHEMAS_RESULTADO.E7.safeParse(r).success).toBe(true)
  })

  it('sistema com menos de 20 entregas tem participação nula e vai para o fim', () => {
    const r = calcularE7(
      ctxDe([...varios(5, 'Alfa'), ...varios(25, 'Zeta'), ...varios(19, 'Beta')]),
      F,
    )
    expect(r.sistemas.map((s) => s.sistema)).toEqual(['Zeta', 'Beta', 'Alfa'])
    expect(r.sistemas[0]?.participacao?.status).toBe('ok')
    // B5-1: abaixo de 20 entregas a participação é nula (nunca "19 de 19"); o "k de n" sai de entregas e total.
    expect(r.sistemas[1]).toMatchObject({ participacao: null, entregas: 19 })
    expect(r.sistemas[2]).toMatchObject({ participacao: null, entregas: 5 })
    expect(r.total).toBe(49)
  })

  it('com menos de 20 entregas no total toda participação é nula; entregas e total bastam para o "k de n"', () => {
    const r = calcularE7(ctxDe([...varios(8, 'Alfa'), ...varios(4, 'Beta')]), F)
    expect(r.total).toBe(12)
    expect(r.sistemas.map((s) => [s.entregas, s.participacao])).toEqual([
      [8, null],
      [4, null],
    ])
    expect(SCHEMAS_RESULTADO.E7.safeParse(r).success).toBe(true)
  })

  it('fronteira 19/20 por sistema: 19 entregas é nulo e 20 publica o percentual sobre o total', () => {
    const r = calcularE7(ctxDe([...varios(19, 'Alfa'), ...varios(20, 'Beta')]), F)
    expect(r.sistemas.map((s) => [s.sistema, s.participacao])).toEqual([
      ['Beta', { status: 'ok', k: 20, n: 39, pct: (20 / 39) * 100 }],
      ['Alfa', null],
    ])
  })

  it('desempate pelo nome do sistema (ordem neutra, nunca por pior desempenho)', () => {
    const r = calcularE7(ctxDe([...varios(20, 'Beta'), ...varios(20, 'Alfa')]), F)
    expect(r.sistemas.map((s) => s.sistema)).toEqual(['Alfa', 'Beta'])
  })

  it('as quatro naturezas sempre presentes, pela regra do T3 (CA-23): tipo e projeto acima', () => {
    const tipo = (t: TipoCard) => ({ tipo: t })
    const cards = [
      ...varios(6, 'Protheus', () => tipo('Incidente')),
      ...varios(4, 'Protheus', () => tipo('Dívida técnica')),
      ...varios(10, 'Protheus', () => tipo('Melhoria')),
      entregue('proj', { gran: 'projeto', sistema: 'Protheus' }),
      ...varios(5, 'Protheus', () => ({ pai: 'proj' })),
    ]
    const r = calcularE7(ctxDe(cards), F)
    const s = r.sistemas.find((x) => x.sistema === 'Protheus')
    expect(s?.entregas).toBe(25)
    expect(s?.porNatureza.map((n) => [n.natureza, n.taxa.k])).toEqual([
      ['Sustentação', 6],
      ['Evolução', 10],
      ['Projetos', 5],
      ['Dívida técnica', 4],
    ])
    expect(s?.porNatureza[0]?.taxa).toEqual({ status: 'ok', k: 6, n: 25, pct: 24 })
  })

  it('só demanda entregue no período: fora subtarefa, bug interno, frente, projeto, não entregue e entrega antiga', () => {
    const naoEntregue: EspecCard = {
      id: 'aberto',
      criado: '2026-08-03T08:00:00-03:00',
      trilha: [['Aguardando priorização', '2026-08-03T08:00:00-03:00']],
    }
    const antiga: EspecCard = {
      ...entregue('antiga'),
      trilha: trilhaSimples(
        '2025-01-03T08:00:00-03:00',
        '2025-01-04T08:00:00-03:00',
        '2025-01-06T08:00:00-03:00',
        '2025-01-30T10:00:00-03:00',
      ),
      criado: '2025-01-03T08:00:00-03:00',
    }
    const r = calcularE7(
      ctxDe([
        ...varios(20, 'Protheus'),
        entregue('sub', { subtarefa: true }),
        entregue('bug', { tipo: 'Bug interno' }),
        entregue('frente', { gran: 'frente' }),
        entregue('projeto', { gran: 'projeto' }),
        naoEntregue,
        antiga,
      ]),
      F,
    )
    expect(r.total).toBe(20)
    expect(r.base).toMatchObject({ n: 20, unidade: 'demandas entregues' })
  })

  it('o filtro de equipe não atua (o Estratégico não tem Equipe); o de sistema atua', () => {
    const cards = [
      ...varios(20, 'Protheus', () => ({ equipe: 'Equipe A' })),
      ...varios(20, 'Fluig', () => ({ equipe: 'Equipe B' })),
    ]
    const ctx = ctxDe(cards)
    expect(calcularE7(ctx, { ...F, equipe: ['equipe-a'] }).total).toBe(40)
    const so = calcularE7(ctx, { ...F, sistema: ['fluig'] })
    expect(so.sistemas.map((s) => s.sistema)).toEqual(['Fluig'])
    // Nenhuma chave de equipe ou de pessoa no resultado.
    expect(JSON.stringify(calcularE7(ctx, F))).not.toMatch(/Equipe|Pessoa|equipe|responsave/)
  })

  it('sem entregas: resultado vazio e válido no schema', () => {
    const r = calcularE7(ctxDe([]), F)
    expect(r.total).toBe(0)
    expect(r.sistemas).toEqual([])
    expect(SCHEMAS_RESULTADO.E7.safeParse(r).success).toBe(true)
  })

  it('base do mock: soma das participações fecha 100% e o resultado obedece ao schema', () => {
    const base = gerarBaseMock({ escala: 0.5 })
    const r = calcularE7(criarContextoBM(base.bm, HOJE_TESTE, CALENDARIO_PADRAO), {
      ...F,
      periodo: { tipo: '12m' },
    })
    expect(SCHEMAS_RESULTADO.E7.safeParse(r).success).toBe(true)
    expect(r.sistemas.reduce((s, x) => s + x.entregas, 0)).toBe(r.total)
  })
})

describe('L3: marcação de critério cruzando o período (E7)', () => {
  it('a série traz a versão do período e fora dele não traz', () => {
    const base = umaBase([])
    base.config.criterios = [
      { id: 'c-dentro', data: '2026-09-20', descricao: 'dentro do período', afeta: ['E7'] },
      { id: 'c-antes', data: '2025-01-10', descricao: 'antes do período', afeta: ['E7'] },
      { id: 'c-outra', data: '2026-09-20', descricao: 'outra métrica', afeta: ['O1'] },
    ]
    const r = calcularE7(criarContextoBM(base, HOJE_TESTE, CALENDARIO_PADRAO), F)
    expect(r.criterios.serie.map((c) => c.id)).toEqual(['c-dentro'])
    expect(r.criterios.janela.map((c) => c.id)).toEqual(['c-dentro'])
  })
})
