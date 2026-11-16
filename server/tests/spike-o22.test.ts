import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  analisarComentarios, analisarRevisoes, autorDoComentario, escolherAmostra, executarSpikeO22, levantarContas, novoAcumuloComentarios, novoAcumuloRevisoes,
  validarSaida, type CardAmostra, type Evento,
} from '../src/modulos/businessmap/spike-o22.js';
import { CAMINHOS_PERMITIDOS, criarClienteHttp } from '../src/plataforma/http.js';

// Pedido 105, E7.104 (B5 do O22): spike só de leitura. Dados FICTÍCIOS; nenhuma chamada real. Marcadores de texto e nome provam que nada
// disso chega à tela; o nome só pode ir ao arquivo de saída, fora do repositório.

const NOME = 'Nome-Ficticio-MARCADOR';
const TEXTO = 'TEXTO-DO-COMENTARIO-MARCADOR';
const TITULO = 'TITULO-MARCADOR';
const pastas: string[] = [];
afterEach(() => { for (const p of pastas.splice(0)) rmSync(p, { recursive: true, force: true }); });
const pasta = (): string => { const p = mkdtempSync(join(tmpdir(), 'o22-')); pastas.push(p); return p; };

const ev = (conta: number | null, ms: number, card: string, extra: Partial<Evento> = {}): Evento => ({ conta, externo: false, ms, card, fonte: 'revisao', criacao: false, ...extra });
const T0 = Date.parse('2026-11-02T15:00:00Z'); // 12h em Brasília

describe('validarSaida', () => {
  it('recusa caminho relativo, dentro do repositório e arquivo que já existe', () => {
    const raiz = pasta();
    expect(() => validarSaida('saida.md', raiz)).toThrow(/absoluto/);
    expect(() => validarSaida(join(raiz, 'saida.md'), raiz)).toThrow(/dentro do repositório/);
    expect(() => validarSaida(join(raiz, 'sub', 'saida.md'), raiz)).toThrow(/dentro do repositório/);
    expect(() => validarSaida(raiz, raiz)).toThrow(/dentro do repositório/);
    const fora = pasta();
    writeFileSync(join(fora, 'ja.md'), 'x');
    expect(() => validarSaida(join(fora, 'ja.md'), raiz)).toThrow(/já existe/);
    expect(validarSaida(join(fora, 'novo.md'), raiz)).toBe(join(fora, 'novo.md'));
  });
});

describe('cliente: lista fechada do spike', () => {
  it('aceita só /cards/comments (lote) além do que já havia; subcaminhos e variações continuam recusados', () => {
    const ok = (c: string): boolean => CAMINHOS_PERMITIDOS.some((p) => p.test(c));
    expect(ok('/cards/comments')).toBe(true);
    expect(ok('/cards/12/comments')).toBe(true);
    for (const c of ['/cards/comments/', '/cards/comments/12', '/cards/comments/../users', '/cards/commentsx', '//cards/comments']) expect(ok(c), c).toBe(false);
  });
  it('o cliente real manda só GET em /cards/comments com card_ids (sem rede)', async () => {
    const pedidos: string[] = [];
    const fetchImpl = (async (url: string, init: { method: string }) => {
      pedidos.push(`${init.method} ${url}`);
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    }) as unknown as typeof fetch;
    const c = criarClienteHttp({ urlBase: 'https://exemplo.invalido/api/v2', apikey: 'chave-do-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 }, { fetchImpl, dormir: () => Promise.resolve() });
    await c.get('/cards/comments', { consulta: { card_ids: '1,2', page: 1 } });
    expect(pedidos).toEqual(['GET https://exemplo.invalido/api/v2/cards/comments?card_ids=1%2C2&page=1']);
    await expect(c.get('/cards/comments', { consulta: { fields: 'text' } })).rejects.toMatchObject({ tipo: 'consulta' });
  });
});

describe('escolherAmostra', () => {
  const card = (id: string, quadro: string): CardAmostra => ({ id, quadro, revisao: 2, ultimaModificacaoMs: null });
  it('rodízio entre quadros, no máximo 3 por quadro e o total pedido', () => {
    const m = new Map<string, CardAmostra[]>([
      ['1', [card('a', '1'), card('b', '1'), card('c', '1'), card('d', '1')]],
      ['2', [card('e', '2')]],
      ['3', [card('f', '3'), card('g', '3')]],
    ]);
    expect(escolherAmostra(m, 100).map((c) => c.id)).toEqual(['a', 'e', 'f', 'b', 'g', 'c']);
    expect(escolherAmostra(m, 4).map((c) => c.id)).toEqual(['a', 'e', 'f', 'b']);
  });
});

describe('autorDoComentario', () => {
  it('interno vira o número; externo e ausente não têm conta', () => {
    expect(autorDoComentario({ author: { type: 'internal', value: 7 } })).toEqual({ conta: 7, externo: false });
    expect(autorDoComentario({ sender: { type: 'internal', value: 8 } })).toEqual({ conta: 8, externo: false });
    expect(autorDoComentario({ sender: { type: 'external', value: 'x@y' } })).toEqual({ conta: null, externo: true });
    expect(autorDoComentario({ author: { type: 'internal', value: 0 } })).toEqual({ conta: null, externo: false });
    expect(autorDoComentario({})).toEqual({ conta: null, externo: false });
  });
});

describe('analisarRevisoes', () => {
  const card: CardAmostra = { id: '10', quadro: '1', revisao: 4, ultimaModificacaoMs: null };
  const rev = (n: number, quando: string, user: unknown, extra: Record<string, unknown> = {}) => ({ card_id: 10, revision: n, created_at: quando, user_id: user, column_id: 5, ...extra });
  it('conta pares iguais nos campos visíveis, campo que muda, sem user_id e cascata; revisão 1 é criação', () => {
    const a = novoAcumuloRevisoes();
    analisarRevisoes(card, { data: [
      rev(2, '2026-11-02T15:00:05Z', 7, { column_id: 6 }),
      rev(1, '2026-11-02T15:00:00Z', 7),
      rev(3, '2026-11-02T15:00:05Z', 0, { column_id: 6 }),
      rev(4, '2026-11-02T16:00:00Z', null, { column_id: 7 }),
    ] }, a);
    expect(a.revisoes).toBe(4);
    expect(a.semUsuario).toBe(2);
    expect(a.cardsRevisaoBate).toBe(1);
    expect(a.pares).toBe(3);
    expect(a.paresIguais).toBe(1); // 2 -> 3 só mudam os campos de controle
    expect(a.camposQueMudam.get('column_id')).toBe(2);
    expect(a.eventos.filter((e) => e.criacao)).toHaveLength(1);
    expect(a.eventos.filter((e) => e.cascata)).toHaveLength(2);
  });
});

describe('analisarComentarios', () => {
  it('conta por tipo, externos, sem autor e depois do last_modified; o texto nunca entra nos eventos nem na forma', () => {
    const cards = new Map<string, CardAmostra>([['10', { id: '10', quadro: '1', revisao: 1, ultimaModificacaoMs: T0 }]]);
    const a = novoAcumuloComentarios();
    analisarComentarios(cards, { data: { data: [
      { card_id: 10, comment_id: 1, type: 'plain', text: TEXTO, created_at: new Date(T0 + 1000).toISOString(), author: { type: 'internal', value: 7 } },
      { card_id: 10, comment_id: 2, type: 'received as email', text: TEXTO, created_at: new Date(T0 - 1000).toISOString(), sender: { type: 'external', value: 'a@b.c' } },
      { card_id: 10, comment_id: 3, type: 'plain', text: TEXTO, created_at: new Date(T0 - 2000).toISOString() },
    ], pagination: { all_pages: 1 } } }, a);
    expect(a.total).toBe(3);
    expect(a.externos).toBe(1);
    expect(a.semAutor).toBe(1);
    expect(a.depoisDaUltimaModificacao).toBe(1);
    expect(a.comparados).toBe(3);
    expect(a.porTipo.get('plain')).toBe(2);
    expect(JSON.stringify([a.eventos, [...a.forma.keys()]])).not.toContain(TEXTO);
    expect(JSON.stringify(a.eventos)).not.toContain('a@b.c');
  });
});

describe('levantarContas', () => {
  it('marca volume alto, madrugada e lote; conta humana normal não é marcada', () => {
    const eventos: Evento[] = [];
    for (let i = 0; i < 25; i += 1) eventos.push(ev(1, T0 + i * 60_000, String(i % 5))); // volume alto em 5 cards
    for (let i = 0; i < 6; i += 1) eventos.push(ev(2, Date.parse('2026-11-02T05:00:00Z') + i * 3_600_000 / 6, '1')); // 2h-3h em Brasília
    for (let i = 0; i < 3; i += 1) eventos.push(ev(3, T0 + 500, String(i))); // lote no mesmo segundo
    eventos.push(ev(4, T0, '1'), ev(4, T0 + 3_600_000, '2'), ev(4, T0, '1', { criacao: true }), ev(null, T0, '1'));
    const c = new Map(levantarContas(eventos).map((x) => [x.conta, x]));
    expect(c.get(1)!.suspeitas).toEqual(['volume alto']);
    expect(c.get(2)!.suspeitas).toEqual(['madrugada']);
    expect(c.get(3)!.suspeitas).toEqual(['lote no mesmo segundo']);
    expect(c.get(4)!.suspeitas).toEqual([]);
    expect(c.get(4)!.acoes).toBe(2);
    expect(c.get(4)!.criacoes).toBe(1);
    expect(c.has(0)).toBe(false);
    expect(c.get(1)!.porHora[12]).toBeGreaterThan(0);
  });
});

describe('executarSpikeO22 (cliente falso)', () => {
  const montar = () => {
    const chamadas: string[] = [];
    const cliente = {
      get: (caminho: string, o?: { consulta?: Record<string, string | number> }) => {
        chamadas.push(`${caminho}?${JSON.stringify(o?.consulta ?? {})}`);
        if (caminho === '/boards') return Promise.resolve({ data: [{ board_id: 1, name: TITULO }, { board_id: 2, name: TITULO }] });
        if (caminho === '/cards') {
          const q = Number(o!.consulta!.board_ids);
          return Promise.resolve({ data: { data: [{ card_id: q * 10, board_id: q, revision: 2, created_at: '2026-11-01T10:00:00Z', last_modified: '2026-11-02T10:00:00Z', title: TITULO }], pagination: { all_pages: 1 } } });
        }
        if (caminho.endsWith('/revisions')) {
          const id = Number(caminho.split('/')[2]);
          return Promise.resolve({ data: [
            { card_id: id, revision: 1, created_at: '2026-11-01T10:00:00Z', user_id: 7 },
            { card_id: id, revision: 2, created_at: '2026-11-02T08:00:00Z', user_id: 9, title: TITULO },
          ] });
        }
        if (caminho === '/cards/comments') {
          return Promise.resolve({ data: { data: [{ card_id: 10, comment_id: 1, type: 'plain', text: TEXTO, created_at: '2026-11-02T09:00:00Z', author: { type: 'internal', value: 7 } }], pagination: { all_pages: 1 } } });
        }
        if (caminho === '/users') return Promise.resolve({ data: [{ user_id: 7, realname: NOME }, { user_id: 9, realname: 'Outro|Nome' }] });
        return Promise.reject(new Error(`caminho inesperado ${caminho}`));
      },
    };
    return { cliente: cliente as never as Parameters<typeof executarSpikeO22>[0]['cliente'], chamadas };
  };

  it('recusa saída dentro do repositório sem chamar a API', async () => {
    const { cliente, chamadas } = montar();
    const raiz = pasta();
    const r = await executarSpikeO22({ cliente, quadros: [], caminhoSaida: join(raiz, 'r.md'), raizRepositorio: raiz });
    expect(r.erro).toMatch(/dentro do repositório/);
    expect(chamadas).toHaveLength(0);
  });

  it('só GET de caminhos esperados; a tela traz só contagens; o nome vai só ao arquivo (0600)', async () => {
    const { cliente, chamadas } = montar();
    const raiz = pasta();
    const fora = pasta();
    const arq = join(fora, 'o22.md');
    const r = await executarSpikeO22({ cliente, quadros: [], caminhoSaida: arq, raizRepositorio: raiz });
    expect(r.erro).toBeNull();
    expect(r.saida).toContain('amostra: 2 cards em 2 quadros');
    for (const marcador of [NOME, TEXTO, TITULO, 'Outro']) expect(r.saida).not.toContain(marcador);
    expect(r.saida).not.toMatch(/\b(7|9)\b.*conta/);
    expect(chamadas.map((c) => c.split('?')[0])).toEqual(['/boards', '/cards', '/cards', '/cards/10/revisions', '/cards/20/revisions', '/cards/comments', '/users']);
    expect(JSON.stringify(chamadas)).not.toContain('description');
    const conteudo = readFileSync(arq, 'utf8');
    expect(conteudo).toContain(NOME);
    expect(conteudo).toContain('Outro Nome');
    expect(conteudo).not.toContain(TEXTO);
    expect(conteudo).not.toContain(TITULO);
    expect(statSync(arq).mode & 0o777).toBe(0o600);
  });

  it('erro da API vira só o código, sem mensagem nem arquivo', async () => {
    const raiz = pasta();
    const fora = pasta();
    const cliente = { get: () => Promise.reject(Object.assign(new Error(`vazou ${TEXTO}`), { name: 'x' })) } as never as Parameters<typeof executarSpikeO22>[0]['cliente'];
    const r = await executarSpikeO22({ cliente, quadros: [], caminhoSaida: join(fora, 'o22.md'), raizRepositorio: raiz });
    expect(r).toEqual({ saida: '', erro: 'erro-interno' });
    expect(() => statSync(join(fora, 'o22.md'))).toThrow();
  });
});
