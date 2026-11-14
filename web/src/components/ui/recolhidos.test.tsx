import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CATALOGO_CARTOES } from '@metricas-dspd/contratos'
import {
  CHAVE_RECOLHIDOS,
  CODIGO_CARTAO,
  CartaoMetrica,
  ProvedorCalibracao,
  ProvedorOrigemCartoes,
  ProvedorRecolhidos,
  RestaurarRecolhidos,
  TETO_RECOLHIDOS,
} from '.'

const nota = { titulo: 'Como ler', texto: 'Nota' } as unknown as React.ComponentProps<
  typeof CartaoMetrica
>['nota']

const Cartao = (p: Partial<React.ComponentProps<typeof CartaoMetrica>> = {}) => (
  <CartaoMetrica
    codigo="O3"
    titulo="Tempo de ciclo"
    pergunta="Em quantos dias entregamos?"
    estado="ok"
    nota={nota}
    fonte="BusinessMap"
    granularidade="demanda"
    base={{
      n: 1312,
      unidade: 'itens concluídos',
      janela: { inicio: '2026-07-18', fim: '2026-10-09' },
    }}
    {...p}
  >
    <p>corpo do gráfico</p>
  </CartaoMetrica>
)

const Painel = ({
  painel = 'operacional',
  cartoes = [<Cartao key="o3" />],
}: {
  painel?: string
  cartoes?: React.ReactNode[]
}) => (
  <MemoryRouter>
    <ProvedorRecolhidos painel={painel}>
      <RestaurarRecolhidos />
      <main>{cartoes}</main>
    </ProvedorRecolhidos>
  </MemoryRouter>
)

const memoria = () => localStorage.getItem(CHAVE_RECOLHIDOS)
const guardar = (v: unknown) => localStorage.setItem(CHAVE_RECOLHIDOS, JSON.stringify(v))

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('recolher cartão (097 E5, CA-25 a CA-32)', () => {
  it('CA-25: o cabeçalho tem o botão "Recolher" aberto, com estado e nome acessível; fora do provedor não há botão', () => {
    const { unmount } = render(<Painel />)
    const b = screen.getByRole('button', { name: 'Recolher cartão: Tempo de ciclo' })
    expect(b).toHaveTextContent('Recolher')
    expect(b).toHaveAttribute('aria-expanded', 'true')
    expect(b).toHaveAttribute(
      'aria-controls',
      document.getElementById(b.getAttribute('aria-controls')!)!.id,
    )
    unmount()
    render(
      <MemoryRouter>
        <Cartao />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('button', { name: /Recolher cartão/ })).toBeNull()
  })

  it('CA-26 e CA-27: recolher oculta o corpo e mostra o resumo; expandir devolve o corpo', async () => {
    render(<Painel />)
    const u = userEvent.setup()
    await u.click(screen.getByRole('button', { name: 'Recolher cartão: Tempo de ciclo' }))
    const b = screen.getByRole('button', { name: 'Expandir cartão: Tempo de ciclo' })
    expect(b).toHaveTextContent('Expandir')
    expect(b).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('corpo do gráfico')).toBeNull()
    expect(screen.queryByText('Em quantos dias entregamos?')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Tempo de ciclo' })).toBeInTheDocument()
    expect(screen.getByTestId('resumo-recolhido-O3')).toHaveTextContent(
      'Recolhido. 1.312 itens concluídos.',
    )
    await u.click(b)
    expect(screen.getByText('corpo do gráfico')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recolher cartão: Tempo de ciclo' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.queryByTestId('resumo-recolhido-O3')).toBeNull()
  })

  it('CA-28: o foco fica no mesmo botão ao recolher e ao expandir', async () => {
    render(<Painel />)
    const u = userEvent.setup()
    const b = screen.getByTestId('recolher-O3')
    await u.click(b)
    expect(screen.getByTestId('recolher-O3')).toBe(b)
    expect(b).toHaveFocus()
    await u.keyboard('{Enter}')
    expect(b).toHaveFocus()
    expect(b).toHaveAttribute('aria-expanded', 'true')
  })

  it('CA-29: a escolha é lembrada por cartão e por painel, sem URL e só com códigos', async () => {
    const u = userEvent.setup()
    const { unmount } = render(
      <Painel cartoes={[<Cartao key="a" />, <Cartao key="b" codigo="O5" titulo="Outro" />]} />,
    )
    await u.click(screen.getByTestId('recolher-O3'))
    expect(JSON.parse(memoria()!)).toEqual({ versao: 1, paineis: { operacional: ['O3'] } })
    unmount()
    render(<Painel cartoes={[<Cartao key="a" />, <Cartao key="b" codigo="O5" titulo="Outro" />]} />)
    expect(screen.getByTestId('recolher-O3')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByTestId('recolher-O5')).toHaveAttribute('aria-expanded', 'true')
    cleanup()
    render(<Painel painel="tatico" />)
    expect(screen.getByTestId('recolher-O3')).toHaveAttribute('aria-expanded', 'true')
  })

  it('expandir apaga o painel da memória e preserva os outros painéis', async () => {
    guardar({ versao: 1, paineis: { operacional: ['O3'], tatico: ['T1'] } })
    render(<Painel />)
    await userEvent.click(screen.getByTestId('recolher-O3'))
    expect(JSON.parse(memoria()!)).toEqual({ versao: 1, paineis: { tatico: ['T1'] } })
  })

  it('CA-30: "Restaurar cartões recolhidos" só aparece com recolhido, expande tudo, apaga a memória e anuncia', async () => {
    render(<Painel cartoes={[<Cartao key="a" />, <Cartao key="b" codigo="O5" titulo="Outro" />]} />)
    const u = userEvent.setup()
    expect(screen.queryByRole('button', { name: 'Restaurar cartões recolhidos' })).toBeNull()
    await u.click(screen.getByTestId('recolher-O3'))
    await u.click(screen.getByTestId('recolher-O5'))
    await u.click(screen.getByRole('button', { name: 'Restaurar cartões recolhidos' }))
    expect(screen.getAllByText('corpo do gráfico')).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Restaurar cartões recolhidos' })).toBeNull()
    expect(memoria()).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('Cartões restaurados.')
    expect(screen.getByRole('heading', { name: 'Tempo de ciclo' })).toHaveFocus()
  })

  it('B2: código recolhido sem cartão na tela não faz o "Restaurar" aparecer; fora do provedor não mostra nada', () => {
    guardar({ versao: 1, paineis: { operacional: ['O3'] } })
    render(
      <ProvedorRecolhidos painel="operacional">
        <RestaurarRecolhidos />
      </ProvedorRecolhidos>,
    )
    expect(screen.queryByRole('button', { name: 'Restaurar cartões recolhidos' })).toBeNull()
    cleanup()
    render(<RestaurarRecolhidos />)
    expect(screen.queryByTestId('restaurar-recolhidos')).toBeNull()
  })

  it('B2: ao ocultar um cartão recolhido (some da tela), ele deixa de contar para o "Restaurar"', () => {
    guardar({ versao: 1, paineis: { operacional: ['O3'] } })
    const { rerender } = render(<Painel />)
    expect(screen.getByRole('button', { name: 'Restaurar cartões recolhidos' })).toBeInTheDocument()
    rerender(<Painel cartoes={[]} />)
    expect(screen.queryByRole('button', { name: 'Restaurar cartões recolhidos' })).toBeNull()
  })

  it('B1: o aviso "Cartões restaurados." some ao recolher de novo e é anunciado outra vez na segunda restauração', async () => {
    render(<Painel />)
    const u = userEvent.setup()
    await u.click(screen.getByTestId('recolher-O3'))
    await u.click(screen.getByRole('button', { name: 'Restaurar cartões recolhidos' }))
    expect(screen.getByRole('status')).toHaveTextContent('Cartões restaurados.')
    await u.click(screen.getByTestId('recolher-O3'))
    expect(screen.getByRole('status')).toHaveTextContent(/^$/)
    await u.click(screen.getByRole('button', { name: 'Restaurar cartões recolhidos' }))
    expect(screen.getByRole('status')).toHaveTextContent('Cartões restaurados.')
  })

  it('A2: o foco do "Restaurar" vai ao título dentro do main, não a um título de fora', async () => {
    render(
      <MemoryRouter>
        <ProvedorRecolhidos painel="operacional">
          <h3 data-cartao-titulo tabIndex={-1}>
            Fora do painel
          </h3>
          <RestaurarRecolhidos />
          <main>
            <Cartao />
          </main>
        </ProvedorRecolhidos>
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByTestId('recolher-O3'))
    await userEvent.click(screen.getByRole('button', { name: 'Restaurar cartões recolhidos' }))
    expect(screen.getByRole('heading', { name: 'Tempo de ciclo' })).toHaveFocus()
  })

  it('CA-31: recolhido com erro mostra "Não foi possível carregar este cartão." no resumo', () => {
    guardar({ versao: 1, paineis: { operacional: ['O3'] } })
    render(<Painel cartoes={[<Cartao key="a" estado="erro" />]} />)
    expect(screen.getByTestId('resumo-recolhido-O3')).toHaveTextContent(
      'Não foi possível carregar este cartão.',
    )
  })

  it('CA-32: o resumo é neutro (sem base, só "Recolhido."), nunca a frase de leitura; aceita resumo próprio', () => {
    guardar({ versao: 1, paineis: { operacional: ['O3', 'O5'] } })
    render(
      <Painel
        cartoes={[
          <Cartao key="a" base={undefined as never} leitura="Ana fez 40 h" />,
          <Cartao key="b" codigo="O5" titulo="Outro" resumoRecolhido="Recolhido. 24 projetos." />,
        ]}
      />,
    )
    expect(screen.getByTestId('resumo-recolhido-O3')).toHaveTextContent(/^Recolhido\.$/)
    expect(screen.queryByText(/Ana/)).toBeNull()
    expect(screen.getByTestId('resumo-recolhido-O5')).toHaveTextContent('Recolhido. 24 projetos.')
  })

  it.each([
    ['sem-dado-real', 'Recolhido. Sem dado real nesta fonte.'],
    ['vazio', 'Recolhido. Sem dados no período.'],
  ] as const)(
    'M1: recolhido em %s, o resumo diz o estado e a origem continua visível',
    (estado, texto) => {
      guardar({ versao: 1, paineis: { operacional: ['O3'] } })
      render(
        <ProvedorOrigemCartoes origem={() => ({ ficticio: true, motivo: null })}>
          <Painel cartoes={[<Cartao key="a" estado={estado} />]} />
        </ProvedorOrigemCartoes>,
      )
      expect(screen.getByTestId('resumo-recolhido-O3')).toHaveTextContent(texto)
      expect(screen.getByTestId('selo-ficticio')).toBeInTheDocument()
    },
  )

  it('M2: recolhido durante o carregamento diz "Carregando..."; atualizando acrescenta "Atualizando..."', () => {
    guardar({ versao: 1, paineis: { operacional: ['O3'] } })
    const { rerender } = render(<Painel cartoes={[<Cartao key="a" estado="carregando" />]} />)
    expect(screen.getByTestId('resumo-recolhido-O3')).toHaveTextContent('Recolhido. Carregando...')
    rerender(<Painel cartoes={[<Cartao key="a" atualizando />]} />)
    expect(screen.getByTestId('resumo-recolhido-O3')).toHaveTextContent(
      'Recolhido. 1.312 itens concluídos. Atualizando...',
    )
  })

  it('recolhido esconde os selos extras do cartão; expandido, eles voltam', async () => {
    render(<Painel cartoes={[<Cartao key="a" selos={<span>selo extra</span>} />]} />)
    expect(screen.getByText('selo extra')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('recolher-O3'))
    expect(screen.queryByText('selo extra')).toBeNull()
    await userEvent.click(screen.getByTestId('recolher-O3'))
    expect(screen.getByText('selo extra')).toBeInTheDocument()
  })

  it('A1: todo código de cartão do catálogo e da aba Apontamento passa no formato que a memória aceita', () => {
    const codigos = [
      ...CATALOGO_CARTOES.map((c) => c.id.toUpperCase()),
      ...['AP-KPIS', 'AP-PROJETO', 'AP-TIPO', 'AP-SUBGRUPO', 'AP-QUALIDADE', 'AP-MATRIZ'],
      ...['AP-ACHADOS', 'AP-DIARIO', 'AP-CAPACIDADE-MENSAL', 'AP-CAPACIDADE-PESSOA'],
    ]
    expect(codigos.length).toBeGreaterThan(20)
    for (const c of codigos) expect(c).toMatch(CODIGO_CARTAO)
  })

  it('recolhivel={false} (KPI) não mostra o botão nem recolhe, mesmo com o código na memória', () => {
    guardar({ versao: 1, paineis: { operacional: ['O3'] } })
    render(<Painel cartoes={[<Cartao key="a" recolhivel={false} />]} />)
    expect(screen.queryByTestId('recolher-O3')).toBeNull()
    expect(screen.getByText('corpo do gráfico')).toBeInTheDocument()
  })
})

describe('recolher cartão: K-324 parte C', () => {
  it('C1: cartão que não recolhe, mesmo com a memória do AP-KPIS, não faz o "Restaurar" aparecer', () => {
    guardar({ versao: 1, paineis: { operacional: ['AP-KPIS'] } })
    render(<Painel cartoes={[<Cartao key="a" codigo="AP-KPIS" recolhivel={false} />]} />)
    expect(screen.queryByRole('button', { name: 'Restaurar cartões recolhidos' })).toBeNull()
  })

  it('C1: cartão recolhível montado e recolhido faz o "Restaurar" aparecer', () => {
    guardar({ versao: 1, paineis: { operacional: ['O3'] } })
    render(<Painel />)
    expect(screen.getByRole('button', { name: 'Restaurar cartões recolhidos' })).toBeInTheDocument()
  })

  it('C2: recolhido em erro com callback mostra "Tentar de novo", que chama o callback e não expande', async () => {
    guardar({ versao: 1, paineis: { operacional: ['O3'] } })
    const onTentarDeNovo = vi.fn()
    render(<Painel cartoes={[<Cartao key="a" estado="erro" onTentarDeNovo={onTentarDeNovo} />]} />)
    expect(screen.getByTestId('resumo-recolhido-O3')).toHaveTextContent(
      'Não foi possível carregar este cartão.',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(onTentarDeNovo).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('recolher-O3')).toHaveAttribute('aria-expanded', 'false')
  })

  it('C2: recolhido em erro sem callback não mostra "Tentar de novo"', () => {
    guardar({ versao: 1, paineis: { operacional: ['O3'] } })
    render(<Painel cartoes={[<Cartao key="a" estado="erro" />]} />)
    expect(screen.getByTestId('resumo-recolhido-O3')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).toBeNull()
  })

  it('C3: a linha de selos só reserva altura (min-h-6) expandida e com base', async () => {
    render(<Painel />)
    expect(screen.getByTestId('selos-O3')).toHaveClass('min-h-6')
    await userEvent.click(screen.getByTestId('recolher-O3'))
    expect(screen.getByTestId('selos-O3')).not.toHaveClass('min-h-6')
  })

  it('C3: recolhido somem base, janela fixa, selos extras, Como ler e as notas; expandido, voltam', async () => {
    render(
      <Painel
        cartoes={[
          <Cartao
            key="a"
            selos={<span>selo extra</span>}
            janelaPercentis={{ unidade: 'meses', quantidade: 6 }}
            periodo={{ tipo: '12s' }}
            notasDoCartao={['sem-classe']}
          />,
        ]}
      />,
    )
    const visiveis = () => [
      screen.queryByTestId('base-O3'),
      screen.queryByText(/Janela fixa/),
      screen.queryByText('selo extra'),
      screen.queryByRole('button', { name: /Como ler/ }),
      screen.queryByTestId('nota-O3'),
      screen.queryByTestId('notas-cartao-O3'),
    ]
    expect(visiveis().every((e) => e !== null)).toBe(true)
    await userEvent.click(screen.getByTestId('recolher-O3'))
    expect(visiveis().every((e) => e === null)).toBe(true)
  })

  it('C3: em calibração, o selo segue visível recolhido; em sem-dado-real, some', () => {
    guardar({ versao: 1, paineis: { operacional: ['O3'] } })
    const emCalibracao = (estado: 'ok' | 'sem-dado-real') => (
      <ProvedorCalibracao metricas={new Set(['O3'])} pronta>
        <Painel cartoes={[<Cartao key="a" estado={estado} />]} />
      </ProvedorCalibracao>
    )
    const { unmount } = render(emCalibracao('ok'))
    expect(screen.getByTestId('selo-calibracao')).toBeInTheDocument()
    unmount()
    render(emCalibracao('sem-dado-real'))
    expect(screen.queryByTestId('selo-calibracao')).toBeNull()
  })
})

describe('memória corrompida ou fora do formato', () => {
  const nadaRecolhido = () => {
    render(<Painel />)
    expect(screen.getByTestId('recolher-O3')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('corpo do gráfico')).toBeInTheDocument()
  }

  it.each([
    ['JSON quebrado', '{nao-e-json'],
    ['forma inválida', JSON.stringify({ versao: 1, paineis: [] })],
    ['versão desconhecida', JSON.stringify({ versao: 2, paineis: { operacional: ['O3'] } })],
    [
      'código fora do formato',
      JSON.stringify({ versao: 1, paineis: { operacional: ['o3', 12, 'A'.repeat(21)] } }),
    ],
    ['painel com id inválido', JSON.stringify({ versao: 1, paineis: { 'Painel Ruim!': ['O3'] } })],
  ])('%s: nada recolhido, sem erro', (_n, bruto) => {
    localStorage.setItem(CHAVE_RECOLHIDOS, bruto)
    nadaRecolhido()
  })

  it('acima do teto: o excedente é descartado em silêncio e os repetidos contam uma vez', () => {
    const codigos = Array.from({ length: TETO_RECOLHIDOS + 20 }, (_, i) => `C${i}`)
    guardar({ versao: 1, paineis: { operacional: ['O3', 'O3', ...codigos] } })
    render(<Painel />)
    expect(screen.getByTestId('recolher-O3')).toHaveAttribute('aria-expanded', 'false')
    // O3 mais 99 dos demais cabem no teto de 100; ao gravar de novo, a memória respeita o teto.
    return userEvent.click(screen.getByTestId('recolher-O3')).then(() => {
      expect(JSON.parse(memoria()!).paineis.operacional).toHaveLength(TETO_RECOLHIDOS - 1)
    })
  })

  it('armazenamento indisponível: lê como vazio e recolhe só nesta visita', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    render(<Painel />)
    await userEvent.click(screen.getByTestId('recolher-O3'))
    expect(screen.queryByText('corpo do gráfico')).toBeNull()
  })

  it('armazenamento indisponível ao apagar: restaurar ainda expande', async () => {
    guardar({ versao: 1, paineis: { operacional: ['O3'] } })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    render(<Painel />)
    await userEvent.click(screen.getByRole('button', { name: 'Restaurar cartões recolhidos' }))
    expect(screen.getByText('corpo do gráfico')).toBeInTheDocument()
  })
})
