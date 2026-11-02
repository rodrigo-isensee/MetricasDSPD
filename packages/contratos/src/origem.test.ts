import { describe, expect, it } from 'vitest'
import { METRICA_IDS } from './comum'
import {
  motivoDaOrigemMock,
  NOTAS_FIXAS_DO_CARTAO,
  notaCartaoIdSchema,
  origemDaMetrica,
  TEXTO_NOTA_CARTAO,
} from './origem'
import { resultadoO3 } from './schemas'

describe('origemDaMetrica (H-13)', () => {
  it('é real exatamente para as 11 do FL1 com dado no quadro e a Espera invisível do FL1', () => {
    const reais = METRICA_IDS.filter((id) => origemDaMetrica(id) === 'real')
    expect([...reais].sort()).toEqual(
      ['O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O9', 'O10', 'O11', 'O13', 'EI_FL1'].sort(),
    )
  })

  it('é mock, com o motivo, para O8, O12, O14, O15, O16, O17 e O18', () => {
    for (const id of ['O8', 'O12', 'O14', 'O15', 'O16', 'O17', 'O18'] as const) {
      expect(origemDaMetrica(id)).toBe('mock')
      expect(motivoDaOrigemMock(id)).toBe('aguardando campo no quadro')
    }
  })

  it('O19 a O26, FL2, FL3 e Sustentação seguem mock, sem motivo próprio', () => {
    for (const id of ['O19', 'O26', 'T1', 'E1', 'S1', 'EI_SUST'] as const) {
      expect(origemDaMetrica(id)).toBe('mock')
      expect(motivoDaOrigemMock(id)).toBeNull()
    }
  })

  it('métrica real não tem motivo de dado fictício', () => {
    expect(motivoDaOrigemMock('O1')).toBeNull()
  })
})

describe('notas de cartão', () => {
  it('O6 e o SLE (T2) levam a nota de classe; todo id de nota tem texto', () => {
    expect(NOTAS_FIXAS_DO_CARTAO.O6).toEqual(['sem-classe'])
    expect(NOTAS_FIXAS_DO_CARTAO.T2).toEqual(['sem-classe'])
    expect(TEXTO_NOTA_CARTAO['sem-classe']).toContain('Sem separação por classe')
    expect(TEXTO_NOTA_CARTAO['sle-nao-definido']).toBe('SLE não definido.')
    expect(notaCartaoIdSchema.safeParse('outra').success).toBe(false)
  })

  it('o resultado do O3 aceita `notas` opcional e só com ids do contrato', () => {
    const forma = resultadoO3.shape.notas
    expect(forma.safeParse(undefined).success).toBe(true)
    expect(forma.safeParse(['sle-nao-definido']).success).toBe(true)
    expect(forma.safeParse(['qualquer']).success).toBe(false)
  })
})
