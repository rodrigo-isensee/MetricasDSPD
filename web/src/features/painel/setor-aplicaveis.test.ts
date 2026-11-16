import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo, OpcoesFiltro } from '@metricas-dspd/contratos'
import { filtrosParaQuery } from '@/data/http/filtrosParaQuery'
import { textoFiltros } from '@/features/exportar/modelo'
import { aplicaveisDe } from './propsCartao'

const f: FiltrosFluxo = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' } }

describe('Setor por cartão (097 L11)', () => {
  it('o setor atua onde a equipe atua (recorte por cards), e vem primeiro na lista', () => {
    for (const id of ['O1', 'O3', 'T1', 'T5', 'O12', 'EI_FL1', 'EI_FL2'] as const)
      expect(aplicaveisDe(id)[0]).toBe('setor')
    expect(aplicaveisDe('O3')).toContain('setor')
  })
  it('não atua nos cartões de projeto (FL3), que não têm equipe, nem no T14 (a equipe só diz "meu time")', () => {
    for (const id of [
      'E1',
      'E2',
      'E3',
      'E4',
      'E5',
      'E6',
      'E7',
      'E8',
      'E9',
      'EI_FL3',
      'T14',
    ] as const)
      expect(aplicaveisDe(id)).not.toContain('setor')
  })
  it('cartão sem aplicabilidade declarada continua sem filtro', () => {
    expect(aplicaveisDe('S1')).toEqual([])
  })
})

describe('Setor na consulta e na exportação (097 L11)', () => {
  it('a consulta leva `setor` em CSV só com seleção; sem seleção é a de antes', () => {
    expect(filtrosParaQuery({ ...f, setor: ['plataformas', 'marketing-e-vendas'] })).toContain(
      'setor=plataformas%2Cmarketing-e-vendas',
    )
    expect(filtrosParaQuery({ ...f, setor: [] })).not.toContain('setor')
    expect(filtrosParaQuery(f)).toBe('periodo=12s')
  })
  const opcoes = {
    dominio: 'businessmap',
    equipes: [],
    tipos: [],
    sistemas: [],
    setores: [{ id: 'plataformas', nome: 'Plataformas' }],
    historico: { inicio: '2024-01-01', fim: '2026-11-01' },
  } as OpcoesFiltro
  it('o arquivo exportado diz o setor (pelo nome, sem sobrenome) só onde ele atua', () => {
    const com = { ...f, setor: ['plataformas'] }
    expect(textoFiltros('O3', com, opcoes)).toMatch(/^Setor: Plataformas · Equipe: Todos/)
    expect(textoFiltros('E1', com, opcoes)).not.toContain('Setor')
    expect(textoFiltros('O3', f, opcoes)).not.toContain('Setor')
  })
})
