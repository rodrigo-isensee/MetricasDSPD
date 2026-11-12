import { describe, expect, it } from 'vitest'
import { NOTAS_COMPLEMENTARES } from './notas'
import { NOTAS_TATICO } from '../tatico/notas'
import { NOTAS_ESTRATEGICO } from '../estrategico/notas'
import { NOTAS_OPERACIONAL } from '../operacional/notas'

/** 099 L4 (ADR 0030): as notas não falam de dado fictício, mock nem simulado. */
describe('notas sem texto de dado fictício', () => {
  it('nenhuma nota dos painéis cita fictício, mock ou simulado', () => {
    const todas = [NOTAS_COMPLEMENTARES, NOTAS_TATICO, NOTAS_ESTRATEGICO, NOTAS_OPERACIONAL]
    const textos = todas.flatMap((n) => JSON.stringify(n))
    for (const t of textos) expect(t).not.toMatch(/fict|mock|simulad/i)
  })

  it('traz os textos novos do catálogo de textos (OP-21, TA-16 a TA-18, ES-11, ES-12)', () => {
    expect(NOTAS_COMPLEMENTARES.S11.cuidados).toBe(
      'Os grupos se sobrepõem: um P1 pode ter contorno.',
    )
    expect(NOTAS_TATICO.T2.cuidados).toBe(
      'O SLE é um valor de configuração com data de publicação; só é válido após 60 dias de dados limpos e 20 itens por classe.',
    )
    expect(NOTAS_TATICO.T3.cuidados).toBe('Contar cards distorce quando os tamanhos diferem muito.')
    expect(NOTAS_COMPLEMENTARES.T13.cuidados).toBe(
      'Entregas com quadro do vínculo desconhecido ficam à parte, nunca contam como "não dependeu".',
    )
    expect(NOTAS_COMPLEMENTARES.T14.cuidados).toBe(
      'Não é nota do time nem comparação: nenhum outro time é nomeado, listado nem ordenado.',
    )
    expect(NOTAS_ESTRATEGICO.E3.cuidados).toBe(
      'Sem esse fechamento o painel mede movimento, não valor.',
    )
    expect(NOTAS_COMPLEMENTARES.E6.cuidados).toBe(
      'Poucos projetos terminam por ano: é esperado ficar abaixo de 20. Projeto concluído sem data comprometida registrada fica fora da conta e é contado à parte.',
    )
    expect(NOTAS_COMPLEMENTARES.E8.cuidados).toBe(
      'Não mostra nem avalia pessoas. Não há filtro por equipe nem por sistema, para não apontar quem entrega.',
    )
  })
})
