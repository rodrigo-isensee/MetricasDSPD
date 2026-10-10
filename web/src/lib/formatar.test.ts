import { describe, expect, it } from 'vitest'
import {
  dataValida,
  diffDias,
  fmtDataCurta,
  fmtDiasCorridos,
  fmtDiasUteis,
  fmtHorasUteis,
  fmtMes,
  fmtPct,
  fmtTrimestre,
  plural,
  semanasDoIntervalo,
  textoJanela,
} from './formatar'

describe('formatação pt-BR', () => {
  it('data, mês, trimestre e porcentagem', () => {
    expect(fmtDataCurta('2026-10-09')).toBe('09/10')
    expect(fmtMes('2026-06')).toBe('jun/2026')
    expect(fmtMes('2026-13')).toBe('13/2026')
    expect(fmtTrimestre('2026-T3')).toBe('3º tri/2026')
    expect(fmtPct(12.5, 1)).toBe('12,5%')
    expect(plural(1, 'item', 'itens')).toBe('item')
    expect(plural(2, 'item', 'itens')).toBe('itens')
  })

  it('dias úteis e corridos usam o singular só para 1', () => {
    expect(fmtDiasUteis(1)).toBe('1 dia útil')
    expect(fmtDiasUteis(1.04)).toBe('1 dia útil')
    expect(fmtDiasUteis(2.5)).toBe('2,5 dias úteis')
    expect(fmtDiasCorridos(1)).toBe('1 dia')
    expect(fmtDiasCorridos(3)).toBe('3 dias')
  })

  it('horas úteis: minutos abaixo de 1 h, horas até 3 dias úteis, dias acima', () => {
    expect(fmtHorasUteis(0.5)).toBe('30 min')
    expect(fmtHorasUteis(5.5)).toBe('5,5 h úteis')
    expect(fmtHorasUteis(24)).toBe('3 dias úteis')
    expect(fmtHorasUteis(8, 2)).toBe('4 dias úteis')
  })

  it('diferença de datas, validade e janelas', () => {
    expect(diffDias('2026-10-01', '2026-10-09')).toBe(8)
    expect(dataValida('2026-02-30')).toBe(false)
    expect(dataValida('2026-2-3')).toBe(false)
    expect(dataValida('2026-02-28')).toBe(true)
    expect(textoJanela({ unidade: 'semanas', quantidade: 12 })).toBe('12 semanas')
    expect(textoJanela({ unidade: 'semanas', quantidade: 1 })).toBe('1 semana')
    expect(textoJanela({ unidade: 'meses', quantidade: 1 })).toBe('1 mês')
    expect(textoJanela({ unidade: 'meses', quantidade: 6 })).toBe('6 meses')
    expect(semanasDoIntervalo({ inicio: '2026-01-01', fim: '2026-03-25' })).toBe(12)
  })
})
