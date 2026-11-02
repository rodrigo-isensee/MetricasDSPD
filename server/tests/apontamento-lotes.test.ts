import { afterEach, describe, expect, it } from 'vitest';
import { calcularRaizes, PROFUNDIDADE_MAXIMA, type NoCard } from '../src/modulos/businessmap/apontamento/hierarquia.js';
import { itensDoWorklog, lerLote, LOTE_CARDS, type Folha } from '../src/modulos/businessmap/apontamento/lotes.js';
import { criarClienteHttp, ErroBusinessMap, TETO_WORKLOG } from '../src/plataforma/http.js';
import { cenarioWorklogVazio, registroWorklog, subirServidorWorklog, type Registro, type ServidorWorklog } from './apontamento-duble.js';

// Pedido 059, A3 (CT-71, CT-72, CT-77, CT-35): divisão de lote no teto de 1000, lote completo e hierarquia até a iniciativa. Contra o servidor
// falso (127.0.0.1) e contra um cliente falso para os erros de leitura.

const servidores: ServidorWorklog[] = [];
afterEach(async () => { for (const s of servidores.splice(0)) await s.fechar(); });
const subir = async (registros: Registro[] = [], extra: Partial<ReturnType<typeof cenarioWorklogVazio>> = {}): Promise<ServidorWorklog> => {
  const s = await subirServidorWorklog({ ...cenarioWorklogVazio(), registros, ...extra });
  servidores.push(s);
  return s;
};
const cliente = (s: ServidorWorklog) => criarClienteHttp({ urlBase: s.url, apikey: 'chave-do-teste-0123456789', limitePorMinuto: 10_000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });

describe('itensDoWorklog: forma do corpo', () => {
  it('lista direta, { data: [] } e { data: { data: [] } }', () => {
    expect(itensDoWorklog([1])).toEqual([1]);
    expect(itensDoWorklog({ data: [1, 2] })).toEqual([1, 2]);
    expect(itensDoWorklog({ data: { data: [3] } })).toEqual([3]);
  });
  it('qualquer outra forma é erro (nunca "lote vazio")', () => {
    for (const corpo of [{}, null, 'x', { data: 'x' }, { data: {} }, { data: null }]) expect(() => itensDoWorklog(corpo), JSON.stringify(corpo)).toThrow(ErroBusinessMap);
  });
});

/** Cliente falso: devolve `n` registros por pedido conforme `resposta(cards)`, ou lança. */
const falso = (resposta: (cards: string[]) => number | Error) => {
  const pedidos: string[][] = [];
  return {
    pedidos,
    get: (_c: string, o?: { consulta?: Readonly<Record<string, string | number>> }) => {
      const cards = String(o?.consulta?.card_ids).split(',');
      pedidos.push(cards);
      const r = resposta(cards);
      return r instanceof Error ? Promise.reject(r) : Promise.resolve({ data: Array.from({ length: r }, (_, i) => ({ i })) });
    },
  } as never as Parameters<typeof lerLote>[0] & { pedidos: string[][] };
};
const ler = async (c: Parameters<typeof lerLote>[0], cards: string[]): Promise<Folha[]> => {
  const folhas: Folha[] = [];
  await lerLote(c, cards, { from_date: '2026-10-01' }, (f) => { folhas.push(f); return Promise.resolve(); });
  return folhas;
};
const cardsDe = (n: number): string[] => Array.from({ length: n }, (_, i) => String(9_100_000_000 + i));

describe('lerLote: divisão no teto de 1000 (CT-71, ADR 0025 item 4)', () => {
  it('999 registros: aceito sem divisão, lote completo; pedido com per_page 1000, subtarefas, fields fixo e o filtro', async () => {
    const c = falso(() => 999);
    const fs = await ler(c, cardsDe(5));
    expect(fs).toHaveLength(1);
    expect(fs[0]).toMatchObject({ completo: true, falha: null });
    expect(fs[0]!.itens).toHaveLength(999);
    expect(c.pedidos).toHaveLength(1);
  });
  it('1000 e 1001: dividido ao meio e repedido; os filhos cobrem exatamente os cards do pai, sem perda nem repetição', async () => {
    for (const teto of [1000, 1001]) {
      const cards = cardsDe(5);
      const c = falso((ids) => (ids.length === 5 ? teto : 10));
      const fs = await ler(c, cards);
      expect(c.pedidos.map((p) => p.length)).toEqual([5, 3, 2]);
      expect(fs.map((f) => f.cards.length)).toEqual([3, 2]);
      expect(fs.flatMap((f) => [...f.cards])).toEqual(cards);
      expect(fs.every((f) => f.completo && f.falha === null)).toBe(true);
    }
  });
  it('divisão recursiva até ficar abaixo do teto; cards em número ímpar', async () => {
    const c = falso((ids) => (ids.length > 1 ? 1000 : 3));
    const fs = await ler(c, cardsDe(7));
    expect(fs.map((f) => f.cards.length)).toEqual([1, 1, 1, 1, 1, 1, 1]);
    expect(fs.every((f) => f.completo)).toBe(true);
    expect(fs.flatMap((f) => [...f.cards])).toEqual(cardsDe(7));
  });
  it('lote de UM card ainda no teto: falha lote_no_teto, incompleto, e os registros recebidos são entregues', async () => {
    const fs = await ler(falso(() => 1000), cardsDe(1));
    expect(fs).toHaveLength(1);
    expect(fs[0]).toMatchObject({ completo: false, falha: 'lote_no_teto' });
    expect(fs[0]!.itens).toHaveLength(1000);
  });
  it('resposta grande demais (limite-bytes): divide e repede; um card só: incompleto, sem registros', async () => {
    const grande = new ErroBusinessMap('limite-bytes', 'x');
    const dividido = await ler(falso((ids) => (ids.length > 2 ? grande : 2)), cardsDe(4));
    expect(dividido.map((f) => f.cards.length)).toEqual([2, 2]);
    expect(dividido.every((f) => f.completo)).toBe(true);
    const um = await ler(falso(() => grande), cardsDe(1));
    expect(um[0]).toMatchObject({ completo: false, falha: 'limite-bytes', itens: [] });
  });
  it.each(['indisponivel', 'tempo-esgotado', 'http', 'formato'] as const)('erro de leitura %s: lote incompleto, sem dividir, e o resto da execução segue', async (tipo) => {
    const c = falso(() => new ErroBusinessMap(tipo, 'x'));
    const fs = await ler(c, cardsDe(4));
    expect(fs).toHaveLength(1);
    expect(fs[0]).toMatchObject({ completo: false, falha: tipo, itens: [] });
    expect(c.pedidos).toHaveLength(1);
  });
  it.each(['autenticacao', 'limite-requisicoes', 'limite-paginas', 'configuracao'] as const)('erro %s interrompe a execução (sobe)', async (tipo) => {
    await expect(ler(falso(() => new ErroBusinessMap(tipo, 'x')), cardsDe(2))).rejects.toMatchObject({ tipo });
  });
  it('erro que não é do cliente (programação) sobe', async () => {
    await expect(ler(falso(() => new Error('bug')), cardsDe(2))).rejects.toThrow('bug');
  });
  it('contra o servidor falso: teto real de 1000 divide e recupera tudo; 401 do servidor sobe', async () => {
    const cards = cardsDe(4);
    const registros = cards.flatMap((card, i) => Array.from({ length: i === 0 ? 1200 : 5 }, () => registroWorklog({ card_id: Number(card) })));
    const s = await subir(registros);
    const fs = await ler(cliente(s), cards);
    expect(fs.flatMap((f) => f.itens)).toHaveLength(TETO_WORKLOG + 15);
    expect(fs.find((f) => f.cards.length === 1 && f.cards[0] === cards[0])).toMatchObject({ completo: false, falha: 'lote_no_teto' });
    expect(fs.filter((f) => f.completo).flatMap((f) => [...f.cards])).toEqual(cards.slice(1));
    expect(LOTE_CARDS).toBe(200);
    const s401 = await subir([], { status: { '/loggedTime': 401 } });
    await expect(ler(cliente(s401), cards)).rejects.toMatchObject({ tipo: 'autenticacao' });
  });
  it('contra o servidor falso: corpo truncado (JSON inválido) deixa o lote incompleto, e uma falha 5xx do card sozinho também', async () => {
    const s = await subir([registroWorklog()], { truncarNaChamada: 1 });
    const fs = await ler(cliente(s), ['9100000000']);
    expect(fs[0]).toMatchObject({ completo: false, falha: 'formato' });
    const s5 = await subir([registroWorklog()], { falharCards: ['9100000000'] });
    const f5 = await ler(cliente(s5), ['9100000000']);
    expect(f5[0]).toMatchObject({ completo: false, falha: 'indisponivel' });
  });
  it('o histórico e as categorias nunca são chamados pela leitura (contador zero; o falso responderia 403 ao primeiro)', async () => {
    const s = await subir([registroWorklog()]);
    await ler(cliente(s), ['9100000000']);
    expect(s.pedidos.filter((p) => p.caminho !== '/loggedTime')).toEqual([]);
  });
});

describe('calcularRaizes: hierarquia até a iniciativa (CT-35)', () => {
  const no = (id: string, pai: string | null, iniciativa = false): NoCard => ({ id, pai, iniciativa });
  const de = (nos: NoCard[], id: string) => calcularRaizes(nos).find((r) => r.card_id === id)!;
  it('card sem pai é a própria raiz (profundidade 0, fora do escopo falso, sem iniciativa)', () => {
    expect(de([no('1', null)], '1')).toEqual({ card_id: '1', raiz_card_id: '1', profundidade: 0, raiz_eh_iniciativa: false, raiz_fora_do_escopo: false });
  });
  it('cadeia simples: sobe até a primeira iniciativa a partir do próprio card', () => {
    const nos = [no('1', '2'), no('2', '3', true), no('3', '4', true), no('4', null)];
    expect(de(nos, '1')).toMatchObject({ raiz_card_id: '2', profundidade: 1, raiz_eh_iniciativa: true, raiz_fora_do_escopo: false });
    expect(de(nos, '2')).toMatchObject({ raiz_card_id: '2', profundidade: 0, raiz_eh_iniciativa: true });
    expect(de(nos, '4')).toMatchObject({ raiz_card_id: '4', profundidade: 0, raiz_eh_iniciativa: false });
  });
  it('sem iniciativa na cadeia: o card mais alto alcançado', () => {
    expect(de([no('1', '2'), no('2', '3'), no('3', null)], '1')).toEqual({ card_id: '1', raiz_card_id: '3', profundidade: 2, raiz_eh_iniciativa: false, raiz_fora_do_escopo: false });
  });
  it('pai fora dos quadros coletados: para no último card conhecido e marca raiz_fora_do_escopo', () => {
    expect(de([no('1', '2'), no('2', '99')], '1')).toEqual({ card_id: '1', raiz_card_id: '2', profundidade: 1, raiz_eh_iniciativa: false, raiz_fora_do_escopo: true });
  });
  it('ciclo A→B→A e pai de si mesmo: guarda, sem laço infinito, e a regra do CHECK vale', () => {
    const nos = [no('1', '2'), no('2', '1'), no('3', '3')];
    expect(de(nos, '1')).toMatchObject({ raiz_card_id: '2', profundidade: 1, raiz_fora_do_escopo: false });
    expect(de(nos, '2')).toMatchObject({ raiz_card_id: '1', profundidade: 1 });
    expect(de(nos, '3')).toMatchObject({ raiz_card_id: '3', profundidade: 0 });
    for (const r of calcularRaizes(nos)) expect(r.profundidade === 0).toBe(r.raiz_card_id === r.card_id);
  });
  it('profundidade máxima 10: cadeia com 10 ancestrais chega ao topo; com 11, para no 10º', () => {
    const cadeia = (n: number): NoCard[] => Array.from({ length: n + 1 }, (_, i) => no(String(i + 1), i === n ? null : String(i + 2)));
    expect(PROFUNDIDADE_MAXIMA).toBe(10);
    expect(de(cadeia(10), '1')).toMatchObject({ raiz_card_id: '11', profundidade: 10 });
    expect(de(cadeia(11), '1')).toMatchObject({ raiz_card_id: '11', profundidade: 10 });
    expect(de(cadeia(11), '12')).toMatchObject({ raiz_card_id: '12', profundidade: 0 });
  });
});
