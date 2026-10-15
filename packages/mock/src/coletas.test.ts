import {
  estadoColetaSchema,
  eventoColetaSchema,
  paginaColetasSchema,
} from '@metricas-dspd/contratos'
import { montarEstadoColeta, paginarColetas } from '@metricas-dspd/metricas/core'
import { CRITERIOS_MOCK } from './criterios'
import { gerarBaseMock, type BaseMock } from './index'
import { gerarColetasMock } from './coletas'
import { hashJson } from './prng'

const base: BaseMock = gerarBaseMock({ escala: 0.2 })
const antes = hashJson(base)
const c = gerarColetasMock(base)
const hoje = Date.parse(base.config.hoje)

describe('gerarColetasMock', () => {
  it('é determinístico e não altera a base', () => {
    expect(hashJson(gerarColetasMock(base))).toBe(hashJson(c))
    expect(hashJson(base)).toBe(antes)
    expect(hashJson(gerarBaseMock())).toBe('68a67741')
  })
  it('valida pelos schemas e BM falha em 09/10 com selo falha', () => {
    for (const e of [...c.businessmap, ...c.acelerato])
      expect(eventoColetaSchema.parse(e)).toEqual(e)
    const bm = montarEstadoColeta('businessmap', c.businessmap, CRITERIOS_MOCK, hoje)
    expect(estadoColetaSchema.parse(bm).selo).toBe('falha')
    expect(bm.ultimaOk?.id).toBe('bm-2026-10-08')
    expect(bm.falhasRecentes.map((e) => e.tipoErro)).toEqual(['tempo-esgotado'])
    expect(bm.calibracao).toEqual([])
  })
  it('AC: atual e calibração 15/09 a 13/11 só com métricas S*, O17, EI_SUST e TENDENCIA_SUST', () => {
    const ac = montarEstadoColeta('acelerato', c.acelerato, CRITERIOS_MOCK, hoje)
    expect(ac.selo).toBe('atual')
    expect(ac.calibracao).toHaveLength(1)
    expect(ac.calibracao[0]).toMatchObject({ inicio: '2026-09-15', fim: '2026-11-13' })
    expect(ac.metricasEmCalibracao).toEqual([
      'O17',
      'S1',
      'S2',
      'S3',
      'S4',
      'S5',
      'S6',
      'S7',
      'S8',
      'S9',
      'S10',
      'S11',
      'S12',
      'EI_SUST',
      'TENDENCIA_SUST',
    ])
  })
  it('histórico paginado em 20, mais recente primeiro, pelo schema', () => {
    const p = paginaColetasSchema.parse(paginarColetas(c.businessmap, 1))
    expect(p.itens).toHaveLength(20)
    expect(p.itens[0]?.id).toBe('bm-2026-10-09')
    expect(p.total).toBe(c.businessmap.length)
  })
})
