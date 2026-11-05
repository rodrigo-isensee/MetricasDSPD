import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { corpoSemDadoReal, origemDaMetrica, type MetricaId } from '@metricas-dspd/contratos'
import { FonteComSimulado, SemDadoRealErro, type FonteMetricas } from '@/data'
import { fonteDeTeste, renderizarApp } from '@/test/helpers'
import { contarSemDadoReal, motivoSemSigla } from './OrigemDosCartoes'

/**
 * A API real de dublê: o que o mapa de origem dá como real vem do mock (como estand-in do DTO real); o resto responde
 * `sem-dado-real` com `simulavel`, como a API (L1). O simulado vem do mock de verdade, por `criarMock`.
 */
function fonteApiComSimulado() {
  const real = Object.create(fonteDeTeste, {
    tipo: { value: 'api' },
    obter: {
      value: (id: MetricaId, ...resto: unknown[]) => {
        if (origemDaMetrica(id) === 'mock') {
          const c = corpoSemDadoReal(id)
          return Promise.reject(new SemDadoRealErro(c.metrica, c.motivo, c.simulavel === true))
        }
        return (fonteDeTeste.obter as (...a: unknown[]) => Promise<unknown>)(id, ...resto)
      },
    },
  }) as FonteMetricas
  const criarMock = vi.fn(() => Promise.resolve(fonteDeTeste as FonteMetricas))
  return {
    fonte: new FonteComSimulado(real, { criarMock }) as unknown as typeof fonteDeTeste,
    criarMock,
  }
}

describe('painéis com o simulado por cartão (pedido 070, T-W6)', () => {
  it('Operacional semanal: O12 mostra número com selo; O3 é real e fica sem selo; a faixa e a contagem seguem só o real', async () => {
    const { fonte } = fonteApiComSimulado()
    renderizarApp('/operacional?cadencia=semanal', fonte)
    const o12 = await screen.findByTestId('metrica-O12')
    await waitFor(() => expect(o12).toHaveAttribute('data-estado', 'ok'))
    expect(within(o12).getByTestId('selo-simulado-O12')).toHaveTextContent('Simulado')
    expect(within(o12).getByTestId('leitura-O12').textContent).toMatch(/^Exemplo: /)
    expect(within(o12).getByTestId('motivo-simulado-O12')).toHaveTextContent(
      'aguardando campo no quadro',
    )
    const o3 = await screen.findByTestId('metrica-O3')
    await waitFor(() => expect(o3).toHaveAttribute('data-estado', 'ok'))
    expect(within(o3).queryByTestId('selo-simulado-O3')).toBeNull()
    // O simulado não entra na contagem do cabeçalho: segue o mapa do contrato.
    expect(await screen.findByTestId('nota-sem-dado-real-operacional')).toHaveTextContent(
      `${contarSemDadoReal('operacional', 'api')} cartões sem dado real`,
    )
    // Faixa "O que pede atenção": O12 está sem dado real para ela, então nunca diz "Nada pede atenção" por inteiro.
    expect(screen.queryByText(/Nada pede atenção/)).toBeNull()
  })

  it('Tático: todos simulados com selo, mas a faixa de atenção continua "Sem dado real"', async () => {
    const { fonte } = fonteApiComSimulado()
    renderizarApp('/tatico', fonte)
    const t2 = await screen.findByTestId('metrica-T2')
    await waitFor(() => expect(t2).toHaveAttribute('data-estado', 'ok'))
    expect(within(t2).getByTestId('selo-simulado-T2')).toBeInTheDocument()
    expect(await screen.findByTestId('faixa-atencao-sem-dado-real')).toHaveTextContent(
      'Sem dado real',
    )
  })

  it('Sustentação: S1 simulado com selo, S2 real sem selo, EI_SUST sem dado real e sem número', async () => {
    const { fonte } = fonteApiComSimulado()
    renderizarApp('/sustentacao', fonte)
    const s1 = await screen.findByTestId('metrica-S1')
    await waitFor(() => expect(s1).toHaveAttribute('data-estado', 'ok'))
    expect(within(s1).getByTestId('selo-simulado-S1')).toBeInTheDocument()
    const s2 = await screen.findByTestId('metrica-S2')
    await waitFor(() => expect(s2).toHaveAttribute('data-estado', 'ok'))
    expect(within(s2).queryByTestId('selo-simulado-S2')).toBeNull()
    const ei = await screen.findByTestId('metrica-EI-SUST')
    expect(await within(ei).findByTestId('estado-sem-dado-real-EI-SUST')).toBeInTheDocument()
    expect(within(ei).queryByTestId('selo-simulado-EI-SUST')).toBeNull()
    // A faixa lê só o real: com S1 sem dado real para ela, fica "parcial".
    expect(await screen.findByTestId('faixa-atencao-sem-dado-real-parcial')).toBeInTheDocument()
  })

  it('o mock é criado uma só vez, pelo primeiro cartão simulável (o painel só com reais não o cria: T-W1)', async () => {
    const { fonte, criarMock } = fonteApiComSimulado()
    renderizarApp('/operacional?cadencia=diaria', fonte)
    const o2 = await screen.findByTestId('metrica-O2')
    await waitFor(() => expect(o2).toHaveAttribute('data-estado', 'ok'))
    // A visão diária tem O2, O1, O3 (reais) e BLOQUEADOS (simulável): o mock só nasce por este.
    expect(await screen.findByTestId('selo-simulado-BLOQUEADOS')).toBeInTheDocument()
    expect(criarMock).toHaveBeenCalledTimes(1)
  })

  it('Visão geral nunca é simulada: segue "Sem dado real"', async () => {
    const { fonte } = fonteApiComSimulado()
    renderizarApp('/', fonte)
    const estado = await screen.findByTestId('estado-sem-dado-real-VISAO_GERAL')
    expect(estado).toHaveTextContent('Sem dado real')
    expect(screen.queryByTestId('selo-simulado-VISAO_GERAL')).toBeNull()
  })
})

describe('motivoSemSigla (A-4)', () => {
  it('tira a sigla interna do motivo mostrado na faixa e mantém o resto', () => {
    expect(motivoSemSigla('aguardando tipo e domínio do campo do chamado (P-DS-19)')).toBe(
      'aguardando tipo e domínio do campo do chamado',
    )
    expect(
      motivoSemSigla('aguardando o motivo de pendência do chamado (tipo e domínio, P-DS-19)'),
    ).toBe('aguardando o motivo de pendência do chamado (tipo e domínio)')
    expect(motivoSemSigla('aguardando campo no quadro')).toBe('aguardando campo no quadro')
  })
})
