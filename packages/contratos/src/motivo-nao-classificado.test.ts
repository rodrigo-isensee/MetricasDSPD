import { describe, expect, it } from 'vitest'
import {
  MOTIVOS_BLOQUEIO,
  MOTIVOS_BLOQUEIO_PUBLICADOS,
  MOTIVO_NAO_CLASSIFICADO,
  resultadoBloqueados,
  resultadoO19,
  resultadoO2,
} from '.'

/** Lote 1a do pedido 075: o 8º valor de motivo (P-075-3) entra no contrato publicado, sem mexer nos 7 do briefing. */
const PESSOA =
  /respons[aá]vel|usu[aá]rio|pessoa|autor|owner|assignee|agente|e-?mail|ranking|equipe/i

// Os três contratos usam o mesmo enum; extraímos o campo de motivo de cada um pelo caminho do schema.
const motivoDeBloqueados = resultadoBloqueados.shape.itens.element.shape.motivo
const motivoDeO2 = resultadoO2.shape.itens.element.shape.bloqueioMotivo.unwrap()
const motivoDeO19 = resultadoO19.shape.motivos.element.shape.motivo
const CAMPOS = { BLOQUEADOS: motivoDeBloqueados, O2: motivoDeO2, O19: motivoDeO19 }

describe('motivo "não classificado" (075 L1a)', () => {
  it('o texto é exatamente o da UX e o publicado tem 8 valores (os 7 do briefing + 1)', () => {
    expect(MOTIVO_NAO_CLASSIFICADO).toBe('não classificado')
    expect(MOTIVOS_BLOQUEIO).toHaveLength(7)
    expect(MOTIVOS_BLOQUEIO_PUBLICADOS).toEqual([...MOTIVOS_BLOQUEIO, 'não classificado'])
  })

  it.each(Object.entries(CAMPOS))('%s aceita os 8 valores e recusa um nono', (_nome, campo) => {
    for (const m of MOTIVOS_BLOQUEIO_PUBLICADOS) expect(campo.safeParse(m).success, m).toBe(true)
    expect(campo.safeParse('outro motivo').success).toBe(false)
    expect(campo.safeParse('Não classificado').success).toBe(false)
  })

  it('CA-075-11: nenhum segmento de pessoa nas chaves dos três contratos', () => {
    const chaves = (s: unknown): string[] => {
      const f = s as { shape?: Record<string, unknown>; element?: unknown; unwrap?: () => unknown }
      if (f.shape) return Object.entries(f.shape).flatMap(([k, v]) => [k, ...chaves(v)])
      if (f.element) return chaves(f.element)
      if (typeof f.unwrap === 'function') return chaves(f.unwrap())
      return []
    }
    for (const c of [resultadoBloqueados, resultadoO2, resultadoO19])
      expect(chaves(c).filter((k) => PESSOA.test(k))).toEqual([])
  })
})
