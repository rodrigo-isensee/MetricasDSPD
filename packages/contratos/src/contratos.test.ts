import { describe, expect, it } from 'vitest'
import {
  APLICABILIDADE_FLUXO,
  EQUIPES_SUSTENTACAO,
  EQUIPES_SUSTENTACAO_ID,
  JANELA_PERCENTIS_PADRAO,
  META_ADERENCIA_SLE_PCT,
  META_DESVIO_ALOCACAO_PP,
  META_RAZAO_MAX,
  META_RAZAO_MIN,
  METRICAS_SUSTENTACAO,
  METRICA_IDS,
  MINIMO_AMOSTRA,
  NOME_EQUIPE_SUSTENTACAO,
  PERIODOS_PADRAO,
  TIPOS_CARD,
  TIPOS_FILTRO,
  TIPO_ID,
  alertaCodigo,
  baseAmostralSchema,
  estatisticaSchema,
  filtrosFluxoSchema,
  filtrosSustentacaoSchema,
  periodoSchema,
  percentisSchema,
  taxaSchema,
  tipoFiltroSchema,
  versaoCriterioSchema,
} from '.'
import { SCHEMAS_RESULTADO } from './validacao'

const janela = { inicio: '2026-07-01', fim: '2026-09-30' }

describe('regra dos 20 itens (estatisticaSchema)', () => {
  const schema = estatisticaSchema(percentisSchema)
  const valor = { p50: 1, p85: 2, p95: 3 }

  it('aceita ok com n >= 20 e carrega o valor', () => {
    expect(schema.safeParse({ status: 'ok', n: MINIMO_AMOSTRA, valor, janela }).success).toBe(true)
    expect(schema.safeParse({ status: 'ok', n: 250, valor, janela }).success).toBe(true)
  })

  it('rejeita ok com n abaixo de 20, não inteiro ou sem valor', () => {
    expect(schema.safeParse({ status: 'ok', n: 19, valor, janela }).success).toBe(false)
    expect(schema.safeParse({ status: 'ok', n: 20.5, valor, janela }).success).toBe(false)
    expect(schema.safeParse({ status: 'ok', n: 30, janela }).success).toBe(false)
  })

  it('aceita insuficiente só com n <= 19 e o mínimo declarado', () => {
    const base = { status: 'insuficiente', minimo: 20, janela }
    expect(schema.safeParse({ ...base, n: 0 }).success).toBe(true)
    expect(schema.safeParse({ ...base, n: 19 }).success).toBe(true)
    expect(schema.safeParse({ ...base, n: 20 }).success).toBe(false)
    expect(schema.safeParse({ ...base, n: 5, minimo: 10 }).success).toBe(false)
  })

  it('rejeita status desconhecido', () => {
    expect(schema.safeParse({ status: 'talvez', n: 30, valor, janela }).success).toBe(false)
  })
})

describe('taxa k de n (taxaSchema)', () => {
  it('ok exige n >= 20; insuficiente mantém k de n sem percentual', () => {
    expect(taxaSchema.safeParse({ status: 'ok', k: 18, n: 20, pct: 90 }).success).toBe(true)
    expect(taxaSchema.safeParse({ status: 'ok', k: 5, n: 19, pct: 26 }).success).toBe(false)
    expect(taxaSchema.safeParse({ status: 'insuficiente', k: 5, n: 19, minimo: 20 }).success).toBe(
      true,
    )
    expect(taxaSchema.safeParse({ status: 'insuficiente', k: 5, n: 20, minimo: 20 }).success).toBe(
      false,
    )
    expect(taxaSchema.safeParse({ status: 'insuficiente', k: 5, n: 10 }).success).toBe(false)
  })
})

describe('período e filtros', () => {
  it('período aceita os padrões e o personalizado completo, e rejeita o resto', () => {
    for (const tipo of PERIODOS_PADRAO) expect(periodoSchema.safeParse({ tipo }).success).toBe(true)
    expect(
      periodoSchema.safeParse({ tipo: 'custom', de: '2026-01-01', ate: '2026-02-01' }).success,
    ).toBe(true)
    expect(periodoSchema.safeParse({ tipo: 'custom', de: '2026-01-01' }).success).toBe(false)
    expect(periodoSchema.safeParse({ tipo: '3s' }).success).toBe(false)
  })

  it('filtros do fluxo: listas vazias valem "Todos"; tipo fora da lista é rejeitado', () => {
    const ok = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
    expect(filtrosFluxoSchema.safeParse(ok).success).toBe(true)
    expect(filtrosFluxoSchema.safeParse({ ...ok, tipo: ['Incidente'] }).success).toBe(true)
    expect(filtrosFluxoSchema.safeParse({ ...ok, tipo: ['Iniciativa'] }).success).toBe(false)
    expect(tipoFiltroSchema.safeParse('Iniciativa').success).toBe(false)
  })

  it('filtros da sustentação aceitam equipes e prioridades válidas e não têm filtro por agente', () => {
    const ok = { equipe: ['totvs'], prioridade: ['P1', 'P3'], periodo: { tipo: '6m' } }
    expect(filtrosSustentacaoSchema.safeParse(ok).success).toBe(true)
    expect(filtrosSustentacaoSchema.safeParse({ ...ok, equipe: ['outra'] }).success).toBe(false)
    expect(filtrosSustentacaoSchema.safeParse({ ...ok, prioridade: ['P9'] }).success).toBe(false)
    expect(Object.keys(filtrosSustentacaoSchema.shape).sort()).toEqual([
      'equipe',
      'periodo',
      'prioridade',
    ])
  })

  it('ids de URL: um por equipe de sustentação e um por tipo do filtro', () => {
    expect(EQUIPES_SUSTENTACAO_ID.map((id) => NOME_EQUIPE_SUSTENTACAO[id])).toEqual([
      ...EQUIPES_SUSTENTACAO,
    ])
    expect(Object.keys(TIPO_ID).sort()).toEqual([...TIPOS_FILTRO].sort())
    expect(new Set(Object.values(TIPO_ID)).size).toBe(TIPOS_FILTRO.length)
    expect(TIPOS_CARD).toContain('Iniciativa')
    expect(TIPOS_FILTRO).not.toContain('Iniciativa')
  })
})

describe('metas, janela e aplicabilidade', () => {
  it('metas do briefing e janela de 12 semanas vêm de constantes únicas', () => {
    expect(META_ADERENCIA_SLE_PCT).toBe(85)
    expect([META_RAZAO_MIN, META_RAZAO_MAX]).toEqual([0.9, 1.0])
    expect(META_DESVIO_ALOCACAO_PP).toBe(10)
    expect(JANELA_PERCENTIS_PADRAO).toEqual({ unidade: 'semanas', quantidade: 12 })
  })

  it('sustentação e fluxo não se misturam: nenhuma métrica S/EI_SUST tem aplicabilidade de fluxo', () => {
    for (const id of METRICAS_SUSTENTACAO) expect(APLICABILIDADE_FLUXO[id]).toBeUndefined()
    expect(METRICAS_SUSTENTACAO).toHaveLength(8)
    for (const [, chaves] of Object.entries(APLICABILIDADE_FLUXO))
      expect(chaves).toContain('periodo')
  })
})

describe('schemas de resultado', () => {
  it('há exatamente um schema por métrica (33)', () => {
    expect(METRICA_IDS).toHaveLength(33)
    expect(Object.keys(SCHEMAS_RESULTADO).sort()).toEqual([...METRICA_IDS].sort())
  })

  it('rejeitam objeto vazio e valor que não é objeto', () => {
    for (const id of METRICA_IDS) {
      expect(SCHEMAS_RESULTADO[id].safeParse({}).success).toBe(false)
      expect(SCHEMAS_RESULTADO[id].safeParse(null).success).toBe(false)
    }
  })

  it('base amostral aceita complemento opcional e janela nula', () => {
    expect(baseAmostralSchema.safeParse({ n: 3, unidade: 'itens', janela: null }).success).toBe(
      true,
    )
    expect(
      baseAmostralSchema.safeParse({
        n: 3,
        unidade: 'itens',
        janela,
        complemento: { n: 9, unidade: 'concluídos' },
      }).success,
    ).toBe(true)
    expect(baseAmostralSchema.safeParse({ n: 3, unidade: 'itens' }).success).toBe(false)
  })

  it('versão de critério só afeta métricas existentes; alerta tem código fechado', () => {
    const v = { id: 'c1', data: '2026-06-01', descricao: 'x', afeta: ['O1'] }
    expect(versaoCriterioSchema.safeParse(v).success).toBe(true)
    expect(versaoCriterioSchema.safeParse({ ...v, afeta: ['ZZ'] }).success).toBe(false)
    expect(alertaCodigo.safeParse('O10_BACKLOG_180').success).toBe(true)
    expect(alertaCodigo.safeParse('QUALQUER').success).toBe(false)
  })
})
