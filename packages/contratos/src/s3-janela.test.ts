import { describe, expect, it } from 'vitest'
import { resultadoS3 } from './schemas'

// QA da Sustentação no Operacional, CT-53: `ResultadoS3.janela` é obrigatória. Um S3 gerado por fora, sem a janela,
// quebra no schema de saída (a tela não soma nem divide meses para recompor o volume e o P1+P2 da janela inteira).
describe('S3.janela no schema de saída (CT-53)', () => {
  const campo = resultadoS3.shape.janela

  it('existe no schema e recusa a ausência (campo obrigatório, sem `optional`)', () => {
    expect(Object.keys(resultadoS3.shape)).toContain('janela')
    expect(campo.safeParse(undefined).success).toBe(false)
    expect(campo.safeParse({ total: 20 }).success).toBe(false) // falta p1p2
  })

  it('aceita a janela com k de n abaixo de 20 e com percentual a partir de 20 (fronteira do mínimo)', () => {
    const insuficiente = { status: 'insuficiente', k: 5, n: 19, minimo: 20 }
    expect(campo.safeParse({ total: 19, p1p2: insuficiente }).success).toBe(true)
    expect(
      campo.safeParse({ total: 20, p1p2: { status: 'ok', k: 5, n: 20, pct: 25 } }).success,
    ).toBe(true)
    // 19 itens nunca publicam percentual
    expect(
      campo.safeParse({ total: 19, p1p2: { status: 'ok', k: 5, n: 19, pct: 26.3 } }).success,
    ).toBe(false)
  })
})
