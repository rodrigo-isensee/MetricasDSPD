import { cleanup, screen, waitFor, within } from '@testing-library/react'
import type { ComponentType } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  MOTIVO_S11_CONVERSAO_SEM_DADO_REAL,
  type FiltrosDe,
  type MetricaId,
  type ResultadoDe,
} from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data/mock/MockFonteMetricas'
import { FILTROS_FLUXO, FILTROS_SUSTENTACAO } from '@/features/painel/testes/fonteFixa'
import { fonteDeTeste, renderizarCartao } from '@/test/helpers'
import { CartaoO11, CartaoO13, CartaoO14, CartaoO16, CartaoO5, CartaoO6, CartaoO8 } from './fluxo'
import {
  CartaoO19,
  CartaoO20,
  CartaoO21,
  CartaoO22,
  CartaoO24,
  CartaoO25,
  CartaoO26,
} from './operacionais'
import { CartaoE4, CartaoE5, CartaoT6, CartaoT8 } from './previsao'
import { CartaoO17, CartaoS10, CartaoS11, CartaoS12, CartaoS8, CartaoS9 } from './sustentacao'

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
  ['O19', CartaoO19, 'fluxo'],
  ['O20', CartaoO20, 'fluxo'],
  ['O21', CartaoO21, 'fluxo'],
  ['O22', CartaoO22, 'fluxo'],
  ['O24', CartaoO24, 'fluxo'],
  ['O25', CartaoO25, 'fluxo'],
  ['O26', CartaoO26, 'fluxo'],
  ['O17', CartaoO17, 'sust'],
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

const SEM_MINIMO = new Set(['O11', 'O14', 'O16', 'O17', 'E4', 'O20'])

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

/** Resposta com `campoDisponivel: false`, como a fonte real devolve enquanto o campo não tem coleta. */
class FonteSemCampo extends MockFonteMetricas {
  constructor() {
    super({ latenciaMs: 0 })
  }
  override async obter<K extends MetricaId>(id: K, filtros: FiltrosDe<K>): Promise<ResultadoDe<K>> {
    const r = await fonteDeTeste.obter(id, filtros)
    return { ...r, campoDisponivel: false }
  }
}

describe.each(['E4', 'S8', 'S11', 'S12'])('%s: campo sem fonte', (codigo) => {
  it('mostra "Campo sem fonte" (texto e ícone), sem número e sem "amostra insuficiente"', async () => {
    const [, Cartao, tipo] = CARTOES.find((c) => c[0] === codigo)!
    const filtros = tipo === 'fluxo' ? FILTROS_FLUXO : FILTROS_SUSTENTACAO
    const C = Cartao as ComponentType<{ filtros: unknown }>
    renderizarCartao(<C filtros={filtros} />, { fonte: new FonteSemCampo() })
    const el = await screen.findByTestId(`metrica-${codigo}`)
    const aviso = await within(el).findByTestId(`campo-sem-fonte-${codigo}`)
    expect(aviso).toHaveTextContent('Campo sem fonte')
    expect(aviso.querySelector('svg')).not.toBeNull()
    expect(el).not.toHaveTextContent(/amostra insuficiente/i)
    expect(within(el).queryByRole('img')).not.toBeInTheDocument()
  })
})

/** S11 pela Decisão 18b: conversão nula vira "sem dado real" com o motivo, nunca 0; semFluxo aparece. */
class FonteS11 extends MockFonteMetricas {
  private readonly semFluxo: number
  private readonly comConversao: boolean
  private readonly extra: Record<string, unknown>
  private readonly conversaoPronta: unknown
  constructor(
    semFluxo: number,
    comConversao = false,
    extra: Record<string, unknown> = {},
    conversaoPronta?: unknown,
  ) {
    super({ latenciaMs: 0 })
    this.semFluxo = semFluxo
    this.comConversao = comConversao
    this.extra = extra
    this.conversaoPronta = conversaoPronta
  }
  override async obter<K extends MetricaId>(id: K, filtros: FiltrosDe<K>): Promise<ResultadoDe<K>> {
    const r = (await fonteDeTeste.obter(id, filtros)) as ResultadoDe<'S11'>
    const conversao =
      this.conversaoPronta ??
      (this.comConversao ? { ...r.escopo, status: 'ok' as const, k: 12, n: 40, valor: 0.3 } : null)
    return {
      ...r,
      ...this.extra,
      conversao,
      motivoConversao: conversao !== null ? null : MOTIVO_S11_CONVERSAO_SEM_DADO_REAL,
      semFluxo: this.semFluxo,
    } as unknown as ResultadoDe<K>
  }
}

describe('S11: conversão e chamados fora do fluxo', () => {
  const abrir = async (fonte: MockFonteMetricas) => {
    renderizarCartao(<CartaoS11 filtros={FILTROS_SUSTENTACAO} />, { fonte })
    return screen.findByTestId('metrica-S11')
  }
  it('conversão nula: "sem dado real" com o nome da linha e o motivo, e nota no plural', async () => {
    const el = await abrir(new FonteS11(7))
    await waitFor(() => expect(el).toHaveTextContent('sem dado real'))
    expect(el).toHaveTextContent(
      'Avaliações que viraram Registro de Problema: sem dado real. Aguardando o vínculo do chamado com o Registro de Problema.',
    )
    expect(el).not.toHaveTextContent('Conversão sem dado real')
    const nota = within(el).getByTestId('s11-fora-do-fluxo')
    expect(nota).toHaveTextContent('7 chamados ficaram fora desta métrica')
    expect(nota.querySelector('svg')).not.toBeNull()
  })
  it('um chamado fora: nota no singular', async () => {
    const el = await abrir(new FonteS11(1))
    const nota = await within(el).findByTestId('s11-fora-do-fluxo')
    expect(nota).toHaveTextContent('1 chamado ficou fora desta métrica: não tem fluxo definido')
  })
  it('nenhum fora: a nota some', async () => {
    const el = await abrir(new FonteS11(0))
    await within(el).findByRole('table')
    expect(within(el).queryByTestId('s11-fora-do-fluxo')).not.toBeInTheDocument()
  })
  it('conversão com valor: mostra o percentual e não o texto "sem dado real" nem o motivo', async () => {
    const el = await abrir(new FonteS11(0, true))
    const bloco = await within(el).findByTestId('s11-conversao')
    expect(bloco).not.toHaveTextContent('sem dado real')
    expect(bloco).toHaveTextContent(/viraram Registro de Problema: .*\d+%/)
    expect(bloco).toHaveTextContent('Base: 40 avaliações.')
    expect(bloco).not.toHaveTextContent('Amostra insuficiente')
    expect(within(el).queryByRole('row', { name: /viraram Registro/ })).not.toBeInTheDocument()
    expect(el).not.toHaveTextContent('a base ainda não liga')
  })
  const insuficiente = (n: number) => ({ status: 'insuficiente', k: 0, n })
  it('conversão insuficiente: texto de amostra insuficiente, sem "0 de 13" e sem percentual', async () => {
    const el = await abrir(new FonteS11(0, false, {}, insuficiente(13)))
    const bloco = await within(el).findByTestId('s11-conversao')
    expect(bloco).toHaveTextContent(
      'Avaliações que viraram Registro de Problema: Amostra insuficiente (13 avaliações)',
    )
    expect(bloco).toHaveTextContent('há 13 avaliações registradas e são precisas pelo menos 20')
    expect(bloco).toHaveTextContent('Isto não significa zero.')
    expect(el).not.toHaveTextContent('0 de 13')
    expect(bloco).not.toHaveTextContent('%')
    expect(bloco).not.toHaveTextContent(/fora da conversão/)
  })
  it('conversão insuficiente com 1 avaliação: singular', async () => {
    const el = await abrir(new FonteS11(0, false, {}, insuficiente(1)))
    const bloco = await within(el).findByTestId('s11-conversao')
    expect(bloco).toHaveTextContent('Amostra insuficiente (1 avaliação)')
    expect(bloco).toHaveTextContent('há 1 avaliação registradas')
  })
  it('fora da conversão: 0 e ausente não mostram a frase', async () => {
    for (const extra of [{ foraDaConversao: 0 }, { foraDaConversao: undefined }]) {
      const el = await abrir(new FonteS11(0, true, extra))
      await within(el).findByTestId('s11-conversao')
      expect(el).not.toHaveTextContent('fora da conversão')
      cleanup()
    }
  })
  it('fora da conversão: 1 no singular e 3 no plural, com a razão', async () => {
    const um = await abrir(new FonteS11(0, true, { foraDaConversao: 1 }))
    const b1 = await within(um).findByTestId('s11-conversao')
    expect(b1).toHaveTextContent(
      '1 avaliação ficou fora da conversão: esse chamado não tem decisão registrada no campo.',
    )
    cleanup()
    const tres = await abrir(new FonteS11(0, true, { foraDaConversao: 3 }))
    const b3 = await within(tres).findByTestId('s11-conversao')
    expect(b3).toHaveTextContent(
      '3 avaliações ficaram fora da conversão: esses chamados não têm decisão registrada no campo.',
    )
    expect(b3).not.toHaveTextContent(/PROC|fluxos antigos|vínculo/)
  })
})
