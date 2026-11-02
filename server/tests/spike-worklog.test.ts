import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CAMINHOS_PERMITIDOS, CAMPOS_WORKLOG, criarClienteHttp } from '../src/plataforma/http.js';
import { contarApontamentos, contarEventos, executarSpikeWorklog } from '../src/modulos/businessmap/spike-worklog.js';

// Servidor falso local: nenhuma chamada ao BusinessMap real, e o `.env` nunca é lido. Valores sintéticos com marcadores.
const KEY = 'chave-worklog-de-teste-0123456789';
const MARCADORES = ['NOME-MARCADOR', 'COMENTARIO-MARCADOR', 'pessoa@exemplo.com', '777001', '777002', 'TITULO-MARCADOR'];
const AGORA = Date.parse('2026-11-01T12:00:00Z');

type Pedido = { metodo: string; caminho: string; consulta: URLSearchParams; apikey: string | undefined };
interface Opcoes {
  status?: Record<string, number>;
  semCards?: boolean;
  extraNoApontamento?: boolean;
  /** Ids de card devolvidos por quadro (`board_ids`), ou `falha` (400). Sem a chave, vale o padrão de 3 cards. */
  cards?: Record<string, (number | string)[] | 'falha'>;
}

const apontamento = (id: number, quem: number, extra: boolean, comentario: string | null, categoria: number | null) => ({
  logged_time_id: id,
  card_id: 1000 + id,
  parent_card_id: id % 2 === 0 ? 500 : null,
  subtask_id: id === 3 ? 42 : null,
  lane_id: 7,
  column_id: 8,
  user_id: quem,
  category_id: categoria,
  date: '2026-10-30',
  time: 3600 * id,
  comment: comentario,
  logged_at: '2026-10-30T15:00:00Z',
  ...(extra ? { realname: 'NOME-MARCADOR' } : {}),
});

const responder = (o: Opcoes, p: Pedido): { status: number; corpo: unknown } => {
  const forcado = o.status?.[p.caminho];
  if (forcado !== undefined) return { status: forcado, corpo: {} };
  if (p.caminho === '/cards' && o.cards !== undefined) {
    const q = o.cards[p.consulta.get('board_ids') ?? ''];
    if (q === 'falha') return { status: 400, corpo: {} };
    return { status: 200, corpo: { data: { data: (q ?? []).map((id) => ({ card_id: id })) } } };
  }
  if (p.caminho === '/cards') {
    return { status: 200, corpo: { data: { data: o.semCards ? [] : [{ card_id: 1001 }, { card_id: 1002 }, { card_id: 1003 }], pagination: { all_pages: 1 } } } };
  }
  if (p.caminho === '/loggedTime') {
    const x = o.extraNoApontamento === true;
    return {
      status: 200,
      corpo: {
        data: {
          data: [
            apontamento(1, 777001, x, 'COMENTARIO-MARCADOR', 3),
            apontamento(2, 777001, x, null, null),
            apontamento(3, 777002, x, '   ', 4),
            apontamento(4, 777002, x, 'COMENTARIO-MARCADOR', null),
          ],
          pagination: { all_pages: 1 },
        },
      },
    };
  }
  if (p.caminho === '/loggedTime/history') {
    return {
      status: 200,
      corpo: {
        data: [
          { event_type: 'logged_time_created', logged_time_id: 1, user_id: 777001, at: '2026-10-30T15:00:00Z', comment: 'COMENTARIO-MARCADOR' },
          { event_type: 'logged_time_deleted', logged_time_id: 2, user_id: 777001, at: '2026-10-31T15:00:00Z' },
          { event_type: 'NOME-MARCADOR', logged_time_id: 3, user_id: 777002, at: '2026-10-31T16:00:00Z' },
          { logged_time_id: 4 },
        ],
      },
    };
  }
  if (p.caminho === '/loggedTimeCategories') return { status: 200, corpo: { data: [{ category_id: 3, name: 'TITULO-MARCADOR' }, { category_id: 4, name: 'Outra' }] } };
  return { status: 404, corpo: {} };
};

interface Falso { url: string; pedidos: Pedido[]; fechar: () => Promise<void> }
async function subir(o: Opcoes = {}): Promise<Falso> {
  const pedidos: Pedido[] = [];
  const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const u = new URL(req.url ?? '/', 'http://x');
    const p: Pedido = { metodo: req.method ?? '', caminho: u.pathname.replace(/^\/api\/v2/, ''), consulta: u.searchParams, apikey: req.headers.apikey as string | undefined };
    pedidos.push(p);
    const r = responder(o, p);
    res.writeHead(r.status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(r.corpo));
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  const { port } = server.address() as AddressInfo;
  return { url: `http://127.0.0.1:${port}/api/v2`, pedidos, fechar: () => new Promise<void>((ok) => server.close(() => ok())) };
}

let falso: Falso | undefined;
let tmp: string;
beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'spike-worklog-'));
});
afterEach(async () => {
  await falso?.fechar();
  falso = undefined;
  rmSync(tmp, { recursive: true, force: true });
});

const rodar = async (f: Falso, env: Record<string, string | undefined> = {}) =>
  executarSpikeWorklog({
    env: { BUSINESSMAP_URL_BASE: f.url, BUSINESSMAP_APIKEY: KEY, BUSINESSMAP_QUADROS_IDS: '10', BUSINESSMAP_LIMITE_POR_MINUTO: '1000', ...env },
    agora: () => AGORA,
    dormir: async () => undefined,
  });

describe('spike do worklog (E2.3)', () => {
  it('lê só por GET, nos três caminhos e com fields fixo, e imprime só forma e contagens', async () => {
    falso = await subir();
    const r = await rodar(falso);
    expect(r.codigo).toBe(0);
    expect(r.erro).toBe('');
    expect(falso.pedidos.every((p) => p.metodo === 'GET' && p.apikey === KEY)).toBe(true);
    expect(falso.pedidos.map((p) => p.caminho)).toEqual(['/cards', '/loggedTime', '/loggedTime/history', '/loggedTimeCategories']);
    const ap = falso.pedidos[1]!;
    expect(ap.consulta.get('card_ids')).toBe('1001,1002,1003');
    expect(ap.consulta.get('fields')).toBe(CAMPOS_WORKLOG);
    expect(ap.consulta.get('include_logged_time_for_subtasks')).toBe('1');
    expect(r.saida).toContain('- apontamentos: 4; cards distintos com apontamento: 4; pessoas distintas (só a contagem): 2');
    expect(r.saida).toContain('- com categoria: 2; com comentário não vazio: 2; com subtarefa: 1; com card pai: 2');
    expect(r.saida).toContain('- time inteiro: 4; menor e maior (segundos): 3600 e 14400');
    expect(r.saida).toContain('- eventos: 4; campo do tipo do evento: event_type; eventos sem tipo textual: 1');
    expect(r.saida).toContain('- logged_time_created: 1');
    expect(r.saida).toContain('- (outro): 1');
    expect(r.saida).toContain('- categorias: 2');
    expect(r.saida).toContain('`$.comment`: null | string (4x)');
    for (const m of MARCADORES) expect(r.saida).not.toContain(m);
    expect(r.saida).not.toContain(KEY);
  });

  it('não grava nada em arquivo (nem no diretório de trabalho de teste) e não repete valor sensível', async () => {
    falso = await subir({ extraNoApontamento: true });
    const antes = readdirSync(tmp);
    const r = await rodar(falso);
    expect(readdirSync(tmp)).toEqual(antes);
    expect(r.saida).toContain('campos a mais que o pedido: realname');
    for (const m of MARCADORES) expect(r.saida).not.toContain(m);
  });

  it('sem cards no lote sai com 3 e sem chamar o worklog', async () => {
    falso = await subir({ semCards: true });
    const r = await rodar(falso);
    expect(r.codigo).toBe(3);
    expect(falso.pedidos.map((p) => p.caminho)).toEqual(['/cards']);
  });

  it('falha não fatal em um caminho vira aviso; 401 interrompe com código 1 sem a chave', async () => {
    falso = await subir({ status: { '/loggedTimeCategories': 404 } });
    const r = await rodar(falso);
    expect(r.codigo).toBe(0);
    expect(r.saida).toContain('loggedTimeCategories: http');
    await falso.fechar();
    falso = await subir({ status: { '/cards': 401 } });
    const f = await rodar(falso);
    expect(f.codigo).toBe(1);
    expect(f.erro).not.toContain(KEY);
  });

  it('403 em um caminho do worklog vira aviso e os outros caminhos ainda são lidos', async () => {
    falso = await subir({ status: { '/loggedTime/history': 403 } });
    const r = await rodar(falso);
    expect(r.codigo).toBe(0);
    expect(r.saida).toContain('loggedTime/history: autenticacao: GET /loggedTime/history respondeu 403');
    expect(r.saida).toContain('- categorias: 2');
    expect(r.saida).toContain('- apontamentos: 4;');
  });

  it('configuração ausente sai com 2 e nomeia a variável', async () => {
    falso = await subir();
    const r = await rodar(falso, { BUSINESSMAP_QUADROS_IDS: undefined });
    expect(r).toEqual({ codigo: 2, saida: '', erro: 'variável obrigatória ausente: BUSINESSMAP_QUADROS_IDS' });
    expect(falso.pedidos).toHaveLength(0);
  });

  it('o lote tem no máximo 20 cards, sem repetição nem id inválido, e para de ler quadros ao completar', async () => {
    const muitos = [5, 5, 'x', -1, 1.5, ...Array.from({ length: 30 }, (_, i) => 100 + i)];
    falso = await subir({ cards: { '10': 'falha', '11': muitos, '12': [999] } });
    const r = await rodar(falso, { BUSINESSMAP_QUADROS_IDS: '10,11,12' });
    expect(r.codigo).toBe(0);
    expect(falso.pedidos.filter((p) => p.caminho === '/cards').map((p) => p.consulta.get('board_ids'))).toEqual(['10', '11']);
    const lote = falso.pedidos.find((p) => p.caminho === '/loggedTime')!.consulta.get('card_ids')!.split(',');
    expect(lote).toHaveLength(20);
    expect(new Set(lote).size).toBe(20);
    expect(lote.slice(0, 3)).toEqual(['5', '100', '101']);
    expect(r.saida).toContain('cards-quadro-10: http: GET /cards respondeu 400');
  });

  it('sem cards e com falha de leitura, o aviso acompanha o código 3', async () => {
    falso = await subir({ cards: { '10': 'falha' } });
    const r = await rodar(falso);
    expect(r.codigo).toBe(3);
    expect(r.erro).toContain('avisos: cards-quadro-10: http');
  });

  it('sem resposta do worklog, o relatório sai com contagens zeradas e avisos', async () => {
    falso = await subir({ status: { '/loggedTime': 404, '/loggedTime/history': 404, '/loggedTimeCategories': 404 } });
    const r = await rodar(falso);
    expect(r.codigo).toBe(0);
    expect(r.saida).toContain('- apontamentos: 0;');
    expect(r.saida).toContain('- eventos: 0;');
    expect(r.saida).toContain('(sem dados)');
  });

  it('usa o relógio real se não vier um e traduz erro que não é do cliente', async () => {
    falso = await subir();
    const semRelogio = await executarSpikeWorklog({
      env: { BUSINESSMAP_URL_BASE: falso.url, BUSINESSMAP_APIKEY: KEY, BUSINESSMAP_QUADROS_IDS: '10', BUSINESSMAP_LIMITE_POR_MINUTO: '1000' },
    });
    expect(semRelogio.codigo).toBe(0);
    const r = await executarSpikeWorklog({
      env: { BUSINESSMAP_URL_BASE: falso.url, BUSINESSMAP_APIKEY: KEY, BUSINESSMAP_QUADROS_IDS: '10' },
      agora: () => Number.NaN,
    });
    expect(r.codigo).toBe(1);
    expect(r.erro).toMatch(/^erro: /);
  });

  it('contagens: entrada que não é objeto e campos ausentes', () => {
    const c = contarApontamentos([null, 'x', { card_id: 1, user_id: 9, time: 1.5 }, { card_id: 2, user_id: null }, { card_id: 3 }]);
    expect(c.apontamentos).toBe(5);
    expect(c.pessoasDistintas).toBe(1);
    expect(c.tempoInteiro).toBe(0);
    expect(c.camposAusentes).toContain('logged_time_id');
    expect(contarEventos([]).campoTipo).toBeUndefined();
    expect(contarEventos([null, 7, { type: 'logged_time_updated' }, { type: 'logged_time_deleted' }]).porTipo.get('logged_time_updated')).toBe(1);
  });
});

describe('cliente HTTP: caminhos do worklog', () => {
  it('aceita só os três caminhos e recusa subcaminho e id', () => {
    const ok = (c: string) => CAMINHOS_PERMITIDOS.some((p) => p.test(c));
    expect(ok('/loggedTime')).toBe(true);
    expect(ok('/loggedTime/history')).toBe(true);
    expect(ok('/loggedTimeCategories')).toBe(true);
    expect(ok('/loggedTime/12')).toBe(false);
    expect(ok('/loggedTime/history/1')).toBe(false);
  });

  it('recusa fields diferente do fixo, parâmetro de pessoa e método de escrita não existe', async () => {
    falso = await subir();
    const c = criarClienteHttp({ urlBase: falso.url, apikey: KEY, limitePorMinuto: 1000, timeoutMs: 5000 });
    await expect(c.get('/loggedTime', { consulta: { fields: 'user_id' } })).rejects.toMatchObject({ tipo: 'consulta' });
    await expect(c.get('/loggedTime', { consulta: { user_ids: '1' } })).rejects.toMatchObject({ tipo: 'consulta' });
    await expect(c.get('/loggedTimeCategories', { consulta: { fields: CAMPOS_WORKLOG } })).rejects.toMatchObject({ tipo: 'consulta' });
    await expect(c.get('/loggedTimeCategories', { consulta: { page: 1 } })).resolves.toBeDefined();
    expect(Object.keys(c).sort()).toEqual(['get', 'listarPaginas']);
  });
});
