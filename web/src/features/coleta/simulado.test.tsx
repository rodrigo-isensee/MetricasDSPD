import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  corpoSemDadoReal,
  MOTIVO_AGUARDANDO_CAMPO,
  MOTIVO_AGUARDANDO_CAMPO_CHAMADO,
  MOTIVO_S9_MOTIVO_PENDENCIA,
  origemDaMetrica,
  type MetricaId,
} from '@metricas-dspd/contratos'
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

describe('painéis sem a opção simulado nos cartões (pedido 099, L2a)', () => {
  it('Operacional semanal: O12 fica "Sem dado real" e sem selo; O3 segue real; a contagem segue o mapa', async () => {
    const { fonte, criarMock } = fonteApiComSimulado()
    renderizarApp('/operacional?cadencia=semanal', fonte)
    const o12 = await screen.findByTestId('metrica-O12')
    expect(await within(o12).findByTestId('estado-sem-dado-real-O12')).toHaveTextContent(
      'Sem dado real',
    )
    expect(within(o12).queryByTestId('selo-simulado-O12')).toBeNull()
    const o3 = await screen.findByTestId('metrica-O3')
    await waitFor(() => expect(o3).toHaveAttribute('data-estado', 'ok'))
    expect(await screen.findByTestId('nota-sem-dado-real-operacional')).toHaveTextContent(
      `${contarSemDadoReal('operacional', 'api')} cartões sem dado real`,
    )
    expect(screen.queryByText(/Nada pede atenção/)).toBeNull()
    expect(criarMock).not.toHaveBeenCalled()
  })

  it('Tático: os cartões ficam "Sem dado real", sem selo, e a faixa de atenção também', async () => {
    const { fonte, criarMock } = fonteApiComSimulado()
    renderizarApp('/tatico', fonte)
    const t2 = await screen.findByTestId('metrica-T2')
    expect(await within(t2).findByTestId('estado-sem-dado-real-T2')).toBeInTheDocument()
    expect(within(t2).queryByTestId('selo-simulado-T2')).toBeNull()
    expect(await screen.findByTestId('faixa-atencao-sem-dado-real')).toHaveTextContent(
      'Sem dado real',
    )
    expect(criarMock).not.toHaveBeenCalled()
  })

  it('Sustentação: S1 e EI_SUST ficam sem dado real e sem número; S2 segue real', async () => {
    const { fonte, criarMock } = fonteApiComSimulado()
    renderizarApp('/sustentacao', fonte)
    const s1 = await screen.findByTestId('metrica-S1')
    expect(await within(s1).findByTestId('estado-sem-dado-real-S1')).toBeInTheDocument()
    expect(within(s1).queryByTestId('selo-simulado-S1')).toBeNull()
    const s2 = await screen.findByTestId('metrica-S2')
    await waitFor(() => expect(s2).toHaveAttribute('data-estado', 'ok'))
    const ei = await screen.findByTestId('metrica-EI-SUST')
    expect(await within(ei).findByTestId('estado-sem-dado-real-EI-SUST')).toBeInTheDocument()
    expect(await screen.findByTestId('faixa-atencao-sem-dado-real-parcial')).toBeInTheDocument()
    expect(criarMock).not.toHaveBeenCalled()
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
    // Os motivos vêm das constantes de origem.ts (A2 do review): motivo novo com sigla em outro formato não passa.
    expect(motivoSemSigla(MOTIVO_AGUARDANDO_CAMPO_CHAMADO)).toBe(
      'aguardando tipo e domínio do campo do chamado',
    )
    expect(motivoSemSigla(MOTIVO_S9_MOTIVO_PENDENCIA)).toBe(
      'aguardando o motivo de pendência do chamado (tipo e domínio)',
    )
    expect(motivoSemSigla(MOTIVO_AGUARDANDO_CAMPO)).toBe(MOTIVO_AGUARDANDO_CAMPO)
    for (const m of [MOTIVO_AGUARDANDO_CAMPO_CHAMADO, MOTIVO_S9_MOTIVO_PENDENCIA]) {
      expect(m).toMatch(/P-[A-Z]+-\d+/)
      expect(motivoSemSigla(m)).not.toMatch(/P-[A-Z]+-\d+/)
    }
  })
})
