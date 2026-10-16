import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao'
import { CALENDARIO_PADRAO, instanteDeIso } from '../core/calendario'
import { NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO } from '../core/criterios'
import {
  calcularT11,
  EXTENSAO_TAMBEM_BM_VAZIA,
  type EntradaSazonal,
  type ExtensaoTambemBM,
} from './index'
import { criarContextoBM } from './indice'
import { HOJE_TESTE, umaBase } from './testing'

const F: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const ctxDe = (hoje = HOJE_TESTE, criterios: unknown[] = []) => {
  const base = umaBase([])
  base.config.criterios = criterios as typeof base.config.criterios
  return criarContextoBM(base, hoje, CALENDARIO_PADRAO)
}
const entrada = (
  iso: string,
  extra: Partial<Omit<EntradaSazonal, 'criado_em'>> = {},
): EntradaSazonal => ({
  criado_em: instanteDeIso(`${iso}T10:00:00-03:00`, CALENDARIO_PADRAO),
  tipo: 'Melhoria',
  equipe: 'Equipe A',
  sistema: 'Protheus',
  ...extra,
})
const extDe = (entradasSazonais: EntradaSazonal[]): ExtensaoTambemBM => ({
  ...EXTENSAO_TAMBEM_BM_VAZIA,
  entradasSazonais,
})
const celula = (r: ReturnType<typeof calcularT11>, ano: number, mes: number) =>
  r.anos.find((a) => a.ano === ano)?.meses.find((m) => m.mes === mes)

describe('T11 sazonalidade da chegada', () => {
  it('sem extensão (ou extensão vazia): vazio, histórico curto, no schema, nunca erro', () => {
    for (const ext of [undefined, extDe([])]) {
      const r = calcularT11(ctxDe(), F, ext)
      expect(r.anos).toEqual([])
      expect(r.mesesComDado).toBe(0)
      expect(r.mediaMensal).toBeNull()
      expect(r.historicoCurto).toBe(true)
      expect(r.base).toEqual({
        n: 0,
        unidade: 'demandas criadas',
        janela: { inicio: '2024-10-01', fim: '2026-10-09' },
      })
      expect(r.marcacoes).toEqual([])
      expect(SCHEMAS_RESULTADO.T11.safeParse(r).success).toBe(true)
    }
  })

  it('janela fixa: 24 meses fechados mais o corrente, ancorada em hoje; o que é anterior fica fora', () => {
    const r = calcularT11(
      ctxDe(),
      F,
      extDe([
        entrada('2024-09-30'), // antes da janela: ignorada
        entrada('2024-10-01'),
        entrada('2024-10-31'),
        entrada('2026-09-30'),
        entrada('2026-10-05'),
        entrada('2026-10-08'),
      ]),
    )
    expect(r.anos.map((a) => a.ano)).toEqual([2024, 2025, 2026])
    expect(r.anos.every((a) => a.meses.length === 12)).toBe(true)
    expect(celula(r, 2024, 10)).toEqual({ mes: 10, entradas: 2, emAndamento: false })
    expect(celula(r, 2024, 9)).toEqual({ mes: 9, entradas: null, emAndamento: false })
    expect(celula(r, 2024, 11)?.entradas).toBe(0) // mês coberto pelo histórico e sem entrada é 0, não nulo
    expect(celula(r, 2026, 9)?.entradas).toBe(1)
    expect(celula(r, 2026, 10)).toEqual({ mes: 10, entradas: 2, emAndamento: true })
    expect(celula(r, 2026, 11)).toEqual({ mes: 11, entradas: null, emAndamento: false })
    expect(r.base.n).toBe(5)
    expect(r.base.janela).toEqual({ inicio: '2024-10-01', fim: '2026-10-09' })
    expect(r.mesesComDado).toBe(24)
    expect(r.historicoCurto).toBe(false)
    // a média é só dos meses fechados (3 entradas em 24 meses), sem o corrente parcial
    expect(r.mediaMensal).toBe(0.13)
    expect(SCHEMAS_RESULTADO.T11.safeParse(r).success).toBe(true)
  })

  it('histórico curto: mostra o que existe, os meses anteriores ficam sem dado e a nota pede cautela', () => {
    const r = calcularT11(
      ctxDe(),
      F,
      extDe([entrada('2026-03-10'), entrada('2026-03-11'), entrada('2026-05-04')]),
    )
    expect(r.historicoCurto).toBe(true)
    expect(r.mesesComDado).toBe(7) // mar a set
    expect(celula(r, 2026, 2)?.entradas).toBeNull()
    expect(celula(r, 2026, 3)?.entradas).toBe(2)
    expect(celula(r, 2026, 4)?.entradas).toBe(0)
    expect(r.mediaMensal).toBe(0.43)
    expect(r.anos.find((a) => a.ano === 2025)?.meses.every((m) => m.entradas === null)).toBe(true)
  })

  it('o filtro de equipe, tipo e sistema recorta a contagem mas não encurta o histórico', () => {
    const ext = extDe([
      entrada('2025-01-10', { equipe: 'Equipe B', sistema: 'Fluig', tipo: 'Incidente' }),
      entrada('2025-03-10'),
      entrada('2025-03-12', { equipe: 'Equipe B' }),
      entrada('2025-03-13', { sistema: 'Fluig' }),
      entrada('2025-03-14', { tipo: 'Incidente' }),
    ])
    const todos = calcularT11(ctxDe(), F, ext)
    expect(celula(todos, 2025, 3)?.entradas).toBe(4)
    const equipe = calcularT11(ctxDe(), { ...F, equipe: ['equipe-b'] }, ext)
    expect(celula(equipe, 2025, 3)?.entradas).toBe(1)
    expect(celula(equipe, 2025, 1)?.entradas).toBe(1)
    const sistema = calcularT11(ctxDe(), { ...F, sistema: ['fluig'] }, ext)
    expect(celula(sistema, 2025, 3)?.entradas).toBe(1)
    const tipo = calcularT11(ctxDe(), { ...F, tipo: ['Incidente'] }, ext)
    expect(celula(tipo, 2025, 3)?.entradas).toBe(1)
    // a equipe B só aparece em jan e mar/2025, mas o histórico (da extensão toda) começa em jan/2025 para todas as visões
    const semResultado = calcularT11(ctxDe(), { ...F, equipe: ['equipe-c'] }, ext)
    expect(semResultado.mesesComDado).toBe(21)
    expect(semResultado.base.n).toBe(0)
    expect(semResultado.mediaMensal).toBe(0)
    expect(semResultado.anos.length).toBeGreaterThan(0)
  })

  it('CA-12: o período do filtro não muda o T11', () => {
    const ext = extDe([
      entrada('2025-07-02'),
      entrada('2025-07-03'),
      entrada('2026-07-01'),
      entrada('2026-10-01'),
    ])
    const base = calcularT11(ctxDe(), F, ext)
    for (const periodo of [
      { tipo: '4s' },
      { tipo: '6m' },
      { tipo: '12m' },
      { tipo: 'custom', de: '2026-09-01', ate: '2026-09-30' },
    ] as const)
      expect(calcularT11(ctxDe(), { ...F, periodo }, ext)).toEqual(base)
  })

  it('com hoje no último dia do mês, o mês corrente já fecha (sem emAndamento)', () => {
    const r = calcularT11(ctxDe('2026-10-30T18:00:00-03:00'), F, extDe([entrada('2026-10-02')]))
    expect(r.anos.flatMap((a) => a.meses).some((m) => m.emAndamento)).toBe(true)
    const fim = calcularT11(ctxDe('2026-10-31T18:00:00-03:00'), F, extDe([entrada('2026-10-02')]))
    expect(fim.anos.flatMap((a) => a.meses).some((m) => m.emAndamento)).toBe(false)
    // 25 meses fechados nesse dia (o mês está completo): o 24 é o tamanho da janela anterior ao corrente, não um teto
    expect(fim.mesesComDado).toBe(1)
  })

  it('B11b-1: data de corte no meio do mês ignora entradas criadas depois do corte (contagem e início do histórico)', () => {
    const ctx = ctxDe('2026-08-10T18:00:00-03:00')
    const r = calcularT11(
      ctx,
      F,
      extDe([
        entrada('2026-07-20'),
        entrada('2026-08-02'),
        entrada('2026-08-25'),
        entrada('2026-08-28'),
      ]),
    )
    expect(celula(r, 2026, 8)).toEqual({ mes: 8, entradas: 1, emAndamento: true })
    expect(celula(r, 2026, 7)?.entradas).toBe(1)
    expect(r.base.n).toBe(2)
    // só há entradas depois do corte: é como não ter histórico
    const so = calcularT11(ctx, F, extDe([entrada('2026-08-25'), entrada('2026-09-02')]))
    expect(so.anos).toEqual([])
    expect(so.base.n).toBe(0)
    expect(so.mesesComDado).toBe(0)
  })

  it('marcacoes: mudança de critério que afeta o T11 dentro da janela aparece; sem mudança, vem vazio', () => {
    const versao = {
      id: 'criterio-teste-t11',
      data: '2025-06-02',
      descricao: 'Critério de teste do T11',
      afeta: ['T11'],
    }
    const comMarca = calcularT11(ctxDe(HOJE_TESTE, [versao]), F, extDe([entrada('2025-06-10')]))
    expect(comMarca.marcacoes).toEqual([
      { id: 'criterio-teste-t11', data: '2025-06-02', descricao: 'Critério de teste do T11' },
    ])
    expect(comMarca.marcacoes).toEqual(comMarca.criterios.serie)
    expect(SCHEMAS_RESULTADO.T11.safeParse(comMarca).success).toBe(true)
    expect(calcularT11(ctxDe(), F, extDe([entrada('2025-06-10')])).marcacoes).toEqual([])
  })

  it('nasceu depois do descarte nativo: nenhuma das duas versões do descarte o marca (B11b)', () => {
    expect(NASCIDAS_DEPOIS_DO_DESCARTE_NATIVO).toContain('T11')
  })
})
