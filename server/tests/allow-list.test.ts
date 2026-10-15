import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  CAMPOS_CARD, CAMPOS_REVISAO, CAMPOS_WEBHOOK, extrairResponsaveis, gravarResponsaveis, gravarStgCard, gravarStgRevision,
  registroCard, registroRevisao, registroWebhook, rotasWebhook,
} from '../src/modulos/businessmap/index.js';
import { reduzirCamposCustomizados, tipoParaLog } from '../src/modulos/businessmap/allow-list.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg } from './duble-pg.js';

/**
 * ADR 0020, item 7 (B-1). A lista de PROIBIDOS é escrita aqui, à mão, e NÃO deriva das constantes de `allow-list.ts`:
 * se alguém acrescentar `owner_user_id` à constante, estes testes falham.
 */
const PROIBIDOS = [
  'owner_user_id', 'co_owner_ids', 'user_id', 'reporter', 'watcher_ids', 'author', 'author_id', 'text', 'comment', 'discard_comment',
  'description', 'subtasks', 'logged_times', 'last_comment', 'comment_count', 'tag_ids', 'initiative_details', 'transitions', 'block_times',
  'lead_time_per_column', 'email', 'name', 'username',
];

/** Fixture com as chaves do schema `Card` e `CardRevision` da API (businessmap-api-configuracao.md §4.2 e §4.3) + uma chave desconhecida. */
const MARCADOR = 'MARCADOR-PESSOA-777';
const CARD_API = {
  card_id: 10, custom_id: 'DSPD-10', title: 'Titulo', description: MARCADOR, type_id: 2, size: 3, priority: 1, deadline: '2026-10-30',
  created_at: '2026-10-01T10:00:00Z', revision: 4, last_modified: '2026-10-10T10:00:00Z', board_id: 5, workflow_id: 6, column_id: 7,
  lane_id: 8, section: 2, last_column_id: 6, last_lane_id: 8, archived_at: null, reason_id: null, discard_comment: MARCADOR,
  discarded_at: null, is_blocked: 1, block_reason: { reason_id: 9, label: MARCADOR, comment: MARCADOR }, current_block_time: 120,
  current_cycle_time: 3600, child_card_stats: { child_card_count: 2, texto: MARCADOR, ok: true }, first_request_time: null,
  first_start_time: '2026-10-02T10:00:00Z', first_end_time: null, last_request_time: null, last_start_time: null, last_end_time: null,
  owner_user_id: 111, co_owner_ids: [222, 333], reporter: { name: MARCADOR }, watcher_ids: [444], logged_times: [{ user_id: 555, comment: MARCADOR }],
  last_comment: MARCADOR, comment_count: 3, subtasks: [{ description: MARCADOR, owner_user_id: 666 }], tag_ids: [1], initiative_details: { x: MARCADOR },
  transitions: [{ user_id: 777 }], block_times: [{ user_id: 888 }], lead_time_per_column: [],
  linked_cards: [{ card_id: 11, link_type: 'parent', title: MARCADOR, owner_user_id: 999 }],
  custom_fields: [{ field_id: 'sistema', value: 'a', text: MARCADOR }, { field_id: 'livre', value: MARCADOR }, { field_id: 'time', value: MARCADOR }],
  campo_desconhecido_novo: MARCADOR, e_mail: MARCADOR,
};
const REVISAO_API = {
  card_id: 10, board_id: 5, column_id: 7, lane_id: 8, revision: 4, created_at: '2026-10-01T10:00:00Z', replaced_at: null, user_id: 111,
  owner_user_id: 111, co_owner_ids: [222], subtasks: [{ description: MARCADOR }],
  custom_fields: [{ field_id: 'sistema', value: 'a' }, { field_id: 'livre', value: MARCADOR }],
  linked_cards: [{ card_id: 11, link_type: 'child', title: MARCADOR }], campo_desconhecido_novo: MARCADOR,
};
const DOMINIOS = new Map([['sistema', new Map([['a', 'sis_a']])], ['time', new Map([['x', 'time_x']])]]);

const chavesProfundas = (v: unknown): string[] =>
  v !== null && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => [k, ...chavesProfundas(x)]) : [];

describe('allow-list do card (stg_card, 4a, M-1)', () => {
  const r = registroCard(CARD_API, DOMINIOS);
  it('nenhuma chave proibida nem valor de texto livre sai, em nenhum nível', () => {
    const chaves = chavesProfundas(r);
    for (const p of PROIBIDOS) expect(chaves).not.toContain(p);
    expect(JSON.stringify(r)).not.toContain(MARCADOR);
    expect(chaves).not.toContain('campo_desconhecido_novo');
    expect(chaves).not.toContain('e_mail');
  });
  it('só as chaves da lista fechada saem (mais os campos reduzidos)', () => {
    const permitidas = new Set<string>([...CAMPOS_CARD, 'block_reason_id', 'child_card_stats', 'linked_cards', 'custom_fields']);
    expect(Object.keys(r).filter((k) => !permitidas.has(k))).toEqual([]);
    expect(r.card_id).toBe(10);
    expect(r.title).toBe('Titulo');
  });
  it('block_reason reduz ao id do motivo; vínculos a (card_id, link_type); child_card_stats só números e booleanos', () => {
    expect(r.block_reason_id).toBe(9);
    expect(r.linked_cards).toEqual([{ card_id: 11, link_type: 'parent' }]);
    expect(r.child_card_stats).toEqual({ child_card_count: 2, ok: true });
  });
  it('campo que vira objeto na API (por exemplo o título) não passa: só escalares', () => {
    expect(registroCard({ card_id: 1, title: { nome: MARCADOR } }).title).toBeUndefined();
  });
  it('entrada que não é objeto, ou sem os campos reduzidos, gera registro vazio', () => {
    expect(registroCard(null)).toEqual({});
    expect(registroCard({ block_reason: 'x', child_card_stats: 1, linked_cards: 1, custom_fields: 1 })).toEqual({});
    expect(registroCard({ block_reason: { reason_id: { a: 1 } } })).toEqual({});
  });
  it('vínculo com campo fora do tipo escalar vira nulo', () => {
    expect(registroCard({ linked_cards: [{ card_id: { a: 1 }, link_type: [1] }, 'x'] }).linked_cards).toEqual([{ card_id: null, link_type: null }]);
  });
});

describe('campos customizados (4d, B-5)', () => {
  it('campo fora da lista de referência não entra; valor fora do domínio grava `desconhecido`, nunca o texto', () => {
    const r = registroCard(CARD_API, DOMINIOS);
    expect(r.custom_fields).toEqual([{ field_id: 'sistema', valor: 'sis_a' }, { field_id: 'time', valor: 'desconhecido' }]);
    expect(JSON.stringify(r)).not.toContain(MARCADOR);
  });
  it('sem domínios nada entra; valor não escalar vira `desconhecido`; formato inesperado é ignorado', () => {
    expect(registroCard(CARD_API).custom_fields).toEqual([]);
    expect(reduzirCamposCustomizados([{ field_id: 1, value: { a: 1 } }, null, { value: 'a' }, { field_id: 'sistema', value: 7 }], new Map([['1', new Map()], ['sistema', new Map([['7', 's7']])]])))
      .toEqual([{ field_id: '1', valor: 'desconhecido' }, { field_id: 'sistema', valor: 's7' }]);
    expect(reduzirCamposCustomizados('x', DOMINIOS)).toBeUndefined();
  });
});

describe('allow-list da revisão (stg_revision, 4c, M-3)', () => {
  const r = registroRevisao(REVISAO_API, true, DOMINIOS);
  it('user_id, owner, co_owner, subtasks e texto não saem; só a lista fechada', () => {
    const chaves = chavesProfundas(r);
    for (const p of PROIBIDOS) expect(chaves).not.toContain(p);
    expect(JSON.stringify(r)).not.toContain(MARCADOR);
    const permitidas = new Set<string>([...CAMPOS_REVISAO, 'troca_responsavel', 'linked_cards', 'custom_fields']);
    expect(Object.keys(r).filter((k) => !permitidas.has(k))).toEqual([]);
    expect(r).toMatchObject({ card_id: 10, revision: 4, troca_responsavel: true, custom_fields: [{ field_id: 'sistema', valor: 'sis_a' }] });
    expect(r.linked_cards).toEqual([{ card_id: 11, link_type: 'child' }]);
  });
  it('sem troca calculada, a chave não existe; entrada inválida gera vazio', () => {
    expect('troca_responsavel' in registroRevisao(REVISAO_API, undefined)).toBe(false);
    expect(registroRevisao(7, undefined)).toEqual({});
  });
});

describe('gravarStgCard e gravarStgRevision gravam só o registro filtrado', () => {
  const S = montarEsquemas('t_');
  const base = { coletaId: 1, agora: new Date(0) };
  it('stg_card: o payload do INSERT não tem proibido nem texto livre; o hash é o do registro filtrado', async () => {
    const d = criarDublePg((c) => (c.texto.startsWith('SELECT') ? [] : [{ stg_sk: '1' }]));
    await gravarStgCard(d.pool, { ...base, idOrigem: '10', card: CARD_API, dominios: DOMINIOS, quadroId: '5', arquivado: false, excluidoDetectado: false }, S);
    const ins = d.chamadas[1]!;
    const payload = ins.valores[3] as string;
    for (const p of PROIBIDOS) expect(payload).not.toContain(`"${p}"`);
    expect(payload).not.toContain(MARCADOR);
    expect(ins.valores[2]).toEqual(createHash('sha256').update(payload).digest());
    expect(JSON.stringify(ins.valores)).not.toContain('111');
  });
  it('mudança só em campo fora da lista não gera versão nova (mesmo hash)', async () => {
    const hashes: unknown[] = [];
    const d = criarDublePg((c) => { if (!c.texto.startsWith('SELECT')) hashes.push(c.valores[2]); return c.texto.startsWith('SELECT') ? [] : [{ stg_sk: '1' }]; });
    const g = (card: unknown) => gravarStgCard(d.pool, { ...base, idOrigem: '10', card, quadroId: '5', arquivado: false, excluidoDetectado: false }, S);
    await g({ card_id: 1, owner_user_id: 1 });
    await g({ card_id: 1, owner_user_id: 2, discard_comment: 'x' });
    expect(hashes[0]).toEqual(hashes[1]);
  });
  it('stg_revision: INSERT com o registro filtrado, ON CONFLICT DO NOTHING, devolve se gravou', async () => {
    const d = criarDublePg(() => [{ revision_sk: '1' }]);
    expect(await gravarStgRevision(d.pool, { ...base, cardId: '10', revisionId: '4', revisao: REVISAO_API, trocaResponsavel: false, dominios: DOMINIOS }, S)).toBe(true);
    const c = d.chamadas[0]!;
    expect(c.texto).toContain('INSERT INTO t_dspd_bm.stg_revision');
    expect(c.texto).toContain('ON CONFLICT ON CONSTRAINT uq_stg_revision DO NOTHING');
    const payload = c.valores[3] as string;
    for (const p of PROIBIDOS) expect(payload).not.toContain(`"${p}"`);
    expect(payload).not.toContain(MARCADOR);
    expect(JSON.parse(payload).troca_responsavel).toBe(false);
    const repetida = criarDublePg(() => []);
    expect(await gravarStgRevision(repetida.pool, { ...base, cardId: '10', revisionId: '4', revisao: REVISAO_API })).toBe(false);
  });
});

describe('webhook: allow-list (4f, M-2)', () => {
  const CORPO = {
    evento: 'card_moved', card: { id: 10, board_id: 5, workflow_id: 6, column_id: 7, lane_id: 8, title: MARCADOR, description: MARCADOR, owner_user_id: 1 },
    anterior: { column_id: 6, lane_id: 8, comment: MARCADOR }, timestamp: '2026-10-10T10:00:00Z',
    user: { id: 1, name: MARCADOR, email: MARCADOR }, author: MARCADOR, text: MARCADOR, discard_comment: MARCADOR,
  };
  it('corpo com autor, texto e discard_comment gera registro sem eles', () => {
    const r = registroWebhook(CORPO)!;
    expect(r).toEqual({
      evento: 'card_moved', card_id: 10, board_id: 5, workflow_id: 6, column_id: 7, lane_id: 8, column_id_anterior: 6, lane_id_anterior: 8,
      instante: '2026-10-10T10:00:00Z',
    });
    const chaves = chavesProfundas(r);
    for (const p of PROIBIDOS) expect(chaves).not.toContain(p);
    expect(JSON.stringify(r)).not.toContain(MARCADOR);
    expect(Object.keys(r).filter((k) => !['evento', 'instante', ...CAMPOS_WEBHOOK].includes(k))).toEqual([]);
  });
  it('ids no topo do corpo também são lidos; valor não escalar e instante longo são descartados', () => {
    expect(registroWebhook({ evento: 'card_moved', card_id: 1, board_id: { x: 1 }, column_id_anterior: 2, occurred_at: 'x'.repeat(41) }))
      .toEqual({ evento: 'card_moved', card_id: 1, column_id_anterior: 2 });
    expect(registroWebhook({ evento: 'card_moved', card_id: 'c1', card: { card_id: 'x' }, occurred_at: 'ok' })).toMatchObject({ card_id: 'x', instante: 'ok' });
  });
  it.each([[{ evento: 'card_deleted' }], [{}], [{ evento: 3 }], [null], ['x']])('tipo fora da lista ou corpo sem tipo: sem registro (%j)', (c) => {
    expect(registroWebhook(c)).toBeNull();
  });
  it('log leva só tipo com forma de identificador', () => {
    expect(tipoParaLog({ evento: 'card_deleted' })).toBe('card_deleted');
    expect(tipoParaLog({ evento: `Fulano ${MARCADOR}` })).toBe('invalido');
    expect(tipoParaLog(null)).toBe('invalido');
    expect(typeof rotasWebhook).toBe('function');
  });
});

describe('responsáveis em memória (4b, M-1)', () => {
  it('extrai dono e co-donos como texto, sem repetição, em ordem; ausência = null (não sobrescreve)', () => {
    expect(extrairResponsaveis({ owner_user_id: 5, co_owner_ids: [3, '5', 4, null] })).toEqual(['3', '4', '5']);
    expect(extrairResponsaveis({ owner_user_id: null, co_owner_ids: [] })).toEqual([]);
    expect(extrairResponsaveis({ co_owner_ids: 'x' })).toEqual([]);
    expect(extrairResponsaveis({ title: 'x' })).toBeNull();
    expect(extrairResponsaveis(null)).toBeNull();
  });
  const S = montarEsquemas('t_');
  const e = { cardId: '10', responsaveis: ['1', '2'], stgCardSk: '9', vigenteDe: new Date(0), coletaId: 3, agora: new Date(1) };
  it('grava só em dim_card e dim_card_versao: nenhum SQL toca stg_', async () => {
    const d = criarDublePg((c) => (c.texto.startsWith('INSERT') ? [{ card_versao_sk: '1' }] : { rows: [], rowCount: 1 }));
    expect(await gravarResponsaveis(d.pool, e, S)).toEqual({ dimCard: true, versao: true });
    expect(d.chamadas).toHaveLength(2);
    expect(d.chamadas[0]!.texto).toContain('UPDATE t_dspd_bm.dim_card SET responsaveis');
    expect(d.chamadas[1]!.texto).toContain('INSERT INTO t_dspd_bm.dim_card_versao');
    expect(d.chamadas[1]!.texto).toContain('ON CONFLICT ON CONSTRAINT uq_dim_card_versao DO NOTHING');
    expect(d.chamadas[1]!.texto).not.toMatch(/UPDATE t_dspd_bm\.dim_card_versao/);
    for (const c of d.chamadas) expect(c.texto).not.toContain('stg_revision');
    expect(d.chamadas[0]!.valores[1]).toEqual(['1', '2']);
  });
  it('nada mudou: nada é gravado; null nem consulta o banco', async () => {
    const d = criarDublePg(() => ({ rows: [], rowCount: 0 }));
    expect(await gravarResponsaveis(d.pool, e)).toEqual({ dimCard: false, versao: false });
    expect(d.chamadas[0]!.texto).toContain('dspd_bm.dim_card');
    const n = criarDublePg();
    expect(await gravarResponsaveis(n.pool, { ...e, responsaveis: null })).toEqual({ dimCard: false, versao: false });
    expect(n.chamadas).toHaveLength(0);
  });
  it('rowCount nulo conta como nada alterado', async () => {
    const d = criarDublePg(() => ({ rows: [], rowCount: undefined as unknown as number }));
    expect((await gravarResponsaveis(d.pool, e, S)).dimCard).toBe(false);
  });
});
