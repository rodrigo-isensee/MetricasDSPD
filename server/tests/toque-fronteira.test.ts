import { describe, expect, it } from 'vitest';
import { CAMPOS_TOQUE, cortarComentarioDoToque, cortarRevisaoDoToque } from '../src/modulos/businessmap/allow-list.js';
import { AUTOR_DO_TOQUE, normalizarToque, type EntradaToque } from '../src/modulos/businessmap/toque.js';
import { criarClienteHttp, CONSULTA_COMENTARIOS, CONSULTA_REVISOES, type ErroBusinessMap } from '../src/plataforma/http.js';

// Pedido 105, B7a (O22, ADR 0020 R6): fronteira do primeiro toque. Dados fictícios; nenhuma chamada de rede (fetch falso).
const MARCADOR = 'MARCADOR-TOQUE-105';
const EMAIL = `${MARCADOR}@exemplo.invalido`;

const iso = (minuto: number): string => `2026-11-02T10:${String(minuto).padStart(2, '0')}:00Z`;
const ms = (minuto: number): number => Date.parse(iso(minuto));

describe('CAMPOS_TOQUE e o corte da fronteira (R6-3, R-T4, casos 6 e 8)', () => {
  it('a lista fechada é exatamente a do ADR 0020 R6-3', () => {
    expect([...CAMPOS_TOQUE.revisao]).toEqual(['revision', 'replaced_at', 'user_id']);
    expect([...CAMPOS_TOQUE.comentario]).toEqual(['card_id', 'comment_id', 'created_at', 'author.type', 'author.value']);
  });

  it('revisão com todas as chaves da OpenAPI mais uma desconhecida: só revision, replaced_at e user_id passam', () => {
    const bruto = {
      revision: 3, replaced_at: iso(5), user_id: 77, card_id: 9, created_at: iso(1), board_id: 1, column_id: 2, lane_id: 3, title: MARCADOR, description: MARCADOR,
      owner_user_id: 5, custom_fields: [{ value: MARCADOR }], realname: MARCADOR, email: EMAIL, chave_desconhecida: MARCADOR,
    };
    const cortado = cortarRevisaoDoToque(bruto)!;
    expect(Object.keys(cortado).sort()).toEqual(['replaced_at', 'revision', 'user_id']);
    expect(cortado).toEqual({ revision: 3, replaced_at: iso(5), user_id: 77 });
    expect(JSON.stringify(cortado)).not.toContain(MARCADOR);
  });

  it('comentário com todas as chaves da resposta de /cards/comments mais uma desconhecida: só os cinco campos passam', () => {
    const bruto = {
      card_id: 9, comment_id: 4, created_at: iso(2), last_modified: iso(3), type: 'regular', text: MARCADOR, attachments: [{ name: MARCADOR, file_name: EMAIL }],
      author: { type: 'external', value: EMAIL, realname: MARCADOR, email: EMAIL }, sender: EMAIL, recipients: [EMAIL], chave_desconhecida: MARCADOR,
    };
    const cortado = cortarComentarioDoToque(bruto)!;
    expect(Object.keys(cortado).sort()).toEqual(['author_type', 'author_value', 'card_id', 'comment_id', 'created_at']);
    // só o autor (em memória até contaComoToque) leva o marcador; texto, anexos, remetente e destinatários ficaram na fronteira
    expect(Object.values(cortado).filter((v) => String(v).includes(MARCADOR))).toEqual([EMAIL]);
  });

  it('valor que não é escalar (objeto, lista) não passa; item que não é objeto vira null; autor que não é objeto deixa os campos ausentes', () => {
    expect(cortarRevisaoDoToque({ revision: { a: 1 }, replaced_at: [1], user_id: { id: 1 } })).toEqual({ revision: undefined, replaced_at: undefined, user_id: undefined });
    expect(cortarRevisaoDoToque(null)).toBeNull();
    expect(cortarRevisaoDoToque([1])).toBeNull();
    expect(cortarRevisaoDoToque('x')).toBeNull();
    expect(cortarComentarioDoToque(7)).toBeNull();
    expect(cortarComentarioDoToque({ card_id: 1, comment_id: 2, created_at: iso(1), author: 'texto' })).toEqual({
      card_id: 1, comment_id: 2, created_at: iso(1), author_type: undefined, author_value: undefined,
    });
    expect(cortarComentarioDoToque({ author: { type: { x: 1 }, value: [1] } })).toMatchObject({ author_type: undefined, author_value: undefined });
  });
});

describe('cliente HTTP: consultas fechadas do primeiro toque (R-T1, R-T3, casos 1 a 4)', () => {
  const pedidos: string[] = [];
  const cliente = criarClienteHttp(
    { urlBase: 'https://bm.exemplo.invalido/api/v2', apikey: 'chave-de-teste', limitePorMinuto: 1000, timeoutMs: 1000 },
    { fetchImpl: async (url) => { pedidos.push(String(url)); return new Response(JSON.stringify({ data: [] }), { status: 200 }); }, dormir: async () => undefined },
  );
  const tipo = async (p: Promise<unknown>): Promise<string> => {
    try { await p; } catch (e) { return (e as ErroBusinessMap).tipo; }
    return 'sem-erro';
  };
  const ids = (n: number): string => Array.from({ length: n }, (_, i) => i + 1).join(',');

  it('as consultas fechadas só têm os nomes esperados', () => {
    expect(Object.keys(CONSULTA_COMENTARIOS).sort()).toEqual(['card_ids', 'page']);
    expect(Object.keys(CONSULTA_REVISOES)).toEqual(['page']);
  });

  it('caso 1 e 2: /cards/comments sem card_ids, ou com parâmetro fora da lista, é recusado antes da rede', async () => {
    pedidos.length = 0;
    expect(await tipo(cliente.get('/cards/comments', { consulta: {} }))).toBe('consulta');
    expect(await tipo(cliente.get('/cards/comments', { consulta: { page: 1 } }))).toBe('consulta');
    expect(await tipo(cliente.get('/cards/comments'))).toBe('consulta');
    expect(await tipo(cliente.get('/cards/comments', { consulta: { board_ids: '1' } }))).toBe('consulta');
    expect(await tipo(cliente.get('/cards/comments', { consulta: { card_ids: '1', board_ids: '1' } }))).toBe('consulta');
    for (const extra of ['per_page', 'fields', 'expand', 'is_archived', 'last_modified_from', 'workflow_ids']) {
      expect(await tipo(cliente.get('/cards/comments', { consulta: { card_ids: '1', [extra]: '1' } })), extra).toBe('consulta');
    }
    expect(pedidos).toEqual([]);
  });

  it('caso 3: card_ids com 201 ids, id vazio ou texto é recusado antes da rede; 200 ids passam', async () => {
    pedidos.length = 0;
    for (const lista of [ids(201), '1,,2', '1,a', ',1', '1,', '', ' 1', '1;2', '0x1']) {
      expect(await tipo(cliente.get('/cards/comments', { consulta: { card_ids: lista } })), lista).toBe('consulta');
    }
    expect(pedidos).toEqual([]);
    await cliente.get('/cards/comments', { consulta: { card_ids: ids(200), page: 2 } });
    expect(pedidos).toHaveLength(1);
    expect(pedidos[0]).toContain('/cards/comments?card_ids=');
  });

  it('/cards/{id}/comments (spike F1) não aceita parâmetro algum; sem consulta passa (A3 do parecer 105-o22-coleta)', async () => {
    pedidos.length = 0;
    for (const extra of ['board_ids', 'card_ids', 'per_page', 'page', 'fields']) {
      expect(await tipo(cliente.get('/cards/9/comments', { consulta: { [extra]: '1' } })), extra).toBe('consulta');
    }
    expect(pedidos).toEqual([]);
    expect(await tipo(cliente.get('/cards/9/comments'))).toBe('sem-erro');
  });

  it('caso 4: /cards/{id}/revisions/{n} é recusado como caminho; revisions só aceita page', async () => {
    pedidos.length = 0;
    expect(await tipo(cliente.get('/cards/123/revisions/5'))).toBe('caminho');
    expect(await tipo(cliente.get('/cards/123/revisions/5/'))).toBe('caminho');
    expect(await tipo(cliente.get('/cards/123/revisions', { consulta: { page: '1', board_ids: '1' } }))).toBe('consulta');
    for (const extra of ['board_ids', 'card_ids', 'per_page', 'fields', 'expand', 'is_archived', 'last_modified_to']) {
      expect(await tipo(cliente.get('/cards/123/revisions', { consulta: { [extra]: '1' } })), extra).toBe('consulta');
    }
    expect(await tipo(cliente.get('/cards/123/revisions', { consulta: { page: 'x' } }))).toBe('consulta');
    expect(pedidos).toEqual([]);
    await cliente.get('/cards/123/revisions');
    await cliente.get('/cards/123/revisions', { consulta: { page: 2 } });
    expect(pedidos.map((p) => p.replace('https://bm.exemplo.invalido/api/v2', ''))).toEqual(['/cards/123/revisions', '/cards/123/revisions?page=2']);
  });
});

// --- normalizador ---------------------------------------------------------------------------------------------------------------------------------------
const item = (revision: number, minuto: number | undefined, userId: unknown = 100 + revision): Record<string, unknown> => ({
  revision, ...(minuto === undefined ? {} : { replaced_at: iso(minuto) }), user_id: userId,
});
const entrada = (e: Partial<EntradaToque> & { revisao: unknown }): EntradaToque => ({ cardId: '9', criadoEm: ms(0), itensRevisao: [], comentarios: [], ...e });
const coment = (id: unknown, minuto: number | undefined, tipo: unknown = 'internal', valor: unknown = 5) => ({
  card_id: 9, comment_id: id, created_at: minuto === undefined ? undefined : iso(minuto), author_type: tipo, author_value: valor,
});

describe('normalizarToque: estados e eventos (R6-3, R6-4)', () => {
  it('a constante do autor é a leitura literal da OpenAPI (item n é o autor da revisão n)', () => {
    expect(AUTOR_DO_TOQUE.deslocamento).toBe(0);
  });

  it('revision 1 com lista vazia: lido, sem evento (a criação nunca é gravada)', () => {
    const r = normalizarToque(entrada({ revisao: 1 }));
    expect(r).toEqual({ cardId: '9', revisaoLida: 1, estado: 'lido', motivo: null, eventos: [], revisoesSemAutor: 0, comentariosExternos: 0 });
  });

  it('revision 2 (lista só com a revisão 1): autor_pendente, sem evento gravado', () => {
    const r = normalizarToque(entrada({ revisao: 2, itensRevisao: [item(1, 4)] }));
    expect(r).toMatchObject({ estado: 'autor_pendente', motivo: null, eventos: [], revisaoLida: 2 });
  });

  it('lista só com replaced_at, revision e user_id: evento r<n> tem o instante do item n-1 e o autor do item n', () => {
    const r = normalizarToque(entrada({ revisao: 4, itensRevisao: [item(3, 9, 0), item(1, 3, 100), item(2, 6, 55)] }));
    expect(r.estado).toBe('lido');
    expect(r.eventos).toEqual([
      { eventoId: 'r2', ocorridoEm: ms(3), contaComoToque: true },
      { eventoId: 'r3', ocorridoEm: ms(6), contaComoToque: false },
    ]);
    expect(r.revisoesSemAutor).toBe(1);
  });

  it('autor ausente, nulo, 0, negativo, decimal ou texto com letra: o evento existe e não conta', () => {
    for (const ruim of [undefined, null, 0, -1, 1.5, '12a']) {
      const r = normalizarToque(entrada({ revisao: 3, itensRevisao: [item(1, 3), { revision: 2, replaced_at: iso(6), user_id: ruim }] }));
      expect(r.eventos).toEqual([{ eventoId: 'r2', ocorridoEm: ms(3), contaComoToque: false }]);
      expect(r.revisoesSemAutor).toBe(1);
    }
  });

  it('autor_pendente: a atualização sem autor listado pode ser o primeiro toque se vier antes de todo toque conhecido', () => {
    const lista = [item(1, 3), item(2, 6, null)]; // r2 sem autor; r3 (revision) tem instante 6 e autor não listado
    expect(normalizarToque(entrada({ revisao: 3, itensRevisao: lista })).estado).toBe('autor_pendente');
    // comentário de pessoa antes do instante pendente: o toque já é conhecido, o card está lido
    expect(normalizarToque(entrada({ revisao: 3, itensRevisao: lista, comentarios: [coment(1, 5)] })).estado).toBe('lido');
    // comentário de pessoa depois: o pendente ainda pode ser o primeiro
    expect(normalizarToque(entrada({ revisao: 3, itensRevisao: lista, comentarios: [coment(1, 8)] })).estado).toBe('autor_pendente');
    // comentário externo não conta: o pendente continua pendente
    expect(normalizarToque(entrada({ revisao: 3, itensRevisao: lista, comentarios: [coment(1, 5, 'external', EMAIL)] })).estado).toBe('autor_pendente');
    // instante igual: o primeiro toque seria o mesmo instante de qualquer jeito
    expect(normalizarToque(entrada({ revisao: 3, itensRevisao: lista, comentarios: [coment(1, 6)] })).estado).toBe('lido');
  });

  it('toque na criação não conta como toque conhecido, e instante igual ou anterior à criação não deixa o card pendente', () => {
    const lista = [item(1, 3), item(2, 6)];
    // r2 (autor conta) no instante da criação: não é toque; r3 (pendente) depois da criação: pode ser o primeiro
    expect(normalizarToque(entrada({ revisao: 3, itensRevisao: lista, criadoEm: ms(3) })).estado).toBe('autor_pendente');
    // pendente no mesmo instante da criação: não é toque, o card está lido
    expect(normalizarToque(entrada({ revisao: 3, itensRevisao: lista, criadoEm: ms(6) })).estado).toBe('lido');
    // evento de pessoa depois da criação e antes do pendente: lido
    expect(normalizarToque(entrada({ revisao: 3, itensRevisao: lista, criadoEm: ms(1) })).estado).toBe('lido');
  });

  it('comentários: instante = created_at; externo conta no resumo e não conta como toque; repetido (página sobreposta) entra uma vez', () => {
    const r = normalizarToque(entrada({
      revisao: 1, comentarios: [coment(10, 2), coment('11', 3, 'external', EMAIL), coment(10, 2), coment(12, 4, 'internal', EMAIL)],
    }));
    expect(r.estado).toBe('lido');
    expect(r.comentariosExternos).toBe(1);
    expect(r.eventos).toEqual([
      { eventoId: 'c10', ocorridoEm: ms(2), contaComoToque: true },
      { eventoId: 'c11', ocorridoEm: ms(3), contaComoToque: false },
      { eventoId: 'c12', ocorridoEm: ms(4), contaComoToque: false },
    ]);
  });

  it('comentário sem identidade ou sem instante válido: leitura incompleta, nunca descarte silencioso; o motivo diz qual dos dois (A2 do review do B7a)', () => {
    for (const ruim of [coment(undefined, 2), coment(0, 2), coment('abc', 2), coment(1.5, 2), coment(null, 2)]) {
      const r = normalizarToque(entrada({ revisao: 1, comentarios: [coment(1, 1), ruim] }));
      expect(r).toMatchObject({ estado: 'leitura_incompleta', motivo: 'comentario_invalido', eventos: [] });
    }
    for (const ruim of [coment(7, undefined), { ...coment(7, 2), created_at: 'ontem' }]) {
      const r = normalizarToque(entrada({ revisao: 1, comentarios: [coment(1, 1), ruim] }));
      expect(r).toMatchObject({ estado: 'leitura_incompleta', motivo: 'instante_invalido', eventos: [] });
    }
  });
});

describe('normalizarToque: conferência da lista, casos de abuso 9 e 10 (R6-4)', () => {
  const motivo = (revisao: unknown, itens: unknown[]) => normalizarToque(entrada({ revisao, itensRevisao: itens }));
  const completo = (n: number) => Array.from({ length: n }, (_, i) => item(i + 1, i + 1));

  it('lista com buraco, repetição ou que não começa em 1: lista_com_buraco, nenhum evento', () => {
    for (const lista of [[item(1, 1), item(3, 2), item(4, 3)], [item(1, 1), item(2, 2), item(2, 3)], [item(2, 1), item(3, 2)], [item(1, 1), item(1, 2), item(2, 3)]]) {
      expect(motivo(5, lista), JSON.stringify(lista)).toMatchObject({ estado: 'leitura_incompleta', motivo: 'lista_com_buraco', eventos: [] });
    }
  });

  it('lista mais curta que revision - 1: lista_curta (inclusive vazia com revision >= 2); mais longa: lista_longa (inclusive não vazia com revision 1)', () => {
    expect(motivo(5, completo(2))).toMatchObject({ estado: 'leitura_incompleta', motivo: 'lista_curta', eventos: [] });
    expect(motivo(3, [])).toMatchObject({ motivo: 'lista_curta' });
    expect(motivo(3, completo(3))).toMatchObject({ motivo: 'lista_longa', eventos: [] });
    expect(motivo(1, completo(1))).toMatchObject({ motivo: 'lista_longa' });
  });

  it('item sem replaced_at, ou com instante inválido: instante_invalido (caso 10), nunca descarte', () => {
    for (const ruim of [undefined, 'amanhã', '2026-13-40T99:99:99Z']) {
      const lista = [item(1, 1), { revision: 2, replaced_at: ruim, user_id: 5 }];
      expect(motivo(3, lista), String(ruim)).toMatchObject({ estado: 'leitura_incompleta', motivo: 'instante_invalido', eventos: [] });
    }
    expect(motivo(2, [item(1, undefined)])).toMatchObject({ motivo: 'instante_invalido' });
  });

  it('item que não é objeto, ou sem revision inteiro positivo, e revision da listagem inválido: revisao_invalida', () => {
    for (const lista of [[null], ['x'], [{ revision: '1', replaced_at: iso(1) }], [{ replaced_at: iso(1) }], [{ revision: 0, replaced_at: iso(1) }], [{ revision: 1.5 }]]) {
      expect(motivo(2, lista), JSON.stringify(lista)).toMatchObject({ estado: 'leitura_incompleta', motivo: 'revisao_invalida', revisaoLida: 2 });
    }
    for (const revisao of [undefined, null, 0, -2, 1.5, '3', NaN]) {
      expect(motivo(revisao, completo(2))).toMatchObject({ estado: 'leitura_incompleta', motivo: 'revisao_invalida', revisaoLida: null });
    }
  });

  it('nunca vira "sem toque": todo card sem leitura completa sai como incompleto e sem evento', () => {
    const r = motivo(5, completo(2));
    expect(r.estado).not.toBe('lido');
    expect(r.eventos).toEqual([]);
  });

  it('chave desconhecida e todas as chaves da OpenAPI na lista: o resultado não carrega nada além dos escalares do evento', () => {
    const lista = [
      { revision: 1, replaced_at: iso(1), user_id: 1, title: MARCADOR, owner_user_id: 3, custom_fields: [{ value: MARCADOR }], desconhecida: MARCADOR },
      { revision: 2, replaced_at: iso(2), user_id: 2, realname: MARCADOR, email: EMAIL, desconhecida: MARCADOR },
    ];
    const r = motivo(3, lista);
    expect(Object.keys(r.eventos[0]!).sort()).toEqual(['contaComoToque', 'eventoId', 'ocorridoEm']);
    expect(JSON.stringify(r)).not.toContain(MARCADOR);
  });

  it('A3 e caso 7: autor de forma inválida (marcador em type e value) não produz erro nem deixa o marcador no resultado', () => {
    const r = normalizarToque(entrada({
      revisao: 1, comentarios: [coment(1, 2, MARCADOR, MARCADOR), coment(2, 3, 'internal', MARCADOR), coment(3, 4, 'external', EMAIL)],
    }));
    expect(r.estado).toBe('lido');
    expect(r.eventos.map((e) => e.contaComoToque)).toEqual([false, false, false]);
    expect(JSON.stringify(r)).not.toContain(MARCADOR);
  });
});
