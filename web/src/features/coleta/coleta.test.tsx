import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { EstadoColeta } from '@metricas-dspd/contratos'
import { SeloFrescor } from '@/components/ui'
import type { FonteMetricas } from '@/data'
import { fonteDeTeste, renderizarApp, renderizarCartao } from '@/test/helpers'
import { FrescorFonte } from './FrescorFonte'
import { SemDadosDaFonte } from './SemDadosDaFonte'

const comEstado = (estado: Partial<EstadoColeta>): FonteMetricas =>
  Object.create(fonteDeTeste, {
    estadoColeta: {
      value: async (dominio: 'businessmap' | 'acelerato') => ({
        ...(await fonteDeTeste.estadoColeta(dominio)),
        ...estado,
      }),
    },
  }) as FonteMetricas

describe('SeloFrescor', () => {
  it.each([
    ['atual', 'Atual'],
    ['falha', 'Falha'],
    ['sem-coleta', 'Sem coleta'],
  ] as const)('%s mostra ícone e texto, nunca só cor', (selo, texto) => {
    const { container } = renderizarCartao(<SeloFrescor selo={selo} testid="s" />)
    return waitFor(() => {
      expect(screen.getByTestId('s')).toHaveTextContent(texto)
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('atrasado diz quantas horas; sem a informação, mostra só "Atrasado"', async () => {
    renderizarCartao(
      <>
        <SeloFrescor selo="atrasado" horas={25.6} testid="a" />
        <SeloFrescor selo="atrasado" testid="b" />
      </>,
    )
    expect(await screen.findByTestId('a')).toHaveTextContent('Atrasado: última coleta há 26 h')
    expect(screen.getByTestId('b')).toHaveTextContent(/^Atrasado$/)
  })
})

describe('FrescorFonte', () => {
  it('BusinessMap no cenário padrão: falha de 09/10, dados de 08/10 mantidos e Detalhes da coleta', async () => {
    renderizarCartao(<FrescorFonte dominio="businessmap" />)
    const selo = await screen.findByTestId('selo-frescor-businessmap')
    expect(selo).toHaveTextContent('Falha')
    expect(screen.getByText(/Atualizado em 08\/10\/2026 06:\d\d/)).toBeInTheDocument()
    expect(screen.getByTestId('falha-coleta-businessmap')).toHaveTextContent(
      /Coleta falhou em 09\/10\/2026 06:00\. Mostrando dados de 08\/10\/2026 06:\d\d\./,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Detalhes da coleta do BusinessMap' }))
    expect(
      await screen.findByRole('link', { name: 'Abrir Dados e coletas do BusinessMap' }),
    ).toHaveAttribute('href', '/dados?fonte=bm')
  })

  it('Acelerato no cenário padrão: atual, sem aviso de falha e Detalhes da coleta aponta para a aba certa', async () => {
    renderizarCartao(<FrescorFonte dominio="acelerato" comNome />)
    expect(await screen.findByTestId('selo-frescor-acelerato')).toHaveTextContent('Atual')
    expect(screen.queryByTestId('falha-coleta-acelerato')).not.toBeInTheDocument()
    expect(screen.getByText('Acelerato:')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Detalhes da coleta/ }))
    expect(await screen.findByRole('link', { name: /Abrir Dados e coletas/ })).toHaveAttribute(
      'href',
      '/dados?fonte=ac',
    )
  })

  it('reservarFalha guarda a linha do aviso de falha em todos os estados, para o cabeçalho não saltar (CLS)', async () => {
    renderizarCartao(
      <>
        <FrescorFonte dominio="businessmap" comNome reservarFalha />
        <FrescorFonte dominio="acelerato" comNome reservarFalha />
      </>,
    )
    // Carregando: a reserva já existe, invisível e fora da leitura de tela.
    expect(screen.getByTestId('reserva-falha-businessmap')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('reserva-falha-acelerato')).toHaveClass('invisible')
    await screen.findByTestId('selo-frescor-acelerato')
    // Atual (Acelerato): a reserva continua. Em falha (BusinessMap): a linha real a substitui.
    expect(screen.getByTestId('reserva-falha-acelerato')).toBeInTheDocument()
    expect(screen.getByTestId('falha-coleta-businessmap')).toBeInTheDocument()
    expect(screen.queryByTestId('reserva-falha-businessmap')).not.toBeInTheDocument()
  })

  it('sem reservarFalha não há linha reservada', async () => {
    renderizarCartao(<FrescorFonte dominio="acelerato" />)
    await screen.findByTestId('selo-frescor-acelerato')
    expect(screen.queryByTestId('reserva-falha-acelerato')).not.toBeInTheDocument()
  })

  it('?mock=coleta-atrasada:bm mostra "Atrasado: última coleta há 26 h"', async () => {
    renderizarCartao(<FrescorFonte dominio="businessmap" />, { url: '/?mock=coleta-atrasada:bm' })
    expect(await screen.findByTestId('selo-frescor-businessmap')).toHaveTextContent(
      'Atrasado: última coleta há 26 h',
    )
  })

  it('carregando mostra "Verificando a coleta…"; o erro de leitura oferece "Tentar de novo"', async () => {
    const r = renderizarCartao(<FrescorFonte dominio="businessmap" comNome />, {
      url: '/?mock=carregando',
    })
    expect(await screen.findByText('BusinessMap: Verificando a coleta…')).toBeInTheDocument()
    r.unmount()
    renderizarCartao(<FrescorFonte dominio="businessmap" />, { url: '/?mock=coleta-erro:bm' })
    const alerta = await screen.findByRole('alert')
    expect(alerta).toHaveTextContent('Não foi possível verificar a coleta.')
    await userEvent.click(within(alerta).getByRole('button', { name: 'Tentar de novo' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })

  it('o erro com as duas fontes diz de qual fonte é', async () => {
    renderizarCartao(<FrescorFonte dominio="acelerato" comNome />, { url: '/?mock=coleta-erro:ac' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Acelerato: Não foi possível')
  })

  it('sem nenhuma coleta ok e com a última tentativa em falha: sem "Mostrando dados de"', async () => {
    const tentativa = (await fonteDeTeste.estadoColeta('businessmap')).ultimaTentativa
    const fonte = comEstado({ selo: 'falha', ultimaOk: null, ultimaTentativa: tentativa })
    renderizarCartao(<FrescorFonte dominio="businessmap" />, { fonte: fonte as never })
    expect(await screen.findByText('Nenhuma coleta concluída')).toBeInTheDocument()
    expect(screen.getByTestId('falha-coleta-businessmap')).not.toHaveTextContent('Mostrando')
  })

  it('falha sem registro da tentativa não mostra a linha de aviso', async () => {
    const fonte = comEstado({ selo: 'falha', ultimaTentativa: null })
    renderizarCartao(<FrescorFonte dominio="businessmap" />, { fonte: fonte as never })
    await screen.findByTestId('selo-frescor-businessmap')
    expect(screen.queryByTestId('falha-coleta-businessmap')).not.toBeInTheDocument()
  })
})

describe('SemDadosDaFonte', () => {
  it('diz que a primeira coleta ainda não terminou e leva de volta à Visão geral', async () => {
    renderizarCartao(<SemDadosDaFonte dominio="acelerato" />)
    expect(await screen.findByText('Ainda não há dados desta fonte')).toBeInTheDocument()
    expect(screen.getByText(/primeira coleta do Acelerato ainda não terminou/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar à Visão geral' })).toHaveAttribute('href', '/')
  })
})

describe('selos nos painéis (sistêmico: fonte mock, hooks e páginas)', () => {
  it.each([
    ['/operacional?cadencia=semanal', 'businessmap', 'Falha'],
    ['/tatico', 'businessmap', 'Falha'],
    ['/estrategico', 'businessmap', 'Falha'],
    ['/operacional?cadencia=sustentacao', 'acelerato', 'Atual'],
  ] as const)('%s mostra o selo só da própria fonte', async (rota, dominio, texto) => {
    renderizarApp(rota)
    expect(await screen.findByTestId(`selo-frescor-${dominio}`)).toHaveTextContent(texto)
    const outro = dominio === 'businessmap' ? 'acelerato' : 'businessmap'
    expect(screen.queryByTestId(`selo-frescor-${outro}`)).not.toBeInTheDocument()
  })

  it('Visão geral mostra dois selos, um por fonte, separados', async () => {
    for (const rota of ['/']) {
      const r = renderizarApp(rota)
      expect(await screen.findByTestId('selo-frescor-businessmap')).toHaveTextContent('Falha')
      expect(screen.getByTestId('selo-frescor-acelerato')).toHaveTextContent('Atual')
      r.unmount()
    }
  })

  it('a falha do BusinessMap não altera a Sustentação (CA-10)', async () => {
    renderizarApp('/sustentacao?mock=coleta-erro:bm')
    expect(await screen.findByTestId('selo-frescor-acelerato')).toHaveTextContent('Atual')
    expect(await screen.findByTestId('metrica-S1')).toBeInTheDocument()
  })

  it('sem nenhuma coleta ok o painel diz que não há dados da fonte, sem inventar dados', async () => {
    renderizarApp('/operacional?mock=coleta-vazia:bm')
    expect(await screen.findByTestId('sem-dados-businessmap')).toBeInTheDocument()
    expect(screen.getByTestId('selo-frescor-businessmap')).toHaveTextContent('Sem coleta')
    expect(screen.queryByTestId('metrica-O2')).not.toBeInTheDocument()
  })

  it('IR-002: falha de leitura do estado de coleta mostra a mensagem neutra e "Tentar de novo" no painel', async () => {
    renderizarApp('/operacional?mock=coleta-erro:bm')
    expect(await screen.findByText(/Não foi possível verificar a coleta/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
    expect(screen.queryByText(/Verificando a coleta/)).not.toBeInTheDocument()
  })
})
