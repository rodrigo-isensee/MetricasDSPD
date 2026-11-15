import { describe, expect, it } from 'vitest'
import { leituraS12 } from './sustentacao'

type Entrada = Parameters<typeof leituraS12>[0]
const base = (excecaoSla: unknown) => ({ excecaoSla }) as unknown as Entrada

describe('leituraS12', () => {
  it('com exceção de SLA nula mostra "sem dado" e nunca 0%', () => {
    const t = leituraS12(base(null), ['Sistema A', 12])
    expect(t).toContain(
      'Chamados abertos no sistema depois do atendimento: sem dado (hoje essa marca não vem do Acelerato).',
    )
    expect(t).not.toContain('0%')
  })

  it('com exceção de SLA presente mostra a taxa', () => {
    const t = leituraS12(base({ status: 'ok', k: 5, n: 50, pct: 10 }), ['Sistema A', 12])
    expect(t).toContain('Chamados abertos no sistema depois do atendimento: 10%.')
  })

  it('abaixo do mínimo mostra "k de n"', () => {
    const t = leituraS12(base({ status: 'insuficiente', k: 1, n: 4 }), ['Sistema A', 12])
    expect(t).toContain('atendimento: 1 de 4.')
  })
})
