import { describe, expect, it } from 'vitest'
import {
  DURACAO_CALIBRACAO_DIAS,
  janelasCalibracao,
  metricasDaFonte,
  metricasEmCalibracao,
  vigentes,
} from './calibracao'

// F6 do plano 052 (Q-7a): 60 dias corridos a partir da primeira coleta real, cobrindo também as complementares (O19 a O26).
describe('calibração do BusinessMap (F6)', () => {
  it('são 60 dias corridos e cobrem as métricas do FL1, as complementares e a espera invisível', () => {
    expect(DURACAO_CALIBRACAO_DIAS).toBe(60)
    const ids = metricasDaFonte('businessmap')
    for (const id of ['O1', 'O13', 'O19', 'O22', 'O26', 'EI_FL1'] as const)
      expect(ids).toContain(id)
    const [j] = janelasCalibracao('businessmap', '2026-11-02', [])
    expect(j).toMatchObject({ inicio: '2026-11-02', fim: '2026-12-31', origem: 'inicio-coleta' })
    expect(metricasEmCalibracao(vigentes([j!], '2026-12-31'))).toEqual(
      expect.arrayContaining(['O1', 'O19', 'O26', 'EI_FL1']),
    )
    expect(metricasEmCalibracao(vigentes([j!], '2027-01-01'))).toEqual([])
  })
})
