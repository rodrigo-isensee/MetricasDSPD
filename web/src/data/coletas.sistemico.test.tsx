import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { estadoColetaSchema, paginaColetasSchema } from '@metricas-dspd/contratos'
import { FonteMetricasProvider, MockFonteMetricas } from '.'
import type { FonteMetricas } from './FonteMetricas'
import { aplicarSimulacaoEstado, aplicarSimulacaoHistorico, lerModoMock } from './simulacao'
import { useEstadoColeta, useHistoricoColetas, useMetricasEmCalibracao } from './useMetrica'

/** Sistêmico: gerador de coletas e biblioteca -> MockFonteMetricas -> hooks, validado pelos schemas. */
const fonte = new MockFonteMetricas({ latenciaMs: 0 })

function wrapper(url: string, f: FonteMetricas = fonte) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <FonteMetricasProvider fonte={f}>
        <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
      </FonteMetricasProvider>
    </QueryClientProvider>
  )
}

describe('MockFonteMetricas: coletas', () => {
  it('estadoColeta e historicoColetas respeitam os schemas e o cenário padrão, uma fonte por vez', async () => {
    const bm = estadoColetaSchema.parse(await fonte.estadoColeta('businessmap'))
    const ac = estadoColetaSchema.parse(await fonte.estadoColeta('acelerato'))
    expect(bm.selo).toBe('falha')
    expect(bm.falhasRecentes.map((e) => e.tipoErro)).toEqual(['tempo-esgotado'])
    expect(bm.calibracao).toEqual([])
    expect(ac.selo).toBe('atual')
    expect(ac.calibracao).toHaveLength(1)
    expect(ac.metricasEmCalibracao).toContain('S1')
    expect(ac.metricasEmCalibracao).not.toContain('O2')
    const p1 = paginaColetasSchema.parse(await fonte.historicoColetas('businessmap', 1))
    expect(p1.itens).toHaveLength(20)
    expect(p1.itens[0]?.resultado).toBe('falha')
    expect(p1.total).toBeGreaterThan(200)
    const p2 = await fonte.historicoColetas('businessmap', 2)
    expect(p2.pagina).toBe(2)
    expect(p2.itens[0]?.id).not.toBe(p1.itens[0]?.id)
  })
})

describe('hooks de coleta', () => {
  it('useEstadoColeta e useHistoricoColetas leem a fonte; a calibração do Acelerato não vaza para o BusinessMap', async () => {
    const e = renderHook(() => useEstadoColeta('acelerato'), { wrapper: wrapper('/') })
    await waitFor(() => expect(e.result.current.data?.selo).toBe('atual'))
    const h = renderHook(() => useHistoricoColetas('acelerato', 1), { wrapper: wrapper('/') })
    await waitFor(() => expect(h.result.current.data?.porPagina).toBe(20))
    const ac = renderHook(() => useMetricasEmCalibracao('acelerato'), { wrapper: wrapper('/') })
    const bm = renderHook(() => useMetricasEmCalibracao('businessmap'), { wrapper: wrapper('/') })
    await waitFor(() => expect(ac.result.current.has('S2')).toBe(true))
    expect(bm.result.current.size).toBe(0)
  })

  it('?mock=sem-calibracao zera a calibração; ?mock=coleta-erro:ac só falha o Acelerato', async () => {
    const sem = renderHook(() => useMetricasEmCalibracao('acelerato'), {
      wrapper: wrapper('/?mock=sem-calibracao'),
    })
    const e = renderHook(() => useEstadoColeta('acelerato'), {
      wrapper: wrapper('/?mock=sem-calibracao'),
    })
    await waitFor(() => expect(e.result.current.data?.selo).toBe('atual'))
    expect(sem.result.current.size).toBe(0)
    const erro = renderHook(() => useEstadoColeta('acelerato'), {
      wrapper: wrapper('/?mock=coleta-erro:ac'),
    })
    await waitFor(() => expect(erro.result.current.isError).toBe(true))
    const bm = renderHook(() => useEstadoColeta('businessmap'), {
      wrapper: wrapper('/?mock=coleta-erro:ac'),
    })
    await waitFor(() => expect(bm.result.current.data?.selo).toBe('falha'))
  })

  it('?mock= é ignorado quando a fonte não é mock', async () => {
    const api = {
      tipo: 'api',
      estadoColeta: () => fonte.estadoColeta('acelerato'),
    } as unknown as FonteMetricas
    const r = renderHook(() => useEstadoColeta('acelerato'), {
      wrapper: wrapper('/?mock=coleta-erro:ac', api),
    })
    await waitFor(() => expect(r.result.current.data?.selo).toBe('atual'))
  })
})

describe('simulação de coleta', () => {
  it('interpreta os modos novos e ignora o resto', () => {
    expect(lerModoMock('coleta-atrasada:BM')).toBe('coleta-atrasada:bm')
    expect(lerModoMock('coleta-vazia:ac')).toBe('coleta-vazia:ac')
    expect(lerModoMock('sem-calibracao')).toBe('sem-calibracao')
    expect(lerModoMock('coleta-erro:xx')).toBeNull()
  })

  it('atrasada, vazia, erro e carregando mudam só a fonte indicada', async () => {
    const real = () => fonte.estadoColeta('businessmap')
    const atrasada = await aplicarSimulacaoEstado('coleta-atrasada:bm', 'businessmap', real)
    expect(atrasada.selo).toBe('atrasado')
    expect(atrasada.horasDesdeUltimaOk).toBe(26)
    const outra = await aplicarSimulacaoEstado('coleta-atrasada:ac', 'businessmap', real)
    expect(outra.selo).toBe('falha')
    const vazia = await aplicarSimulacaoEstado('coleta-vazia:bm', 'businessmap', real)
    expect(vazia).toMatchObject({ selo: 'sem-coleta', ultimaOk: null, falhasRecentes: [] })
    await expect(aplicarSimulacaoEstado('coleta-erro:bm', 'businessmap', real)).rejects.toThrow(
      'Erro simulado',
    )
    const pendente = Symbol('pendente')
    const r = await Promise.race([
      aplicarSimulacaoEstado('carregando', 'businessmap', real),
      new Promise((ok) => setTimeout(() => ok(pendente), 20)),
    ])
    expect(r).toBe(pendente)
  })

  it('histórico: vazio zera os itens; erro falha; carregando não resolve', async () => {
    const real = () => fonte.historicoColetas('acelerato', 1)
    const vazia = await aplicarSimulacaoHistorico('coleta-vazia:ac', 'acelerato', real)
    expect(vazia).toMatchObject({ itens: [], total: 0 })
    expect((await aplicarSimulacaoHistorico(null, 'acelerato', real)).itens.length).toBe(20)
    await expect(aplicarSimulacaoHistorico('coleta-erro:ac', 'acelerato', real)).rejects.toThrow()
    const pendente = Symbol('pendente')
    const r = await Promise.race([
      aplicarSimulacaoHistorico('carregando', 'acelerato', real),
      new Promise((ok) => setTimeout(() => ok(pendente), 20)),
    ])
    expect(r).toBe(pendente)
  })
})
