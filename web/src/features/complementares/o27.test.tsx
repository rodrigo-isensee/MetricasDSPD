import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CATALOGO_CARTOES, CAUSAS_RAIZ_BUG } from '@metricas-dspd/contratos'
import { ContextoPreferenciasPainel, type PreferenciasPainel } from '@/components/ui'
import { FILTROS_FLUXO, COMUM, FonteFixa } from '@/features/painel/testes/fonteFixa'
import { renderizarCartao } from '@/test/helpers'
import { CartaoO27 } from './CartaoO27'

vi.setConfig({ testTimeout: 45000 })

interface Criterios {
  serie: { id: string; data: string; descricao: string }[]
  janela: { id: string; data: string; descricao: string }[]
}

type Tipo = 'Bug interno' | 'Defeito em produção'

/** Coluna com `ns` na ordem do campo (12 valores); `pct` sobre `comCausa`, como a biblioteca. */
function coluna(tipo: Tipo, ns: number[], naoInformada: number) {
  const comCausa = ns.reduce((a, b) => a + b, 0)
  return {
    tipo,
    n: comCausa + naoInformada,
    naoEBug: ns[10] ?? 0,
    naoInformada,
    comCausa,
    causas:
      comCausa >= 20
        ? CAUSAS_RAIZ_BUG.map((c, i) => ({
            causa: c.codigo,
            rotulo: c.rotulo,
            n: ns[i] ?? 0,
            pct: ((ns[i] ?? 0) / comCausa) * 100,
          }))
        : null,
  }
}

const dto = (porTipo: unknown[], criterios: Criterios = COMUM.criterios) => ({
  ...COMUM,
  criterios,
  porTipo,
  porSistema: null,
  motivoPorSistema: 'aguardando o campo Sistema afetado no BusinessMap',
})

const painelOperacional = {
  painel: 'operacional',
  cartoes: CATALOGO_CARTOES.filter((c) => c.painel === 'operacional'),
  estaOculto: () => false,
  irParaComplementar: () => undefined,
} as unknown as PreferenciasPainel

async function abrir(porTipo: unknown[], criterios?: Criterios) {
  renderizarCartao(
    <ContextoPreferenciasPainel.Provider value={painelOperacional}>
      <CartaoO27 filtros={FILTROS_FLUXO} />
    </ContextoPreferenciasPainel.Provider>,
    { fonte: new FonteFixa({ O27: dto(porTipo, criterios) }) },
  )
  const cartao = await screen.findByTestId('metrica-O27')
  await waitFor(() => expect(cartao).toHaveAttribute('data-estado', 'ok'))
  return cartao
}

const INTERNO = [9, 3, 6, 2, 1, 4, 0, 5, 6, 1, 4, 2] // 43 com causa
const PRODUCAO = [1, 0, 8, 6, 0, 0, 3, 2, 0, 1, 7, 2] // 30 com causa

describe('O27 Causa raiz dos bugs', () => {
  it('mostra duas colunas com título próprio, sem total entre elas (CA-1)', async () => {
    const cartao = await abrir([
      coluna('Bug interno', INTERNO, 7),
      coluna('Defeito em produção', PRODUCAO, 0),
    ])
    expect(
      within(cartao).getByRole('heading', { level: 3, name: 'Bug interno (50 bugs)' }),
    ).toBeInTheDocument()
    expect(
      within(cartao).getByRole('heading', { level: 3, name: 'Defeito em produção (30 bugs)' }),
    ).toBeInTheDocument()
    expect(cartao.textContent).not.toMatch(/80 bugs|total/i)
  })

  it('lista as 12 causas na ordem do campo, com n e %, incluindo Outros e Não é bug (CA-2, CA-3)', async () => {
    const cartao = await abrir([
      coluna('Bug interno', INTERNO, 7),
      coluna('Defeito em produção', PRODUCAO, 0),
    ])
    const col = within(screen.getByTestId('o27-coluna-interno'))
    const linhas = col.getAllByRole('listitem')
    expect(linhas).toHaveLength(12)
    CAUSAS_RAIZ_BUG.forEach((c, i) => expect(linhas[i]).toHaveTextContent(c.rotulo))
    expect(linhas[0]).toHaveTextContent('9 (21%)')
    expect(linhas[6]).toHaveTextContent('0 (0%)')
    expect(linhas[10]).toHaveTextContent('Não é bug')
    expect(linhas[11]).toHaveTextContent('Outros')
    expect(col.getByTestId('o27-base')).toHaveTextContent(
      'Base dos percentuais: 43 bugs com causa.',
    )
    expect(cartao).toBeTruthy()
  })

  it('destaca as 3 maiores com texto, sem reordenar, e nunca causa com n = 0 (CA-6)', async () => {
    await abrir([coluna('Bug interno', INTERNO, 7), coluna('Defeito em produção', PRODUCAO, 0)])
    const col = within(screen.getByTestId('o27-coluna-interno'))
    // 9, 6, 6 e depois 5: três destacadas, nas linhas 1, 3 e 9.
    const marcadas = col
      .getAllByRole('listitem')
      .map((li, i) => (within(li).queryByTestId('o27-maior') ? i : -1))
      .filter((i) => i >= 0)
    expect(marcadas).toEqual([0, 2, 8])
    const prod = within(screen.getByTestId('o27-coluna-producao'))
    // 8, 7, 6: Erro de lógica, Não é bug e Falha de integração.
    const marcadasProd = prod
      .getAllByRole('listitem')
      .map((li, i) => (within(li).queryByTestId('o27-maior') ? i : -1))
      .filter((i) => i >= 0)
    expect(marcadasProd).toEqual([2, 3, 10])
  })

  it('destaca todas as empatadas no 3º lugar', async () => {
    await abrir([
      coluna('Bug interno', [9, 6, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0], 0),
      coluna('Defeito em produção', PRODUCAO, 0),
    ])
    const col = within(screen.getByTestId('o27-coluna-interno'))
    const marcas = col.getAllByTestId('o27-maior')
    expect(marcas).toHaveLength(4)
    for (const m of marcas) expect(m).toHaveTextContent('4 maiores (empate no 3º lugar)')
    expect(col.queryByText('3 maiores')).not.toBeInTheDocument()
  })

  it('rotula o destaque pelo número real: 3 maiores sem empate, maior causa quando só uma tem bug', async () => {
    await abrir([
      coluna('Bug interno', INTERNO, 7),
      coluna('Defeito em produção', [0, 0, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0),
    ])
    for (const m of within(screen.getByTestId('o27-coluna-interno')).getAllByTestId('o27-maior'))
      expect(m).toHaveTextContent(/^3 maiores$/)
    const so = within(screen.getByTestId('o27-coluna-producao')).getAllByTestId('o27-maior')
    expect(so).toHaveLength(1)
    expect(so[0]).toHaveTextContent('Maior causa')
  })

  it('sem nenhuma causa com bug, nada é destacado', async () => {
    await abrir([coluna('Bug interno', [], 0), coluna('Defeito em produção', [], 0)])
    expect(screen.queryByTestId('o27-maior')).not.toBeInTheDocument()
  })

  it('leia junto pelo catálogo: links para O15, O16 e O17 dentro do cartão', async () => {
    const cartao = await abrir([
      coluna('Bug interno', INTERNO, 7),
      coluna('Defeito em produção', PRODUCAO, 0),
    ])
    const o15 = within(cartao).getByRole('link', { name: 'Onde os bugs são encontrados (O15)' })
    expect(o15).toHaveAttribute('href', '#o15')
    const leia = within(cartao).getByTestId('leia-junto-o27')
    const links = within(leia).getAllByRole('link')
    expect(links.map((a) => a.textContent)).toEqual([
      'O16 Estoque e idade de bugs',
      'O17 Defeitos por causa raiz e sistema · visão Sustentação, fonte Acelerato',
    ])
    expect(links[0]).toHaveAttribute('href', expect.stringContaining('#o16'))
    expect(links[1]).toHaveAttribute('href', expect.stringContaining('#o17'))
  })

  it('mostra "Causa não informada" fora da distribuição, inclusive com 0 (CA-4)', async () => {
    await abrir([coluna('Bug interno', INTERNO, 7), coluna('Defeito em produção', PRODUCAO, 0)])
    expect(
      within(screen.getByTestId('o27-coluna-interno')).getByTestId('o27-nao-informada'),
    ).toHaveTextContent('Causa não informada: 7 bugs')
    expect(
      within(screen.getByTestId('o27-coluna-producao')).getByTestId('o27-nao-informada'),
    ).toHaveTextContent('Causa não informada: 0 bugs')
  })

  it('abaixo de 20 bugs com causa mostra só números e o aviso, sem %, e a outra coluna segue (CA-5)', async () => {
    await abrir([
      coluna('Bug interno', [3, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0], 4),
      coluna('Defeito em produção', PRODUCAO, 0),
    ])
    const fraca = within(screen.getByTestId('o27-coluna-interno'))
    expect(fraca.getByText('Bugs do tipo: 10')).toBeInTheDocument()
    expect(fraca.getByText('Causa não informada: 4')).toBeInTheDocument()
    expect(fraca.getByText('Bugs com causa: 6')).toBeInTheDocument()
    expect(fraca.getByTestId('o27-aviso')).toHaveTextContent(
      'Menos de 20 bugs com causa (6 de 20 mínimos); a distribuição não é mostrada.',
    )
    expect(fraca.queryByRole('list')).not.toBeInTheDocument()
    expect(fraca.queryByText(/%/)).not.toBeInTheDocument()
    const forte = within(screen.getByTestId('o27-coluna-producao'))
    expect(forte.getAllByRole('listitem')).toHaveLength(12)
    expect(forte.queryByTestId('o27-aviso')).not.toBeInTheDocument()
  })

  it('sem bug nenhum: "nenhum bug" no cabeçalho e o aviso nas duas colunas', async () => {
    await abrir([coluna('Bug interno', [], 0), coluna('Defeito em produção', [], 0)])
    expect(
      screen.getByRole('heading', { level: 3, name: 'Bug interno (nenhum bug)' }),
    ).toBeInTheDocument()
    expect(screen.getAllByTestId('o27-aviso')).toHaveLength(2)
  })

  it('1 bug no singular', async () => {
    await abrir([coluna('Bug interno', [1], 0), coluna('Defeito em produção', [], 0)])
    expect(
      screen.getByRole('heading', { level: 3, name: 'Bug interno (1 bug)' }),
    ).toBeInTheDocument()
  })

  it('traz a nota fixa, o por sistema aguardando e a marca de critério (CA-7, CA-8)', async () => {
    await abrir([coluna('Bug interno', INTERNO, 7), coluna('Defeito em produção', PRODUCAO, 0)], {
      serie: [],
      janela: [
        {
          id: 'criterio-2026-11-16-o27-causa-raiz-bug',
          data: '2026-11-16',
          descricao: 'O27 passou a mostrar a causa raiz',
        },
      ],
    })
    expect(screen.getByTestId('o27-nota')).toHaveTextContent(
      'Bug do BusinessMap, não incidente do Acelerato. Não somar com o O17 nem com o S3.',
    )
    expect(
      screen.getByText('Por sistema: aguardando o campo Sistema afetado no BusinessMap.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Critério desde 16/11/2026.')).toBeInTheDocument()
  })

  it('não mostra pessoa nem texto livre nas colunas (CA-9)', async () => {
    await abrir([coluna('Bug interno', INTERNO, 7), coluna('Defeito em produção', PRODUCAO, 0)])
    for (const id of ['o27-coluna-interno', 'o27-coluna-producao'])
      expect(screen.getByTestId(id).textContent).not.toMatch(/responsável|acelerato|descrição/i)
  })
})
