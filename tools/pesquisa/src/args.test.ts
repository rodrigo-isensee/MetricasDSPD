import { describe, expect, it } from 'vitest'
import { lerArgs, USO } from './args.ts'

describe('lerArgs', () => {
  it('lê os argumentos obrigatórios e os opcionais', () => {
    expect(lerArgs(['--trimestre', '2026-T3', '--arquivo', 'p.csv'])).toEqual({
      trimestre: '2026-T3',
      arquivo: 'p.csv',
      confirmar: false,
    })
    expect(
      lerArgs([
        '--trimestre',
        '2026-T3',
        '--arquivo',
        'p.csv',
        '--o-que-mudou',
        't.txt',
        '--substituir',
        '2026-T3',
        '--confirmar',
      ]),
    ).toEqual({
      trimestre: '2026-T3',
      arquivo: 'p.csv',
      oQueMudou: 't.txt',
      substituir: '2026-T3',
      confirmar: true,
    })
  })
  it('falta de argumento ou opção desconhecida mostra o uso', () => {
    expect(() => lerArgs(['--trimestre', '2026-T3'])).toThrow(USO)
    expect(() => lerArgs(['--arquivo', 'p.csv'])).toThrow(USO)
    expect(() =>
      lerArgs(['--trimestre', '2026-T3', '--arquivo', 'p.csv', '--comentarios', 'x']),
    ).toThrow(USO)
  })
})
