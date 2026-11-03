import { describe, expect, it, vi } from 'vitest';
import { descreverForma, executarSpikePaginacao } from '../src/modulos/businessmap/spike-paginacao.js';

const KEY = 'chave-super-secreta-ABC123xyz';
const ENV = { BUSINESSMAP_URL_BASE: 'https://bm.exemplo.com/api/v2', BUSINESSMAP_APIKEY: KEY };
const SEGREDOS = ['Fulano Realname', 'pessoa@exemplo.com', 'comentario-secreto', '987654'];
const registro = { logged_time_id: 1, user_id: 987654, comment: 'comentario-secreto', name: 'Fulano Realname', email: 'pessoa@exemplo.com' };

const resposta = (status: number, corpo: unknown) => async () => new Response(JSON.stringify(corpo), { status });

describe('spike de paginação do /loggedTime', () => {
  it('faz 1 GET em /loggedTime com card_ids e page=2 e a chave só no cabeçalho', async () => {
    const f = vi.fn(resposta(200, { data: { data: [registro, registro], pagination: { all_pages: 3, current_page: 2 } } }));
    const r = await executarSpikePaginacao({ env: ENV, argumentos: ['123'], fetchImpl: f as unknown as typeof fetch });
    expect(f).toHaveBeenCalledTimes(1);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://bm.exemplo.com/api/v2/loggedTime?card_ids=123&page=2');
    expect(init.method).toBe('GET');
    expect((init.headers as Record<string, string>).apikey).toBe(KEY);
    expect(url).not.toContain(KEY);
    expect(r.codigo).toBe(0);
  });

  it('imprime só status, contagem, chaves do envelope e números de paginação', async () => {
    const f = resposta(200, { data: { data: [registro, registro], pagination: { all_pages: 3, current_page: 2, texto: 'x' } } });
    const r = await executarSpikePaginacao({ env: ENV, argumentos: ['123'], fetchImpl: f as unknown as typeof fetch });
    expect(r.saida).toContain('status HTTP: 200');
    expect(r.saida).toContain('registros devolvidos: 2');
    expect(r.saida).toContain('raiz: data');
    expect(r.saida).toContain('data: data, pagination');
    expect(r.saida).toContain('all_pages=3 · current_page=2');
    expect(r.saida).not.toContain('texto');
    for (const s of [...SEGREDOS, KEY, 'loggedTime?', 'apikey']) expect(r.saida).not.toContain(s);
    expect(r.saida).not.toContain('http');
  });

  it('aceita lista direta em data e informa quando não há paginação', () => {
    expect(descreverForma({ data: [registro] })).toEqual({ registros: 1, chaves: 'raiz: data', paginacao: '(nenhum)' });
    expect(descreverForma('texto').registros).toBeNull();
  });

  it('descarta nomes de chave fora do padrão seguro', () => {
    const f = descreverForma({ data: [], 'a b@c.com': 1, pagination: { 'x y': 5, ok: 7 } });
    expect(f.chaves).not.toContain('@');
    expect(f.paginacao).toBe('ok=7');
  });

  it.each(['abc', '12a', '-5', '0', '1.5', '', '1 2', '1&page=1', '../x'])('recusa id não numérico %j antes da rede', async (id) => {
    const f = vi.fn();
    const r = await executarSpikePaginacao({ env: ENV, argumentos: [id], fetchImpl: f as unknown as typeof fetch });
    expect(r.codigo).toBe(2);
    expect(f).not.toHaveBeenCalled();
  });

  it('recusa sem argumento ou com mais de um', async () => {
    const f = vi.fn();
    for (const argumentos of [[], ['1', '2']]) {
      expect((await executarSpikePaginacao({ env: ENV, argumentos, fetchImpl: f as unknown as typeof fetch })).codigo).toBe(2);
    }
    expect(f).not.toHaveBeenCalled();
  });

  it('erro de configuração nomeia a variável e não mostra valor', async () => {
    const r = await executarSpikePaginacao({ env: { BUSINESSMAP_URL_BASE: 'http://inseguro.exemplo.com', BUSINESSMAP_APIKEY: KEY }, argumentos: ['1'] });
    expect(r.codigo).toBe(2);
    expect(r.erro).toContain('BUSINESSMAP_URL_BASE');
    expect(r.erro).not.toContain(KEY);
  });

  it('status de erro mostra só o status, sem corpo nem chave', async () => {
    const f = resposta(403, { message: `negado ${KEY} Fulano Realname` });
    const r = await executarSpikePaginacao({ env: ENV, argumentos: ['1'], fetchImpl: f as unknown as typeof fetch });
    expect(r.codigo).toBe(1);
    expect(r.saida).toContain('status HTTP: 403');
    expect(r.saida + r.erro).not.toContain(KEY);
    expect(r.saida).not.toContain('Fulano');
  });

  it('falha de rede não vaza a chave, a URL nem a causa', async () => {
    const f = async () => {
      throw Object.assign(new Error(`falhou em https://bm.exemplo.com/api/v2/loggedTime?card_ids=1 com ${KEY}`), { name: 'TypeError' });
    };
    const r = await executarSpikePaginacao({ env: ENV, argumentos: ['1'], fetchImpl: f as unknown as typeof fetch });
    expect(r.codigo).toBe(1);
    expect(r.erro).toBe('GET /loggedTime: erro de rede');
    expect(r.erro).not.toContain(KEY);
  });

  it('não repete a chamada: só 1 GET mesmo com 429 ou 500', async () => {
    for (const status of [429, 500]) {
      const f = vi.fn(resposta(status, {}));
      await executarSpikePaginacao({ env: ENV, argumentos: ['1'], fetchImpl: f as unknown as typeof fetch });
      expect(f).toHaveBeenCalledTimes(1);
    }
  });

  it('tempo esgotado e abortado dão a mensagem de tempo esgotado', async () => {
    for (const nome of ['TimeoutError', 'AbortError']) {
      const f = async () => {
        throw Object.assign(new Error(KEY), { name: nome });
      };
      const r = await executarSpikePaginacao({ env: ENV, argumentos: ['1'], fetchImpl: f as unknown as typeof fetch });
      expect(r.erro).toBe('GET /loggedTime: tempo esgotado');
    }
  });

  it('corpo que não é JSON conta como formato não reconhecido, sem imprimir o corpo', async () => {
    const f = async () => new Response('<html>Fulano Realname</html>', { status: 200 });
    const r = await executarSpikePaginacao({ env: ENV, argumentos: ['1'], fetchImpl: f as unknown as typeof fetch });
    expect(r.saida).toContain('registros devolvidos: (não reconhecido)');
    expect(r.saida).not.toContain('Fulano');
  });

  it('sem fetch injetado usa o fetch global (1 GET)', async () => {
    const g = vi.fn(resposta(200, { data: [] }));
    vi.stubGlobal('fetch', g);
    try {
      const r = await executarSpikePaginacao({ env: ENV, argumentos: ['7'] });
      expect(g).toHaveBeenCalledTimes(1);
      expect(r.saida).toContain('registros devolvidos: 0');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('lê paginação na raiz e formas sem lista', () => {
    expect(descreverForma({ data: [], pagination: { all_pages: 2 } }).paginacao).toBe('all_pages=2');
    expect(descreverForma({ data: { x: 1 } })).toEqual({ registros: null, chaves: 'raiz: data · data: x', paginacao: '(nenhum)' });
    expect(descreverForma({ data: 5 }).registros).toBeNull();
    expect(descreverForma({}).chaves).toBe('raiz: (sem chaves)');
    expect(descreverForma({ data: {} }).chaves).toBe('raiz: data · data: (sem chaves)');
    expect(descreverForma({ data: { data: [], pagination: { a: 'x', b: Infinity } } }).paginacao).toBe('(nenhum)');
  });
});
