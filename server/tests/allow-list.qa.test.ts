import { describe, expect, it } from 'vitest';
import { CAMPOS_CARD, CAMPOS_REVISAO, CAMPOS_WEBHOOK, extrairResponsaveis, registroCard, registroRevisao, registroWebhook } from '../src/modulos/businessmap/index.js';
import { serializar, tipoParaLog } from '../src/modulos/businessmap/allow-list.js';

/**
 * QA do K-084 (R-QA): casos de abuso da allow-list na fronteira, escritos à mão (não derivam das constantes de produção).
 * Obrigação: ADR 0020 4a, 4c, 4f e 4b; regra inviolável "nome, e-mail, usuarioKey, descrição e título do chamado nunca chegam à staging".
 */
const M = 'MARCADOR-QA-PESSOA';
const profundo = (v: unknown): string => JSON.stringify(v);

describe('QA K-084: payload com chaves de protótipo e formatos hostis', () => {
  it('__proto__, constructor e prototype vindos de JSON.parse não entram nem poluem Object.prototype', () => {
    const card = JSON.parse(`{"card_id":1,"__proto__":{"owner_user_id":"${M}","polluido":true},"constructor":{"prototype":{"x":"${M}"}},"prototype":"${M}"}`);
    const r = registroCard(card);
    expect(Object.keys(r)).toEqual(['card_id']);
    expect(profundo(r)).not.toContain(M);
    expect(({} as Record<string, unknown>).polluido).toBeUndefined();
    expect(Object.getPrototypeOf(r)).toBe(Object.prototype);
  });

  it.each([null, undefined, 'texto', 42, true, [], [{ owner_user_id: M }]])('entrada que não é objeto (%j) gera registro vazio nos três registros', (entrada) => {
    expect(registroCard(entrada)).toEqual({});
    expect(registroRevisao(entrada, undefined)).toEqual({});
    expect(registroWebhook(entrada)).toBeNull();
    expect(extrairResponsaveis(entrada)).toBeNull();
  });

  it('proibido aninhado em objeto, vetor e vínculo nunca sai, mesmo com chave permitida ao lado', () => {
    const card = {
      card_id: 7, title: { owner_user_id: M }, deadline: [M], size: { text: M }, block_reason: { reason_id: 3, comment: M, user_id: M },
      child_card_stats: { total: 2, quem: M, dono: { owner_user_id: M }, lista: [M] },
      linked_cards: [{ card_id: 8, link_type: 'parent', title: M, co_owner_ids: [M] }, { card_id: { owner_user_id: M }, link_type: [M] }, 'texto', null],
      custom_fields: [{ field_id: 'f', value: M }],
    };
    const r = registroCard(card);
    expect(profundo(r)).not.toContain(M);
    expect(r).toMatchObject({ card_id: 7, block_reason_id: 3, child_card_stats: { total: 2 } });
    expect(r.linked_cards).toEqual([{ card_id: 8, link_type: 'parent' }, { card_id: null, link_type: null }]);
    expect(r).not.toHaveProperty('title');
    expect(r.custom_fields).toEqual([]); // sem domínio configurado, nenhum campo customizado entra
  });

  it('a revisão não aceita proibido nem na lista de campos, nem pela troca de responsável não calculada', () => {
    const r = registroRevisao({ card_id: 1, revision: 2, user_id: M, owner_user_id: M, co_owner_ids: [M], subtasks: [M], author: M }, undefined);
    expect(Object.keys(r).sort()).toEqual(['card_id', 'revision']);
    expect(profundo(r)).not.toContain(M);
  });

  it('somente chaves das constantes saem, para um card com 200 chaves desconhecidas (lista fechada, sem prefixo nem padrão)', () => {
    const card: Record<string, unknown> = { card_id: 1 };
    for (let i = 0; i < 200; i++) card[`campo_${i}`] = M;
    card.owner_user_id = 5; card.co_owner_ids = 6; card.discard_comment = M; card.description = M; card.title_extra = M; card.titulo = M; card.Title = M; card.CARD_ID = M; card['card_id '] = M;
    const r = registroCard(card);
    expect(Object.keys(r)).toEqual(['card_id']);
    expect(CAMPOS_CARD.length).toBeGreaterThan(20); // guarda contra constante esvaziada
    expect(CAMPOS_REVISAO.length).toBeGreaterThanOrEqual(5);
    expect(CAMPOS_WEBHOOK.length).toBeGreaterThanOrEqual(5);
  });
});

describe('QA K-084: webhook de tipo desconhecido ou disfarçado', () => {
  it.each([
    ['maiúsculo', 'CARD_MOVED'], ['misto', 'Card_Moved'], ['espaço no fim', 'card_moved '], ['quebra de linha', 'card_moved\n'],
    ['prefixo', 'x_card_moved'], ['vazio', ''], ['outro tipo', 'card_deleted'], ['vetor', ['card_moved']], ['número', 1], ['nulo', null], ['objeto', { toString: 'card_moved' }],
  ])('evento %s não grava nada (registro nulo)', (_nome, evento) => {
    expect(registroWebhook({ evento, card: { id: 1 } })).toBeNull();
  });

  it('o tipo só vale no campo evento: dentro de card ou de anterior não conta', () => {
    expect(registroWebhook({ card: { evento: 'card_moved', id: 1 } })).toBeNull();
    expect(registroWebhook({ anterior: { evento: 'card_moved' } })).toBeNull();
    expect(registroWebhook({ type: 'card_moved' })).toBeNull();
  });

  it('tipo conhecido com autor, texto livre e ids de pessoa: o registro leva só tipo, ids de posição e instante', () => {
    const r = registroWebhook({
      evento: 'card_moved', card: { id: 5, board_id: 1, column_id: 2, title: M, description: M, owner_user_id: M, comment: M },
      anterior: { column_id: 1, lane_id: 3, user: M }, author: { name: M, email: `${M}@x.com` }, user_id: M, timestamp: '2026-10-10T10:00:00Z', discard_comment: M,
    });
    expect(r).toEqual({ evento: 'card_moved', card_id: 5, board_id: 1, column_id: 2, column_id_anterior: 1, lane_id_anterior: 3, instante: '2026-10-10T10:00:00Z' });
    expect(profundo(r)).not.toContain(M);
  });

  it('valor não escalar nos ids e instante gigante são descartados', () => {
    const r = registroWebhook({ evento: 'card_moved', card: { id: { owner: M }, board_id: [M], column_id: true }, timestamp: 'x'.repeat(41) });
    expect(r).toEqual({ evento: 'card_moved' });
  });

  it('o log nunca leva texto livre do tipo: só forma de identificador, senão "invalido"', () => {
    expect(tipoParaLog({ evento: 'card_moved' })).toBe('card_moved');
    for (const t of [`${M} com espaço`, 'card_moved\nINJETADO', 'a'.repeat(41), 'Card', '', ['card_moved'], null]) expect(tipoParaLog({ evento: t })).toBe('invalido');
  });
});

describe('QA K-084: dado fora de ordem e hash de dedupe', () => {
  it('a ordem das chaves, em qualquer nível, não muda o hash (mesmo card, ordem diferente da API)', () => {
    const a = registroCard({ card_id: 1, title: 'a', child_card_stats: { b: 1, a: 2 }, linked_cards: [{ link_type: 'p', card_id: 2 }] });
    const b = registroCard({ linked_cards: [{ card_id: 2, link_type: 'p' }], child_card_stats: { a: 2, b: 1 }, title: 'a', card_id: 1 });
    expect(serializar(a)).toBe(serializar(b));
  });

  it('a ordem dos vínculos importa (é dado, não ordem de chave): ordem diferente gera hash diferente', () => {
    const a = registroCard({ card_id: 1, linked_cards: [{ card_id: 2, link_type: 'p' }, { card_id: 3, link_type: 'c' }] });
    const b = registroCard({ card_id: 1, linked_cards: [{ card_id: 3, link_type: 'c' }, { card_id: 2, link_type: 'p' }] });
    expect(serializar(a)).not.toBe(serializar(b));
  });

  it('responsáveis: repetidos e fora de ordem saem únicos e ordenados; tipo estranho é ignorado; só dono vazio = []', () => {
    expect(extrairResponsaveis({ owner_user_id: 9, co_owner_ids: [3, '3', 9, 1, null, { x: M }, [M]] })).toEqual(['1', '3', '9']);
    expect(extrairResponsaveis({ owner_user_id: null, co_owner_ids: 'texto' })).toEqual([]);
    expect(extrairResponsaveis({ owner_user_id: M })).toEqual([M]); // id é texto por definição; nunca vai à staging (ver teste .pg)
    expect(extrairResponsaveis({ title: M })).toBeNull();
  });
});
