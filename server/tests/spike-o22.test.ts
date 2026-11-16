import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  analisarComentarios, analisarRevisoes, autorDoComentario, criadoNaJanela, executarSpikeO22, sortearAmostra, levantarContas, novoAcumuloComentarios, novoAcumuloRevisoes,
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

describe('sortearAmostra e janela', () => {
  it('sorteia até n sem repetir, sem alterar a entrada, e é determinístico com o sorteio injetado', () => {
    const entrada = ['a', 'b', 'c', 'd', 'e'];
    let k = 0;
    const alea = () => [0.1, 0.9, 0.5, 0.3][k++ % 4]!;
    const r = sortearAmostra(entrada, 3, alea);
    expect(r).toHaveLength(3);
    expect(new Set(r).size).toBe(3);
    expect(entrada).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(sortearAmostra(entrada, 10)).toHaveLength(5);
  });
  it('só entra quem foi criado nas últimas 12 semanas', () => {
    const agora = Date.parse('2026-11-16T12:00:00Z');
    const c = (criadoMs: number | null | undefined): CardAmostra => ({ id: '1', quadro: '1', revisao: 1, ultimaModificacaoMs: null, criadoMs });
    expect(criadoNaJanela(c(agora - 83 * 86_400_000), agora)).toBe(true);
    expect(criadoNaJanela(c(agora - 85 * 86_400_000), agora)).toBe(false);
    expect(criadoNaJanela(c(null), agora)).toBe(false);
    expect(criadoNaJanela(c(undefined), agora)).toBe(false);
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
  const CRIADO = Date.parse('2026-11-02T14:00:00Z');
  const card: CardAmostra = { id: '10', quadro: '1', revisao: 4, ultimaModificacaoMs: null, criadoMs: CRIADO };
  // Forma real da lista: só revision, user_id e replaced_at (sem created_at).
  const rev = (n: number, user: unknown, substituida: string | null) => ({ revision: n, user_id: user, replaced_at: substituida });
  it('forma real (sem created_at): conta autores e instantes pela revisão anterior, com denominadores; nada é descartado antes de contar', () => {
    const a = novoAcumuloRevisoes();
    analisarRevisoes(card, { data: [
      rev(2, 7, '2026-11-02T15:00:05Z'),
      rev(1, 7, '2026-11-02T15:00:00Z'),
      rev(3, 0, '2026-11-02T16:00:00Z'),
      rev(4, 9, null),
    ] }, a);
    expect(a.revisoes).toBe(4);
    expect(a.cardsLidos).toBe(1);
    expect(a.semUsuario).toBe(1); // user_id 0
    expect([...a.contasRevisao].sort()).toEqual([7, 9]);
    expect(a.semInstante).toBe(0);
    expect(a.instanteDaAnterior).toBe(4);
    expect(a.comCriadoProprio).toBe(0);
    expect(a.cardsRevisaoBate).toBe(1);
    expect(a.pares).toBe(3);
    expect(a.paresComparaveis).toBe(0); // a lista só tem chaves de controle: nada a comparar, e isso aparece na tela
    expect(a.paresIguais).toBe(0);
    expect(a.eventos).toHaveLength(4);
    expect(a.eventos.find((e) => e.criacao)!.ms).toBe(CRIADO);
    expect(a.eventos.map((e) => e.ms)).toEqual([CRIADO, Date.parse('2026-11-02T15:00:00Z'), Date.parse('2026-11-02T15:00:05Z'), Date.parse('2026-11-02T16:00:00Z')]);
  });
  it('revisão sem instante possível ainda conta o autor; created_at próprio é conferido com o derivado; campo comparável vira par comparável', () => {
    const a = novoAcumuloRevisoes();
    const semCriado: CardAmostra = { ...card, criadoMs: null };
    analisarRevisoes(semCriado, { data: [
      { revision: 1, user_id: 5, replaced_at: null },
      { revision: 2, user_id: 6, replaced_at: null, created_at: '2026-11-02T15:00:00Z', column_id: 1 },
      { revision: 3, user_id: 6, replaced_at: null, created_at: '2026-11-02T16:00:00Z', column_id: 1 },
    ] }, a);
    expect(a.revisoes).toBe(3);
    expect(a.semInstante).toBe(1); // a revisão 1, sem created_at do card nem próprio
    expect(a.contasRevisao.size).toBe(2); // 5 conta mesmo sem instante
    expect(a.comCriadoProprio).toBe(2);
    expect(a.criadoProprioBate).toBe(0); // anterior sem replaced_at: nada a conferir
    expect(a.paresComparaveis).toBe(2);
    expect(a.paresIguais).toBe(1); // 2 -> 3 iguais; 1 -> 2 muda column_id
    expect(a.camposQueMudam.get('column_id')).toBe(1);
  });
  it('lista vazia conta como card sem revisão e não vira zero silencioso na tela', () => {
    const a = novoAcumuloRevisoes();
    analisarRevisoes(card, { data: [] }, a);
    analisarRevisoes(card, { data: [rev(1, 7, null)] }, a);
    expect(a.cardsSemRevisao).toBe(1);
    expect(a.cardsLidos).toBe(2);
    expect(a.cardsRevisaoBate).toBe(0);
    expect(a.cardsComparados).toBe(2);
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
    expect([...a.contas]).toEqual([7]);
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
          const antigo = { card_id: q * 10 + 1, board_id: q, revision: 2, created_at: '2026-01-01T10:00:00Z', last_modified: '2026-11-02T10:00:00Z' };
          return Promise.resolve({ data: { data: [{ card_id: q * 10, board_id: q, revision: 2, created_at: '2026-11-01T10:00:00Z', last_modified: '2026-11-02T10:00:00Z', title: TITULO }, antigo], pagination: { all_pages: 1 } } });
        }
        if (caminho.endsWith('/revisions')) {
          return Promise.resolve({ data: [
            { revision: 1, user_id: 7, replaced_at: '2026-11-02T08:00:00Z' },
            { revision: 2, user_id: 9, replaced_at: null },
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
    const r = await executarSpikeO22({ cliente, quadros: [], caminhoSaida: arq, raizRepositorio: raiz, agora: () => Date.parse('2026-11-16T12:00:00Z') });
    expect(r.erro).toBeNull();
    expect(r.saida).toContain('amostra: 2 cards sorteados de 2 criados nas últimas 12 semanas, em 2 quadros');
    expect(r.saida).toContain('revisões: 4 lidas em 2 cards; cards que voltaram sem nenhuma revisão: 0 de 2');
    expect(r.saida).toContain('sem user_id (ausente, nulo ou 0): 0 de 4 revisões');
    expect(r.saida).toContain('contas distintas pelas revisões: 2 (de 4 revisões com user_id); pelos comentários: 1 (de 1 comentários com autor interno); no total: 2');
    expect(r.saida).toContain('forma da resposta das revisões (só nomes de campo):');
    expect(r.saida).toContain('`$[].replaced_at`');
    expect(r.saida).toContain('`$[].user_id`');
    for (const marcador of [NOME, TEXTO, TITULO, 'Outro']) expect(r.saida).not.toContain(marcador);
    expect(r.saida).not.toMatch(/\b(7|9)\b.*conta/);
    expect(chamadas.map((c) => c.split('?')[0]).sort()).toEqual(['/boards', '/cards', '/cards', '/cards/10/revisions', '/cards/20/revisions', '/cards/comments', '/users'].sort());
    expect(chamadas.filter((c) => c.startsWith('/cards/comments')).every((c) => Object.keys(JSON.parse(c.split('?')[1]!)).sort().join() === 'card_ids,page')).toBe(true);
    expect(chamadas.filter((c) => c.startsWith('/cards?')).every((c) => c.includes('"last_modified_from":"2026-08-24"'))).toBe(true);
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
