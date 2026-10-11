import { test, expect, rodarAxe } from '../fixtures/base'
import type { Page } from '@playwright/test'

// Pedido 007: preferências de métricas. Axe a 375 e 1280, nos dois temas; ocultar/desfazer; alerta de métrica oculta.
const CHAVE = 'metricas-dspd:preferencias:v1'
const TEMAS = ['light', 'dark'] as const
const TELAS = [
  { nome: '1280', width: 1280, height: 800 },
  { nome: '375', width: 375, height: 812 },
] as const

async function preparar(
  page: Page,
  tema: (typeof TEMAS)[number],
  ocultar: Record<string, string[]> = {},
) {
  await page.addInitScript(
    ([t, chave, o]) => {
      localStorage.setItem('metricas-dspd:tema', t === 'dark' ? 'escuro' : 'claro')
      if (Object.keys(o).length)
        localStorage.setItem(
          chave,
          JSON.stringify({
            versao: 1,
            paineis: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { ocultar: v }])),
            atualizadoEm: '2026-10-10T00:00:00.000Z',
          }),
        )
    },
    [tema, CHAVE, ocultar] as const,
  )
}

const semRolagemHorizontal = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)

for (const tela of TELAS) {
  for (const tema of TEMAS) {
    test.describe(`${tela.nome} px, tema ${tema}`, () => {
      test.use({ viewport: { width: tela.width, height: tela.height } })

      test('PREF-01 axe em /preferencias, sem rolagem horizontal', async ({ page }) => {
        await preparar(page, tema)
        await page.goto('/preferencias')
        await expect(
          page.getByRole('heading', { level: 1, name: 'Preferências de métricas' }),
        ).toBeVisible()
        await expect(page.getByTestId('grupo-operacional')).toBeVisible()
        const r = await rodarAxe(page)
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
        expect(await semRolagemHorizontal(page)).toBe(true)
      })

      test('PREF-02 axe no painel com métricas ocultas, faixa e popover abertos', async ({
        page,
      }) => {
        await preparar(page, tema, { operacional: ['o9', 'o10'] })
        await page.goto('/operacional?cadencia=semanal')
        await expect(page.getByTestId('faixa-ocultas')).toContainText('2 métricas ocultas: O9, O10')
        await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
        let r = await rodarAxe(page)
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
        expect(await semRolagemHorizontal(page)).toBe(true)
        await page.getByRole('button', { name: 'Métricas: 10 de 12' }).click()
        const dlg = page.getByRole('dialog', { name: 'Métricas deste painel' })
        await expect(dlg).toBeVisible()
        r = await rodarAxe(page)
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
        expect(await semRolagemHorizontal(page)).toBe(true)
        await page.keyboard.press('Escape')
        await expect(page.getByTestId('botao-metricas')).toBeFocused()
      })

      test('PREF-03 painel com todas as métricas ocultas (estado vazio) passa no axe', async ({
        page,
      }) => {
        await preparar(page, tema)
        await page.goto('/preferencias')
        await page.getByRole('button', { name: 'Aplicar sugestão do papel Gerente' }).click()
        await page.goto('/operacional')
        await expect(page.getByTestId('painel-oculto-vazio')).toBeVisible()
        await expect(page.getByTestId('faixa-atencao')).toBeVisible()
        const r = await rodarAxe(page)
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
      })
    })
  }
}

test.describe('fluxos', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('PREF-10 perfil aplica na hora, anuncia o salvamento e vale no painel', async ({ page }) => {
    await page.goto('/preferencias')
    await page
      .getByTestId('grupo-operacional')
      .getByRole('checkbox', { name: /O9 Os três relógios/ })
      .uncheck()
    await expect(
      page.getByRole('status').filter({ hasText: 'Salvo neste navegador' }),
    ).toBeVisible()
    await expect(page.getByTestId('contador-operacional')).toHaveText('11 de 12 do núcleo e 7 de 7 complementares visíveis')
    await page.goto('/operacional?cadencia=semanal')
    await expect(page.getByTestId('metrica-O3')).toBeVisible()
    await expect(page.getByTestId('metrica-O9')).toHaveCount(0)
    await page.reload()
    await expect(page.getByTestId('metrica-O9')).toHaveCount(0)
  })

  test('PREF-11 ocultar no cartão, desfazer e foco; nada vai para a URL nem para o perfil', async ({
    page,
  }) => {
    await page.goto('/operacional?cadencia=semanal')
    await expect(page.getByTestId('metrica-O3')).toBeVisible()
    await page.getByRole('button', { name: 'Ocultar esta métrica O3' }).click()
    await expect(page.getByTestId('metrica-O3')).toHaveCount(0)
    await expect(page.getByTestId('anuncio-preferencias')).toHaveText(
      'O3 oculta. 11 de 12 métricas visíveis. Desfazer',
    )
    await expect(
      page.getByRole('heading', { level: 3, name: /Os três relógios do pedido/ }),
    ).toBeFocused()
    expect(page.url()).not.toContain('ocultar')
    expect(await page.evaluate((c) => localStorage.getItem(c), CHAVE)).toBeNull()
    await page.getByTestId('aviso-desfazer').getByRole('button', { name: 'Desfazer' }).click()
    await expect(page.getByTestId('metrica-O3').getByRole('heading', { level: 3 })).toBeFocused()
  })

  test('PREF-12 "Copiar link" leva só os filtros, nunca a seleção de métricas', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/operacional?cadencia=semanal')
    await page.getByRole('button', { name: 'Ocultar esta métrica O3' }).click()
    await page.getByRole('button', { name: /Copiar link/ }).click()
    const link = await page.evaluate(() => navigator.clipboard.readText())
    expect(link).toContain('/operacional')
    expect(link.toLowerCase()).not.toContain('ocultar')
  })

  test('PREF-13 alerta de métrica oculta continua em "Pede atenção", com selo e "Mostrar nesta visita"', async ({
    page,
  }) => {
    await page.addInitScript(
      ([chave]) =>
        localStorage.setItem(
          chave as string,
          JSON.stringify({
            versao: 1,
            paineis: { operacional: { ocultar: ['o1', 'o2', 'bloqueados'] } },
            atualizadoEm: '2026-10-10T00:00:00.000Z',
          }),
        ),
      [CHAVE],
    )
    await page.goto('/operacional')
    const faixa = page.getByTestId('faixa-atencao')
    await expect(faixa.getByText('métrica oculta').first()).toBeVisible()
    await faixa
      .getByRole('button', { name: /^Mostrar .+ nesta visita$/ })
      .first()
      .click()
    await expect(page.getByTestId('faixa-ocultas')).toBeVisible()
  })

  test('PREF-14 Visão geral sempre completa e avisa que as preferências valem para os painéis', async ({
    page,
  }) => {
    await page.addInitScript(
      ([chave]) =>
        localStorage.setItem(
          chave as string,
          JSON.stringify({
            versao: 1,
            paineis: { operacional: { ocultar: ['o1', 'o2'] } },
            atualizadoEm: '2026-10-10T00:00:00.000Z',
          }),
        ),
      [CHAVE],
    )
    await page.goto('/')
    await expect(page.getByTestId('preferencias-valem')).toContainText(
      'As preferências de métricas valem para os painéis',
    )
    await expect(page.getByRole('button', { name: /Ocultar esta métrica/ })).toHaveCount(0)
  })

  test('PREF-15 teclado: popover abre por Enter, caixa marca por Espaço, Esc devolve o foco', async ({
    page,
  }) => {
    await page.goto('/operacional')
    await page.getByTestId('botao-metricas').focus()
    await page.keyboard.press('Enter')
    const dlg = page.getByRole('dialog', { name: 'Métricas deste painel' })
    await expect(dlg).toBeVisible()
    await dlg.getByRole('checkbox').first().focus()
    await page.keyboard.press('Space')
    await expect(page.getByTestId('botao-metricas')).toHaveText(/Métricas: 11 de 12/)
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('botao-metricas')).toBeFocused()
  })
})
