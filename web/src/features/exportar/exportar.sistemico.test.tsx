import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_PREFERENCIAS, cartoesDoPainel } from '@metricas-dspd/contratos'
import { MockFonteMetricas } from '@/data'
import { renderizarApp } from '@/test/helpers'
import * as carregar from './carregarPdf'

let blobs: Blob[] = []
beforeEach(() => {
  blobs = []
  URL.createObjectURL = vi.fn((b: Blob | MediaSource) => {
    blobs.push(b as Blob)
    return `blob:exportacao-${blobs.length}`
  })
  URL.revokeObjectURL = vi.fn()
})

const abrir = async (user: ReturnType<typeof userEvent.setup>, nome: string) => {
  await user.click(await screen.findByRole('button', { name: nome }))
  return screen.findByRole('dialog')
}
const gerar = async (user: ReturnType<typeof userEvent.setup>, dlg: HTMLElement) => {
  await user.click(within(dlg).getByRole('button', { name: 'Gerar arquivo' }))
  return within(dlg).findByRole('link', { name: 'Baixar' }, { timeout: 15000 })
}
const textoDoPdf = (i = blobs.length - 1) => (blobs[i] as Blob).text()

describe('Exportar nos painéis (sistêmico)', () => {
  it('lista só as métricas visíveis, gera o PDF e só então carrega o chunk', async () => {
    window.localStorage.setItem(
      CHAVE_PREFERENCIAS,
      JSON.stringify({
        versao: 1,
        paineis: { operacional: { ocultar: ['o9', 'o10'] } },
        atualizadoEm: '2026-10-10T00:00:00.000Z',
      }),
    )
    const spy = vi.spyOn(carregar, 'carregarPdf')
    const user = userEvent.setup()
    renderizarApp('/operacional?cadencia=semanal&periodo=4s')
    const dlg = await abrir(user, 'Exportar')
    expect(spy).not.toHaveBeenCalled()
    expect(within(dlg).getAllByRole('checkbox')).toHaveLength(
      cartoesDoPainel('operacional').filter((c) => c.grupo === 'nucleo').length - 2,
    )
    expect(within(dlg).queryByRole('checkbox', { name: /O9 / })).not.toBeInTheDocument()
    const baixar = await gerar(user, dlg)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(baixar).toHaveAttribute(
      'download',
      expect.stringMatching(/^metricas-dspd_fluxo-operacional_\d{4}-\d{2}-\d{2}_ficticio\.pdf$/),
    )
    const t = await textoDoPdf()
    expect(t).toContain('(Fonte: BusinessMap)')
    expect(t).not.toContain('(Fonte: Acelerato)')
    expect(t).toContain('4 semanas') // "Período: Últimas 4 semanas", vindo da URL do painel
    expect(t).not.toContain('O9 ')
    expect(t).toContain('Dados fict')
    spy.mockRestore()
  })

  it('a Sustentação exporta só Acelerato, e a espera invisível do nível está na lista', async () => {
    const user = userEvent.setup()
    const r = renderizarApp('/sustentacao')
    const dlg = await abrir(user, 'Exportar')
    expect(within(dlg).getAllByRole('checkbox').length).toBeGreaterThan(5)
    expect(
      within(dlg).getByRole('checkbox', { name: /EI-SUST .*\(Acelerato\)/ }),
    ).toBeInTheDocument()
    await gerar(user, dlg)
    const t = await textoDoPdf()
    expect(t).toContain('(Fonte: Acelerato)')
    expect(t).not.toContain('(Fonte: BusinessMap)')
    r.unmount()
  })

  it('a Visão geral exporta com BusinessMap e Acelerato em seções separadas', async () => {
    const user = userEvent.setup()
    renderizarApp('/')
    const dlg = await abrir(user, 'Exportar')
    const baixar = await gerar(user, dlg)
    expect(baixar).toHaveAttribute(
      'download',
      expect.stringMatching(/^metricas-dspd_visao-geral_\d{4}-\d{2}-\d{2}_ficticio\.pdf$/),
    )
    const t = await textoDoPdf()
    expect(t.indexOf('(Fonte: BusinessMap)')).toBeGreaterThan(0)
    expect(t.indexOf('(Fonte: BusinessMap)')).toBeLessThan(t.indexOf('(Fonte: Acelerato)'))
  })
})

describe('Exportação personalizada (sistêmico)', () => {
  it('um PDF só com métricas de níveis e fontes diferentes: BusinessMap antes de Acelerato', async () => {
    const user = userEvent.setup()
    renderizarApp('/operacional?cadencia=diaria')
    const dlg = await abrir(user, 'Exportação personalizada')
    await user.click(within(dlg).getByRole('checkbox', { name: /S1 .*Acelerato/ }))
    await user.click(within(dlg).getByRole('checkbox', { name: /T2 .*BusinessMap/ }))
    await user.click(within(dlg).getByRole('checkbox', { name: /O3 .*BusinessMap/ }))
    const baixar = await gerar(user, dlg)
    expect(baixar).toHaveAttribute(
      'download',
      expect.stringMatching(/^metricas-dspd_personalizada_\d{4}-\d{2}-\d{2}_ficticio\.pdf$/),
    )
    const t = await textoDoPdf()
    expect(t.indexOf('(Fonte: BusinessMap)')).toBeLessThan(t.indexOf('(Fonte: Acelerato)'))
    // Cada métrica com a sua fonte: S1 só depois da capa da seção Acelerato.
    expect(t.indexOf('(S1 ')).toBeGreaterThan(t.indexOf('(Fonte: Acelerato)'))
    expect(t.indexOf('(O3 ')).toBeLessThan(t.indexOf('(Fonte: Acelerato)'))
  })

  it('métrica oculta não aparece na personalizada; sem seleção, o botão não gera', async () => {
    window.localStorage.setItem(
      CHAVE_PREFERENCIAS,
      JSON.stringify({
        versao: 1,
        paineis: { tatico: { ocultar: ['t2'] } },
        atualizadoEm: '2026-10-10T00:00:00.000Z',
      }),
    )
    const user = userEvent.setup()
    renderizarApp('/')
    const dlg = await abrir(user, 'Exportação personalizada')
    expect(within(dlg).queryByRole('checkbox', { name: /T2 / })).not.toBeInTheDocument()
    expect(within(dlg).getByRole('checkbox', { name: /T1 / })).toBeInTheDocument()
    expect(within(dlg).getByRole('button', { name: 'Gerar arquivo' })).toBeDisabled()
  })

  it('erro ao ler os dados: mensagem sem detalhe e nenhum arquivo', async () => {
    const quebrada = new MockFonteMetricas({ latenciaMs: 0 })
    vi.spyOn(quebrada, 'obter').mockRejectedValue(new Error('falha interna 500'))
    const user = userEvent.setup()
    renderizarApp('/operacional?cadencia=diaria', quebrada)
    const dlg = await abrir(user, 'Exportar')
    await user.click(within(dlg).getByRole('button', { name: 'Gerar arquivo' }))
    const alerta = await within(dlg).findByRole('alert')
    expect(alerta).toHaveTextContent('Não foi possível gerar o arquivo. Tente de novo.')
    expect(dlg).not.toHaveTextContent('falha interna')
    expect(blobs).toHaveLength(0)
  })
})
