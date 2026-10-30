// K-133 (pedido 048, E3): CLS de /tatico, F2 da ADR 0003 (abaixo de 0,1), em cada equipe do mock e sem equipe.
// Obrigação: a reserva da faixa "Pede atenção" (88 px com equipe, 130 px sem) não desloca o núcleo ao carregar, inclusive na
// equipe cuja faixa quebra em duas linhas (achado A1 do review). A latência simulada fica LIGADA: sem ela não há carregamento a medir.
import { test, expect } from '@playwright/test';
import { ORCAMENTO, SLUGS } from '../fixtures/constantes';
import { PainelPage } from '../pages/PainelPage';
import { instalarObservadores, lerVitais } from './lcp';

const CARGAS = Number(process.env.PERF_CLS_CARGAS ?? 5);
// guarda contra suíte vazia: o mock tem ao menos 5 equipes de fluxo
const EQUIPES: readonly (string | null)[] = [null, ...SLUGS.equipesFluxo];

test.describe('perf-cls-tatico-equipes', () => {
  test.describe.configure({ mode: 'serial' });
  test('a lista de equipes tem ao menos 5', () => {
    expect(SLUGS.equipesFluxo.length).toBeGreaterThanOrEqual(5);
  });
  for (const equipe of EQUIPES) {
    test(`F2 CLS de /tatico ${equipe ? `com equipe=${equipe}` : 'sem equipe'}`, async ({ page }) => {
      test.setTimeout(5 * 60_000);
      await instalarObservadores(page);
      const painel = new PainelPage(page);
      const medidas: number[] = [];
      for (let i = 0; i < CARGAS; i++) {
        await painel.ir(equipe ? `/tatico?equipe=${equipe}` : '/tatico');
        await painel.esperarPronto();
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
        medidas.push((await lerVitais(page)).cls);
      }
      const max = Math.max(...medidas);
      console.log(`[cls-tatico] ${equipe ?? 'sem-equipe'}: max=${max.toFixed(3)} cargas=${medidas.map((m) => m.toFixed(3)).join(' ')}`);
      expect(max, `F2 CLS de /tatico (${equipe ?? 'sem equipe'})`).toBeLessThan(ORCAMENTO.F2_cls);
    });
  }
});
