import { test, expect, rodarAxe } from '../fixtures/base'
import { ROTAS } from '../fixtures/constantes'
import { completarReferencia } from '../fixtures/referencia-completa'

// QA 070 L3 (E1.6, K-221), desenho docs/analises/070-desenho.md seção 7 (T-E1 a T-E3, mais a medição em navegador do A1 do QA 070-v2).
// Roda contra a SPA em VITE_FONTE=api e a API de teste `server/tests/pg/api-stub-065.ts` (E2E_API_URL=http://127.0.0.1:3199), sem banco:
// o stub responde `sem-dado-real` (com `simulavel` do contrato) para toda métrica fora de METRICAS_ORIGEM_REAL, como o servidor.
// Obrigações: ADR 0028 (simulado por cartão, selo visível), decisão do dono "A" (cartão simulado fora do resumo; resumo só com dado real).

test.beforeEach(async ({ page }) => {
  await completarReferencia(page)
})

async function abrirMaisMetricas(page: import('@playwright/test').Page) {
  const det = page.getByTestId('mais-metricas')
  if ((await det.count()) > 0 && (await det.getAttribute('open')) === null) await det.locator('summary').click()
}

test.describe('070 L3: simulado por cartão (API)', () => {
  test('T-E1 FL1 semanal: O12 (sem dado real, simulável) mostra o selo Simulado e um número; O3 (real) não tem selo', async ({
    painel,
    page,
  }) => {
    await painel.ir(ROTAS.operacionalSemanal)
    await painel.esperarPronto()
    await abrirMaisMetricas(page)
    const o12 = page.getByTestId('metrica-O12')
    await o12.scrollIntoViewIfNeeded()
    await expect(o12.getByTestId('selo-simulado-O12')).toBeVisible()
    await expect(o12.getByTestId('selo-simulado-O12')).toContainText('Simulado')
    await expect(o12.getByTestId('faixa-simulado-O12')).toBeVisible()
    await expect(o12.getByTestId('estado-sem-dado-real-O12')).toHaveCount(0)
    // "um número": o cartão traz algarismos fora do texto do selo, da faixa e do título
    const texto = ((await o12.innerText()) ?? '').replace(/Simulado|O12|12 semanas/g, '')
    expect(texto, 'O12 simulado precisa mostrar número').toMatch(/\d/)
    const o3 = page.getByTestId('metrica-O3')
    await o3.scrollIntoViewIfNeeded()
    await expect(o3).toBeVisible()
    await expect(o3.getByTestId('selo-simulado-O3')).toHaveCount(0)
    await expect(o3.getByTestId('faixa-simulado-O3')).toHaveCount(0)
    await expect(o3.getByText('Simulado', { exact: true })).toHaveCount(0)
  })

  test('T-E2 Sustentação: S1 simulado com selo; S2 real sem selo; EI_SUST com Sem dado real e sem selo', async ({ painel, page }) => {
    await painel.ir(ROTAS.sustentacao)
    await painel.esperarPronto()
    const s1 = page.getByTestId('metrica-S1')
    await s1.scrollIntoViewIfNeeded()
    await expect(s1.getByTestId('selo-simulado-S1')).toBeVisible()
    await expect(s1.getByTestId('faixa-simulado-S1')).toBeVisible()
    const s2 = page.getByTestId('metrica-S2')
    await s2.scrollIntoViewIfNeeded()
    await expect(s2).toBeVisible()
    await expect(s2.getByTestId('selo-simulado-S2')).toHaveCount(0)
    const ei = page.getByTestId('metrica-EI-SUST')
    await ei.scrollIntoViewIfNeeded()
    await expect(ei).toContainText('Sem dado real')
    await expect(ei.locator('[data-testid^="selo-simulado-"]')).toHaveCount(0)
    await expect(ei.locator('[data-testid^="faixa-simulado-"]')).toHaveCount(0)
  })

  test('T-E3 Resumo: TENDENCIA_FLUXO e TENDENCIA_SUST mostram Sem dado real, sem selo e sem número simulado', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacionalResumo)
    // as tendências sem dado real trocam o bloco `tendencia-*` por `tendencia-*-sem-dado-real`: o `esperarPronto({ resumo })` não serve aqui
    await painel.esperarPronto()
    for (const id of ['tendencia-fluxo', 'tendencia-sustentacao']) {
      const bloco = page.getByTestId(`${id}-sem-dado-real`)
      await bloco.scrollIntoViewIfNeeded()
      await expect(bloco).toContainText('Sem dado real')
    }
    // decisão do dono "A": o resumo mostra só dado real, nenhum selo Simulado entra nele
    await expect(page.locator('[data-testid^="selo-simulado-"]')).toHaveCount(0)
    await expect(page.getByRole('main').getByText('Simulado', { exact: true })).toHaveCount(0)
  })

  test('T-E5 O12 simulado: alvo do botão "O que é simulado?" >= 44 px (em 1280 e em 320) e marca d\'água contida em 320', async ({
    painel,
    page,
  }) => {
    for (const largura of [1280, 320]) {
      await page.setViewportSize({ width: largura, height: largura === 320 ? 568 : 800 })
      await painel.ir(ROTAS.operacionalSemanal)
      await painel.esperarPronto()
      await abrirMaisMetricas(page)
      const o12 = page.getByTestId('metrica-O12')
      await o12.scrollIntoViewIfNeeded()
      const botao = o12.getByRole('button', { name: 'O que é simulado?' })
      await expect(botao).toBeVisible()
      const caixa = (await botao.boundingBox())!
      expect(caixa.height, `altura do botão a ${largura} px`).toBeGreaterThanOrEqual(44)
      expect(caixa.width, `largura do botão a ${largura} px`).toBeGreaterThanOrEqual(44)
      // sem rolagem horizontal da página
      const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(sobra, `rolagem horizontal a ${largura} px`).toBeLessThanOrEqual(0)
      if (largura === 320) {
        const marca = o12.getByTestId('marca-dagua-simulado')
        if ((await marca.count()) > 0) {
          await marca.first().scrollIntoViewIfNeeded()
          const m = (await marca.first().boundingBox())!
          const cartao = (await o12.boundingBox())!
          expect(m.x, 'marca d\'água não passa da esquerda do cartão').toBeGreaterThanOrEqual(cartao.x - 1)
          expect(m.x + m.width, 'marca d\'água não passa da direita do cartão').toBeLessThanOrEqual(cartao.x + cartao.width + 1)
          // o texto diagonal fica dentro da caixa da marca (overflow hidden) e esta dentro da viewport
          expect(m.x + m.width).toBeLessThanOrEqual(320 + 1)
        }
      }
    }
  })

  test('T-E6 Sustentação com simulado: zero violações sérias ou críticas do axe', async ({ painel, page }) => {
    await painel.ir(ROTAS.sustentacao)
    await painel.esperarPronto()
    await expect(page.getByTestId('selo-simulado-S1')).toBeVisible()
    const r = await rodarAxe(page)
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
  })
})
