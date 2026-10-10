import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { criarAmostraInterna } from './amostra'
import {
  CALENDARIO_PADRAO as cal,
  calendarioCorrido,
  diaDeIso,
  diaDaSemana,
  horasUteisEntre,
  instanteDeIso,
  isoDeDia,
  somarHorasUteis,
  somarMeses,
  dataIso,
} from './calendario'
import { marcacoesNoPeriodo } from './criterios'
import { histograma, FAIXAS } from './histograma'
import { diaDentro, janelaMovel, JANELA_POR_GRANULARIDADE } from './janela'
import { percentil } from './percentil'
import { percentis, resumoComMedia, taxa } from './estatistica'
import { mesesEntre, resolverPeriodo, semanasEntre } from './series'

const t = (s: string) => instanteDeIso(s, cal)

describe('calendário útil', () => {
  it('mesmo dia dentro do expediente', () => {
    expect(horasUteisEntre(t('2026-10-07T09:00-03:00'), t('2026-10-07T11:30-03:00'), cal)).toBe(2.5)
  })
  it('atravessa o almoço', () => {
    expect(horasUteisEntre(t('2026-10-07T11:00-03:00'), t('2026-10-07T14:00-03:00'), cal)).toBe(2)
  })
  it('início e fim fora do expediente', () => {
    expect(horasUteisEntre(t('2026-10-07T06:00-03:00'), t('2026-10-07T20:00-03:00'), cal)).toBe(8)
  })
  it('atravessa fim de semana', () => {
    // sexta 16:00 a segunda 09:00 = 1h + 1h
    expect(horasUteisEntre(t('2026-10-09T16:00-03:00'), t('2026-10-12T09:00-03:00'), cal)).toBe(
      1 + 0,
    )
  })
  it('12/10/2026 é feriado (segunda): sexta 16h a terça 09h = 1h + 1h', () => {
    expect(horasUteisEntre(t('2026-10-09T16:00-03:00'), t('2026-10-13T09:00-03:00'), cal)).toBe(2)
  })
  it('intervalo nulo é zero e fim < início é erro', () => {
    const a = t('2026-10-07T10:00-03:00')
    expect(horasUteisEntre(a, a, cal)).toBe(0)
    expect(() => horasUteisEntre(a, a - 1, cal)).toThrow()
  })
  it('modo corrido conta horas corridas', () => {
    const c = calendarioCorrido(cal)
    expect(horasUteisEntre(t('2026-10-10T00:00-03:00'), t('2026-10-11T00:00-03:00'), c)).toBe(24)
  })
  it('somarHorasUteis pula noite, almoço e fim de semana', () => {
    const fim = somarHorasUteis(t('2026-10-09T16:00-03:00'), 3, cal)
    // 1h sexta, 2h terça? 12/10 feriado: terça 08-10
    expect(dataIso(fim, cal)).toBe('2026-10-13')
    expect(horasUteisEntre(t('2026-10-09T16:00-03:00'), fim, cal)).toBeCloseTo(3, 9)
  })
  it('datas civis ida e volta', () => {
    expect(isoDeDia(diaDeIso('2026-02-28') + 1)).toBe('2026-03-01')
    expect(isoDeDia(diaDeIso('2024-02-28') + 1)).toBe('2024-02-29')
    expect(diaDaSemana(diaDeIso('2026-10-09'))).toBe(4) // sexta
    expect(isoDeDia(somarMeses(diaDeIso('2026-03-31'), -1))).toBe('2026-02-28')
  })
  it('é aditiva em intervalos contíguos (propriedade)', () => {
    const base = t('2026-01-05T00:00-03:00')
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 90 * 24 * 60 }),
        fc.integer({ min: 0, max: 90 * 24 * 60 }),
        fc.integer({ min: 0, max: 90 * 24 * 60 }),
        (x, y, z) => {
          const [a, b, c] = [x, y, z].sort((p, q) => p - q).map((m) => base + m * 60_000) as [
            number,
            number,
            number,
          ]
          expect(horasUteisEntre(a, b, cal) + horasUteisEntre(b, c, cal)).toBeCloseTo(
            horasUteisEntre(a, c, cal),
            6,
          )
        },
      ),
    )
  })
})

describe('percentil (tipo 7, igual a PERCENTILE.INC)', () => {
  it('valores de referência', () => {
    const v = [15, 20, 35, 40, 50]
    expect(percentil(v, 0.5)).toBe(35)
    expect(percentil(v, 0.85)).toBeCloseTo(44, 9) // h = 3,4 -> 40 + 0,4*10
    expect(percentil(v, 0.95)).toBeCloseTo(48, 9)
    expect(percentil([7], 0.95)).toBe(7)
    expect(percentil([3, 3, 3, 3], 0.85)).toBe(3)
  })
  it('amostra vazia é erro', () => expect(() => percentil([], 0.5)).toThrow())
  it('p50 <= p85 <= p95 e dentro de [min, max] (propriedade)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.double({ min: 0, max: 1e4, noNaN: true }), { minLength: 1, maxLength: 200 }),
        (vs) => {
          const a = percentil(vs, 0.5),
            b = percentil(vs, 0.85),
            c = percentil(vs, 0.95)
          expect(a).toBeLessThanOrEqual(b + 1e-9)
          expect(b).toBeLessThanOrEqual(c + 1e-9)
          expect(a).toBeGreaterThanOrEqual(Math.min(...vs) - 1e-9)
          expect(c).toBeLessThanOrEqual(Math.max(...vs) + 1e-9)
        },
      ),
    )
  })
})

describe('regra de mínimo de 20 itens', () => {
  const janela = { inicio: '2026-07-18', fim: '2026-10-09' }
  const amostra = (n: number) =>
    criarAmostraInterna(
      'businessmap',
      'story',
      Array.from({ length: n }, (_, i) => i + 1),
      janela,
    )
  it.each([1, 19])('n=%i é insuficiente e não carrega valor', (n) => {
    const e = percentis(amostra(n))
    expect(e.status).toBe('insuficiente')
    expect(e).not.toHaveProperty('valor')
  })
  it('n=20 publica; média só junto dos percentis', () => {
    const e = resumoComMedia(amostra(20))
    expect(e.status).toBe('ok')
    if (e.status === 'ok')
      expect(Object.keys(e.valor).sort()).toEqual(['media', 'p50', 'p85', 'p95'])
  })
  it('taxa esconde o percentual abaixo de 20 mas mantém k de n', () => {
    expect(taxa(5, 19)).toEqual({ status: 'insuficiente', k: 5, n: 19, minimo: 20 })
    expect(taxa(10, 20)).toEqual({ status: 'ok', k: 10, n: 20, pct: 50 })
  })
  it('histograma só existe com 20 itens', () => {
    expect(histograma(amostra(19), FAIXAS.rapida)).toBeNull()
    const h = histograma(amostra(25), FAIXAS.rapida)
    expect(h?.reduce((s, f) => s + f.contagem, 0)).toBe(25)
    expect(h?.map((f) => f.rotulo)).toEqual(['0-1', '2-3', '4-5', '6-10', '11-20', '+20'])
  })
})

describe('janela móvel', () => {
  it('12 semanas = 84 dias: dia 84 dentro, 85 fora', () => {
    const j = janelaMovel('2026-10-09', JANELA_POR_GRANULARIDADE.story)
    const fim = diaDeIso(j.fim)
    expect(diaDentro(fim - 83, j)).toBe(true)
    expect(diaDentro(fim - 84, j)).toBe(false)
    expect(diaDentro(fim, j)).toBe(true)
  })
  it('janela em meses', () => {
    expect(janelaMovel('2026-10-09', { unidade: 'meses', quantidade: 12 }).inicio).toBe(
      '2025-10-10',
    )
  })
  it('a janela por granularidade é uma constante única, hoje 12 semanas para todas', () => {
    for (const e of Object.values(JANELA_POR_GRANULARIDADE))
      expect(e).toEqual({ unidade: 'semanas', quantidade: 12 })
  })
})

describe('períodos e baldes', () => {
  it('resolve os períodos padrão até a data de corte', () => {
    expect(resolverPeriodo({ tipo: '12s' }, '2026-10-09')).toEqual({
      inicio: '2026-07-18',
      fim: '2026-10-09',
    })
    expect(resolverPeriodo({ tipo: '6m' }, '2026-10-09').inicio).toBe('2026-04-10')
  })
  it('semana corrente é "em andamento"', () => {
    const hoje = diaDeIso('2026-10-09')
    const s = semanasEntre(hoje - 83, hoje, hoje)
    expect(s.at(-1)?.emAndamento).toBe(true)
    expect(s.slice(0, -1).every((b) => !b.emAndamento)).toBe(true)
    const m = mesesEntre(hoje - 120, hoje, hoje)
    expect(m.at(-1)).toMatchObject({ chave: '2026-10', emAndamento: true })
  })
})

describe('versões de critério (T2.6)', () => {
  const versoes = [{ id: 'c1', data: '2026-03-02', descricao: 'x', afeta: ['O9' as const] }]
  it('marca quando o período cruza a data e só para métricas afetadas', () => {
    expect(
      marcacoesNoPeriodo('O9', { inicio: '2026-01-01', fim: '2026-06-01' }, versoes),
    ).toHaveLength(1)
    expect(
      marcacoesNoPeriodo('O9', { inicio: '2026-03-03', fim: '2026-06-01' }, versoes),
    ).toHaveLength(0)
    expect(
      marcacoesNoPeriodo('O3', { inicio: '2026-01-01', fim: '2026-06-01' }, versoes),
    ).toHaveLength(0)
  })
})
