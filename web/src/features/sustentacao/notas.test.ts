import { describe, expect, it } from 'vitest'
import { acelerato } from '@metricas-dspd/metricas'
import { NOTAS_SUSTENTACAO } from './notas'

const { ALVOS_PADRAO } = acelerato

/** Prazos corridos e úteis tirados de ALVOS_PADRAO, no formato "P1 primeiro atendimento". */
function prazosPorUnidade(unidade: 'corrido' | 'util'): string[] {
  return ALVOS_PADRAO.flatMap((a) => [
    ...(a.unidade_primeiro_atendimento === unidade ? [`${a.prioridade} primeiro atendimento`] : []),
    ...(a.unidade_restauracao === unidade ? [`${a.prioridade} restauração`] : []),
  ])
}

describe('S1: o texto dos prazos acompanha as unidades de ALVOS_PADRAO', () => {
  const texto = NOTAS_SUSTENTACAO.S1!.comoSeCalcula

  it('os prazos corridos são exatamente os que o texto cita', () => {
    expect(prazosPorUnidade('corrido')).toEqual([
      'P1 primeiro atendimento',
      'P1 restauração',
      'P2 primeiro atendimento',
    ])
    expect(texto).toContain(
      'P1 (primeiro atendimento e restauração) e o primeiro atendimento de P2 contam em horas corridas',
    )
  })

  it('todos os demais prazos são úteis, como o texto diz', () => {
    expect(prazosPorUnidade('util')).toHaveLength(ALVOS_PADRAO.length * 2 - 3)
    expect(texto).toContain('Os demais prazos contam em horas úteis')
  })
})
