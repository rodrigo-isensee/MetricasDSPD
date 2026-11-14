import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type {
  Dominio,
  FiltrosDe,
  MetricaId,
  OpcoesFiltro,
  ResultadoDe,
} from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data/mock/MockFonteMetricas'
import { renderizarApp } from '@/test/helpers'

afterEach(() => window.localStorage.clear())

const SETORES = [
  { id: 'ciencia-de-dados', nome: 'Ciência de Dados' },
  { id: 'marketing-e-vendas', nome: 'Marketing e Vendas' },
  { id: 'plataformas', nome: 'Plataformas' },
]
const SOBRENOME = 'Zanellatto'

type Chamada = { id: MetricaId; filtros: Record<string, unknown> }

class FonteSetor extends MockFonteMetricas {
  chamadas: Chamada[] = []
  modo: 'ok' | 'erro' | 'erro-uma-vez' | 'vazio' | 'trava' = 'ok'
  constructor() {
    super({ latenciaMs: 0 })
  }
  override async obter<K extends MetricaId>(id: K, filtros: FiltrosDe<K>): Promise<ResultadoDe<K>> {
    this.chamadas.push({ id, filtros })
    // O servidor ainda não conhece `setor` (L10b): a fonte de teste o ignora, como o contrato prevê para o intervalo.
    const resto = { ...filtros } as { setor?: string[] }
    delete resto.setor
    return super.obter(id, resto as FiltrosDe<K>)
  }
  override async opcoesFiltro<D extends Dominio>(
    dominio: D,
  ): Promise<Extract<OpcoesFiltro, { dominio: D }>> {
    if (this.modo === 'trava' && dominio === 'businessmap') return new Promise(() => undefined)
    if (this.modo === 'erro' && dominio === 'businessmap') throw new Error('falha')
    if (this.modo === 'erro-uma-vez' && dominio === 'businessmap') {
      this.modo = 'ok'
      throw new Error('falha')
    }
    const r = await super.opcoesFiltro(dominio)
    if (r.dominio !== 'businessmap') return r
    const setores =
      this.modo === 'vazio' ? [] : SETORES.map((o) => ({ ...o, responsavel: SOBRENOME }))
    return { ...r, setores }
  }
  com(id: MetricaId): Chamada[] {
    return this.chamadas.filter((c) => c.id === id)
  }
}

const bloco = (id: 'resumo-fluxo' | 'resumo-sustentacao') =>
  screen.findByTestId(id, undefined, { timeout: 8000 })
const busca = (r: { roteador: { state: { location: { search: string } } } }) =>
  new URLSearchParams(r.roteador.state.location.search)
const marcar = async (...nomes: string[]) => {
  const fluxo = await bloco('resumo-fluxo')
  await userEvent.click(
    await within(fluxo).findByRole('button', { name: 'Setor: Todos' }, { timeout: 8000 }),
  )
  const d = await screen.findByRole('dialog', { name: 'Setor' })
  for (const n of nomes) await userEvent.click(within(d).getByRole('checkbox', { name: n }))
  await userEvent.click(within(d).getByRole('button', { name: 'Fechar' }))
}

describe('Resumo: filtro Setor no bloco Fluxo (097 L11)', () => {
  it('CA-39 e CA-43: o bloco Fluxo tem "Setor: Todos"; o bloco Sustentação não tem Setor', async () => {
    renderizarApp('/operacional', new FonteSetor())
    const fluxo = await bloco('resumo-fluxo')
    expect(
      await within(fluxo).findByRole('button', { name: 'Setor: Todos' }, { timeout: 8000 }),
    ).toBeInTheDocument()
    const sust = await bloco('resumo-sustentacao')
    await within(sust).findByTestId('filtro-bloco-sustentacao')
    expect(within(sust).queryByText(/Setor/)).toBeNull()
    expect(within(sust).queryByRole('button', { name: /Setor/ })).toBeNull()
  })

  it('marcar um setor põe `setor` na URL, mostra o chip e manda o setor nas consultas do bloco Fluxo', async () => {
    const fonte = new FonteSetor()
    const r = renderizarApp('/operacional', fonte)
    await marcar('Plataformas')
    await waitFor(() => expect(busca(r).get('setor')).toBe('plataformas'))
    const fluxo = await bloco('resumo-fluxo')
    expect(await within(fluxo).findByTestId('chip-filtro-setor')).toHaveTextContent(
      'Setor: Plataformas',
    )
    await waitFor(() =>
      expect(
        fonte
          .com('O3')
          .some((c) => (c.filtros.setor as string[] | undefined)?.[0] === 'plataformas'),
      ).toBe(true),
    )
    // sem aviso consolidado com um setor só
    expect(within(fluxo).queryByTestId('aviso-consolidado-setor-fluxo')).toBeNull()
  })

  it('CA-49: o setor não chega ao bloco Sustentação (nenhuma consulta da Sustentação leva `setor`)', async () => {
    const fonte = new FonteSetor()
    const r = renderizarApp('/operacional', fonte)
    await marcar('Ciência de Dados')
    await waitFor(() => expect(busca(r).get('setor')).toBe('ciencia-de-dados'))
    await screen.findByTestId('numero-s2', undefined, { timeout: 8000 })
    const sust = fonte.chamadas.filter((c) => c.id.startsWith('S') || c.id === 'TENDENCIA_SUST')
    expect(sust.length).toBeGreaterThan(0)
    for (const c of sust) expect(c.filtros).not.toHaveProperty('setor')
    // o bloco Sustentação não ganhou filtro, chip nem aviso de setor
    const bs = await bloco('resumo-sustentacao')
    expect(within(bs).queryByTestId('chip-filtro-setor')).toBeNull()
  })

  it('CA-45: dois setores mostram o aviso consolidado no bloco Fluxo, e um único conjunto de números', async () => {
    renderizarApp('/operacional', new FonteSetor())
    await marcar('Plataformas', 'Marketing e Vendas')
    const fluxo = await bloco('resumo-fluxo')
    expect(await within(fluxo).findByTestId('aviso-consolidado-setor-fluxo')).toHaveTextContent(
      'Resultado consolidado de 2 setores. O sistema não compara setores.',
    )
    expect(within(fluxo).getAllByTestId(/^numero-/).length).toBeGreaterThan(0)
    expect(within(fluxo).queryByText(/Plataformas.*Marketing|por setor/)).toBeNull()
  })

  it('"Limpar filtros" do Setor volta a "Todos" e tira o parâmetro da URL', async () => {
    const r = renderizarApp('/operacional?setor=plataformas', new FonteSetor())
    const fluxo = await bloco('resumo-fluxo')
    await userEvent.click(
      await within(fluxo).findByRole(
        'button',
        { name: 'Limpar filtros de Setor do bloco Fluxo' },
        { timeout: 8000 },
      ),
    )
    await waitFor(() => expect(busca(r).has('setor')).toBe(false))
    expect(await within(fluxo).findByRole('button', { name: 'Setor: Todos' })).toBeInTheDocument()
  })

  it('CA-41: nenhum sobrenome na tela, em title, aria-label nem na URL', async () => {
    const r = renderizarApp('/operacional', new FonteSetor())
    await marcar('Plataformas', 'Ciência de Dados')
    await waitFor(() => expect(busca(r).get('setor')?.split(',')).toHaveLength(2))
    const fluxo = await bloco('resumo-fluxo')
    await within(fluxo).findByTestId('aviso-consolidado-setor-fluxo')
    const marca = new RegExp(SOBRENOME, 'i')
    expect(document.body.textContent).not.toMatch(marca)
    for (const el of document.body.querySelectorAll('[title],[aria-label]'))
      expect(`${el.getAttribute('title')} ${el.getAttribute('aria-label')}`).not.toMatch(marca)
    expect(r.roteador.state.location.search).not.toMatch(marca)
  })

  it('CA-20: sem setores na base, o filtro fica desabilitado "sem opções" com a frase de vazio', async () => {
    const f = new FonteSetor()
    f.modo = 'vazio'
    renderizarApp('/operacional', f)
    const fluxo = await bloco('resumo-fluxo')
    const botao = await within(fluxo).findByTestId('setor-fluxo-vazio', undefined, {
      timeout: 8000,
    })
    expect(botao).toBeDisabled()
    expect(botao).toHaveTextContent('Setor: sem opções')
    expect(within(fluxo).getByText(/Ainda não há setores na base/)).toBeInTheDocument()
  })

  it('CA-19: carregando, o botão fica desabilitado "carregando…"', async () => {
    const f = new FonteSetor()
    f.modo = 'trava'
    renderizarApp('/operacional', f)
    const fluxo = await bloco('resumo-fluxo')
    const botao = await within(fluxo).findByTestId('setor-fluxo-carregando', undefined, {
      timeout: 8000,
    })
    expect(botao).toBeDisabled()
    expect(botao).toHaveTextContent('Setor: carregando…')
  })

  it('CA-21: falha nas opções mostra "Setor: indisponível", a mensagem e "Tentar de novo", sem esconder os números', async () => {
    const f = new FonteSetor()
    f.modo = 'erro'
    renderizarApp('/operacional', f)
    const fluxo = await bloco('resumo-fluxo')
    const caixa = await within(fluxo).findByTestId('filtro-setor-bloco-fluxo', undefined, {
      timeout: 8000,
    })
    const alerta = await within(caixa).findByRole('alert', undefined, { timeout: 15000 })
    expect(alerta).toHaveTextContent('Não foi possível carregar as opções de Setor.')
    expect(within(alerta).getByRole('button', { name: 'Setor: indisponível' })).toBeDisabled()
    expect(within(alerta).getByRole('button', { name: 'Tentar de novo' })).toBeEnabled()
    expect(
      await screen.findByTestId('numero-p85', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
  })

  it('"Tentar de novo" refaz a consulta das opções e o filtro volta a "Setor: Todos"', async () => {
    const f = new FonteSetor()
    f.modo = 'erro-uma-vez'
    renderizarApp('/operacional', f)
    const fluxo = await bloco('resumo-fluxo')
    const caixa = await within(fluxo).findByTestId('filtro-setor-bloco-fluxo', undefined, {
      timeout: 8000,
    })
    const alerta = await within(caixa).findByRole('alert', undefined, { timeout: 15000 })
    await userEvent.click(within(alerta).getByRole('button', { name: 'Tentar de novo' }))
    expect(
      await within(fluxo).findByRole('button', { name: 'Setor: Todos' }, { timeout: 8000 }),
    ).toBeInTheDocument()
  })
})
