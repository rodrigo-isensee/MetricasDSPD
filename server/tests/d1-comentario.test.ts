import { describe, expect, it } from 'vitest';
import { contarComentarios, executarD1, lerContagemComentario } from '../src/modulos/businessmap/apontamento/d1-comentario.js';
import { criarClienteHttp, ErroBusinessMap } from '../src/plataforma/http.js';

// Pedido 087, K-330: comando só de leitura do D1. Dublê do cliente HTTP; nenhuma chamada real. Prova as contagens e que nada além delas sai.

const SEGREDO = 'SEGREDO-do-comentario';
const NOME = 'Fulana de Tal';
const worklog = (comment: unknown, extra: Record<string, unknown> = {}) => ({ logged_time_id: 1, card_id: 10, user_id: 777, realname: NOME, comment, ...extra });
const semChave = { logged_time_id: 2, card_id: 10, user_id: 777, realname: NOME };

const falso = (respostas: (unknown | Error)[]) => {
  const chamadas: { caminho: string; consulta: Record<string, string | number> }[] = [];
  return {
    chamadas,
    get: (caminho: string, o?: { consulta?: Record<string, string | number> }) => {
      chamadas.push({ caminho, consulta: { ...o!.consulta! } });
      const r = respostas[chamadas.length - 1];
      return r instanceof Error ? Promise.reject(r) : Promise.resolve(r);
    },
  } as never as Parameters<typeof lerContagemComentario>[0] & { chamadas: typeof chamadas };
};
const cards = { data: { data: [{ card_id: 10 }, { card_id: 11 }, { card_id: 10.5 }, { card_id: 'x' }, null, { card_id: 0 }], pagination: { all_pages: 3 } } };

describe('contarComentarios', () => {
  it('separa texto, chave ausente ou nula (semChave) e chave presente vazia, só espaço ou não texto (comentarioVazio)', () => {
    const itens = [worklog('texto'), worklog('  x '), worklog(''), worklog('   '), worklog(null), worklog(5), semChave, 'lixo', null];
    expect(contarComentarios(itens)).toEqual({ comComentario: 2, semChave: 4, comentarioVazio: 3, total: 9 });
  });
  it('lista vazia: tudo zero', () => {
    expect(contarComentarios([])).toEqual({ comComentario: 0, semChave: 0, comentarioVazio: 0, total: 0 });
  });
});

describe('lerContagemComentario', () => {
  it('lê uma página de cards (só card_id) e UMA de worklogs, só dos ids válidos', async () => {
    const c = falso([cards, { data: { data: [worklog('a'), worklog(''), semChave], pagination: { all_pages: 9 } } }]);
    expect(await lerContagemComentario(c)).toEqual({ comComentario: 1, semChave: 1, comentarioVazio: 1, total: 3 });
    expect(c.chamadas.map((x) => x.caminho)).toEqual(['/cards', '/loggedTime']);
    expect(c.chamadas[0]!.consulta).toMatchObject({ fields: 'card_id', page: 1 });
    expect(c.chamadas[1]!.consulta).toMatchObject({ card_ids: '10,11', page: 1 });
  });
  it('limita a 200 cards', async () => {
    const muitos = { data: Array.from({ length: 250 }, (_, i) => ({ card_id: i + 1 })) };
    const c = falso([muitos, { data: [] }]);
    await lerContagemComentario(c);
    expect(String(c.chamadas[1]!.consulta.card_ids).split(',')).toHaveLength(200);
  });
  it('sem cards válidos: zeros e nenhuma chamada de worklog', async () => {
    const c = falso([{ data: [] }]);
    expect(await lerContagemComentario(c)).toEqual({ comComentario: 0, semChave: 0, comentarioVazio: 0, total: 0 });
    expect(c.chamadas).toHaveLength(1);
  });
  it('a consulta passa nas listas fechadas do cliente real (só GET, sem rede)', async () => {
    const urls: string[] = [];
    const fetchImpl = (async (url: string, init: { method: string }) => {
      urls.push(`${init.method} ${url}`);
      const corpo = url.includes('/cards') ? cards : { data: [worklog('a')] };
      return new Response(JSON.stringify(corpo), { status: 200 });
    }) as unknown as typeof fetch;
    const cliente = criarClienteHttp({ urlBase: 'https://exemplo.invalid/api/v2', apikey: 'k', limitePorMinuto: 25, timeoutMs: 5000 }, { fetchImpl });
    expect(await lerContagemComentario(cliente)).toEqual({ comComentario: 1, semChave: 0, comentarioVazio: 0, total: 1 });
    expect(urls).toHaveLength(2);
    expect(urls.every((u) => u.startsWith('GET https://exemplo.invalid/api/v2/'))).toBe(true);
  });
});

describe('executarD1', () => {
  it('saída é só uma linha JSON com as quatro contagens: nada de nome, id, texto ou campo do worklog', async () => {
    const c = falso([cards, { data: [worklog(SEGREDO, { title: 'Título secreto', email: 'a@b.c' }), semChave] }]);
    const r = await executarD1(c);
    expect(r.erro).toBeNull();
    expect(JSON.parse(r.saida)).toEqual({ comComentario: 1, semChave: 1, comentarioVazio: 0, total: 2 });
    expect(Object.keys(JSON.parse(r.saida))).toEqual(['comComentario', 'semChave', 'comentarioVazio', 'total']);
    for (const proibido of [SEGREDO, NOME, '777', 'Título', 'a@b.c', 'card_id', 'user_id']) expect(r.saida).not.toContain(proibido);
    expect(r.saida.endsWith('\n')).toBe(true);
  });
  it('erro do cliente sai como código fechado, sem a mensagem nem valor', async () => {
    const r = await executarD1(falso([new ErroBusinessMap('autenticacao', `GET /cards respondeu 401 ${SEGREDO}`, 401)]));
    expect(r).toEqual({ saida: '', erro: 'autenticacao' });
  });
  it('erro desconhecido vira erro-interno, sem eco', async () => {
    const r = await executarD1(falso([new Error(SEGREDO)]));
    expect(r).toEqual({ saida: '', erro: 'erro-interno' });
    expect(JSON.stringify(r)).not.toContain(SEGREDO);
  });
  it('resposta de worklog fora da forma vira código formato', async () => {
    expect(await executarD1(falso([cards, { data: 'x' }]))).toEqual({ saida: '', erro: 'formato' });
  });
});
