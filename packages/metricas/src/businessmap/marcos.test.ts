import { describe, expect, it } from 'vitest'
import { derivarMarcos, direcaoDaTransicao, type ColunaDoPasso, type Passo } from './marcos'

const col = (extra: Partial<ColunaDoPasso>): ColunaDoPasso => ({
  section: null,
  papel: null,
  tipo_coluna: null,
  eh_descarte: false,
  ordem: null,
  workflow: '1',
  ...extra,
})
const BACKLOG = col({ section: 1, papel: 'backlog', tipo_coluna: 'fila', ordem: 1 })
const COMPROMETIDO = col({ section: 2, papel: 'compromisso', tipo_coluna: 'fila', ordem: 2 })
const FAZENDO = col({ section: 3, papel: 'trabalho', tipo_coluna: 'execucao', ordem: 3 })
const HOMOLOG = col({ section: 3, papel: 'homologacao', tipo_coluna: 'execucao', ordem: 4 })
const PRONTO = col({ section: 3, papel: 'trabalho', tipo_coluna: 'fila', ordem: 5 })
const ENTREGUE = col({ section: 4, papel: 'entrega', tipo_coluna: 'execucao', ordem: 6 })
const ARQUIVADA = col({ section: 5, papel: 'entrega', tipo_coluna: 'fila', ordem: 7 })
const DESCARTADO = col({ section: 4, eh_descarte: true, ordem: 8 })
const p = (t: number, coluna: ColunaDoPasso | undefined): Passo => ({ ocorrido_em: t, coluna })

describe('derivarMarcos (T2.4: marcos do card pelas transições)', () => {
  it('card sem passos: nenhum marco', () => {
    expect(derivarMarcos([])).toEqual({
      comprometido_em: null,
      iniciado_em: null,
      concluido_em: null,
      descartado_em: null,
    })
  })

  it('H-9, 4.1 e H-10: primeira entrada na seção 2, primeira em execução, primeira na entrega; a ordem de entrada não importa', () => {
    const passos = [
      p(60, ENTREGUE),
      p(10, BACKLOG),
      p(20, COMPROMETIDO),
      p(30, FAZENDO),
      p(40, PRONTO),
      p(50, FAZENDO),
    ]
    expect(derivarMarcos(passos)).toEqual({
      comprometido_em: 20,
      iniciado_em: 30,
      concluido_em: 60,
      descartado_em: null,
    })
  })

  it('reabertura e novas entradas não mudam os marcos (a primeira vale)', () => {
    const passos = [
      p(10, COMPROMETIDO),
      p(20, FAZENDO),
      p(30, ENTREGUE),
      p(40, FAZENDO),
      p(50, ENTREGUE),
      p(60, COMPROMETIDO),
    ]
    expect(derivarMarcos(passos)).toMatchObject({
      comprometido_em: 10,
      iniciado_em: 20,
      concluido_em: 30,
    })
  })

  it('H-23: sem seção 2, o compromisso é a primeira entrada em folha de trabalho da seção 3 (execução, fila ou homologação)', () => {
    expect(derivarMarcos([p(10, BACKLOG), p(20, PRONTO), p(30, FAZENDO)]).comprometido_em).toBe(20)
    expect(derivarMarcos([p(10, BACKLOG), p(30, HOMOLOG)]).comprometido_em).toBe(30)
    // com seção 2 em qualquer momento, vale ela, mesmo depois de ter passado pela 3
    expect(derivarMarcos([p(10, FAZENDO), p(20, COMPROMETIDO)]).comprometido_em).toBe(20)
    // sem seção 2 nem 3: sem compromisso
    expect(derivarMarcos([p(10, BACKLOG)]).comprometido_em).toBeNull()
  })

  it('H-23: quem pula a seção 4 entrega na primeira entrada da seção 5', () => {
    expect(derivarMarcos([p(10, FAZENDO), p(20, ARQUIVADA)]).concluido_em).toBe(20)
  })

  it('início só conta execução de trabalho ou homologação (fila e entrega em execução não iniciam)', () => {
    expect(derivarMarcos([p(10, PRONTO), p(20, ENTREGUE)]).iniciado_em).toBeNull()
    expect(derivarMarcos([p(10, PRONTO), p(20, HOMOLOG)]).iniciado_em).toBe(20)
  })

  it('H-11: Descartado marca o descarte e nunca entrega, mesmo na seção 4, e não vira compromisso nem início', () => {
    const r = derivarMarcos([p(10, FAZENDO), p(20, DESCARTADO), p(30, DESCARTADO)])
    expect(r).toEqual({
      comprometido_em: 10,
      iniciado_em: 10,
      concluido_em: null,
      descartado_em: 20,
    })
    const execucaoDescartada = col({
      section: 3,
      papel: 'trabalho',
      tipo_coluna: 'execucao',
      eh_descarte: true,
    })
    expect(derivarMarcos([p(5, execucaoDescartada)])).toEqual({
      comprometido_em: null,
      iniciado_em: null,
      concluido_em: null,
      descartado_em: 5,
    })
  })

  it('coluna sem referência existe no histórico, mas não marca nada', () => {
    expect(derivarMarcos([p(10, undefined), p(20, FAZENDO)])).toMatchObject({
      comprometido_em: 20,
      iniciado_em: 20,
    })
  })
})

describe('direcaoDaTransicao', () => {
  it('retorno só para folha de posição menor no mesmo workflow; o resto é avanço', () => {
    expect(direcaoDaTransicao(FAZENDO, COMPROMETIDO)).toBe('retorno')
    expect(direcaoDaTransicao(COMPROMETIDO, FAZENDO)).toBe('avanco')
    expect(direcaoDaTransicao(FAZENDO, FAZENDO)).toBe('avanco')
  })
  it('primeira entrada, coluna sem referência, outro workflow e posição desconhecida valem avanço', () => {
    expect(direcaoDaTransicao(undefined, FAZENDO)).toBe('avanco')
    expect(direcaoDaTransicao(FAZENDO, undefined)).toBe('avanco')
    expect(direcaoDaTransicao(FAZENDO, col({ workflow: '2', ordem: 1 }))).toBe('avanco')
    expect(
      direcaoDaTransicao(col({ workflow: null, ordem: 5 }), col({ workflow: null, ordem: 1 })),
    ).toBe('avanco')
    expect(direcaoDaTransicao(col({ ordem: null }), FAZENDO)).toBe('avanco')
    expect(direcaoDaTransicao(FAZENDO, col({ ordem: null }))).toBe('avanco')
  })
})
