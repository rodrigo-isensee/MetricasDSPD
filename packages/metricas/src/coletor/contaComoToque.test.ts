import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { contaComoToque } from './contaComoToque'

const revisao = (userId: unknown) => contaComoToque({ origem: 'revisao', userId })
const comentario = (tipo: unknown, valor: unknown) =>
  contaComoToque({ origem: 'comentario', tipo, valor })

describe('contaComoToque (O22, ADR 0020 R6-5)', () => {
  it('revisão: inteiro positivo em número ou em texto conta', () => {
    expect(revisao(1)).toBe(true)
    expect(revisao(987654)).toBe(true)
    expect(revisao('12')).toBe(true)
    expect(revisao('999999999999')).toBe(true)
  })

  it.each([
    ['ausente', undefined],
    ['nulo', null],
    ['zero', 0],
    ['zero em texto', '0'],
    ['negativo', -3],
    ['negativo em texto', '-3'],
    ['decimal', 1.5],
    ['decimal em texto', '1.5'],
    ['texto com letra', '12a'],
    ['vazio', ''],
    ['espaço', ' 12'],
    ['zero à esquerda', '012'],
    ['13 dígitos', '1234567890123'],
    ['inseguro', Number.MAX_SAFE_INTEGER + 1],
    ['infinito', Infinity],
    ['NaN', NaN],
    ['booleano', true],
    ['objeto', { id: 5 }],
    ['lista', [5]],
  ])('revisão: %s não conta', (_nome, valor) => {
    expect(revisao(valor)).toBe(false)
  })

  it('comentário: só internal com valor inteiro positivo conta', () => {
    expect(comentario('internal', 7)).toBe(true)
    expect(comentario('internal', '7')).toBe(true)
    expect(comentario('external', 7)).toBe(false)
    expect(comentario('external', 'fulano@exemplo.invalido')).toBe(false)
    expect(comentario('internal', 'fulano@exemplo.invalido')).toBe(false)
    expect(comentario('internal', 0)).toBe(false)
    expect(comentario('internal', null)).toBe(false)
    expect(comentario(undefined, 7)).toBe(false)
    expect(comentario('INTERNAL', 7)).toBe(false)
    expect(comentario({ type: 'internal' }, 7)).toBe(false)
  })

  it('property: todo inteiro positivo seguro conta, em número e em texto, na revisão e no comentário internal', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: Number.MAX_SAFE_INTEGER }), (n) => {
        const emTexto = String(n)
        // o texto só vale até 12 dígitos (mesma forma de LISTA_IDS); número vale sempre
        expect(revisao(n)).toBe(true)
        expect(comentario('internal', n)).toBe(true)
        expect(revisao(emTexto)).toBe(emTexto.length <= 12)
        expect(comentario('internal', emTexto)).toBe(emTexto.length <= 12)
      }),
    )
  })

  it('property: zero, negativo e decimal nunca contam', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.integer({ max: 0 }), fc.double({ noInteger: true, noNaN: true })),
        (n) => {
          expect(revisao(n)).toBe(false)
          expect(revisao(String(n))).toBe(false)
          expect(comentario('internal', n)).toBe(false)
        },
      ),
    )
  })

  it('property: texto com ao menos uma letra ou símbolo fora de dígito nunca conta', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => !/^[1-9]\d{0,11}$/.test(s)),
        (s) => {
          expect(revisao(s)).toBe(false)
          expect(comentario('internal', s)).toBe(false)
        },
      ),
    )
  })

  it('property: comentário que não é internal nunca conta, qualquer que seja o valor', () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => s !== 'internal'),
        fc.anything(),
        (tipo, valor) => {
          expect(comentario(tipo, valor)).toBe(false)
        },
      ),
    )
  })

  it('property: nunca lança, qualquer que seja a entrada', () => {
    fc.assert(
      fc.property(fc.anything(), fc.anything(), (a, b) => {
        expect(typeof revisao(a)).toBe('boolean')
        expect(typeof comentario(a, b)).toBe('boolean')
      }),
    )
  })
})
