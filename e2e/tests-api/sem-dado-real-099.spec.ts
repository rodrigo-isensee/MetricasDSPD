import type { Page } from '@playwright/test'
import { test, expect } from '../fixtures/base'
import { ROTAS } from '../fixtures/constantes'
import { completarReferencia } from '../fixtures/referencia-completa'

// G3 da ADR 0030 (D6), pedido 099 (K-275): substitui o `simulado-070-l3.spec.ts` (que exigia o selo "Simulado").
// Roda contra a SPA em VITE_FONTE=api. A API responde `sem-dado-real` para TODA métrica (a rota abaixo troca a resposta de
// /metricas/:id; o resto do stub `server/tests/pg/api-stub-065.ts` fica como está, sem banco). Falha quando um cartão do painel
// mostra número, selo, faixa ou marca d'água "Simulado", ou quando o navegador baixa o chunk do mock ou o Worker (ADR 0030, G1/G3).

const MOTIVO = 'motivo de teste da guarda G3'

async function apiSemNenhumDadoReal(page: Page) {
  await page.route(/\/api\/v1\/metricas\/[A-Za-z0-9_]+(\?.*)?$/, async (route) => {
    const id = /\/metricas\/([A-Za-z0-9_]+)/.exec(route.request().url())![1]!
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'x-estado-dado': 'sem-dado-real' },
      body: JSON.stringify({ estado: 'sem-dado-real', metrica: id, motivo: MOTIVO }),
    })
  })
}

/** Chunk do mock (`nucleoMock*`, `mock-*`) ou Worker: nada disso pode ser baixado com a fonte `api`. */
function vigiarMock(page: Page): string[] {
  const baixados: string[] = []
  page.on('request', (r) => {
    if (/\/assets\/(nucleoMock|mock-)[^/]*$/.test(new URL(r.url()).pathname)) baixados.push(r.url())
  })
  page.on('worker', (w) => baixados.push(`worker: ${w.url()}`))
  return baixados
}

async function abrirMaisMetricas(page: Page) {
  for (const det of await page.getByTestId('mais-metricas').all())
    if ((await det.getAttribute('open')) === null) await det.locator('summary').click()
}

const PAINEIS_COM_CARTOES = [
  ['Operacional (diária)', ROTAS.operacional],
  ['Operacional (semanal)', ROTAS.operacionalSemanal],
  ['Sustentação', ROTAS.sustentacao],
  ['Tático', ROTAS.tatico],
  ['Estratégico', ROTAS.estrategico],
] as const

test.beforeEach(async ({ page }) => {
  await completarReferencia(page)
  await apiSemNenhumDadoReal(page)
})

test.describe('099 G3: com a API sem dado real, nenhum número, selo ou simulado', () => {
  for (const [nome, rota] of PAINEIS_COM_CARTOES) {
    test(`${nome}: todo cartão mostra "Sem dado real" e o motivo, sem número, selo, faixa nem marca "Simulado"`, async ({ painel, page }) => {
      await painel.ir(rota)
      await painel.esperarPronto()
      await abrirMaisMetricas(page)
      await painel.esperarPronto()
      const cartoes = page.locator('[data-testid^="metrica-"]')
      // guarda contra painel vazio: o menor painel (Estratégico) tem 4 cartões sem abrir "Mais métricas"
      expect(await cartoes.count()).toBeGreaterThanOrEqual(3)
      for (const cartao of await cartoes.all()) {
        const codigo = (await cartao.getAttribute('data-testid'))!.replace(/^metrica-/, '')
        await expect(cartao, `${codigo}: estado`).toHaveAttribute('data-estado', 'sem-dado-real')
        const bloco = cartao.getByTestId(`estado-sem-dado-real-${codigo}`)
        await expect(bloco, `${codigo}: "Sem dado real"`).toContainText('Sem dado real')
        await expect(cartao.getByTestId(`motivo-sem-dado-real-${codigo}`)).toContainText(MOTIVO)
        // nenhum número: o cartão não traz leitura, base, gráfico nem tabela; só o bloco do estado
        for (const parte of [`leitura-${codigo}`, `base-${codigo}`]) await expect(cartao.getByTestId(parte), `${codigo}: ${parte}`).toHaveCount(0)
        await expect(cartao.locator('table, svg[role="img"], canvas'), `${codigo}: gráfico ou tabela`).toHaveCount(0)
        await expect(cartao.locator('[data-testid*="simulado"]'), `${codigo}: selo, faixa ou marca`).toHaveCount(0)
      }
      await expect(page.locator('[data-testid*="simulado"]')).toHaveCount(0)
      await expect(page.getByRole('main').getByText(/Simulado|Dados de exemplo/)).toHaveCount(0)
    })
  }

  test('Resumo: as duas tendências mostram "Sem dado real", sem selo nem a palavra "Simulado"', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacionalResumo)
    await painel.esperarPronto()
    for (const id of ['tendencia-fluxo', 'tendencia-sustentacao']) {
      const bloco = page.getByTestId(`${id}-sem-dado-real`)
      await bloco.scrollIntoViewIfNeeded()
      await expect(bloco).toContainText('Sem dado real')
    }
    await expect(page.locator('[data-testid*="simulado"]')).toHaveCount(0)
    await expect(page.getByRole('main').getByText(/Simulado|Dados de exemplo/)).toHaveCount(0)
  })

  // Hoje passa: depois do L1 o `App.tsx` não instancia o mock com a fonte `api`, então o navegador não o baixa (o chunk ainda existe no `dist`,
  // o que a G1 pega no build e o L2d resolve). A guarda existe para a volta: religar o simulador faz este teste e os de cartão falharem.
  test('o navegador não baixa o chunk do mock nem o Worker', async ({ painel, page }) => {
    const baixados = vigiarMock(page)
    for (const [, rota] of PAINEIS_COM_CARTOES) {
      await painel.ir(rota)
      await painel.esperarPronto()
      await abrirMaisMetricas(page)
    }
    await page.waitForLoadState('networkidle')
    expect(baixados, 'o mock não pode ser baixado com VITE_FONTE=api').toEqual([])
  })
})
