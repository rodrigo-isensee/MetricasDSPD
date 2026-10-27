import { test, expect, rodarAxe } from '../fixtures/base'
import type { Page } from '@playwright/test'

// QA 026 (lote 3 do 011, front): O19, O20, O21, O22, O24, O25, O26 na seção "Mais métricas deste painel" do /operacional
// e o bloco O23 do O2. Fonte única: BusinessMap. Estados: presença, carregando, vazio, erro, amostra abaixo de 20, axe AA.
const ROTA = '/operacional?cadencia=semanal'
const IDS = ['O19', 'O20', 'O21', 'O22', 'O24', 'O25', 'O26'] as const

async function abrir(page: Page, rota: string, mock?: string) {
  const url = new URL(rota, 'http://x')
  if (mock) url.searchParams.set('mock', mock)
  await page.goto(url.pathname + url.search)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByTestId('aguardando-coleta')).toHaveCount(0)
  const mais = page.getByTestId('mais-metricas')
  await expect(mais).toBeVisible()
  if (!(await mais.evaluate((e) => (e as HTMLDetailsElement).open))) await mais.locator('summary').click()
}

test.describe('L3-01 presença e acessibilidade', () => {
  for (const largura of [1280, 375]) {
    test(`L3-01 os 7 cartões e o bloco O23 aparecem e passam no axe AA a ${largura} px`, async ({ page, painel, problemas }) => {
      await page.setViewportSize({ width: largura, height: 812 })
      await abrir(page, ROTA)
      await painel.esperarCartoesProntos()
      for (const id of IDS) {
        const c = page.getByTestId(`metrica-${id}`)
        await expect(c, id).toBeVisible()
        await expect(c, id).toHaveAttribute('data-estado', /^(ok|vazio|insuficiente)$/)
      }
      const r = await rodarAxe(page)
      expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
      expect(problemas).toEqual([])
    })
  }
})

test('L3-01b O23 é bloco do O2 na visão diária (não é cartão), com destaque textual e axe AA', async ({ page, painel }) => {
  await painel.ir('/operacional?cadencia=diaria')
  await painel.esperarCartoesProntos()
  const bloco = page.getByTestId('o23-parados')
  await expect(bloco).toBeVisible()
  await expect(page.getByTestId('metrica-O2').getByTestId('o23-parados')).toHaveCount(1)
  await expect(page.getByTestId('metrica-O23')).toHaveCount(0)
  await expect(page.getByTestId('o23-destaque')).toHaveText(/Nenhum item em andamento|\d+/)
  const r = await rodarAxe(page)
  expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
})

test('L3-02 O22 e O26 não trazem nome de pessoa, ranking nem comparação entre times', async ({ page }) => {
  await abrir(page, ROTA)
  for (const id of ['O22', 'O26'] as const) {
    const c = page.getByTestId(`metrica-${id}`)
    await expect(c).toBeVisible()
    await expect(c, id).toHaveAttribute('data-estado', 'ok')
    const t = await c.innerText()
    expect(t, id).not.toMatch(/ranking|\b(melhor|pior)\b|1º|2º|3º|posição/i)
    expect(t, id).toMatch(id === 'O26' ? /Conta trocas, nunca quem/ : /nunca quem\s+comentou/)
    // nenhuma lista de pessoas: o cartão agrupa por tipo / faixa, nunca por usuário
    await expect(c.getByRole('columnheader', { name: /pessoa|usuário|responsável|nome|equipe|time/i })).toHaveCount(0)
  }
})

test('L3-03 ?mock=carregando: os 7 cartões ficam no esqueleto, sem número nem dado', async ({ page }) => {
  await page.goto(`${ROTA}&mock=carregando`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByTestId('aguardando-coleta')).toHaveCount(0)
  const mais = page.getByTestId('mais-metricas')
  await mais.locator('summary').click()
  for (const id of IDS) {
    await expect(page.getByTestId(`estado-carregando-${id}`), id).toBeVisible()
    await expect(page.getByTestId(`metrica-${id}`), id).toHaveAttribute('aria-busy', 'true')
  }
})

test('L3-04 ?mock=vazio: os 7 cartões mostram o estado vazio, distinto de amostra insuficiente', async ({ page, painel }) => {
  await abrir(page, ROTA, 'vazio')
  for (const id of IDS) {
    const c = painel.cartao(id)
    await c.esperarEstado('vazio')
    await expect(c.raiz, id).toContainText('Nenhum item encontrado')
    await expect(c.raiz, id).not.toContainText(/P50 \d|P85 \d|P95 \d/)
  }
  const r = await rodarAxe(page)
  expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
})

test('L3-05 erro isolado por cartão: falha só nos listados e "Tentar de novo" recupera', async ({ page, painel }) => {
  await abrir(page, ROTA, 'erro-uma-vez:o19,o20,o21,o22,o24,o25,o26')
  for (const id of IDS) {
    const c = painel.cartao(id)
    await expect(c.erro, id).toBeVisible()
    await expect(c.tentarDeNovo, id).toBeVisible()
  }
  await expect(page.getByTestId('metrica-O5')).not.toHaveAttribute('data-estado', 'erro')
  for (const id of IDS) {
    const c = painel.cartao(id)
    await c.tentarDeNovo.click()
    await expect(c.erro, id).toHaveCount(0)
    await expect(c.raiz, id).toHaveAttribute('data-estado', /^(ok|vazio|insuficiente)$/)
  }
})

test('L3-06 erro permanente em O21: continua falhando e não derruba os vizinhos', async ({ page, painel }) => {
  await abrir(page, ROTA, 'erro:o21')
  const o21 = painel.cartao('O21')
  await expect(o21.erro).toBeVisible()
  await o21.tentarDeNovo.click()
  await expect(o21.erro).toBeVisible()
  await expect(painel.cartao('O25').erro).toHaveCount(0)
})

test('L3-07 O23 no O2: erro do O2 não deixa o bloco órfão', async ({ page }) => {
  await page.goto('/operacional?cadencia=diaria&mock=erro:o2')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByTestId('estado-erro-O2')).toBeVisible()
  await expect(page.getByTestId('o23-parados')).toHaveCount(0)
})

test('L3-08 amostra abaixo de 20 (Dívida técnica, Plataforma 5G): O25 e O21 sem percentual nem percentil; O19, O22 e O24 vazios', async ({ page }) => {
  await abrir(page, '/operacional?cadencia=semanal&tipo=divida-tecnica&equipe=plataforma-5g')
  await expect(page.locator('[data-testid^="metrica-"][aria-busy="true"]')).toHaveCount(0)
  const o25 = page.getByTestId('metrica-O25')
  await expect(o25).toContainText(/Amostra insuficiente: \d+ de 20 itens mínimos/)
  await expect(o25).toContainText('percentual não publicado, menos de 20')
  await expect(o25).not.toContainText(/\d%/)
  const o21 = page.getByTestId('metrica-O21')
  await expect(o21).toContainText(/Amostra insuficiente: \d+ de 20 itens mínimos/)
  await expect(o21).not.toContainText(/P50 \d|P85 \d|P95 \d/)
  for (const id of ['O19', 'O22', 'O24'] as const) {
    await expect(page.getByTestId(`metrica-${id}`), id).toHaveAttribute('data-estado', 'vazio')
    await expect(page.getByTestId(`metrica-${id}`), id).not.toContainText(/P50 \d|P85 \d|P95 \d/)
  }
  const r = await rodarAxe(page)
  expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
})
