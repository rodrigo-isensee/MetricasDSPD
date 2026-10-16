import { writeFile } from 'node:fs/promises';
import { test, expect, rodarAxe } from '../fixtures/base';

// QA do acabamento de UX (L-3 a L-8): screenshots do cartão PV1, axe em claro e escuro e contraste real da rampa azul.
// Plano e parecer: docs/qa/acabamento-ux.md. Saída: docs/qa/evidencias/acabamento-ux/.
const OUT = '../docs/qa/evidencias/acabamento-ux';
const TELAS = [[1280, 800], [375, 812]] as const;
const TEMAS = ['claro', 'escuro'] as const;

for (const [w, h] of TELAS) {
  for (const t of TEMAS) {
    test(`acabamento-ux: cartão PV1 ${w} ${t}`, async ({ page, painel }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.addInitScript((tt) => localStorage.setItem('metricas-dspd:tema', tt), t);
      await painel.ir('/operacional?cadencia=sustentacao');
      await painel.esperarCartoesProntos();
      const cartao = page.getByTestId('metrica-PV1');
      await expect(cartao.getByTestId('pv1-participacao')).toBeVisible();
      await expect(cartao).not.toHaveAttribute('aria-busy', 'true');
      await expect(page.locator('html')).toHaveAttribute('data-theme', t === 'claro' ? 'light' : 'dark');
      await cartao.scrollIntoViewIfNeeded();
      await cartao.screenshot({ path: `${OUT}/pv1-${w}-${t}.png` });

      const axe = await rodarAxe(page);
      expect(axe.bloqueantes).toEqual([]);
      const axeCartao = await rodarAxe(page, { incluir: '[data-testid="metrica-PV1"]' });

      const medidas = await page.evaluate(() => {
        const cv = document.createElement('canvas');
        cv.width = cv.height = 1;
        const ctx = cv.getContext('2d', { willReadFrequently: true })!;
        const rgba = (cor: string) => {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = '#000';
          ctx.fillStyle = cor;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
          return [r, g, b, (a ?? 255) / 255] as [number, number, number, number];
        };
        const fundoOpaco = (el: Element | null): [number, number, number] => {
          for (let e = el; e; e = e.parentElement) {
            const c = rgba(getComputedStyle(e).backgroundColor);
            if (c[3] === 1) return [c[0], c[1], c[2]];
          }
          return [255, 255, 255];
        };
        const faixas = Array.from(document.querySelectorAll('[data-testid="metrica-PV1"] [data-faixa]'));
        return faixas.slice(0, 5).map((el) => {
          const cs = getComputedStyle(el);
          const bg = rgba(cs.backgroundColor);
          const base = fundoOpaco(el.parentElement);
          const comp = [0, 1, 2].map((i) => Math.round(bg[i]! * bg[3] + base[i]! * (1 - bg[3])));
          const tx = rgba(cs.color);
          return { faixa: el.getAttribute('data-faixa'), fundoBase: base, bgRgba: bg, composto: comp, texto: tx.slice(0, 3), bordaLargura: parseFloat(cs.borderTopWidth), borda: rgba(cs.borderTopColor).slice(0, 3) };
        });
      });
      // WCAG 1.4.11: a borda de cada trecho (ou o preenchimento) precisa de 3:1 contra o fundo do cartão.
      const lum = (c: number[]) => {
        const [r, g, b] = c.map((v) => { const x = v! / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
        return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
      };
      const razao = (a: number[], b: number[]) => {
        const [x, y] = [lum(a), lum(b)];
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      };
      expect(medidas).toHaveLength(5);
      const contrastes = medidas.map((m) => ({
        faixa: m.faixa,
        borda: Number(razao(m.borda, m.fundoBase).toFixed(2)),
        preenchimento: Number(razao(m.composto, m.fundoBase).toFixed(2)),
      }));
      for (const [i, m] of medidas.entries()) {
        expect(m.bordaLargura, `faixa ${m.faixa} sem borda`).toBeGreaterThan(0);
        expect(contrastes[i]!.borda, `faixa ${m.faixa} (${t}) borda/fundo`).toBeGreaterThanOrEqual(3);
      }
      await writeFile(
        `${OUT}/medidas-${w}-${t}.json`,
        JSON.stringify({ axeCartao, axePagina: axe, medidas, contrastes }, null, 1),
      );
    });
  }
}
