import { afterEach, describe, expect, it } from 'vitest';
import { CAMINHOS_PERMITIDOS, CAMPOS_WORKLOG, criarClienteHttp, TETO_WORKLOG } from '../src/plataforma/http.js';
import { cenarioWorklogVazio, registroWorklog, subirServidorWorklog, type Registro, type ServidorWorklog } from './apontamento-duble.js';

// Pedido 059, A2 (CA-AP-11, CT-37, CT-77): o cliente HTTP do worklog tem só `/loggedTime`, com `card_ids` e `fields` fixo. Servidor falso em
// 127.0.0.1 (nenhuma chamada ao BusinessMap real).

const servidores: ServidorWorklog[] = [];
afterEach(async () => { for (const s of servidores.splice(0)) await s.fechar(); });
const subir = async (registros: Registro[] = [], extra: Partial<ReturnType<typeof cenarioWorklogVazio>> = {}): Promise<ServidorWorklog> => {
  const s = await subirServidorWorklog({ ...cenarioWorklogVazio(), registros, ...extra });
  servidores.push(s);
  return s;
};
const cliente = (s: ServidorWorklog) => criarClienteHttp({ urlBase: s.url, apikey: 'chave-do-teste-0123456789', limitePorMinuto: 10_000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });
const consulta = { card_ids: '9100000000', include_logged_time_for_subtasks: 1, fields: CAMPOS_WORKLOG, per_page: TETO_WORKLOG } as const;

describe('cliente HTTP: do worklog só `/loggedTime` (CA-AP-11, ADR 0025 item 1)', () => {
  it('a lista fechada tem `/loggedTime` e nada além dele do worklog', () => {
    const ok = (c: string): boolean => CAMINHOS_PERMITIDOS.some((p) => p.test(c));
    expect(ok('/loggedTime')).toBe(true);
    for (const c of ['/loggedTime/history', '/loggedTimeCategories', '/loggedTime/12', '/loggedTime/', '/loggedTime/../cards', '/loggedtime']) expect(ok(c), c).toBe(false);
  });
  it('lê o worklog com a consulta fixa e devolve o corpo; o servidor recebe só GET com os 12 campos', async () => {
    const s = await subir([registroWorklog()]);
    const corpo = await cliente(s).get('/loggedTime', { consulta: { ...consulta, from_date: '2026-10-01', to_date: '2026-10-31', logged_from: '2026-10-01T00:00:00Z', logged_to: '2026-11-01T00:00:00Z' } });
    expect((corpo as { data: unknown[] }).data).toHaveLength(1);
    expect(s.pedidos).toHaveLength(1);
    expect(s.pedidos[0]).toMatchObject({ metodo: 'GET', caminho: '/loggedTime' });
    expect(s.pedidos[0]!.consulta.get('fields')).toBe(CAMPOS_WORKLOG);
  });
  it.each([
    ['history', '/loggedTime/history', consulta],
    ['categorias', '/loggedTimeCategories', { page: 1 }],
    ['por id', '/loggedTime/12', consulta],
    ['com ..', '/loggedTime/../cards', consulta],
  ])('caminho fora da lista (%s) é recusado antes de enviar', async (_n, caminho, q) => {
    const s = await subir();
    await expect(cliente(s).get(caminho, { consulta: q })).rejects.toMatchObject({ tipo: 'caminho' });
    expect(s.pedidos).toHaveLength(0);
  });
  it.each([
    ['sem card_ids', { fields: CAMPOS_WORKLOG }],
    ['sem fields', { card_ids: '1' }],
    ['fields sem comentário', { ...consulta, fields: 'logged_time_id,card_id' }],
    ['fields com campo a mais', { ...consulta, fields: `${CAMPOS_WORKLOG},reporter` }],
    ['user_ids', { ...consulta, user_ids: '1' }],
    ['page 0 (063: page vale de 1 a 9999)', { ...consulta, page: 0 }],
    ['page 10000', { ...consulta, page: 10_000 }],
    ['201 cards', { ...consulta, card_ids: Array.from({ length: 201 }, (_, i) => i + 1).join(',') }],
    ['card_ids com letra', { ...consulta, card_ids: '1,a' }],
    ['per_page 1001', { ...consulta, per_page: 1001 }],
    ['per_page 0', { ...consulta, per_page: 0 }],
    ['from_date com hora', { ...consulta, from_date: '2026-10-01T00:00:00Z' }],
    ['from_date inválida', { ...consulta, from_date: 'ontem' }],
    ['include_logged_time_for_subtasks 2', { ...consulta, include_logged_time_for_subtasks: 2 }],
  ])('consulta recusada antes de enviar: %s', async (_n, q) => {
    const s = await subir();
    await expect(cliente(s).get('/loggedTime', { consulta: q })).rejects.toMatchObject({ tipo: 'consulta' });
    expect(s.pedidos).toHaveLength(0);
  });
  it('200 cards e per_page 1000 passam (limites inclusivos)', async () => {
    const s = await subir();
    await cliente(s).get('/loggedTime', { consulta: { ...consulta, card_ids: Array.from({ length: 200 }, (_, i) => i + 1).join(','), per_page: 1000 } });
    expect(s.pedidos).toHaveLength(1);
  });
  it('só expõe leitura (get e listarPaginas): nenhum método de escrita', () => {
    expect(Object.keys(criarClienteHttp({ urlBase: 'http://127.0.0.1:1', apikey: 'x', limitePorMinuto: 1, timeoutMs: 100 })).sort()).toEqual(['get', 'listarPaginas']);
  });
  it('caminho com host próprio é recusado e redirecionamento não é seguido', async () => {
    const s = await subir([], { status: { '/loggedTime': 302 } });
    const c = cliente(s);
    await expect(c.get('//outro.exemplo/loggedTime', { consulta })).rejects.toMatchObject({ tipo: 'host' });
    await expect(c.get('/loggedTime', { consulta })).rejects.toMatchObject({ tipo: 'redirect' });
    expect(s.pedidos).toHaveLength(1);
  });
});
