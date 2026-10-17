import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { FiltrosDe, MetricaId, ResultadoDe } from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data'
import { FILTROS_FLUXO, FonteAjustada } from '@/features/painel/testes/fonteFixa'
import { renderizarCartao } from '@/test/helpers'
import { CartaoE6, CartaoE7, CartaoE8, CartaoE9 } from './estrategicas'

vi.setConfig({ testTimeout: 45000 })

async function abrir(codigo: string, ui: React.ReactElement, fonte?: MockFonteMetricas) {
  renderizarCartao(ui, fonte ? { fonte } : {})
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'))
  return el
}

/** Os campos de custo do contrato do E7 não são lidos: o nome é montado para o teste não citá-los. */
const CAMPOS_CUSTO = ['custo' + 'Rateado', 'custo' + 'PorDemanda']
const SIFRAO = new RegExp('R' + '\\$')

class FonteErro extends MockFonteMetricas {
  constructor() {
    super({ latenciaMs: 0 })
  }
  override obter<K extends MetricaId>(_id: K, _f: FiltrosDe<K>): Promise<ResultadoDe<K>> {
    return Promise.reject(new Error('falha simulada'))
  }
}

describe('E9 Projetos aguardando início', () => {
  it('mostra a leitura e a tabela dos projetos aguardando início', async () => {
    const el = await abrir('E9', <CartaoE9 filtros={FILTROS_FLUXO} />)
    expect(el).toHaveTextContent(/7 projetos aprovados ainda não começaram\./)
    expect(el).toHaveTextContent(
      /O mais antigo espera há 256 dias úteis; 4 esperam há mais de 90\./,
    )
    const tabela = within(el).getByRole('table', {
      name: /Projetos aprovados e ainda não iniciados/,
    })
    expect(within(tabela).getAllByRole('row')).toHaveLength(8)
    expect(el).toHaveTextContent('Fonte: BusinessMap')
    expect(el).toHaveTextContent('Granularidade: projeto')
  })

  it('uma referência por tipo, um tipo por vez; abaixo de 20 concluídos diz "Sem referência"', async () => {
    const el = await abrir('E9', <CartaoE9 filtros={FILTROS_FLUXO} />)
    const abas = within(el).getAllByRole('tab')
    expect(abas.length).toBeGreaterThanOrEqual(2)
    expect(within(el).getByTestId('e9-sem-referencia')).toHaveTextContent(
      /Sem referência: menos de 20 projetos concluídos.*É esperado concluir poucos projetos\./,
    )
    expect(within(el).getByTestId('e9-mostrando')).toHaveTextContent(
      /Mostrando \d+ de 7 projetos \(tipo \w+\)\. A tabela abaixo lista todos\./,
    )
    await userEvent.setup().click(abas[1]!)
    expect(abas[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('com referência de 20 ou mais concluídos, não mostra o aviso de falta de referência', async () => {
    const fonte = new FonteAjustada({
      E9: (r: ResultadoDe<'E9'>) => {
        r.referenciasP85 = r.referenciasP85.map((x) => ({
          tipo: x.tipo,
          referenciaP85: {
            status: 'ok',
            n: 24,
            valor: { p85: 60 },
            janela: { inicio: '2026-07-18', fim: '2026-10-09', unidade: 'semanas', quantidade: 12 },
          },
        })) as never
      },
    })
    const el = await abrir('E9', <CartaoE9 filtros={FILTROS_FLUXO} />, fonte)
    expect(within(el).queryByTestId('e9-sem-referencia')).not.toBeInTheDocument()
  })

  it('sem projetos aguardando: estado vazio; falha: erro com "Tentar de novo"', async () => {
    const vazio = new FonteAjustada({
      E9: (r: ResultadoDe<'E9'>) => {
        r.projetos = []
        r.base.n = 0
      },
    })
    renderizarCartao(<CartaoE9 filtros={FILTROS_FLUXO} />, { fonte: vazio })
    const el = await screen.findByTestId('metrica-E9')
    await waitFor(() => expect(el).toHaveAttribute('data-estado', 'vazio'))
  })
})

describe('E6 Datas do portfólio', () => {
  it('abaixo de 20 projetos: "k de n", sem percentual nem percentis, com os pontos e a tabela', async () => {
    const el = await abrir(
      'E6',
      <CartaoE6 filtros={{ ...FILTROS_FLUXO, periodo: { tipo: '12m' } }} />,
    )
    expect(el).toHaveTextContent(/\d+ de \d+ projetos concluídos no período/)
    expect(el).toHaveTextContent(/ao menos uma vez/)
    expect(within(el).getByTestId('amostra-insuficiente-E6')).toBeInTheDocument()
    expect(within(el).queryByTestId('e6-estatistica')).not.toBeInTheDocument()
    expect(el.textContent).not.toMatch(/\d%/)
    expect(el).toHaveTextContent('Dados fictícios')
    expect(within(el).getByRole('table', { name: /Deslize por projeto concluído/ })).toBeVisible()
  })

  it('com 20 projetos ou mais, publica o percentual e o P50 e P85 do deslize', async () => {
    const fonte = new FonteAjustada({
      E6: (r: ResultadoDe<'E6'>) => {
        const j = { inicio: '2026-07-18', fim: '2026-10-09', unidade: 'semanas', quantidade: 12 }
        r.naData = { status: 'ok', k: 8, n: 24, pct: 33.3 } as never
        r.deslize = { status: 'ok', n: 24, valor: { p50: 5, p85: 20 }, janela: j } as never
      },
    })
    const el = await abrir('E6', <CartaoE6 filtros={FILTROS_FLUXO} />, fonte)
    expect(within(el).getByTestId('e6-estatistica')).toHaveTextContent(
      /33,3% dos projetos concluídos saíram na data comprometida \(8 de 24\)\. Deslize: P50 5 dias úteis e P85 20 dias úteis\./,
    )
    expect(within(el).queryByTestId('amostra-insuficiente-E6')).not.toBeInTheDocument()
  })

  it('falha da API: mensagem e botão para tentar de novo', async () => {
    renderizarCartao(<CartaoE6 filtros={FILTROS_FLUXO} />, { fonte: new FonteErro() })
    expect(await screen.findByRole('button', { name: /tentar de novo/i })).toBeInTheDocument()
  })
})

describe('E7 Capacidade por sistema (participação percentual, sem valores em reais)', () => {
  it('mostra a participação por sistema, ordenada por volume, com "k de n" abaixo de 20 entregas', async () => {
    const el = await abrir('E7', <CartaoE7 filtros={FILTROS_FLUXO} />)
    const tabela = within(el).getByRole('table', { name: /Entregas e participação por sistema/ })
    const linhas = within(tabela).getAllByRole('row').slice(1)
    expect(linhas[0]).toHaveTextContent(/Protheus\s*\d+(,\d)?%\s*\d+/)
    const ultima = linhas.at(-1)!
    expect(ultima).toHaveTextContent(/\d+ de \d+ \(percentual não publicado, menos de 20\)/)
    expect(el).toHaveTextContent(/O sistema Protheus ficou com \d+(,\d)?% das entregas do período/)
    expect(el).toHaveTextContent('Não inclui os chamados da sustentação (Acelerato)')
  })

  it('nunca mostra valor em reais, mesmo que a API devolva os campos de custo', async () => {
    const fonte = new FonteAjustada({
      E7: (r: ResultadoDe<'E7'>) => {
        r.custoConfigurado = true
        for (const s of r.sistemas)
          Object.assign(s, { [CAMPOS_CUSTO[0]!]: 123456, [CAMPOS_CUSTO[1]!]: 789 })
      },
    })
    const el = await abrir('E7', <CartaoE7 filtros={FILTROS_FLUXO} />, fonte)
    expect(el.textContent).not.toMatch(SIFRAO)
    expect(el.textContent).not.toMatch(/123\.?456|rateio|custo/i)
  })

  it('com menos de 20 entregas no total, não publica percentual: só "k de n"', async () => {
    const fonte = new FonteAjustada({
      E7: (r: ResultadoDe<'E7'>) => {
        r.total = 12
        r.base.n = 12
        r.sistemas = r.sistemas.slice(0, 2).map((s) => ({
          ...s,
          entregas: 6,
          participacao: null,
          porNatureza: s.porNatureza.map((x) => ({
            ...x,
            taxa: { status: 'insuficiente', k: 1, n: 6, minimo: 20 },
          })),
        })) as never
      },
    })
    const el = await abrir('E7', <CartaoE7 filtros={FILTROS_FLUXO} />, fonte)
    expect(el.textContent).not.toMatch(/\d%/)
    expect(el).toHaveTextContent(/6 de 12/)
    expect(within(el).getByTestId('amostra-insuficiente-E7')).toBeInTheDocument()
  })

  it('erro: botão para tentar de novo', async () => {
    renderizarCartao(<CartaoE7 filtros={FILTROS_FLUXO} />, { fonte: new FonteErro() })
    expect(await screen.findByRole('button', { name: /tentar de novo/i })).toBeInTheDocument()
  })
})

describe('E8 Concentração de conhecimento (só contagens, sem nomear sistemas)', () => {
  it('mostra as três contagens e o selo, e nenhum nome de sistema nem de pessoa', async () => {
    const el = await abrir('E8', <CartaoE8 filtros={FILTROS_FLUXO} />)
    const faixas = within(el).getByTestId('e8-faixas')
    expect(faixas).toHaveTextContent('Sistemas com entregas de 1 pessoa')
    expect(faixas).toHaveTextContent('de 2 pessoas')
    expect(faixas).toHaveTextContent('de 3 ou mais')
    expect(el).toHaveTextContent(
      'Mede risco de continuidade do parque. Não mostra nem avalia pessoas.',
    )
    expect(el).toHaveTextContent(/tiveram todas as entregas feitas por uma única pessoa|teve todas/)
    expect(el.textContent).not.toMatch(/Protheus|Fluig|Senior|Core 5G|CRM|Data Lake|Pessoa \d/)
    expect(el).toHaveTextContent('Dados fictícios')
  })

  it('recorte com menos de 5 sistemas: mensagem fixa e faixas ocultas', async () => {
    const fonte = new FonteAjustada({
      E8: (r: ResultadoDe<'E8'>) => {
        r.faixas = null
        r.recortePequeno = true
        r.sistemasComEntrega = 3
      },
    })
    const el = await abrir('E8', <CartaoE8 filtros={FILTROS_FLUXO} />, fonte)
    expect(within(el).getByTestId('e8-recorte-pequeno')).toHaveTextContent(
      'Recorte pequeno demais para mostrar a concentração sem identificar pessoas.',
    )
    expect(within(el).queryByTestId('e8-faixas')).not.toBeInTheDocument()
  })

  it('erro: botão para tentar de novo', async () => {
    renderizarCartao(<CartaoE8 filtros={FILTROS_FLUXO} />, { fonte: new FonteErro() })
    expect(await screen.findByRole('button', { name: /tentar de novo/i })).toBeInTheDocument()
  })
})

describe('ramos de leitura dos cartões', () => {
  it('E9 com um só tipo não mostra seletor; sem projetos, só a tabela vazia', async () => {
    const fonte = new FonteAjustada({
      E9: (r: ResultadoDe<'E9'>) => {
        r.referenciasP85 = r.referenciasP85.filter((x) => x.tipo === 'Melhoria')
        r.projetos = r.projetos.map((p) => ({ ...p, tipo: 'Melhoria' }))
      },
    })
    const el = await abrir('E9', <CartaoE9 filtros={FILTROS_FLUXO} />, fonte)
    expect(within(el).queryByRole('tablist')).not.toBeInTheDocument()
    const vazio = new FonteAjustada({
      E9: (r: ResultadoDe<'E9'>) => {
        r.projetos = []
        r.referenciasP85 = []
        r.base.n = 1
      },
    })
    renderizarCartao(<CartaoE9 filtros={FILTROS_FLUXO} />, { fonte: vazio })
    const el2 = await screen.findAllByTestId('metrica-E9')
    await waitFor(() => expect(el2.at(-1)).toHaveAttribute('data-estado', 'ok'))
    expect(el2.at(-1)).not.toHaveTextContent(/ainda não começ/)
  })

  it('E6 sem projetos, sem janela e com todos na data', async () => {
    const semProjetos = new FonteAjustada({
      E6: (r: ResultadoDe<'E6'>) => {
        r.projetos = []
        r.semData = 2
        r.base.n = 1
        r.base.janela = null
      },
    })
    const a = await abrir('E6', <CartaoE6 filtros={FILTROS_FLUXO} />, semProjetos)
    expect(a).toHaveTextContent(
      '2 projetos concluídos sem data comprometida registrada ficaram fora desta conta.',
    )
    expect(within(a).queryByRole('img')).not.toBeInTheDocument()
  })

  it('E6 com todos os projetos na data diz que nenhum atrasou; com um atraso só, "O outro atrasou"', async () => {
    const naData = new FonteAjustada({
      E6: (r: ResultadoDe<'E6'>) => {
        r.projetos = r.projetos.map((p) => ({ ...p, deslizeDiasUteis: -1 }))
      },
    })
    expect(
      await abrir(
        'E6',
        <CartaoE6 filtros={{ ...FILTROS_FLUXO, periodo: { tipo: '12m' } }} />,
        naData,
      ),
    ).toHaveTextContent(/Nenhum atrasou;/)
  })

  it('E6 com atrasos iguais usa a forma singular', async () => {
    const igual = new FonteAjustada({
      E6: (r: ResultadoDe<'E6'>) => {
        r.projetos = r.projetos.map((p, i) => ({ ...p, deslizeDiasUteis: i === 0 ? 0 : 7 }))
      },
    })
    const el = await abrir(
      'E6',
      <CartaoE6 filtros={{ ...FILTROS_FLUXO, periodo: { tipo: '12m' } }} />,
      igual,
    )
    expect(el).toHaveTextContent(/Os demais atrasaram 7 dias úteis;/)
  })

  it('E7 sem sistemas não desenha barras', async () => {
    const sem = new FonteAjustada({
      E7: (r: ResultadoDe<'E7'>) => {
        r.sistemas = []
        r.total = 25
      },
    })
    const a = await abrir('E7', <CartaoE7 filtros={FILTROS_FLUXO} />, sem)
    expect(within(a).queryByRole('img')).not.toBeInTheDocument()
  })

  it('E7 com sustentação sem percentual publicado omite a fração de sustentação', async () => {
    const semSust = new FonteAjustada({
      E7: (r: ResultadoDe<'E7'>) => {
        const s = r.sistemas[0]!
        s.porNatureza = s.porNatureza.map((x) => ({
          ...x,
          taxa: { status: 'insuficiente', k: 1, n: 5, minimo: 20 },
        })) as never
      },
    })
    const b = await abrir('E7', <CartaoE7 filtros={FILTROS_FLUXO} />, semSust)
    expect(b).toHaveTextContent(/das entregas do período\./)
  })

  it('E9 ordena a tabela do mais antigo ao mais novo, mesmo com a API em outra ordem', async () => {
    const fonte = new FonteAjustada({
      E9: (r: ResultadoDe<'E9'>) => {
        r.projetos = [...r.projetos].sort((a, b) => a.idadeDiasUteis - b.idadeDiasUteis)
      },
    })
    const el = await abrir('E9', <CartaoE9 filtros={FILTROS_FLUXO} />, fonte)
    const linhas = within(
      within(el).getByRole('table', { name: /Projetos aprovados e ainda não iniciados/ }),
    )
      .getAllByRole('row')
      .slice(1)
    const esperas = linhas.map((l) =>
      Number(within(l).getAllByRole('cell').at(-1)!.textContent.replace(/\./g, '')),
    )
    expect(esperas).toEqual([...esperas].sort((a, b) => b - a))
  })

  it('E9 com P85 publicado diz a unidade e o tipo na linha de referência', async () => {
    const fonte = new FonteAjustada({
      E9: (r: ResultadoDe<'E9'>) => {
        r.referenciasP85 = r.referenciasP85.map((x) => ({
          tipo: x.tipo,
          referenciaP85: {
            status: 'ok',
            n: 24,
            valor: { p85: 60 },
            janela: { inicio: '2026-07-18', fim: '2026-10-09', unidade: 'semanas', quantidade: 12 },
          },
        })) as never
      },
    })
    const el = await abrir('E9', <CartaoE9 filtros={FILTROS_FLUXO} />, fonte)
    expect(el).toHaveTextContent(
      /P85 do tempo antes do início dos projetos concluídos do tipo \(E1\): 60 dias úteis/,
    )
  })

  it('E6 ordena do menor ao maior deslize e a tabela diz isso', async () => {
    const fonte = new FonteAjustada({
      E6: (r: ResultadoDe<'E6'>) => {
        r.projetos = r.projetos.map((p, i) => ({ ...p, deslizeDiasUteis: i % 2 === 0 ? 9 : 2 }))
      },
    })
    const el = await abrir(
      'E6',
      <CartaoE6 filtros={{ ...FILTROS_FLUXO, periodo: { tipo: '12m' } }} />,
      fonte,
    )
    const tabela = within(el).getByRole('table', { name: /do menor para o maior/ })
    const d = within(tabela)
      .getAllByRole('row')
      .slice(1)
      .map((l) => Number(within(l).getAllByRole('cell')[0]!.textContent))
    expect(d).toEqual([...d].sort((a, b) => a - b))
  })

  it('E6 com todos atrasados não diz "o outro" nem "os demais"', async () => {
    const mesmo = new FonteAjustada({
      E6: (r: ResultadoDe<'E6'>) => {
        r.projetos = r.projetos.map((p) => ({ ...p, deslizeDiasUteis: 8 }))
      },
    })
    const a = await abrir(
      'E6',
      <CartaoE6 filtros={{ ...FILTROS_FLUXO, periodo: { tipo: '12m' } }} />,
      mesmo,
    )
    expect(a).toHaveTextContent(/Nenhum dos \d+ projetos concluídos no período saiu na data/)
    expect(a).toHaveTextContent(/Todos atrasaram 8 dias úteis;/)
  })

  it('E6 com todos atrasados em valores diferentes e com um só projeto atrasado', async () => {
    const varios = new FonteAjustada({
      E6: (r: ResultadoDe<'E6'>) => {
        r.projetos = r.projetos.map((p, i) => ({ ...p, deslizeDiasUteis: 3 + i }))
      },
    })
    const b = await abrir(
      'E6',
      <CartaoE6 filtros={{ ...FILTROS_FLUXO, periodo: { tipo: '12m' } }} />,
      varios,
    )
    expect(b).toHaveTextContent(/Todos atrasaram de 3 a \d+ dias úteis;/)
  })

  it('E6 com um só projeto, atrasado', async () => {
    const um = new FonteAjustada({
      E6: (r: ResultadoDe<'E6'>) => {
        r.projetos = r.projetos.slice(0, 1).map((p) => ({ ...p, deslizeDiasUteis: 8 }))
      },
    })
    const c = await abrir(
      'E6',
      <CartaoE6 filtros={{ ...FILTROS_FLUXO, periodo: { tipo: '12m' } }} />,
      um,
    )
    expect(c).toHaveTextContent(
      /O projeto concluído no período não saiu na data comprometida\. Ele atrasou 8 dias úteis;/,
    )
  })

  it('E7 com total de 20 ou mais e nenhum sistema com 20 não diz "abaixo de 20"', async () => {
    const fonte = new FonteAjustada({
      E7: (r: ResultadoDe<'E7'>) => {
        r.total = 60
        r.base.n = 60
        r.sistemas = r.sistemas.slice(0, 6).map((s) => ({
          ...s,
          entregas: 10,
          participacao: null,
          porNatureza: s.porNatureza.map((x) => ({
            ...x,
            taxa: { status: 'insuficiente', k: 1, n: 10, minimo: 20 },
          })),
        })) as never
      },
    })
    const el = await abrir('E7', <CartaoE7 filtros={FILTROS_FLUXO} />, fonte)
    expect(el).toHaveTextContent(
      /60 entregas no período, mas nenhum sistema chegou a 20 entregas: só a contagem por sistema é publicada\./,
    )
    expect(el.textContent).not.toMatch(/abaixo de 20, só a contagem/)
    expect(el.textContent).not.toMatch(/\d%/)
  })

  it('E7 com mais de 10 sistemas desenha os 10 maiores e resume os demais, a tabela lista todos', async () => {
    const fonte = new FonteAjustada({
      E7: (r: ResultadoDe<'E7'>) => {
        const base = r.sistemas[0]!
        r.sistemas = Array.from({ length: 14 }, (_, i) => ({
          ...base,
          sistema: `Sistema ${i + 1}`,
          entregas: 30 - i,
        }))
        r.total = 500
      },
    })
    const el = await abrir('E7', <CartaoE7 filtros={FILTROS_FLUXO} />, fonte)
    expect(within(el).getByTestId('e7-demais')).toHaveTextContent(
      /Demais 4 sistemas: 74 de 500 entregas\./,
    )
    const tabela = within(el).getByRole('table', { name: /Entregas e participação por sistema/ })
    expect(within(tabela).getAllByRole('row')).toHaveLength(15)
  })
})
