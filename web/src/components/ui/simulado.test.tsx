import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { METRICA_IDS, podeSimular, type MetricaId } from '@metricas-dspd/contratos'
import { FonteMetricasProvider, RegistroSimulados, type FonteSimuladora } from '@/data'
import { OrigemDosCartoes } from '@/features/coleta/OrigemDosCartoes'
import {
  CartaoMetrica,
  ProvedorContextoPainel,
  StatusMeta,
  useModoTabela,
  type CartaoMetricaProps,
} from '@/components/ui'

const nota = { oQueE: 'a', comoSeCalcula: 'b', comoLer: 'c', meta: 'd', cuidados: 'e' }
const NOME_SELO = 'Dados simulados: este cartão mostra números de exemplo, não da operação.'

function Legenda() {
  return (
    <>
      <p data-testid="legenda-lida">{useModoTabela().legenda}</p>
      {/* Status de meta dentro do corpo, como S1, T2, T3, T4, T7, S7 e o complementar de sustentação fazem. */}
      <StatusMeta status="fora" texto="Mediana fora do alvo" />
    </>
  )
}

/** Fonte da API que só carrega o registro de simulados (o cartão lê a origem do contexto, nunca de prop). */
function fonteComRegistro(ids: readonly MetricaId[], motivo = 'aguardando campo no quadro') {
  const registro = new RegistroSimulados()
  for (const id of ids) registro.marcar(id, { motivo })
  return {
    tipo: 'api',
    origensSimuladas: registro,
    obterSimulado: () => Promise.reject(new Error('não usado')),
  } as unknown as FonteSimuladora
}

interface OpcoesMontagem {
  simulados?: readonly MetricaId[]
  filtros?: { chave: string; rotulo: string; valor: string }[]
}

function montar(
  { codigo = 'O12', ...p }: Partial<CartaoMetricaProps> = {},
  o: OpcoesMontagem = {},
) {
  const { simulados = [codigo as MetricaId], filtros = [] } = o
  return render(
    <MemoryRouter>
      <FonteMetricasProvider fonte={fonteComRegistro(simulados)}>
        <OrigemDosCartoes>
          <ProvedorContextoPainel
            filtrosAtivos={filtros}
            removerFiltro={() => undefined}
            limparFiltros={() => undefined}
          >
            <CartaoMetrica
              codigo={codigo}
              titulo="Acordos"
              pergunta="Quantos acordos venceram?"
              estado="ok"
              nota={nota}
              fonte="BusinessMap"
              granularidade="demanda"
              leitura="2 itens estão acima do P95"
              statusMeta="fora"
              {...p}
            >
              <Legenda />
            </CartaoMetrica>
          </ProvedorContextoPainel>
        </OrigemDosCartoes>
      </FonteMetricasProvider>
    </MemoryRouter>,
  )
}

describe('CartaoMetrica simulado (pedido 070, E1.4)', () => {
  it('T-W3: para todo id do contrato, o selo aparece se e só se o contrato diz que pode simular', () => {
    const todos = METRICA_IDS as readonly MetricaId[]
    expect(todos.some((id) => podeSimular(id))).toBe(true)
    expect(todos.some((id) => !podeSimular(id))).toBe(true)
    for (const id of todos) {
      // O registro marca TODAS as métricas: só o mapa de origem do contrato deixa o selo aparecer (real nunca o tem).
      const { unmount } = montar({ codigo: id }, { simulados: todos })
      const cartao = screen.getByTestId(`metrica-${id}`)
      if (podeSimular(id)) {
        expect(within(cartao).getByLabelText(NOME_SELO), id).toBeInTheDocument()
        expect(within(cartao).getByTestId(`motivo-simulado-${id}`), id).toHaveTextContent(
          'aguardando campo no quadro',
        )
      } else {
        expect(within(cartao).queryByLabelText(NOME_SELO), id).toBeNull()
        expect(within(cartao).queryByTestId(`faixa-simulado-${id}`), id).toBeNull()
        expect(within(cartao).queryByTestId('marca-dagua-simulado'), id).toBeNull()
      }
      unmount()
    }
  })

  it('CA-1, CA-2, CA-5, CA-12: selo com ícone e nome acessível, faixa em nota, prefixo "Exemplo:" e legenda de tabela', () => {
    montar()
    const cartao = screen.getByTestId('metrica-O12')
    const selo = screen.getByTestId('selo-simulado-O12')
    expect(selo).toHaveTextContent('Simulado')
    expect(selo).toHaveAccessibleName(NOME_SELO)
    // O nome vale para leitor de tela: o selo tem papel (um span solto não tem).
    expect(screen.getByRole('img', { name: NOME_SELO })).toBe(selo)
    expect(selo.querySelector('svg')).not.toBeNull()
    const faixa = screen.getByRole('note')
    expect(faixa).toHaveTextContent(
      'Dados de exemplo. Este cartão ainda não tem dado real, então os números abaixo não representam a operação.',
    )
    // O selo vem antes da faixa, e a faixa antes do subtítulo, na ordem do DOM.
    expect(selo.compareDocumentPosition(faixa) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(
      faixa.compareDocumentPosition(screen.getByText('Quantos acordos venceram?')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(screen.getByTestId('leitura-O12')).toHaveTextContent(
      'Exemplo: 2 itens estão acima do P95',
    )
    expect(screen.getByTestId('legenda-lida')).toHaveTextContent('Dados de exemplo (simulado)')
    const marca = within(cartao).getByTestId('marca-dagua-simulado')
    expect(marca).toHaveAttribute('aria-hidden', 'true')
    // A-11: o texto girado fica contido na área do gráfico (overflow escondido), sem escapar em 320 px.
    expect(marca).toHaveClass('overflow-hidden')
    // 070-001: a marca é desenho SVG (não texto HTML), para o axe não medir o contraste de um elemento decorativo.
    const desenho = marca.querySelector('svg')
    expect(desenho).not.toBeNull()
    expect(desenho).toHaveClass('-rotate-12', 'opacity-15')
    expect(desenho?.querySelector('text')).toHaveTextContent('SIMULADO')
    expect(cartao.className).toMatch(/border-dashed/)
  })

  it('CA-4: "O que é simulado?" expande a explicação inline por teclado e por clique', async () => {
    const u = userEvent.setup()
    montar()
    const botao = screen.getByRole('button', { name: 'O que é simulado?' })
    expect(botao).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByTestId('explicacao-simulado-O12')).not.toBeVisible()
    await u.click(botao)
    expect(screen.getByRole('button', { name: 'Fechar explicação' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByTestId('explicacao-simulado-O12')).toBeVisible()
    screen.getByRole('button', { name: 'Fechar explicação' }).focus()
    await u.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: 'O que é simulado?' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    await u.keyboard(' ')
    expect(screen.getByTestId('explicacao-simulado-O12')).toBeVisible()
  })

  it('CA-3: cartão real não tem selo, faixa, borda tracejada, marca d água nem prefixo', () => {
    montar({}, { simulados: [] })
    const cartao = screen.getByTestId('metrica-O12')
    expect(screen.queryByTestId('selo-simulado-O12')).toBeNull()
    expect(screen.queryByRole('note')).toBeNull()
    expect(screen.queryByTestId('marca-dagua-simulado')).toBeNull()
    expect(cartao.className).not.toMatch(/border-dashed/)
    expect(screen.getByTestId('leitura-O12').textContent).toBe('2 itens estão acima do P95')
    expect(screen.getByTestId('legenda-lida').textContent).not.toMatch(/exemplo/i)
  })

  it('CA-11: carregando e erro não mostram o selo; o vazio por filtro mantém', () => {
    for (const estado of ['carregando', 'erro'] as const) {
      const { unmount } = montar({ estado })
      expect(screen.queryByTestId('selo-simulado-O12'), estado).toBeNull()
      expect(screen.queryByRole('note'), estado).toBeNull()
      unmount()
    }
    montar({ estado: 'vazio' })
    expect(screen.getByTestId('selo-simulado-O12')).toBeInTheDocument()
  })

  it('o simulado não avalia a meta (Dentro/Fora) sobre número inventado; o real avalia', () => {
    const { unmount } = montar()
    expect(screen.queryByText(/fora da meta/i)).toBeNull()
    unmount()
    montar({}, { simulados: [] })
    expect(screen.getByText(/fora da meta/i)).toBeInTheDocument()
  })

  it('A-1: o status de meta do corpo (ex.: "Mediana fora do alvo") some no simulado e aparece no real', () => {
    const { unmount } = montar()
    expect(screen.getByTestId('legenda-lida')).toBeInTheDocument()
    expect(screen.queryByText('Mediana fora do alvo')).toBeNull()
    unmount()
    montar({}, { simulados: [] })
    expect(screen.getByText('Mediana fora do alvo')).toBeInTheDocument()
  })

  it('A-5: a marca d água não aparece no modo "Ver como tabela" e volta no gráfico', async () => {
    montar()
    expect(screen.getByTestId('marca-dagua-simulado')).toBeInTheDocument()
    const alternar = screen.getByRole('button', { name: /ver como tabela/i })
    await userEvent.click(alternar)
    expect(screen.queryByTestId('marca-dagua-simulado')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /ver (como )?gr[áa]fico/i }))
    expect(screen.getByTestId('marca-dagua-simulado')).toBeInTheDocument()
  })

  it('A-7/A-10: o botão "O que é simulado?" tem alvo de 44 px também no desktop, sem mexer na regra .alvo', () => {
    montar()
    const botao = screen.getByRole('button', { name: 'O que é simulado?' })
    // jsdom não mede; a classe .alvo-44 (tokens.css) fixa 44 px e vem depois de .alvo, que segue com 24 px.
    expect(botao).toHaveClass('alvo-44')
    const css = readFileSync(resolve(__dirname, '../../styles/tokens.css'), 'utf8')
    expect(css).toMatch(/\.alvo-44\s*{\s*min-height:\s*2\.75rem;\s*min-width:\s*2\.75rem;\s*}/)
    expect(css).toMatch(/\.alvo\s*{\s*min-height:\s*1\.5rem;\s*min-width:\s*1\.5rem;\s*}/)
    expect(css.indexOf('.alvo-44')).toBeGreaterThan(css.indexOf('.alvo {'))
  })

  it('T-W8: com filtro de equipe ativo, o simulado lista a equipe em "não afetam este cartão" e mantém o período', () => {
    montar(
      { aplicaveis: ['equipe', 'tipo', 'sistema', 'periodo'] },
      {
        filtros: [
          { chave: 'equipe', rotulo: 'Equipe', valor: 'Alfa' },
          { chave: 'periodo', rotulo: 'Período', valor: 'Últimas 12 semanas' },
        ],
      },
    )
    const cartao = screen.getByTestId('metrica-O12')
    expect(within(cartao).getByText(/Não afetado por: Equipe/)).toBeInTheDocument()
    const rodape = within(cartao)
      .getByText(/Não afetado por/)
      .closest('footer') as HTMLElement
    const aplicados = within(rodape).getByText(/Filtros aplicados:/)
    expect(aplicados).toHaveTextContent('Filtros aplicados: Período Últimas 12 semanas')
    expect(aplicados).not.toHaveTextContent('Equipe')
  })
})
