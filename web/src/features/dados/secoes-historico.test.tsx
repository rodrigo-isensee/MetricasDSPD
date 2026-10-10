import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { EstadoColeta, VersaoCriterio } from '@metricas-dspd/contratos'
import type { FonteMetricas } from '@/data'
import { fonteDeTeste, renderizarApp, renderizarCartao } from '@/test/helpers'
import { FalhasRecentes } from './FalhasRecentes'
import { HistoricoColetas } from './HistoricoColetas'
import { MudancasCriterio } from './MudancasCriterio'
import { fmtDuracao } from './rotulos'

const tabela = async (nome: RegExp) => screen.findByRole('table', { name: nome })
const linhas = (t: HTMLElement) => within(t).getAllByRole('row').slice(1)

const comCriterios = (criterios: () => Promise<VersaoCriterio[]>): FonteMetricas =>
  Object.create(fonteDeTeste, { criterios: { value: criterios } }) as FonteMetricas

describe('/dados: Falhas recentes, Histórico e Mudanças de critério (cenário padrão)', () => {
  it('BusinessMap: a falha de 09/10 com categoria do erro e efeito, sem detalhe sensível', async () => {
    renderizarApp('/dados?fonte=bm')
    const t = await tabela(/Falhas recentes/)
    const [falha, ...resto] = linhas(t)
    expect(resto).toHaveLength(0)
    expect(falha).toHaveTextContent('09/10/2026 06:00')
    expect(falha).toHaveTextContent('Falha: Tempo esgotado ao ler a fonte')
    expect(falha).toHaveTextContent('Painéis continuam com os dados da coleta anterior')
    expect(
      within(t)
        .getAllByRole('columnheader')
        .map((c) => c.textContent),
    ).toEqual(['Data', 'Tipo de erro', 'O que acontece com os dados'])
    const texto = document.body.textContent.toLowerCase()
    for (const proibido of ['apikey', 'password', 'select ', 'stack', 'mysql://'])
      expect(texto).not.toContain(proibido)
  })

  it('Acelerato: sem falhas nos últimos 14 dias', async () => {
    renderizarApp('/dados?fonte=ac')
    expect(await screen.findByText('Nenhuma falha nos últimos 14 dias.')).toBeInTheDocument()
  })

  it('histórico paginado a 20: mais recente primeiro, "Página 1 de N" e navegação', async () => {
    renderizarApp('/dados?fonte=ac')
    const t = await tabela(/Histórico de coletas/)
    expect(linhas(t)).toHaveLength(20)
    expect(
      within(t)
        .getAllByRole('columnheader')
        .map((c) => c.textContent),
    ).toEqual(['Data e hora', 'Resultado', 'Itens lidos', 'Duração'])
    expect(linhas(t)[0]).toHaveTextContent('09/10/2026 06:00')
    expect(linhas(t)[0]).toHaveTextContent('ok')
    const pagina = screen.getByTestId('pagina-acelerato')
    const anterior = screen.getByRole('button', { name: 'Página anterior' })
    const proxima = screen.getByRole('button', { name: 'Próxima página' })
    expect(pagina).toHaveTextContent('Página 1 de 2')
    expect(anterior).toBeDisabled()
    await userEvent.click(proxima)
    await waitFor(() => expect(pagina).toHaveTextContent('Página 2 de 2'))
    await waitFor(() =>
      expect(linhas(screen.getByRole('table', { name: /Histórico/ }))).toHaveLength(5),
    )
    expect(proxima).toBeDisabled()
    await userEvent.click(anterior)
    await waitFor(() => expect(pagina).toHaveTextContent('Página 1 de 2'))
  })

  it('histórico do BusinessMap mostra a falha de 09/10 com "—" em itens lidos', async () => {
    renderizarApp('/dados?fonte=bm')
    const t = await tabela(/Histórico de coletas/)
    expect(linhas(t)[0]).toHaveTextContent('09/10/2026 06:00')
    expect(linhas(t)[0]).toHaveTextContent('falha')
    expect(linhas(t)[0]).toHaveTextContent('—')
    expect(screen.getByTestId('pagina-businessmap')).toHaveTextContent(/Página 1 de 1\d/)
  })

  it('mudanças de critério: só as métricas da fonte da aba, com link para os critérios', async () => {
    const a = renderizarApp('/dados?fonte=bm')
    const bm = await tabela(/Mudanças de critério/)
    expect(linhas(bm)).toHaveLength(1)
    expect(linhas(bm)[0]).toHaveTextContent('02/03/2026')
    expect(linhas(bm)[0]).toHaveTextContent(
      'O7, O9, O10, T1, EI_FL1, EI_FL2, EI_FL3'.replaceAll('_', '-'),
    )
    expect(screen.getByRole('link', { name: 'Ver critérios' })).toHaveAttribute(
      'href',
      '/ajuda#criterios',
    )
    a.unmount()
    renderizarApp('/dados?fonte=ac')
    const ac = await tabela(/Mudanças de critério/)
    expect(linhas(ac)).toHaveLength(1)
    expect(linhas(ac)[0]).toHaveTextContent('01/06/2026')
    expect(linhas(ac)[0]).toHaveTextContent('S1, S2, S3, S4, S5, S6, S7, EI-SUST')
  })

  it('nenhuma tabela tem coluna por pessoa', async () => {
    renderizarApp('/dados?fonte=bm')
    await tabela(/Mudanças de critério/)
    expect(
      screen.queryByRole('columnheader', { name: /pessoa|responsável|autor|usuário/i }),
    ).not.toBeInTheDocument()
  })
})

describe('/dados: ramos das tabelas', () => {
  it('falha parcial mostra o ícone de relógio e o efeito; sem tipo de erro, só o resultado', async () => {
    const base = await fonteDeTeste.estadoColeta('businessmap')
    const ok = (await fonteDeTeste.historicoColetas('businessmap', 1)).itens[1]!
    const estado: EstadoColeta = {
      ...base,
      falhasRecentes: [
        { ...ok, resultado: 'parcial', tipoErro: 'autenticacao', efeito: 'parcial-aplicada' },
        { ...ok, id: 'x', resultado: 'falha', tipoErro: null, efeito: 'anteriores-mantidos' },
      ],
    }
    renderizarCartao(<FalhasRecentes estado={estado} />)
    const [parcial, falha] = linhas(await tabela(/Falhas recentes/))
    expect(parcial).toHaveTextContent('Parcial: Falha de autenticação')
    expect(parcial).toHaveTextContent('Itens lidos mantidos; o restante fica para a próxima coleta')
    expect(falha).toHaveTextContent(/Falha$|Falha\s*Painéis/)
  })

  it('histórico: carregando, erro com "Tentar de novo" e vazio', async () => {
    const a = renderizarCartao(<HistoricoColetas dominio="businessmap" />, {
      url: '/?mock=carregando',
    })
    expect(await screen.findByText('Carregando o histórico…')).toBeInTheDocument()
    a.unmount()
    const b = renderizarCartao(<HistoricoColetas dominio="businessmap" />, {
      url: '/?mock=coleta-erro:bm',
    })
    const erro = await screen.findByRole('alert')
    expect(erro).toHaveTextContent('Não foi possível carregar o histórico.')
    await userEvent.click(within(erro).getByRole('button', { name: 'Tentar de novo' }))
    await screen.findByRole('alert')
    b.unmount()
    renderizarCartao(<HistoricoColetas dominio="businessmap" />, { url: '/?mock=coleta-vazia:bm' })
    expect(await screen.findByText('Nenhuma coleta registrada.')).toBeInTheDocument()
    expect(screen.getByTestId('pagina-businessmap')).toHaveTextContent('Página 1 de 1')
  })

  it('critérios: uma mudança que afeta as duas fontes aparece em cada aba só com as métricas dela', async () => {
    const fonte = comCriterios(() =>
      Promise.resolve([
        {
          id: 'c',
          data: '2026-05-05',
          descricao: 'Regra comum',
          afeta: ['O2', 'S1', 'VISAO_GERAL'],
        },
      ]),
    )
    const a = renderizarCartao(<MudancasCriterio dominio="businessmap" />, {
      fonte: fonte as never,
    })
    expect(linhas(await tabela(/Mudanças/))[0]).toHaveTextContent(/^05\/05\/2026Regra comumO2$/)
    a.unmount()
    renderizarCartao(<MudancasCriterio dominio="acelerato" />, { fonte: fonte as never })
    expect(linhas(await tabela(/Mudanças/))[0]).toHaveTextContent(/^05\/05\/2026Regra comumS1$/)
  })

  it('critérios: vazio, carregando e erro', async () => {
    const a = renderizarCartao(<MudancasCriterio dominio="businessmap" />, {
      fonte: comCriterios(() => Promise.resolve([])) as never,
    })
    expect(
      await screen.findByText('Nenhuma mudança de critério registrada para esta fonte.'),
    ).toBeInTheDocument()
    a.unmount()
    const b = renderizarCartao(<MudancasCriterio dominio="businessmap" />, {
      fonte: comCriterios(() => new Promise(() => undefined)) as never,
    })
    expect(await screen.findByText('Carregando as mudanças de critério…')).toBeInTheDocument()
    b.unmount()
    renderizarCartao(<MudancasCriterio dominio="businessmap" />, {
      fonte: comCriterios(() => Promise.reject(new Error('x'))) as never,
    })
    expect(
      await screen.findByText('Não foi possível carregar as mudanças de critério.'),
    ).toBeInTheDocument()
  })

  it('duração em segundos ou minutos', () => {
    expect(fmtDuracao(45_000)).toBe('45 s')
    expect(fmtDuracao(240_000)).toBe('4 min')
  })
})
