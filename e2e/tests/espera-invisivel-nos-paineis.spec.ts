import { test, expect, rodarAxe } from '../fixtures/base'
import type { Page } from '@playwright/test'

// Espera invisível dentro de cada painel (docs/ux/espera-invisivel-nos-paineis/especificacao.md, critérios 1 a 12).
const CHAVE = 'metricas-dspd:preferencias:v1'
const TITULO = 'Quanto do tempo do solicitante fica fora da nossa gestão?'
const PAINEIS = [
  ['EI-FL1', 'ei-fl1', '/operacional?cadencia=semanal', 'Operacional'],
  ['EI-FL2', 'ei-fl2', '/tatico', 'Tático'],
  ['EI-FL3', 'ei-fl3', '/estrategico', 'Estratégico'],
  ['EI-SUST', 'ei-sust', '/operacional?cadencia=sustentacao&ei_sust=p3', 'Sustentação'],
] as const
const TELAS = [
  { nome: '1280', width: 1280, height: 800 },
  { nome: '375', width: 375, height: 812 },
] as const

const semRolagemHorizontal = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)

async function pronto(page: Page) {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)
}

test.describe('redirecionamento da rota antiga (critério 2)', () => {
  const CASOS = [
    ['/espera-invisivel?periodo=4s&equipe=fluig#ei-fl1', '/operacional?cadencia=diaria', 'EI-FL1', ['cadencia=semanal', 'periodo=4s', 'equipe=fluig']],
    ['/espera-invisivel?periodo=4s&equipe=fluig#ei-fl2', '/tatico', 'EI-FL2', ['periodo=4s', 'equipe=fluig']],
    ['/espera-invisivel?periodo=6m&equipe=fluig&tipo=incidente#ei-fl3', '/estrategico', 'EI-FL3', ['periodo=6m']],
    ['/espera-invisivel?periodo=4s&equipe=fluig&sust_prioridade=P1#ei-sust', '/operacional?cadencia=sustentacao', 'EI-SUST', ['prioridade=p1']],
  ] as const
  for (const [entrada, rota, cartao, trechos] of CASOS) {
    test(`${entrada} termina em ${rota} e foca ${cartao}`, async ({ page }) => {
      await page.goto(entrada)
      await expect(page).toHaveURL(new RegExp(`${rota}\\?`))
      const url = new URL(page.url())
      expect(url.hash).toBe(`#${cartao.toLowerCase()}`)
      for (const t of trechos) expect(url.search.toLowerCase()).toContain(t.toLowerCase())
      // O painel normaliza (replace) depois de carregar as opções: espera a URL assentar.
      if (rota === '/estrategico') await expect.poll(() => new URL(page.url()).search).not.toMatch(/equipe|tipo/)
      if (rota === '/operacional?cadencia=sustentacao') {
        expect(url.search).not.toContain('sust_')
        expect(url.search).not.toContain('equipe')
        expect(url.search).not.toContain('periodo=4s')
      }
      await expect(page.getByTestId(`metrica-${cartao}`)).toBeVisible()
      await expect(page.locator(`[data-testid="metrica-${cartao}"] :focus`)).toHaveCount(1)
    })
  }

  test('sem hash vai para a Visão geral e o Voltar não retorna à rota antiga', async ({ page }) => {
    await page.goto('/ajuda')
    await page.goto('/espera-invisivel?periodo=4s')
    await expect(page).toHaveURL(/\/$/)
    await page.goBack()
    await expect(page).toHaveURL(/\/ajuda$/)
  })

  test('a rota antiga não carrega chunk de página (critério 12)', async ({ page }) => {
    const arquivos: string[] = []
    page.on('request', (r) => arquivos.push(r.url()))
    await page.goto('/espera-invisivel#ei-fl2')
    await expect(page).toHaveURL(/\/tatico/)
    expect(arquivos.filter((u) => /EsperaInvisivelPage/.test(u))).toEqual([])
  })
})

for (const tela of TELAS) {
  test.describe(`${tela.nome} px`, () => {
    test.use({ viewport: { width: tela.width, height: tela.height } })

    test('menu sem "Espera invisível" (critério 1)', async ({ page }) => {
      await page.goto('/')
      if (tela.width < 1024) await page.getByTestId('abrir-menu').click()
      const nav = page.getByRole('navigation', { name: 'Navegação principal' }).first()
      await expect(nav).toBeAttached()
      await expect(page.getByRole('link', { name: 'Espera invisível', exact: true }).filter({ visible: true })).toHaveCount(0)
    })

    for (const [codigo, ancora, rota, nivel] of PAINEIS) {
      test(`${nivel}: seção com título-pergunta, cartão do nível, evolução aberta, axe e sem rolagem horizontal (critérios 3 a 6, 11)`, async ({ page }) => {
        await page.goto(rota)
        await pronto(page)
        const cartao = page.getByTestId(`metrica-${codigo}`)
        await expect(cartao).toHaveAttribute('id', ancora)
        const secao = page.locator('section', { has: cartao })
        await expect(secao.getByRole('heading', { level: 2, name: TITULO })).toBeVisible()
        await expect(page.locator('[data-testid^="metrica-EI-"]')).toHaveCount(1)

        const botao = cartao.getByRole('button', { name: new RegExp(`evolução mensal, ${nivel}$`) })
        if (codigo === 'EI-FL3') {
          // Estratégico: amostra insuficiente no mock, sem série publicável, sem botão.
          await expect(cartao.getByRole('button', { name: /evolução mensal/ })).toHaveCount(0)
        } else {
          await expect(botao).toHaveAttribute('aria-expanded', 'false')
          await botao.scrollIntoViewIfNeeded()
          const alvo = await botao.boundingBox()
          // 44px no celular (375); no desktop vale o piso de 24px do sistema de design.
          expect(alvo!.height).toBeGreaterThanOrEqual((tela.width < 768 ? 44 : 24) - 1)
          const antes = page.url()
          await botao.click()
          await expect(botao).toHaveAttribute('aria-expanded', 'true')
          await expect(cartao.getByTestId(/^ei-evolucao-/)).toBeVisible()
          expect(page.url()).toBe(antes)
          expect(await semRolagemHorizontal(page)).toBe(true)
          const r = await rodarAxe(page)
          expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
          await cartao.getByTestId(/^ei-evolucao-/).click({ position: { x: 2, y: 2 } })
          await page.keyboard.press('Escape')
          await expect(botao).toHaveAttribute('aria-expanded', 'false')
          await expect(botao).toBeFocused()
          await botao.click()
          await botao.click()
          await expect(cartao.getByTestId(/^ei-evolucao-/)).toHaveCount(0)
        }
        expect(await semRolagemHorizontal(page)).toBe(true)
        const r2 = await rodarAxe(page)
        expect(r2.bloqueantes, JSON.stringify(r2.bloqueantes)).toEqual([])
      })
    }
  })
}

test.describe('Operacional (critério 3)', () => {
  test('EI-FL1 depois de "Qualidade", fora de "Tempo", no "Ir para" e ausente na diária', async ({ page }) => {
    await page.goto('/operacional?cadencia=semanal')
    await pronto(page)
    const ids = await page.locator('main section[id]').evaluateAll((els) => els.map((e) => e.id))
    expect(ids.indexOf('espera-invisivel')).toBe(ids.indexOf('qualidade') + 1)
    await expect(page.locator('#tempo').getByTestId('metrica-EI-FL1')).toHaveCount(0)
    await page.getByRole('navigation', { name: 'Ir para' }).getByRole('link', { name: 'Espera invisível' }).click()
    await expect(page).toHaveURL(/#espera-invisivel$/)
    await page.goto('/operacional?cadencia=diaria')
    await pronto(page)
    await expect(page.getByTestId('metrica-EI-FL1')).toHaveCount(0)
  })

  test('aba por tipo atualiza ei_fl1 na URL e o gráfico aberto acompanha (critério 6)', async ({ page }) => {
    await page.goto('/operacional?cadencia=semanal')
    await pronto(page)
    const cartao = page.getByTestId('metrica-EI-FL1')
    await cartao.getByRole('button', { name: /Ver evolução mensal/ }).click()
    await expect(cartao.getByTestId('ei-evolucao-fl1-incidente')).toBeVisible()
    await cartao.getByRole('tab', { name: /Requisição/ }).click()
    await expect(page).toHaveURL(/ei_fl1=requisicao/)
    await expect(cartao.getByTestId('ei-evolucao-fl1-requisicao')).toBeVisible()
  })

  test('aba com menos de 20 itens não tem botão de evolução (critério 5)', async ({ page }) => {
    await page.goto('/operacional?cadencia=semanal&ei_fl1=divida-tecnica')
    await pronto(page)
    const cartao = page.getByTestId('metrica-EI-FL1')
    await expect(cartao.getByTestId('amostra-insuficiente-EI-FL1')).toBeVisible()
    await expect(cartao.getByRole('button', { name: /evolução mensal/ })).toHaveCount(0)
  })
})

test.describe('Visão geral e catálogo (critérios 7 e 8)', () => {
  test('os links de espera apontam e chegam ao cartão certo', async ({ page }) => {
    await page.goto('/')
    await pronto(page)
    const esperado = {
      fl1: ['/operacional?cadencia=diaria', 'EI-FL1'],
      fl2: ['/tatico', 'EI-FL2'],
      fl3: ['/estrategico', 'EI-FL3'],
      sust: ['/operacional?cadencia=sustentacao', 'EI-SUST'],
    } as const
    for (const [nivel, [rota, cartao]] of Object.entries(esperado)) {
      await page.goto('/')
      await pronto(page)
      const link = page.getByTestId(`ei-resumo-${nivel}`).getByRole('link')
      await expect(link).toHaveAttribute('href', new RegExp(`^${rota}.*#${cartao.toLowerCase()}$`))
      await link.click()
      await expect(page).toHaveURL(new RegExp(`${rota}.*#${cartao.toLowerCase()}$`))
      await expect(page.getByTestId(`metrica-${cartao}`)).toBeVisible()
    }
  })

  test('catálogo: quatro linhas de espera, com painel real, e sem opção "Espera invisível" no filtro Painel', async ({ page }) => {
    await page.goto('/metricas')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    for (const [, , , nivel] of PAINEIS)
      await expect(page.getByRole('row', { name: new RegExp(`Espera invisível · ${nivel}`) })).toHaveCount(1)
    await expect(page.getByRole('option', { name: 'Espera invisível' })).toHaveCount(0)
    await expect(page.getByRole('row', { name: /Espera invisível/ })).toHaveCount(4)
  })
})

test.describe('Preferências (critério 9)', () => {
  test('oculto salvo antes da mudança continua valendo: marcador no lugar e seção fora do "Ir para"', async ({ page }) => {
    await page.addInitScript(
      ([chave]) =>
        localStorage.setItem(
          chave as string,
          JSON.stringify({
            versao: 1,
            paineis: { operacional: { ocultar: ['ei-fl1'] }, tatico: { ocultar: ['ei-fl2'] } },
            atualizadoEm: '2026-10-10T00:00:00.000Z',
          }),
        ),
      [CHAVE],
    )
    await page.goto('/tatico')
    await pronto(page)
    await expect(page.getByTestId('metrica-EI-FL2')).toHaveCount(0)
    await expect(page.getByTestId('secao-oculta')).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Ir para' }).getByRole('link', { name: 'Espera invisível' })).toHaveCount(0)
    await page.goto('/operacional?cadencia=semanal')
    await pronto(page)
    await expect(page.getByTestId('metrica-EI-FL1')).toHaveCount(0)
    await expect(page.getByRole('navigation', { name: 'Ir para' }).getByRole('link', { name: 'Espera invisível' })).toHaveCount(0)
  })
})

test.describe('Preferências pela UI (critério 9)', () => {
  test('desmarcar a Espera invisível do Tático grava só { tatico: [ei-fl2] } e o painel respeita', async ({ page }) => {
    await page.goto('/preferencias')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.getByTestId('grupo-tatico').getByRole('checkbox', { name: /EI-FL2/ }).uncheck()
    await expect(page.getByText('Salvo neste navegador')).toBeVisible()
    const gravado = await page.evaluate((chave) => JSON.parse(localStorage.getItem(chave) ?? 'null'), CHAVE)
    expect(gravado.paineis.tatico.ocultar).toEqual(['ei-fl2'])
    await page.goto('/tatico')
    await pronto(page)
    await expect(page.getByTestId('metrica-EI-FL2')).toHaveCount(0)
  })
})

test.describe('Exportação (critério 10)', () => {
  test('o botão do painel lista a espera invisível do próprio nível; "Vários painéis" não tem a opção antiga', async ({ page }) => {
    await page.goto('/operacional?cadencia=sustentacao')
    await pronto(page)
    await page.getByRole('button', { name: 'Exportar', exact: true }).click()
    const dlg = page.getByRole('dialog', { name: 'Exportar métricas' })
    await expect(dlg.getByRole('checkbox', { name: /EI-SUST .*\(Acelerato\)/ })).toBeVisible()
    await expect(dlg.getByRole('checkbox', { name: /EI-FL/ })).toHaveCount(0)
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Exportação personalizada' }).click()
    const pers = page.getByRole('dialog', { name: 'Exportação personalizada' })
    await expect(pers.getByRole('group', { name: 'Espera invisível' })).toHaveCount(0)
  })
})
