import type { Page } from '@playwright/test'
import { expect, rodarAxe, test } from '../fixtures/base'

// QA do O17 por sistema com dado real (pedido 099, B' da Q-099-7): subtítulos, estado "Sem dado real" só na causa raiz,
// axe AA no cartão nos dois temas. O stub da API (api-stub-065) não conhece o filtro de Sustentação do O17 e responde 500;
// por isso a resposta do O17 é fornecida aqui, com o formato do contrato resultados/O17 (base real: porCausa nulo).
const ROTA = '/operacional?cadencia=sustentacao'
const URL_O17 = /\/api\/v1\/metricas\/O17(\?.*)?$/
const MOTIVO = 'aguardando o Registro de Problemas com vínculo ao incidente (a causa aparente não é a causa raiz)'
const JANELA = { inicio: '2026-04-10', fim: '2026-10-09' }
const SISTEMAS = [
  { sistema: 'Protheus - Compras', n: 300 },
  { sistema: 'Fluig - Portal', n: 210 },
  { sistema: 'Senior - Folha', n: 120 },
  { sistema: 'Protheus - Faturamento', n: 40 },
]

type Variante = 'com-causa' | 'base-real' | 'base-real-vazia'

function corpo(v: Variante) {
  const vazia = v === 'base-real-vazia'
  const sistemas = vazia ? [] : SISTEMAS
  const n = sistemas.reduce((t, s) => t + s.n, 0)
  return {
    base: { n, unidade: 'incidentes encerrados', janela: JANELA },
    criterios: { serie: [], janela: [] },
    campoDisponivel: v === 'com-causa',
    motivoCausaRaiz: v === 'com-causa' ? null : MOTIVO,
    porCausa:
      v === 'com-causa'
        ? [
            { causa: 'Requisito', n: 100 },
            { causa: 'Código', n: 400 },
            { causa: 'Configuração', n: 170 },
          ]
        : null,
    porSistema: sistemas,
  }
}

async function abrirO17(page: Page, tema: 'claro' | 'escuro', v: Variante) {
  await page.emulateMedia({ colorScheme: tema === 'escuro' ? 'dark' : 'light' })
  await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t), tema)
  await page.route(URL_O17, (route) => route.fulfill({ status: 200, contentType: 'application/json', json: corpo(v) }))
  await page.goto(ROTA)
  await page.getByTestId('mais-metricas').locator('summary').click()
  const cartao = page.getByTestId('metrica-O17')
  await expect(cartao).toHaveAttribute('data-estado', /^(ok|vazio|insuficiente)$/)
  return cartao
}

for (const tema of ['claro', 'escuro'] as const) {
  test.describe(`O17 por sistema, tema ${tema}`, () => {
    test(`QA-O17-1 base real: "Sem dado real" só na causa raiz, por sistema publicado, sem Metabase, axe AA (${tema})`, async ({ page }) => {
      const cartao = await abrirO17(page, tema, 'base-real')
      await expect(cartao.getByRole('heading', { level: 4, name: 'Por causa raiz' })).toBeVisible()
      await expect(cartao.getByRole('heading', { level: 4, name: 'Por sistema' })).toBeVisible()
      await expect(cartao).toContainText('Sem dado real')
      await expect(cartao).toContainText('Registro de Problemas')
      await expect(cartao).toContainText('Protheus - Compras')
      await expect(cartao).not.toContainText('Metabase')
      await expect(cartao.getByTestId('selo-ficticio')).toHaveCount(0)
      await expect(cartao).not.toContainText('Não informada')
      await expect(cartao).not.toContainText('a lista de causas é uma proposta do time')
      const r = await rodarAxe(page, { incluir: '[data-testid="metrica-O17"]' })
      expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
      const contraste = [...r.bloqueantes, ...r.informativas].filter((x) => x.id === 'color-contrast')
      expect(contraste, JSON.stringify(contraste)).toEqual([])
    })

    test(`QA-O17-2 com causa: subtítulos e frase da lista, sem "Sem dado real", axe AA (${tema})`, async ({ page }) => {
      const cartao = await abrirO17(page, tema, 'com-causa')
      await expect(cartao.getByRole('heading', { level: 4, name: 'Por causa raiz' })).toBeVisible()
      await expect(cartao.getByRole('heading', { level: 4, name: 'Por sistema' })).toBeVisible()
      await expect(cartao).toContainText('A causa raiz vem do Registro de Problemas; a lista de causas é uma proposta do time.')
      await expect(cartao).not.toContainText('Sem dado real')
      await expect(cartao).not.toContainText('Metabase')
      const r = await rodarAxe(page, { incluir: '[data-testid="metrica-O17"]' })
      expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
    })

    test(`QA-O17-3 base real sem incidentes no período: estado vazio honesto (sem gráfico, sem número inventado) e o axe passa (${tema})`, async ({ page }) => {
      const cartao = await abrirO17(page, tema, 'base-real-vazia')
      await expect(cartao).toHaveAttribute('data-estado', 'vazio')
      await expect(cartao).toContainText('Nenhum item encontrado')
      await expect(cartao).not.toContainText('NaN')
      await expect(cartao).not.toContainText('Não foi possível carregar')
      const r = await rodarAxe(page, { incluir: '[data-testid="metrica-O17"]' })
      expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([])
    })
  })
}
