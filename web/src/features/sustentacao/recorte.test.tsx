import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Dominio, OpcoesFiltro, RecorteSustentacao } from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data/mock/MockFonteMetricas'
import { renderizarCartao, fonteDeTeste } from '@/test/helpers'
import { RecorteSustentacao as Recorte } from './components/RecorteSustentacao'
import { RECORTE_RESERVA, juntar } from './recorte'

type Modo = { recorte: RecorteSustentacao | 'sem-campo' } | 'carregando' | 'erro'

/** Fonte que devolve as opções do Acelerato do mock, com o `recorte` escolhido pelo teste. */
class FonteRecorte extends MockFonteMetricas {
  private readonly modo: Modo
  /** Resolve quando a consulta devolveu (ou falhou): a tela já pôde reagir. */
  readonly respondida: Promise<void>
  private liberar: () => void = () => {}
  constructor(modo: Modo) {
    super({ latenciaMs: 0 })
    this.modo = modo
    this.respondida = new Promise((r) => (this.liberar = r))
  }
  override async opcoesFiltro<D extends Dominio>(
    dominio: D,
  ): Promise<Extract<OpcoesFiltro, { dominio: D }>> {
    if (this.modo === 'carregando') return new Promise(() => {})
    if (this.modo === 'erro') throw new Error('falha')
    const real = (await super.opcoesFiltro(dominio)) as OpcoesFiltro
    if (real.dominio !== 'acelerato') return real as Extract<OpcoesFiltro, { dominio: D }>
    const { recorte: _mock, ...resto } = real
    const r: OpcoesFiltro =
      this.modo.recorte === 'sem-campo' ? resto : { ...resto, recorte: this.modo.recorte }
    setTimeout(this.liberar, 0)
    return r as Extract<OpcoesFiltro, { dominio: D }>
  }
}

const nomes = (prefixo: string, n: number) =>
  Array.from({ length: n }, (_, i) => `${prefixo} ${i + 1}`)
const recorte = (o: number, t: number, e: number): RecorteSustentacao => ({
  organizacoes: nomes('Org', o),
  tipos: nomes('Tipo', t),
  equipes: nomes('Equipe', e),
})

function mostrar(modo: Modo) {
  const r = renderizarCartao(<Recorte />, { fonte: new FonteRecorte(modo) })
  return r
}
const paragrafo = () => screen.getByTestId('recorte-sustentacao')
const rotulo = (l: HTMLElement) => l.querySelector('summary')?.textContent?.replace('▸', '')
const listas = () => screen.queryAllByTestId('recorte-lista')

describe('juntar', () => {
  it('une com vírgula e "e"', () => {
    expect(juntar([])).toBe('')
    expect(juntar(['a'])).toBe('a')
    expect(juntar(['a', 'b'])).toBe('a e b')
    expect(juntar(['a', 'b', 'c'])).toBe('a, b e c')
  })
})

describe('texto do recorte da Sustentação (K-215)', () => {
  it('mock da API: o texto vem do recorte, sem expansão (CA-1)', async () => {
    renderizarCartao(<Recorte />, { fonte: fonteDeTeste })
    expect(await screen.findByText(/equipes SSSC TOTVS, SSSC SENIOR e SSSC FLUIG, excluídos/)).toBe(
      paragrafo(),
    )
    expect(paragrafo()).toHaveTextContent(
      /SSSC TOTVS, SSSC SENIOR e SSSC FLUIG, excluídos os removidos\./,
    )
    expect(listas()).toHaveLength(0)
  })

  it('1 organização, 1 tipo e 1 equipe: singular, sem expansão', async () => {
    mostrar({ recorte: recorte(1, 1, 1) })
    expect(
      await screen.findByText(
        /^Chamados da organização Org 1, tipo Tipo 1, equipe Equipe 1, excluídos os removidos\./,
      ),
    ).toBe(paragrafo())
    expect(listas()).toHaveLength(0)
  })

  it('fronteira das equipes 4/5: 4 por extenso, 5 viram contagem e lista recolhida (CA-1, CA-2)', async () => {
    const q4 = mostrar({ recorte: recorte(1, 1, 4) })
    await screen.findByText(/equipes Equipe 1, Equipe 2, Equipe 3 e Equipe 4,/)
    expect(listas()).toHaveLength(0)
    q4.unmount()
    mostrar({ recorte: recorte(1, 1, 5) })
    const el = await screen.findByText(/de 5 equipes, excluídos/)
    expect(el).toBe(paragrafo())
    expect(el).not.toHaveTextContent('Equipe 1')
    const [lista] = listas()
    expect(lista).not.toHaveAttribute('open')
    expect(within(lista!).getByText('Ver as 5 equipes')).toBeInTheDocument()
  })

  it('fronteira das organizações 3/4 e dos tipos 3/4 (CA-5)', async () => {
    const q3 = mostrar({ recorte: recorte(3, 3, 1) })
    await screen.findByText(
      /das organizações Org 1, Org 2 e Org 3, tipos Tipo 1, Tipo 2 e Tipo 3, equipe Equipe 1,/,
    )
    expect(listas()).toHaveLength(0)
    q3.unmount()
    mostrar({ recorte: recorte(4, 4, 1) })
    await screen.findByText(/Chamados de 4 organizações, de 4 tipos de chamado, equipe Equipe 1,/)
    expect(listas().map((l) => rotulo(l))).toEqual([
      'Ver as 4 organizações',
      'Ver os 4 tipos de chamado',
    ])
  })

  it('várias listas longas: um details por lista, na ordem da frase (organizações, tipos, equipes)', async () => {
    mostrar({ recorte: recorte(5, 6, 38) })
    await screen.findByText(/Chamados de 5 organizações, de 6 tipos de chamado, de 38 equipes,/)
    expect(listas().map((l) => rotulo(l))).toEqual([
      'Ver as 5 organizações',
      'Ver os 6 tipos de chamado',
      'Ver as 38 equipes',
    ])
  })

  it('abrir pelo clique mostra a lista na ordem recebida, um nome por item, e troca o texto (CA-3, CA-4, CA-7)', async () => {
    mostrar({
      recorte: {
        organizacoes: ['Z Org'],
        tipos: ['Tipo'],
        equipes: ['Zeta', 'Alfa', 'Mu', 'Beta', 'Omega'],
      },
    })
    const resumo = await screen.findByText('Ver as 5 equipes')
    // leitor de tela pelo DOM: resumo nativo, primeiro filho de um details recolhido; sem ARIA a mais
    const detalhes = resumo.closest('details')!
    expect(resumo.tagName).toBe('SUMMARY')
    expect(detalhes.firstElementChild).toBe(resumo)
    expect(detalhes).not.toHaveAttribute('open')
    expect(resumo).not.toHaveAttribute('role')
    expect(resumo).not.toHaveAttribute('aria-hidden')
    expect(within(detalhes).getByRole('list', { hidden: true })).toBeInTheDocument()
    await userEvent.click(resumo)
    expect(detalhes).toHaveAttribute('open')
    expect(resumo).toHaveTextContent('Ocultar as 5 equipes')
    const itens = within(within(detalhes).getByRole('list')).getAllByRole('listitem')
    expect(itens.map((i) => i.textContent)).toEqual(['Zeta', 'Alfa', 'Mu', 'Beta', 'Omega'])
    const ul = detalhes.querySelector('ul')!
    expect(ul.className).toContain('break-words')
    expect(ul.className).not.toMatch(/overflow|truncate|ellipsis|max-h/)
    await userEvent.click(resumo)
    expect(detalhes).not.toHaveAttribute('open')
    expect(resumo).toHaveTextContent('Ver as 5 equipes')
  })

  it('o controle entra na ordem do Tab; Enter e Espaço são o clique nativo do navegador no resumo (CA-3, CA-7)', async () => {
    mostrar({ recorte: recorte(1, 1, 6) })
    const resumo = await screen.findByText('Ver as 6 equipes')
    expect(resumo).not.toHaveAttribute('tabindex')
    await userEvent.tab()
    expect(resumo).toHaveFocus()
    // jsdom não sintetiza o clique do teclado no <summary>; o navegador sim (sem tratador de tecla próprio aqui).
    await userEvent.click(resumo)
    expect(resumo).toHaveTextContent('Ocultar as 6 equipes')
    expect(resumo).toHaveFocus()
  })

  it('o resumo tem seta própria aria-hidden e esconde o marcador nativo (R1 da UX)', async () => {
    mostrar({ recorte: recorte(1, 1, 6) })
    const resumo = await screen.findByText('Ver as 6 equipes')
    const seta = resumo.querySelector('span')!
    expect(seta).toHaveAttribute('aria-hidden', 'true')
    expect(seta.className).not.toContain('rotate-90')
    expect(resumo.className).toContain('list-none')
    expect(resumo.className).toContain('[&::-webkit-details-marker]:hidden')
    await userEvent.click(resumo)
    expect(seta.className).toContain('rotate-90')
  })

  it('o texto segue o open do navegador por qualquer via, sem depender do clique (R2 da UX)', async () => {
    mostrar({ recorte: recorte(1, 1, 6) })
    const resumo = await screen.findByText('Ver as 6 equipes')
    const detalhes = resumo.closest('details')!
    act(() => {
      detalhes.open = true
    })
    await screen.findByText('Ocultar as 6 equipes')
    act(() => {
      detalhes.open = false
    })
    await screen.findByText('Ver as 6 equipes')
  })

  it('o resumo tem altura mínima de 44px e a lista cresce a página, em colunas só em telas largas (CA-8)', async () => {
    mostrar({ recorte: recorte(1, 1, 6) })
    const resumo = await screen.findByText('Ver as 6 equipes')
    expect(resumo.className).toContain('min-h-11')
    const ul = resumo.closest('details')!.querySelector('ul')!
    expect(ul.className).toContain('md:columns-2')
    expect(ul.className).toContain('lg:columns-3')
    expect(ul.className).not.toMatch(/(^|\s)columns-/)
  })

  it('o estado não persiste: ao montar de novo a lista volta recolhida (CA-10)', async () => {
    const fonte = new FonteRecorte({ recorte: recorte(1, 1, 6) })
    const r = renderizarCartao(<Recorte />, { fonte })
    await userEvent.click(await screen.findByText('Ver as 6 equipes'))
    expect(listas()[0]).toHaveAttribute('open')
    r.unmount()
    renderizarCartao(<Recorte />, { fonte })
    await screen.findByText('Ver as 6 equipes')
    expect(listas()[0]).not.toHaveAttribute('open')
  })

  it.each<[string, Modo]>([
    ['sem o campo', { recorte: 'sem-campo' }],
    ['carregando', 'carregando'],
    ['em erro', 'erro'],
    ['organizações vazias', { recorte: { ...recorte(1, 1, 1), organizacoes: [] } }],
    ['tipos vazios', { recorte: { ...recorte(1, 1, 1), tipos: [] } }],
    ['equipes vazias', { recorte: { ...recorte(1, 1, 1), equipes: [] } }],
  ])('%s: o texto de antes, caractere por caractere, sem controle (CA-6)', async (_n, modo) => {
    const fonte = new FonteRecorte(modo)
    renderizarCartao(<Recorte />, { fonte })
    expect(paragrafo().textContent).toBe(RECORTE_RESERVA)
    if (modo !== 'carregando' && modo !== 'erro') {
      // espera a consulta devolver e a tela reagir; só então confirma que nada mudou
      await act(async () => {
        await fonte.respondida
        await new Promise((r) => setTimeout(r, 0))
      })
      expect(paragrafo().textContent).toBe(RECORTE_RESERVA)
    }
    expect(listas()).toHaveLength(0)
  })

  it('a reserva é o texto de antes do K-215', () => {
    expect(RECORTE_RESERVA).toBe(
      'Chamados da organização DSPD Sustentação, tipo DSPD - SSSC, equipes SSSC TOTVS, SENIOR e FLUIG, excluídos os removidos. Tempos e aderência usam somente chamados fechados. Chamados com exceção de SLA por registro posterior ficam fora destas apurações.',
    )
  })

  it('a parte fixa do parágrafo acompanha o recorte (CA-9)', async () => {
    mostrar({ recorte: recorte(1, 1, 1) })
    await screen.findByText(/Org 1/)
    expect(paragrafo()).toHaveTextContent(
      /excluídos os removidos\. Tempos e aderência usam somente chamados fechados\. Chamados com exceção de SLA por registro posterior ficam fora destas apurações\.$/,
    )
  })
})
