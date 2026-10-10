import { describe, expect, it } from 'vitest'
import {
  EQUIPES_SUSTENTACAO_ID,
  TIPOS_FILTRO,
  type FiltrosFluxo,
  type OpcoesFiltro,
} from '@metricas-dspd/contratos'
import { colapsarTodos, textoBusca } from './codec'

const opcoes = {
  dominio: 'businessmap',
  equipes: [
    { id: 'a', nome: 'A' },
    { id: 'b', nome: 'B' },
  ],
  sistemas: [{ id: 's1', nome: 'S1' }],
} as unknown as OpcoesFiltro
const fl = (p: Partial<FiltrosFluxo>): FiltrosFluxo => ({
  equipe: [],
  tipo: [],
  sistema: [],
  periodo: { tipo: '12s' },
  ...p,
})

describe('K-039: filtros na URL (bug 004)', () => {
  it('marcar todas as equipes equivale ao padrão e some da lista', () => {
    const r = colapsarTodos(fl({ equipe: ['a', 'b'] }), opcoes, false)
    expect(r.equipe).toEqual([])
  })
  it('marcar só parte mantém a seleção; todos os tipos também colapsam', () => {
    expect(colapsarTodos(fl({ equipe: ['a'] }), opcoes, false).equipe).toEqual(['a'])
    expect(colapsarTodos(fl({ tipo: [...TIPOS_FILTRO] }), opcoes, false).tipo).toEqual([])
  })
  it('sustentação: todas as equipes fixas colapsam', () => {
    const r = colapsarTodos(
      { equipe: [...EQUIPES_SUSTENTACAO_ID], prioridade: [], periodo: { tipo: '12s' } },
      undefined,
      true,
    )
    expect(r.equipe).toEqual([])
  })
  it('a vírgula não é codificada como %2C', () => {
    const p = new URLSearchParams({ equipe: 'a,b' })
    expect(textoBusca(p)).toBe('equipe=a,b')
  })
})
