import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { createMemoryRouter, MemoryRouter, RouterProvider, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import { Provedores } from '@/app/App'
import { fonteDeTeste } from '@/test/helpers'
import { AvisoFiltrosInvalidos } from './AvisoFiltrosInvalidos'
import { BarraFiltros } from './BarraFiltros'
import { contarAtivos } from './contarAtivos'
import { LinhaFiltrosGuardados } from './LinhaFiltrosGuardados'
import { PARAMS_CONHECIDOS, rotuloDoFiltro } from './paineis'
import { useFiltros } from './useFiltros'

const P = (s: string) => new URLSearchParams(s)

function montar(painel: 'operacional' | 'sustentacao', url: string, prefixo?: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provedores fonte={fonteDeTeste}>
      <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
    </Provedores>
  )
  return renderHook(
    () => ({
      uso: useFiltros(painel as 'operacional', prefixo ? { prefixo } : undefined),
      loc: useLocation(),
    }),
    { wrapper },
  )
}
const buscaDe = (r: ReturnType<typeof montar>) => new URLSearchParams(r.result.current.loc.search)

describe('contarAtivos', () => {
  it('conta filtros (não valores) fora do padrão em cada conjunto, sem normalizar', () => {
    const p = P(
      'equipe=a,b&tipo=melhoria&periodo=4s&sust_prioridade=p1,p2&sust_periodo=12m&sust_equipe=totvs',
    )
    expect(contarAtivos(p, 'fluxo')).toBe(3)
    expect(contarAtivos(p, 'sustentacao', 'sust_')).toBe(3)
    expect(p.toString()).toContain('equipe=a%2Cb')
  })
  it('padrões e vazio contam zero; o período padrão de cada domínio não conta', () => {
    expect(contarAtivos(P(''), 'fluxo')).toBe(0)
    expect(contarAtivos(P('periodo=12s&sistema='), 'fluxo')).toBe(0)
    expect(contarAtivos(P('sust_periodo=6m'), 'sustentacao', 'sust_')).toBe(0)
    expect(contarAtivos(P('sistema=protheus'), 'fluxo')).toBe(1)
  })
  it('um conjunto não enxerga o outro', () => {
    expect(contarAtivos(P('sust_equipe=totvs'), 'fluxo')).toBe(0)
    expect(contarAtivos(P('equipe=fluig'), 'sustentacao', 'sust_')).toBe(0)
  })
})

describe('rótulos por domínio', () => {
  it('só a equipe muda de nome na Sustentação', () => {
    expect(rotuloDoFiltro('equipe', 'sustentacao')).toBe('Equipe de sustentação')
    expect(rotuloDoFiltro('equipe', 'fluxo')).toBe('Equipe')
    expect(rotuloDoFiltro('periodo', 'sustentacao')).toBe('Período')
  })
})

describe('LinhaFiltrosGuardados', () => {
  const ver = (url: string, visao: 'resumo' | 'fluxo' | 'sustentacao') =>
    render(
      <MemoryRouter initialEntries={[url]}>
        <LinhaFiltrosGuardados visao={visao} />
      </MemoryRouter>,
    )
  it('na Sustentação fala dos filtros do fluxo; nas do fluxo, dos da Sustentação', () => {
    const a = ver('/operacional?equipe=x&periodo=4s&sust_prioridade=p1', 'sustentacao')
    expect(screen.getByTestId('filtros-guardados')).toHaveTextContent(
      'Os filtros do fluxo de projeto (2 ativos) continuam guardados para as visões Diária e Semanal.',
    )
    a.unmount()
    ver('/operacional?equipe=x&sust_prioridade=p1', 'fluxo')
    expect(screen.getByTestId('filtros-guardados')).toHaveTextContent(
      'Os filtros da Sustentação (1 ativo) continuam guardados para a visão Sustentação.',
    )
  })
  it('no Resumo diz que nenhum se aplica, só dos conjuntos com filtro', () => {
    const a = ver('/operacional?equipe=x&periodo=4s&sust_prioridade=p1', 'resumo')
    expect(screen.getByTestId('filtros-guardados')).toHaveTextContent(
      'Os filtros guardados (fluxo de projeto: 2 ativos · Sustentação: 1 ativo) não se aplicam ao Resumo.',
    )
    a.unmount()
    ver('/operacional?sust_periodo=12m', 'resumo')
    expect(screen.getByTestId('filtros-guardados')).toHaveTextContent(
      'Os filtros guardados (Sustentação: 1 ativo) não se aplicam ao Resumo.',
    )
  })
  it('sem filtros guardados não mostra nada', () => {
    const { container } = ver('/operacional', 'resumo')
    expect(container).toBeEmptyDOMElement()
    const b = ver('/operacional', 'sustentacao')
    expect(b.container.querySelector('[data-testid="filtros-guardados"]')).toBeNull()
    const c = ver('/operacional', 'fluxo')
    expect(c.container.querySelector('[data-testid="filtros-guardados"]')).toBeNull()
  })
})

describe('AvisoFiltrosInvalidos com a fonte', () => {
  it('cita onde o valor não existe', () => {
    render(
      <AvisoFiltrosInvalidos
        invalidos={['prioridade "p9"']}
        onEntendi={() => undefined}
        onde="na Sustentação"
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Alguns filtros do link não existem na Sustentação e foram ignorados: prioridade "p9".',
    )
  })
  it('sem fonte, o texto de sempre', () => {
    render(<AvisoFiltrosInvalidos invalidos={['equipe "x"']} onEntendi={() => undefined} />)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Alguns filtros do link não existem e foram ignorados: equipe "x".',
    )
  })
})

describe('os dois conjuntos de filtros na mesma URL (4.1)', () => {
  it('a Diária e a Semanal não apagam os sust_* nem os parâmetros de cartão da Sustentação', async () => {
    const r = montar(
      'operacional',
      '/operacional?cadencia=semanal&equipe=fluig&sust_prioridade=p1&sust_equipe=totvs&sust_periodo=12m&s3=prop&s4=a&s5=a&s6=a&ei_sust=x&mock=vazio',
    )
    await waitFor(() => expect(r.result.current.uso.opcoes).toBeDefined())
    const b = buscaDe(r)
    for (const k of [
      'sust_prioridade',
      'sust_equipe',
      'sust_periodo',
      's3',
      's4',
      's5',
      's6',
      'ei_sust',
      'mock',
      'equipe',
      'cadencia',
    ])
      expect(b.has(k), k).toBe(true)
  })
  it('os sust_* nunca são parâmetros conhecidos (não são removidos em nenhum painel)', () => {
    expect(PARAMS_CONHECIDOS.filter((k) => k.startsWith('sust_'))).toEqual([])
  })
  it('prioridade sem prefixo não se aplica ao Operacional e sai em silêncio; os de outros painéis também', async () => {
    const r = montar('operacional', '/operacional?cadencia=semanal&prioridade=p1&t1=a&equipe=fluig')
    await waitFor(() => expect(buscaDe(r).has('prioridade')).toBe(false))
    expect(buscaDe(r).has('t1')).toBe(false)
    expect(buscaDe(r).get('equipe')).toBe('fluig')
    expect(r.result.current.uso.invalidos).toEqual([])
  })
  it('a Sustentação (com prefixo) preserva os filtros do fluxo e os parâmetros de cartão', async () => {
    const r = montar(
      'sustentacao',
      '/operacional?cadencia=sustentacao&equipe=fluig&tipo=bug&sistema=protheus&periodo=4s&o3=melhoria&sust_prioridade=p1',
      'sust_',
    )
    await waitFor(() => expect(r.result.current.uso.opcoes).toBeDefined())
    act(() => r.result.current.uso.definir({ equipe: ['totvs'] }))
    const b = buscaDe(r)
    expect(b.get('sust_equipe')).toBe('totvs')
    expect(b.get('sust_prioridade')).toBe('p1')
    for (const [k, v] of [
      ['equipe', 'fluig'],
      ['tipo', 'bug'],
      ['sistema', 'protheus'],
      ['periodo', '4s'],
      ['o3', 'melhoria'],
    ])
      expect(b.get(k), k).toBe(v)
  })
  it('valor inválido da Sustentação é ignorado, a URL é corrigida e o aviso fica disponível', async () => {
    const r = montar(
      'sustentacao',
      '/operacional?cadencia=sustentacao&sust_prioridade=p9&equipe=fluig',
      'sust_',
    )
    await waitFor(() => expect(buscaDe(r).has('sust_prioridade')).toBe(false))
    expect(r.result.current.uso.invalidos).toEqual(['prioridade "p9"'])
    expect(buscaDe(r).get('equipe')).toBe('fluig')
  })
  it('chips, limpar e remover agem só no conjunto da visão', async () => {
    const r = montar(
      'sustentacao',
      '/operacional?cadencia=sustentacao&equipe=fluig&sust_prioridade=p1&sust_equipe=totvs',
      'sust_',
    )
    await waitFor(() => expect(r.result.current.uso.opcoes).toBeDefined())
    expect(r.result.current.uso.chips.map((c) => c.rotulo)).toEqual([
      'Equipe de sustentação',
      'Prioridade',
    ])
    act(() => r.result.current.uso.remover('prioridade'))
    expect(buscaDe(r).has('sust_prioridade')).toBe(false)
    expect(buscaDe(r).get('sust_equipe')).toBe('totvs')
    act(() => r.result.current.uso.limpar())
    expect(buscaDe(r).has('sust_equipe')).toBe(false)
    expect(buscaDe(r).get('equipe')).toBe('fluig')
  })
})

function BarraComLegenda({
  painel,
  prefixo,
  legenda,
  onde,
}: {
  painel: 'operacional' | 'sustentacao'
  prefixo?: string
  legenda: string
  onde: string
}) {
  const uso = useFiltros(painel as 'operacional', prefixo ? { prefixo } : undefined)
  return <BarraFiltros uso={uso} legenda={legenda} onde={onde} />
}

describe('BarraFiltros com legenda da fonte (5.5)', () => {
  const montarBarra = (
    url: string,
    painel: 'operacional' | 'sustentacao',
    prefixo: string | undefined,
    legenda: string,
    onde: string,
  ) => {
    const roteador = createMemoryRouter(
      [
        {
          path: '*',
          element: (
            <BarraComLegenda
              painel={painel}
              legenda={legenda}
              onde={onde}
              {...(prefixo ? { prefixo } : {})}
            />
          ),
        },
      ],
      { initialEntries: [url] },
    )
    return render(
      <Provedores fonte={fonteDeTeste}>
        <RouterProvider router={roteador} />
      </Provedores>,
    )
  }
  it('a Sustentação: legenda da fonte, "Equipe de sustentação", Prioridade e sem Tipo nem Sistema', async () => {
    montarBarra(
      '/operacional?cadencia=sustentacao',
      'sustentacao',
      'sust_',
      'Filtros da Sustentação · Acelerato',
      'na Sustentação',
    )
    const grupo = await screen.findByRole('group', { name: 'Filtros da Sustentação · Acelerato:' })
    expect(grupo).toBeInTheDocument()
    expect(screen.getByTestId('legenda-filtros')).toHaveTextContent(
      'Filtros da Sustentação · Acelerato',
    )
    expect(await screen.findByTestId('filtro-equipe')).toHaveTextContent('Equipe de sustentação')
    expect(screen.getByTestId('filtro-prioridade')).toBeInTheDocument()
    expect(screen.queryByTestId('filtro-tipo')).toBeNull()
    expect(screen.queryByTestId('filtro-sistema')).toBeNull()
  })
  it('o fluxo: legenda do fluxo, Equipe, Tipo, Sistema e Período, sem Prioridade', async () => {
    montarBarra(
      '/operacional?cadencia=semanal',
      'operacional',
      undefined,
      'Filtros do fluxo de projeto · BusinessMap',
      'no fluxo de projeto',
    )
    await screen.findByRole('group', { name: 'Filtros do fluxo de projeto · BusinessMap:' })
    expect(await screen.findByTestId('filtro-equipe')).toHaveTextContent('Equipe')
    expect(screen.getByTestId('filtro-equipe')).not.toHaveTextContent('sustentação')
    for (const f of ['tipo', 'sistema', 'periodo'])
      expect(screen.getByTestId(`filtro-${f}`)).toBeInTheDocument()
    expect(screen.queryByTestId('filtro-prioridade')).toBeNull()
  })
  it('o aviso de valor inválido cita a fonte', async () => {
    montarBarra(
      '/operacional?cadencia=sustentacao&sust_prioridade=p9',
      'sustentacao',
      'sust_',
      'Filtros da Sustentação · Acelerato',
      'na Sustentação',
    )
    expect(await screen.findByTestId('aviso-filtros-invalidos')).toHaveTextContent(
      'não existem na Sustentação e foram ignorados: prioridade "p9"',
    )
  })
  it('o título da folha mobile é a legenda', async () => {
    montarBarra(
      '/operacional?cadencia=sustentacao',
      'sustentacao',
      'sust_',
      'Filtros da Sustentação · Acelerato',
      'na Sustentação',
    )
    await userEvent.click(await screen.findByTestId('abrir-filtros'))
    expect(
      await screen.findByRole('dialog', { name: 'Filtros da Sustentação · Acelerato' }),
    ).toBeInTheDocument()
  })
})
