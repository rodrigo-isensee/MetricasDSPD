import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Page } from '@playwright/test'
import { test, expect, rodarAxe } from '../fixtures/base'

// QA do 097 L8b (E4.54): recolher cartão nos painéis, CA-25 a CA-32. Operacional semanal (mock do Worker) e aba Apontamento
// (rota interceptada com a fixture fictícia). Axe AA no cartão recolhido e no Restaurar, nos dois temas.
const CHAVE = 'metricas-dspd:recolhidos:v1'
const PACOTE = JSON.parse(
  readFileSync(fileURLToPath(new URL('../fixtures/apontamento-respostas.json', import.meta.url)), 'utf8'),
) as { base: unknown }
const TEMAS = ['claro', 'escuro'] as const

test.use({ viewport: { width: 1280, height: 900 } })

async function tema(page: Page, t: (typeof TEMAS)[number]) {
  await page.addInitScript((v) => localStorage.setItem('metricas-dspd:tema', v), t)
}
const memoria = (page: Page) => page.evaluate((c) => localStorage.getItem(c), CHAVE)

test.describe('Operacional semanal', () => {
  test('RC-01 recolher e expandir: texto, aria-expanded, foco no botão, resumo, URL e memória só de códigos', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=semanal')
    await painel.esperarPronto()
    const url = page.url()
    const botao = page.getByTestId('recolher-O4')
    await expect(botao).toHaveAttribute('aria-expanded', 'true')
    await botao.focus()
    await page.keyboard.press('Enter')
    await expect(botao).toHaveAttribute('aria-expanded', 'false')
    await expect(botao).toBeFocused()
    await expect(page.getByTestId('resumo-recolhido-O4')).toBeVisible()
    await expect(page.getByTestId('resumo-recolhido-O4')).toContainText(/Recolhido/)
    expect(page.url()).toBe(url)
    expect(JSON.parse((await memoria(page)) ?? 'null')).toEqual({ versao: 1, paineis: { operacional: ['O4'] } })
    await page.keyboard.press('Space')
    await expect(botao).toHaveAttribute('aria-expanded', 'true')
    await expect(botao).toBeFocused()
    await expect(page.getByTestId('resumo-recolhido-O4')).toHaveCount(0)
  })

  test('RC-02 a escolha sobrevive ao recarregar; Restaurar expande tudo, apaga a memória e leva o foco a um título', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=semanal')
    await painel.esperarPronto()
    await expect(page.getByRole('button', { name: 'Restaurar cartões recolhidos' })).toHaveCount(0)
    await page.getByTestId('recolher-O4').click()
    await page.getByTestId('recolher-O3').click()
    await page.reload()
    await painel.esperarPronto()
    await expect(page.getByTestId('recolher-O4')).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByTestId('recolher-O3')).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByTestId('recolher-O9')).toHaveAttribute('aria-expanded', 'true')
    await page.getByRole('button', { name: 'Restaurar cartões recolhidos' }).click()
    await expect(page.getByTestId('recolher-O4')).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByTestId('recolher-O3')).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('button', { name: 'Restaurar cartões recolhidos' })).toHaveCount(0)
    expect(JSON.parse((await memoria(page)) ?? 'null')?.paineis?.operacional ?? []).toEqual([])
    await expect(page.locator(':focus')).toHaveAttribute('tabindex', '-1')
  })

  test('RC-03 memória corrompida não quebra o painel', async ({ page, painel }) => {
    await page.addInitScript((c) => localStorage.setItem(c, '{lixo'), CHAVE)
    await painel.ir('/operacional?cadencia=semanal')
    await painel.esperarPronto()
    await expect(page.getByTestId('recolher-O4')).toHaveAttribute('aria-expanded', 'true')
  })

  for (const t of TEMAS) {
    test(`RC-04 axe AA com cartão recolhido e Restaurar visível (${t})`, async ({ page, painel }) => {
      await tema(page, t)
      await painel.ir('/operacional?cadencia=semanal')
      await painel.esperarPronto()
      await page.getByTestId('recolher-O4').click()
      await expect(page.getByRole('button', { name: 'Restaurar cartões recolhidos' })).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('data-theme', t === 'escuro' ? 'dark' : 'light')
      const r = await rodarAxe(page)
      expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
    })
  }
})

test.describe('Apontamento', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/apontamento\?/, (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(PACOTE.base) }),
    )
  })
  async function abrir(page: Page) {
    await page.goto('/operacional/apontamento')
    await expect(page.getByRole('heading', { level: 1, name: 'Apontamento' })).toBeVisible()
    await expect(page.getByTestId('periodo-dos-dados')).toBeVisible()
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
  }

  test('RC-05 AP-PROJETO recolhe com resumo neutro (total, sem nome de projeto); AP-KPIS não tem botão; memória por painel', async ({ page }) => {
    await abrir(page)
    await expect(page.getByTestId('recolher-AP-KPIS')).toHaveCount(0)
    const botao = page.getByTestId('recolher-AP-PROJETO')
    await botao.click()
    const resumo = page.getByTestId('resumo-recolhido-AP-PROJETO')
    await expect(resumo).toHaveText(/Recolhido\. \d+ projetos?/)
    const nomes = (PACOTE.base as { distribuicao: { porProjeto: { rotulo: string }[] } }).distribuicao.porProjeto.map((p) => p.rotulo)
    for (const n of nomes) expect(await resumo.innerText()).not.toContain(n)
    expect(JSON.parse((await memoria(page)) ?? 'null')).toEqual({ versao: 1, paineis: { apontamento: ['AP-PROJETO'] } })
    await page.reload()
    await expect(page.getByTestId('resumo-recolhido-AP-PROJETO')).toBeVisible()
    await page.getByRole('button', { name: 'Restaurar cartões recolhidos' }).click()
    await expect(page.getByTestId('resumo-recolhido-AP-PROJETO')).toHaveCount(0)
  })

  test('RC-06 o recolhido do Apontamento não vaza para o Operacional (chave por painel)', async ({ page, painel }) => {
    await abrir(page)
    await page.getByTestId('recolher-AP-PROJETO').click()
    await painel.ir('/operacional?cadencia=semanal')
    await painel.esperarPronto()
    await expect(page.getByRole('button', { name: 'Restaurar cartões recolhidos' })).toHaveCount(0)
  })

  for (const t of TEMAS) {
    test(`RC-07 axe AA com AP-PROJETO recolhido e Restaurar (${t})`, async ({ page }) => {
      await tema(page, t)
      await abrir(page)
      await page.getByTestId('recolher-AP-PROJETO').click()
      await expect(page.getByRole('button', { name: 'Restaurar cartões recolhidos' })).toBeVisible()
      const r = await rodarAxe(page)
      expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
    })
  }
})
