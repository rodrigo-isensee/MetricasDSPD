import type { Page } from '@playwright/test'

// O stub `server/tests/pg/api-stub-065.ts` (E2E sem banco) devolve /referencia só com `dataReferencia`; o contrato (`referenciaSchema`,
// strict) exige também `ultimaColeta` e `versaoCriterio`, e o simulado do 070 precisa do dia de referência: sem isto a web registra
// "Resposta fora do contrato /referencia", o mock não nasce e todo cartão simulável cai em "Sem dado real". Completa o corpo com o
// `dataReferencia` do próprio stub. Com a API real (Postgres) o corpo já vem completo e a rota não muda nada.
export async function completarReferencia(page: Page): Promise<void> {
  await page.route(/\/api\/v1\/referencia(\?.*)?$/, async (route) => {
    const resposta = await route.fetch();
    const corpo = (await resposta.json()) as { dataReferencia: string; ultimaColeta?: unknown; versaoCriterio?: string };
    if (corpo.ultimaColeta && corpo.versaoCriterio) return route.fulfill({ response: resposta });
    const d = corpo.dataReferencia;
    await route.fulfill({
      response: resposta,
      json: { dataReferencia: d, ultimaColeta: { businessmap: `${d}T06:00:00-03:00`, acelerato: `${d}T06:00:00-03:00` }, versaoCriterio: 'teste' },
    });
  });
}
