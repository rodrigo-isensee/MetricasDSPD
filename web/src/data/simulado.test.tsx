import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  corpoSemDadoReal,
  type FiltrosFluxo,
  type FiltrosSustentacao,
  type MetricaId,
} from '@metricas-dspd/contratos'
import { fonteDeTeste } from '@/test/helpers'
import {
  FonteComSimulado,
  FonteMetricasProvider,
  SemDadoRealErro,
  filtrosSoPeriodo,
  type FonteMetricas,
} from '.'
import { useMetrica } from './useMetrica'

const FILTROS: FiltrosFluxo = {
  equipe: ['alfa'],
  tipo: [],
  sistema: ['x'],
  periodo: { tipo: '12s' },
}
const SUST: FiltrosSustentacao = { equipe: [], prioridade: [], periodo: { tipo: '12s' } }
const LIMPOS: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }
const MOTIVO = 'aguardando campo no quadro'

/** A API real, de dublê: ids em `semDado` respondem `sem-dado-real` (como a API); os demais, o DTO. */
function criarReal(semDado: Map<string, boolean>) {
  const obter = vi.fn((id: MetricaId, ...resto: unknown[]) => {
    const simulavel = semDado.get(id)
    if (simulavel !== undefined) {
      const c = corpoSemDadoReal(id)
      return Promise.reject(new SemDadoRealErro(c.metrica, MOTIVO, simulavel))
    }
    return (fonteDeTeste.obter as (...a: unknown[]) => Promise<unknown>)(id, ...resto)
  })
  const real = Object.create(fonteDeTeste, {
    tipo: { value: 'api' },
    obter: { value: obter },
    dataReferencia: { value: () => Promise.resolve('2026-10-09') },
  }) as FonteMetricas
  return { real, obter }
}

/** O mock sob demanda: dublê que registra a data de corte e as chamadas e devolve o mock de verdade. */
function criarMockEspiao(obterMock?: (id: MetricaId, f: unknown) => Promise<unknown>) {
  const obter = vi.fn(
    obterMock ??
      ((id: MetricaId, f: unknown) =>
        (fonteDeTeste.obter as (...a: unknown[]) => Promise<unknown>)(id, f)),
  )
  const mock = Object.create(fonteDeTeste, { obter: { value: obter } }) as FonteMetricas
  const criarMock = vi.fn((_hoje: string) => Promise.resolve(mock))
  return { criarMock, obter }
}

function montar(fonte: FonteMetricas) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <FonteMetricasProvider fonte={fonte}>
        <MemoryRouter>{children}</MemoryRouter>
      </FonteMetricasProvider>
    </QueryClientProvider>
  )
  return { wrapper }
}

beforeEach(() => {
  vi.spyOn(console, 'info').mockImplementation(() => undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
})
afterEach(() => vi.restoreAllMocks())

describe('useMetrica com a fonte decoradora (pedido 070)', () => {
  it('T-W1: DTO real fica real: o mock não é criado e nenhum Worker é aberto', async () => {
    const Worker = vi.fn()
    vi.stubGlobal('Worker', Worker)
    const { real } = criarReal(new Map())
    const { criarMock } = criarMockEspiao()
    const fonte = new FonteComSimulado(real, { criarMock })
    const { result } = renderHook(() => useMetrica('O3', LIMPOS, { simulado: true }), montar(fonte))
    await waitFor(() => expect(result.current.estado).toBe('ok'))
    expect(result.current.origem).toBe('real')
    expect(criarMock).not.toHaveBeenCalled()
    expect(Worker).not.toHaveBeenCalled()
    expect(fonte.origensSimuladas.getSnapshot().size).toBe(0)
    vi.unstubAllGlobals()
  })

  it('T-W2: sem-dado-real simulável chama o mock com o mesmo id, só o período, a data de referência e valida o DTO', async () => {
    const { real } = criarReal(new Map([['O12', true]]))
    const { criarMock, obter } = criarMockEspiao()
    const fonte = new FonteComSimulado(real, { criarMock })
    const { result } = renderHook(
      () => useMetrica('O12', FILTROS, { simulado: true }),
      montar(fonte),
    )
    await waitFor(() => expect(result.current.estado).toBe('ok'))
    expect(result.current.origem).toBe('simulado')
    expect(result.current.erro).toBeNull()
    expect(result.current.dados?.totais).toBeDefined()
    expect(criarMock).toHaveBeenCalledTimes(1)
    expect(criarMock).toHaveBeenCalledWith('2026-10-09T18:00:00-03:00')
    expect(obter).toHaveBeenCalledTimes(1)
    expect(obter).toHaveBeenCalledWith('O12', {
      equipe: [],
      tipo: [],
      sistema: [],
      periodo: { tipo: '12s' },
    })
    expect(fonte.origensSimuladas.getSnapshot().get('O12')).toEqual({ motivo: MOTIVO })
  })

  it('o simulado segue o período e não refaz a conta quando só um filtro de dimensão muda', async () => {
    const { real } = criarReal(new Map([['O12', true]]))
    const { criarMock, obter } = criarMockEspiao()
    const fonte = new FonteComSimulado(real, { criarMock })
    let filtros: typeof FILTROS | { [k: string]: unknown } = FILTROS
    const { result, rerender } = renderHook(
      () => useMetrica('O12', filtros as typeof FILTROS, { simulado: true }),
      montar(fonte),
    )
    await waitFor(() => expect(result.current.origem).toBe('simulado'))
    filtros = { ...FILTROS, equipe: ['beta'] }
    rerender()
    await waitFor(() => expect(result.current.estado).toBe('ok'))
    expect(obter).toHaveBeenCalledTimes(1)
    expect(criarMock).toHaveBeenCalledTimes(1)
  })

  it('trocar o período recalcula o simulado e mantém o anterior na tela (atualizando) até chegar', async () => {
    const { real } = criarReal(new Map([['O12', true]]))
    let solta: (v: unknown) => void = () => undefined
    const { criarMock, obter } = criarMockEspiao((id, f) =>
      obter.mock.calls.length === 1
        ? (fonteDeTeste.obter as (...a: unknown[]) => Promise<unknown>)(id, f)
        : new Promise((r) => (solta = r)),
    )
    const fonte = new FonteComSimulado(real, { criarMock })
    let periodo: { tipo: '4s' | '12s' } = { tipo: '12s' }
    const { result, rerender } = renderHook(
      () => useMetrica('O12', { ...LIMPOS, periodo }, { simulado: true }),
      montar(fonte),
    )
    await waitFor(() => expect(result.current.origem).toBe('simulado'))
    const anterior = result.current.dados
    periodo = { tipo: '4s' }
    rerender()
    await waitFor(() => expect(result.current.atualizando).toBe(true))
    expect(result.current.origem).toBe('simulado')
    expect(result.current.dados).toBe(anterior)
    solta(await (fonteDeTeste.obter as (...a: unknown[]) => Promise<unknown>)('O12', LIMPOS))
    await waitFor(() => expect(result.current.atualizando).toBe(false))
    expect(obter).toHaveBeenCalledTimes(2)
  })

  it('o aviso no console sai uma vez por métrica, e erro que não é Error também volta a "Sem dado real"', async () => {
    const { real } = criarReal(new Map([['O12', true]]))
    const { criarMock } = criarMockEspiao()
    const fonte = new FonteComSimulado(real, { criarMock })
    await fonte.obterSimulado('O12', LIMPOS, MOTIVO)
    await fonte.obterSimulado('O12', { ...LIMPOS, periodo: { tipo: '4s' } }, MOTIVO)
    expect(console.info).toHaveBeenCalledTimes(1)
    expect(console.info).toHaveBeenCalledWith('O12: simulado')
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    const ruim = new FonteComSimulado(real, { criarMock: () => Promise.reject('texto') })
    await expect(ruim.obterSimulado('O12', LIMPOS, MOTIVO)).rejects.toBe('texto')
    expect(console.error).toHaveBeenCalledWith('O12: simulado indisponível (erro)')
  })

  it('sem criarMock, o decorador cria o MockFonteMetricas sob demanda, com a data de referência', async () => {
    const { real } = criarReal(new Map([['O12', true]]))
    const fonte = new FonteComSimulado(real)
    const r = await fonte.obterSimulado('O12', LIMPOS, MOTIVO)
    expect(r.totais).toBeDefined()
    expect(fonte.origensSimuladas.getSnapshot().get('O12')).toEqual({ motivo: MOTIVO })
  })

  it('simulado com 0 itens no recorte é "vazio" e segue simulado (o selo fica)', async () => {
    const { real } = criarReal(new Map([['O18', true]]))
    const { criarMock } = criarMockEspiao(async (id, f) => {
      const d = (await (fonteDeTeste.obter as (...a: unknown[]) => Promise<unknown>)(id, f)) as {
        base: { n: number }
      }
      return { ...d, base: { ...d.base, n: 0 } }
    })
    const fonte = new FonteComSimulado(real, { criarMock })
    const { result } = renderHook(
      () => useMetrica('O18', LIMPOS, { simulado: true }),
      montar(fonte),
    )
    await waitFor(() => expect(result.current.estado).toBe('vazio'))
    expect(result.current.origem).toBe('simulado')
    expect(fonte.origensSimuladas.getSnapshot().has('O18')).toBe(true)
  })

  it('T-W4: simulavel false (ou ausente) fica "Sem dado real" e nunca chama o mock', async () => {
    const { real } = criarReal(new Map([['EI_SUST', false]]))
    const { criarMock } = criarMockEspiao()
    const fonte = new FonteComSimulado(real, { criarMock })
    const { result } = renderHook(
      () => useMetrica('EI_SUST', SUST, { simulado: true }),
      montar(fonte),
    )
    await waitFor(() => expect(result.current.estado).toBe('sem-dado-real'))
    expect(result.current.dados).toBeUndefined()
    expect(criarMock).not.toHaveBeenCalled()
  })

  it('T-W4: o contrato manda mais que a resposta: id fora da simulação nunca é simulado, mesmo com simulavel true', async () => {
    const { real } = criarReal(new Map([['EI_SUST', true]]))
    const { criarMock } = criarMockEspiao()
    const fonte = new FonteComSimulado(real, { criarMock })
    const { result } = renderHook(
      () => useMetrica('EI_SUST', SUST, { simulado: true }),
      montar(fonte),
    )
    await waitFor(() => expect(result.current.estado).toBe('sem-dado-real'))
    expect(result.current.dados).toBeUndefined()
    expect(criarMock).not.toHaveBeenCalled()
    expect(fonte.origensSimuladas.getSnapshot().size).toBe(0)
  })

  it('T-W4: falha do mock volta a "Sem dado real", sem número e sem selo', async () => {
    const { real } = criarReal(new Map([['O12', true]]))
    const criarMock = vi.fn(() => Promise.reject(new Error('Falha no Worker do mock: x')))
    const fonte = new FonteComSimulado(real, { criarMock })
    const { result } = renderHook(
      () => useMetrica('O12', FILTROS, { simulado: true }),
      montar(fonte),
    )
    await waitFor(() => expect(result.current.estado).toBe('sem-dado-real'))
    expect(result.current.dados).toBeUndefined()
    expect(result.current.origem).toBe('real')
    expect(fonte.origensSimuladas.getSnapshot().size).toBe(0)
    // Só o nome do erro vai para o console, nunca o conteúdo.
    expect(console.error).toHaveBeenCalledWith('O12: simulado indisponível (Error)')
  })

  it('T-W4: DTO simulado fora do schema da métrica não chega à tela', async () => {
    const { real } = criarReal(new Map([['O12', true]]))
    const { criarMock } = criarMockEspiao(() => Promise.resolve({ qualquer: 'coisa' }))
    const fonte = new FonteComSimulado(real, { criarMock })
    const { result } = renderHook(
      () => useMetrica('O12', FILTROS, { simulado: true }),
      montar(fonte),
    )
    await waitFor(() => expect(result.current.estado).toBe('sem-dado-real'))
    expect(result.current.dados).toBeUndefined()
    expect(fonte.origensSimuladas.getSnapshot().size).toBe(0)
  })

  it('T-W6: quem não pede o simulado (faixas, Resumo, Visão geral) só vê o real, e o mock nem é criado', async () => {
    const { real } = criarReal(new Map([['O12', true]]))
    const { criarMock } = criarMockEspiao()
    const fonte = new FonteComSimulado(real, { criarMock })
    const { result } = renderHook(() => useMetrica('O12', FILTROS), montar(fonte))
    await waitFor(() => expect(result.current.estado).toBe('sem-dado-real'))
    expect(result.current.dados).toBeUndefined()
    expect(criarMock).not.toHaveBeenCalled()
  })

  it('T-W6: a exportação lê pela fonte (obter), que nunca devolve o simulado', async () => {
    const { real } = criarReal(new Map([['O12', true]]))
    const { criarMock } = criarMockEspiao()
    const fonte = new FonteComSimulado(real, { criarMock })
    await fonte.obterSimulado('O12', FILTROS, MOTIVO)
    await expect(fonte.obter('O12', FILTROS)).rejects.toBeInstanceOf(SemDadoRealErro)
  })

  it('T-W7: a mesma métrica passa de simulada para real sem recarregar a página, e o registro a solta', async () => {
    const semDado = new Map([['O12', true]])
    const { real } = criarReal(semDado)
    const { criarMock } = criarMockEspiao()
    const fonte = new FonteComSimulado(real, { criarMock })
    const { result } = renderHook(
      () => useMetrica('O12', LIMPOS, { simulado: true }),
      montar(fonte),
    )
    await waitFor(() => expect(result.current.origem).toBe('simulado'))
    const ouvinte = vi.fn()
    fonte.origensSimuladas.subscribe(ouvinte)
    semDado.delete('O12')
    act(() => result.current.recarregar())
    await waitFor(() => expect(result.current.origem).toBe('real'))
    expect(result.current.estado).toBe('ok')
    expect(fonte.origensSimuladas.getSnapshot().has('O12')).toBe(false)
    expect(ouvinte).toHaveBeenCalled()
  })

  it('o decorador repassa o que não é métrica à fonte real e herda o tipo dela', async () => {
    const { real } = criarReal(new Map())
    const fonte = new FonteComSimulado(real)
    expect(fonte.tipo).toBe('api')
    await expect(fonte.dataReferencia()).resolves.toBe('2026-10-09')
    await expect(fonte.criterios()).resolves.toBeInstanceOf(Array)
    expect((await fonte.opcoesFiltro('businessmap')).dominio).toBe('businessmap')
    expect((await fonte.estadoColeta('businessmap')).dominio).toBe('businessmap')
    expect((await fonte.historicoColetas('businessmap', 1)).pagina).toBe(1)
  })

  it('filtrosSoPeriodo zera as listas de dimensão e mantém o período', () => {
    expect(
      filtrosSoPeriodo({ equipe: ['a'], prioridade: ['Alta'], periodo: { tipo: '4s' } }),
    ).toEqual({
      equipe: [],
      prioridade: [],
      periodo: { tipo: '4s' },
    })
  })
})
