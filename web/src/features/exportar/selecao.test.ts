import { describe, expect, it } from 'vitest'
import {
  ESCOPO_DO_NIVEL,
  NIVEIS,
  dominioDoNivel,
  escopoDoArquivo,
  filtrosDoNivel,
  itensDoNivel,
  rotuloDoEscopo,
  selecaoInicial,
} from './selecao'
import { notaDaMetrica } from './notas'

describe('itensDoNivel: só o que está visível', () => {
  it('lista os cartões do painel e tira os ocultos (decisão D-2)', () => {
    const todos = itensDoNivel('operacional', [])
    const sem = itensDoNivel('operacional', ['o9', 'o10'])
    expect(todos.map((i) => i.codigo)).toContain('O9')
    expect(sem.map((i) => i.codigo)).not.toContain('O9')
    expect(sem).toHaveLength(todos.length - 2)
    expect(todos.find((i) => i.codigo === 'O3')).toMatchObject({
      chave: 'operacional:o3',
      metrica: 'O3',
      fonte: 'BusinessMap',
    })
    expect(itensDoNivel('sustentacao', []).every((i) => i.fonte === 'Acelerato')).toBe(true)
  })
  it('a Espera invisível lista as quatro métricas, sempre visíveis, cada uma da sua fonte', () => {
    const ei = itensDoNivel('espera-invisivel', ['ei-fl1'])
    expect(ei.map((i) => [i.codigo, i.fonte])).toEqual([
      ['EI-FL1', 'BusinessMap'],
      ['EI-FL2', 'BusinessMap'],
      ['EI-FL3', 'BusinessMap'],
      ['EI-SUST', 'Acelerato'],
    ])
  })
  it('a seleção inicial respeita o limite de 12', () => {
    const itens = [...itensDoNivel('operacional', []), ...itensDoNivel('tatico', [])]
    expect(itens.length).toBeGreaterThan(12)
    expect(selecaoInicial(itens)).toHaveLength(12)
    expect(selecaoInicial(itens.slice(0, 3))).toHaveLength(3)
  })
})

describe('escopo e rótulos', () => {
  it('uma métrica leva o id; senão o escopo do painel; personalizada e visão geral são fixos', () => {
    expect(escopoDoArquivo('operacional', [{ metrica: 'O3' }])).toBe('O3')
    expect(escopoDoArquivo('operacional', [{ metrica: 'O3' }, { metrica: 'O4' }])).toBe(
      'fluxo-operacional',
    )
    expect(escopoDoArquivo('personalizada', [{ metrica: 'O3' }, { metrica: 'S1' }])).toBe(
      'personalizada',
    )
    expect(escopoDoArquivo('visao-geral', [])).toBe('visao-geral')
    expect(Object.values(ESCOPO_DO_NIVEL)).toEqual([
      'fluxo-operacional',
      'fluxo-tatico',
      'fluxo-estrategico',
      'sustentacao',
      'espera-invisivel',
    ])
  })
  it('rótulos e domínio', () => {
    expect(rotuloDoEscopo('visao-geral')).toBe('Visão geral')
    expect(rotuloDoEscopo('personalizada')).toBe('Exportação personalizada')
    expect(rotuloDoEscopo('tatico')).toBe('Tático')
    expect(NIVEIS).toHaveLength(5)
    expect(dominioDoNivel('sustentacao')).toBe('acelerato')
    expect(dominioDoNivel('operacional')).toBe('businessmap')
  })
})

describe('filtrosDoNivel', () => {
  it('na própria rota usa a URL; fora dela, a memória da sessão (fluxo) ou o padrão (Sustentação)', () => {
    const url = new URLSearchParams('periodo=4s')
    expect(filtrosDoNivel('operacional', '/operacional', url, {}, undefined).periodo).toEqual({
      tipo: '4s',
    })
    expect(
      filtrosDoNivel('tatico', '/operacional', url, { periodo: '6m' }, undefined).periodo,
    ).toEqual({ tipo: '6m' })
    expect(filtrosDoNivel('sustentacao', '/operacional', url, {}, undefined).periodo).toEqual({
      tipo: '6m',
    })
    expect(
      filtrosDoNivel(
        'sustentacao',
        '/sustentacao',
        new URLSearchParams('periodo=12m'),
        {},
        undefined,
      ).periodo,
    ).toEqual({ tipo: '12m' })
  })
  it('o Estratégico não usa equipe nem tipo', () => {
    const f = filtrosDoNivel(
      'estrategico',
      '/estrategico',
      new URLSearchParams(),
      { equipe: 'a', tipo: 'incidente' },
      undefined,
    )
    expect(f).toMatchObject({ equipe: [], tipo: [], periodo: { tipo: '12m' } })
  })
})

describe('notaDaMetrica', () => {
  it('devolve a nota de cada família e falha para métrica sem nota', () => {
    for (const id of ['O3', 'T2', 'E1', 'S1', 'EI_FL1', 'EI_SUST', 'BLOQUEADOS'] as const)
      expect(notaDaMetrica(id).oQueE).not.toBe('')
    expect(() => notaDaMetrica('VISAO_GERAL')).toThrow(/sem nota/)
  })
})
