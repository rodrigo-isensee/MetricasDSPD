import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test, expect, type Browser } from '@playwright/test'
import { ORCAMENTO } from '../fixtures/constantes'
import { PainelPage } from '../pages/PainelPage'
import { instalarObservadores, lerVitais } from './lcp'

// Pedido 048 (K-074), ADR 0003 F2 (CLS < 0,1) e F2m (perfil de referência: rede limitada e CPU 4x, 390x844 e 375x667).
// O trecho medido inclui a ação de "Copiar link" (A4: o aviso não pode deslocar o layout) com uma métrica oculta (marcador
// no lugar, U2). Com o mock o número vale só como alerta (ADR 0003, fonte de dados) e é marcado "mock" no resultado.
const SAIDA = join(process.cwd(), 'perf-results')
const ARQ = join(SAIDA, 'resultado-cls-048.json')
const CHAVE = 'metricas-dspd:preferencias:v1'
const ROTAS = ['/', '/operacional?cadencia=semanal', '/tatico'] as const
const PREFERENCIAS = JSON.stringify({ versao: 1, paineis: { operacional: { ocultar: ['o3'] }, tatico: { ocultar: ['t2'] } }, atualizadoEm: '2026-10-10T00:00:00.000Z' })

function registrar(chave: string, valor: unknown): void {
  mkdirSync(SAIDA, { recursive: true })
  const atual = existsSync(ARQ) ? (JSON.parse(readFileSync(ARQ, 'utf8')) as Record<string, unknown>) : {}
  atual[chave] = valor
  atual.fonte = 'mock'
  writeFileSync(ARQ, JSON.stringify(atual, null, 2))
}

async function medir(browser: Browser, baseURL: string, rota: string, viewport: { width: number; height: number }, limitado: boolean): Promise<number> {
  const contexto = await browser.newContext({
    baseURL,
    viewport,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    serviceWorkers: 'block',
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  try {
    await contexto.addInitScript(([c, p]) => localStorage.setItem(c as string, p as string), [CHAVE, PREFERENCIAS] as const)
    await instalarObservadores(contexto)
    const page = await contexto.newPage()
    if (limitado) {
      // Valores ajustados do Lighthouse (ADR 0003, F2m): latência 562,5 ms, descida 188.744 B/s, subida 86.400 B/s, CPU 4x.
      const cdp = await contexto.newCDPSession(page)
      await cdp.send('Network.enable')
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 562.5, downloadThroughput: 188_744, uploadThroughput: 86_400 })
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    }
    const painel = new PainelPage(page)
    await painel.ir(rota)
    await painel.esperarPronto()
    await page.waitForLoadState('networkidle')
    // Trecho medido inclui o "Copiar link": o aviso entra, fica e sai (5 s) sem refluir a página.
    await page.getByTestId('copiar-link').click()
    await expect(page.getByRole('status').filter({ hasText: 'Link copiado.' })).toBeVisible()
    await expect(page.getByRole('status').filter({ hasText: 'Link copiado.' })).toHaveCount(0, { timeout: 10_000 })
    await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))))
    return (await lerVitais(page)).cls
  } finally {
    await contexto.close()
  }
}

test.describe('cls-048', () => {
  test.describe.configure({ mode: 'serial' })
  for (const rota of ROTAS) {
    test(`F2 CLS (mock) com "Copiar link" a 1366x768 em ${rota}`, async ({ browser, baseURL }) => {
      const cls = await medir(browser, baseURL!, rota, { width: 1366, height: 768 }, false)
      console.log(`[perf-048] F2 mock 1366x768 ${rota}: CLS=${cls.toFixed(3)}`)
      registrar(`F2_1366_${rota}`, cls)
      expect(cls, 'F2 CLS').toBeLessThan(ORCAMENTO.F2_cls)
    })
    for (const vp of [{ width: 375, height: 812 }, { width: 390, height: 844 }, { width: 375, height: 667 }]) {
      test(`F2m CLS (mock) com "Copiar link" a ${vp.width}x${vp.height}, rede limitada, em ${rota}`, async ({ browser, baseURL }) => {
        test.setTimeout(180_000)
        const cls = await medir(browser, baseURL!, rota, vp, true)
        console.log(`[perf-048] F2m mock ${vp.width}x${vp.height} ${rota}: CLS=${cls.toFixed(3)}`)
        registrar(`F2m_${vp.width}x${vp.height}_${rota}`, cls)
        expect(cls, 'F2m CLS').toBeLessThan(ORCAMENTO.F2_cls)
      })
    }
  }
})
