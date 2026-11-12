import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { criarDublePg, type Respondedor } from './duble-pg.js';

const AGORA = new Date('2026-10-10T15:00:00Z');
async function montar(r: Respondedor = () => [{ ok: 1 }]) {
  const d = criarDublePg(r);
  const linhas: string[] = [];
  const app = await buildApp({ modoMock: true, db: d.pool, agora: () => AGORA, nivelLog: 'info', destinoLog: { write: (m) => { linhas.push(m); } } });
  return { app, d, linhas };
}
const responder: Respondedor = (c) => {
  if (c.texto.includes('ref_quadro')) return [{ equipe: 'Plataforma Núcleo' }];
  if (c.texto.includes("campo = 'sistema'")) return [{ codigo: 'ERP', rotulo: 'ERP Central' }];
  if (c.texto.includes('SELECT DISTINCT tipo')) return [{ tipo: 'Melhoria' }, { tipo: 'Bug interno' }, { tipo: 'Incidente' }, { tipo: 'Categoria nova' }];
  if (c.texto.includes('SELECT DISTINCT prioridade')) return [{ prioridade: 'P3' }, { prioridade: 'P1' }, { prioridade: 'P9' }];
  if (c.texto.includes('SELECT DISTINCT equipe') && c.texto.includes('dim_chamado')) return [{ equipe: 'SSSC TOTVS' }, { equipe: 'Time Novo' }, { equipe: 'time-novo' }];
  if (c.texto.includes('dim_card')) return [{ inicio: '2026-01-05' }];
  if (c.texto.includes('dim_chamado')) return [{ inicio: null }];
  if (c.texto.includes('ctl_coleta') && c.texto.includes('finalizado_em FROM')) return c.texto.includes('dspd_bm') ? [{ finalizado_em: new Date('2026-10-09T09:00:00Z') }] : [];
  if (c.texto.includes('ref_versao_criterio')) return [{ versao_id: '7' }];
  return [];
};

describe('saúde', () => {
  it('live, ready e /health respondem ok; ready consulta o banco', async () => {
    const { app, d } = await montar();
    for (const u of ['/health/live', '/health/ready', '/health']) expect((await app.inject(u)).json()).toEqual({ status: 'ok' });
    expect(d.chamadas).toHaveLength(2);
  });
  it('banco fora = 503 BASE_INDISPONIVEL sem detalhe interno', async () => {
    const { app } = await montar(() => new Error('senha=segredo host=10.0.0.1'));
    const r = await app.inject('/health/ready');
    expect(r.statusCode).toBe(503);
    expect(r.json()).toEqual({ error: { code: 'BASE_INDISPONIVEL', message: 'Base indisponível.' } });
    expect(r.body).not.toContain('segredo');
  });
});

describe('filtros', () => {
  it('businessmap: equipes por slug, tipos, sistemas e histórico', async () => {
    const { app } = await montar(responder);
    const r = await app.inject('/api/v1/filtros/businessmap');
    expect(r.statusCode).toBe(200);
    expect(r.headers['cache-control']).toBe('private, max-age=60');
    const j = r.json();
    expect(j.equipes).toEqual([{ id: 'plataforma-nucleo', nome: 'Plataforma Núcleo' }]);
    expect(j.sistemas).toEqual([{ id: 'erp', nome: 'ERP Central' }]);
    // L6 do 097: só as categorias presentes nas stories, ids de TIPO_ID, na ordem do contrato; sem Incidente nem rótulo fora do enum.
    expect(j.tipos).toEqual([{ id: 'melhoria', nome: 'Melhoria' }, { id: 'bug-interno', nome: 'Bug interno' }]);
    expect(j.historico).toEqual({ inicio: '2026-01-05', fim: '2026-10-10' });
  });
  it('acelerato: equipes do dado real (id = slug, sem id repetido) e prioridades presentes; base vazia usa fim como início', async () => {
    const { app } = await montar(responder);
    const j = (await app.inject('/api/v1/filtros/acelerato')).json();
    expect(j.equipes).toEqual([{ id: 'sssc-totvs', nome: 'SSSC TOTVS' }, { id: 'time-novo', nome: 'Time Novo' }]);
    expect(j.prioridades).toEqual([{ id: 'p1', nome: 'P1' }, { id: 'p3', nome: 'P3' }]);
    expect(j.historico).toEqual({ inicio: '2026-10-10', fim: '2026-10-10' });
    expect(j.tipos).toBeUndefined();
  });
  it('businessmap com base vazia', async () => {
    const { app } = await montar((c) => (c.texto.includes('dim_card') ? [] : []));
    const j = (await app.inject('/api/v1/filtros/businessmap')).json();
    expect(j.historico).toEqual({ inicio: '2026-10-10', fim: '2026-10-10' });
    expect(j.tipos).toEqual([]);
  });
  it('K-279: opção que só existe fora do corte das listas não aparece (tipos e prioridades)', async () => {
    // Dublê de banco: a categoria "Melhoria" e a prioridade P2 só existem fora do corte; o que o SQL não restringe, o dublê devolve.
    const { app } = await montar((c) => {
      if (c.texto.includes('SELECT DISTINCT tipo')) {
        const cortado = c.texto.includes('criado_em IS NOT NULL');
        return cortado ? [{ tipo: 'Bug interno' }] : [{ tipo: 'Bug interno' }, { tipo: 'Melhoria' }];
      }
      if (c.texto.includes('SELECT DISTINCT prioridade')) {
        const cortado = ['aberto_em IS NOT NULL', 'equipe IS NOT NULL', 'fora_do_recorte = false'].every((p) => c.texto.includes(p));
        return cortado ? [{ prioridade: 'P1' }] : [{ prioridade: 'P1' }, { prioridade: 'P2' }];
      }
      return [];
    });
    const bm = (await app.inject('/api/v1/filtros/businessmap')).json();
    expect(bm.tipos).toEqual([{ id: 'bug-interno', nome: 'Bug interno' }]);
    const ac = (await app.inject('/api/v1/filtros/acelerato')).json();
    expect(ac.prioridades).toEqual([{ id: 'p1', nome: 'P1' }]);
  });
  it('L7a do 097: equipes da sustentação só as do corte de lerChamados (recorte, equipe e abertura)', async () => {
    const { app } = await montar((c) => {
      if (c.texto.includes('SELECT DISTINCT equipe') && c.texto.includes('dim_chamado')) {
        const cortado = ['aberto_em IS NOT NULL', 'equipe IS NOT NULL', 'fora_do_recorte = false'].every((p) => c.texto.includes(p));
        return cortado ? [{ equipe: 'SSSC FLUIG' }] : [{ equipe: 'SSSC FLUIG' }, { equipe: 'Fora do recorte' }];
      }
      return [];
    });
    const j = (await app.inject('/api/v1/filtros/acelerato')).json();
    expect(j.equipes).toEqual([{ id: 'sssc-fluig', nome: 'SSSC FLUIG' }]);
  });
  it('K-288: dois nomes de mesmo slug ficam com o primeiro em bytes, nas duas ordens do banco', async () => {
  for (const ordem of [['time-novo', 'Time Novo'], ['Time Novo', 'time-novo']]) {
      const { app } = await montar((c) => (c.texto.includes('SELECT DISTINCT equipe') ? ordem.map((equipe) => ({ equipe })) : []));
      const j = (await app.inject('/api/v1/filtros/acelerato')).json();
      expect(j.equipes).toEqual([{ id: 'time-novo', nome: 'Time Novo' }]);
    }
  });
  it('acelerato com base vazia: equipes e prioridades = lista vazia', async () => {
    const { app } = await montar(() => []);
    const j = (await app.inject('/api/v1/filtros/acelerato')).json();
    expect(j.equipes).toEqual([]);
    expect(j.prioridades).toEqual([]);
  });
  it('domínio inválido e parâmetro de pessoa = 400 VALIDATION_ERROR', async () => {
    const { app, d } = await montar(responder);
    for (const u of ['/api/v1/filtros/outro', '/api/v1/filtros/businessmap?responsavel=ana', '/api/v1/filtros/acelerato?agente=bob']) {
      const r = await app.inject(u);
      expect(r.statusCode, u).toBe(400);
      expect(r.json().error.code).toBe('VALIDATION_ERROR');
      expect(r.body).not.toContain('ana');
    }
    expect(d.chamadas).toHaveLength(0);
  });
});

describe('referência', () => {
  it('uma data, última coleta por fonte e versão do critério', async () => {
    const { app } = await montar(responder);
    expect((await app.inject('/api/v1/referencia')).json()).toEqual({
      dataReferencia: '2026-10-09',
      ultimaColeta: { businessmap: '2026-10-09T06:00:00-03:00', acelerato: null },
      versaoCriterio: '7',
    });
  });
  it('sem versão: "0"', async () => {
    const { app } = await montar(() => []);
    expect((await app.inject('/api/v1/referencia')).json().versaoCriterio).toBe('0');
  });
  it('query de pessoa recusada', async () => {
    const { app } = await montar(responder);
    expect((await app.inject('/api/v1/referencia?autor=x')).statusCode).toBe(400);
  });
});

describe('erros e log', () => {
  it('404 no formato único e x-request-id (aproveita o seguro, troca o inseguro)', async () => {
    const { app } = await montar();
    const r = await app.inject({ url: '/nada', headers: { 'x-request-id': 'abc-12345678' } });
    expect(r.statusCode).toBe(404);
    expect(r.json().error.code).toBe('ROTA_NAO_ENCONTRADA');
    expect(r.headers['x-request-id']).toBe('abc-12345678');
    expect((await app.inject({ url: '/nada', headers: { 'x-request-id': 'x y!' } })).headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });
  it('erro 4xx do Fastify (JSON quebrado) e 500 sem detalhe; 5xx é logado e redige segredo', async () => {
    const { app, linhas } = await montar(responder);
    app.post('/x', async () => 1);
    const ruim = await app.inject({ method: 'POST', url: '/x', headers: { 'content-type': 'text/xyz' }, payload: 'a' });
    expect(ruim.statusCode).toBe(415);
    expect(ruim.json().error.code).toBe('REQUISICAO_INVALIDA');
    const j = await app.inject({ method: 'POST', url: '/x', headers: { 'content-type': 'application/json' }, payload: '{' });
    expect(j.statusCode).toBe(400);
    expect(j.json().error.code).toBe('VALIDATION_ERROR');
    const a2 = await montar();
    a2.app.get('/boom', () => { throw new Error('SQL secreto'); });
    const r = await a2.app.inject({ url: '/boom', headers: { authorization: 'Bearer tok123' } });
    expect(r.statusCode).toBe(500);
    expect(r.json()).toEqual({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno.' } });
    expect(a2.linhas.join('')).toContain('erro inesperado');
    expect(a2.linhas.join('')).not.toContain('tok123');
    expect(linhas.join('')).toContain('requestId');
  });
  it('AppError vira status e código; resposta fora do schema = 500 sem vazar', async () => {
    const { app } = await montar();
    const { AppError } = await import('../src/plataforma/erros.js');
    app.get('/conflito', () => { throw new AppError('CONFLITO', 'duplicado', 409, [{ a: 1 }]); });
    app.get('/vazio', () => { throw new AppError('X', 'y', 422); });
    const r = await app.inject('/conflito');
    expect(r.statusCode).toBe(409);
    expect(r.json()).toEqual({ error: { code: 'CONFLITO', message: 'duplicado', details: [{ a: 1 }] } });
    expect((await app.inject('/vazio')).json().error.details).toBeUndefined();
  });
  it('saída fora do schema vira 500 e não publica o campo', async () => {
    const { app } = await montar((c) => (c.texto.includes('dim_chamado') ? [{ inicio: 'nao-e-data' }] : []));
    const r = await app.inject('/api/v1/filtros/acelerato');
    expect(r.statusCode).toBe(500);
    expect(r.json().error.code).toBe('INTERNAL_ERROR');
  });
});

describe('LGPD: nenhuma rota expõe dado por pessoa', () => {
  it('nenhuma rota/parâmetro com termo de pessoa e nenhum campo de pessoa nas respostas', async () => {
    const { app } = await montar(responder);
    await app.ready();
    const termo = /responsavel|responsaveis|agente|assignee|autor|ranking|usuario/i;
    const rotas = Object.keys(app.swagger().paths ?? {});
    for (const r of rotas) expect(r).not.toMatch(termo);
    const corpos = [
      (await app.inject('/api/v1/filtros/businessmap')).body,
      (await app.inject('/api/v1/filtros/acelerato')).body,
      (await app.inject('/api/v1/referencia')).body,
    ].join('');
    expect(corpos).not.toMatch(termo);
  });
});

describe('nível de log', () => {
  it('padrão info com e sem destino', async () => {
    const d = criarDublePg();
    const a = await buildApp({ db: d.pool, agora: () => AGORA, destinoLog: { write: () => undefined } });
    const b = await buildApp({ db: d.pool, agora: () => AGORA });
    expect(a.log.level).toBe('info');
    expect(b.log.level).toBe('info');
  });
});
