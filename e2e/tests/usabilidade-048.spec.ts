import { test, expect, rodarAxe } from '../fixtures/base'
import type { Page } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

// Pedido 048 (K-074): usabilidade U1 a U5, catálogo na Ajuda, barra única de ações (P2) e correções A1 a A4 do review.
// Fonte: docs/ux/revisao-geral-usabilidade/04-decisoes.md e 02-propostas.md. Mock: nenhum dado real, nenhum dado de pessoa.
const CHAVE = 'metricas-dspd:preferencias:v1'
const SEMANAL = '/operacional?cadencia=semanal'
const TEMAS = ['light', 'dark'] as const

test.use({ viewport: { width: 1280, height: 800 } })

const salvos = (page: Page) =>
  page.evaluate((c) => {
    const bruto = localStorage.getItem(c)
    return bruto ? (JSON.parse(bruto).paineis?.operacional?.ocultar ?? []) : []
  }, CHAVE) as Promise<string[]>

async function ocultarO3(page: Page) {
  await page.goto(SEMANAL)
  await expect(page.getByTestId('metrica-O3')).toBeVisible()
  await page.getByRole('button', { name: 'Ocultar esta métrica O3' }).click()
}

test.describe('U1 e U2: ocultar é lembrado, com marcador no lugar', () => {
  test('USAB-01 ocultar vale depois de recarregar e o marcador explica "no seu padrão"', async ({ page }) => {
    await ocultarO3(page)
    await expect(page.getByTestId('metrica-O3')).toHaveCount(0)
    await expect(page.getByTestId('marcador-O3')).toContainText('oculta no seu padrão')
    expect(await salvos(page)).toContain('o3')
    await page.reload()
    await expect(page.getByTestId('marcador-O3')).toBeVisible()
    await expect(page.getByTestId('metrica-O3')).toHaveCount(0)
    expect(page.url()).not.toContain('ocultar')
  })

  test('USAB-02 "Mostrar" no marcador desfaz sem prazo, devolve o foco ao cartão e limpa o que foi guardado', async ({ page }) => {
    await ocultarO3(page)
    await expect(page.getByTestId('marcador-O3')).toBeVisible()
    // sem prazo: nada some sozinho depois de mais que os 5 s de um aviso temporário
    await page.waitForTimeout(5500)
    await expect(page.getByTestId('marcador-O3')).toBeVisible()
    await page.getByRole('button', { name: /^Mostrar .*\(O3\)/ }).click()
    await expect(page.getByTestId('metrica-O3').getByRole('heading', { level: 3 })).toBeFocused()
    expect(await salvos(page)).not.toContain('o3')
    await page.reload()
    await expect(page.getByTestId('metrica-O3')).toBeVisible()
  })

  test('USAB-03 marcadores desligados nas Preferências: some sem marcador, a faixa do topo continua dizendo', async ({ page }) => {
    await ocultarO3(page)
    await page.goto('/preferencias')
    const opcao = page.getByRole('checkbox', { name: /Mostrar um marcador no lugar da métrica oculta/ })
    await expect(opcao).toBeChecked()
    await opcao.uncheck()
    await page.goto(SEMANAL)
    await expect(page.getByTestId('metrica-O3')).toHaveCount(0)
    await expect(page.getByTestId('marcador-O3')).toHaveCount(0)
    await expect(page.getByTestId('faixa-ocultas')).toContainText('1 métrica oculta: O3')
    await page.reload()
    await expect(page.getByTestId('marcador-O3')).toHaveCount(0)
  })

  test('USAB-04 link direto para métrica oculta cai no marcador e explica, sem mostrar sozinho', async ({ page }) => {
    await ocultarO3(page)
    await page.goto(`${SEMANAL}#o3`)
    await expect(page.getByTestId('chegada-O3')).toContainText('Você chegou a uma métrica oculta')
    await expect(page.getByTestId('metrica-O3')).toHaveCount(0)
  })
})

test.describe('U3, P3 e 048-03 CA-A: índice fixo por seção; a barra de filtros rola com o conteúdo', () => {
  test('USAB-05 índice leva ao título da seção (foco) e marca a seção em vista', async ({ page }) => {
    await page.goto('/tatico')
    const indice = page.getByTestId('indice-secoes')
    await expect(indice).toBeVisible()
    await indice.getByRole('link', { name: 'Fila' }).click()
    await expect(page.locator('#fila h2')).toBeFocused()
    await expect(page).toHaveURL(/#fila$/)
  })

  // Bug 048-01 (docs/qa/bugs/048-01-indice-cobre-titulo.md), corrigido: depois do clique o título não fica sob o índice.
  test('USAB-05b (bug 048-01) após o clique, o título da seção não fica coberto e o destaque vai para ela', async ({ page }) => {
    await page.goto('/tatico')
    const indice = page.getByTestId('indice-secoes')
    await indice.getByRole('link', { name: 'Fila' }).click()
    const coberto = await page.evaluate(() => {
      const h = document.querySelector('#fila h2')!.getBoundingClientRect()
      const el = document.elementFromPoint(h.x + 20, h.y + h.height / 2)
      return !el?.closest('#fila')
    })
    expect(coberto, 'o título da seção está sob o índice fixo').toBe(false)
    await expect(indice.getByRole('link', { name: 'Fila' })).toHaveAttribute('aria-current', 'location')
  })

  test('USAB-06 CA-A: ao rolar, ficam fixos só cabeçalho e índice (até 100 px) e a barra de filtros rola', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/tatico')
    await expect(page.getByTestId('indice-secoes')).toBeVisible()
    await page.evaluate(() => window.scrollTo(0, 600))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300)
    const g = await page.evaluate(() => {
      const h = document.querySelector('header')!.getBoundingClientRect()
      const i = document.querySelector('[data-testid="indice-secoes"]')!.getBoundingClientRect()
      const b = document.querySelector('[data-testid="barra-filtros"]')!.getBoundingClientRect()
      return { hTop: h.top, hBottom: h.bottom, iTop: i.top, iBottom: i.bottom, bBottom: b.bottom }
    })
    expect(g.hTop, 'cabeçalho fixo no topo').toBeLessThanOrEqual(1)
    expect(g.iTop, 'índice logo abaixo do cabeçalho').toBeGreaterThanOrEqual(g.hBottom - 1)
    expect(g.iTop, 'índice colado ao cabeçalho').toBeLessThanOrEqual(g.hBottom + 1)
    expect(g.iBottom, 'altura fixa total (cabeçalho + índice) até 100 px').toBeLessThanOrEqual(100)
    expect(g.bBottom, 'a barra de filtros rolou para fora, não é fixa').toBeLessThanOrEqual(g.hBottom + 1)
  })

  test('USAB-07 seção com métrica oculta diz "N de M visíveis" e o índice conta as ocultas', async ({ page }) => {
    await page.goto('/tatico')
    await page.getByRole('button', { name: /^Ocultar esta métrica T2$/ }).click()
    await expect(page.locator('#publicado')).toContainText('2 de 3 visíveis')
    await expect(page.getByTestId('indice-secoes').getByRole('link', { name: /Publicado/ })).toContainText('(1 oculta)')
  })

  test('USAB-08 seção toda oculta vira um marcador único e some do índice', async ({ page }) => {
    await page.goto('/tatico')
    for (const c of ['T4', 'T3']) {
      await expect(page.getByTestId(`metrica-${c}`)).toBeVisible()
      await page.getByRole('button', { name: `Ocultar esta métrica ${c}` }).click()
      await expect(page.getByTestId(`metrica-${c}`)).toHaveCount(0)
    }
    await expect(page.getByTestId('secao-oculta')).toContainText('2 métricas ocultas')
    await expect(page.getByTestId('indice-secoes').getByRole('link', { name: 'Fila' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Mostrar as 2' }).click()
    await expect(page.getByTestId('metrica-T4')).toBeVisible()
  })
})

test.describe('U4: sem sugestão por papel; restaurar pede confirmação e dá para desfazer sem prazo', () => {
  test('USAB-09 /preferencias não oferece sugestão por papel', async ({ page }) => {
    await page.goto('/preferencias')
    await expect(page.getByTestId('grupo-operacional')).toBeVisible()
    await expect(page.getByRole('button', { name: /sugestão do papel/i })).toHaveCount(0)
    await expect(page.getByText(/Gerente|papel/i)).toHaveCount(0)
    await expect(page.getByTestId('contador-operacional')).toHaveText('12 de 12 do núcleo e 14 de 14 complementares visíveis')
  })

  test('USAB-10 Restaurar padrão: Cancelar não muda nada; confirmar restaura e o Desfazer devolve', async ({ page }) => {
    await ocultarO3(page)
    await page.goto('/preferencias')
    await page.getByRole('button', { name: 'Restaurar padrão' }).click()
    const dlg = page.getByRole('dialog', { name: 'Restaurar o padrão?' })
    await expect(dlg).toContainText('O3')
    await dlg.getByRole('button', { name: 'Cancelar' }).click()
    expect(await salvos(page)).toContain('o3')
    await page.getByRole('button', { name: 'Restaurar padrão' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Restaurar', exact: true }).click()
    expect(await salvos(page)).toEqual([])
    const estado = page.getByTestId('restauracao')
    await expect(estado).toContainText('Padrão restaurado: 1 métrica voltou')
    await expect(estado.getByRole('button', { name: 'Desfazer' })).toBeFocused()
    await page.waitForTimeout(5500) // sem prazo
    await estado.getByRole('button', { name: 'Desfazer' }).click()
    expect(await salvos(page)).toContain('o3')
  })

  test('USAB-11 A2: restaurar de novo sem nada oculto não derruba o Desfazer pendente', async ({ page }) => {
    await ocultarO3(page)
    await page.goto('/preferencias')
    await page.getByRole('button', { name: 'Restaurar padrão' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Restaurar', exact: true }).click()
    await expect(page.getByTestId('restauracao').getByRole('button', { name: 'Desfazer' })).toBeVisible()
    await page.getByRole('button', { name: 'Restaurar padrão' }).click()
    await expect(page.getByRole('dialog')).toContainText('Nenhuma métrica está oculta')
    await page.getByRole('dialog').getByRole('button', { name: 'Restaurar', exact: true }).click()
    const desfazer = page.getByTestId('restauracao').getByRole('button', { name: 'Desfazer' })
    await expect(desfazer).toBeVisible()
    await desfazer.click()
    expect(await salvos(page)).toContain('o3')
  })

  test('USAB-12 teclado: o diálogo de confirmação prende o foco e Esc fecha devolvendo-o ao gatilho', async ({ page }) => {
    await page.goto('/preferencias')
    await page.getByRole('button', { name: 'Restaurar padrão' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Restaurar o padrão?' })).toBeVisible()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Restaurar padrão' })).toBeFocused()
  })
})

test.describe('U5 e A3: Visão geral', () => {
  test('USAB-13 "Por reunião" vem logo abaixo de "Pede atenção", antes de "Por nível"', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('faixa-atencao')).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Por reunião' })).toBeVisible()
    const ordem = await page.evaluate(() => {
      const y = (el: Element | null) => (el ? el.getBoundingClientRect().top + window.scrollY : Number.NaN)
      const h = (t: string) => [...document.querySelectorAll('h2')].find((e) => e.textContent?.trim() === t) ?? null
      return [y(document.querySelector('[data-testid="faixa-atencao"]')), y(h('Por reunião')), y(h('Por nível'))]
    })
    expect(ordem[0]).toBeLessThan(ordem[1]!)
    expect(ordem[1]).toBeLessThan(ordem[2]!)
  })

  test('USAB-14 A3: a linha do recorte fica à vista, fora do "Sobre esta tela" recolhido', async ({ page }) => {
    await page.goto('/')
    const linha = page.getByTestId('recorte-resumo')
    await expect(linha).toBeVisible()
    await expect(linha).toContainText('últimas 12 semanas')
    expect(await linha.evaluate((e) => !!e.closest('details'))).toBe(false)
    await expect(page.getByTestId('sobre-esta-tela')).not.toHaveAttribute('open', '')
  })
})

test.describe('Catálogo na Ajuda', () => {
  test('USAB-15 o menu não tem "Catálogo"; o catálogo é seção da Ajuda e /metricas continua funcionando', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /Catálogo/i })).toHaveCount(0)
    await page.goto('/metricas')
    await expect(page).toHaveURL(/\/ajuda#catalogo$/)
    await expect(page.locator('#catalogo')).toBeVisible()
    await expect(page.getByTestId('contagem-catalogo')).toBeVisible()
    await page.goto('/ajuda')
    await expect(page.locator('#catalogo')).toBeVisible()
  })
})

test.describe('P2 e A4: barra única de ações', () => {
  test('USAB-16 a barra única reúne Exportar, Copiar link e Métricas, e o cabeçalho não os repete', async ({ page }) => {
    await page.goto(SEMANAL)
    const barra = page.getByRole('group', { name: 'Ações do painel' })
    await expect(barra).toBeVisible()
    await expect(barra.getByTestId('copiar-link')).toBeVisible()
    await expect(barra.getByRole('button', { name: /Exportar|Gerar arquivo/i }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Copiar link/ })).toHaveCount(1)
  })

  test('USAB-17 A4: "Copiar link" avisa sem deslocar o layout e copia só a URL sem mock, sem seleção de métricas', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await ocultarO3(page)
    await page.reload()
    await expect(page.getByTestId('marcador-O3')).toBeVisible()
    const caixas = () =>
      page.evaluate(() => {
        const q = (s: string) => document.querySelector(s)?.getBoundingClientRect()
        const b = q('[data-testid="barra-metricas"]')
        const f = q('[data-testid="marcador-O3"]')
        return { barraAltura: b?.height, barraY: b?.y, abaixoY: f?.y }
      })
    const antes = await caixas()
    await page.getByTestId('copiar-link').click()
    await expect(page.getByRole('status').filter({ hasText: 'Link copiado.' })).toBeVisible()
    expect(await caixas()).toEqual(antes)
    const link = await page.evaluate(() => navigator.clipboard.readText())
    expect(link).toContain('/operacional?cadencia=semanal')
    expect(link).not.toMatch(/mock|ocultar|o3/i)
    await expect(page.getByRole('status').filter({ hasText: 'Link copiado.' })).toHaveCount(0, { timeout: 8000 })
    expect(await caixas()).toEqual(antes)
  })

  test('USAB-18 A4: sem permissão da área de transferência, o campo manual aparece sobreposto, sem deslocar o layout', async ({ page, context }) => {
    await context.clearPermissions()
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('negado')) }, configurable: true })
    })
    await page.goto(SEMANAL)
    await expect(page.getByTestId('copiar-link')).toBeVisible()
    const altura = () => page.getByTestId('barra-metricas').evaluate((e) => e.getBoundingClientRect().height)
    const antes = await altura()
    await page.getByTestId('copiar-link').click()
    const campo = page.getByRole('textbox', { name: /Copie o endereço desta visão/ })
    await expect(campo).toBeVisible()
    expect(await campo.inputValue()).not.toContain('mock')
    expect(await altura()).toBe(antes)
  })
})

// Acessibilidade (WCAG 2.2 AA) das telas alteradas, em dois tamanhos e dois temas.
const TELAS_AXE = [
  { nome: 'Visão geral', rota: '/' },
  { nome: 'Operacional semanal com métrica oculta', rota: SEMANAL, ocultar: true },
  { nome: 'Tático', rota: '/tatico' },
  { nome: 'Preferências', rota: '/preferencias' },
  { nome: 'Ajuda com catálogo', rota: '/ajuda#catalogo' },
] as const
for (const tamanho of [1280, 375]) {
  for (const tema of TEMAS) {
    for (const tela of TELAS_AXE) {
      test(`USAB-AXE ${tela.nome} a ${tamanho} px (${tema})`, async ({ page }) => {
        await page.setViewportSize({ width: tamanho, height: tamanho === 375 ? 812 : 800 })
        await page.addInitScript(
          ([t, chave, ocultar]) => {
            localStorage.setItem('metricas-dspd:tema', t === 'dark' ? 'escuro' : 'claro')
            if (ocultar && !localStorage.getItem(chave as string))
              localStorage.setItem(
                chave as string,
                JSON.stringify({ versao: 1, paineis: { operacional: { ocultar: ['o3'] } }, atualizadoEm: '2026-10-10T00:00:00.000Z' }),
              )
          },
          [tema, CHAVE, 'ocultar' in tela] as const,
        )
        await page.goto(tela.rota)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        await expect(page.locator('html')).toHaveAttribute('data-theme', tema)
        await expect(page.getByTestId('aguardando-coleta')).toHaveCount(0, { timeout: 30_000 })
        await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, { timeout: 30_000 })
        if ('ocultar' in tela) await expect(page.getByTestId('marcador-O3')).toBeVisible()
        const r = await rodarAxe(page)
        expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
      })
    }
  }
}

test('USAB-AXE-b diálogo "Restaurar padrão" aberto e campo manual do "Copiar link" passam no axe', async ({ page }) => {
  await page.goto('/preferencias')
  await page.getByRole('button', { name: 'Restaurar padrão' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  const r = await rodarAxe(page)
  expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
})

// 048-03 CA-B: percorrendo a Sustentação a 1280 px em passos de 100 px, nenhuma posição de rolagem tem violação séria de
// alvo mínimo (WCAG 2.5.8), com "Mais métricas" aberto (pior caso: página mais longa).
test('USAB-19 CA-B: passos de 100 px na Sustentação sem violação target-size', async ({ page }) => {
  test.setTimeout(240_000)
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/operacional?cadencia=sustentacao')
  await page.getByTestId('mais-metricas').locator('summary').click()
  const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
  expect(total, 'página longa o bastante para o percurso').toBeGreaterThan(1000)
  const falhas: string[] = []
  for (let y = 0; y <= total + 99; y += 100) {
    await page.evaluate((p) => window.scrollTo(0, p), Math.min(y, total))
    const { violations } = await new AxeBuilder({ page }).withRules(['target-size']).analyze()
    for (const v of violations) falhas.push(`y=${y} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
  }
  expect(falhas, falhas.join('\n')).toEqual([])
})
