import { test, expect, rodarAxe } from '../fixtures/base'
import type { Page } from '@playwright/test'

// QA metricas-complementares: seção "Mais métricas deste painel", Leia junto, catálogo (45), preferências, axe AA a 375 e 1280.
const CHAVE = 'metricas-dspd:preferencias:v1'

const PAINEIS = [
  { rota: '/operacional?cadencia=semanal', n: 8, ids: ['O5', 'O6', 'O8', 'O11', 'O13', 'O14', 'O16', 'O17'] },
  { rota: '/tatico', n: 2, ids: ['T6', 'T8'] },
  { rota: '/estrategico', n: 2, ids: ['E4', 'E5'] },
  { rota: '/sustentacao', n: 5, ids: ['S8', 'S9', 'S10', 'S11', 'S12'] },
] as const

const TELAS = [
  { nome: '1280', width: 1280, height: 800 },
  { nome: '375', width: 375, height: 812 },
] as const

const semRolagemHorizontal = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)

async function guardar(page: Page, ocultos: Record<string, string[]>) {
  await page.addInitScript(
    ([chave, o]) =>
      localStorage.setItem(
        chave,
        JSON.stringify({
          versao: 1,
          paineis: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { ocultar: v }])),
          atualizadoEm: '2026-10-10T00:00:00.000Z',
        }),
      ),
    [CHAVE, ocultos] as const,
  )
}

for (const tela of TELAS) {
  test.describe(`complementares a ${tela.nome} px`, () => {
    test.use({ viewport: { width: tela.width, height: tela.height } })

    for (const p of PAINEIS) {
      test(`COMP-01 ${p.rota}: recolhida, abre com ${p.n} cartões fictícios, axe AA`, async ({ page, painel, problemas }) => {
        await painel.ir(p.rota)
        await painel.esperarCartoesProntos()
        const det = page.getByTestId('mais-metricas')
        await expect(det.getByText(new RegExp(`Mais métricas deste painel · ${p.n} complementares`))).toBeVisible()
        await expect(det).not.toHaveAttribute('open', '')
        for (const id of p.ids) await expect(page.getByTestId(`metrica-${id}`)).toHaveCount(0)
        await det.locator('summary').click()
        for (const id of p.ids) {
          const c = page.getByTestId(`metrica-${id}`)
          await expect(c).toHaveAttribute('data-estado', /^(ok|vazio|insuficiente)$/)
          await expect(c.getByTestId('selo-ficticio')).toHaveText('Dados fictícios')
        }
        await painel.esperarCartoesProntos()
        const r = await rodarAxe(page)
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
        expect(await semRolagemHorizontal(page)).toBe(true)
        expect(problemas).toEqual([])
      })
    }

    test('COMP-02 teclado: summary abre com Enter e fecha com Espaço', async ({ page, painel }) => {
      await painel.ir('/estrategico')
      const resumo = page.getByTestId('mais-metricas').locator('summary')
      await resumo.focus()
      await page.keyboard.press('Enter')
      await expect(page.getByTestId('metrica-E4')).toBeVisible()
      await page.keyboard.press('Space')
      await expect(page.getByTestId('metrica-E4')).toHaveCount(0)
    })

    test('COMP-03 catálogo: 45 métricas, grupo Complementar tem 17, axe AA', async ({ page }) => {
      await page.goto('/metricas')
      await expect(page.getByRole('heading', { level: 1, name: 'Catálogo de métricas' })).toBeVisible()
      const contagem = page.getByTestId('contagem-catalogo')
      await expect(contagem).toHaveText('45 de 45 métricas')
      await page.getByRole('combobox', { name: 'Grupo' }).selectOption('Complementar')
      await expect(contagem).toHaveText('17 de 45 métricas')
      await page.getByRole('combobox', { name: 'Grupo' }).selectOption('Núcleo')
      await expect(contagem).toHaveText('28 de 45 métricas')
      await page.getByRole('combobox', { name: 'Grupo' }).selectOption('Complementar')
      const r = await rodarAxe(page)
      expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
      expect(await semRolagemHorizontal(page)).toBe(true)
    })

    test('COMP-04 preferências: grupo Complementares por painel, axe AA', async ({ page }) => {
      await page.goto('/preferencias')
      await expect(page.getByRole('heading', { level: 1, name: 'Preferências de métricas' })).toBeVisible()
      await expect(page.getByTestId('contador-sustentacao')).toContainText('(+5)')
      await expect(page.getByTestId('contador-operacional')).toContainText('(+8)')
      await expect(page.getByTestId('grupo-sustentacao').getByRole('group', { name: 'Complementares' })).toBeVisible()
      const r = await rodarAxe(page)
      expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
      expect(await semRolagemHorizontal(page)).toBe(true)
    })
  })
}

test.describe('complementares: fluxos a 1280 px', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('COMP-05 "Leia junto" no núcleo abre a seção e leva o foco ao cartão', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=semanal')
    await painel.esperarCartoesProntos()
    const leia = page.getByTestId('leia-junto-o3')
    await expect(leia).toContainText('Leia junto:')
    await leia.getByRole('link', { name: /O6/ }).click()
    const cartao = page.getByTestId('metrica-O6')
    await expect(cartao).toBeVisible()
    await expect(cartao.getByRole('heading', { name: 'Previsibilidade' })).toBeFocused()
  })

  test('COMP-06 link direto #s9 abre a seção no cartão', async ({ page }) => {
    await page.goto('/sustentacao#s9')
    await expect(page.getByTestId('metrica-S9')).toBeVisible()
    await expect(page.getByTestId('mais-metricas')).toHaveAttribute('open', '')
  })

  for (const p of PAINEIS) {
    test(`COMP-07 ${p.rota}: complementares fora de "Pede atenção"`, async ({ page, painel }) => {
      await painel.ir(p.rota)
      await painel.esperarCartoesProntos()
      await page.getByTestId('mais-metricas').locator('summary').click()
      await painel.esperarCartoesProntos()
      const faixa = page.getByTestId('faixa-atencao')
      if (await faixa.count()) for (const id of p.ids) await expect(faixa).not.toContainText(new RegExp(`\\b${id}\\b`))
    })
  }

  test('COMP-08 Visão geral não tem complementares nem seção', async ({ page, painel }) => {
    await painel.ir('/')
    await expect(page.getByTestId('mais-metricas')).toHaveCount(0)
    await expect(page.locator('[data-testid^="metrica-"]')).toHaveCount(0)
  })

  test('COMP-09 ocultar complementar reduz a contagem e remove o Leia junto', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=semanal')
    await page.getByTestId('mais-metricas').locator('summary').click()
    await page.getByTestId('metrica-O6').getByRole('button', { name: 'Ocultar esta métrica O6' }).click()
    await expect(page.getByText(/· 7 complementares/)).toBeVisible()
    await expect(page.getByTestId('leia-junto-o3').getByRole('link', { name: /O6/ })).toHaveCount(0)
  })

  test('COMP-10 tudo oculto: a seção some', async ({ page, painel }) => {
    await guardar(page, { tatico: ['t6', 't8'] })
    await painel.ir('/tatico')
    await painel.esperarCartoesProntos()
    await expect(page.getByTestId('mais-metricas')).toHaveCount(0)
  })

  test('COMP-11 "Restaurar padrão" volta tudo e abre a seção no painel', async ({ page, painel }) => {
    await guardar(page, { tatico: ['t6'], estrategico: ['e4', 'e5'] })
    await page.goto('/preferencias')
    await page.getByRole('button', { name: 'Restaurar padrão' }).click()
    await page.getByRole('dialog', { name: 'Restaurar o padrão?' }).getByRole('button', { name: 'Restaurar', exact: true }).click()
    await page.getByRole('link', { name: 'Tático', exact: true }).first().click()
    await expect(painel.h1).toHaveText('Tático')
    await expect(page.getByTestId('mais-metricas')).toHaveAttribute('open', '')
    await expect(page.getByTestId('metrica-T6')).toBeVisible()
    await expect(page.getByTestId('metrica-T8')).toBeVisible()
  })
})
