import { describe, expect, it } from 'vitest'
import {
  aplicarBloco,
  extrairBloco,
  MARCA_FIM,
  MARCA_INICIO,
  paginaNova,
  type Modelo,
} from './blocos.ts'

const modelo: Modelo = { titulo: 'Página', proposito: 'explicar.', publico: 'time.' }

describe('blocos gerados', () => {
  it('cria a página com cabeçalho padrão e o bloco entre marcas', () => {
    const p = paginaNova(modelo, 'conteúdo', '2026-10-11')
    expect(p).toContain('# Página')
    expect(p).toContain('Propósito: explicar. Público: time. Revisão: 2026-10-11.')
    expect(extrairBloco(p)).toBe('conteúdo')
  })

  it('extrairBloco devolve undefined sem as duas marcas ou fora de ordem', () => {
    expect(extrairBloco('nada')).toBeUndefined()
    expect(extrairBloco(`${MARCA_INICIO}\nx`)).toBeUndefined()
    expect(extrairBloco(`${MARCA_FIM}\n${MARCA_INICIO}`)).toBeUndefined()
  })

  it('aplicarBloco cria, mantém quando igual, e troca só o bloco (preserva o texto à mão e atualiza a revisão)', () => {
    expect(aplicarBloco(undefined, modelo, 'a', '2026-10-11')).toBe(
      paginaNova(modelo, 'a', '2026-10-11'),
    )
    const base = `${paginaNova(modelo, 'a', '2026-10-11')}\nTexto à mão depois.\n`
    expect(aplicarBloco(base, modelo, 'a', '2026-12-01')).toBe(base)
    const novo = aplicarBloco(base, modelo, 'b', '2026-12-01')
    expect(extrairBloco(novo)).toBe('b')
    expect(novo).toContain('Revisão: 2026-12-01.')
    expect(novo).toContain('Texto à mão depois.')
  })

  it('recusa sobrescrever página sem marcas', () => {
    expect(() => aplicarBloco('# escrito à mão', modelo, 'a', '2026-10-11')).toThrow(
      'sem as marcas',
    )
  })
})
