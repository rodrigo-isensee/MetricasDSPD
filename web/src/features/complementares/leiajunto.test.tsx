import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CATALOGO_CARTOES, cartaoPorIdGlobal } from '@metricas-dspd/contratos'
import { renderizarApp } from '@/test/helpers'

vi.setConfig({ testTimeout: 60000 })

const URL_DO_PAINEL = {
  operacional: '/operacional?cadencia=semanal',
  tatico: '/tatico',
  estrategico: '/estrategico',
  sustentacao: '/operacional?cadencia=sustentacao',
} as const

const comPares = CATALOGO_CARTOES.filter(
  (c) =>
    c.grupo === 'nucleo' &&
    (c.leiaJunto ?? []).some((x) => cartaoPorIdGlobal(x)?.grupo === 'complementar'),
)

describe('Leia junto em todos os cartões do núcleo que têm complementares', () => {
  it.each(['operacional', 'tatico', 'estrategico', 'sustentacao'] as const)(
    '%s: cada cartão mostra os links para os seus complementares',
    async (painel) => {
      renderizarApp(URL_DO_PAINEL[painel])
      const doPainel = comPares.filter((c) => c.painel === painel)
      expect(doPainel.length).toBeGreaterThan(0)
      for (const c of doPainel) {
        const leia = await screen.findByTestId(`leia-junto-${c.id}`)
        const esperado = (c.leiaJunto ?? [])
          .map((x) => cartaoPorIdGlobal(x))
          .filter((x) => x?.grupo === 'complementar' || x?.grupo === 'percepcao')
          .map(
            (x) =>
              `${x?.codigo} ${x?.rotulo}${
                painel === 'operacional' && x?.painel === 'sustentacao'
                  ? ' · visão Sustentação, fonte Acelerato'
                  : ''
              }`,
          )
        expect(
          within(leia)
            .getAllByRole('link')
            .map((a) => a.textContent),
        ).toEqual(esperado)
      }
    },
  )

  it('os links do núcleo alcançam as 21 complementares (em cadeia)', () => {
    const alcancadas = new Set<string>()
    const fila = comPares.flatMap((c) => c.leiaJunto ?? [])
    for (let id = fila.pop(); id; id = fila.pop()) {
      if (alcancadas.has(id)) continue
      alcancadas.add(id)
      fila.push(...(cartaoPorIdGlobal(id)?.leiaJunto ?? []))
    }
    const compl = CATALOGO_CARTOES.filter((c) => c.grupo === 'complementar').map((c) => c.id)
    expect(compl).toHaveLength(21)
    expect(compl.filter((id) => !alcancadas.has(id))).toEqual([])
  })

  it('T5 leva ao O14 no painel Operacional: abre a seção, foca o cartão e mantém o hash na URL', async () => {
    const u = userEvent.setup()
    const { roteador } = renderizarApp('/tatico')
    const leia = await screen.findByTestId('leia-junto-t5')
    const link = within(leia).getByRole('link', { name: /O14 .*painel Operacional/ })
    expect(link).toHaveAttribute('href', '/operacional?cadencia=semanal#o14')
    await u.click(link)
    const cartao = await screen.findByTestId('metrica-O14')
    expect(roteador.state.location.pathname).toBe('/operacional')
    expect(roteador.state.location.hash).toBe('#o14')
    expect(screen.getByTestId<HTMLDetailsElement>('mais-metricas').open).toBe(true)
    await waitFor(() => expect(within(cartao).getByRole('heading', { level: 3 })).toHaveFocus())
  })

  it('O15 leva ao O17 na Sustentação e T9 leva ao E5 no Estratégico', async () => {
    const u = userEvent.setup()
    const a = renderizarApp('/operacional?cadencia=semanal')
    const leia = await screen.findByTestId('leia-junto-o15')
    const link17 = within(leia).getByRole('link', {
      name: /O17 .*visão Sustentação, fonte Acelerato/,
    })
    // O rótulo diz a visão e a fonte (leia junto não é calcular junto)
    expect(link17).toHaveTextContent(
      'O17 Defeitos por causa raiz e sistema · visão Sustentação, fonte Acelerato',
    )
    // WCAG 2.5.3: o nome acessível contém o texto visível
    expect(link17).toHaveAccessibleName(
      /^O17 Defeitos por causa raiz e sistema · visão Sustentação, fonte Acelerato\. Abre Mais métricas da visão Sustentação\.$/,
    )
    expect(link17).toHaveAttribute('href', '/operacional?cadencia=sustentacao#o17')
    await u.click(link17)
    expect(await screen.findByTestId('metrica-O17')).toBeInTheDocument()
    expect(a.roteador.state.location.pathname).toBe('/operacional')
    expect(a.roteador.state.location.search).toContain('cadencia=sustentacao')
    expect(a.roteador.state.location.hash).toBe('#o17')
    expect(screen.getByTestId<HTMLDetailsElement>('mais-metricas').open).toBe(true)
    await waitFor(() =>
      expect(
        within(screen.getByTestId('metrica-O17')).getByRole('heading', { level: 3 }),
      ).toHaveFocus(),
    )
    a.unmount()
    const b = renderizarApp('/tatico')
    const leia9 = await screen.findByTestId('leia-junto-t9')
    await u.click(within(leia9).getByRole('link', { name: /E5 .*painel Estratégico/ }))
    expect(await screen.findByTestId('metrica-E5')).toBeInTheDocument()
    expect(b.roteador.state.location.pathname).toBe('/estrategico')
  })

  it('o link para outro painel some quando o destino está oculto lá', async () => {
    window.localStorage.setItem(
      'metricas-dspd:preferencias:v1',
      JSON.stringify({
        versao: 1,
        paineis: { sustentacao: { ocultar: ['o17'] } },
        atualizadoEm: '2026-10-10T00:00:00.000Z',
      }),
    )
    renderizarApp('/operacional?cadencia=semanal')
    const leia = await screen.findByTestId('leia-junto-o15')
    expect(within(leia).queryByRole('link', { name: /O17/ })).not.toBeInTheDocument()
    expect(within(leia).getAllByRole('link')).toHaveLength(2)
  })
})
