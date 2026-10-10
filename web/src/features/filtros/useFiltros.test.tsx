import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { Provedores } from '@/app/App'
import { fonteDeTeste } from '@/test/helpers'
import { useFiltros } from './useFiltros'

function montar<P extends 'operacional' | 'estrategico' | 'sustentacao'>(
  painel: P,
  url: string,
  prefixo?: string,
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provedores fonte={fonteDeTeste}>
      <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
    </Provedores>
  )
  return renderHook(
    () => ({
      uso: useFiltros(painel as 'operacional', prefixo ? { prefixo } : undefined),
      loc: useLocation(),
    }),
    { wrapper },
  )
}

const aguardarOpcoes = (r: ReturnType<typeof montar>) =>
  waitFor(() => expect(r.result.current.uso.opcoes).toBeDefined())

describe('useFiltros: remover cada filtro', () => {
  it('tipo, equipe e sistema: um valor ou todos; período volta ao padrão', async () => {
    const r = montar(
      'operacional',
      '/operacional?tipo=melhoria,divida-tecnica&equipe=fluig,senior&sistema=protheus,fluig&periodo=4s',
    )
    await aguardarOpcoes(r)
    act(() => r.result.current.uso.remover('tipo', 'melhoria'))
    expect(r.result.current.loc.search).toContain('tipo=divida-tecnica')
    expect(r.result.current.loc.search).not.toContain('melhoria')
    act(() => r.result.current.uso.remover('tipo'))
    expect(r.result.current.loc.search).not.toContain('tipo=')
    act(() => r.result.current.uso.remover('equipe', 'fluig'))
    expect(r.result.current.loc.search).toContain('equipe=senior')
    act(() => r.result.current.uso.remover('equipe'))
    expect(r.result.current.loc.search).not.toContain('equipe=')
    act(() => r.result.current.uso.remover('sistema', 'protheus'))
    expect(r.result.current.loc.search).toContain('sistema=fluig')
    act(() => r.result.current.uso.remover('sistema'))
    expect(r.result.current.loc.search).not.toContain('sistema=')
    act(() => r.result.current.uso.remover('periodo'))
    expect(r.result.current.loc.search).toBe('')
  })

  it('sustentação: prioridade e equipe, com e sem valor; chave desconhecida só reaplica', async () => {
    const r = montar('sustentacao', '/sustentacao?prioridade=p1,p2&equipe=fluig,senior')
    await aguardarOpcoes(r)
    act(() => r.result.current.uso.remover('prioridade', 'P1'))
    expect(r.result.current.loc.search).toContain('prioridade=p2')
    act(() => r.result.current.uso.remover('prioridade'))
    expect(r.result.current.loc.search).not.toContain('prioridade')
    act(() => r.result.current.uso.remover('equipe', 'fluig'))
    expect(r.result.current.loc.search).toContain('equipe=senior')
    act(() => r.result.current.uso.remover('inexistente'))
    expect(r.result.current.loc.search).toContain('equipe=senior')
    expect(r.result.current.uso.chips.map((c) => c.valor)).toEqual(['SSSC SENIOR'])
  })
})

describe('useFiltros: definir, limpar e normalização da URL', () => {
  it('definir sem opções de navegação empilha; limpar volta ao padrão', async () => {
    const r = montar('operacional', '/operacional')
    await aguardarOpcoes(r)
    act(() => r.result.current.uso.definir({ equipe: ['fluig'] }))
    expect(r.result.current.loc.search).toBe('?equipe=fluig')
    act(() => r.result.current.uso.definir({ periodo: { tipo: '6m' } }, { replace: true }))
    expect(r.result.current.loc.search).toBe('?equipe=fluig&periodo=6m')
    act(() => r.result.current.uso.limpar())
    expect(r.result.current.loc.search).toBe('')
    expect(r.result.current.uso.foraDoPadrao).toBe(false)
  })

  it('sustentação: valores inválidos são corrigidos e viram aviso; dispensar limpa o estado', async () => {
    const r = montar('sustentacao', '/sustentacao?equipe=fluig,xyz&prioridade=p9')
    await waitFor(() => expect(r.result.current.loc.search).toBe('?equipe=fluig'))
    expect(r.result.current.uso.invalidos).toEqual(['equipe "xyz"', 'prioridade "p9"'])
    act(() => r.result.current.uso.dispensarInvalidos())
    await waitFor(() => expect(r.result.current.uso.invalidos).toEqual([]))
    expect(r.result.current.loc.search).toBe('?equipe=fluig')
  })

  it('Estratégico: período válido que o painel não oferece some em silêncio; chips usam o nome do sistema', async () => {
    const r = montar(
      'estrategico',
      '/estrategico?periodo=4s&equipe=fluig&tipo=melhoria&sistema=protheus',
    )
    await waitFor(() => expect(r.result.current.loc.search).toBe('?sistema=protheus'))
    await aguardarOpcoes(r)
    expect(r.result.current.uso.invalidos).toEqual([])
    expect(r.result.current.uso.filtros.equipe).toEqual([])
    expect(r.result.current.uso.chips.map((c) => `${c.rotulo}: ${c.valor}`)).toEqual([
      'Sistema: Protheus',
    ])
  })

  it('Estratégico: personalizado também é descartado; 6m é mantido', async () => {
    const r = montar('estrategico', '/estrategico?periodo=custom&de=2026-03-01&ate=2026-04-01')
    await waitFor(() => expect(r.result.current.loc.search).toBe(''))
    const r2 = montar('estrategico', '/estrategico?periodo=6m')
    await aguardarOpcoes(r2)
    expect(r2.result.current.loc.search).toBe('?periodo=6m')
    expect(r2.result.current.uso.chips.map((c) => c.valor)).toEqual(['Últimos 6 meses'])
  })

  it('período personalizado vira chip com o intervalo', async () => {
    const r = montar('operacional', '/operacional?periodo=custom&de=2026-03-01&ate=2026-04-01')
    await aguardarOpcoes(r)
    expect(r.result.current.uso.chips.map((c) => c.valor)).toEqual(['01/03/2026 a 01/04/2026'])
  })

  it('com prefixo, lê e escreve só os parâmetros do prefixo e não normaliza o resto', async () => {
    const r = montar('operacional', '/operacional?sust_equipe=fluig&equipe=xyz', 'sust_')
    await aguardarOpcoes(r)
    expect(r.result.current.uso.filtros.equipe).toEqual(['fluig'])
    act(() => r.result.current.uso.definir({ equipe: ['senior'] }))
    expect(r.result.current.loc.search).toContain('sust_equipe=senior')
    expect(r.result.current.loc.search).toContain('equipe=xyz')
    expect(r.result.current.uso.guardadosNaoAplicaveis).toEqual([])
  })

  it('sem opções carregadas, o chip mostra o id da equipe', () => {
    const r = montar('operacional', '/operacional?equipe=fluig')
    expect(r.result.current.uso.chips[0]?.valor).toBe('fluig')
  })

  it('a memória só guarda o que o painel oferece: definir no Estratégico não apaga equipe e tipo guardados', async () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provedores fonte={fonteDeTeste}>
        <MemoryRouter initialEntries={['/operacional?equipe=fluig&tipo=melhoria']}>
          {children}
        </MemoryRouter>
      </Provedores>
    )
    const r = renderHook(
      () => ({ op: useFiltros('operacional'), es: useFiltros('estrategico'), loc: useLocation() }),
      { wrapper },
    )
    await waitFor(() => expect(r.result.current.op.opcoes).toBeDefined())
    expect(r.result.current.es.guardadosNaoAplicaveis).toEqual([])
    act(() => r.result.current.es.definir({ sistema: ['protheus'], periodo: { tipo: '6m' } }))
    expect(r.result.current.loc.search).toContain('sistema=protheus')
  })
})
