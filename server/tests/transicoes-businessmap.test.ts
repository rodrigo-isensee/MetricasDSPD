import { afterEach, describe, expect, it } from 'vitest';
import { CAMPOS_TRANSICAO, registroTransicao, revisionIdDaTransicao, serializar } from '../src/modulos/businessmap/allow-list.js';
import { EXPAND_COLETA, coletarCards, type DepsColeta, type ModoColeta } from '../src/modulos/businessmap/coleta.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { bancoFalso, subirServidorBm, type Cartao, type ServidorBm } from './businessmap-coleta-duble.js';

// E2.46: histórico de colunas por `expand=transitions` na listagem, gravado em stg_revision pela allow-list (servidor falso; nada real).
const AGORA = new Date('2026-11-02T12:00:00Z');
const S = montarEsquemas('');
const MARCA = 'PESSOA-MARCADOR-TRANSICAO';
const abertos: ServidorBm[] = [];
afterEach(async () => { for (const s of abertos.splice(0)) await s.fechar(); });

/** Transição como a API devolve (forma lida em 2026-10-31), com campos que a allow-list deve descartar. */
const transicao = (coluna: number, start: string, end: string | null, extra: Cartao = {}): Cartao => ({
  board_id: 35, workflow_id: 10, lane_id: 3, column_id: coluna, section: 3, start, end, ...extra,
});
const card = (id: number, transitions: unknown): Cartao => ({ card_id: id, title: `Card ${id}`, last_modified: '2026-10-30T10:00:00Z', transitions });

async function montar(cartoes: Cartao[], banco = bancoFalso(), extra: Partial<DepsColeta> = {}) {
  const servidor = await subirServidorBm({ cards: { '35|active': cartoes }, porPagina: 100, users: {}, status: {}, corpos: {} });
  abertos.push(servidor);
  const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-e246-de-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });
  return { servidor, banco, deps: { cliente, pool: banco.pool, S, quadros: [35], hostBase: 'bm.exemplo.test', agora: () => AGORA, ...extra } satisfies DepsColeta };
}
const carga: ModoColeta = { tipo: 'carga_inicial' };

describe('E2.46: histórico de colunas pela listagem (expand=transitions)', () => {
  it('pede expand=transitions (sem block_times) e grava cada transição em stg_revision pela allow-list, sem chamada por card', async () => {
    const m = await montar([card(1, [transicao(7, '2026-10-01 10:00:00', '2026-10-02 09:00:00', { user_id: 5, author: MARCA, comment: MARCA }), transicao(8, '2026-10-02 09:00:00', null)])]);
    const r = await coletarCards(m.deps, carga);
    expect(EXPAND_COLETA).toBe('custom_fields,linked_cards,transitions,co_owner_ids');
    expect(EXPAND_COLETA).not.toContain('block_times');
    const pedidos = m.servidor.pedidos;
    expect(pedidos.every((p) => p.metodo === 'GET')).toBe(true);
    expect(pedidos.some((p) => /revisions|block_times/.test(p.caminho + p.consulta.toString()))).toBe(false);
    expect([...new Set(pedidos.map((p) => p.caminho))]).toEqual(['/cards']);
    expect(m.banco.estado.revisoes).toHaveLength(2);
    const p0 = JSON.parse(m.banco.estado.revisoes[0]!.payload) as Record<string, unknown>;
    expect(p0).toEqual({ board_id: 35, card_id: '1', column_id: 7, end: '2026-10-02 09:00:00', lane_id: 3, section: 3, start: '2026-10-01 10:00:00', workflow_id: 10 });
    expect(JSON.parse(m.banco.estado.revisoes[1]!.payload)).toMatchObject({ column_id: 8, end: null });
    for (const rev of m.banco.estado.revisoes) { expect(rev.payload).not.toContain(MARCA); expect(rev.payload).not.toMatch(/user_id|author|comment/); expect(rev.coleta).toBe(77); }
    expect(r.streams[0]!.transicoes).toEqual({ lidas: 2, inseridas: 2, jaExistentes: 0, invalidas: 0 });
    expect(m.banco.estado.contagens.find((c) => c.entidade === 'transicao_35_active')).toMatchObject({ lidos: 2, inseridos: 2, jaExistentes: 0, falhas: 0 });
  });

  it('recoleta igual não duplica; transição aberta que fecha depois entra como fato novo (append-only)', async () => {
    const m = await montar([card(1, [transicao(7, '2026-10-01 10:00:00', null)])]);
    await coletarCards(m.deps, carga);
    const r2 = await coletarCards(m.deps, carga);
    expect(m.banco.estado.revisoes).toHaveLength(1);
    expect(r2.streams[0]!.transicoes).toEqual({ lidas: 1, inseridas: 0, jaExistentes: 1, invalidas: 0 });
    m.servidor.cenario.cards['35|active'] = [card(1, [transicao(7, '2026-10-01 10:00:00', '2026-10-03 08:00:00')])];
    const r3 = await coletarCards(m.deps, carga);
    expect(r3.streams[0]!.transicoes.inseridas).toBe(1);
    expect(m.banco.estado.revisoes.map((x) => JSON.parse(x.payload).end)).toEqual([null, '2026-10-03 08:00:00']);
  });

  it('o revision_id é igual para a mesma transição, difere por card (chave composta), coluna e entrada, cabe em 32 caracteres visíveis', () => {
    const a = revisionIdDaTransicao(transicao(7, '2026-10-01 10:00:00', null));
    expect(a).toBe(revisionIdDaTransicao({ ...transicao(7, '2026-10-01 10:00:00', null), lane_id: 99 }));
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(a).not.toBe(revisionIdDaTransicao(transicao(8, '2026-10-01 10:00:00', null)));
    expect(a).not.toBe(revisionIdDaTransicao(transicao(7, '2026-10-01 10:00:01', null)));
    expect(revisionIdDaTransicao(transicao(7, '2026-10-01 10:00:00', ''))).toBe(a);
    for (const ruim of [null, 'x', { start: 'a' }, { column_id: 7 }, { column_id: 7, start: '' }, { column_id: {}, start: 'a' }]) expect(revisionIdDaTransicao(ruim)).toBeNull();
  });

  it('transição sem coluna ou sem entrada vira falha com código (sem valor) e não derruba o card; card sem transitions segue normal', async () => {
    const m = await montar([card(1, [transicao(7, '2026-10-01 10:00:00', null), { column_id: 9 }, 'texto', null]), card(2, undefined)]);
    const r = await coletarCards(m.deps, carga);
    expect(m.banco.estado.revisoes).toHaveLength(1);
    expect(r.streams[0]!.transicoes).toMatchObject({ lidas: 2, inseridas: 1, invalidas: 1 });
    expect(m.banco.estado.falhas).toEqual([{ entidade: 'card_35_active', idOrigem: '1', erro: 'transicao-invalida' }]);
    // A3 do review da F3: a transição inválida fica no controle e na contagem, mas não torna a coleta parcial
    expect(r.estado).toBe('sucesso');
    expect(r.falhas).toEqual({});
    expect(m.banco.estado.contagens.find((c) => c.entidade === 'transicao_35_active')).toMatchObject({ lidos: 2, inseridos: 1, falhas: 1 });
    expect(m.banco.estado.stg.map((s) => s.idOrigem)).toEqual(['1', '2']);
  });
});

describe('A3 do review da F3: transição inválida repetida não trava a marca d\'água', () => {
  it('a mesma transição inválida em coletas seguidas deixa cada uma como sucesso e a marca d\'água avança', async () => {
    const ruim = card(1, [transicao(7, '2026-10-01 10:00:00', null), { column_id: 9 }]);
    const banco = bancoFalso({ marca: new Date('2026-10-29T00:00:00Z') });
    const m = await montar([ruim], banco);
    const r1 = await coletarCards(m.deps, { tipo: 'incremental' });
    const r2 = await coletarCards({ ...m.deps, agora: () => new Date('2026-11-03T12:00:00Z') }, { tipo: 'incremental' });
    expect([r1.estado, r2.estado]).toEqual(['sucesso', 'sucesso']);
    expect(banco.estado.marca).toMatchObject({ ate: new Date('2026-11-03T12:00:00Z') });
    expect(banco.estado.falhas.map((f) => f.erro)).toEqual(['transicao-invalida', 'transicao-invalida']);
  });
});

describe('allow-list da transição (4c, E2.46)', () => {
  it('só as chaves da constante mais card_id; campo fora da lista, objeto aninhado e pessoa são descartados', () => {
    const r = registroTransicao({ ...transicao(7, 'a', null), user_id: 1, author: MARCA, user: { realname: MARCA }, campo_novo: MARCA, start: { x: MARCA } }, '10');
    expect(Object.keys(r).sort()).toEqual(['board_id', 'card_id', 'column_id', 'end', 'lane_id', 'section', 'workflow_id']);
    expect(serializar(r)).not.toContain(MARCA);
    expect([...CAMPOS_TRANSICAO]).toEqual(['board_id', 'workflow_id', 'lane_id', 'column_id', 'section', 'start', 'end']);
    expect(registroTransicao(null, '10')).toEqual({ card_id: '10' });
  });
});
