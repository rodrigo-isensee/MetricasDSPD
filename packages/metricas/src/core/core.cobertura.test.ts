import { describe, expect, it } from 'vitest'
import {
  CALENDARIO_PADRAO as cal,
  calendarioCorrido,
  criarCalendario,
  diaDeIso,
  ehDiaUtil,
  fimDoExpediente,
  horasUteisEntre,
  instanteDeIso,
  isoDeDia,
  somarHorasUteis,
} from './calendario'
import { criteriosDe, marcacoesNoPeriodo } from './criterios'
import { estatisticaEspera, indiceEspera, pontoEspera } from './espera'
import { contarFaixas, indiceFaixa } from './histograma'
import { janelaDeslocada, janelaMovel } from './janela'
import { ordenarNeutro } from './ordenar'
import { media, mediana, percentil, percentilOrdenado } from './percentil'
import { mesesEntre, resolverPeriodo, semanasEntre, trimestresEntre } from './series'

const janela = { inicio: '2026-01-01', fim: '2026-06-30' }
const versao = (id: string, data: string, afeta = ['O1'] as const) => ({
  id,
  data,
  descricao: id,
  afeta: [...afeta],
})

describe('calendário: entradas inválidas e variações', () => {
  it('recusa datas e instantes malformados', () => {
    expect(() => diaDeIso('10/10/2026')).toThrow('Data inválida')
    expect(() => instanteDeIso('2026-10-10 10:00', cal)).toThrow('Instante inválido')
  })

  it('instanteDeIso aceita data simples, sem segundos e com fuso positivo ou negativo', () => {
    const base = instanteDeIso('2026-10-07', cal)
    expect(instanteDeIso('2026-10-07T00:00:00', cal)).toBe(base)
    expect(instanteDeIso('2026-10-07T09:30', cal)).toBe(base + 9.5 * 3_600_000)
    expect(instanteDeIso('2026-10-07T12:00:00-03:00', cal)).toBe(
      instanteDeIso('2026-10-07T15:00:00+00:00', cal),
    )
    expect(instanteDeIso('2026-10-07T12:00:00+02:00', cal)).toBe(
      instanteDeIso('2026-10-07T10:00:00+00:00', cal),
    )
  })

  it('criarCalendario aceita todos os parâmetros explícitos', () => {
    const c = criarCalendario({
      modo: 'corrido',
      turnos: [{ inicioMin: 9 * 60, fimMin: 10 * 60 }],
      feriados: new Set(['2026-10-07']),
      offsetMinutos: 0,
      horasPorDia: 7,
    })
    expect(c).toMatchObject({ modo: 'corrido', offsetMinutos: 0, horasPorDia: 7 })
    expect(c.feriados.has('2026-10-07')).toBe(true)
    expect(criarCalendario({ turnos: [{ inicioMin: 0, fimMin: 120 }] }).horasPorDia).toBe(2)
  })

  it('fimDoExpediente usa o último turno, ou o fim do dia no calendário corrido', () => {
    const dia = diaDeIso('2026-10-07')
    expect(fimDoExpediente(dia, cal)).toBe(instanteDeIso('2026-10-07T17:00-03:00', cal))
    expect(fimDoExpediente(dia, calendarioCorrido(cal))).toBe(
      instanteDeIso('2026-10-08T00:00-03:00', cal),
    )
    const invertido = criarCalendario({
      turnos: [
        { inicioMin: 13 * 60, fimMin: 17 * 60 },
        { inicioMin: 8 * 60, fimMin: 12 * 60 },
      ],
    })
    expect(fimDoExpediente(dia, invertido)).toBe(instanteDeIso('2026-10-07T17:00-03:00', cal))
  })

  it('somarHorasUteis recusa horas negativas, devolve o início para 0 e soma corrido', () => {
    const t = instanteDeIso('2026-10-07T10:00-03:00', cal)
    expect(() => somarHorasUteis(t, -1, cal)).toThrow('negativas')
    expect(somarHorasUteis(t, 0, cal)).toBe(t)
    expect(somarHorasUteis(t, 2, calendarioCorrido(cal))).toBe(t + 2 * 3_600_000)
    expect(horasUteisEntre(t, somarHorasUteis(t, 5, cal), cal)).toBeCloseTo(5, 9)
  })

  it('somarHorasUteis falha com o horizonte excedido quando nunca há dia útil', () => {
    const semDiasUteis = criarCalendario({
      feriados: new Set(),
      turnos: [{ inicioMin: 8 * 60, fimMin: 8 * 60 }],
    })
    expect(() =>
      somarHorasUteis(instanteDeIso('2026-10-07T10:00-03:00', cal), 1, semDiasUteis),
    ).toThrow('horizonte')
  })
})

describe('critérios de cálculo (T2.6)', () => {
  it('marcações do período saem em ordem de data e só das versões que afetam a métrica', () => {
    const versoes = [
      versao('b', '2026-05-01'),
      versao('a', '2026-02-01'),
      versao('fora', '2025-01-01'),
      versao('outra', '2026-03-01', ['O2'] as never),
    ]
    expect(marcacoesNoPeriodo('O1', janela, versoes).map((m) => m.id)).toEqual(['a', 'b'])
    const c = criteriosDe('O1', janela, { inicio: '2026-04-01', fim: '2026-06-30' }, versoes)
    expect(c.serie.map((m) => m.id)).toEqual(['a', 'b'])
    expect(c.janela.map((m) => m.id)).toEqual(['b'])
  })
})

describe('espera invisível: bordas', () => {
  it('índice é zero quando o cliente é zero', () => {
    expect(indiceEspera(0, 5)).toBe(0)
    expect(indiceEspera(10, 4)).toBe(60)
  })

  it('estatística e ponto só publicam com 20 itens ou mais', () => {
    const itens = (n: number) => Array.from({ length: n }, (_, i) => ({ cliente: 10 + i, time: 4 }))
    expect(estatisticaEspera(itens(19), janela).status).toBe('insuficiente')
    const ok = estatisticaEspera(itens(20), janela)
    expect(ok.status).toBe('ok')
    expect(pontoEspera(itens(19))).toEqual({ n: 19, cliente: null, time: null, indicePct: null })
    expect(pontoEspera(itens(20)).indicePct).not.toBeNull()
  })
})

describe('histograma', () => {
  it('um valor acima de todas as faixas fechadas cai na última', () => {
    const faixas = [
      { min: 0, max: 5 },
      { min: 6, max: 10 },
    ]
    expect(indiceFaixa(99, faixas)).toBe(1)
    expect(contarFaixas([1, 7, 99], faixas).map((f) => f.contagem)).toEqual([1, 2])
    expect(
      contarFaixas(
        [],
        [
          { min: 1, max: 1 },
          { min: 2, max: null },
        ],
      ).map((f) => f.rotulo),
    ).toEqual(['1', '+1'])
  })
})

describe('janela e séries', () => {
  it('janela deslocada recua o fim em meses e mantém a especificação', () => {
    const j = janelaMovel('2026-10-09', { unidade: 'semanas', quantidade: 12 })
    const d = janelaDeslocada(j, 6)
    expect(d.fim).toBe('2026-04-09')
    expect(d.quantidade).toBe(12)
  })

  it('período personalizado devolve as datas pedidas', () => {
    expect(
      resolverPeriodo({ tipo: 'custom', de: '2026-02-01', ate: '2026-03-01' }, '2026-10-09'),
    ).toEqual({
      inicio: '2026-02-01',
      fim: '2026-03-01',
    })
  })

  it('semanas, meses e trimestres marcam o último balde como em andamento', () => {
    const ini = diaDeIso('2026-01-15')
    const fim = diaDeIso('2026-10-09')
    const sem = semanasEntre(ini, fim, fim)
    expect(sem.at(-1)?.emAndamento).toBe(true)
    expect(sem[0]?.emAndamento).toBe(false)
    const mes = mesesEntre(ini, fim, fim)
    expect(mes[0]?.chave).toBe('2026-02')
    expect(mes.at(-1)).toMatchObject({ chave: '2026-10', emAndamento: true })
    const tri = trimestresEntre(ini, fim, fim)
    expect(tri.map((t) => t.chave)).toEqual(['2026-T1', '2026-T2', '2026-T3', '2026-T4'])
    expect(isoDeDia(tri[0]?.fimDia as number)).toBe('2026-03-31')
  })
})

describe('ordenação neutra e percentil', () => {
  it('ordena por várias chaves, trata chave ausente como menor e desempata pela entrada', () => {
    const itens = [
      { id: 'c', k: [1, 'b'] },
      { id: 'a', k: [1] },
      { id: 'b', k: [1, 'a'] },
      { id: 'd', k: [0, 'z'] },
      { id: 'e', k: [1, 'a'] },
    ]
    expect(ordenarNeutro(itens, (x) => x.k).map((x) => x.id)).toEqual(['d', 'a', 'b', 'e', 'c'])
    expect(ordenarNeutro([{ k: [2] }, { k: [1] }], (x) => x.k)).toEqual([{ k: [1] }, { k: [2] }])
    expect(ordenarNeutro([{ k: [1, 'a'] }, { k: [1] }], (x) => x.k)[0]).toEqual({ k: [1] })
  })

  it('chaves iguais em texto (1 e "1") empatam e mantêm a ordem de entrada', () => {
    const itens = [
      { id: 'b', k: ['1'] },
      { id: 'a', k: [1] },
    ]
    expect(ordenarNeutro(itens, (x) => x.k).map((x) => x.id)).toEqual(['b', 'a'])
  })

  it('percentil recusa amostra vazia e p fora de [0, 1]', () => {
    expect(() => percentilOrdenado([], 0.5)).toThrow('amostra vazia')
    expect(() => percentilOrdenado([1], 1.1)).toThrow('fora de [0, 1]')
    expect(() => percentil([1], -0.1)).toThrow(RangeError)
    expect(percentil([4, 1, 3, 2], 0.5)).toBe(2.5)
    expect(mediana([1, 2, 3])).toBe(2)
  })
  it('média recusa amostra vazia e não depende da ordem de entrada', () => {
    expect(() => media([])).toThrow('amostra vazia')
    expect(media([0.1, 0.2, 0.3])).toBe(media([0.3, 0.1, 0.2]))
  })
})

describe('dia útil', () => {
  it('calendário corrido trata sábado e feriado como dia útil', () => {
    const sabado = diaDeIso('2026-10-10')
    expect(ehDiaUtil(sabado, cal)).toBe(false)
    expect(ehDiaUtil(sabado, calendarioCorrido(cal))).toBe(true)
  })
})
