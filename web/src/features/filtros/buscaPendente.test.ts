import { afterEach, describe, expect, it, vi } from 'vitest'
import { buscaVigente, limparBuscaPendente, registrarBusca } from './buscaPendente'

afterEach(() => {
  vi.useRealTimers()
  limparBuscaPendente()
})

describe('buscaPendente', () => {
  it('sem navegação pendente, vale a busca renderizada', () => {
    expect(buscaVigente('/operacional', '?a=1')).toBe('?a=1')
  })

  it('com navegação pendente na mesma rota, vale a pendente até a URL renderizada alcançá-la', () => {
    registrarBusca('/operacional', '?equipe=fluig&tipo=incidente')
    // URL intermediária chegando atrasada: a pendente continua valendo
    expect(buscaVigente('/operacional', '?equipe=fluig')).toBe('?equipe=fluig&tipo=incidente')
    expect(buscaVigente('/operacional', '?equipe=fluig&tipo=incidente')).toBe(
      '?equipe=fluig&tipo=incidente',
    )
    // alcançada: some, e a próxima leitura devolve a renderizada
    expect(buscaVigente('/operacional', '?outra=1')).toBe('?outra=1')
  })

  it('troca de rota descarta a pendente', () => {
    registrarBusca('/operacional', '?equipe=fluig')
    expect(buscaVigente('/tatico', '')).toBe('')
    expect(buscaVigente('/operacional', '')).toBe('')
  })

  it('a pendente expira (navegação interrompida ou normalizada para outra URL)', () => {
    vi.useFakeTimers()
    registrarBusca('/operacional', '?equipe=fluig')
    vi.advanceTimersByTime(3001)
    expect(buscaVigente('/operacional', '')).toBe('')
  })
})
