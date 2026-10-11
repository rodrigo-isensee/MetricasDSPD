import { screen, waitFor } from '@testing-library/react'
import type { ComponentType } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { FiltrosDe, MetricaId, ResultadoDe } from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data'
import { FILTROS_FLUXO, FILTROS_SUSTENTACAO } from '@/features/painel/testes/fonteFixa'
import { fonteDeTeste, renderizarCartao } from '@/test/helpers'
import {
  CartaoO11,
  CartaoO13,
  CartaoO14,
  CartaoO16,
  CartaoO17,
  CartaoO5,
  CartaoO6,
  CartaoO8,
} from './fluxo'
import { CartaoE4, CartaoE5, CartaoT6, CartaoT8 } from './previsao'
import { CartaoS10, CartaoS11, CartaoS12, CartaoS8, CartaoS9 } from './sustentacao'

vi.setConfig({ testTimeout: 45000 })

type Modo = 'insuficiente' | 'misto' | 'listas-vazias' | 'vazio' | 'erro' | 'nulos'

/** Estatística ou taxa que a regra dos 20 itens deixaria de publicar. */
const rebaixar = (o: Record<string, unknown>) =>
  'k' in o
    ? { status: 'insuficiente', k: o.k, n: 5, minimo: 20 }
    : { status: 'insuficiente', n: 5, minimo: 20, janela: o.janela }

function transformar(v: unknown, modo: Modo, indice = 0): unknown {
  if (Array.isArray(v)) {
    if (modo === 'listas-vazias') return []
    return v.map((x, i) => transformar(x, modo, i))
  }
  if (v === null || typeof v !== 'object')
    return modo === 'nulos' && typeof v === 'number' ? null : v
  const o = v as Record<string, unknown>
  if (
    o.status === 'ok' &&
    'n' in o &&
    (modo === 'insuficiente' || (modo === 'misto' && indice > 0))
  )
    return rebaixar(o)
  const r: Record<string, unknown> = {}
  for (const [k, x] of Object.entries(o)) {
    if (k === 'base' || k === 'criterios' || k === 'janelaPercentis' || k === 'janela') r[k] = x
    else r[k] = transformar(x, modo, indice)
  }
  // Classe e prioridade com amostra pequena (T6) seguem o mesmo critério.
  if ((modo === 'insuficiente' || (modo === 'misto' && indice > 0)) && 'classe' in o && 'n' in o)
    r.n = 5
  return r
}

class FonteModo extends MockFonteMetricas {
  private readonly modo: Modo
  constructor(modo: Modo) {
    super({ latenciaMs: 0 })
    this.modo = modo
  }
  override async obter<K extends MetricaId>(id: K, filtros: FiltrosDe<K>): Promise<ResultadoDe<K>> {
    if (this.modo === 'erro') throw new Error('falha simulada')
    const r = (await fonteDeTeste.obter(id, filtros)) as { base: { n: number } }
    if (this.modo === 'vazio') return { ...r, base: { ...r.base, n: 0 } } as ResultadoDe<K>
    return transformar(r, this.modo) as ResultadoDe<K>
  }
}

const CARTOES: [string, ComponentType<{ filtros: never }>, 'fluxo' | 'sust'][] = [
  ['O5', CartaoO5, 'fluxo'],
  ['O6', CartaoO6, 'fluxo'],
  ['O8', CartaoO8, 'fluxo'],
  ['O11', CartaoO11, 'fluxo'],
  ['O13', CartaoO13, 'fluxo'],
  ['O14', CartaoO14, 'fluxo'],
  ['O16', CartaoO16, 'fluxo'],
  ['O17', CartaoO17, 'fluxo'],
  ['T6', CartaoT6, 'fluxo'],
  ['T8', CartaoT8, 'fluxo'],
  ['E4', CartaoE4, 'fluxo'],
  ['E5', CartaoE5, 'fluxo'],
  ['S8', CartaoS8, 'sust'],
  ['S9', CartaoS9, 'sust'],
  ['S10', CartaoS10, 'sust'],
  ['S11', CartaoS11, 'sust'],
  ['S12', CartaoS12, 'sust'],
] as never

const SEM_MINIMO = new Set(['O11', 'O14', 'O16', 'O17', 'E4'])

const ESTADO: Record<Modo, RegExp> = {
  insuficiente: /^ok$/,
  misto: /^ok$/,
  'listas-vazias': /^(ok|vazio)$/,
  nulos: /^ok$/,
  vazio: /^vazio$/,
  erro: /^erro$/,
}

describe.each(CARTOES)('%s: estados do cartão', (codigo, Cartao, tipo) => {
  it.each(Object.keys(ESTADO) as Modo[])(
    'modo %s não quebra e mostra o estado certo',
    async (modo) => {
      const filtros = tipo === 'fluxo' ? FILTROS_FLUXO : FILTROS_SUSTENTACAO
      const C = Cartao as ComponentType<{ filtros: unknown }>
      renderizarCartao(<C filtros={filtros} />, { fonte: new FonteModo(modo) })
      const el = await screen.findByTestId(`metrica-${codigo}`)
      await waitFor(() =>
        expect(el).toHaveAttribute('data-estado', expect.stringMatching(ESTADO[modo])),
      )
      if (modo === 'erro')
        expect(screen.getByRole('button', { name: /tentar de novo/i })).toBeInTheDocument()
      // Sem estatística de distribuição (só contagens), não há o que rebaixar.
      if (modo === 'insuficiente' && !SEM_MINIMO.has(codigo))
        expect(el.textContent).toMatch(/amostra insuficiente|de 20 itens mínimos|\d+ de \d+/i)
    },
  )
})
