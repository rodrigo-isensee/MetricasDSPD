import { describe, expect, it } from 'vitest';
import {
  CAMPOS_CARD, CAMPOS_REVISAO, CAMPOS_TRANSICAO, CAMPOS_WEBHOOK, registroCard, registroRevisao, registroTransicao, registroWebhook,
} from '../src/modulos/businessmap/index.js';

/**
 * K-089, ADR 0020 item 7 (B-1): lista de proibidos escrita à mão neste arquivo, independente das constantes de `allow-list.ts`.
 * Fecha a lacuna do `allow-list.test.ts`: lá a conferência é pela saída de um fixture, e um proibido que a API devolve como
 * lista (`co_owner_ids`, `watcher_ids`) ou objeto é descartado por não ser escalar, então um mutante que o pusesse na constante
 * sobrevivia. Aqui a constante é conferida direto e o fixture traz cada proibido também como escalar.
 * Sem dado de pessoa real: só marcadores sintéticos.
 */
const PROIBIDOS = [
  'owner_user_id', 'co_owner_ids', 'user_id', 'reporter', 'watcher_ids', 'author', 'author_id', 'autor', 'text', 'texto', 'comment',
  'discard_comment', 'description', 'subtasks', 'logged_times', 'last_comment', 'comment_count', 'email', 'name', 'username',
];
const MARCA = 'MARCADOR-PROIBIDO-089';
/** Cada proibido como valor escalar: o pior caso para a allow-list (um escalar passaria se a chave estivesse na constante). */
const ESCALARES = Object.fromEntries(PROIBIDOS.map((p) => [p, MARCA]));

describe('K-089: proibidos escritos no teste, por entidade da ADR 0020', () => {
  it('piso da lista: um proibido apagado daqui derruba o teste (guarda contra lista vazia)', () => {
    expect(PROIBIDOS.length).toBeGreaterThanOrEqual(20);
    for (const p of ['owner_user_id', 'co_owner_ids', 'user_id', 'reporter', 'watcher_ids', 'discard_comment', 'description', 'subtasks', 'logged_times', 'last_comment']) {
      expect(PROIBIDOS).toContain(p);
    }
  });
  it.each([
    ['stg_card (CAMPOS_CARD)', CAMPOS_CARD],
    ['stg_revision (CAMPOS_REVISAO)', CAMPOS_REVISAO],
    ['stg_revision, transição (CAMPOS_TRANSICAO)', CAMPOS_TRANSICAO],
    ['stg_webhook_evento (CAMPOS_WEBHOOK)', CAMPOS_WEBHOOK],
  ] as const)('%s não contém nenhum proibido', (_nome, constante) => {
    expect(constante.length).toBeGreaterThan(0);
    for (const p of PROIBIDOS) expect(constante as readonly string[]).not.toContain(p);
  });
  it('saída de card, revisão, transição e webhook com cada proibido escalar: nenhuma chave proibida, nenhum marcador', () => {
    const saidas = [
      registroCard({ card_id: 1, ...ESCALARES }),
      registroRevisao({ card_id: 1, revision: 1, ...ESCALARES }, false),
      registroTransicao({ column_id: 7, start: 'a', ...ESCALARES }, '1'),
      registroWebhook({ evento: 'card_moved', card_id: 1, ...ESCALARES, card: { ...ESCALARES }, anterior: { ...ESCALARES } })!,
    ];
    for (const s of saidas) {
      expect(Object.keys(s).length).toBeGreaterThan(0);
      for (const p of PROIBIDOS) expect(Object.keys(s)).not.toContain(p);
      expect(JSON.stringify(s)).not.toContain(MARCA);
    }
  });
});
