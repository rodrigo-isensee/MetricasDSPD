import { test, expect, rodarAxe } from '../fixtures/base'
import type { Page } from '@playwright/test'

// QA metricas-complementares: seção "Mais métricas deste painel", Leia junto, catálogo (45), preferências, axe AA a 375 e 1280.
const CHAVE = 'metricas-dspd:preferencias:v1'

// Só estes cartões têm `status` 'mock' no contrato (falta fonte real): só eles trazem o selo "Dados fictícios".
const MOCK = new Set(['O17', 'T8', 'E4', 'S8', 'S11', 'S12'])

const PAINEIS = [
  { rota: '/operacional?cadencia=semanal', n: 7, ids: ['O5', 'O6', 'O8', 'O11', 'O13', 'O14', 'O16'] },
  { rota: '/tatico', n: 2, ids: ['T6', 'T8'] },
  { rota: '/estrategico', n: 2, ids: ['E4', 'E5'] },
  { rota: '/sustentacao', n: 6, ids: ['O17', 'S8', 'S9', 'S10', 'S11', 'S12'] },
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
      test(`COMP-01 ${p.rota}: recolhida, abre com ${p.n} cartões (selo fictício só onde status é mock), axe AA`, async ({ page, painel, problemas }) => {
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
          if (MOCK.has(id)) await expect(c.getByTestId('selo-ficticio')).toHaveText('Dados fictícios')
          else await expect(c.getByTestId('selo-ficticio')).toHaveCount(0)
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
      await expect(page.getByTestId('contador-sustentacao')).toContainText('6 de 6 complementares')
      await expect(page.getByTestId('contador-operacional')).toContainText('7 de 7 complementares')
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

  test('COMP-05b "Leia junto" do O3 lista O5, O6 e O8 e o caminho O3 para O5 abre o cartão', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=semanal')
    await painel.esperarCartoesProntos()
    const leia = page.getByTestId('leia-junto-o3')
    for (const c of ['O5', 'O6', 'O8']) await expect(leia.getByRole('link', { name: new RegExp(c) })).toBeVisible()
    await leia.getByRole('link', { name: /O5/ }).click()
    const cartao = page.getByTestId('metrica-O5')
    await expect(cartao).toBeVisible()
    await expect(cartao.getByRole('heading', { name: 'Eficiência de fluxo' })).toBeFocused()
  })

  test('COMP-12 catálogo: O17 está na Sustentação (Acelerato) e só os 6 de status mock são "Fictícios"', async ({ page }) => {
    await page.goto('/metricas')
    await expect(page.getByRole('row', { name: /^O17 .*Sustentação.*Acelerato/ })).toContainText('Fictícios')
    await expect(page.getByRole('row', { name: /^O5 / })).toContainText('Da coleta')
    await expect(page.getByRole('cell', { name: 'Fictícios', exact: true })).toHaveCount(6)
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
    await expect(page.getByText(/· 6 complementares/)).toBeVisible()
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

  test('COMP-12 S8: reincidência pelo mês de abertura; cobertura "n de N" só quando n < N', async ({ page, painel }) => {
    await painel.ir('/sustentacao')
    await painel.esperarCartoesProntos()
    const c = page.getByTestId('metrica-S8')
    await expect(c).toContainText('incidentes abertos')
    const aviso = c.getByTestId('cobertura-S8')
    if ((await aviso.count()) > 0) {
      const t = (await aviso.textContent()) ?? ''
      const m = /(\d+) de (\d+) chamados/.exec(t.replace(/\./g, ''))
      expect(m).not.toBeNull()
      const nums = [Number(m![1]), Number(m![2])]
      expect(Math.min(...nums)).toBeLessThan(Math.max(...nums))
    } else {
      await expect(c).not.toContainText('Campo preenchido em')
    }
  })
})
