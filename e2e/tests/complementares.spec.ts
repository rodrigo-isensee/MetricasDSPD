import { test, expect, rodarAxe } from '../fixtures/base'
import type { Page } from '@playwright/test'

// QA metricas-complementares: seção "Mais métricas deste painel", Leia junto, catálogo (65), preferências, axe AA a 375 e 1280.
const CHAVE = 'metricas-dspd:preferencias:v1'

// Só estes cartões têm `status` 'mock' no contrato (falta fonte real): só eles trazem o selo "Dados fictícios".
const MOCK = new Set(['O17', 'O22', 'O26', 'T8', 'T13', 'T14', 'E4', 'E6', 'E8', 'S8', 'S11', 'S12'])

const PAINEIS = [
  { rota: '/operacional?cadencia=semanal', n: 14, ids: ['O5', 'O6', 'O8', 'O19', 'O22', 'O20', 'O24', 'O21', 'O25', 'O26', 'O11', 'O13', 'O14', 'O16'] },
  { rota: '/tatico', n: 7, ids: ['T6', 'T8', 'T11', 'T12', 'T10', 'T13', 'T14'] },
  { rota: '/estrategico', n: 6, ids: ['E9', 'E4', 'E5', 'E6', 'E7', 'E8'] },
  { rota: '/operacional?cadencia=sustentacao', n: 6, ids: ['O17', 'S8', 'S9', 'S10', 'S11', 'S12'] },
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
        await painel.esperarPronto()
        const det = page.getByTestId('mais-metricas')
        await expect(det.getByText(new RegExp(`Mais métricas (deste painel|desta visão) · ${p.n} complementares`))).toBeVisible()
        await expect(det).not.toHaveAttribute('open', '')
        for (const id of p.ids) await expect(page.getByTestId(`metrica-${id}`)).toHaveCount(0)
        await det.locator('summary').click()
        for (const id of p.ids) {
          const c = page.getByTestId(`metrica-${id}`)
          await expect(c).toHaveAttribute('data-estado', /^(ok|vazio|insuficiente)$/)
          if (MOCK.has(id)) await expect(c.getByTestId('selo-ficticio')).toHaveText('Dados fictícios')
          else await expect(c.getByTestId('selo-ficticio')).toHaveCount(0)
        }
        await painel.esperarPronto()
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

    test('COMP-03 catálogo: 65 métricas (45 do briefing + PV1 + 3 de espera invisível + 4 do 011 estratégico + 5 do 011 tático + 7 do 011 operacional), grupo Complementar tem 33, axe AA', async ({ page }) => {
      await page.goto('/metricas')
      await expect(page.getByRole('heading', { level: 1, name: 'Catálogo de métricas' })).toBeVisible()
      const contagem = page.getByTestId('contagem-catalogo')
      await expect(contagem).toHaveText('65 de 65 métricas')
      await page.getByRole('combobox', { name: 'Grupo' }).selectOption('Complementar')
      await expect(contagem).toHaveText('33 de 65 métricas')
      await page.getByRole('combobox', { name: 'Grupo' }).selectOption('Núcleo')
      await expect(contagem).toHaveText('32 de 65 métricas')
      await page.getByRole('combobox', { name: 'Grupo' }).selectOption('Complementar')
      const r = await rodarAxe(page)
      expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
      expect(await semRolagemHorizontal(page)).toBe(true)
    })

    test('COMP-04 preferências: grupo Complementares por painel, axe AA', async ({ page }) => {
      await page.goto('/preferencias')
      await expect(page.getByRole('heading', { level: 1, name: 'Preferências de métricas' })).toBeVisible()
      await expect(page.getByTestId('contador-sustentacao')).toContainText('6 de 6 complementares')
      await expect(page.getByTestId('contador-operacional')).toContainText('14 de 14 complementares')
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
    await painel.esperarPronto()
    const leia = page.getByTestId('leia-junto-o3')
    await expect(leia).toContainText('Leia junto:')
    await leia.getByRole('link', { name: /O6/ }).click()
    const cartao = page.getByTestId('metrica-O6')
    await expect(cartao).toBeVisible()
    await expect(cartao.getByRole('heading', { name: 'Previsibilidade' })).toBeFocused()
  })

  test('COMP-05b "Leia junto" do O3 lista O5, O6 e O8 e o caminho O3 para O5 abre o cartão', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=semanal')
    await painel.esperarPronto()
    const leia = page.getByTestId('leia-junto-o3')
    for (const c of ['O5', 'O6', 'O8']) await expect(leia.getByRole('link', { name: new RegExp(c) })).toBeVisible()
    await leia.getByRole('link', { name: /O5/ }).click()
    const cartao = page.getByTestId('metrica-O5')
    await expect(cartao).toBeVisible()
    await expect(cartao.getByRole('heading', { name: 'Eficiência de fluxo' })).toBeFocused()
  })

  test('COMP-12 catálogo: O17 está na Sustentação (Acelerato) e a coluna Dados diz "Fictícios" para as 65 (decisão 20)', async ({ page }) => {
    await page.goto('/metricas')
    await expect(page.getByRole('row', { name: /^O17 .*Sustentação.*Acelerato/ })).toContainText('Fictícios')
    await expect(page.getByRole('row', { name: /^O5 / })).toContainText('Fictícios')
    await expect(page.getByRole('row', { name: /^O3 / })).toContainText('Fictícios')
    await expect(page.getByRole('cell', { name: 'Fictícios', exact: true })).toHaveCount(65)
    await expect(page.getByRole('cell', { name: 'Da coleta', exact: true })).toHaveCount(0)
  })

  test('COMP-06 link direto #s9 abre a seção no cartão', async ({ page }) => {
    await page.goto('/operacional?cadencia=sustentacao#s9')
    await expect(page.getByTestId('metrica-S9')).toBeVisible()
    await expect(page.getByTestId('mais-metricas')).toHaveAttribute('open', '')
  })

  for (const p of PAINEIS) {
    test(`COMP-07 ${p.rota}: complementares fora de "Pede atenção"`, async ({ page, painel }) => {
      await painel.ir(p.rota)
      await painel.esperarPronto()
      await page.getByTestId('mais-metricas').locator('summary').click()
      await painel.esperarPronto()
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
    await expect(page.getByText(/· 13 complementares/)).toBeVisible()
    await expect(page.getByTestId('leia-junto-o3').getByRole('link', { name: /O6/ })).toHaveCount(0)
  })

  test('COMP-15 O13 e O16 trazem link para o O15 (L-1) e O6 nunca mostra "Fora da meta" (L-7)', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=semanal')
    await page.getByTestId('mais-metricas').locator('summary').click()
    for (const codigo of ['O13', 'O16']) {
      await expect(
        page.getByTestId(`metrica-${codigo}`).getByRole('link', { name: 'Onde os bugs são encontrados (O15)' }),
      ).toHaveAttribute('href', '#o15')
    }
    await expect(page.getByTestId('metrica-O6')).toContainText('Referência do briefing: abaixo de 2,5')
    await expect(page.getByTestId('metrica-O6')).not.toContainText(/fora da meta/i)
  })

  test('COMP-10 tudo oculto: a seção vira uma linha de aviso, nunca some calada', async ({ page, painel }) => {
    await guardar(page, { tatico: ['t6', 't8', 't10', 't11', 't12', 't13', 't14'] })
    await painel.ir('/tatico')
    await painel.esperarPronto()
    await expect(page.getByTestId('mais-metricas')).toHaveCount(0)
    await expect(page.getByTestId('mais-metricas-ocultas')).toHaveText('7 complementares ocultas pelas suas preferências.')
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

  test('COMP-12 S8 e S12: denominador dos informados na tabela; cobertura "n de N" só quando parcial', async ({ page, painel }) => {
    await painel.ir('/operacional?cadencia=sustentacao')
    await painel.esperarPronto()
    const det = page.getByTestId('mais-metricas')
    if ((await det.getAttribute('open')) === null) await det.locator('summary').click()
    const s8 = page.getByTestId('metrica-S8')
    await expect(s8).toContainText('com o campo de reincidência informado')
    await expect(s8.getByRole('columnheader', { name: 'Informados' })).toBeVisible()
    const s12 = page.getByTestId('metrica-S12')
    await expect(s12.getByRole('columnheader', { name: 'Com campo informado' })).toBeVisible()
    // A base fictícia preenche o campo em todos os chamados (cobertura 100%): nenhum aviso de cobertura.
    // O ramo parcial ("n de N" com n < N) é provado nos testes de componente, que ajustam a resposta.
    await expect(s8.getByTestId('cobertura-S8')).toHaveCount(0)
    await expect(s12.getByTestId('cobertura-S12')).toHaveCount(0)
    await expect(s12.getByTestId('campo-sem-fonte-S12')).toHaveCount(0)
  })

  test('COMP-13 "Leia junto" em todos os cartões do núcleo que têm complementares', async ({ page, painel }) => {
    const esperado: Record<string, Record<string, string[]>> = {
      '/operacional?cadencia=semanal': { o3: ['O5', 'O6', 'O8', 'O26'], o4: ['O8', 'O25'], o9: ['O22'], o7: ['O20', 'O25'], o10: ['O11', 'O22', 'O24'], o15: ['O13', 'O16', 'O17'] },
      '/tatico': { t1: ['T6', 'T13'], t4: ['T8', 'T11'], t5: ['O14'], t9: ['T6', 'E5', 'E6', 'T14'] },
      '/operacional?cadencia=diaria': { bloqueados: ['T10', 'O19'], o1: ['O20'] },
      '/estrategico': { e1: ['E4', 'E5', 'E9'], e2: ['E7'] },
      '/operacional?cadencia=sustentacao': { s1: ['S9', 'S10', 'PV1'], s2: ['S8', 'S12', 'PV1'], s3: ['S8', 'S12'], s5: ['S11'], s7: ['S11'] },
    }
    for (const [rota, cartoes] of Object.entries(esperado)) {
      await painel.ir(rota)
      await painel.esperarPronto()
      for (const [id, codigos] of Object.entries(cartoes)) {
        const links = page.getByTestId(`leia-junto-${id}`).getByRole('link')
        await expect(links).toHaveCount(codigos.length)
        for (const [i, c] of codigos.entries()) await expect(links.nth(i)).toContainText(new RegExp(`^${c} `))
      }
    }
  })

  test('COMP-14 "Leia junto" entre painéis: T5 leva ao O14 e O15 ao O17, com hash e foco no cartão', async ({ page, painel }) => {
    await painel.ir('/tatico')
    await painel.esperarPronto()
    const t5 = page.getByTestId('leia-junto-t5').getByRole('link', { name: /O14/ })
    await expect(t5).toHaveAttribute('href', '/operacional?cadencia=semanal#o14')
    await t5.click()
    await expect(page).toHaveURL(/\/operacional(\?[^#]*)?#o14$/)
    const o14 = page.getByTestId('metrica-O14')
    await expect(o14).toBeVisible()
    await expect(page.getByTestId('mais-metricas')).toHaveAttribute('open', '')
    await expect(o14.getByRole('heading', { level: 3 })).toBeFocused()
    await painel.esperarPronto()
    await page.getByTestId('leia-junto-o15').getByRole('link', { name: /O17/ }).click()
    await expect(page).toHaveURL(/\/operacional\?[^#]*cadencia=sustentacao[^#]*#o17$/)
    const o17 = page.getByTestId('metrica-O17')
    await expect(o17).toBeVisible({ timeout: 20_000 })
    await painel.esperarPronto()
    await expect(o17.getByRole('heading', { level: 3 })).toBeFocused()
  })
})
