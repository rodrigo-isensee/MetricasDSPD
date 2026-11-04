import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Page } from '@playwright/test'
import { test, expect, rodarAxe } from '../fixtures/base'

// QA do aviso de registro de horas incompleto (pedido 063, E2.6, K-200): CA-4 (a dica abre ao ativar o selo, não ao
// receber foco; Esc fecha), CA-9 (375 px sem rolagem horizontal, alvo de 44 px) e acessibilidade da faixa. Só mock:
// a rota GET /api/apontamento é interceptada e a fixture ganha `registroIncompleto`; nada toca BusinessMap, banco ou .env.
const ABA = '/operacional/apontamento'
const PACOTE = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../fixtures/apontamento-respostas.json', import.meta.url)),
    'utf8',
  ),
) as { base: { distribuicao: { porProjeto: { id: string; rotulo: string }[] } } & Record<string, unknown> }

// o servidor corta o título em 200 caracteres (MAX_ROTULO); o teste usa o máximo, com um trecho sem espaço no fim
const TITULO_LONGO = ('Cartão com título muito longo '.repeat(4) + 'ConsultaSemEspacoAlgumNoFinalDoTituloParaTestarQuebraDeLinha'.repeat(2)).slice(0, 200)

function resposta(incompleto: boolean) {
  const r = structuredClone(PACOTE.base)
  const projeto = r.distribuicao.porProjeto[0]!
  if (incompleto)
    (r as Record<string, unknown>)['registroIncompleto'] = {
      total: 2,
      cards: [
        {
          cardId: '9100000001',
          titulo: TITULO_LONGO,
          projeto: { id: projeto.id, rotulo: projeto.rotulo, foraDoEscopo: false },
        },
        {
          cardId: '9100000002',
          titulo: 'Outro card',
          projeto: { id: 'sem-projeto', rotulo: 'Sem iniciativa', foraDoEscopo: true },
        },
      ],
      projetoIds: [projeto.id, 'sem-projeto'],
    }
  return r
}

async function abrir(page: Page, incompleto = true) {
  await page.route(/\/api\/apontamento\?/, (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(resposta(incompleto)) }),
  )
  await page.goto(ABA)
  await expect(page.getByRole('heading', { level: 1, name: 'Apontamento' })).toBeVisible()
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
}

test.describe('063: aviso de registro incompleto, 375 px (CA-9)', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('faixa e lista abertas com título longo: sem rolagem horizontal e botão com 44 px', async ({ page }) => {
    await abrir(page)
    const faixa = page.getByTestId('aviso-registro-incompleto')
    await expect(faixa).toBeVisible()
    const botao = faixa.getByRole('button', { name: 'Ver quais cards' })
    const caixa = (await botao.boundingBox())!
    expect(caixa.height).toBeGreaterThanOrEqual(44)
    await botao.click()
    await expect(page.getByTestId('lista-cards-incompletos')).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    const f = (await faixa.boundingBox())!
    expect(f.x).toBeGreaterThanOrEqual(0)
    expect(f.x + f.width).toBeLessThanOrEqual(375)
    const estourou = await page
      .getByTestId('lista-cards-incompletos')
      .evaluate((el) => el.scrollWidth > el.clientWidth + 1)
    expect(estourou).toBe(false)
  })

  test('o selo no projeto não faz a página rolar na horizontal', async ({ page }) => {
    await abrir(page)
    await expect(page.getByTestId('selos-projeto-incompleto')).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
  })
})

test.describe('063: dica do selo (CA-4)', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('foco simples não abre; Enter abre; Esc fecha e o foco fica no selo', async ({ page }) => {
    await abrir(page)
    const selo = page.getByTestId('selos-projeto-incompleto').getByRole('button', { name: /Horas incompletas/ })
    await selo.focus()
    await expect(selo).toBeFocused()
    await expect(page.getByText(/Há card deste projeto com registro de horas incompleto/)).toHaveCount(0)
    await page.keyboard.press('Enter')
    await expect(page.getByText(/Há card deste projeto com registro de horas incompleto/)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText(/Há card deste projeto com registro de horas incompleto/)).toHaveCount(0)
    await expect(selo).toBeFocused()
  })

  test('Espaço também abre a dica', async ({ page }) => {
    await abrir(page)
    const selo = page.getByTestId('selos-projeto-incompleto').getByRole('button', { name: /Horas incompletas/ })
    await selo.focus()
    await page.keyboard.press('Space')
    await expect(page.getByText(/Há card deste projeto com registro de horas incompleto/)).toBeVisible()
  })
})

test.describe('063: acessibilidade e persistência', () => {
  for (const largura of [1280, 375]) {
    test(`axe com a faixa e a lista abertas, ${largura} px: sem violação crítica ou séria`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 900 })
      await abrir(page)
      await page.getByRole('button', { name: 'Ver quais cards' }).click()
      const { bloqueantes } = await rodarAxe(page)
      expect(bloqueantes).toEqual([])
    })
  }

  test('CA-6: sem o sinal na resposta seguinte não há faixa, selo nem nota, e nada fica no navegador', async ({ page }) => {
    await abrir(page)
    await expect(page.getByTestId('aviso-registro-incompleto')).toBeVisible()
    const guardado = await page.evaluate(() =>
      Object.entries(localStorage).concat(Object.entries(sessionStorage)).map(([k, v]) => `${k}=${v}`).join('\n'),
    )
    expect(guardado).not.toMatch(/incomplet|9100000001/i)
    await page.unroute(/\/api\/apontamento\?/)
    await page.route(/\/api\/apontamento\?/, (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify(resposta(false)) }),
    )
    await page.reload()
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
    await expect(page.getByTestId('aviso-registro-incompleto')).toHaveCount(0)
    await expect(page.getByTestId('selos-projeto-incompleto')).toHaveCount(0)
    await expect(page.getByTestId('nota-kpis-incompleto')).toHaveCount(0)
  })
})
