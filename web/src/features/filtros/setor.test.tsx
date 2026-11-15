import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { Dominio, OpcoesFiltro } from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data/mock/MockFonteMetricas'
import { renderizarApp, renderizarBarra } from '@/test/helpers'
import { contarAtivos } from './contarAtivos'
import { colapsarTodos, escreverFluxo, lerFluxo, paramsDeFluxo } from './codec'
import { PAINEIS } from './paineis'

afterEach(() => window.localStorage.clear())

/** Os 7 setores do CA-40 (nome sem sobrenome), em ordem alfabética, como o L10a os entrega. */
const SETORES = [
  'Ciência de Dados',
  'Desenv Sistemas Plataformas Digitais - Gerencial',
  'Escritório de Processos e Projetos',
  'Marketing e Vendas',
  'Plataformas',
  'Sistemas Corporativos',
  'Sistemas de Vendas e Operações',
]
const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
const OPCOES_SETOR = SETORES.map((nome) => ({ id: slug(nome), nome }))
/** Sobrenome que o nome do quadro no BusinessMap traria: o dado da API não o traz, e a tela não pode exibi-lo (CA-41). */
const SOBRENOME = 'Zanellatto'

class FonteSetor extends MockFonteMetricas {
  modo: 'ok' | 'vazio' | 'erro' | 'trava' = 'ok'
  constructor() {
    super({ latenciaMs: 0 })
  }
  override async opcoesFiltro<D extends Dominio>(
    dominio: D,
  ): Promise<Extract<OpcoesFiltro, { dominio: D }>> {
    if (this.modo === 'trava') return new Promise(() => undefined)
    if (this.modo === 'erro') throw new Error('falha')
    const r = await super.opcoesFiltro(dominio)
    if (r.dominio !== 'businessmap') return r
    // `responsavel` é um campo que o contrato não tem: se a tela o lesse, o sobrenome apareceria.
    const setores =
      this.modo === 'vazio' ? [] : OPCOES_SETOR.map((o) => ({ ...o, responsavel: SOBRENOME }))
    return { ...r, setores }
  }
}

const botaoSetor = (nome: string | RegExp) =>
  screen.findByRole('button', { name: nome }, { timeout: 8000 })
const marcar = async (...nomes: string[]) => {
  await userEvent.click(await botaoSetor(/^Setor:/))
  const d = await screen.findByRole('dialog', { name: 'Setor' })
  for (const n of nomes) await userEvent.click(within(d).getByRole('checkbox', { name: n }))
  return d
}
const busca = (r: { roteador: { state: { location: { search: string } } } }) =>
  new URLSearchParams(r.roteador.state.location.search)

describe('filtro Setor na BarraFiltros (097 L11)', () => {
  it.each(['/operacional', '/tatico', '/estrategico'])(
    'CA-39: %s tem "Setor: Todos", antes de Equipe quando o painel tem Equipe',
    async (url) => {
      renderizarBarra(url, new FonteSetor())
      const setor = await botaoSetor('Setor: Todos')
      const equipe = screen.queryByRole('button', { name: /^Equipe:/ })
      if (url === '/estrategico') expect(equipe).toBeNull()
      else
        expect(
          setor.compareDocumentPosition(equipe as HTMLElement) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy()
    },
  )

  it('CA-39: no Estratégico, marcar um setor grava `setor` na URL e mostra o chip', async () => {
    const r = renderizarBarra('/estrategico', new FonteSetor())
    const d = await marcar('Plataformas')
    await waitFor(() => expect(busca(r).get('setor')).toBe('plataformas'))
    expect(await screen.findByTestId('chip-filtro-setor')).toHaveTextContent('Setor: Plataformas')
    await userEvent.click(within(d).getByRole('button', { name: 'Fechar' }))
  })

  it('o setor escolhido no Operacional volta ao abrir o Tático pelo menu (memória de sessão)', async () => {
    const r = renderizarApp('/operacional?setor=plataformas', new FonteSetor())
    // a memória só guarda o setor depois que as opções chegam e a URL é validada: o chip prova isso
    expect(
      await screen.findByTestId('chip-filtro-setor', undefined, { timeout: 8000 }),
    ).toBeInTheDocument()
    const nav = await screen.findByRole('navigation', { name: 'Navegação principal' })
    await waitFor(() =>
      expect(within(nav).getByRole('link', { name: 'Tático' })).toHaveAttribute(
        'href',
        expect.stringContaining('setor=plataformas'),
      ),
    )
    await userEvent.click(within(nav).getByRole('link', { name: 'Tático' }))
    await waitFor(() => expect(r.roteador.state.location.pathname).toBe('/tatico'))
    await waitFor(() => expect(busca(r).get('setor')).toBe('plataformas'))
    await userEvent.click(
      within(await screen.findByRole('navigation', { name: 'Navegação principal' })).getByRole(
        'link',
        { name: 'Operacional' },
      ),
    )
    await waitFor(() => expect(r.roteador.state.location.pathname).toBe('/operacional'))
    expect(busca(r).get('setor')).toBe('plataformas')
  })

  it('CA-40: lista os sete setores em ordem alfabética, com busca', async () => {
    renderizarBarra('/operacional', new FonteSetor())
    const d = await marcar()
    expect(
      within(d)
        .getAllByRole('checkbox')
        .map((c) => c.closest('label')?.textContent),
    ).toEqual(SETORES)
    expect(within(d).getByLabelText('Buscar em Setor')).toBeInTheDocument()
    await userEvent.type(within(d).getByLabelText('Buscar em Setor'), 'plataformas')
    expect(within(d).getAllByRole('checkbox')).toHaveLength(2)
    expect(within(d).queryByRole('checkbox', { name: 'AI Iniciatives' })).toBeNull()
  })

  it('marcar um setor grava `setor` na URL, mostra o chip e não mostra aviso consolidado', async () => {
    const r = renderizarBarra('/operacional', new FonteSetor())
    const d = await marcar('Plataformas')
    await waitFor(() => expect(busca(r).get('setor')).toBe('plataformas'))
    expect(await screen.findByTestId('chip-filtro-setor')).toHaveTextContent('Setor: Plataformas')
    expect(screen.queryByTestId('aviso-consolidado-setor')).toBeNull()
    await userEvent.click(within(d).getByRole('button', { name: 'Fechar' }))
  })

  it('CA-45: dois ou mais setores mostram o aviso consolidado e um único conjunto', async () => {
    const r = renderizarBarra('/tatico', new FonteSetor())
    await marcar('Plataformas', 'Marketing e Vendas')
    expect(await screen.findByTestId('aviso-consolidado-setor')).toHaveTextContent(
      'Resultado consolidado de 2 setores. O sistema não compara setores.',
    )
    expect(busca(r).get('setor')?.split(',').sort()).toEqual(['marketing-e-vendas', 'plataformas'])
    // o aviso de setores é o seu, separado do de equipes
    expect(screen.getByTestId('aviso-consolidado-setor')).not.toHaveTextContent('equipes')
  })

  it('o aviso consolidado de setores sai ao voltar a um setor só (chip removido)', async () => {
    renderizarBarra('/operacional?setor=plataformas,marketing-e-vendas', new FonteSetor())
    expect(await screen.findByTestId('aviso-consolidado-setor')).toBeInTheDocument()
    await userEvent.click(
      await screen.findByRole('button', { name: 'Remover filtro Setor: Marketing e Vendas' }),
    )
    await waitFor(() => expect(screen.queryByTestId('aviso-consolidado-setor')).toBeNull())
  })

  it('CA-41: nenhum sobrenome em botão, lista, chip, title, aria-label, anúncio nem URL', async () => {
    const r = renderizarBarra('/operacional', new FonteSetor())
    const d = await marcar('Plataformas', 'Ciência de Dados')
    await userEvent.click(within(d).getByRole('button', { name: 'Fechar' }))
    await waitFor(() =>
      expect(busca(r).get('setor')?.split(',').sort()).toEqual(['ciencia-de-dados', 'plataformas']),
    )
    await screen.findByTestId('aviso-consolidado-setor')
    const marca = new RegExp(SOBRENOME, 'i')
    expect(document.body.textContent).not.toMatch(marca)
    for (const el of document.body.querySelectorAll('[title],[aria-label]'))
      expect(`${el.getAttribute('title')} ${el.getAttribute('aria-label')}`).not.toMatch(marca)
    expect(r.roteador.state.location.search).not.toMatch(marca)
    expect(
      screen
        .getAllByRole('status')
        .map((s) => s.textContent)
        .join(' '),
    ).not.toMatch(marca)
  })

  it('link com setor inexistente: ignora, corrige a URL e avisa no aviso existente', async () => {
    const r = renderizarBarra('/operacional?setor=ai-iniciatives,plataformas', new FonteSetor())
    expect(await screen.findByTestId('aviso-filtros-invalidos')).toHaveTextContent(
      'Alguns filtros do link não existem e foram ignorados: setor "ai-iniciatives".',
    )
    await waitFor(() => expect(busca(r).get('setor')).toBe('plataformas'))
  })

  it('marcar todos os setores equivale a "Todos" (URL sem o parâmetro)', async () => {
    const r = renderizarBarra('/operacional', new FonteSetor())
    await marcar(...SETORES)
    await waitFor(() => expect(busca(r).has('setor')).toBe(false))
  })

  it('CA-19: enquanto as opções não chegam, diz "Carregando setores..." e a barra segue no lugar', async () => {
    const f = new FonteSetor()
    f.modo = 'trava'
    renderizarBarra('/operacional', f)
    await userEvent.click(await screen.findByTestId('filtro-setor'))
    expect(await screen.findByText('Carregando setores...')).toBeInTheDocument()
    expect(screen.queryByText(/disponível neste recorte/)).toBeNull()
  })

  it('CA-20: sem setores na base, o filtro segue na barra com a frase de vazio e sem aviso falso', async () => {
    const f = new FonteSetor()
    f.modo = 'vazio'
    renderizarBarra('/operacional', f)
    await userEvent.click(await screen.findByTestId('filtro-setor'))
    await waitFor(() =>
      expect(screen.getByTestId('setor-vazio')).toHaveTextContent(
        'Nenhum setor disponível neste recorte.',
      ),
    )
    expect(screen.queryByTestId('aviso-consolidado-setor')).toBeNull()
  })

  it('CA-21: falha nas opções mostra a mensagem do Setor e "Tentar de novo"', async () => {
    const f = new FonteSetor()
    f.modo = 'erro'
    renderizarBarra('/operacional', f)
    await userEvent.click(await screen.findByTestId('filtro-setor'))
    await waitFor(() =>
      expect(screen.getByTestId('setor-vazio')).toHaveTextContent(
        'Não foi possível carregar setores.',
      ),
    )
    expect(
      screen.getByRole('button', { name: 'Tentar de novo carregar setores' }),
    ).toBeInTheDocument()
  })

  it('CA-43: a Sustentação não tem filtro Setor, e `setor` na URL dela é ignorado em silêncio', async () => {
    const r = renderizarBarra('/sustentacao?setor=plataformas', new FonteSetor())
    expect(
      await screen.findByRole('button', { name: /^Equipe de sustentação:/ }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Setor:/ })).toBeNull()
    await waitFor(() => expect(busca(r).has('setor')).toBe(false))
    expect(screen.queryByText(/Valor inválido ignorado/)).toBeNull()
  })
})

describe('setor no codec e nos painéis (097 L11)', () => {
  const opcoes = {
    dominio: 'businessmap',
    equipes: [],
    tipos: [],
    sistemas: [],
    setores: OPCOES_SETOR,
    historico: { inicio: '2024-01-01', fim: '2026-11-01' },
  } as OpcoesFiltro

  it('sem setor, a leitura e a escrita são as de antes (mesma chave de cache, mesma URL)', () => {
    const l = lerFluxo(new URLSearchParams(''), opcoes, '12s')
    expect('setor' in l.filtros).toBe(false)
    expect(escreverFluxo(new URLSearchParams(''), l.filtros, '12s').toString()).toBe('')
  })

  it('lê, normaliza (minúsculas, sem repetição) e escreve o setor', () => {
    const l = lerFluxo(new URLSearchParams('setor=Plataformas,plataformas,xyz'), opcoes, '12s')
    expect(l.filtros.setor).toEqual(['plataformas'])
    expect(l.invalidos).toEqual(['setor "xyz"'])
    expect(escreverFluxo(new URLSearchParams(''), l.filtros, '12s').get('setor')).toBe(
      'plataformas',
    )
    expect(paramsDeFluxo(l.filtros).setor).toBe('plataformas')
  })

  it('resposta de opções sem `setores` (servidor antigo) vale como lista vazia: o valor é inválido', () => {
    const semSetores = { ...opcoes } as { setores?: unknown }
    delete semSetores.setores
    const l = lerFluxo(new URLSearchParams('setor=plataformas'), semSetores as OpcoesFiltro, '12s')
    expect(l.filtros.setor).toBeUndefined()
    expect(l.invalidos).toEqual(['setor "plataformas"'])
  })

  it('colapsarTodos: todos os setores marcados viram "Todos"', () => {
    const f = {
      ...lerFluxo(new URLSearchParams(''), opcoes, '12s').filtros,
      setor: OPCOES_SETOR.map((o) => o.id),
    }
    expect(colapsarTodos(f, opcoes, false).setor).toBeUndefined()
  })

  it('contarAtivos conta o setor no fluxo, e o Resumo não o conta como guardado', () => {
    const p = new URLSearchParams('setor=plataformas&equipe=a')
    expect(contarAtivos(p, 'fluxo')).toBe(2)
    expect(contarAtivos(p, 'fluxo', '', true)).toBe(0)
    expect(
      contarAtivos(new URLSearchParams('sust_setor=plataformas'), 'sustentacao', 'sust_'),
    ).toBe(0)
  })

  it('FL1, FL2 e FL3 oferecem o setor; a Sustentação, nunca', () => {
    expect(PAINEIS.operacional.filtros[0]).toBe('setor')
    expect(PAINEIS.tatico.filtros[0]).toBe('setor')
    expect(PAINEIS.estrategico.filtros[0]).toBe('setor')
    expect(PAINEIS.sustentacao.filtros).not.toContain('setor')
    expect(PAINEIS.sustentacao.params).not.toContain('setor')
  })
})
