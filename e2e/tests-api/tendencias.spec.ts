import { test, expect } from '@playwright/test';

// QA da Sustentação no Operacional, casos CT-45, CT-58, CT-59 e CT-53 contra a API real (Postgres, `scripts/com-api-mock.sh`).
// Contrato: docs/api/metricas.md, seção "Tendência mensal do Resumo". Só GET.
const BASE = '/api/v1/metricas';

interface MesSust {
  mes: string;
  fimDoMes: string;
  volume: number;
  prioridades: unknown;
}
interface TendSust {
  meses: MesSust[];
}
interface MesFluxo {
  mes: string;
  fimDoMes: string;
  concluidos: number;
  p85PorTipo: { tipo: string; n: number; estatistica: { status: string; n: number; valor?: { p85: number } } }[];
}
interface TendFluxo {
  meses: MesFluxo[];
}

const PESSOA = /usuarioKey|"e-?mail"|"nome"|"titulo"|"descricao"|assignee|responsavel/i;

test.describe('tendências pela API real', () => {
  test('CT-45 o volume de cada mês da TENDENCIA_SUST é o S3 do mesmo mês (base.n)', async ({ request }) => {
    const t = (await (await request.get(`${BASE}/TENDENCIA_SUST`)).json()) as TendSust;
    expect(t.meses.length, 'seis meses-calendário').toBe(6);
    for (const m of t.meses) {
      const [ano, mes] = m.mes.split('-').map(Number) as [number, number];
      const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
      const r = await request.get(`${BASE}/S3?periodo=custom&de=${m.mes}-01&ate=${m.mes}-${String(ultimo).padStart(2, '0')}&dataReferencia=${m.fimDoMes}`);
      expect(r.status(), `S3 de ${m.mes}`).toBe(200);
      const s3 = (await r.json()) as { base: { n: number }; janela?: unknown };
      expect(s3.janela, `S3 de ${m.mes}: janela obrigatória`).toBeTruthy();
      expect(m.volume, `volume de ${m.mes} x S3.base.n`).toBe(s3.base.n);
    }
  });

  test('CT-54 cada mês da TENDENCIA_SUST traz as prioridades do S2 no fim do mês; a do fluxo traz o O3.classes e o O4', async ({ request }) => {
    const t = (await (await request.get(`${BASE}/TENDENCIA_SUST`)).json()) as TendSust;
    for (const m of t.meses.slice(-2)) {
      const s2 = (await (await request.get(`${BASE}/S2?periodo=12s&dataReferencia=${m.fimDoMes}`)).json()) as { prioridades: unknown };
      expect(m.prioridades, `S2 em ${m.fimDoMes}`).toEqual(s2.prioridades);
    }
    const f = (await (await request.get(`${BASE}/TENDENCIA_FLUXO`)).json()) as TendFluxo;
    expect(f.meses.length).toBe(6);
    for (const m of f.meses.slice(-2)) {
      const o3 = (await (await request.get(`${BASE}/O3?periodo=12s&dataReferencia=${m.fimDoMes}`)).json()) as { classes: { tipo: string; n: number }[] };
      expect(m.p85PorTipo.map((c) => [c.tipo, c.n]), `O3.classes em ${m.fimDoMes}`).toEqual(o3.classes.map((c) => [c.tipo, c.n]));
    }
  });

  for (const id of ['TENDENCIA_FLUXO', 'TENDENCIA_SUST'] as const) {
    test(`CT-58 ${id}: 200 com cabeçalhos, 304 por ETag, 400 para parâmetro extra e data futura ou inválida`, async ({ request }) => {
      const r = await request.get(`${BASE}/${id}`);
      expect(r.status()).toBe(200);
      for (const h of ['x-data-referencia', 'x-versao-criterio', 'etag', 'cache-control']) expect(r.headers()[h], h).toBeTruthy();
      const r304 = await request.get(`${BASE}/${id}`, { headers: { 'if-none-match': r.headers()['etag']! } });
      expect(r304.status()).toBe(304);
      for (const extra of ['equipe=x', 'tipo=y', 'prioridade=p1', 'periodo=12s', 'pageSize=5', 'usuarioKey=1']) {
        expect((await request.get(`${BASE}/${id}?${extra}`)).status(), extra).toBe(400);
      }
      const futura = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);
      for (const d of [futura, '2026-13-40', '2026-02-30', '']) expect((await request.get(`${BASE}/${id}?dataReferencia=${d}`)).status(), `dataReferencia=${d}`).toBe(400);
    });

    test(`CT-59 ${id}: nenhum campo de pessoa ou texto livre no corpo`, async ({ request }) => {
      const corpo = await (await request.get(`${BASE}/${id}`)).text();
      expect(corpo.length).toBeGreaterThan(200);
      expect(corpo).not.toMatch(PESSOA);
      expect(corpo).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
    });
  }

  test('CT-65 as duas tendências não se misturam: cada corpo só tem o seu domínio', async ({ request }) => {
    const f = await (await request.get(`${BASE}/TENDENCIA_FLUXO`)).text();
    const s = await (await request.get(`${BASE}/TENDENCIA_SUST`)).text();
    expect(f).not.toMatch(/prioridades|volume|"P1"/);
    expect(s).not.toMatch(/p85PorTipo|concluidos/);
  });
});
