import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { criarMemoriaFiltros, useMemoriaAtual, useMemoriaFiltros } from './memoria'
import { useParametroLocal } from './useParametroLocal'

describe('memória de sessão dos filtros de fluxo', () => {
  it('guarda valores, apaga com null ou vazio, preserva o que não veio e só avisa quando muda', () => {
    const m = criarMemoriaFiltros()
    const aviso = vi.fn()
    const sair = m.assinar(aviso)
    m.atualizar({ equipe: 'fluig', tipo: 'melhoria' })
    expect(m.ler()).toEqual({ equipe: 'fluig', tipo: 'melhoria' })
    m.atualizar({ equipe: 'fluig' })
    expect(aviso).toHaveBeenCalledTimes(1)
    m.atualizar({ tipo: null, sistema: '' })
    expect(m.ler()).toEqual({ equipe: 'fluig' })
    sair()
    m.atualizar({ equipe: null })
    expect(aviso).toHaveBeenCalledTimes(2)
    expect(m.ler()).toEqual({})
  })

  it('sem provedor, o hook usa uma memória reserva compartilhada e reativa', () => {
    const { result } = renderHook(() => ({ m: useMemoriaFiltros(), atual: useMemoriaAtual() }))
    act(() => result.current.m.atualizar({ equipe: 'senior' }))
    expect(result.current.atual).toEqual({ equipe: 'senior' })
    act(() => result.current.m.atualizar({ equipe: null }))
    expect(result.current.atual).toEqual({})
  })
})

describe('useParametroLocal', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/p?o3=lixo&outro=1']}>{children}</MemoryRouter>
  )

  it('valor fora da lista cai no padrão; o padrão nunca entra na URL; preserva outros parâmetros', () => {
    const { result } = renderHook(() => useParametroLocal('o3', ['todos', 'melhoria'], 'todos'), {
      wrapper,
    })
    expect(result.current[0]).toBe('todos')
    act(() => result.current[1]('melhoria'))
    expect(result.current[0]).toBe('melhoria')
    act(() => result.current[1]('todos'))
    expect(result.current[0]).toBe('todos')
  })
})
