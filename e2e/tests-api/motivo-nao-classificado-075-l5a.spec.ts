import { test, expect, rodarAxe } from '../fixtures/base'
import { ROTAS } from '../fixtures/constantes'
import { completarReferencia } from '../fixtures/referencia-completa'

// QA 075 lote 5a (E1.8, K-204): axe do projeto (@axe-core/playwright, tags WCAG 2.2 AA, com a regra color-contrast) sobre BLOQUEADOS, O2 e O19
// com o motivo "não classificado" na tela. A massa do E2E não traz o motivo; a resposta da API é simulada por page.route (sem tocar no
// servidor nem no web/src). Roda contra a SPA em VITE_FONTE=api e o stub `server/tests/pg/api-stub-065.ts` (E2E_API_URL=http://127.0.0.1:3199).
// O stub devolve sem-dado-real para BLOQUEADOS e O19 (fora do mapa real): os corpos abaixo seguem o contrato (formas lidas do núcleo do mock).
const NC = 'não classificado'
const JANELA = { inicio: '2026-07-18', fim: '2026-10-09', unidade: 'semanas', quantidade: 12 }
const duracao = (n: number) => ({ status: 'ok', n, valor: { p50: 1, p85: 2, p95: 4 }, janela: JANELA })
const motivo = (nome: string, b: number, d: number) => ({
  motivo: nome,
  bloqueios: b,
  diasUteis: d,
  pctDoTotal: { status: 'ok', bloqueios: b, diasUteis: d, totalDiasUteis: 100, pct: d },
  duracao: duracao(b),
})
const BLOQUEADOS = {
  base: { n: 2, unidade: 'itens bloqueados', janela: null },
  criterios: { serie: [], janela: [] },
  itens: [
    { cardId: 'S-1', titulo: 'Item sem motivo', tipo: 'Requisição', etapa: 'Em desenvolvimento', motivo: NC, fornecedor: null, bloqueadoHaDiasUteis: 9 },
    { cardId: 'S-2', titulo: 'Item com motivo', tipo: 'Melhoria', etapa: 'Em desenvolvimento', motivo: 'Janela de mudança', fornecedor: null, bloqueadoHaDiasUteis: 2 },
  ],
}
const O19 = {
  base: { n: 80, unidade: 'bloqueios encerrados', janela: { inicio: JANELA.inicio, fim: JANELA.fim } },
  criterios: { serie: [], janela: [] },
  motivos: [motivo(NC, 40, 70), motivo('Janela de mudança', 25, 20), motivo('Aguardando fornecedor', 30, 10)],
  abertosForaDaSoma: 0,
  totalDiasUteis: 100,
}

async function simular(page: import('@playwright/test').Page) {
  await completarReferencia(page)
  await page.route(/\/api\/v1\/metricas\/BLOQUEADOS(\?.*)?$/, (r) => r.fulfill({ json: BLOQUEADOS }))
  await page.route(/\/api\/v1\/metricas\/O19(\?.*)?$/, (r) => r.fulfill({ json: O19 }))
  await page.route(/\/api\/v1\/metricas\/O2(\?.*)?$/, async (route) => {
    const resposta = await route.fetch()
    const corpo = (await resposta.json()) as { notas?: string[]; itens: Record<string, unknown>[] }
    corpo.notas = []
    for (const i of corpo.itens) i.bloqueioMotivo = NC
    await route.fulfill({ response: resposta, json: corpo })
  })
}

for (const tema of ['claro', 'escuro'] as const) {
  test(`Q75-5A-AXE (${tema}) BLOQUEADOS, O2 e O19 com "${NC}": zero violações do axe, incluída color-contrast`, async ({ painel, page }) => {
    await page.addInitScript((t) => localStorage.setItem('metricas-dspd:tema', t), tema)
    await simular(page)
    // BLOQUEADOS e O2 ficam na visão diária; o O19, em "Mais métricas" da visão semanal
    const telas: [string, string[]][] = [
      [ROTAS.operacional, ['BLOQUEADOS', 'O2']],
      [ROTAS.operacionalSemanal, ['O19']],
    ]
    for (const [rota, ids] of telas) {
      await painel.ir(rota)
      await painel.esperarPronto()
      await expect(page.locator('html')).toHaveAttribute('data-theme', tema === 'escuro' ? 'dark' : 'light')
      const det = page.getByTestId('mais-metricas')
      if ((await det.count()) > 0 && (await det.getAttribute('open')) === null) await det.locator('summary').click()
      await painel.esperarPronto()
      for (const id of ids) {
        const c = page.getByTestId(`metrica-${id}`)
        await c.scrollIntoViewIfNeeded()
        await expect(c, id).toHaveAttribute('data-estado', 'ok')
        await expect(c.getByText(NC).first(), id).toBeVisible()
        // axe só no cartão (include), todas as regras das tags, sem separar por gravidade: qualquer violação reprova
        const r = await rodarAxe(page, { incluir: `[data-testid="metrica-${id}"]` })
        expect([...r.bloqueantes, ...r.informativas], `${id} (${tema})`).toEqual([])
        // color-contrast roda dentro do axe acima; aqui só ela, no cartão, e exige que tenha sido avaliada
        const { AxeBuilder } = await import('@axe-core/playwright')
        const contraste = await new AxeBuilder({ page }).include(`[data-testid="metrica-${id}"]`).withRules(['color-contrast']).analyze()
        expect(contraste.violations, `${id} color-contrast (${tema})`).toEqual([])
        expect(contraste.passes.length + contraste.incomplete.length, `${id} color-contrast avaliada`).toBeGreaterThan(0)
      }
    }
  })
}
