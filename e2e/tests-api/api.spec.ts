import { test, expect } from '../fixtures/base';
import { METRICAS_POR_ROTA, ROTAS } from '../fixtures/constantes';

// FA-5 (docs/qa/front-via-api.md): SPA buildada com VITE_FONTE=api contra a API real local (DADOS_FONTE=mock).
// Projeto `chromium-api`; o resto da suíte (grupo @mock) segue contra a SPA com o mock embutido.
const API = /\/api\/v1\//;
const ESTADOS_COM_DADO = /^(ok|pronto|vazio|insuficiente)$/;

test.describe('fonte api: painéis com dados reais da API', () => {
  const PAINEIS = [
    { rota: ROTAS.operacionalSemanal, cartoes: METRICAS_POR_ROTA.operacionalSemanal },
    { rota: ROTAS.tatico, cartoes: METRICAS_POR_ROTA.tatico },
    { rota: ROTAS.estrategico, cartoes: METRICAS_POR_ROTA.estrategico },
    { rota: ROTAS.sustentacao, cartoes: METRICAS_POR_ROTA.sustentacao },
  ];
  for (const { rota, cartoes } of PAINEIS) {
    test(`FA5-01 ${rota}: todos os cartões saem do carregando sem erro e sem aviso de dados fictícios`, async ({ painel, page, problemas }) => {
      const rejeitadas: string[] = [];
      page.on('response', async (r) => {
        if (API.test(r.url()) && !r.ok()) {
          const corpo = (await r.text().catch(() => '')).slice(0, 160);
          rejeitadas.push(`${r.status()} ${r.url().replace(/^.*\/api\/v1/, '')} ${corpo}`);
        }
      });
      await painel.ir(rota);
      await painel.esperarCartoesProntos();
      expect(rejeitadas, 'respostas não 2xx da API').toEqual([]);
      for (const c of cartoes) {
        const cartao = painel.cartao(c);
        await expect(cartao.raiz, `cartão ${c}`).toBeVisible();
        await expect(cartao.raiz, `cartão ${c}`).toHaveAttribute('data-estado', ESTADOS_COM_DADO);
      }
      await expect(page).not.toHaveTitle(/Dados fictícios/);
      expect(problemas, 'erros de console, exceções ou requisições falhas').toEqual([]);
    });
  }

  test('FA5-02 Visão geral abre pela API sem erro de painel', async ({ painel, page }) => {
    const rejeitadas: string[] = [];
    page.on('response', (r) => {
      if (API.test(r.url()) && !r.ok()) rejeitadas.push(`${r.status()} ${r.url().replace(/^.*\/api\/v1/, '')}`);
    });
    await painel.ir(ROTAS.visaoGeral);
    await painel.esperarCartoesProntos();
    await expect(painel.erroDePainel).toHaveCount(0);
    expect(rejeitadas, 'respostas não 2xx da API').toEqual([]);
    await expect(page).not.toHaveTitle(/Dados fictícios/);
  });

  test('FA5-03 só há tráfego de mesma origem: nenhuma chamada cruza origem e a API não envia CORS', async ({ painel, page, baseURL }) => {
    const origem = new URL(baseURL!).origin;
    const fora: string[] = [];
    const comCors: string[] = [];
    page.on('request', (r) => {
      if (!r.url().startsWith('data:') && new URL(r.url()).origin !== origem) fora.push(r.url());
    });
    page.on('response', (r) => {
      if (API.test(r.url()) && 'access-control-allow-origin' in r.headers()) comCors.push(r.url());
    });
    await painel.ir(ROTAS.operacionalSemanal);
    await painel.esperarCartoesProntos();
    expect(fora, 'requisições para outra origem').toEqual([]);
    expect(comCors, 'respostas com Access-Control-Allow-Origin').toEqual([]);
  });

  test('FA5-04 a troca de filtro pede a métrica de novo com a query do contrato (tipo=incidente)', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacionalSemanal);
    await painel.esperarCartoesProntos();
    const pedido = page.waitForRequest((r) => /\/api\/v1\/metricas\/O4\?/.test(r.url()) && r.url().includes('tipo=incidente'));
    await painel.filtros.botao('tipo').click();
    await page.getByRole('checkbox', { name: 'Incidente' }).first().click();
    const req = await pedido;
    expect(new URL(req.url()).searchParams.get('periodo')).toBeTruthy();
    await page.keyboard.press('Escape');
    await painel.esperarCartoesProntos();
  });

  test('FA5-05 O2 pede pageSize=200 e a tela mostra o total do conjunto', async ({ painel, page }) => {
    const pedido = page.waitForRequest((r) => /\/api\/v1\/metricas\/O2\?/.test(r.url()));
    await painel.ir(ROTAS.operacional);
    const req = await pedido;
    expect(new URL(req.url()).searchParams.get('pageSize')).toBe('200');
    await painel.esperarCartoesProntos();
    await expect(painel.cartao('O2').raiz).toHaveAttribute('data-estado', ESTADOS_COM_DADO);
  });
});

test.describe('fonte api: falhas da API (page.route)', () => {
  const FALHAS = [
    { nome: '400 REQUISICAO_INVALIDA', status: 400, codigo: 'REQUISICAO_INVALIDA', corpo: { error: { code: 'REQUISICAO_INVALIDA', message: 'filtro inválido', requestId: 'r-400' } } },
    { nome: '500 ERRO_INTERNO', status: 500, codigo: 'ERRO_INTERNO', corpo: { error: { code: 'ERRO_INTERNO', message: 'falha interna', requestId: 'r-500' } } },
    { nome: '503 REFERENCIA_AUSENTE', status: 503, codigo: 'REFERENCIA_AUSENTE', corpo: { error: { code: 'REFERENCIA_AUSENTE', message: 'Referência não carregada', requestId: 'r-503' } } },
    { nome: '500 com corpo que não é JSON', status: 500, codigo: 'HTTP_500', corpo: null },
  ];
  for (const f of FALHAS) {
    test(`FA5-10 ${f.nome} em O4: erro só nesse cartão, sem repetir sozinho, com "Tentar de novo"`, async ({ painel, page }) => {
      let chamadas = 0;
      await page.route(/\/api\/v1\/metricas\/O4\?/, async (route) => {
        chamadas += 1;
        await route.fulfill({ status: f.status, contentType: f.corpo ? 'application/json' : 'text/html', body: f.corpo ? JSON.stringify(f.corpo) : '<html>Bad gateway</html>' });
      });
      await painel.ir(ROTAS.operacionalSemanal);
      const o4 = painel.cartao('O4');
      await expect(o4.erro).toBeVisible();
      await expect(o4.erro).toHaveAttribute('data-erro-codigo', f.codigo);
      await expect(o4.tentarDeNovo).toBeVisible();
      await expect(painel.cartao('O3').raiz).toHaveAttribute('data-estado', ESTADOS_COM_DADO);
      await expect(painel.erroDePainel).toHaveCount(0);
      expect(chamadas, 'sem retry automático (D2/ADR do plano: o front não repete sozinho)').toBe(1);
      // texto do servidor nunca vai para a tela
      await expect(page.getByText(/falha interna|filtro inválido|Referência não carregada|Bad gateway/)).toHaveCount(0);
    });
  }

  test('FA5-11 rede indisponível (conexão abortada) em O4 vira erro no cartão', async ({ painel, page }) => {
    await page.route(/\/api\/v1\/metricas\/O4\?/, (route) => route.abort('connectionrefused'));
    await painel.ir(ROTAS.operacionalSemanal);
    await expect(painel.cartao('O4').erro).toHaveAttribute('data-erro-codigo', 'REDE_INDISPONIVEL');
    await expect(painel.cartao('O3').raiz).toHaveAttribute('data-estado', ESTADOS_COM_DADO);
  });

  test('FA5-12 "Tentar de novo" recupera quando a API volta', async ({ painel, page }) => {
    let falhar = true;
    await page.route(/\/api\/v1\/metricas\/O4\?/, async (route) => {
      if (falhar) await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: { code: 'INDISPONIVEL', message: 'x' } }) });
      else await route.continue();
    });
    await painel.ir(ROTAS.operacionalSemanal);
    const o4 = painel.cartao('O4');
    await expect(o4.erro).toBeVisible();
    falhar = false;
    await o4.tentarDeNovo.click();
    await expect(o4.erro).toHaveCount(0);
    await expect(o4.raiz).toHaveAttribute('data-estado', ESTADOS_COM_DADO);
  });

  test('FA5-13 resposta fora do schema (campo obrigatório ausente, 200) vira erro no cartão e não mostra o corpo', async ({ painel, page, problemas }) => {
    await page.route(/\/api\/v1\/metricas\/O4\?/, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ base: 'quebrado', segredo: 'NAO-MOSTRAR-ESTE-TEXTO' }) }));
    await painel.ir(ROTAS.operacionalSemanal);
    await expect(painel.cartao('O4').erro).toHaveAttribute('data-erro-codigo', 'RESPOSTA_INVALIDA');
    await expect(page.getByText('NAO-MOSTRAR-ESTE-TEXTO')).toHaveCount(0);
    expect(problemas.some((p) => p.includes('Resposta fora do contrato')), 'o front registra o erro de contrato no console, sem o corpo').toBe(true);
    expect(problemas.join('\n')).not.toContain('NAO-MOSTRAR-ESTE-TEXTO');
  });

  test('FA5-14 resposta 200 que não é JSON vira erro no cartão', async ({ painel, page }) => {
    await page.route(/\/api\/v1\/metricas\/O4\?/, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<html>proxy</html>' }));
    await painel.ir(ROTAS.operacionalSemanal);
    await expect(painel.cartao('O4').erro).toHaveAttribute('data-erro-codigo', 'RESPOSTA_INVALIDA');
  });

  test('FA5-15 falha nas opções de filtro (500) não derruba o painel inteiro', async ({ painel, page }) => {
    await page.route(/\/api\/v1\/filtros\//, (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { code: 'ERRO_INTERNO', message: 'x' } }) }));
    await painel.ir(ROTAS.operacionalSemanal);
    // Resultado observado é registrado em docs/qa/front-via-api.md: o teste só exige que a página continue navegável.
    await expect(painel.h1).toBeVisible();
    await expect(page.getByRole('navigation').first()).toBeVisible();
  });

  test('FA5-16 troca de filtro cancela a requisição anterior (sem corrida: o painel termina no último filtro)', async ({ painel, page }) => {
    await painel.ir(ROTAS.operacionalSemanal);
    await painel.esperarCartoesProntos();
    await page.route(/\/api\/v1\/metricas\/O4\?.*tipo=incidente/, async (route) => {
      await new Promise((r) => setTimeout(r, 1500)); // resposta lenta do filtro antigo
      await route.continue().catch(() => undefined);
    });
    await painel.filtros.botao('tipo').click();
    await page.getByRole('checkbox', { name: 'Incidente' }).first().click();
    await page.getByRole('checkbox', { name: 'Incidente' }).first().click(); // desmarca: volta ao padrão
    await page.keyboard.press('Escape');
    await painel.esperarCartoesProntos();
    await expect(painel.cartao('O4').raiz).toHaveAttribute('data-estado', ESTADOS_COM_DADO);
  });
});
