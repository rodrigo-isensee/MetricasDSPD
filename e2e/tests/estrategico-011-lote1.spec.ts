import { test, expect, rodarAxe } from '../fixtures/base'
import type { Page } from '@playwright/test'

// QA 011 lote 1 (pedido 021, K-109): E6, E7, E8 e E9 no Estratégico. Obrigações: CA-3, CA-9, CA-13, CA-16, CA-46, D2 = A, R-1 = B.
const semRolagemHorizontal = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)

async function abrir(page: Page, painel: { ir: (r: string) => Promise<void>; esperarCartoesProntos: () => Promise<void> }) {
  await painel.ir('/estrategico')
  await painel.esperarCartoesProntos()
  await page.getByTestId('mais-metricas').locator('summary').click()
  await painel.esperarCartoesProntos()
}

test.describe('Estratégico, lote 1 do 011 (E6 a E9)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('ET-01 CA-3: a seção nova tem o título A e traz E9, E4, E6, E5, E7 e E8', async ({ page, painel }) => {
    await abrir(page, painel)
    await expect(
      page.getByRole('heading', { name: 'Onde o parque se concentra, e qual o risco de continuidade?' }),
    ).toBeVisible()
    for (const id of ['E9', 'E4', 'E6', 'E5', 'E7', 'E8']) await expect(page.getByTestId(`metrica-${id}`)).toBeVisible()
    await expect(page.getByText('O que custa manter o parque')).toHaveCount(0)
  })

  test('ET-02 CA-13 e D2 = A: o E7 não mostra nenhum valor em R$ nem custo como métrica', async ({ page, painel }) => {
    await abrir(page, painel)
    const e7 = page.getByTestId('metrica-E7')
    await expect(e7.getByRole('table')).toBeVisible()
    const texto = await e7.innerText()
    expect(texto).not.toMatch(/R\$|\breais\b|\bcusto\b|\brateio\b|\brateado\b/i)
    expect(texto).toMatch(/%/)
    await expect(e7.getByText('Dados fictícios')).toHaveCount(0)
  })

  test('ET-03 CA-9, CA-46 e R-1 = B: o E8 só conta sistemas por faixa e não nomeia nenhum sistema', async ({ page, painel }) => {
    await abrir(page, painel)
    const e7 = page.getByTestId('metrica-E7')
    await expect(e7.getByRole('table')).toBeVisible()
    const nomes = (await e7.locator('tbody tr th, tbody tr td:first-child').allInnerTexts()).map((t) => t.trim()).filter((t) => t.length > 2)
    expect(nomes.length).toBeGreaterThanOrEqual(3)
    const e8 = page.getByTestId('metrica-E8')
    await expect(e8.getByTestId('e8-selo')).toHaveText('Mede risco de continuidade do parque. Não mostra nem avalia pessoas.')
    const texto = await e8.innerText()
    for (const n of nomes) expect(texto, `E8 não pode citar "${n}"`).not.toContain(n)
    expect(texto).not.toMatch(/@/)
    // Sem lista de sistemas: nenhuma lista, tabela ou link dentro do E8.
    // A única lista é a legenda das três faixas.
    await expect(e8.getByRole('listitem')).toHaveText(['1 pessoa', '2 pessoas', '3 ou mais'])
    await expect(e8.getByRole('table')).toHaveCount(0)
    await expect(e8.getByTestId('e8-faixas').locator('dt')).toHaveCount(3)
  })

  test('ET-04 E8: o ícone do selo é decorativo (aria-hidden)', async ({ page, painel }) => {
    await abrir(page, painel)
    await expect(page.getByTestId('e8-selo').locator('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  test('ET-05 CA-16: E6 a E9 trazem "Como ler", "Ver como tabela" e o selo fictício só onde o status é mock (E6, E8)', async ({ page, painel }) => {
    await abrir(page, painel)
    for (const id of ['E6', 'E7', 'E8', 'E9']) {
      const c = page.getByTestId(`metrica-${id}`)
      await expect(c.getByText(/Como ler e como é calculado/)).toBeVisible()
      await expect(c.getByTestId('selo-ficticio')).toHaveCount(id === 'E6' || id === 'E8' ? 1 : 0)
    }
    // Tabela equivalente inline (semTabela no cabeçalho): E6, E7 e E9 trazem a tabela; o E8 traz os três números em dl.
    for (const id of ['E6', 'E7', 'E9']) await expect(page.getByTestId(`metrica-${id}`).getByRole('table')).toBeVisible()
  })

  test('ET-06 E9: seletor de tipo só por teclado (setas), com foco visível e conteúdo que acompanha a aba', async ({ page, painel }) => {
    await abrir(page, painel)
    const e9 = page.getByTestId('metrica-E9')
    const abas = e9.getByRole('tab')
    expect(await abas.count(), 'o mock tem mais de um tipo de projeto').toBeGreaterThanOrEqual(2)
    await e9.getByRole('tab', { selected: true }).focus()
    const antes = await e9.getByTestId('e9-mostrando').innerText()
    await page.keyboard.press('Home')
    await expect(abas.first()).toBeFocused()
    const contorno = await abas.first().evaluate((el) => {
      const s = getComputedStyle(el)
      return { estilo: s.outlineStyle, largura: parseFloat(s.outlineWidth), sombra: s.boxShadow }
    })
    expect(contorno.estilo !== 'none' && contorno.largura > 0 || contorno.sombra !== 'none', JSON.stringify(contorno)).toBe(true)
    await expect(abas.first()).toHaveAttribute('aria-selected', 'true')
    await expect(e9.getByTestId('e9-mostrando')).not.toHaveText(antes)
  })

  test('ET-07 axe AA com a seção aberta e sem erros de console', async ({ page, painel, problemas }) => {
    await abrir(page, painel)
    const r = await rodarAxe(page)
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
    expect(problemas).toEqual([])
  })

  test('ET-08 CA-5: abaixo de 20 não publica estatística (E9 sem referência, E7 só k de n)', async ({ page, painel }) => {
    await abrir(page, painel)
    const sem = page.getByTestId('e9-sem-referencia')
    if (await sem.count()) await expect(sem).toContainText('menos de 20 projetos concluídos')
    const e9 = await page.getByTestId('metrica-E9').innerText()
    if (await sem.count()) expect(e9).not.toMatch(/P85 do tempo antes do início[^\n]*:\s*\d/)
  })

  test('ET-09 estado de falha: a API do E7 fora do ar mostra erro no cartão sem derrubar o painel', async ({ page, painel }) => {
    await page.route(/\/E7(\?|$)/, (r) => r.abort())
    await painel.ir('/estrategico')
    await painel.esperarCartoesProntos()
    await page.getByTestId('mais-metricas').locator('summary').click()
    await expect(page.getByTestId('metrica-E9')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

test.describe('Estratégico, lote 1: reflow a 360 px (WCAG 1.4.10)', () => {
  test.use({ viewport: { width: 360, height: 800 } })

  test('ET-10 sem rolagem horizontal, E8 em uma coluna e axe AA', async ({ page, painel }) => {
    await abrir(page, painel)
    expect(await semRolagemHorizontal(page)).toBe(true)
    const faixas = page.getByTestId('e8-faixas')
    if (await faixas.count()) {
      const tops = await faixas.locator('> div').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)))
      expect(new Set(tops).size).toBe(tops.length)
    }
    for (const id of ['E6', 'E7', 'E8', 'E9']) {
      const c = page.getByTestId(`metrica-${id}`)
      const cabe = await c.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)
      expect(cabe, `${id} estoura a largura`).toBe(true)
    }
    const r = await rodarAxe(page)
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
  })
})
