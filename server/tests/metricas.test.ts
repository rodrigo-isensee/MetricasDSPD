import { gzipSync } from 'node:zlib';
import { METRICA_IDS } from '@metricas-dspd/contratos';
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao';
import { gerarBaseMock, gerarExtensoesMock } from '@metricas-dspd/mock';
import { EXTENSAO_TAMBEM_BM_VAZIA } from '@metricas-dspd/metricas/businessmap';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { paginarO2 } from '../src/modulos/metricas/rotas.js';
import { extensaoTambemMock } from '../src/plataforma/db/extensoes-mock.js';
import { normalizar, ServicoMetricas, TTL_VERSAO_MS } from '../src/modulos/metricas/index.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg, type Respondedor } from './duble-pg.js';

const AGORA = new Date('2026-10-10T15:00:00Z');
const base = gerarBaseMock({ escala: 0.25 });
const PESSOA = /responsavel|responsaveis|agente|autor|usuario|pessoa|ranking|assignee|owner/i;

const chaves = (v: unknown, out = new Set<string>()): Set<string> => {
  if (Array.isArray(v)) v.forEach((x) => chaves(x, out));
  else if (v !== null && typeof v === 'object') for (const [k, x] of Object.entries(v)) { out.add(k); chaves(x, out); }
  return out;
};

async function montar(r: Respondedor = bancoDoMock(base), agora = () => AGORA) {
  const d = criarDublePg(r);
  const app = await buildApp({ db: d.pool, agora, nivelLog: 'silent' });
  return { app, d };
}
const get = async (app: Awaited<ReturnType<typeof montar>>['app'], url: string) => app.inject(url);
const consultasA = (d: { chamadas: { texto: string }[] }, trecho: string): number => d.chamadas.filter((c) => c.texto.includes(trecho)).length;

describe('GET /api/v1/metricas/:id', () => {
  it('200 com DTO válido, cabeçalhos e ETag; If-None-Match devolve 304', async () => {
    const { app } = await montar();
    const r = await get(app, '/api/v1/metricas/O1');
    expect(r.statusCode).toBe(200);
    expect(r.headers['cache-control']).toBe('private, max-age=60');
    expect(r.headers['x-data-referencia']).toBe('2026-10-09');
    expect(r.headers['x-versao-criterio']).toBe('2');
    expect(r.headers['x-ultima-coleta']).toBeUndefined();
    expect(SCHEMAS_RESULTADO.O1.safeParse(r.json()).success).toBe(true);
    const etag = r.headers.etag as string;
    const r2 = await app.inject({ method: 'GET', url: '/api/v1/metricas/O1', headers: { 'if-none-match': etag } });
    expect(r2.statusCode).toBe(304);
    expect(r2.body).toBe('');
  });

  it('todas as métricas respondem 200 dentro do schema e nenhuma chave de pessoa aparece', async () => {
    const { app } = await montar();
    const todas = new Set<string>();
    for (const id of METRICA_IDS) {
      const r = await get(app, `/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      chaves(r.json(), todas);
    }
    expect([...todas].filter((k) => PESSOA.test(k))).toEqual([]);
  }, 60_000);

  it('T11 (pedido 011, B11b): 200 no schema, 24 meses mais o corrente, picos de janeiro e julho, período ignorado e sem pessoa', async () => {
    const { app } = await montar();
    const r = await get(app, '/api/v1/metricas/T11');
    expect(r.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.T11.safeParse(r.json()).success).toBe(true);
    const t11 = r.json();
    const meses = (t11.anos as { ano: number; meses: { mes: number; entradas: number | null; emAndamento: boolean }[] }[]).flatMap((a) => a.meses.map((m) => ({ ano: a.ano, ...m })));
    expect(meses.filter((m) => m.entradas !== null)).toHaveLength(25);
    expect(meses.filter((m) => m.emAndamento)).toHaveLength(1);
    expect(t11.mesesComDado).toBe(24);
    expect(t11.historicoCurto).toBe(false);
    const media = t11.mediaMensal as number;
    for (const m of meses.filter((x) => x.entradas !== null && !x.emAndamento && (x.mes === 1 || x.mes === 7))) expect(m.entradas as number).toBeGreaterThanOrEqual(1.25 * media);
    expect([...chaves(t11)].filter((k) => PESSOA.test(k))).toEqual([]);
    // CA-12: o período não muda a resposta; equipe, tipo e sistema mudam
    expect((await get(app, '/api/v1/metricas/T11?periodo=4s')).json()).toEqual(t11);
    expect((await get(app, '/api/v1/metricas/T11?periodo=abc')).statusCode).toBe(400);
    const so = await get(app, '/api/v1/metricas/T11?tipo=melhoria');
    expect(so.statusCode).toBe(200);
    expect((so.json().base as { n: number }).n).toBeLessThan((t11.base as { n: number }).n);
  }, 60_000);

  it('T11 (B11b-1): dataReferencia no meio do mês não conta entradas criadas depois do corte', async () => {
    const { app } = await montar();
    const r = await get(app, '/api/v1/metricas/T11?dataReferencia=2026-08-10');
    expect(r.statusCode).toBe(200);
    const t11 = r.json();
    const ago = (t11.anos as { ano: number; meses: { mes: number; entradas: number | null; emAndamento: boolean }[] }[]).find((a) => a.ano === 2026)!.meses.find((m) => m.mes === 8)!;
    const ext = extensaoTambemMock().entradasSazonais;
    const noMes = ext.filter((e) => e.criado_em >= Date.parse('2026-08-01T00:00:00-03:00') && e.criado_em < Date.parse('2026-09-01T00:00:00-03:00'));
    const ateCorte = noMes.filter((e) => e.criado_em < Date.parse('2026-08-11T00:00:00-03:00')).length;
    expect(noMes.length).toBeGreaterThan(ateCorte);
    expect(ago.emAndamento).toBe(true);
    expect(ago.entradas).toBe(ateCorte);
  }, 60_000);

  it('T11: a extensão é lazy (só o T11 a chama) e, sem ela (fonte real), devolve vazio com histórico curto, nunca 500', async () => {
    let chamadas = 0;
    const gerar = () => { chamadas++; return EXTENSAO_TAMBEM_BM_VAZIA; };
    const montarCom = async (extra: Partial<Parameters<typeof buildApp>[0]>) => buildApp({ db: criarDublePg(bancoDoMock(base)).pool, agora: () => AGORA, nivelLog: 'silent', ...extra });
    const app = await montarCom({ extensaoTambem: gerar });
    await get(app, '/api/v1/metricas/O1');
    await get(app, '/api/v1/metricas/T12');
    expect(chamadas).toBe(0);
    expect((await get(app, '/api/v1/metricas/T11')).statusCode).toBe(200);
    expect(chamadas).toBe(1);
    const real = await montarCom({ fonteDados: 'real' });
    const r = await get(real, '/api/v1/metricas/T11');
    expect(r.statusCode).toBe(200);
    expect(r.json()).toMatchObject({ anos: [], mesesComDado: 0, mediaMensal: null, historicoCurto: true });
  });

  it('T12 (pedido 011): 200 no schema, filtros do fluxo, áreas por volume e nenhuma chave de equipe ou pessoa', async () => {
    const { app } = await montar();
    const r = await get(app, '/api/v1/metricas/T12?periodo=12m');
    expect(r.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.T12.safeParse(r.json()).success).toBe(true);
    const volumes = (r.json().areas as { taxa: { n: number } }[]).map((x) => x.taxa.n);
    expect(volumes).toEqual([...volumes].sort((a, b) => b - a));
    expect(Object.keys((r.json().areas as object[])[0] ?? {}).sort()).toEqual(['area', 'taxa']);
    expect((await get(app, '/api/v1/metricas/T12?periodo=12m&tipo=melhoria')).statusCode).toBe(200);
    expect((await get(app, '/api/v1/metricas/T12?periodo=abc')).statusCode).toBe(400);
  });

  it('O20 (pedido 011, B9): 200 no schema, papel em "Todas", coluna com uma equipe, payload gzip < 50 KB no período máximo e nenhum campo de pessoa ou de equipe', async () => {
    const { app } = await montar();
    const r = await get(app, '/api/v1/metricas/O20?periodo=12m');
    expect(r.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.O20.safeParse(r.json()).success).toBe(true);
    expect(r.json().agrupamento).toBe('papel');
    for (const x of r.json().faixas as { chave: string }[])
      expect(['backlog', 'compromisso', 'trabalho', 'homologacao', 'entrega']).toContain(x.chave);
    expect(gzipSync(r.body).length / 1024).toBeLessThan(50);
    expect(JSON.stringify(r.json())).not.toMatch(/responsave|usuario|"equipe"/);
    const e = await get(app, '/api/v1/metricas/O20?periodo=12m&equipe=fluig');
    expect(e.statusCode).toBe(200);
    expect(e.json().agrupamento).toBe('coluna');
    expect(SCHEMAS_RESULTADO.O20.safeParse(e.json()).success).toBe(true);
    expect(gzipSync(e.body).length / 1024).toBeLessThan(50);
    expect((await get(app, '/api/v1/metricas/O20?periodo=abc')).statusCode).toBe(400);
  });

  it('O24 (pedido 011, B10): 200 no schema, grupo único, custo por tipo, nenhum campo de pessoa nem de equipe e 400 em filtro inválido', async () => {
    const { app } = await montar();
    const r = await get(app, '/api/v1/metricas/O24?periodo=12m');
    expect(r.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.O24.safeParse(r.json()).success).toBe(true);
    expect(r.json().grupo).toBe('equipe-tipo-padrao');
    expect(r.json().custo.segmentoPor).toBe('tipo');
    expect(gzipSync(r.body).length / 1024).toBeLessThan(50);
    expect(JSON.stringify({ ...r.json(), grupo: undefined })).not.toMatch(/responsave|usuario|equipe/i);
    const e = await get(app, '/api/v1/metricas/O24?periodo=12m&equipe=fluig');
    expect(e.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.O24.safeParse(e.json()).success).toBe(true);
    expect((await get(app, '/api/v1/metricas/O24?periodo=abc')).statusCode).toBe(400);
  });

  it('O21 (pedido 011, B7): 200 no schema, par por tipo, matriz por papel em "Todas" e nenhum campo de pessoa ou de equipe', async () => {
    const { app } = await montar();
    const r = await get(app, '/api/v1/metricas/O21?periodo=12m');
    expect(r.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.O21.safeParse(r.json()).success).toBe(true);
    expect(r.json().segmentoPor).toBe('tipo');
    expect(r.json().matriz.eixo).toBe('papel');
    expect(JSON.stringify(r.json())).not.toMatch(/responsave|usuario|"equipe"/);
    expect((await get(app, '/api/v1/metricas/O21?periodo=12m&tipo=melhoria&equipe=fluig')).statusCode).toBe(200);
    expect((await get(app, '/api/v1/metricas/O21?periodo=abc')).statusCode).toBe(400);
  });

  it('O25 (pedido 011): 200 no schema, filtros do fluxo, porMotivo nulo e nenhum campo de pessoa, motivo ou comentário', async () => {
    const { app } = await montar();
    const r = await get(app, '/api/v1/metricas/O25?periodo=12m');
    expect(r.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.O25.safeParse(r.json()).success).toBe(true);
    expect(r.json().porMotivo).toBeNull();
    expect(JSON.stringify(r.json())).not.toMatch(/discard_comment|responsave|usuario|Criado por engano/);
    expect((await get(app, '/api/v1/metricas/O25?periodo=12m&tipo=melhoria&equipe=fluig')).statusCode).toBe(200);
    expect((await get(app, '/api/v1/metricas/O25?periodo=abc')).statusCode).toBe(400);
  });

  it('E7 e E9 (pedido 011, B5): 200 no schema, E7 sem R$ e com 4 naturezas, E9 com faixas fixas e sem pessoa', async () => {
    const { app } = await montar();
    const e7 = await get(app, '/api/v1/metricas/E7?periodo=12m');
    expect(e7.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.E7.safeParse(e7.json()).success).toBe(true);
    expect(e7.json().custoConfigurado).toBe(false);
    expect(JSON.stringify(e7.json())).not.toMatch(/"custo(Rateado|PorDemanda)":[0-9]/);
    expect((e7.json().sistemas as { porNatureza: unknown[] }[])[0]?.porNatureza).toHaveLength(4);
    expect((await get(app, '/api/v1/metricas/E7?periodo=abc')).statusCode).toBe(400);
    const e9 = await get(app, '/api/v1/metricas/E9');
    expect(e9.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.E9.safeParse(e9.json()).success).toBe(true);
    const faixas = new Set(['0–30', '31–90', '91–180', 'mais de 180']);
    for (const p of e9.json().projetos as { faixa: string }[]) expect(faixas.has(p.faixa)).toBe(true);
    // regra 7: uma referência P85 por tipo de projeto, nunca um P85 dos dois juntos
    expect((e9.json().referenciasP85 as { tipo: string }[]).map((x) => x.tipo)).toEqual(['Iniciativa', 'Melhoria']);
  });

  it('O19 e T10 (pedido 011): 200 no schema, filtros do fluxo, motivos na ordem do domínio, fornecedor alfabético e sem prazo', async () => {
    const { app } = await montar();
    const o19 = await get(app, '/api/v1/metricas/O19?periodo=12m');
    expect(o19.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.O19.safeParse(o19.json()).success).toBe(true);
    expect(o19.json().motivos).toHaveLength(7);
    const t10 = await get(app, '/api/v1/metricas/T10?periodo=12m&tipo=melhoria');
    expect(t10.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.T10.safeParse(t10.json()).success).toBe(true);
    const nomes = (t10.json().fornecedores as { fornecedor: string }[]).map((x) => x.fornecedor);
    expect(nomes).toEqual([...nomes].sort());
    expect([...chaves(t10.json())].filter((k) => /prazo|contratad/i.test(k))).toEqual([]);
    expect(Object.keys((t10.json().fornecedores as object[])[0] ?? {}).sort()).toEqual(['bloqueios', 'diasUteis', 'duracao', 'fornecedor']);
    expect((await get(app, '/api/v1/metricas/T10?periodo=abc')).statusCode).toBe(400);
  });

  it('complementares: extensões do mock por padrão; sem fonte de extensões o resultado é vazio, nunca erro', async () => {
    const { app } = await montar();
    const a = await get(app, '/api/v1/metricas/T8?periodo=12m');
    expect(a.statusCode).toBe(200);
    expect(a.json().sprints.length).toBeGreaterThan(0);
    expect((await get(app, '/api/v1/metricas/S8')).statusCode).toBe(200);
    const d = criarDublePg(bancoDoMock(base));
    const sem = new ServicoMetricas({ db: d.pool });
    const r = await sem.calcular('T8', { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12m' } }, {}, AGORA);
    expect((r.resultado as { sprints: unknown[] }).sprints).toEqual([]);
    const com = new ServicoMetricas({ db: d.pool, extensoes: () => gerarExtensoesMock(base) });
    const r2 = await com.calcular('T8', { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12m' } }, {}, AGORA);
    expect((r2.resultado as { sprints: unknown[] }).sprints.length).toBeGreaterThan(0);
  });

  it('fonte real: sem extensões mockadas, S8, S11, S12, O17 e E4 saem sem campo, nunca 0% nem dentro da meta', async () => {
    const d = criarDublePg(bancoDoMock(base));
    const app = await buildApp({ db: d.pool, agora: () => AGORA, nivelLog: 'silent', fonteDados: 'real' });
    for (const id of ['S8', 'S11', 'S12', 'O17', 'E4']) {
      const r = await get(app, `/api/v1/metricas/${id}`);
      expect(r.statusCode, id).toBe(200);
      expect(r.json().campoDisponivel, id).toBe(false);
    }
    const s8 = (await get(app, '/api/v1/metricas/S8')).json();
    expect(s8.total.status).toBe('insuficiente');
    expect(s8.statusMeta).toBe('sem-referencia');
    expect((await get(app, '/api/v1/metricas/S11')).json().conversao.status).toBe('insuficiente');
    expect((await get(app, '/api/v1/metricas/O17')).json().porCausa).toEqual([]);
    const mock = await montar();
    expect((await get(mock.app, '/api/v1/metricas/S8')).json().campoDisponivel).toBe(true);
    expect((await get(mock.app, '/api/v1/metricas/O17')).json().campoDisponivel).toBe(true);
  });

  it('o contrato OpenAPI não tem rota, parâmetro nem campo de pessoa', async () => {
    const { app } = await montar();
    await app.ready();
    const doc = app.swagger();
    expect([...chaves(doc.paths)].filter((k) => PESSOA.test(k))).toEqual([]);
    expect(Object.keys(doc.paths ?? {}).filter((p) => PESSOA.test(p))).toEqual([]);
  });

  it('filtros do fluxo em CSV, ids de tipo e período', async () => {
    const { app } = await montar();
    expect((await get(app, '/api/v1/metricas/T1?equipe=fluig,senior&tipo=bug-interno,melhoria&sistema=fluig&periodo=6m')).statusCode).toBe(200);
    expect((await get(app, '/api/v1/metricas/T1?equipe=&tipo=')).statusCode).toBe(200);
    const custom = await get(app, '/api/v1/metricas/T1?periodo=custom&de=2026-08-03&ate=2026-09-30&dataReferencia=2026-10-02');
    expect(custom.statusCode).toBe(200);
    expect(custom.headers['x-data-referencia']).toBe('2026-10-02');
  });

  it('filtros da sustentação: equipe, prioridade em qualquer caixa', async () => {
    const { app } = await montar();
    expect((await get(app, '/api/v1/metricas/S1?equipe=totvs&prioridade=P1,p2&periodo=4s')).statusCode).toBe(200);
    expect((await get(app, '/api/v1/metricas/EI_SUST')).statusCode).toBe(200);
    const ref = await get(app, '/api/v1/metricas/S1?dataReferencia=2026-10-08');
    expect(ref.headers['x-data-referencia']).toBe('2026-10-08');
    expect((await get(app, '/api/v1/metricas/S1?periodo=custom&de=2026-08-03&ate=2026-09-30')).statusCode).toBe(200);
    expect((await get(app, '/api/v1/metricas/S1?periodo=custom&de=2000-08-03&ate=2026-09-30')).statusCode).toBe(422);
    expect((await get(app, '/api/v1/metricas/S1?periodo=custom')).statusCode).toBe(400);
    expect((await get(app, '/api/v1/metricas/VISAO_GERAL?dataReferencia=2026-10-08')).headers['x-data-referencia']).toBe('2026-10-08');
  });

  it('tendências: 200 no schema, até 6 meses fechados, 304 por etag, uma fonte por consulta e sem filtro', async () => {
    const { app, d } = await montar();
    for (const id of ['TENDENCIA_FLUXO', 'TENDENCIA_SUST'] as const) {
      const r = await get(app, `/api/v1/metricas/${id}?dataReferencia=2026-10-08`);
      expect(r.statusCode, id).toBe(200);
      expect(r.headers['x-data-referencia']).toBe('2026-10-08');
      expect(SCHEMAS_RESULTADO[id].safeParse(r.json()).success).toBe(true);
      const meses = (r.json() as { meses: { mes: string }[] }).meses.map((m) => m.mes);
      expect(meses).toEqual(['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']);
      const etag = r.headers.etag as string;
      const r2 = await app.inject({ method: 'GET', url: `/api/v1/metricas/${id}?dataReferencia=2026-10-08`, headers: { 'if-none-match': etag } });
      expect(r2.statusCode).toBe(304);
    }
    const textos = d.chamadas.map((c) => c.texto);
    for (const t of textos) expect(t.includes('dspd_bm') && t.includes('dspd_ac')).toBe(false);
  });

  it.each([
    ['filtro em TENDENCIA_FLUXO', '/api/v1/metricas/TENDENCIA_FLUXO?equipe=fluig'],
    ['periodo em TENDENCIA_FLUXO', '/api/v1/metricas/TENDENCIA_FLUXO?periodo=6m'],
    ['prioridade em TENDENCIA_SUST', '/api/v1/metricas/TENDENCIA_SUST?prioridade=P1'],
    ['pessoa em TENDENCIA_SUST', '/api/v1/metricas/TENDENCIA_SUST?agente=ana'],
    ['dataReferencia futura em TENDENCIA_SUST', '/api/v1/metricas/TENDENCIA_SUST?dataReferencia=2026-10-11'],
    ['dataReferencia inválida em TENDENCIA_FLUXO', '/api/v1/metricas/TENDENCIA_FLUXO?dataReferencia=ontem'],
  ])('400 VALIDATION_ERROR (tendência): %s', async (_nome, url) => {
    const { app } = await montar();
    const r = await get(app, url);
    expect(r.statusCode).toBe(400);
    expect(r.json().error.code).toBe('VALIDATION_ERROR');
  });

  it.each([
    ['filtro de outro domínio (sistema em S1)', '/api/v1/metricas/S1?sistema=fluig'],
    ['filtro de outro domínio (prioridade no fluxo)', '/api/v1/metricas/T1?prioridade=P1'],
    ['pessoa: responsavel', '/api/v1/metricas/T1?responsavel=ana'],
    ['pessoa: agente', '/api/v1/metricas/S1?agente=ana'],
    ['pessoa: autor', '/api/v1/metricas/VISAO_GERAL?autor=ana'],
    ['tipo desconhecido', '/api/v1/metricas/T1?tipo=inexistente'],
    ['equipe de sustentação desconhecida', '/api/v1/metricas/S1?equipe=outra'],
    ['prioridade inválida', '/api/v1/metricas/S1?prioridade=P9'],
    ['período desconhecido', '/api/v1/metricas/T1?periodo=1h'],
    ['custom sem de e ate', '/api/v1/metricas/T1?periodo=custom'],
    ['de sem custom', '/api/v1/metricas/T1?de=2026-08-03&ate=2026-09-30'],
    ['de sem custom (sustentação)', '/api/v1/metricas/S1?de=2026-08-03'],
    ['data inválida', '/api/v1/metricas/T1?periodo=custom&de=2026-13-45&ate=2026-09-30'],
    ['dataReferencia futura', '/api/v1/metricas/T1?dataReferencia=2026-10-11'],
    ['page inválida', '/api/v1/metricas/O2?page=0'],
    ['pageSize acima do máximo', '/api/v1/metricas/O2?pageSize=201'],
  ])('400 VALIDATION_ERROR: %s', async (_nome, url) => {
    const { app } = await montar();
    const r = await get(app, url);
    expect(r.statusCode).toBe(400);
    expect(r.json().error.code).toBe('VALIDATION_ERROR');
  });

  it('422 PERIODO_FORA_DO_HISTORICO: de > ate, antes do início e depois da referência', async () => {
    const { app } = await montar();
    for (const q of ['de=2026-09-30&ate=2026-08-03', 'de=2000-01-01&ate=2026-08-03', 'de=2026-08-03&ate=2026-10-10']) {
      const r = await get(app, `/api/v1/metricas/T1?periodo=custom&${q}`);
      expect(r.statusCode, q).toBe(422);
      expect(r.json().error.code).toBe('PERIODO_FORA_DO_HISTORICO');
    }
  });

  it('404 METRICA_NAO_ENCONTRADA para id desconhecido (inclusive minúsculo)', async () => {
    const { app } = await montar();
    for (const id of ['XX', 'o1']) {
      const r = await get(app, `/api/v1/metricas/${id}`);
      expect(r.statusCode).toBe(404);
      expect(r.json().error.code).toBe('METRICA_NAO_ENCONTRADA');
    }
  });

  it('banco fora: 500 sem detalhe interno', async () => {
    const { app } = await montar(() => new Error('senha=segredo host=10.0.0.1'));
    const r = await get(app, '/api/v1/metricas/O1');
    expect(r.statusCode).toBe(500);
    expect(r.body).not.toContain('segredo');
  });

  it('base vazia: sem coleta usa agora e devolve resultado insuficiente, não erro', async () => {
    const { app } = await montar(() => []);
    const r = await get(app, '/api/v1/metricas/T1');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-data-referencia']).toBe('2026-10-10');
    expect(r.headers['x-versao-criterio']).toBe('0');
    expect((await get(app, '/api/v1/metricas/S2')).statusCode).toBe(200);
    const sem = await get(app, '/api/v1/metricas/S1');
    expect(sem.statusCode).toBe(503);
    expect(sem.json().error.code).toBe('REFERENCIA_AUSENTE');
    expect((await get(app, '/api/v1/metricas/VISAO_GERAL')).statusCode).toBe(503);
    expect((await get(app, '/api/v1/metricas/T1?periodo=custom&de=2026-10-01&ate=2026-10-10')).statusCode).toBe(422);
    expect((await get(app, '/api/v1/metricas/T1?periodo=custom&de=2026-10-10&ate=2026-10-10')).statusCode).toBe(200);
  });
});

describe('O2: paginação dos itens', () => {
  it('sem page: até 200 itens; page/pageSize fatiam por idade decrescente; contagens do conjunto completo', async () => {
    const { app } = await montar();
    const tudo = (await get(app, '/api/v1/metricas/O2')).json();
    const total = tudo.itensMeta.total as number;
    expect(tudo.itensMeta).toEqual({ page: 1, pageSize: 200, total });
    expect(tudo.itens.length).toBe(Math.min(total, 200));
    const idades = tudo.itens.map((i: { idadeDiasUteis: number }) => i.idadeDiasUteis);
    expect(idades).toEqual([...idades].sort((a: number, b: number) => b - a));
    const p2 = (await get(app, '/api/v1/metricas/O2?page=2&pageSize=5')).json();
    expect(p2.itensMeta).toEqual({ page: 2, pageSize: 5, total });
    expect(p2.itens.map((i: { cardId: string }) => i.cardId)).toEqual(tudo.itens.slice(5, 10).map((i: { cardId: string }) => i.cardId));
    expect(p2.tipos).toEqual(tudo.tipos);
    expect(p2.acimaP95).toBe(tudo.acimaP95);
    const p3 = (await get(app, '/api/v1/metricas/O2?page=3')).json();
    expect(p3.itensMeta.pageSize).toBe(50);
    expect(p3.itens.length).toBe(Math.max(0, Math.min(50, total - 100)));
  });
  it('desempate por cardId com idades iguais', () => {
    const item = (cardId: string, idadeDiasUteis: number) => ({ cardId, idadeDiasUteis });
    const r = paginarO2({ itens: [item('b', 1), item('c', 2), item('a', 1), item('d', 1), item('a', 1)] } as never, 1, 10);
    expect(r.itens.map((i) => i.cardId)).toEqual(['c', 'a', 'a', 'b', 'd']);
    expect(paginarO2({ itens: [item('x', 1), item('y', 1)] } as never).itens.map((i) => i.cardId)).toEqual(['x', 'y']);
    expect(paginarO2({ itens: [item('y', 1), item('x', 1)] } as never).itens.map((i) => i.cardId)).toEqual(['x', 'y']);
    expect(paginarO2({ itens: [item('a', 1), item('a', 1)] } as never).itensMeta.total).toBe(2);
  });
});

describe('consultas ao banco: colunas explícitas, uma fonte por consulta, nunca pessoa', () => {
  it('nenhuma consulta usa SELECT *, cruza BM e AC ou lê colunas de pessoa', async () => {
    const { app, d } = await montar();
    for (const id of ['O1', 'S1', 'VISAO_GERAL']) await get(app, `/api/v1/metricas/${id}`);
    const textos = d.chamadas.map((c) => c.texto);
    expect(textos.length).toBeGreaterThan(10);
    for (const t of textos) {
      expect(t).not.toMatch(/SELECT\s+\*/i);
      expect(t.includes('dspd_bm') && t.includes('dspd_ac')).toBe(false);
      expect(t).not.toMatch(/responsaveis|usuario/);
    }
    expect(textos.some((t) => t.includes('FROM dspd_bm.dim_card'))).toBe(true);
    expect(textos.some((t) => t.includes('FROM dspd_ac.dim_chamado'))).toBe(true);
  });
  it('métrica do fluxo nunca lê o Acelerato e vice-versa', async () => {
    const a = await montar();
    await get(a.app, '/api/v1/metricas/T1');
    expect(a.d.chamadas.some((c) => c.texto.includes('dspd_ac'))).toBe(false);
    const b = await montar();
    await get(b.app, '/api/v1/metricas/S1');
    expect(b.d.chamadas.some((c) => c.texto.includes('dspd_bm'))).toBe(false);
  });
});

describe('ServicoMetricas: carga, versão e cache', () => {
  const FL = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } };
  const SU = { equipe: [], prioridade: [], periodo: { tipo: '12s' as const } };

  it('normalizar: listas ordenadas e sem repetição; chaves de fluxo e sustentação distintas', () => {
    expect(normalizar({ ...FL, equipe: ['b', 'a', 'a'] })).toBe(normalizar({ ...FL, equipe: ['a', 'b'] }));
    expect(normalizar(FL)).not.toBe(normalizar({ ...FL, tipo: ['Incidente'] }));
    expect(normalizar({})).toBe(normalizar({}));
  });

  it('mesma consulta duas vezes: um cálculo, uma carga; dentro de 60 s não relê a marca', async () => {
    const d = criarDublePg(bancoDoMock(base));
    const s = new ServicoMetricas({ db: d.pool });
    const a = await s.calcular('T1', FL, {}, AGORA);
    const n = d.chamadas.length;
    const b = await s.calcular('T1', FL, {}, new Date(AGORA.getTime() + TTL_VERSAO_MS - 1));
    expect(b.resultado).toBe(a.resultado);
    expect(d.chamadas.length).toBe(n);
    expect(consultasA(d, 'FROM dspd_bm.dim_card')).toBe(1);
  });

  it('depois de 60 s relê a marca d\'água: igual = reaproveita a base e o cache; diferente = recarrega e descarta', async () => {
    const opcoes: { coletaId?: string; versaoCriterio?: string | null } = { coletaId: '1' };
    const d = criarDublePg(bancoDoMock(base, opcoes));
    const s = new ServicoMetricas({ db: d.pool });
    const a = await s.calcular('T1', FL, {}, AGORA);
    const t1 = new Date(AGORA.getTime() + TTL_VERSAO_MS);
    expect((await s.calcular('T1', FL, {}, t1)).resultado).toBe(a.resultado);
    expect(consultasA(d, 'FROM dspd_bm.dim_card')).toBe(1);
    opcoes.coletaId = '2';
    const t2 = new Date(t1.getTime() + TTL_VERSAO_MS);
    const c = await s.calcular('T1', FL, {}, t2);
    expect(consultasA(d, 'FROM dspd_bm.dim_card')).toBe(2);
    expect(c.resultado).not.toBe(a.resultado);
    expect(c.resultado).toEqual(a.resultado);
    expect(c.chave).not.toBe(a.chave);
  });

  it('nova versão de critério também invalida (mesma coleta)', async () => {
    const opcoes: { versaoCriterio?: string | null } = { versaoCriterio: '2' };
    const d = criarDublePg(bancoDoMock(base, opcoes));
    const s = new ServicoMetricas({ db: d.pool });
    await s.calcular('T1', FL, {}, AGORA);
    opcoes.versaoCriterio = '3';
    const r = await s.calcular('T1', FL, {}, new Date(AGORA.getTime() + TTL_VERSAO_MS));
    expect(consultasA(d, 'FROM dspd_bm.dim_card')).toBe(2);
    expect(r.versaoCriterio).toBe('3');
  });

  it('domínios independentes: carregar o fluxo não carrega a sustentação; a coleta de um não invalida o outro', async () => {
    const opcoes: { coletaId?: string } = { coletaId: '1' };
    const d = criarDublePg(bancoDoMock(base, opcoes));
    const s = new ServicoMetricas({ db: d.pool });
    await s.calcular('T1', FL, {}, AGORA);
    expect(consultasA(d, 'dspd_ac.dim_chamado')).toBe(0);
    const ac = await s.calcular('S1', SU, {}, AGORA);
    expect(consultasA(d, 'dspd_ac.dim_chamado')).toBe(1);
    expect(consultasA(d, 'FROM dspd_bm.dim_card')).toBe(1);
    expect(ac.resultado).toBeDefined();
  });

  it('chamadas simultâneas compartilham uma única carga', async () => {
    const d = criarDublePg(bancoDoMock(base));
    const s = new ServicoMetricas({ db: d.pool });
    await Promise.all([s.calcular('T1', FL, {}, AGORA), s.calcular('O1', FL, {}, AGORA), s.calcular('T2', FL, {}, AGORA)]);
    expect(consultasA(d, 'FROM dspd_bm.dim_card')).toBe(1);
  });

  it('carga que falha não fica presa: a chamada seguinte tenta de novo', async () => {
    let falhar = true;
    const normal = bancoDoMock(base);
    const d = criarDublePg((c) => (falhar && c.texto.includes('dim_card') ? new Error('boom') : normal(c)));
    const s = new ServicoMetricas({ db: d.pool });
    await expect(s.calcular('T1', FL, {}, AGORA)).rejects.toThrow('boom');
    falhar = false;
    expect((await s.calcular('T1', FL, {}, AGORA)).resultado).toBeDefined();
  });

  it('limite de resultados guardados: descarta o mais antigo', async () => {
    const d = criarDublePg(bancoDoMock(base));
    const s = new ServicoMetricas({ db: d.pool, maxResultados: 2 });
    const a = await s.calcular('T1', FL, {}, AGORA);
    await s.calcular('T2', FL, {}, AGORA);
    await s.calcular('T3', FL, {}, AGORA);
    const de_novo = await s.calcular('T1', FL, {}, AGORA);
    expect(de_novo.resultado).not.toBe(a.resultado);
    expect(de_novo.resultado).toEqual(a.resultado);
  });

  it('data de referência = fim da última coleta bem-sucedida; Visão geral usa o corte mais antigo das duas fontes', async () => {
    const opcoes = { finalizadoAC: new Date('2026-10-05T12:00:00Z') };
    const d = criarDublePg(bancoDoMock(base, opcoes));
    const s = new ServicoMetricas({ db: d.pool });
    expect((await s.calcular('T1', FL, {}, AGORA)).dataReferencia).toBe('2026-10-09');
    expect((await s.calcular('S1', SU, {}, AGORA)).dataReferencia).toBe('2026-10-05');
    expect((await s.calcular('VISAO_GERAL', {}, {}, AGORA)).dataReferencia).toBe('2026-10-05');
    expect((await s.calcular('VISAO_GERAL', {}, { dataReferencia: '2026-10-08' }, AGORA)).dataReferencia).toBe('2026-10-08');
  });

  it('dataReferencia futura é recusada pelo serviço', async () => {
    const s = new ServicoMetricas({ db: criarDublePg(bancoDoMock(base)).pool });
    await expect(s.calcular('T1', FL, { dataReferencia: '2026-10-11' }, AGORA)).rejects.toMatchObject({ code: 'VALIDATION_ERROR', status: 400 });
  });
});

describe('fase 2 do pedido 011 (E1): O22, O26, T13 e E6 em mock', () => {
  const NOVAS = ['O22', 'O26', 'T13', 'E6'] as const;

  it.each(NOVAS)('%s: 200 no schema, filtros do fluxo, cabeçalhos e nenhum campo de pessoa', async (id) => {
    const { app } = await montar();
    const r = await get(app, `/api/v1/metricas/${id}?periodo=12m`);
    expect(r.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO[id].safeParse(r.json()).success).toBe(true);
    expect(r.headers['cache-control']).toBe('private, max-age=60');
    expect([...chaves(r.json())].filter((k) => PESSOA.test(k))).toEqual([]);
    expect((await get(app, `/api/v1/metricas/${id}?periodo=12m&tipo=melhoria&equipe=fluig&sistema=fluig`)).statusCode).toBe(200);
    expect((await get(app, `/api/v1/metricas/${id}?periodo=abc`)).statusCode).toBe(400);
    expect((await get(app, `/api/v1/metricas/${id}?periodo=12m&responsavel=x`)).statusCode).toBe(400);
  }, 60_000);

  it('O22: P50/P85/P95 por tipo e sem toque; O26: histograma por faixa e P85 do ciclo; sem nome de pessoa', async () => {
    const { app } = await montar();
    const o22 = (await get(app, '/api/v1/metricas/O22?periodo=12m')).json();
    expect(o22.porTipo.length).toBeGreaterThan(0);
    expect(Object.keys(o22.porTipo[0]).sort()).toEqual(['distribuicao', 'histograma', 'semToque', 'tipo']);
    const o26 = (await get(app, '/api/v1/metricas/O26?periodo=12m')).json();
    expect(o26.porTipo[0].faixas.map((f: { faixa: string }) => f.faixa)).toEqual(['0', '1', '2', '3', '4+']);
    expect(JSON.stringify([o22, o26])).not.toMatch(/Pessoa \d/);
  }, 60_000);

  it('T13: um bloco por granularidade (demanda e frente), só o booleano agregado e sem o quadro do outro lado', async () => {
    const { app } = await montar();
    const t13 = (await get(app, '/api/v1/metricas/T13?periodo=12m')).json();
    expect(t13.porGranularidade.map((g: { granularidade: string }) => g.granularidade)).toEqual(['story', 'frente']);
    expect([...chaves(t13)].filter((k) => /quadro|equipe|relacionado/i.test(k))).toEqual([]);
  }, 60_000);

  it('a extensão é lazy: só as cinco métricas do 011 a chamam; sem ela (fonte real) todas devolvem estado vazio, nunca 500', async () => {
    let chamadas = 0;
    const gerar = () => { chamadas++; return EXTENSAO_TAMBEM_BM_VAZIA; };
    const app = await buildApp({ db: criarDublePg(bancoDoMock(base)).pool, agora: () => AGORA, nivelLog: 'silent', extensaoTambem: gerar });
    for (const id of ['O1', 'T12', 'E7', 'E9']) await get(app, `/api/v1/metricas/${id}`);
    expect(chamadas).toBe(0);
    for (const id of ['O22', 'O26', 'T13', 'E6']) expect((await get(app, `/api/v1/metricas/${id}`)).statusCode).toBe(200);
    expect(chamadas).toBe(4);
    const real = await buildApp({ db: criarDublePg(bancoDoMock(base)).pool, agora: () => AGORA, nivelLog: 'silent', fonteDados: 'real' });
    for (const id of ['O22', 'O26', 'T13', 'E6'] as const) {
      const r = await get(real, `/api/v1/metricas/${id}?periodo=12m&equipe=fluig`);
      expect(r.statusCode, id).toBe(200);
      expect(SCHEMAS_RESULTADO[id].safeParse(r.json()).success, id).toBe(true);
    }
    const o26 = (await get(real, '/api/v1/metricas/O26?periodo=12m')).json();
    // sem a extensão nenhuma entrega vira "0 passagens": é tudo semDado
    expect(o26.porTipo.every((t: { entregas: number; semDado: number }) => t.entregas === 0 && t.semDado > 0)).toBe(true);
  }, 90_000);
});
