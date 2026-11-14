import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test, expect, rodarAxe } from '../fixtures/base'

// QA do K-299 (097, E4.39): axe no cartão AP-PROJETO nos estados cortado (10 maiores) e "ver todos", nos dois temas.
// Só mock: a rota GET /api/apontamento devolve a fixture com 12 projetos fictícios (um a mais que o corte de 10).
const ABA = '/operacional/apontamento'
const PACOTE = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../fixtures/apontamento-respostas.json', import.meta.url)),
    'utf8',
  ),
) as { base: { distribuicao: { porProjeto: Record<string, unknown>[] } } }

function com12() {
  const r = structuredClone(PACOTE.base)
  const modelo = r.distribuicao.porProjeto[0]!
  r.distribuicao.porProjeto = Array.from({ length: 12 }, (_, i) => ({
    ...modelo,
    id: `p${i}`,
    rotulo: `Iniciativa fictícia ${i + 1}`,
    segundos: (13 - i) * 36000,
  }))
  return r
}

for (const tema of ['claro', 'escuro'] as const) {
  test(`AP-PROJETO com 12 projetos, tema ${tema}: axe nos dois estados e região viva`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: tema === 'escuro' ? 'dark' : 'light' })
    await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t), tema)
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.route(/\/api\/apontamento\?/, (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(com12()) }),
    )
    await page.goto(ABA)
    await expect(page.getByTestId('periodo-dos-dados')).toBeVisible()
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      tema === 'escuro' ? 'dark' : 'light',
    )
    const cartao = page.getByTestId('metrica-AP-PROJETO')
    await cartao.scrollIntoViewIfNeeded()
    await expect(cartao.getByRole('status')).toHaveText(
      /Mostrando os 10 projetos com mais horas, de 12/,
    )
    const cortado = await rodarAxe(page, { incluir: '[data-testid="metrica-AP-PROJETO"]' })
    expect(cortado.bloqueantes, JSON.stringify(cortado.bloqueantes)).toEqual([])
    const botao = cartao.getByRole('button', { name: 'Ver todos os 12 projetos' })
    await botao.click()
    await expect(cartao.getByRole('status')).toHaveText('Mostrando todos os 12 projetos.')
    const volta = cartao.getByRole('button', { name: 'Ver só os 10 maiores' })
    await expect(volta).toBeFocused()
    const todos = await rodarAxe(page, { incluir: '[data-testid="metrica-AP-PROJETO"]' })
    expect(todos.bloqueantes, JSON.stringify(todos.bloqueantes)).toEqual([])
    const pagina = await rodarAxe(page)
    expect(pagina.bloqueantes, JSON.stringify(pagina.bloqueantes)).toEqual([])
  })
}
