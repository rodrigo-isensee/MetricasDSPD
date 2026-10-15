import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { EstadoColeta } from '@metricas-dspd/contratos'
import { fonteDeTeste, renderizarApp, renderizarCartao } from '@/test/helpers'
import { Contagens } from './Contagens'
import { JanelaCalibracaoFonte } from './JanelaCalibracaoFonte'
import { UltimaColeta } from './UltimaColeta'

const secao = async (nome: string) => {
  const h = await screen.findByRole('heading', { level: 2, name: nome })
  return h.closest('section') as HTMLElement
}

describe('/dados: Última coleta, Contagens e Janela de calibração (cenário padrão)', () => {
  it('BusinessMap: falha de 09/10, última ok de 08/10, próxima prevista e contagens de cards', async () => {
    renderizarApp('/dados?fonte=bm')
    const ultima = await secao('Última coleta')
    expect(within(ultima).getByText('Falha')).toBeInTheDocument()
    expect(ultima).toHaveTextContent(/Última coleta ok: 08\/10\/2026 06:\d\d/)
    expect(ultima).toHaveTextContent(/Última tentativa: falha \(09\/10\/2026 06:00\)/)
    expect(ultima).toHaveTextContent('Próxima prevista: 10/10/2026 06:00')

    const contagens = await secao('Contagens da última coleta')
    const dl = within(contagens).getByTestId('contagens')
    for (const rotulo of [
      'cards lidos',
      'novos',
      'atualizados',
      'arquivados mantidos',
      'excluídos mantidos',
    ])
      expect(within(dl).getByText(rotulo)).toBeInTheDocument()
    expect(contagens).toHaveTextContent('Arquivados e excluídos: total preservado na base')

    const janela = await secao('Janela de calibração')
    expect(janela).toHaveTextContent('Nenhuma janela de calibração vigente nesta fonte.')
    expect(janela).toHaveTextContent('Quando houver, ela é definida automaticamente pelo sistema.')
    expect(janela).not.toHaveTextContent('não para cobrar pessoas ou times')
  })

  it('Acelerato: coleta atual, chamados e a janela de 15/09 a 13/11/2026 definida pelo sistema', async () => {
    renderizarApp('/dados?fonte=ac')
    const ultima = await secao('Última coleta')
    expect(within(ultima).getByText('Atual')).toBeInTheDocument()
    expect(ultima).toHaveTextContent('Última tentativa: ok')
    expect(await secao('Contagens da última coleta')).toHaveTextContent('chamados lidos')
    const janela = await secao('Janela de calibração')
    expect(within(janela).getByTestId('janelas-calibracao')).toHaveTextContent(
      /15\/09 a 13\/11\/2026 \(desde a primeira coleta da fonte; métricas: O17, S1, S2.*EI-SUST.*\)/,
    )
    expect(within(janela).getByText('Em calibração')).toBeInTheDocument()
  })

  it('?mock=coleta-atrasada:ac mostra "Atrasado" só na fonte indicada', async () => {
    renderizarApp('/dados?fonte=ac&mock=coleta-atrasada:ac')
    const ultima = await secao('Última coleta')
    expect(within(ultima).getByText('Atrasado: última coleta há 26 h')).toBeInTheDocument()
  })

  it('"Saiba mais" da faixa de calibração leva à janela, com o foco na seção', async () => {
    renderizarApp('/sustentacao')
    await userEvent.click(
      await screen.findByRole('link', { name: 'Saiba mais sobre a calibração' }),
    )
    const titulo = await screen.findByRole('heading', { level: 2, name: 'Janela de calibração' })
    await waitFor(() => expect(titulo).toHaveFocus())
    expect(screen.getByRole('tab', { name: 'Acelerato' })).toHaveAttribute('aria-selected', 'true')
  })
})

describe('/dados: ramos das seções', () => {
  const estadoBase = () => fonteDeTeste.estadoColeta('businessmap')

  it('sem coleta ok: "nenhuma ainda" e nada a contar', async () => {
    const e: EstadoColeta = { ...(await estadoBase()), ultimaOk: null, horasDesdeUltimaOk: null }
    renderizarCartao(
      <>
        <UltimaColeta estado={e} />
        <Contagens estado={e} />
      </>,
    )
    expect(await screen.findByText('nenhuma ainda')).toBeInTheDocument()
    expect(screen.getByText('Ainda não há uma coleta concluída para contar.')).toBeInTheDocument()
  })

  it('sem nenhuma tentativa registrada, a última tentativa aparece como traço', async () => {
    const e: EstadoColeta = { ...(await estadoBase()), ultimaTentativa: null }
    renderizarCartao(<UltimaColeta estado={e} />)
    expect(await screen.findByText('—')).toBeInTheDocument()
  })

  it('janela aberta por mudança de critério diz a origem', async () => {
    const e: EstadoColeta = {
      ...(await estadoBase()),
      calibracao: [
        {
          inicio: '2026-10-01',
          fim: '2026-11-29',
          origem: 'criterio',
          criterioId: 'c1',
          metricas: ['O2', 'O3'],
        },
      ],
    }
    renderizarCartao(<JanelaCalibracaoFonte estado={e} />)
    expect(await screen.findByTestId('janelas-calibracao')).toHaveTextContent(
      '01/10 a 29/11/2026 (aberta por mudança de critério; métricas: O2, O3)',
    )
  })
})
