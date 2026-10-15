import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import {
  CartaoMetrica,
  FaixaAtencao,
  FaixaCalibracao,
  ProvedorCalibracao,
  StatusMeta,
  idDeMetrica,
} from '@/components/ui'
import { renderizarApp, renderizarCartao } from '@/test/helpers'
import { CalibracaoDasFontes } from './CalibracaoDasFontes'
import { dominiosDaRota } from './fontes'

const SUST = '/operacional?cadencia=sustentacao'

async function cartao(codigo: string, url: string) {
  renderizarApp(url)
  const el = await screen.findByTestId(`metrica-${codigo}`)
  await waitFor(() => expect(el).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
  return el
}

describe('calibração: fontes por rota (A4)', () => {
  it('a Sustentação espera só o Acelerato; o fluxo só o BusinessMap; a Visão geral as duas', () => {
    expect(dominiosDaRota('/operacional', '?cadencia=sustentacao')).toEqual(['acelerato'])
    expect(dominiosDaRota('/operacional', '?cadencia=semanal')).toEqual(['businessmap'])
    expect(dominiosDaRota('/')).toEqual(['businessmap', 'acelerato'])
  })
})

describe('calibração: componentes', () => {
  it('idDeMetrica normaliza o código do cartão para o id da métrica', () => {
    expect(idDeMetrica('EI-SUST')).toBe('EI_SUST')
    expect(idDeMetrica('s1')).toBe('S1')
  })

  it('a faixa lista as janelas, é role=status e leva a /dados', () => {
    render(
      <MemoryRouter>
        <FaixaCalibracao
          fonte="Acelerato"
          janelas={[
            { inicio: '2026-09-15', fim: '2026-11-13' },
            { inicio: '2026-10-01', fim: '2026-11-29' },
          ]}
          saibaMais="/dados?fonte=ac#calibracao"
        />
      </MemoryRouter>,
    )
    const faixa = screen.getByRole('status')
    expect(faixa).toHaveTextContent(
      'Dados de calibração (Acelerato, 15/09 a 13/11/2026; 01/10 a 29/11/2026',
    )
    expect(faixa).toHaveTextContent('não para cobrar pessoas ou times')
    expect(screen.getByRole('link', { name: 'Saiba mais sobre a calibração' })).toHaveAttribute(
      'href',
      '/dados?fonte=ac#calibracao',
    )
  })

  it('"Pede atenção" omite métricas em calibração e avisa; o id do item vale quando não há código', () => {
    render(
      <MemoryRouter>
        <ProvedorCalibracao metricas={new Set(['T2', 'O2'])} pronta>
          <FaixaAtencao
            itens={[
              { id: 't2', texto: 'T2 fora', para: '#t2' },
              { id: 'o2', codigo: 'O2', texto: 'O2 acima', para: '#o2' },
              { id: 't4', texto: 'T4 fora', para: '#t4' },
            ]}
          />
        </ProvedorCalibracao>
      </MemoryRouter>,
    )
    expect(screen.queryByText('T2 fora')).not.toBeInTheDocument()
    expect(screen.queryByText('O2 acima')).not.toBeInTheDocument()
    expect(screen.getByText('T4 fora')).toBeInTheDocument()
    expect(screen.getByTestId('atencao-omitidos-calibracao')).toBeInTheDocument()
  })

  it('sem itens restantes, não diz "Nada pede atenção" em silêncio: o aviso de calibração aparece', () => {
    render(
      <MemoryRouter>
        <ProvedorCalibracao metricas={new Set(['T2'])} pronta>
          <FaixaAtencao itens={[{ id: 't2', texto: 'T2 fora', para: '#t2' }]} />
        </ProvedorCalibracao>
      </MemoryRouter>,
    )
    expect(screen.getByText(/Nada pede atenção/)).toBeInTheDocument()
    expect(screen.getByTestId('atencao-omitidos-calibracao')).toBeInTheDocument()
  })

  it('enquanto não se sabe o que está em calibração, a faixa e o cartão não afirmam nada', () => {
    render(
      <MemoryRouter>
        <ProvedorCalibracao metricas={new Set()} pronta={false}>
          <FaixaAtencao itens={[{ id: 't2', texto: 'T2 fora', para: '#t2' }]} />
          <CartaoMetrica
            codigo="T2"
            titulo="Aderência"
            pergunta="?"
            estado="ok"
            nota={{ oQueE: 'a', comoSeCalcula: 'b', comoLer: 'c', meta: 'd', cuidados: 'e' }}
            fonte="BusinessMap"
            granularidade="frente"
            statusMeta="fora"
          />
        </ProvedorCalibracao>
      </MemoryRouter>,
    )
    expect(screen.getByTestId('faixa-atencao-carregando')).toBeInTheDocument()
    expect(screen.queryByText('T2 fora')).not.toBeInTheDocument()
    expect(screen.getByTestId('metrica-T2')).toHaveAttribute('data-estado', 'carregando')
    expect(screen.queryByText('Fora da meta')).not.toBeInTheDocument()
  })

  it('com a leitura do estado de coleta falha (statusOculto) o status de meta some (R5)', () => {
    render(
      <MemoryRouter>
        <ProvedorCalibracao metricas={new Set()} pronta statusOculto>
          <StatusMeta status="fora" />
          <CartaoMetrica
            codigo="T2"
            titulo="Aderência"
            pergunta="?"
            estado="ok"
            nota={{ oQueE: 'a', comoSeCalcula: 'b', comoLer: 'c', meta: 'd', cuidados: 'e' }}
            fonte="BusinessMap"
            granularidade="frente"
            statusMeta="fora"
          />
        </ProvedorCalibracao>
      </MemoryRouter>,
    )
    expect(screen.queryByText('Fora da meta')).not.toBeInTheDocument()
  })

  it('StatusMeta fora de um cartão em calibração continua mostrando a meta', () => {
    render(<StatusMeta status="fora" />)
    expect(screen.getByText('Fora da meta')).toBeInTheDocument()
  })
})

describe('calibração na Sustentação (sistêmico: coletas mock -> hooks -> páginas)', () => {
  it('o painel fica visível com a faixa da fonte e o selo em cada cartão, sem Dentro/Fora da meta', async () => {
    const s2 = await cartao('S2', SUST)
    const faixa = await screen.findByTestId('faixa-calibracao-acelerato')
    expect(faixa).toHaveAttribute('role', 'status')
    expect(faixa).toHaveTextContent(
      /Acelerato, 15\/09 a 13\/11\/2026, janela definida automaticamente/,
    )
    expect(within(s2).getAllByTestId('selo-calibracao').length).toBe(1)
    expect(within(s2).getByTestId('calibracao-meta')).toHaveTextContent(
      'Em calibração: sem avaliação de meta',
    )
    expect(within(s2).getAllByTestId('selo-calibracao-meta').length).toBeGreaterThan(0)
    expect(within(s2).queryByText(/^(Abaixo|Acima) de 90%$/)).not.toBeInTheDocument()
    const s1 = await screen.findByTestId('metrica-S1')
    expect(within(s1).queryByText(/Mediana (dentro do|acima do) alvo/)).not.toBeInTheDocument()
    // Os números continuam: a calibração não esconde dados.
    expect(within(s2).getByTestId('tabela-S2-detalhe')).toHaveTextContent('88,9% · 144 de 162')
  })

  it('"Pede atenção" não lista S1 nem S2 e diz por quê', async () => {
    await cartao('S2', SUST)
    const faixa = await screen.findByTestId('faixa-atencao')
    await waitFor(() =>
      expect(within(faixa).getByTestId('atencao-omitidos-calibracao')).toBeInTheDocument(),
    )
    expect(within(faixa).queryAllByRole('link')).toHaveLength(0)
  })

  it('?mock=sem-calibracao devolve as metas e some a faixa', async () => {
    const s2 = await cartao('S2', `${SUST}&mock=sem-calibracao`)
    expect(screen.queryByTestId('faixa-calibracao-acelerato')).not.toBeInTheDocument()
    expect(within(s2).queryByTestId('selo-calibracao')).not.toBeInTheDocument()
    expect(within(s2).getAllByText(/^(Abaixo|Acima) de 90%$/).length).toBeGreaterThan(0)
  })

  it('a calibração do Acelerato não toca nos painéis do BusinessMap (nunca se misturam)', async () => {
    const o2 = await cartao('O2', '/operacional?cadencia=diaria')
    expect(screen.queryByTestId('faixa-calibracao-acelerato')).not.toBeInTheDocument()
    expect(screen.queryByTestId('faixa-calibracao-businessmap')).not.toBeInTheDocument()
    expect(within(o2).queryByTestId('selo-calibracao')).not.toBeInTheDocument()
  })

  it('Visão geral: a faixa é só da fonte em calibração e o nível Sustentação não avalia meta', async () => {
    renderizarApp('/')
    const nivel = await screen.findByTestId('nivel-sustentacao')
    await waitFor(() =>
      expect(within(nivel).getAllByTestId('calibracao-nivel-sustentacao')).toBeTruthy(),
    )
    expect(within(nivel).queryByText(/Dentro da meta|Atenção/)).not.toBeInTheDocument()
    expect(screen.getByTestId('faixa-calibracao-acelerato')).toBeInTheDocument()
    expect(screen.queryByTestId('faixa-calibracao-businessmap')).not.toBeInTheDocument()
    expect(
      within(screen.getByTestId('nivel-operacional')).queryByTestId('calibracao-nivel-operacional'),
    ).not.toBeInTheDocument()
    const alertas = screen.getByTestId('faixa-atencao')
    expect(within(alertas).queryByText(/Sustentação:/)).not.toBeInTheDocument()
  })
})

describe('calibração: leitura falha e Visão geral', () => {
  it('coleta-erro: a falha de leitura oculta o Dentro/Fora da meta; sem falha ele aparece (R5)', async () => {
    const cartaoT2 = (
      <CalibracaoDasFontes>
        <CartaoMetrica
          codigo="T2"
          titulo="Aderência"
          pergunta="?"
          estado="ok"
          nota={{ oQueE: 'a', comoSeCalcula: 'b', comoLer: 'c', meta: 'd', cuidados: 'e' }}
          fonte="BusinessMap"
          granularidade="frente"
          statusMeta="fora"
        />
      </CalibracaoDasFontes>
    )
    const r = renderizarCartao(cartaoT2, { url: '/?mock=coleta-erro:bm' })
    const t2 = await screen.findByTestId('metrica-T2')
    await waitFor(() => expect(t2).toHaveAttribute('data-estado', 'ok'), { timeout: 8000 })
    expect(within(t2).queryByText('Fora da meta')).not.toBeInTheDocument()
    r.unmount()
    renderizarCartao(cartaoT2, { url: '/' })
    expect(await screen.findByText('Fora da meta', {}, { timeout: 8000 })).toBeInTheDocument()
  })

  it('Visão geral: o nível com indicador em calibração mostra só o selo (R4)', async () => {
    renderizarApp('/')
    const selo = await screen.findByTestId('calibracao-nivel-sustentacao')
    expect(selo).toHaveTextContent('Em calibração')
  })
})
