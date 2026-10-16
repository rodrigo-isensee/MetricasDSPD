import { test, expect } from '../fixtures/base'

// SNO-001 (K-073): a 375 px com fonte a 200% o cabeçalho global não pode estourar a largura da página
// (WCAG 1.4.4 e 1.4.10). Vale para as quatro rotas que a QA mediu.
const ROTAS = ['/', '/tatico', '/operacional?cadencia=semanal', '/operacional?cadencia=sustentacao']

test.describe('SNO-001 cabeçalho com fonte a 200% em 375 px', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  for (const rota of ROTAS) {
    test(`sem rolagem horizontal em ${rota}`, async ({ page, painel }) => {
      await painel.ir(rota)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 30_000 })
      await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
      const medidas = await page.evaluate(() => {
        const cab = document.querySelector('header')!
        return {
          sw: document.documentElement.scrollWidth,
          cw: document.documentElement.clientWidth,
          cabecalho: cab.scrollWidth,
        }
      })
      expect(medidas.cabecalho, 'largura do cabeçalho').toBeLessThanOrEqual(medidas.cw)
      expect(medidas.sw, 'largura da página').toBeLessThanOrEqual(medidas.cw)
      // nada é escondido: Menu, tema e o selo continuam visíveis
      await expect(page.getByTestId('abrir-menu')).toBeVisible()
      await expect(page.getByTestId('seletor-tema')).toBeVisible()
      await expect(page.getByTestId('aviso-dados-ficticios')).toBeVisible()
    })
  }
})
