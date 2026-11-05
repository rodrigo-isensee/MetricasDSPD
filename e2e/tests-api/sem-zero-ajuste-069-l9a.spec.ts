import { test, expect, rodarAxe } from '../fixtures/base';
import { ROTAS } from '../fixtures/constantes';
import { semParteDeAjusteDePrioridade } from '../../server/src/modulos/metricas/parte-sem-dado.ts';

// QA 069 L9-a (K-220), plano em docs/qa/069-z7-l9a.md. Roda contra a SPA em VITE_FONTE=api e a API de teste
// `server/tests/pg/api-stub-065.ts` (E2E_API_URL=http://127.0.0.1:3199), que serve S3 e S2 do núcleo do mock (com número).
// O stub não aplica a regra do L9-a; a spec intercepta S3 e S2 e passa a resposta pela MESMA função do servidor
// (`semParteDeAjusteDePrioridade`, importada sem cópia). O portão `real && !AJUSTE_PRIORIDADE_COM_FONTE` do servico.ts fica
// com o teste pg (painel-real-f6), que roda na CI. Sem banco.
const NOTA_S3 = 'Ajustes manuais de prioridade: sem dado real';
const NOTA_S2 = 'Exceção de SLA por registro posterior sem fonte';

async function aplicarRegraDoServidor(page: import('@playwright/test').Page, id: 'S3' | 'S2', capturas: unknown[]) {
  await page.route(new RegExp(`/api/v1/metricas/${id}(\\?.*)?$`), async (route) => {
    const resposta = await route.fetch();
    const corpo = await resposta.json();
    const saida = semParteDeAjusteDePrioridade(id, corpo);
    capturas.push(saida);
    await route.fulfill({ response: resposta, json: saida });
  });
}

test.describe('069 L9-a: S3 e S2 sem zero falso na base real', () => {
  test('Q69A-01 S3: ajustesManuais vira null com a nota; a tabela diz "sem dado", nunca um número', async ({ painel, page }) => {
    const capturas: unknown[] = [];
    await aplicarRegraDoServidor(page, 'S3', capturas);
    await painel.ir(ROTAS.sustentacao);
    await painel.esperarPronto();
    const c = page.getByTestId('metrica-S3');
    await c.scrollIntoViewIfNeeded();
    await expect(c.getByTestId('notas-cartao-S3')).toContainText(NOTA_S3);
    const corpo = capturas[0] as { meses: { ajustesManuais: unknown }[]; notas: string[] };
    expect(corpo.meses.length).toBeGreaterThan(0);
    for (const m of corpo.meses) expect(m.ajustesManuais).toBeNull();
    expect(corpo.notas).toContain('ajuste-prioridade-sem-dado-real');
    const tabela = c.getByTestId('tabela-S3-resumo');
    await expect(tabela.getByText('sem dado').first()).toBeVisible();
  });

  test('Q69A-02 S2: traz a nota da exceção de SLA sem fonte e mantém as prioridades', async ({ painel, page }) => {
    const capturas: unknown[] = [];
    await aplicarRegraDoServidor(page, 'S2', capturas);
    await painel.ir(ROTAS.sustentacao);
    await painel.esperarPronto();
    const c = page.getByTestId('metrica-S2');
    await c.scrollIntoViewIfNeeded();
    await expect(c.getByTestId('notas-cartao-S2')).toContainText(NOTA_S2);
    const corpo = capturas[0] as { notas: string[]; prioridades: unknown[] };
    expect(corpo.notas).toEqual(['excecao-sla-sem-fonte']);
    expect(corpo.prioridades.length).toBeGreaterThan(0);
  });

  test('Q69A-03 Sustentação com as duas notas: zero violações sérias ou críticas do axe', async ({ painel, page }) => {
    const capturas: unknown[] = [];
    await aplicarRegraDoServidor(page, 'S3', capturas);
    await aplicarRegraDoServidor(page, 'S2', capturas);
    await painel.ir(ROTAS.sustentacao);
    await painel.esperarPronto();
    await expect(page.getByTestId('notas-cartao-S3')).toBeVisible();
    await expect(page.getByTestId('notas-cartao-S2')).toBeVisible();
    const r = await rodarAxe(page);
    expect(r.bloqueantes, JSON.stringify(r.bloqueantes)).toEqual([]);
  });
});
