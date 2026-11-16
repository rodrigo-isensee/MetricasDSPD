import { describe, expect, it } from 'vitest';
import { ehDoCardOuDoLote, lerComentariosDoLote, lerRevisoesDoCard, lerToqueDoCard, MAX_CARDS_POR_LOTE } from '../src/modulos/businessmap/toque-leitura.js';
import { criarClienteHttp, type ClienteHttp, type ErroBusinessMap } from '../src/plataforma/http.js';

// Pedido 105, B7a (O22, ADR 0020 R6-2, R6-4, R6-7): leitura de revisões e comentários. Fetch falso, dados fictícios, nenhuma rede.
const MARCADOR = 'MARCADOR-LEITURA-105';
const EMAIL = `${MARCADOR}@exemplo.invalido`;
const BASE = 'https://bm.exemplo.invalido/api/v2';
const iso = (minuto: number): string => `2026-11-02T10:${String(minuto).padStart(2, '0')}:00Z`;

type Resposta = { status?: number; corpo?: unknown; texto?: string };
const montar = (responder: (caminho: string, consulta: URLSearchParams, n: number) => Resposta, extra: { tetoBytes?: number } = {}) => {
  const pedidos: string[] = [];
  const cliente: ClienteHttp = criarClienteHttp(
    { urlBase: BASE, apikey: 'chave-de-teste', limitePorMinuto: 100000, limitePorHora: 100000, timeoutMs: 1000, ...extra },
    {
      dormir: async () => undefined,
      fetchImpl: async (url) => {
        const u = new URL(String(url));
        pedidos.push(u.pathname.replace('/api/v2', '') + u.search);
        const r = responder(u.pathname.replace('/api/v2', ''), u.searchParams, pedidos.length);
        return new Response(r.texto ?? JSON.stringify(r.corpo ?? { data: [] }), { status: r.status ?? 200 });
      },
    },
  );
  return { cliente, pedidos };
};
const falha = async (p: Promise<unknown>): Promise<ErroBusinessMap> => {
  try { await p; } catch (e) { return e as ErroBusinessMap; }
  throw new Error('esperava erro');
};
const comentarioBruto = (cardId: number, id: number, extra: Record<string, unknown> = {}) => ({
  card_id: cardId, comment_id: id, created_at: iso(id % 50), last_modified: iso(1), type: 'regular', text: MARCADOR, attachments: [{ name: MARCADOR }],
  author: { type: 'internal', value: 5 }, ...extra,
});

describe('lerRevisoesDoCard', () => {
  it('lê a página 1 e as seguintes pela paginação do envelope, só com page na consulta', async () => {
    const { cliente, pedidos } = montar((_c, q) => ({
      corpo: { data: { data: [{ revision: Number(q.get('page')) }], pagination: { all_pages: 3 } } },
    }));
    expect(await lerRevisoesDoCard(cliente, '77')).toEqual([{ revision: 1 }, { revision: 2 }, { revision: 3 }]);
    expect(pedidos).toEqual(['/cards/77/revisions?page=1', '/cards/77/revisions?page=2', '/cards/77/revisions?page=3']);
  });

  it('envelope em lista simples é uma página só; paginação sem número é uma página só', async () => {
    const a = montar(() => ({ corpo: { data: [{ revision: 1 }] } }));
    expect(await lerRevisoesDoCard(a.cliente, '5')).toEqual([{ revision: 1 }]);
    const b = montar(() => ({ corpo: { data: { data: [{ revision: 1 }], pagination: {} } } }));
    expect(await lerRevisoesDoCard(b.cliente, '5')).toEqual([{ revision: 1 }]);
    const c = montar(() => ({ corpo: { data: { data: [{ revision: 1 }] } } }));
    expect(await lerRevisoesDoCard(c.cliente, '5')).toEqual([{ revision: 1 }]);
    expect(a.pedidos).toHaveLength(1);
    expect(b.pedidos).toHaveLength(1);
    expect(c.pedidos).toHaveLength(1);
  });

  it('id de card fora da forma é recusado sem tocar a rede', async () => {
    const { cliente, pedidos } = montar(() => ({}));
    for (const id of ['', '0', 'a', '1/2', '1?x=1', '-1', '1234567890123']) expect((await falha(lerRevisoesDoCard(cliente, id))).tipo, id).toBe('caminho');
    expect(pedidos).toEqual([]);
  });

  it('envelope fora do formato é erro de formato sem eco do corpo (A3)', async () => {
    for (const corpo of [{ data: 'x' }, { data: { data: 'x' } }, [1], { outro: MARCADOR }]) {
      const { cliente } = montar(() => ({ corpo }));
      const e = await falha(lerRevisoesDoCard(cliente, '5'));
      expect(e.tipo).toBe('formato');
      expect(e.message).not.toContain(MARCADOR);
    }
  });

  it('mais de 50 páginas: limite-paginas-leitura (do card, não o teto da execução; A3 do review do B7a)', async () => {
    const { cliente, pedidos } = montar(() => ({ corpo: { data: { data: [], pagination: { all_pages: 51 } } } }));
    const e = await falha(lerRevisoesDoCard(cliente, '5'));
    expect(e.tipo).toBe('limite-paginas-leitura');
    expect(ehDoCardOuDoLote(e)).toBe(true);
    expect(pedidos).toHaveLength(50);
  });
});

describe('lerComentariosDoLote (R6-2, R-T2, R-T8)', () => {
  it('lote vazio, com mais de 200 ids, repetido ou com id fora da forma: erro de consulta antes da rede', async () => {
    const { cliente, pedidos } = montar(() => ({}));
    const duzentosEUm = Array.from({ length: MAX_CARDS_POR_LOTE + 1 }, (_, i) => String(i + 1));
    for (const lote of [[], duzentosEUm, ['1', '1'], ['1', 'a'], ['1', ''], ['0']]) expect((await falha(lerComentariosDoLote(cliente, lote))).tipo).toBe('consulta');
    expect(pedidos).toEqual([]);
  });

  it('agrupa por card, lê todas as páginas, corta por CAMPOS_TOQUE e card sem comentário volta com lista vazia', async () => {
    const { cliente, pedidos } = montar((_c, q) => ({
      corpo: { data: { data: Number(q.get('page')) === 1 ? [comentarioBruto(1, 10), comentarioBruto(2, 11)] : [comentarioBruto(1, 12)], pagination: { all_pages: 2 } } },
    }));
    const r = await lerComentariosDoLote(cliente, ['1', '2', '3']);
    expect(pedidos).toEqual(['/cards/comments?card_ids=1%2C2%2C3&page=1', '/cards/comments?card_ids=1%2C2%2C3&page=2']);
    expect(r.ocorrencias).toEqual([]);
    expect([...r.porCard.keys()].sort()).toEqual(['1', '2', '3']);
    const do1 = r.porCard.get('1')!;
    expect(do1.ok && do1.comentarios.map((c) => c.comment_id)).toEqual([10, 12]);
    expect(r.porCard.get('3')).toEqual({ ok: true, comentarios: [] });
    // texto, anexos e o resto ficam na fronteira: do comentário só passam os cinco campos
    expect(Object.keys((do1 as { comentarios: object[] }).comentarios[0]!).sort()).toEqual(['author_type', 'author_value', 'card_id', 'comment_id', 'created_at']);
    expect(JSON.stringify([...r.porCard])).not.toContain(MARCADOR);
  });

  it('caso 5: comentário de card fora do lote (número ou texto) ou item que não é objeto é descartado e contado por código, sem valor', async () => {
    const { cliente } = montar(() => ({
      corpo: { data: [comentarioBruto(1, 10), comentarioBruto(999, 11, { author: { type: 'external', value: EMAIL } }), comentarioBruto(1, 12, { card_id: '1' }),
        comentarioBruto(1, 13, { card_id: undefined }), null, 'texto', comentarioBruto(1, 14, { card_id: '888' })] },
    }));
    const r = await lerComentariosDoLote(cliente, ['1']);
    const do1 = r.porCard.get('1')!;
    expect(do1.ok && do1.comentarios.map((c) => c.comment_id)).toEqual([10, 12]);
    expect(r.ocorrencias).toEqual([
      { codigo: 'toque_forma', caminho: 'comments[].card_id', quantidade: 3 },
      { codigo: 'toque_forma', caminho: 'comments[]', quantidade: 2 },
    ]);
    expect(JSON.stringify(r.ocorrencias)).not.toContain(MARCADOR);
  });

  it('falha HTTP do lote marca todos os cards com o código; nenhum card fica "sem comentário"; o corpo da resposta não vai ao código', async () => {
    const { cliente } = montar(() => ({ status: 404, texto: JSON.stringify({ message: EMAIL }) }));
    const r = await lerComentariosDoLote(cliente, ['1', '2']);
    expect(r.porCard.get('1')).toEqual({ ok: false, codigo: 'toque_comentarios_http_404' });
    expect(r.porCard.get('2')).toEqual({ ok: false, codigo: 'toque_comentarios_http_404' });
    expect(JSON.stringify([...r.porCard])).not.toContain(MARCADOR);
  });

  it('falha de formato e de indisponibilidade viram código por tipo, também sem valor', async () => {
    const formato = montar(() => ({ corpo: { data: EMAIL } }));
    expect((await lerComentariosDoLote(formato.cliente, ['1'])).porCard.get('1')).toEqual({ ok: false, codigo: 'toque_comentarios_formato' });
    const fora = montar(() => ({ status: 503 }));
    expect((await lerComentariosDoLote(fora.cliente, ['1'])).porCard.get('1')).toEqual({ ok: false, codigo: 'toque_comentarios_indisponivel' });
  });

  it('erro fatal (401) sobe, não vira falha do lote; o erro que não é do cliente também sobe', async () => {
    const a = montar(() => ({ status: 401 }));
    const e = await falha(lerComentariosDoLote(a.cliente, ['1']));
    expect(e.tipo).toBe('autenticacao');
    expect(ehDoCardOuDoLote(e)).toBe(false);
    expect(ehDoCardOuDoLote(new Error('x'))).toBe(false);
  });

  it('A3 do review do B7a: lote acima de 50 páginas se divide como no teto de bytes; um card só fica com o código, sem parar a execução', async () => {
    const { cliente, pedidos } = montar((_c, q) => {
      const ids = q.get('card_ids')!.split(',');
      return { corpo: { data: { data: ids.map((id) => comentarioBruto(Number(id), Number(id) + 100)), pagination: { all_pages: ids.includes('5') ? 99 : 1 } } } };
    });
    const r = await lerComentariosDoLote(cliente, ['1', '2', '3', '4', '5']);
    for (const id of ['1', '2', '3', '4']) expect(r.porCard.get(id), id).toMatchObject({ ok: true });
    expect(r.porCard.get('5')).toEqual({ ok: false, codigo: 'toque_comentarios_limite-paginas-leitura' });
    expect(pedidos.length).toBeGreaterThan(50);
  });

  it('caso 15: resposta acima do teto de bytes divide o lote ao meio até passar; o card que sozinho passa do teto fica com o código', async () => {
    // lote com mais de 2 cards estoura o teto; card 5 sozinho também estoura
    const { cliente, pedidos } = montar((_c, q) => {
      const ids = q.get('card_ids')!.split(',');
      const grande = ids.length > 2 || ids.includes('5');
      return { texto: JSON.stringify({ data: ids.map((id) => comentarioBruto(Number(id), Number(id) + 100, grande ? { text: 'x'.repeat(5000) } : {})) }) };
    }, { tetoBytes: 1000 });
    const r = await lerComentariosDoLote(cliente, ['1', '2', '3', '4', '5']);
    expect(r.porCard.get('1')).toMatchObject({ ok: true });
    expect(r.porCard.get('2')).toMatchObject({ ok: true });
    expect(r.porCard.get('3')).toMatchObject({ ok: true });
    expect(r.porCard.get('4')).toMatchObject({ ok: true });
    expect(r.porCard.get('5')).toEqual({ ok: false, codigo: 'toque_comentarios_limite-bytes' });
    expect(pedidos.length).toBeGreaterThan(3);
  });
});

describe('lerToqueDoCard (R6-4)', () => {
  const revisoes = (n: number) => Array.from({ length: n }, (_, i) => ({ revision: i + 1, replaced_at: iso(i + 1), user_id: 10 + i }));
  const base = { cardId: '9', criadoEm: Date.parse(iso(0)), comentarios: [] };

  it('revision 1 não gasta chamada de revisões: lista vazia por construção', async () => {
    const { cliente, pedidos } = montar(() => ({}));
    const r = await lerToqueDoCard({ ...base, cliente, revisao: 1, relerRevisao: async () => { throw new Error('não devia reler'); } });
    expect(r).toMatchObject({ estado: 'lido', eventos: [] });
    expect(pedidos).toEqual([]);
  });

  it('lista que bate: normaliza sem reler a revisão', async () => {
    const { cliente, pedidos } = montar(() => ({ corpo: { data: revisoes(3) } }));
    const r = await lerToqueDoCard({ ...base, cliente, revisao: 4, relerRevisao: async () => { throw new Error('não devia reler'); } });
    expect(r.estado).toBe('lido');
    expect(r.eventos.map((e) => e.eventoId)).toEqual(['r2', 'r3']);
    expect(pedidos).toEqual(['/cards/9/revisions?page=1']);
  });

  it('lista que não bate (curta ou longa): relê a revisão uma vez e confere de novo com a nova', async () => {
    let leituras = 0;
    const { cliente } = montar(() => ({ corpo: { data: revisoes(2) } }));
    const r = await lerToqueDoCard({ ...base, cliente, revisao: 5, relerRevisao: async () => { leituras += 1; return 3; } });
    expect(leituras).toBe(1);
    expect(r).toMatchObject({ estado: 'lido', revisaoLida: 3 });
    const longa = await lerToqueDoCard({ ...base, cliente, revisao: 2, relerRevisao: async () => 3 });
    expect(longa).toMatchObject({ estado: 'lido', revisaoLida: 3 });
  });

  it('lista que continua não batendo: leitura incompleta com o motivo; a releitura sem revisão ou com o mesmo valor não muda nada', async () => {
    const { cliente } = montar(() => ({ corpo: { data: revisoes(2) } }));
    for (const nova of [null, 5, 9]) {
      const r = await lerToqueDoCard({ ...base, cliente, revisao: 5, relerRevisao: async () => nova });
      expect(r).toMatchObject({ estado: 'leitura_incompleta', motivo: 'lista_curta', eventos: [] });
    }
  });

  it('buraco e instante inválido não relêem a revisão', async () => {
    const buraco = montar(() => ({ corpo: { data: [{ revision: 1, replaced_at: iso(1) }, { revision: 3, replaced_at: iso(2) }] } }));
    const r = await lerToqueDoCard({ ...base, cliente: buraco.cliente, revisao: 4, relerRevisao: async () => { throw new Error('não devia reler'); } });
    expect(r.motivo).toBe('lista_com_buraco');
  });

  it('caso 11: falha HTTP no meio do card propaga (nenhum resultado, nada para gravar)', async () => {
    const { cliente } = montar(() => ({ status: 500 }));
    expect((await falha(lerToqueDoCard({ ...base, cliente, revisao: 4, relerRevisao: async () => null }))).tipo).toBe('indisponivel');
  });
});
