import { describe, expect, it } from 'vitest'
import type { FiltrosFluxo, FiltrosSustentacao, OpcoesFiltro } from '@metricas-dspd/contratos'
import {
  colapsarTodos,
  escreverFluxo,
  escreverSustentacao,
  lerFluxo,
  lerSustentacao,
  paramsDeFluxo,
} from './codec'

const opcoes = {
  dominio: 'businessmap',
  equipes: [
    { id: 'a', nome: 'A' },
    { id: 'b', nome: 'B' },
  ],
  sistemas: [{ id: 's1', nome: 'S1' }],
  historico: { inicio: '2026-01-01', fim: '2026-10-09' },
} as unknown as OpcoesFiltro
const opcoesAcelerato = { dominio: 'acelerato', equipes: [] } as unknown as OpcoesFiltro
const P = (s: string) => new URLSearchParams(s)

describe('leitura dos filtros de fluxo', () => {
  it('lê listas sem repetir, ignora desconhecidos e anota o que foi ignorado', () => {
    const r = lerFluxo(P('equipe=a,a,xyz&tipo=nada&sistema=s9'), opcoes, '12s')
    expect(r.filtros.equipe).toEqual(['a'])
    expect(r.filtros.tipo).toEqual([])
    expect(r.invalidos).toEqual(['equipe "xyz"', 'tipo "nada"', 'sistema "s9"'])
  })

  it('traduz o id de tipo para o nome do tipo', () => {
    const r = lerFluxo(P('tipo=melhoria'), opcoes, '12s')
    expect(r.filtros.tipo).toEqual(['Melhoria'])
  })

  it('marcar todos equivale a Todos', () => {
    expect(lerFluxo(P('equipe=a,b'), opcoes, '12s').filtros.equipe).toEqual([])
  })

  it('sem opções carregadas, aceita qualquer equipe e sistema', () => {
    const r = lerFluxo(P('equipe=qualquer&sistema=outro'), undefined, '12s')
    expect(r.filtros.equipe).toEqual(['qualquer'])
    expect(r.filtros.sistema).toEqual(['outro'])
    expect(r.invalidos).toEqual([])
  })

  it('em opções do Acelerato não há sistemas válidos para lista fechada', () => {
    expect(lerFluxo(P('sistema=x'), opcoesAcelerato, '12s').filtros.sistema).toEqual(['x'])
  })

  it('período: padrão, válido, fora do painel, personalizado e inválido', () => {
    expect(lerFluxo(P(''), opcoes, '12s').filtros.periodo).toEqual({ tipo: '12s' })
    expect(lerFluxo(P('periodo=4s'), opcoes, '12s').filtros.periodo).toEqual({ tipo: '4s' })
    const so12 = { periodos: ['6m', '12m'] as const, personalizado: false }
    expect(lerFluxo(P('periodo=4s'), opcoes, '12m', '', so12).filtros.periodo).toEqual({
      tipo: '12m',
    })
    const custom = P('periodo=custom&de=2026-03-01&ate=2026-04-01')
    expect(lerFluxo(custom, opcoes, '12s').filtros.periodo).toEqual({
      tipo: 'custom',
      de: '2026-03-01',
      ate: '2026-04-01',
    })
    expect(lerFluxo(custom, opcoes, '12m', '', so12).filtros.periodo).toEqual({ tipo: '12m' })
    const ruim = lerFluxo(P('periodo=custom&de=2026-04-01&ate=2026-03-01'), opcoes, '12s')
    expect(ruim.filtros.periodo).toEqual({ tipo: '12s' })
    expect(ruim.invalidos).toEqual(['período personalizado'])
    expect(lerFluxo(P('periodo=custom'), opcoes, '12s').invalidos).toEqual([
      'período personalizado',
    ])
    expect(lerFluxo(P('periodo=99x'), opcoes, '12s').invalidos).toEqual(['período "99x"'])
  })

  it('personalizado sem opções: valida só o formato e a ordem das datas', () => {
    expect(
      lerFluxo(P('periodo=custom&de=2026-03-01&ate=2026-04-01'), undefined, '12s').filtros.periodo,
    ).toEqual({ tipo: 'custom', de: '2026-03-01', ate: '2026-04-01' })
    expect(lerFluxo(P('periodo=custom&de=2026-03-01'), undefined, '12s').invalidos).toEqual([
      'período personalizado',
    ])
  })

  it('lê só os parâmetros com o prefixo indicado', () => {
    const r = lerFluxo(P('sust_equipe=a&equipe=b'), opcoes, '12s', 'sust_')
    expect(r.filtros.equipe).toEqual(['a'])
  })
})

describe('leitura e escrita da sustentação', () => {
  it('lê equipe e prioridade e escreve só o que foge do padrão', () => {
    const r = lerSustentacao(P('equipe=fluig&prioridade=p1,p2&periodo=4s'), undefined, '6m')
    expect(r.filtros).toEqual({
      equipe: ['fluig'],
      prioridade: ['P1', 'P2'],
      periodo: { tipo: '4s' },
    })
    const p = escreverSustentacao(P('s3=prop'), r.filtros, '6m')
    expect(p.get('equipe')).toBe('fluig')
    expect(p.get('prioridade')).toBe('p1,p2')
    expect(p.get('periodo')).toBe('4s')
    expect(p.get('s3')).toBe('prop')
  })

  it('período padrão e listas vazias saem da URL; com prefixo, só mexe no prefixo', () => {
    const f: FiltrosSustentacao = { equipe: [], prioridade: [], periodo: { tipo: '6m' } }
    const p = escreverSustentacao(P('equipe=fluig&periodo=4s&de=x&ate=y'), f, '6m')
    expect(p.toString()).toBe('')
    const q = escreverSustentacao(P('equipe=fluig'), { ...f, equipe: ['senior'] }, '6m', 'sust_')
    expect(q.get('equipe')).toBe('fluig')
    expect(q.get('sust_equipe')).toBe('senior')
  })
})

describe('escrita do fluxo e memória', () => {
  const f: FiltrosFluxo = {
    equipe: ['a'],
    tipo: ['Melhoria'],
    sistema: ['s1'],
    periodo: { tipo: 'custom', de: '2026-03-01', ate: '2026-04-01' },
  }

  it('escreve o personalizado com De/Até e o período comum sem eles', () => {
    const p = escreverFluxo(P(''), f, '12s')
    expect(p.get('periodo')).toBe('custom')
    expect(p.get('de')).toBe('2026-03-01')
    const q = escreverFluxo(p, { ...f, periodo: { tipo: '4s' } }, '12s')
    expect(q.get('periodo')).toBe('4s')
    expect(q.has('de')).toBe(false)
  })

  it('paramsDeFluxo devolve texto de URL de cada filtro', () => {
    expect(paramsDeFluxo(f)).toMatchObject({
      equipe: 'a',
      sistema: 's1',
      periodo: 'custom',
      de: '2026-03-01',
      ate: '2026-04-01',
    })
    expect(paramsDeFluxo({ ...f, equipe: [], tipo: [], periodo: { tipo: '4s' } })).toEqual({
      equipe: null,
      tipo: null,
      sistema: 's1',
      periodo: '4s',
      de: null,
      ate: null,
    })
  })

  it('colapsarTodos sem opções não colapsa equipe e sistema; sustentação colapsa prioridade', () => {
    const r = colapsarTodos(f, undefined, false)
    expect(r.equipe).toEqual(['a'])
    const s = colapsarTodos(
      { equipe: [], prioridade: ['P1', 'P2', 'P3', 'P4', 'P5'], periodo: { tipo: '6m' } },
      undefined,
      true,
    )
    expect(s.prioridade).toEqual([])
    expect(colapsarTodos(f, opcoes, false).sistema).toEqual([])
    const vazias = { dominio: 'businessmap', equipes: [], sistemas: [] } as unknown as OpcoesFiltro
    expect(colapsarTodos(f, vazias, false).equipe).toEqual(['a'])
  })
})
