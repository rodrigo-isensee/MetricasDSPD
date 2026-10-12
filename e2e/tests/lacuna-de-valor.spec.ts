import { test, expect, rodarAxe } from '../fixtures/base'
import type { Page } from '@playwright/test'

// QA lacuna-de-valor (K-036, PV1): seção "Percepção de valor" no fim da Sustentação, dados fictícios.
// Plano: docs/qa/lacuna-de-valor.md. Valores esperados vêm do cenário fixo do mock (2026-T3: n=24, áreas 5,4,4,3,3,2,2,1).
// Os testes com test.fixme dependem de F1 (cartão PV1), F2 (integrações) ou B3 (rota/mock no server); remover o fixme quando existirem.
// Convenção assumida (a confirmar com o react-frontend em F1): data-testid="metrica-PV1", seções "Por área", "Tendência", "O que mudou".

const CHAVE = 'metricas-dspd:preferencias:v1'
const TELAS = [
  { nome: '1280', width: 1280, height: 800 },
  { nome: '375', width: 375, height: 812 },
] as const

const semRolagemHorizontal = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)

const PROIBIDOS = /\b(m[eé]dia|nota geral|nota [uú]nica|score|NPS|meta|ranking|melhor|pior)\b/i
const PESSOA = /(@|e-?mail|usuarioKey|coment[aá]rio)/i

async function abrir(page: Page, painel: { ir: (r: string) => Promise<void>; esperarCartoesProntos: () => Promise<void> }) {
  await painel.ir('/sustentacao')
  await painel.esperarCartoesProntos()
  const cartao = page.getByTestId('metrica-PV1')
  await expect(cartao).toBeVisible()
  return cartao
}

for (const tela of TELAS) {
  test.describe(`lacuna de valor a ${tela.nome} px`, () => {
    test.use({ viewport: { width: tela.width, height: tela.height } })

    test.fixme(`LV-01 CT-01 seção é a última do painel, fora de "Mais métricas", com fonte, trimestre e selo fictício (aguarda F1)`, async ({ page, painel }) => {
      const cartao = await abrir(page, painel)
      await expect(cartao.getByText('Pesquisa de percepção (não é Acelerato)')).toBeVisible()
      await expect(cartao.getByText('Pesquisa de 3T/2026')).toBeVisible()
      await expect(cartao.getByTestId('selo-ficticio')).toHaveText('Dados fictícios')
      await expect(page.getByTestId('mais-metricas').getByTestId('metrica-PV1')).toHaveCount(0)
      const ultimaSecao = await page.evaluate(() => {
        const todos = Array.from(document.querySelectorAll('[data-testid^="metrica-"]'))
        return todos[todos.length - 1]?.getAttribute('data-testid')
      })
      expect(ultimaSecao).toBe('metrica-PV1')
    })

    test.fixme(`LV-02 CT-02/03 participação "k de n" e consolidado com n=24: contagem e percentual, rótulo numérico e tabela equivalente (aguarda F1)`, async ({ page, painel }) => {
      const cartao = await abrir(page, painel)
      await expect(cartao.getByText(/\d+ de \d+ convidados/)).toBeVisible()
      await expect(cartao.getByText(/meta/i)).toHaveCount(0)
      const tabelas = cartao.getByRole('table')
      expect(await tabelas.count()).toBeGreaterThan(0)
      await expect(tabelas.first().getByRole('columnheader').first()).toBeVisible()
      await expect(cartao.getByText('Concordo totalmente').first()).toBeVisible()
      await expect(cartao.getByText(/\d+ de 24/).first()).toBeVisible()
      await expect(cartao.getByText(/%/).first()).toBeVisible()
    })

    test.fixme(`LV-03 CT-07/10/11 "Por área": alfabética, "Outras áreas" por último, soma das áreas + Outras = 24, sem ranking (aguarda F1)`, async ({ page, painel }) => {
      const cartao = await abrir(page, painel)
      const areas = cartao.getByTestId('por-area').getByRole('heading', { level: 4 })
      const nomes = (await areas.allTextContents()).map((t) => t.trim())
      expect(nomes.at(-1)).toBe('Outras áreas')
      const demais = nomes.slice(0, -1)
      expect(demais).toEqual([...demais].sort((a, b) => a.localeCompare(b, 'pt-BR')))
      const ns = (await cartao.getByTestId('por-area').getByTestId('n-grupo').allTextContents()).map((t) => Number(t.replace(/\D/g, '')))
      expect(ns.reduce((a, b) => a + b, 0)).toBe(24)
      const outras = ns.at(-1)!
      expect(outras === 0 || outras >= 3).toBe(true)
      expect(ns.every((n) => n >= 3)).toBe(true)
      await expect(cartao.getByTestId('por-area').getByText(PROIBIDOS)).toHaveCount(0)
    })

    test.fixme(`LV-04 CT-12/16 sem média, nota, meta, ranking nem dado de pessoa ou comentário em todo o cartão (aguarda F1)`, async ({ page, painel }) => {
      const cartao = await abrir(page, painel)
      const texto = (await cartao.innerText()).replace(/Concordo|Discordo/g, '')
      expect(texto).not.toMatch(PROIBIDOS)
      expect(texto).not.toMatch(PESSOA)
      await expect(cartao.locator('textarea, input[type="text"], input[type="email"], input[type="file"]')).toHaveCount(0)
    })

    test.fixme(`LV-05 CT-14 tendência até 4 trimestres e marcação de quebra de série com a data do questionário (aguarda F1)`, async ({ page, painel }) => {
      const cartao = await abrir(page, painel)
      const tendencia = cartao.getByTestId('tendencia')
      await expect(tendencia).toBeVisible()
      expect(await tendencia.getByTestId('ponto-trimestre').count()).toBeLessThanOrEqual(4)
      await expect(tendencia.getByTestId('quebra-serie')).toContainText(/2026|01\/04|abr/i)
      await expect(tendencia.getByText(/Base insuficiente/).or(tendencia.getByText(/Concordam/)).first()).toBeVisible()
    })

    test.fixme(`LV-06 CT-15 "O que mudou por causa da pesquisa" presente, como texto puro (aguarda F1)`, async ({ page, painel }) => {
      const cartao = await abrir(page, painel)
      const bloco = cartao.getByTestId('o-que-mudou')
      await expect(bloco.getByRole('heading', { name: 'O que mudou por causa da pesquisa' })).toBeVisible()
      await expect(bloco.locator('script, img, a, iframe')).toHaveCount(0)
    })

    test.fixme(`LV-07 CT-22 axe AA com a seção visível e sem rolagem horizontal (aguarda F1)`, async ({ page, painel, problemas }) => {
      await abrir(page, painel)
      const r = await rodarAxe(page)
      expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
      expect(await semRolagemHorizontal(page)).toBe(true)
      expect(problemas).toEqual([])
    })
  })
}

test.describe('lacuna de valor: fluxos a 1280 px', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.fixme('LV-08 CT-17 nenhuma requisição de escrita nem controle de upload na Sustentação (aguarda F1)', async ({ page, painel }) => {
    const escritas: string[] = []
    page.on('request', (r) => {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(r.method())) escritas.push(`${r.method()} ${r.url()}`)
    })
    const cartao = await abrir(page, painel)
    await expect(page.getByRole('button', { name: /carregar|enviar|upload|importar/i })).toHaveCount(0)
    await expect(cartao.locator('input[type="file"]')).toHaveCount(0)
    expect(escritas).toEqual([])
  })

  test.fixme('LV-09 CT-18/20 PV1 fora de "Pede atenção", rodapé de filtros não aplicáveis e mudar equipe não altera a seção (aguarda F1)', async ({ page, painel }) => {
    const cartao = await abrir(page, painel)
    await expect(cartao.getByText(/Não afetado por: equipe, prioridade, período/)).toBeVisible()
    const antes = await cartao.innerText()
    const faixa = page.getByTestId('faixa-atencao')
    if (await faixa.count()) await expect(faixa).not.toContainText(/\bPV1\b|percepção/i)
    await painel.ir('/sustentacao?periodo=30d')
    await painel.esperarCartoesProntos()
    expect(await page.getByTestId('metrica-PV1').innerText()).toBe(antes)
  })

  test.fixme('LV-10 CT-19 "Leia junto" de S1 e S2 leva a PV1; ocultar pv1 nas preferências remove link e seção (aguarda F2)', async ({ page, painel }) => {
    await painel.ir('/sustentacao')
    await painel.esperarCartoesProntos()
    for (const id of ['s1', 's2']) {
      const leia = page.getByTestId(`leia-junto-${id}`)
      await expect(leia.getByRole('link', { name: /PV1/ })).toBeVisible()
    }
    await page.getByTestId('leia-junto-s1').getByRole('link', { name: /PV1/ }).click()
    await expect(page.getByTestId('metrica-PV1').getByRole('heading').first()).toBeFocused()
    await page.addInitScript(
      ([chave]) =>
        localStorage.setItem(chave, JSON.stringify({ versao: 1, paineis: { sustentacao: { ocultar: ['pv1'] } }, atualizadoEm: '2026-10-10T00:00:00.000Z' })),
      [CHAVE] as const,
    )
    await painel.ir('/sustentacao')
    await painel.esperarCartoesProntos()
    await expect(page.getByTestId('metrica-PV1')).toHaveCount(0)
    await expect(page.getByTestId('leia-junto-s1').getByRole('link', { name: /PV1/ })).toHaveCount(0)
  })

  test.fixme('LV-11 CT-21 sem pesquisa: mensagem orientando a carga, sem botão de upload (aguarda F1 e B3 para simular a rota)', async ({ page, painel }) => {
    await page.route('**/api/v1/metricas/PV1*', (r) =>
      r.fulfill({ json: { status: 'sem-pesquisa', fonte: 'pesquisa' } }),
    )
    await painel.ir('/sustentacao')
    const cartao = page.getByTestId('metrica-PV1')
    await expect(cartao.getByText(/Nenhuma pesquisa carregada/)).toBeVisible()
    await expect(cartao.getByRole('button')).toHaveCount(0)
  })

  test.fixme('LV-12 CT-05 base insuficiente: só o total de respostas, sem faixas nem percentual (U2, aguarda F1 e B3)', async ({ page, painel }) => {
    await page.route('**/api/v1/metricas/PV1*', (r) =>
      r.fulfill({ json: null }), // substituir por fixture do schema com consolidado { status: 'base-insuficiente', n: 4, minimo: 5 }
    )
    await painel.ir('/sustentacao')
    const cartao = page.getByTestId('metrica-PV1')
    await expect(cartao.getByText('Base insuficiente: 4 respostas. Mínimo 5 para publicar.')).toBeVisible()
    await expect(cartao.getByText('Concordo totalmente')).toHaveCount(0)
    await expect(cartao.getByText('%')).toHaveCount(0)
  })

  test.fixme('LV-13 CT-23 teclado: Tab atravessa a seção sem armadilha e a tabela equivalente é alcançável (aguarda F1)', async ({ page, painel }) => {
    const cartao = await abrir(page, painel)
    await cartao.getByRole('heading').first().focus()
    for (let i = 0; i < 40; i++) await page.keyboard.press('Tab')
    const dentro = await page.evaluate(() => !!document.activeElement)
    expect(dentro).toBe(true)
    await expect(cartao.getByRole('table').first()).toBeVisible()
  })

  test.fixme('LV-14 CT-26 catálogo lista PV1 com fonte "Pesquisa de percepção" e 51 métricas (aguarda F2)', async ({ page }) => {
    await page.goto('/metricas')
    await expect(page.getByTestId('contagem-catalogo')).toHaveText('51 de 51 métricas')
    await expect(page.getByRole('row', { name: /^PV1 / })).toContainText('Pesquisa de percepção')
  })
})
