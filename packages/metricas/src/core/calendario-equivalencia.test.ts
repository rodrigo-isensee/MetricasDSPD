import { describe, expect, it } from 'vitest'
import {
  CALENDARIO_PADRAO,
  FERIADOS_NACIONAIS,
  MS_DIA,
  MS_HORA,
  MS_MINUTO,
  calendarioCorrido,
  criarCalendario,
  diaDaSemana,
  diaLocal,
  diasDesdeCivil,
  diasUteisNoIntervalo,
  ehDiaUtil,
  horasUteisEntre,
  instanteDe,
  isoDeDia,
  somarHorasUteis,
  type Calendario,
} from './calendario.ts'

/* Referência: cópia literal do código anterior ao K-174 (feriados consultados por string, um `isoDeDia` por dia). */
function ehDiaUtilAntigo(dia: number, cal: Calendario): boolean {
  if (cal.modo === 'corrido') return true
  return diaDaSemana(dia) < 5 && !cal.feriados.has(isoDeDia(dia))
}

function horasUteisEntreAntigo(inicio: number, fim: number, cal: Calendario): number {
  if (fim < inicio) throw new RangeError('horasUteisEntre: fim anterior ao início')
  if (fim === inicio) return 0
  if (cal.modo === 'corrido') return (fim - inicio) / MS_HORA
  const d0 = diaLocal(inicio, cal)
  const d1 = diaLocal(fim, cal)
  let ms = 0
  for (let d = d0; d <= d1; d++) {
    if (!ehDiaUtilAntigo(d, cal)) continue
    for (const t of cal.turnos) {
      const a = Math.max(inicio, instanteDe(d, t.inicioMin, cal))
      const b = Math.min(fim, instanteDe(d, t.fimMin, cal))
      if (b > a) ms += b - a
    }
  }
  return ms / MS_HORA
}

function somarHorasUteisAntigo(inicio: number, horas: number, cal: Calendario): number {
  if (horas < 0) throw new RangeError('somarHorasUteis: horas negativas')
  if (horas === 0) return inicio
  if (cal.modo === 'corrido') return inicio + horas * MS_HORA
  let restante = horas * MS_HORA
  let d = diaLocal(inicio, cal)
  for (let guarda = 0; guarda < 100_000; guarda++, d++) {
    if (!ehDiaUtilAntigo(d, cal)) continue
    for (const t of cal.turnos) {
      const ini = Math.max(inicio, instanteDe(d, t.inicioMin, cal))
      const fim = instanteDe(d, t.fimMin, cal)
      if (fim <= ini) continue
      const disp = fim - ini
      if (restante <= disp) return ini + restante
      restante -= disp
    }
  }
  throw new RangeError('somarHorasUteis: horizonte excedido')
}

function mulberry32(semente: number): () => number {
  let a = semente
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const DIA_10000 = diasDesdeCivil(10000, 1, 1)

const calendarios: Record<string, Calendario> = {
  padrao: CALENDARIO_PADRAO,
  corrido: calendarioCorrido(CALENDARIO_PADRAO),
  semFeriados: criarCalendario({ feriados: new Set() }),
  // textos que nunca casam com um dia (data inexistente, sufixo) e um que só casa fora de 0..9999
  estranhos: criarCalendario({
    feriados: new Set([
      ...FERIADOS_NACIONAIS,
      '2026-02-30',
      '2026-01-01T00:00',
      '10000-01-01',
      '2026-1-1',
      'lixo',
    ]),
  }),
  invertido: criarCalendario({
    turnos: [
      { inicioMin: 17 * 60, fimMin: 8 * 60 },
      { inicioMin: 9 * 60, fimMin: 12 * 60 },
    ],
  }),
  foraDeDia: criarCalendario({
    turnos: [
      { inicioMin: -60, fimMin: 120 },
      { inicioMin: 1300, fimMin: 1500 },
    ],
  }),
  sobrepostos: criarCalendario({
    turnos: [
      { inicioMin: 8 * 60, fimMin: 14 * 60 },
      { inicioMin: 12 * 60, fimMin: 18 * 60 },
    ],
  }),
  fusoMais: criarCalendario({ offsetMinutos: 330 }),
}

describe('K-174: ehDiaUtil com feriados em número de dia dá o mesmo resultado do código anterior', () => {
  const faixas: [number, number][] = [
    [diasDesdeCivil(2024, 12, 1), diasDesdeCivil(2027, 2, 1)],
    [diasDesdeCivil(1999, 12, 20), diasDesdeCivil(2000, 1, 10)],
    [diasDesdeCivil(9999, 12, 20), diasDesdeCivil(10000, 1, 10)],
  ]
  for (const [nome, cal] of Object.entries(calendarios)) {
    it(`calendário ${nome}: todos os dias das faixas, bit a bit`, () => {
      for (const [de, ate] of faixas) {
        for (let d = de; d <= ate; d++) {
          expect(ehDiaUtil(d, cal)).toBe(ehDiaUtilAntigo(d, cal))
        }
      }
    })
  }

  it('dia fracionário, NaN e infinito seguem o caminho anterior', () => {
    for (const [, cal] of Object.entries(calendarios)) {
      for (const d of [20_000.5, 20_454.25, -0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
        expect(ehDiaUtil(d, cal)).toBe(ehDiaUtilAntigo(d, cal))
      }
    }
  })

  it('o feriado fora de 0..9999 continua valendo e a data inexistente continua sem efeito', () => {
    expect(ehDiaUtil(DIA_10000, calendarios.estranhos as Calendario)).toBe(
      ehDiaUtilAntigo(DIA_10000, calendarios.estranhos as Calendario),
    )
    expect(ehDiaUtil(DIA_10000, calendarios.estranhos as Calendario)).toBe(false)
    // 2026-03-02 (segunda): '2026-02-30' não pode virar feriado em 2 de março
    const segunda = diasDesdeCivil(2026, 3, 2)
    expect(ehDiaUtil(segunda, calendarios.estranhos as Calendario)).toBe(true)
    // 2026-01-01 é feriado nacional (quinta)
    expect(ehDiaUtil(diasDesdeCivil(2026, 1, 1), calendarios.estranhos as Calendario)).toBe(false)
  })
})

describe('K-174: horas úteis e soma de horas iguais ao código anterior (Object.is, semente fixa)', () => {
  const sorteio = mulberry32(20261111)
  const base = diasDesdeCivil(2025, 1, 1) * MS_DIA
  const casos = Array.from({ length: 1500 }, () => {
    const fracionario = sorteio() < 0.5
    const raw = base + sorteio() * 800 * MS_DIA
    const inicio = fracionario ? raw : Math.floor(raw / MS_MINUTO) * MS_MINUTO
    const duracao = sorteio() < 0.2 ? sorteio() * MS_DIA : sorteio() * 120 * MS_DIA
    return { inicio, fim: inicio + duracao, horas: sorteio() * 500 }
  })

  for (const [nome, cal] of Object.entries(calendarios)) {
    it(`calendário ${nome}`, () => {
      for (const c of casos) {
        expect(
          Object.is(
            horasUteisEntre(c.inicio, c.fim, cal),
            horasUteisEntreAntigo(c.inicio, c.fim, cal),
          ),
        ).toBe(true)
        expect(Object.is(horasUteisEntre(c.inicio, c.inicio, cal), 0)).toBe(true)
        if (nome !== 'foraDeDia' && nome !== 'invertido') {
          expect(
            Object.is(
              somarHorasUteis(c.inicio, c.horas, cal),
              somarHorasUteisAntigo(c.inicio, c.horas, cal),
            ),
          ).toBe(true)
        }
      }
    })
  }

  it('diasUteisNoIntervalo coincide com o filtro do código anterior', () => {
    const de = diasDesdeCivil(2025, 12, 20)
    const ate = diasDesdeCivil(2026, 1, 12)
    for (const cal of Object.values(calendarios)) {
      const esperado: number[] = []
      for (let d = de; d <= ate; d++) if (ehDiaUtilAntigo(d, cal)) esperado.push(d)
      expect(diasUteisNoIntervalo(de, ate, cal)).toEqual(esperado)
    }
  })
})

describe('K-174: criarCalendario é dono do seu conjunto de feriados', () => {
  it('mutar o Set de origem depois não muda o calendário nem o resultado de ehDiaUtil', () => {
    const origem = new Set(['2026-03-02'])
    const cal = criarCalendario({ feriados: origem })
    const segunda = diasDesdeCivil(2026, 3, 2)
    expect(ehDiaUtil(segunda, cal)).toBe(false)
    origem.delete('2026-03-02')
    origem.add('2026-03-03')
    expect(cal.feriados).not.toBe(origem)
    expect(cal.feriados.has('2026-03-02')).toBe(true)
    expect(ehDiaUtil(segunda, cal)).toBe(false)
    expect(ehDiaUtil(diasDesdeCivil(2026, 3, 3), cal)).toBe(true)
  })

  it('o calendário corrido reaproveita o mesmo conjunto', () => {
    const cal = criarCalendario({ feriados: new Set(['2026-03-02']) })
    expect(calendarioCorrido(cal).feriados).toBe(cal.feriados)
  })
})
