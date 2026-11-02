import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { criarClienteHttp, ErroBusinessMap, lotesDeUserIds, LOTE_USER_IDS, type ConfigHttp, type EventoHttp } from '../src/plataforma/http.js';

// Servidor falso local: nenhuma chamada ao BusinessMap real. Cada servidor guarda o que recebeu.
const CHAVE = 'chave-secreta-de-teste-0123456789';

type Pedido = { metodo: string; url: string; apikey: string | undefined };
type Resposta = (req: IncomingMessage, res: ServerResponse, n: number) => void;
type Falso = { server: Server; pedidos: Pedido[]; url: string; resposta: Resposta };

const subir = async (resposta: Resposta): Promise<Falso> => {
  const pedidos: Pedido[] = [];
  const falso = { pedidos, resposta } as Falso;
  falso.server = createServer((req, res) => {
    pedidos.push({ metodo: req.method ?? '', url: req.url ?? '', apikey: req.headers.apikey as string | undefined });
    falso.resposta(req, res, pedidos.length);
  });
  await new Promise<void>((ok) => falso.server.listen(0, '127.0.0.1', ok));
  falso.url = `http://127.0.0.1:${(falso.server.address() as AddressInfo).port}`;
  return falso;
};
const json = (res: ServerResponse, status: number, corpo: unknown, extra: Record<string, string> = {}): void => {
  res.writeHead(status, { 'content-type': 'application/json', ...extra });
  res.end(JSON.stringify(corpo));
};

let falsos: Falso[] = [];
const novo = async (r: Resposta): Promise<Falso> => {
  const f = await subir(r);
  falsos.push(f);
  return f;
};
afterEach(async () => {
  for (const f of falsos) {
    f.server.closeAllConnections();
    await new Promise<void>((ok) => f.server.close(() => ok()));
  }
  falsos = [];
});

/** Relógio falso: `dormir` só avança o tempo, e guarda as esperas. */
const relogio = () => {
  let t = 1_000_000;
  const esperas: number[] = [];
  return { esperas, agora: () => t, dormir: async (ms: number) => { esperas.push(ms); t += ms; } };
};
const cfg = (urlBase: string, extra: Partial<ConfigHttp> = {}): ConfigHttp => ({ urlBase, apikey: CHAVE, limitePorMinuto: 25, timeoutMs: 2000, ...extra });
const falhaDe = async (p: Promise<unknown>): Promise<ErroBusinessMap> => {
  try {
    await p;
  } catch (e) {
    expect(e).toBeInstanceOf(ErroBusinessMap);
    return e as ErroBusinessMap;
  }
  throw new Error('esperava erro');
};

describe('cliente HTTP do BusinessMap: só GET, lista fechada e host fixo', () => {
  let f: Falso;
  beforeEach(async () => { f = await novo((_q, r) => json(r, 200, { data: [{ board_id: 1 }] })); });

  it('GET na lista: envia a chave só no cabeçalho apikey, método GET, e devolve o JSON validado', async () => {
    const c = criarClienteHttp(cfg(f.url));
    const r = await c.get('/boards', { esquema: z.object({ data: z.array(z.object({ board_id: z.number() })) }) });
    expect(r.data[0]!.board_id).toBe(1);
    expect(f.pedidos).toEqual([{ metodo: 'GET', url: '/boards', apikey: CHAVE }]);
    expect(f.pedidos[0]!.url).not.toContain(CHAVE);
  });

  it('prefixo de caminho da base (api/v2) entra antes do caminho', async () => {
    const c = criarClienteHttp(cfg(`${f.url}/api/v2/`));
    await c.get('/boards/12/currentStructure');
    expect(f.pedidos[0]!.url).toBe('/api/v2/boards/12/currentStructure');
  });

  it('resposta fora do schema do chamador é erro de formato, sem o conteúdo', async () => {
    const c = criarClienteHttp(cfg(f.url));
    const e = await falhaDe(c.get('/boards', { esquema: z.object({ data: z.string() }) }));
    expect(e.tipo).toBe('formato');
    expect(e.message).not.toContain('board_id');
  });

  it('o cliente expõe só get e listarPaginas (sem método genérico) e todo pedido sai como GET', async () => {
    const c = criarClienteHttp(cfg(f.url));
    expect(Object.keys(c).sort()).toEqual(['get', 'listarPaginas']);
    await c.get('/cards/1');
    expect(f.pedidos.map((p) => p.metodo)).toEqual(['GET']);
  });

  it('todo pedido que chega ao servidor é GET (a lista inteira)', async () => {
    const c = criarClienteHttp(cfg(f.url));
    for (const caminho of ['/workspaces', '/boards', '/boards/3', '/boards/3/currentStructure', '/boards/3/workflows', '/boards/3/columns',
      '/boards/3/lanes', '/cardTypes', '/customFields', '/cards', '/cards/9', '/cards/9/revisions', '/cards/9/comments']) await c.get(caminho);
    await c.get('/users', { consulta: { fields: 'user_id,realname', user_ids: '1,2' } });
    expect(f.pedidos).toHaveLength(14);
    expect(new Set(f.pedidos.map((p) => p.metodo))).toEqual(new Set(['GET']));
  });

  it('caminho fora da lista fechada é recusado sem tocar a rede', async () => {
    const c = criarClienteHttp(cfg(f.url));
    for (const caminho of ['/admin', '/boards/abc', '/boards/1/cards', '/cards/1/delete', '/cards/1/', '/boards/../users', '/users/1', '/webhooks',
      '/boards?x=1', '/cards/1#a', 'boards', '/Boards', '']) {
      expect((await falhaDe(c.get(caminho))).tipo, caminho).toBe('caminho');
    }
    expect(f.pedidos).toEqual([]);
  });

  it('caminho com host próprio (URL completa ou //host) é recusado: o host é só o do .env', async () => {
    const c = criarClienteHttp(cfg(f.url));
    for (const caminho of ['https://evil.example/boards', 'http://127.0.0.1:1/boards', '//evil.example/boards', 'javascript:alert(1)']) {
      expect((await falhaDe(c.get(caminho))).tipo, caminho).toBe('host');
    }
    expect(f.pedidos).toEqual([]);
  });

  it('/users só com fields=user_id,realname e user_ids; qualquer outro parâmetro é recusado; fields não vale em outro caminho', async () => {
    const c = criarClienteHttp(cfg(f.url));
    const F = 'user_id,realname';
    const ruins: Record<string, string | number>[] = [{}, { fields: 'user_id,realname,email' }, { fields: 'user_id' }, { fields: 'realname,user_id' }, { fields: '*' }, { user_ids: '1' },
      { fields: F }, { fields: F, user_ids: '1,a' }, { fields: F, user_ids: '1', expand: 'custom_fields' }, { fields: F, user_ids: '1', page: 1 },
      { fields: F, user_ids: '1', per_page: 100 }, { fields: F, user_ids: '1', is_archived: 1 }, { fields: `${F}\n`, user_ids: '1' }];
    for (const consulta of ruins) {
      expect((await falhaDe(c.get('/users', { consulta }))).tipo, JSON.stringify(consulta)).toBe('consulta');
    }
    expect((await falhaDe(c.get('/boards', { consulta: { fields: 'user_id,realname' } }))).tipo).toBe('consulta');
    expect(f.pedidos).toEqual([]);
    await c.get('/users', { consulta: { fields: 'user_id,realname', user_ids: '10,11' } });
    expect(f.pedidos[0]!.url).toBe('/users?fields=user_id%2Crealname&user_ids=10%2C11');
    expect((await falhaDe(c.listarPaginas('/users', { consulta: { fields: F, user_ids: '1' } }))).tipo).toBe('consulta');
    expect(f.pedidos).toHaveLength(1);
  });

  it('lista grande de ids vai em lotes de user_ids que o cliente aceita', async () => {
    const ids = Array.from({ length: LOTE_USER_IDS * 2 + 5 }, (_, i) => i + 1);
    const lotes = lotesDeUserIds(ids);
    expect(lotes.map((l) => l.split(',').length)).toEqual([LOTE_USER_IDS, LOTE_USER_IDS, 5]);
    expect(lotesDeUserIds([])).toEqual([]);
    const c = criarClienteHttp(cfg(f.url));
    for (const l of lotes) await c.get('/users', { consulta: { fields: 'user_id,realname', user_ids: l } });
    expect(f.pedidos).toHaveLength(3);
    expect((await falhaDe(c.get('/users', { consulta: { fields: 'user_id,realname', user_ids: ids.join(',') } }))).tipo).toBe('consulta');
  });

  it('parâmetro de consulta fora da lista ou com valor fora do formato é recusado', async () => {
    const c = criarClienteHttp(cfg(f.url));
    const ruins: Record<string, string>[] = [{ apikey: 'x' }, { page: 'a' }, { expand: 'custom_fields;drop' }, { user_ids: '1,a' }, { archived_from: 'ontem' },
      { toString: '1' }, { __proto__x: '1' }];
    for (const consulta of ruins) {
      expect((await falhaDe(c.get('/cards', { consulta }))).tipo, JSON.stringify(consulta)).toBe('consulta');
    }
    expect(f.pedidos).toEqual([]);
    await c.get('/cards', { consulta: { page: 2, archived_from: '2025-10-30', is_archived: 1 } });
    expect(f.pedidos).toHaveLength(1);
  });

  it('state e expand valem só em /cards (listagem), com valores de lista fechada (spike F1)', async () => {
    const c = criarClienteHttp(cfg(f.url));
    await c.get('/cards', { consulta: { state: 'archived', expand: 'custom_fields,transitions,block_times,linked_cards', board_ids: '23' } });
    expect(f.pedidos).toHaveLength(1);
    expect(f.pedidos[0]!.metodo).toBe('GET');
    expect(f.pedidos[0]!.url).toContain('expand=custom_fields%2Ctransitions%2Cblock_times%2Clinked_cards');
    expect(f.pedidos[0]!.url).toContain('state=archived');
    // E2.83: co-responsáveis só por expand em /cards (a API v2 recusa co_owner_ids em fields)
    await c.get('/cards', { consulta: { expand: 'custom_fields,linked_cards,transitions,co_owner_ids', board_ids: '23' } });
    expect(f.pedidos[1]!.url).toContain('expand=custom_fields%2Clinked_cards%2Ctransitions%2Cco_owner_ids');
    const ruins: [string, Record<string, string>][] = [
      ['/cards', { expand: 'subtasks' }], ['/cards', { expand: 'watcher_ids' }], ['/cards', { expand: 'co_owner_ids,watcher_ids' }],
      ['/cards', { expand: 'transitions,transitions,transitions,transitions,transitions,transitions' }], ['/cards/5', { expand: 'co_owner_ids' }],
      ['/cards', { state: 'deleted' }], ['/cards', { state: 'active;drop' }],
      ['/cards/5', { expand: 'custom_fields' }], ['/cards/5', { state: 'active' }], ['/boards', { expand: 'custom_fields' }],
      ['/customFields', { state: 'active' }], ['/users', { expand: 'custom_fields' }],
    ];
    for (const [caminho, consulta] of ruins) {
      expect((await falhaDe(c.get(caminho, { consulta }))).tipo, `${caminho} ${JSON.stringify(consulta)}`).toBe('consulta');
    }
    expect(f.pedidos).toHaveLength(2);
  });

  it('URL base insegura é recusada na criação: http fora de loopback, credencial, consulta, fragmento, texto qualquer', () => {
    for (const u of ['http://bm.example.com', 'https://u:p@bm.example.com', 'https://bm.example.com?a=1', 'https://bm.example.com#x', 'ftp://bm.example.com', 'nada']) {
      expect(() => criarClienteHttp(cfg(u)), u).toThrow(ErroBusinessMap);
    }
    expect(() => criarClienteHttp(cfg('https://bm.example.com/api/v2'))).not.toThrow();
  });
});

describe('cliente HTTP: redirect, segredo e erros', () => {
  it('redirect não é seguido: a chave não chega ao outro host', async () => {
    const outro = await novo((_q, r) => json(r, 200, {}));
    const f = await novo((_q, r) => { r.writeHead(302, { location: `${outro.url}/boards` }); r.end(); });
    const c = criarClienteHttp(cfg(f.url));
    const e = await falhaDe(c.get('/boards'));
    expect(e.tipo).toBe('redirect');
    expect(e.status).toBe(302);
    expect(f.pedidos).toHaveLength(1);
    expect(outro.pedidos).toEqual([]);
  });

  it('a chave não aparece em erro (mensagem, stack, JSON), nem em log; erro sem cause e sem corpo', async () => {
    const eco = await novo((_q, r) => json(r, 500, { erro: `corpo com a chave ${CHAVE} e dado interno` }));
    const eventos: EventoHttp[] = [];
    const k = relogio();
    const c = criarClienteHttp(cfg(eco.url), { ...k, log: (e) => eventos.push(e) });
    const e = await falhaDe(c.get('/cards'));
    expect(e.tipo).toBe('indisponivel');
    expect(eco.pedidos).toHaveLength(3);
    expect(e.cause).toBeUndefined();
    const visivel = [e.message, e.stack ?? '', JSON.stringify(e), String(e), JSON.stringify(eventos), JSON.stringify(Object.entries(e))].join('\n');
    expect(visivel).not.toContain(CHAVE);
    expect(visivel).not.toContain('dado interno');
    expect(eventos.length).toBeGreaterThan(0);
    for (const ev of eventos) expect(Object.keys(ev).every((k2) => ['evento', 'caminho', 'status', 'esperaMs'].includes(k2))).toBe(true);
  });

  it('erro de rede: sem cause e sem endereço na mensagem; erros de rede somam 3 tentativas com espera de 1 s e 4 s', async () => {
    const f = await subir((_q, r) => json(r, 200, {}));
    await new Promise<void>((ok) => f.server.close(() => ok()));
    const k = relogio();
    const e = await falhaDe(criarClienteHttp(cfg(f.url), k).get('/boards'));
    expect(e.tipo).toBe('indisponivel');
    expect(e.cause).toBeUndefined();
    expect(e.message).toBe('GET /boards: erro de rede ECONNREFUSED (3 tentativas)');
    expect(e.message).not.toContain('127.0.0.1');
    expect(k.esperas).toEqual([1000, 4000]);
  });

  it('erro de rede sem código reconhecível: mensagem genérica', async () => {
    const c = criarClienteHttp(cfg('https://bm.example.com'), { ...relogio(), fetchImpl: async () => { throw new TypeError('x', { cause: { code: 'a-b' } }); } });
    expect((await falhaDe(c.get('/boards'))).message).toBe('GET /boards: erro de rede (3 tentativas)');
  });

  it('tempo esgotado: tipo próprio', async () => {
    const f = await novo(() => undefined);
    const c = criarClienteHttp(cfg(f.url, { timeoutMs: 50 }), relogio());
    const e = await falhaDe(c.get('/boards'));
    expect(e.tipo).toBe('tempo-esgotado');
    expect(f.pedidos).toHaveLength(3);
  });

  it('5xx tenta de novo e recupera; 4xx comum não repete e não vaza o corpo', async () => {
    const f = await novo((_q, r, n) => (n < 3 ? json(r, 503, {}) : json(r, 200, { ok: true })));
    expect(await criarClienteHttp(cfg(f.url), relogio()).get('/boards')).toEqual({ ok: true });
    expect(f.pedidos).toHaveLength(3);
    const g = await novo((_q, r) => json(r, 404, { detalhe: 'segredo do servidor' }));
    const e = await falhaDe(criarClienteHttp(cfg(g.url), relogio()).get('/cards/1'));
    expect(e).toMatchObject({ tipo: 'http', status: 404 });
    expect(e.message).not.toContain('segredo');
    expect(g.pedidos).toHaveLength(1);
  });

  it('2xx que não é JSON é erro de formato, sem o texto', async () => {
    const f = await novo((_q, r) => { r.writeHead(200); r.end('<html>erro interno</html>'); });
    const e = await falhaDe(criarClienteHttp(cfg(f.url)).get('/boards'));
    expect(e.tipo).toBe('formato');
    expect(e.message).not.toContain('html');
  });
});

describe('cliente HTTP: 401, 403 e 429', () => {
  it.each([401, 403])('%i interrompe a execução: uma só chamada e nenhuma nova tentativa, nem em outros caminhos', async (status) => {
    const f = await novo((_q, r) => json(r, status, { message: 'sem acesso' }));
    const eventos: EventoHttp[] = [];
    const c = criarClienteHttp(cfg(f.url), { ...relogio(), log: (e) => eventos.push(e) });
    const e = await falhaDe(c.get('/boards'));
    expect(e).toMatchObject({ tipo: 'autenticacao', status });
    expect(f.pedidos).toHaveLength(1);
    expect((await falhaDe(c.get('/cards'))).tipo).toBe('autenticacao');
    expect((await falhaDe(c.listarPaginas('/cards'))).tipo).toBe('autenticacao');
    expect(f.pedidos).toHaveLength(1);
    expect(eventos.at(-1)).toEqual({ evento: 'interrompido', caminho: '/cards' });
    expect(eventos.some((x) => x.caminho.includes('/admin'))).toBe(false);
    expect((await falhaDe(c.get('/admin?apikey=segredo'))).tipo).toBe('caminho');
    expect(eventos.every((x) => !x.caminho.includes('segredo'))).toBe(true);
  });

  it('429 espera o retry_after do corpo e tenta de novo', async () => {
    const f = await novo((_q, r, n) => (n === 1 ? json(r, 429, { error: { retry_after: 7 } , retry_after: 7 }) : json(r, 200, { ok: 1 })));
    const k = relogio();
    expect(await criarClienteHttp(cfg(f.url), k).get('/boards')).toEqual({ ok: 1 });
    expect(k.esperas).toEqual([7000]);
    expect(f.pedidos).toHaveLength(2);
  });

  it('429: usa o cabeçalho Retry-After sem corpo válido; sem nada, 60 s; limites de 1 s e 120 s', async () => {
    const casos: [Resposta, number][] = [
      [(_q, r) => { r.writeHead(429, { 'retry-after': '3' }); r.end('não é json'); }, 3000],
      [(_q, r) => { r.writeHead(429); r.end(); }, 60_000],
      [(_q, r) => json(r, 429, { retry_after: 0 }), 1000],
      [(_q, r) => json(r, 429, { retry_after: 120 }), 120_000],
      [(_q, r) => { r.writeHead(429, { 'retry-after': 'logo' }); r.end('{}'); }, 60_000],
    ];
    for (const [resp, esperado] of casos) {
      let primeira = true;
      const f = await novo((q, r, n) => { if (n === 1 && primeira) { primeira = false; resp(q, r, n); } else json(r, 200, {}); });
      const k = relogio();
      await criarClienteHttp(cfg(f.url), k).get('/boards');
      expect(k.esperas).toEqual([esperado]);
    }
  });

  it.each([
    ['corpo', (_q: IncomingMessage, r: ServerResponse) => json(r, 429, { retry_after: 121 })],
    ['cabeçalho', (_q: IncomingMessage, r: ServerResponse) => { r.writeHead(429, { 'retry-after': '9999' }); r.end('{}'); }],
  ])('429 com retry_after acima de 120 s (%s) interrompe a execução: sem espera e sem nova chamada', async (_nome, resp) => {
    const f = await novo(resp);
    const k = relogio();
    const eventos: EventoHttp[] = [];
    const c = criarClienteHttp(cfg(f.url), { ...k, log: (e) => eventos.push(e) });
    const e = await falhaDe(c.get('/boards'));
    expect(e).toMatchObject({ tipo: 'limite-requisicoes', status: 429 });
    expect(k.esperas).toEqual([]);
    expect(f.pedidos).toHaveLength(1);
    expect((await falhaDe(c.get('/cards'))).tipo).toBe('limite-requisicoes');
    expect(f.pedidos).toHaveLength(1);
    expect(eventos.at(-1)).toEqual({ evento: 'interrompido', caminho: '/cards' });
  });

  it('sem dependências injetadas (fetch, relógio e espera reais): 429 com retry_after de 1 s espera de verdade', async () => {
    const f = await novo((_q, r, n) => (n === 1 ? json(r, 429, { retry_after: 1 }) : json(r, 200, { ok: 2 })));
    const antes = Date.now();
    expect(await criarClienteHttp(cfg(f.url)).get('/boards')).toEqual({ ok: 2 });
    expect(Date.now() - antes).toBeGreaterThanOrEqual(900);
  });

  it('429 persistente: cinco esperas e erro, sem corpo', async () => {
    const f = await novo((_q, r) => json(r, 429, { retry_after: 2, detalhe: 'interno' }));
    const k = relogio();
    const e = await falhaDe(criarClienteHttp(cfg(f.url), k).get('/boards'));
    expect(e).toMatchObject({ tipo: 'indisponivel', status: 429 });
    expect(e.message).not.toContain('interno');
    expect(k.esperas).toEqual([2000, 2000, 2000, 2000, 2000]);
    expect(f.pedidos).toHaveLength(6);
  });
});

describe('cliente HTTP: limitador e páginas', () => {
  it('nunca passa de N requisições em qualquer janela de 60 s (janela móvel)', async () => {
    const f = await novo((_q, r) => json(r, 200, {}));
    const k = relogio();
    const instantes: number[] = [];
    const c = criarClienteHttp(cfg(f.url, { limitePorMinuto: 3 }), { ...k, fetchImpl: async (...a) => { instantes.push(k.agora()); return fetch(...a); } });
    for (let i = 0; i < 10; i += 1) await c.get('/boards');
    expect(instantes).toHaveLength(10);
    for (const t of instantes) expect(instantes.filter((x) => x >= t && x < t + 60_000).length).toBeLessThanOrEqual(3);
    expect(k.esperas.length).toBeGreaterThan(0);
  });

  it('janela horária: ao chegar no limite a execução para; a hora seguinte libera, e o padrão é abaixo de 600', async () => {
    const f = await novo((_q, r) => json(r, 200, {}));
    const k = relogio();
    const c = criarClienteHttp(cfg(f.url, { limitePorMinuto: 100, limitePorHora: 4 }), k);
    for (let i = 0; i < 4; i += 1) await c.get('/boards');
    const e = await falhaDe(c.get('/boards'));
    expect(e).toMatchObject({ tipo: 'limite-requisicoes' });
    expect(e.message).toContain('4 requisições por hora');
    expect(f.pedidos).toHaveLength(4);
    expect(k.esperas).toEqual([]);
    expect((await falhaDe(c.get('/cards'))).tipo).toBe('limite-requisicoes');
    expect(f.pedidos).toHaveLength(4);
    // janela vencida (sem execução parada): novo cliente, relógio que passa de 1 h, as requisições antigas saem da janela
    const k2 = relogio();
    const c2 = criarClienteHttp(cfg(f.url, { limitePorMinuto: 100, limitePorHora: 2 }), k2);
    await c2.get('/boards');
    await c2.get('/boards');
    await k2.dormir(3_600_000);
    await c2.get('/boards');
    expect(f.pedidos).toHaveLength(7);
    const padrao = criarClienteHttp(cfg(f.url, { limitePorMinuto: 10_000 }), relogio());
    let feitas = 0;
    const antes = f.pedidos.length;
    try {
      for (;;) { await padrao.get('/boards'); feitas += 1; }
    } catch (err) {
      expect((err as ErroBusinessMap).tipo).toBe('limite-requisicoes');
    }
    expect(feitas).toBeLessThan(600);
    expect(f.pedidos.length - antes).toBe(feitas);
  });

  it('o padrão da configuração é 25 por minuto: a 26ª requisição espera', async () => {
    const f = await novo((_q, r) => json(r, 200, {}));
    const k = relogio();
    const c = criarClienteHttp(cfg(f.url), k);
    for (let i = 0; i < 25; i += 1) await c.get('/boards');
    expect(k.esperas).toEqual([]);
    await c.get('/boards');
    expect(k.esperas).toEqual([60_000]);
  });

  it('listarPaginas junta as páginas, manda per_page e valida os itens', async () => {
    const f = await novo((q, r) => {
      const pagina = Number(new URL(q.url!, 'http://x').searchParams.get('page'));
      json(r, 200, { data: { data: [{ card_id: pagina }], pagination: { all_pages: 3 } } });
    });
    const c = criarClienteHttp(cfg(f.url, { paginaTamanho: 50 }), relogio());
    const itens = await c.listarPaginas('/cards', { consulta: { is_archived: 0 }, esquemaItem: z.object({ card_id: z.number() }) });
    expect(itens).toEqual([{ card_id: 1 }, { card_id: 2 }, { card_id: 3 }]);
    expect(f.pedidos.map((p) => new URL(p.url, 'http://x').searchParams.get('per_page'))).toEqual(['50', '50', '50']);
    expect(f.pedidos).toHaveLength(3);
  });

  it('listarPaginas: lista simples é uma página; sem pagination é uma página; per_page padrão 100', async () => {
    const f = await novo((_q, r) => json(r, 200, { data: [{ a: 1 }, { a: 2 }] }));
    const c = criarClienteHttp(cfg(f.url), relogio());
    expect(await c.listarPaginas('/boards')).toEqual([{ a: 1 }, { a: 2 }]);
    expect(f.pedidos).toHaveLength(1);
    expect(f.pedidos[0]!.url).toContain('per_page=100');
    const g = await novo((_q, r) => json(r, 200, { data: { data: [{ a: 1 }] } }));
    expect(await criarClienteHttp(cfg(g.url)).listarPaginas('/cards')).toEqual([{ a: 1 }]);
  });

  it('corpo acima do teto de bytes: erro limite-bytes, com o cabeçalho de tamanho ou lendo em blocos', async () => {
    const grande = await novo((_q, r) => r.end('x'.repeat(200)));
    const e = await falhaDe(criarClienteHttp(cfg(grande.url, { tetoBytes: 100 })).get('/boards'));
    expect(e).toMatchObject({ tipo: 'limite-bytes', status: 200 });
    expect(e.message).not.toContain('xxx');
    const blocos = await novo((_q, r) => { r.write('a'.repeat(60)); setTimeout(() => r.end('b'.repeat(60)), 20); });
    expect((await falhaDe(criarClienteHttp(cfg(blocos.url, { tetoBytes: 100 })).get('/boards'))).tipo).toBe('limite-bytes');
    const no429 = await novo((_q, r) => { r.writeHead(429); r.end('y'.repeat(200)); });
    expect((await falhaDe(criarClienteHttp(cfg(no429.url, { tetoBytes: 100 }), relogio()).get('/boards'))).tipo).toBe('limite-bytes');
    const ok = await novo((_q, r) => json(r, 200, { data: 'z'.repeat(50) }));
    expect(await criarClienteHttp(cfg(ok.url, { tetoBytes: 100 })).get('/boards')).toEqual({ data: 'z'.repeat(50) });
  });

  it('resposta sem corpo (204) é erro de formato, não de limite', async () => {
    const f = await novo((_q, r) => { r.writeHead(204); r.end(); });
    expect((await falhaDe(criarClienteHttp(cfg(f.url)).get('/boards'))).tipo).toBe('formato');
  });

  it('teto de páginas por execução: para antes de passar do teto', async () => {
    const f = await novo((_q, r) => json(r, 200, { data: { data: [{ a: 1 }], pagination: { all_pages: 1000 } } }));
    const c = criarClienteHttp(cfg(f.url, { tetoPaginas: 4 }), relogio());
    const e = await falhaDe(c.listarPaginas('/cards'));
    expect(e.tipo).toBe('limite-paginas');
    expect(f.pedidos).toHaveLength(4);
    expect((await falhaDe(c.listarPaginas('/boards'))).tipo).toBe('limite-paginas');
    expect(f.pedidos).toHaveLength(4);
  });

  it('listarPaginas: envelope ou item fora do formato é erro de formato', async () => {
    const f = await novo((_q, r) => json(r, 200, { nada: true }));
    expect((await falhaDe(criarClienteHttp(cfg(f.url)).listarPaginas('/cards'))).tipo).toBe('formato');
    const g = await novo((_q, r) => json(r, 200, { data: [{ a: 'x' }] }));
    const e = await falhaDe(criarClienteHttp(cfg(g.url)).listarPaginas('/boards', { esquemaItem: z.object({ a: z.number() }) }));
    expect(e.tipo).toBe('formato');
    expect(e.message).not.toContain('"x"');
  });
});
