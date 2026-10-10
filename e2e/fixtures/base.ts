import { AxeBuilder } from '@axe-core/playwright';
import { test as base, expect, type Page } from '@playwright/test';
import { PainelPage } from '../pages/PainelPage';
import { AXE_TAGS } from './constantes';

/** Violações do axe separadas por gravidade (critérios 94 e 111: sérias/críticas bloqueiam; as outras são relatadas). */
export interface RelatorioAxe {
  bloqueantes: { id: string; impacto: string | null | undefined; ajuda: string; nos: number; alvo: string[] }[];
  informativas: { id: string; impacto: string | null | undefined; ajuda: string; nos: number; alvo: string[] }[];
}

export async function rodarAxe(page: Page, opcoes: { incluir?: string; excluir?: string[] } = {}): Promise<RelatorioAxe> {
  let b = new AxeBuilder({ page }).withTags(AXE_TAGS);
  if (opcoes.incluir) b = b.include(opcoes.incluir);
  for (const e of opcoes.excluir ?? []) b = b.exclude(e);
  const { violations } = await b.analyze();
  const mapa = (v: (typeof violations)[number]) => ({ id: v.id, impacto: v.impact, ajuda: v.help, nos: v.nodes.length, alvo: v.nodes.slice(0, 3).map((n) => n.target.join(' ')) });
  return {
    bloqueantes: violations.filter((v) => v.impact === 'critical' || v.impact === 'serious').map(mapa),
    informativas: violations.filter((v) => v.impact !== 'critical' && v.impact !== 'serious').map(mapa),
  };
}

interface Fixtures {
  painel: PainelPage;
  /** Erros de console, exceções e requisições falhas coletados durante o teste (ST-13). */
  problemas: string[];
}

export const test = base.extend<Fixtures>({
  painel: async ({ page }, use) => {
    await use(new PainelPage(page));
  },
  problemas: async ({ page }, use) => {
    const lista: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') lista.push(`console.error: ${m.text()}`);
    });
    page.on('pageerror', (e) => lista.push(`pageerror: ${e.message}`));
    page.on('requestfailed', (r) => lista.push(`requestfailed: ${r.url()} ${r.failure()?.errorText ?? ''}`));
    await use(lista);
  },
});

export { expect };
