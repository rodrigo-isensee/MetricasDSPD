import { GRANULARIDADES, METRICA_IDS, TIPO_ID, fonteDaMetrica, type MetricaId } from '@metricas-dspd/contratos';
import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao';
import { acelerato, businessmap, calcularMetrica, CALENDARIO_PADRAO, slug, type ContextosMetricas } from '@metricas-dspd/metricas';
import { gerarBaseMock, gerarExtensoesMock, type BaseMock } from '@metricas-dspd/mock';
import { beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { resultadoO2PaginadoSchema } from '../src/modulos/metricas/schemas.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg } from './duble-pg.js';

/**
 * Testes SISTÊMICOS intensivos (QA, docs/qa/intensivo-sistemico.md): as 59 rotas de métrica sob uma matriz de filtros válidos
 * e inválidos, ETag/304, e as regras invioláveis verificadas sobre as respostas reais da API (pessoa, regra dos 20 itens,
 * BusinessMap x Acelerato, story/frente/projeto). Sem Postgres: o banco falso responde com as linhas que o seed gravaria.
 */
const AGORA = new Date('2026-10-10T15:00:00Z');
const base = gerarBaseMock({ escala: 0.25 });
type App = Awaited<ReturnType<typeof buildApp>>;
const montar = (b: BaseMock): Promise<App> => buildApp({ db: criarDublePg(bancoDoMock(b)).pool, agora: () => AGORA, nivelLog: 'silent' });
const url = (id: string, q: string): string => `/api/v1/metricas/${id}${q ? `?${q}` : ''}`;

const EQUIPE_BM = slug;
const TIPOS = Object.values(TIPO_ID);

const VALIDOS = {
  businessmap: () => {
    const eq = EQUIPE_BM(base.bm.config.equipes[0]!.nome);
    const sis = EQUIPE_BM(base.bm.config.sistemas[0]!);
    return ['', 'periodo=4s', 'periodo=6m', 'periodo=12m', 'periodo=custom&de=2026-01-05&ate=2026-06-30', `equipe=${eq}`, `tipo=${TIPOS[0]}`,
      `tipo=${TIPOS.join(',')}`, `sistema=${sis}`, `equipe=${eq}&sistema=${sis}&tipo=${TIPOS[1]}&periodo=12m`, 'dataReferencia=2026-09-01', 'equipe=,,'];
  },
  acelerato: () => ['', 'periodo=4s', 'periodo=12m', 'equipe=totvs', 'equipe=senior,fluig', 'prioridade=p1,P2', 'prioridade=P5&equipe=fluig&periodo=6m',
    'periodo=custom&de=2026-01-05&ate=2026-06-30', 'dataReferencia=2026-09-01'],
  ambos: () => ['', 'dataReferencia=2026-09-01'],
  pesquisa: () => ['', 'dataReferencia=2026-09-01'],
} as const;

const INVALIDOS_COMUNS = ['xyz=1', 'responsavel=ana', 'responsaveis=ana', 'usuario=ana', 'usuarioKey=123', 'email=ana%40x.com', 'pessoa=ana', 'agente=bob',
  'dataReferencia=2099-01-01', 'dataReferencia=31%2F12%2F2025', 'dataReferencia=2026-02-30', 'dataReferencia=hoje'];
const INVALIDOS = {
  businessmap: [...INVALIDOS_COMUNS, 'periodo=1a', 'periodo=custom', 'periodo=custom&de=2026-01-05', 'de=2026-01-05&ate=2026-02-01', 'prioridade=P1',
    'tipo=999', 'equipe=Equipe%20A', 'equipe=..%2F..', 'page=0', 'pageSize=201', 'page=abc'],
  acelerato: [...INVALIDOS_COMUNS, 'periodo=1a', 'periodo=custom&ate=2026-02-01', 'sistema=erp', 'tipo=1', 'equipe=xpto', 'prioridade=P9', 'page=1'],
  ambos: [...INVALIDOS_COMUNS, 'equipe=totvs', 'periodo=4s', 'sistema=erp'],
  pesquisa: [...INVALIDOS_COMUNS, 'equipe=totvs', 'periodo=4s'],
} as const;

const schemaDe = (id: MetricaId) => (id === 'O2' ? resultadoO2PaginadoSchema : SCHEMAS_RESULTADO[id]);

/** Respostas 200 da matriz válida, guardadas para as verificações de regra inviolável. */
const respostas: { id: MetricaId; q: string; corpo: unknown; texto: string }[] = [];
let app: App;

beforeAll(async () => {
  app = await montar(base);
}, 60_000);

describe('SIS-API: matriz de filtros nas 59 rotas', () => {
  it('são 59 rotas de métrica', () => {
    expect(METRICA_IDS).toHaveLength(59);
  });

  it.each([...METRICA_IDS])('%s: filtros válidos = 200 no schema, ETag estável e 304', async (id) => {
    for (const q of VALIDOS[fonteDaMetrica(id)]()) {
      const r = await app.inject(url(id, q));
      expect(r.statusCode, `${id}?${q} ${r.body.slice(0, 200)}`).toBe(200);
      const parse = schemaDe(id).safeParse(r.json());
      expect(parse.success, `${id}?${q} fora do schema`).toBe(true);
      expect(r.headers.etag, `${id}?${q}`).toMatch(/^W\/"[0-9a-f]{20}"$/);
      expect(r.headers['x-data-referencia']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(r.headers['x-versao-criterio']).toMatch(/^[\w.-]+$/);
      expect(r.headers['cache-control']).toBe('private, max-age=60');
      if (q.startsWith('dataReferencia=')) expect(r.headers['x-data-referencia']).toBe('2026-09-01');
      const r2 = await app.inject(url(id, q));
      expect(r2.headers.etag, `${id}?${q} ETag mudou sem mudança de dado`).toBe(r.headers.etag);
      const r3 = await app.inject({ method: 'GET', url: url(id, q), headers: { 'if-none-match': r.headers.etag as string } });
      expect(r3.statusCode, `${id}?${q} 304`).toBe(304);
      expect(r3.body).toBe('');
      const r4 = await app.inject({ method: 'GET', url: url(id, q), headers: { 'if-none-match': 'W/"00000000000000000000"' } });
      expect(r4.statusCode).toBe(200);
      respostas.push({ id, q, corpo: r.json(), texto: r.body });
    }
  }, 120_000);

  it.each([...METRICA_IDS])('%s: filtros inválidos = 400 VALIDATION_ERROR sem eco do valor', async (id) => {
    for (const q of INVALIDOS[fonteDaMetrica(id)]) {
      const r = await app.inject(url(id, q));
      expect(r.statusCode, `${id}?${q}: ${r.body.slice(0, 200)}`).toBe(400);
      const e = r.json().error;
      expect(e.code, `${id}?${q}`).toBe('VALIDATION_ERROR');
      expect(typeof e.message).toBe('string');
      for (const eco of ['ana', 'bob', 'ana@x.com', 'xpto', 'Equipe A', '../..']) expect(r.body, `${id}?${q} ecoou "${eco}"`).not.toContain(eco);
    }
  }, 60_000);

  it('ETag muda quando a consulta muda (filtro aplicável, período, data de referência)', async () => {
    const et = async (u: string) => (await app.inject(u)).headers.etag;
    expect(await et(url('O3', ''))).not.toBe(await et(url('O3', 'periodo=6m')));
    expect(await et(url('O3', ''))).not.toBe(await et(url('O3', 'dataReferencia=2026-09-01')));
    expect(await et(url('S2', ''))).not.toBe(await et(url('S2', 'prioridade=P1')));
    expect(await et(url('O2', 'page=1'))).not.toBe(await et(url('O2', 'page=2')));
    // a mesma consulta com lista em outra ordem é a mesma chave (filtros normalizados)
    expect(await et(url('S2', 'equipe=totvs,senior'))).toBe(await et(url('S2', 'equipe=senior,totvs')));
  });

  it('id inexistente, minúsculo ou de outra rota = 404 no formato único', async () => {
    for (const id of ['o1', 'X1', 'S13', 'visao_geral', 'EI-FL1']) {
      const r = await app.inject(url(id, ''));
      expect(r.statusCode, id).toBe(404);
      expect(r.json().error.code).toBe('METRICA_NAO_ENCONTRADA');
    }
  });
});

/* ---------- regras invioláveis sobre as respostas reais ---------- */

function* percorrer(v: unknown, caminho: string[] = [], ancestrais: Record<string, unknown>[] = []): Generator<{ obj: Record<string, unknown>; caminho: string[]; ancestrais: Record<string, unknown>[] }> {
  if (Array.isArray(v)) { let i = 0; for (const x of v) yield* percorrer(x, [...caminho, String(i++)], ancestrais); return; }
  if (v === null || typeof v !== 'object') return;
  const obj = v as Record<string, unknown>;
  yield { obj, caminho, ancestrais };
  for (const [k, x] of Object.entries(obj)) yield* percorrer(x, [...caminho, k], [...ancestrais, obj]);
}

describe('SIS-INV: regras invioláveis nas respostas da API', () => {
  it('nenhuma resposta (59 rotas x filtros) traz nome, e-mail ou id de pessoa da base', () => {
    expect(respostas.length).toBeGreaterThan(58 * 2);
    const pessoas = new Set<string>();
    for (const c of base.bm.cards) for (const p of c.responsaveis) pessoas.add(p);
    for (const t of base.bm.transicoes) if (t.usuario) pessoas.add(t.usuario);
    expect(pessoas.size).toBeGreaterThan(0);
    const termos = [...pessoas].filter((p) => p.length >= 4);
    const achados: string[] = [];
    for (const r of respostas) {
      for (const p of termos) if (r.texto.includes(p)) achados.push(`${r.id}?${r.q}: "${p}"`);
      if (/[\w.+-]+@[\w-]+\.[\w.]+/.test(r.texto)) achados.push(`${r.id}?${r.q}: e-mail`);
      for (const { obj } of percorrer(r.corpo))
        for (const k of Object.keys(obj)) if (/respons(?!abilidade)|usuario|agente|autor|pessoa|assignee|owner|email|nome_pessoa/i.test(k)) achados.push(`${r.id}?${r.q}: chave ${k}`);
    }
    expect(achados.slice(0, 20)).toEqual([]);
  });

  it('regra dos 20 itens: estatística insuficiente nunca carrega valor; percentil e percentual só sob status ok com n >= 20', () => {
    const achados: string[] = [];
    for (const r of respostas) {
      for (const { obj, caminho, ancestrais } of percorrer(r.corpo)) {
        const onde = `${r.id}?${r.q} ${caminho.join('.')}`;
        if (obj.status === 'insuficiente') {
          if (typeof obj.n === 'number' && obj.n >= 20) achados.push(`${onde}: insuficiente com n=${obj.n}`);
          for (const { obj: sub } of percorrer(obj)) for (const k of ['valor', 'pct', 'p50', 'p85', 'p95', 'media']) if (k in sub && sub[k] !== null) achados.push(`${onde}: insuficiente publica ${k}`);
        }
        if (obj.status === 'ok' && typeof obj.n === 'number' && 'minimo' in obj === false && ('valor' in obj || 'pct' in obj) && obj.n < 20) achados.push(`${onde}: ok com n=${obj.n}`);
        const chave = (['p50', 'p85', 'p95', 'pct'] as const).find((k) => k in obj && obj[k] !== null && typeof obj[k] !== 'object');
        if (chave) {
          // o "n" mais próximo (o próprio objeto ou um ancestral) governa o valor: tem de ser >= 20 e não insuficiente
          // Denominador: numa fatia de distribuição ({ n, pct } sem status) é o total do nó pai (n, total ou base.n);
          // numa estatística/taxa ou ponto de série ({ n, p85 }) é o n do próprio nó.
          const nDe = (a: Record<string, unknown>): number | undefined => typeof a.n === 'number' ? a.n : typeof a.total === 'number' ? a.total
            : typeof (a.base as { n?: unknown } | undefined)?.n === 'number' ? (a.base as { n: number }).n : undefined;
          const fatia = chave === 'pct' && !('status' in obj) && typeof obj.n === 'number';
          const cadeia = fatia ? ancestrais : [...ancestrais, obj];
          const dono = [...cadeia].reverse().find((a) => nDe(a) !== undefined);
          const guardado = dono !== undefined && nDe(dono)! >= 20 && dono.status !== 'insuficiente';
          if (!guardado) achados.push(`${onde}: ${chave}=${String(obj[chave])} com n=${String(dono ? nDe(dono) : '?')} fora de estatística ok`);
        }
      }
    }
    expect([...new Set(achados.map((a) => a.replace(/\?[^ ]* /, ' ').replace(/\.\d+(?=\.|:|$)/g, '.*').replace(/=[\d.]+ com n=\d+/, '=x com n<20')))].slice(0, 40)).toEqual([]);
  });

  it('histogramas: a soma das faixas bate com o n da estatística', () => {
    const achados: string[] = [];
    for (const r of respostas) {
      for (const { obj, caminho } of percorrer(r.corpo)) {
        if (obj.status !== 'ok' || typeof obj.n !== 'number') continue;
        const v = obj.valor as Record<string, unknown> | undefined;
        if (v && Array.isArray(v.faixas)) {
          const soma = (v.faixas as { contagem: number }[]).reduce((s, f) => s + f.contagem, 0);
          if (soma !== obj.n) achados.push(`${r.id}?${r.q} ${caminho.join('.')}: soma ${soma} != n ${obj.n}`);
        }
      }
    }
    expect(achados.slice(0, 20)).toEqual([]);
  });
});

describe('SIS-ISO: BusinessMap e Acelerato nunca se misturam (troca da base da outra fonte)', () => {
  const outra = gerarBaseMock({ escala: 0.25, semente: 4242 });
  it('trocar toda a base do Acelerato não muda nenhuma métrica do fluxo; trocar a do BusinessMap não muda nenhuma da sustentação', async () => {
    const appTrocaAC = await montar({ ...base, ac: outra.ac });
    const appTrocaBM = await montar({ ...base, bm: { ...outra.bm, config: base.bm.config } });
    const diferentes: string[] = [];
    for (const id of METRICA_IDS) {
      const f = fonteDaMetrica(id);
      if (f !== 'businessmap' && f !== 'acelerato') continue;
      const alvo = f === 'businessmap' ? appTrocaAC : appTrocaBM;
      for (const q of VALIDOS[f]().slice(0, 4)) {
        const a = await app.inject(url(id, q));
        const b = await alvo.inject(url(id, q));
        if (a.body !== b.body) diferentes.push(`${id}?${q}`);
      }
    }
    expect(diferentes).toEqual([]);
    // controle: trocar a PRÓPRIA base muda o resultado (o teste é sensível)
    expect((await appTrocaAC.inject(url('S2', ''))).body).not.toBe((await app.inject(url('S2', ''))).body);
    expect((await appTrocaBM.inject(url('O3', ''))).body).not.toBe((await app.inject(url('O3', ''))).body);
  }, 120_000);
});

describe('SIS-GRAN: story, frente e projeto nunca no mesmo histograma (base reduzida a uma granularidade)', () => {
  const CORTE = '2026-10-09T23:59:59-03:00';
  const ext = gerarExtensoesMock(base);
  const ac = acelerato.criarContextoAC(base.ac, CORTE, CALENDARIO_PADRAO);
  const ctxDe = (b: BaseMock['bm']): ContextosMetricas => ({ bm: businessmap.criarContextoBM(b, CORTE, CALENDARIO_PADRAO), ac, ext });
  const so = (g: string): BaseMock['bm'] => {
    const ids = new Set(base.bm.cards.filter((c) => c.granularidade === g).map((c) => c.card_id));
    return { ...base.bm, cards: base.bm.cards.filter((c) => ids.has(c.card_id)), transicoes: base.bm.transicoes.filter((t) => ids.has(t.card_id)),
      bloqueios: base.bm.bloqueios.filter((t) => ids.has(t.card_id)), fichas: base.bm.fichas.filter((t) => ids.has(t.card_id)) };
  };
  const FILTROS = { equipe: [], tipo: [], sistema: [], periodo: { tipo: '12m' as const } };

  /** Caminhos de histograma (`faixas`, `histograma`, `histogramas`) e o seu conteúdo serializado. */
  const histogramas = (v: unknown): Map<string, string> => {
    const m = new Map<string, string>();
    for (const { obj, caminho } of percorrer(v)) for (const k of ['faixas', 'histograma', 'histogramas']) if (k in obj) m.set([...caminho, k].join('.'), JSON.stringify(obj[k]));
    return m;
  };

  it('cada histograma do fluxo é reproduzido por exatamente uma granularidade (nenhum mistura níveis)', () => {
    const completos = new Map<MetricaId, Map<string, string>>();
    const ids = METRICA_IDS.filter((id) => fonteDaMetrica(id) === 'businessmap');
    for (const id of ids) completos.set(id, histogramas(calcularMetrica(id, FILTROS as never, ctxDe(base.bm))));
    const porGran = new Map(GRANULARIDADES.map((g) => [g, ctxDe(so(g))]));
    const mistos: string[] = [];
    let conferidos = 0;
    for (const id of ids) {
      const h = completos.get(id)!;
      if (h.size === 0) continue;
      const reduzidos = new Map(GRANULARIDADES.map((g) => [g, histogramas(calcularMetrica(id, FILTROS as never, porGran.get(g)!))]));
      for (const [caminho, json] of h) {
        // histograma vazio (sem faixas) não diz nada sobre mistura
        if (!/"contagem":[1-9]/.test(json)) continue;
        conferidos++;
        const iguais = GRANULARIDADES.filter((g) => reduzidos.get(g)!.get(caminho) === json);
        if (iguais.length !== 1) mistos.push(`${id} ${caminho}: reproduzido por [${iguais.join(',')}]`);
      }
    }
    expect(conferidos).toBeGreaterThan(5);
    expect(mistos).toEqual([]);
  }, 120_000);
});
