import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import type {
  Dominio,
  FiltrosDe,
  MetricaId,
  OpcoesFiltro,
  ResultadoDe,
} from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data'
import { fonteDeTeste, renderizarApp } from '@/test/helpers'

afterEach(() => window.localStorage.clear())

type Chamada = { id: MetricaId; filtros: Record<string, unknown> }

/** Fonte de teste: registra as consultas; com equipe no O3, devolve "Poucos itens"; as opções podem falhar, vir vazias ou travar. */
class FonteEquipe extends MockFonteMetricas {
  chamadas: Chamada[] = []
  modoOpcoes: 'ok' | 'erro' | 'erro-uma-vez' | 'vazio' | 'trava' = 'ok'
  constructor() {
    super({ latenciaMs: 0 })
  }
  override async obter<K extends MetricaId>(id: K, filtros: FiltrosDe<K>): Promise<ResultadoDe<K>> {
    this.chamadas.push({ id, filtros: filtros })
    const r = await super.obter(id, filtros)
    const equipe = (filtros as { equipe?: string[] }).equipe ?? []
    if (id === 'O3' && equipe.length > 0) {
      const copia = structuredClone(r) as ResultadoDe<'O3'>
      for (const c of copia.classes) {
        c.estatistica = { status: 'insuficiente', n: 14, minimo: 20, janela: c.estatistica.janela }
        c.n = 14
      }
      return copia
    }
    return r
  }
  override async opcoesFiltro<D extends Dominio>(
    dominio: D,
  ): Promise<Extract<OpcoesFiltro, { dominio: D }>> {
    if (this.modoOpcoes === 'trava') return new Promise(() => undefined)
    if (this.modoOpcoes === 'erro') throw new Error('falha')
    if (this.modoOpcoes === 'erro-uma-vez') {
      this.modoOpcoes = 'ok'
      throw new Error('falha')
    }
    const r = await super.opcoesFiltro(dominio)
    if (this.modoOpcoes === 'vazio') return { ...r, equipes: [] }
    return r
  }
  com(id: MetricaId): Chamada[] {
    return this.chamadas.filter((c) => c.id === id)
  }
}

let bm: { id: string; nome: string }[]
let ac: { id: string; nome: string }[]
beforeAll(async () => {
  bm = (await fonteDeTeste.opcoesFiltro('businessmap')).equipes
  ac = (await fonteDeTeste.opcoesFiltro('acelerato')).equipes
}, 60000)

const bloco = (id: 'resumo-fluxo' | 'resumo-sustentacao') =>
  screen.findByTestId(id, undefined, { timeout: 8000 })
const botao = async (id: 'resumo-fluxo' | 'resumo-sustentacao', nome: string | RegExp) =>
  within(await bloco(id)).findByRole('button', { name: nome }, { timeout: 8000 })
const abrir = async (id: 'resumo-fluxo' | 'resumo-sustentacao') => {
  await userEvent.click(await botao(id, 'Equipe: Todas'))
  return screen.findByRole('dialog', { name: 'Equipe' })
}
const marcar = async (id: 'resumo-fluxo' | 'resumo-sustentacao', nome: string) => {
  const d = await abrir(id)
  await userEvent.click(within(d).getByRole('checkbox', { name: nome }))
  await userEvent.click(within(d).getByRole('button', { name: 'Fechar' }))
}
const espera = async (id: string) => {
  const el = await screen.findByTestId(`numero-${id}`, undefined, { timeout: 8000 })
  await waitFor(() => expect(within(el).queryByTestId(`numero-${id}-carregando`)).toBeNull(), {
    timeout: 8000,
  })
  return el
}
const busca = (r: { roteador: { state: { location: { search: string } } } }) =>
  new URLSearchParams(r.roteador.state.location.search)

describe('Resumo: filtro Equipe por bloco (097 L5)', () => {
  it('CA-1: cada bloco tem o seu filtro Equipe, com valor inicial "Todas"', async () => {
    renderizarApp('/operacional', new FonteEquipe())
    expect(await botao('resumo-fluxo', 'Equipe: Todas')).toBeInTheDocument()
    expect(await botao('resumo-sustentacao', 'Equipe: Todas')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Equipe: / })).toHaveLength(2)
    // dentro do bloco, depois do cabeçalho (título e fonte) e antes dos números
    const fluxo = await bloco('resumo-fluxo')
    const filtro = within(fluxo).getByTestId('filtro-bloco-fluxo')
    const numeros = await within(fluxo).findByTestId('numeros-fluxo')
    expect(
      within(fluxo).getByTestId('resumo-fluxo-fonte').compareDocumentPosition(filtro) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(filtro.compareDocumentPosition(numeros) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('CA-2: o fluxo lista só as equipes do BusinessMap e a Sustentação só as do Acelerato', async () => {
    renderizarApp('/operacional', new FonteEquipe())
    const d1 = await abrir('resumo-fluxo')
    const nomes1 = within(d1)
      .getAllByRole('checkbox')
      .map((c) => c.getAttribute('aria-label') ?? c.closest('label')?.textContent)
    expect(nomes1).toEqual(bm.map((e) => e.nome))
    await userEvent.click(within(d1).getByRole('button', { name: 'Fechar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    const d2 = await abrir('resumo-sustentacao')
    const nomes2 = within(d2)
      .getAllByRole('checkbox')
      .map((c) => c.getAttribute('aria-label') ?? c.closest('label')?.textContent)
    expect(nomes2).toEqual(ac.map((e) => e.nome))
    expect(nomes1.some((n) => nomes2.includes(n))).toBe(false)
  })

  it('CA-3: marcar no fluxo muda só o fluxo (números, tendência e URL); e vice-versa', async () => {
    const fonte = new FonteEquipe()
    const r = renderizarApp('/operacional', fonte)
    await espera('p85')
    await espera('s2')
    await screen.findByTestId('tendencia-sustentacao', undefined, { timeout: 8000 })
    fonte.chamadas = []
    await marcar('resumo-fluxo', bm[0]!.nome)
    await waitFor(() => expect(busca(r).get('equipe')).toBe(bm[0]!.id))
    expect(busca(r).has('sust_equipe')).toBe(false)
    await waitFor(() =>
      expect(fonte.com('TENDENCIA_FLUXO').some((c) => c.filtros.equipe !== undefined)).toBe(true),
    )
    expect(fonte.com('O3').at(-1)?.filtros.equipe).toEqual([bm[0]!.id])
    expect(fonte.com('TENDENCIA_FLUXO').at(-1)?.filtros.equipe).toEqual([bm[0]!.id])
    // nenhuma consulta da Sustentação foi refeita com equipe
    expect([
      ...fonte.com('S1'),
      ...fonte.com('S2'),
      ...fonte.com('S3'),
      ...fonte.com('TENDENCIA_SUST'),
    ]).toHaveLength(0)
    expect(await botao('resumo-fluxo', `Equipe: ${bm[0]!.nome}`)).toBeInTheDocument()
    expect(await botao('resumo-sustentacao', 'Equipe: Todas')).toBeInTheDocument()

    fonte.chamadas = []
    await marcar('resumo-sustentacao', ac[0]!.nome)
    await waitFor(() => expect(busca(r).get('sust_equipe')).toBe(ac[0]!.id))
    expect(busca(r).get('equipe')).toBe(bm[0]!.id)
    await waitFor(() => expect(fonte.com('S2').at(-1)?.filtros.equipe).toEqual([ac[0]!.id]))
    expect(fonte.com('TENDENCIA_SUST').at(-1)?.filtros.equipe).toEqual([ac[0]!.id])
    expect([...fonte.com('O3'), ...fonte.com('O4'), ...fonte.com('TENDENCIA_FLUXO')]).toHaveLength(
      0,
    )
  })

  it('CA-4 e CA-5: com duas equipes há o aviso consolidado e um conjunto só de números, sem soma nem lado a lado', async () => {
    const fonte = new FonteEquipe()
    const r = renderizarApp('/operacional', fonte)
    await espera('p85')
    expect(screen.queryByTestId('aviso-consolidado-fluxo')).toBeNull()
    const d = await abrir('resumo-fluxo')
    await userEvent.click(within(d).getByRole('checkbox', { name: bm[0]!.nome }))
    expect(screen.queryByTestId('aviso-consolidado-fluxo')).toBeNull()
    await userEvent.click(within(d).getByRole('checkbox', { name: bm[1]!.nome }))
    await userEvent.click(within(d).getByRole('button', { name: 'Fechar' }))
    const fluxo = await bloco('resumo-fluxo')
    expect(await within(fluxo).findByTestId('aviso-consolidado-fluxo')).toHaveTextContent(
      'Resultado consolidado de 2 equipes. O sistema não compara equipes.',
    )
    // o aviso é só do bloco dela
    const sust = await bloco('resumo-sustentacao')
    expect(within(sust).queryByTestId('aviso-consolidado-sustentacao')).toBeNull()
    expect(busca(r).get('equipe')).toBe(`${bm[0]!.id},${bm[1]!.id}`)
    // uma só consulta por métrica, com as duas equipes juntas
    await waitFor(() =>
      expect(fonte.com('O3').at(-1)?.filtros.equipe).toEqual([bm[0]!.id, bm[1]!.id]),
    )
    // um conjunto de números: os mesmos quatro cartões do fluxo e os três da Sustentação
    expect(within(fluxo).getByTestId('numeros-fluxo').children).toHaveLength(4)
    expect(within(fluxo).getAllByTestId('numeros-fluxo')).toHaveLength(1)
    expect(within(sust).getByTestId('numeros-sustentacao').children).toHaveLength(3)
    // nada de ordenar nem somar as fontes
    expect(screen.queryByText(/ranking|total geral|combinado|somado/i)).toBeNull()
    // os chips seguem a ordem em que a pessoa marcou, uma linha só de chips
    expect(within(fluxo).getAllByTestId('chip-filtro-equipe')).toHaveLength(2)
  })

  it('CA-6: equipe marcada com menos de 20 itens mantém "Estatística não publicada"', async () => {
    const r = renderizarApp('/operacional', new FonteEquipe())
    await espera('p85')
    await marcar('resumo-fluxo', bm[0]!.nome)
    await waitFor(() => expect(busca(r).get('equipe')).toBe(bm[0]!.id))
    const p85 = await espera('p85')
    await waitFor(() =>
      expect(within(p85).getByTestId('numero-p85-insuficiente')).toHaveTextContent(
        'Poucos itens (n=14). Estatística não publicada.',
      ),
    )
    expect(within(p85).queryByTestId('numero-p85-valor')).toBeNull()
  })

  it('a equipe da URL vem marcada, com chip e "Limpar filtros" que volta a "Todas" sem mexer no outro bloco', async () => {
    const r = renderizarApp(
      `/operacional?equipe=${bm[0]!.id}&sust_equipe=${ac[0]!.id}`,
      new FonteEquipe(),
    )
    const fluxo = await bloco('resumo-fluxo')
    expect(await botao('resumo-fluxo', `Equipe: ${bm[0]!.nome}`)).toBeInTheDocument()
    const chip = await within(fluxo).findByTestId('chip-filtro-equipe')
    expect(chip).toHaveTextContent(`Equipe: ${bm[0]!.nome}`)
    // o nome acessível diz o bloco (dois "Limpar filtros" na tela não se confundem)
    const limparFluxo = within(fluxo).getByRole('button', {
      name: 'Limpar filtros de Equipe do bloco Fluxo',
    })
    expect(limparFluxo).toHaveTextContent('Limpar filtros')
    const sustBloco = await bloco('resumo-sustentacao')
    expect(
      await within(sustBloco).findByRole('button', {
        name: 'Limpar filtros de Equipe do bloco Sustentação',
      }),
    ).toBeInTheDocument()
    await userEvent.click(limparFluxo)
    await waitFor(() => expect(busca(r).has('equipe')).toBe(false))
    expect(busca(r).get('sust_equipe')).toBe(ac[0]!.id)
    expect(await botao('resumo-fluxo', 'Equipe: Todas')).toBeInTheDocument()
    expect(within(fluxo).queryByTestId('limpar-equipe-fluxo')).toBeNull()
  })

  it('o chip remove só aquela equipe; os links da visão carregam a equipe do bloco', async () => {
    const r = renderizarApp(`/operacional?equipe=${bm[0]!.id},${bm[1]!.id}`, new FonteEquipe())
    const fluxo = await bloco('resumo-fluxo')
    await within(fluxo).findAllByTestId('chip-filtro-equipe')
    const semanal = within(fluxo).getByRole('link', { name: 'Ver na Semanal' })
    expect(new URLSearchParams(semanal.getAttribute('href')?.split('?')[1]).get('equipe')).toBe(
      `${bm[0]!.id},${bm[1]!.id}`,
    )
    await userEvent.click(
      await within(fluxo).findByRole('button', { name: `Remover filtro Equipe: ${bm[0]!.nome}` }),
    )
    await waitFor(() => expect(busca(r).get('equipe')).toBe(bm[1]!.id))
    await waitFor(() => expect(within(fluxo).queryByTestId('aviso-consolidado-fluxo')).toBeNull())
  })

  it('equipe do link que não existe cai em "Todas" com o aviso de valor ignorado', async () => {
    const r = renderizarApp('/operacional?equipe=xyz&sust_equipe=abc', new FonteEquipe())
    expect(
      await screen.findByTestId('aviso-filtros-invalidos', undefined, { timeout: 8000 }),
    ).toHaveTextContent('equipe "xyz"')
    await waitFor(() => expect(r.roteador.state.location.search).toBe(''))
    expect(await botao('resumo-fluxo', 'Equipe: Todas')).toBeInTheDocument()
  })

  it('as duas normalizações da URL se somam: o fluxo descarta o valor inválido e a Sustentação troca o id antigo pelo slug', async () => {
    const r = renderizarApp('/operacional?equipe=xyz&sust_equipe=totvs', new FonteEquipe())
    expect(
      await screen.findByTestId('aviso-filtros-invalidos', undefined, { timeout: 8000 }),
    ).toHaveTextContent('equipe "xyz"')
    await waitFor(() => expect(busca(r).toString()).toBe('sust_equipe=sssc-totvs'))
    expect(await botao('resumo-sustentacao', 'Equipe: SSSC TOTVS')).toBeInTheDocument()
  })

  it('carregando: o botão fica desabilitado enquanto as opções não chegam', async () => {
    const fonte = new FonteEquipe()
    fonte.modoOpcoes = 'trava'
    renderizarApp('/operacional', fonte)
    const fluxo = await bloco('resumo-fluxo')
    const b = await within(fluxo).findByRole('button', { name: 'Equipe: carregando…' })
    expect(b).toBeDisabled()
    // anunciado por uma só região viva (sem anúncio duplo)
    const status = within(fluxo)
      .getByTestId('filtro-bloco-fluxo')
      .querySelectorAll('[role="status"]')
    expect(status).toHaveLength(1)
    expect(status[0]).toContainElement(b)
  })

  it('vazio: botão desabilitado "sem opções" e a frase que explica', async () => {
    const fonte = new FonteEquipe()
    fonte.modoOpcoes = 'vazio'
    renderizarApp('/operacional', fonte)
    const sust = await bloco('resumo-sustentacao')
    expect(await within(sust).findByRole('button', { name: 'Equipe: sem opções' })).toBeDisabled()
    expect(sust).toHaveTextContent(
      'Ainda não há equipes na base para este período. O filtro aparece quando houver dados.',
    )
    const status = within(sust)
      .getByTestId('filtro-bloco-sustentacao')
      .querySelectorAll('[role="status"]')
    expect(status).toHaveLength(1)
    expect(status[0]).toHaveTextContent('Ainda não há equipes na base')
    // os números do bloco continuam
    expect(await espera('s2')).toBeInTheDocument()
  })

  it('erro: mensagem com "Tentar de novo"; os números continuam e o filtro volta ao tentar', async () => {
    const fonte = new FonteEquipe()
    fonte.modoOpcoes = 'erro-uma-vez'
    renderizarApp('/operacional', fonte)
    const fluxo = await bloco('resumo-fluxo')
    const alerta = await within(fluxo).findByRole('alert', undefined, { timeout: 15000 })
    expect(alerta).toHaveTextContent('Não foi possível carregar as opções de Equipe.')
    expect(within(alerta).getByRole('button', { name: 'Equipe: indisponível' })).toBeDisabled()
    expect(await espera('p85')).toBeInTheDocument()
    await userEvent.click(within(alerta).getByRole('button', { name: 'Tentar de novo' }))
    expect(await botao('resumo-fluxo', 'Equipe: Todas')).toBeInTheDocument()
  })
})
