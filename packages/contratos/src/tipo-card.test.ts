import { describe, expect, it } from 'vitest'
import { CATEGORIAS_TIPO_CARD, TIPOS_CARD, TIPOS_FILTRO, TIPO_DA_CATEGORIA } from './comum'
import { TIPO_ID } from './filtros'

// ADR 0024 (H-17): "Trabalho de produto" no fim das listas; tabela fechada categoria -> rótulo de `dim_card.tipo`.
describe('tipo do card (ADR 0024)', () => {
  it('E7.496: Habilitador é o penúltimo tipo (Trabalho de produto segue no fim), com o id habilitador', () => {
    expect(TIPOS_CARD.at(-2)).toBe('Habilitador')
    expect(TIPOS_FILTRO.at(-2)).toBe('Habilitador')
    expect(TIPO_ID.Habilitador).toBe('habilitador')
  })

  it('Trabalho de produto vai no fim de TIPOS_CARD e de TIPOS_FILTRO, com o id trabalho-produto', () => {
    expect(TIPOS_CARD.at(-1)).toBe('Trabalho de produto')
    expect(TIPOS_FILTRO.at(-1)).toBe('Trabalho de produto')
    expect(TIPO_ID['Trabalho de produto']).toBe('trabalho-produto')
  })

  it('os sete códigos (seis da migração 0018 e habilitador, da 0041) têm rótulo do contrato, e só eles', () => {
    expect([...CATEGORIAS_TIPO_CARD]).toEqual([
      'bug_interno',
      'defeito_producao',
      'requisicao',
      'divida_tecnica',
      'melhoria',
      'habilitador',
      'produto',
    ])
    expect(Object.keys(TIPO_DA_CATEGORIA)).toEqual([...CATEGORIAS_TIPO_CARD])
    expect(TIPO_DA_CATEGORIA).toEqual({
      bug_interno: 'Bug interno',
      defeito_producao: 'Defeito em produção',
      requisicao: 'Requisição',
      divida_tecnica: 'Dívida técnica',
      melhoria: 'Melhoria',
      habilitador: 'Habilitador',
      produto: 'Trabalho de produto',
    })
    for (const rotulo of Object.values(TIPO_DA_CATEGORIA)) expect(TIPOS_CARD).toContain(rotulo)
  })
})
