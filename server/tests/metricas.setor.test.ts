import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao';
import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { montarBaseBM } from '../src/modulos/metricas/mapa.js';
import { normalizar, ServicoMetricas } from '../src/modulos/metricas/index.js';
import { queryFluxoSchema, querySustentacaoSchema, queryTendenciaFluxoSchema, queryTendenciaSchema } from '../src/modulos/metricas/schemas.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg, type Respondedor } from './duble-pg.js';

/** 097, L10b (E7): o filtro Setor do fluxo no servidor: consulta validada, chave de cache, base com setores e o efeito no cálculo. */
const AGORA = new Date('2026-10-10T15:00:00Z');
const base = gerarBaseMock({ escala: 0.25 });
const FL = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12s' as const } };

// Quadros numéricos como na base real (o dicionário só aceita código numérico): 23 (Sistemas Corporativos) e 27 (Plataformas).
const NUM: Record<string, string> = {
  'quadro-erp-protheus': '23', 'quadro-fluig': '23', 'quadro-senior': '23',
  'quadro-marketing-e-vendas': '27', 'quadro-dados': '27', 'quadro-plataforma-5g': '27',
};
const SETORES = [{ codigo: '23', rotulo: 'Sistemas Corporativos' }, { codigo: '27', rotulo: 'Plataformas' }];
const comQuadroNumerico = (rows: unknown[]) => rows.map((l) => (typeof (l as { quadro_id?: unknown }).quadro_id === 'string' ? { ...(l as object), quadro_id: NUM[(l as { quadro_id: string }).quadro_id] ?? (l as { quadro_id: string }).quadro_id } : l));
/** O banco do mock com quadros numéricos e o dicionário `setor_quadro` do `ref_dominio`. */
function bancoComSetores(): Respondedor {
  const inner = bancoDoMock(base);
  return (c) => {
    if (c.texto.includes('FROM dspd_bm.ref_dominio') && c.valores[0] === 'setor_quadro') return SETORES;
    const r = inner(c);
    if (Array.isArray(r) && /FROM dspd_bm\.(dim_card|ref_coluna|vw_transicao_canonica)/.test(c.texto)) return comQuadroNumerico(r);
    return r;
  };
}
const get = async (app: Awaited<ReturnType<typeof buildApp>>, url: string) => app.inject(url);
async function montar(r: Respondedor = bancoComSetores()) {
  const d = criarDublePg(r);
  const app = await buildApp({ modoMock: true, db: d.pool, agora: () => AGORA, nivelLog: 'silent' });
  return { app, d };
}

describe('097 L10b: consulta com setor', () => {
  it('fluxo: setor em CSV de slugs; ausente ou vazio = Todos; slug inválido = 400', () => {
    const f = (q: Record<string, string>) => queryFluxoSchema.safeParse(q);
    expect(f({ setor: 'plataformas,sistemas-corporativos' })).toMatchObject({ success: true, data: { filtros: { setor: ['plataformas', 'sistemas-corporativos'] } } });
    expect(f({})).toMatchObject({ success: true, data: { filtros: { setor: [] } } });
    expect(f({ setor: '' })).toMatchObject({ success: true, data: { filtros: { setor: [] } } });
    for (const ruim of ['Plataformas', 'a b', 'x;y', '../x', 'a'.repeat(61)]) expect(f({ setor: ruim }).success, ruim).toBe(false);
  });
  it('só o fluxo e a tendência do fluxo aceitam setor: sustentação e a tendência dela recusam (BusinessMap e Acelerato separados)', () => {
    expect(querySustentacaoSchema.safeParse({ setor: 'plataformas' }).success).toBe(false);
    expect(queryTendenciaSchema.safeParse({ setor: 'plataformas' }).success).toBe(false);
    expect(queryTendenciaFluxoSchema.safeParse({ setor: 'plataformas', equipe: 'fluig', dataReferencia: '2026-10-08' })).toMatchObject({
      success: true, data: { filtros: { equipe: ['fluig'], setor: ['plataformas'] }, dataReferencia: '2026-10-08' },
    });
    expect(queryTendenciaFluxoSchema.safeParse({})).toMatchObject({ success: true, data: { filtros: { equipe: [], setor: [] } } });
    expect(queryTendenciaFluxoSchema.safeParse({ setor: 'Plataformas' }).success).toBe(false);
    expect(queryTendenciaFluxoSchema.safeParse({ tipo: 'melhoria' }).success).toBe(false);
  });
  it('normalizar: o setor entra na chave do cache (ordem e repetição não)', () => {
    expect(normalizar({ ...FL, setor: ['plataformas'] })).not.toBe(normalizar(FL));
    expect(normalizar({ ...FL, setor: ['b', 'a', 'a'] })).toBe(normalizar({ ...FL, setor: ['a', 'b'] }));
    expect(normalizar({ ...FL, setor: [] })).toBe(normalizar(FL));
  });
});

describe('097 L10b: base com setores', () => {
  const l = { cards: [], transicoes: [], bloqueios: [], colunas: [] };
  const ref = { equipes: [], sistemas: [], limitesWip: [], limiteFrentes: null, sle: [], alocacao: [], objetivos: [], areasInternas: [], fichas: [], criterios: [] };
  it('o mapa leva o quadro e o nome do setor; sem setores, lista vazia', () => {
    expect(montarBaseBM({ ...l, ref: { ...ref, setores: [{ id: '23', nome: 'Plataformas' }] } }).setores).toEqual([{ quadro_id: '23', nome: 'Plataformas' }]);
    expect(montarBaseBM({ ...l, ref }).setores).toEqual([]);
  });
});

describe('097 L10b: rotas e cálculo com setor', () => {
  it('fluxo aceita setor; recusa slug inválido; sustentação e visão geral recusam (400)', async () => {
    const { app } = await montar();
    expect((await get(app, '/api/v1/metricas/T1?setor=plataformas,sistemas-corporativos')).statusCode).toBe(200);
    expect((await get(app, '/api/v1/metricas/T1?setor=')).statusCode).toBe(200);
    for (const url of ['/api/v1/metricas/T1?setor=Plataformas', '/api/v1/metricas/S1?setor=plataformas', '/api/v1/metricas/VISAO_GERAL?setor=plataformas', '/api/v1/metricas/TENDENCIA_SUST?setor=plataformas', '/api/v1/metricas/TENDENCIA_FLUXO?setor=Plataformas']) {
      const r = await get(app, url);
      expect(r.statusCode, url).toBe(400);
      expect(r.json().error.code).toBe('VALIDATION_ERROR');
    }
    const t = await get(app, '/api/v1/metricas/TENDENCIA_FLUXO?dataReferencia=2026-10-08&setor=plataformas&equipe=fluig');
    expect(t.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.TENDENCIA_FLUXO.safeParse(t.json()).success).toBe(true);
  });

  it('o setor recorta o número: setores somam o todos, setor desconhecido zera, e a chave de cache separa os recortes', async () => {
    const { app, d } = await montar();
    const n = async (qs: string) => (await get(app, `/api/v1/metricas/O3?periodo=12m${qs}`)).json().base.n as number;
    const todos = await n('');
    const um = await n('&setor=sistemas-corporativos');
    const dois = await n('&setor=plataformas');
    expect(todos).toBeGreaterThan(0);
    expect(um).toBeGreaterThan(0);
    expect(dois).toBeGreaterThan(0);
    expect(um + dois).toBe(todos);
    expect(await n('&setor=sistemas-corporativos,plataformas')).toBe(todos);
    expect(await n('&setor=inexistente')).toBe(0);
    expect(d.chamadas.some((c) => c.texto.includes('dspd_bm.ref_dominio') && c.valores[0] === 'setor_quadro')).toBe(true);
    // nunca BusinessMap e Acelerato na mesma consulta
    for (const c of d.chamadas) expect(c.texto.includes('dspd_bm') && c.texto.includes('dspd_ac')).toBe(false);
  }, 60_000);

  it('sem o dicionário (lista vazia), o filtro Todos segue igual e qualquer setor dá vazio, sem erro', async () => {
    const inner = bancoDoMock(base);
    const { app } = await montar((c) => (c.texto.includes('FROM dspd_bm.ref_dominio') && c.valores[0] === 'setor_quadro' ? [] : inner(c)));
    const todos = await get(app, '/api/v1/metricas/O3?periodo=12m');
    expect(todos.statusCode).toBe(200);
    expect(todos.json().base.n).toBeGreaterThan(0);
    expect((await get(app, '/api/v1/metricas/O3?periodo=12m&setor=plataformas')).json().base.n).toBe(0);
  });

  it('o serviço calcula com setor direto e a resposta não traz bloco por setor', async () => {
    const d = criarDublePg(bancoComSetores());
    const s = new ServicoMetricas({ modoMock: true, db: d.pool });
    const r = await s.calcular('T1', { ...FL, setor: ['plataformas'] }, {}, AGORA);
    expect(JSON.stringify(r.resultado)).not.toMatch(/porSetor|sistemas-corporativos|"setor"/);
  });
});
