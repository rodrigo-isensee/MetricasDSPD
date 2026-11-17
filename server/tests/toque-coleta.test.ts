import { describe, expect, it } from 'vitest';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { ErroColetaBm } from '../src/modulos/businessmap/coleta.js';
import { coletarToque, TETO_TOQUE_POR_EXECUCAO, type DepsToque, type ModoToque } from '../src/modulos/businessmap/toque-coleta.js';
import { analisarArgumentosToque, executarCargaToque } from '../src/modulos/businessmap/toque-comando.js';
import { ErroBusinessMap } from '../src/plataforma/http.js';
import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

// Pedido 105, B7b (O22, ADR 0020 R6-4, R6-8 e R6-9): carga, portão e incremental do primeiro toque. API e banco falsos; nenhum valor de pessoa ou texto passa.
const S = montarEsquemas('');
const AGORA = new Date('2026-11-16T12:00:00Z');
const CRIADO = new Date('2026-11-01T10:00:00Z');
const MARCADOR = 'MARCADOR-COLETA-TOQUE-105';
const iso = (minuto: number): string => `2026-11-02T10:${String(minuto).padStart(2, '0')}:00Z`;

interface CardFalso { revisao: unknown; estado?: 'active' | 'archived' | 'discarded'; comentarios?: { id: number; minuto: number; tipo?: string }[]; revisoes?: number }
interface Cenario {
  cards: Record<string, CardFalso>;
  /** Caminho ou prefixo -> erro lançado pelo cliente. */
  erros?: Record<string, Error>;
  /** Ajusta o corpo de uma resposta. */
  corpos?: Record<string, unknown>;
  /** Revisões devolvidas na SEGUNDA chamada de listagem de um card (o card andou entre as leituras). */
  relida?: Record<string, number>;
}
const envelope = (data: unknown[]) => ({ data });

type Consulta = Record<string, string | number>;
function api(c: Cenario) {
  const pedidos: { caminho: string; consulta: Consulta }[] = [];
  const listagens = new Map<string, number>();
  const cliente: DepsToque['cliente'] = {
    get: ((caminho: string, opcoes?: { consulta?: Consulta }) => {
      const consulta = opcoes?.consulta ?? {};
      pedidos.push({ caminho, consulta });
      const erro = Object.entries(c.erros ?? {}).find(([p]) => caminho.startsWith(p) || (p === '/cards?state' && caminho === '/cards' && consulta.state !== undefined));
      if (erro !== undefined) return Promise.reject(erro[1]);
      if (c.corpos?.[caminho] !== undefined) return Promise.resolve(c.corpos[caminho]);
      if (caminho === '/cards') {
        const ids = String(consulta.card_ids).split(',');
        const estado = String(consulta.state ?? 'active');
        return Promise.resolve(envelope(ids.filter((id) => c.cards[id] !== undefined && (c.cards[id]!.estado ?? 'active') === estado).map((id) => {
          const n = (listagens.get(id) ?? 0) + 1;
          listagens.set(id, n);
          return { card_id: Number(id), revision: n > 1 && c.relida?.[id] !== undefined ? c.relida[id] : c.cards[id]!.revisao };
        })));
      }
      if (caminho === '/cards/comments') {
        const ids = String(consulta.card_ids).split(',');
        return Promise.resolve(envelope(ids.flatMap((id) => (c.cards[id]?.comentarios ?? []).map((m) => ({
          card_id: Number(id), comment_id: m.id, created_at: iso(m.minuto), text: MARCADOR, attachments: [MARCADOR], author: { type: m.tipo ?? 'internal', value: 5 },
        })))));
      }
      const rev = /^\/cards\/(\d+)\/revisions$/.exec(caminho);
      if (rev !== null) {
        const total = c.cards[rev[1]!]?.revisoes ?? Number(c.cards[rev[1]!]?.revisao) - 1;
        return Promise.resolve(envelope(Array.from({ length: total }, (_, i) => ({ revision: i + 1, replaced_at: iso(i + 1), user_id: 5 }))));
      }
      return Promise.reject(new Error('caminho inesperado'));
    }) as DepsToque['cliente']['get'],
  };
  return { cliente, pedidos };
}

interface LinhaFila { card_id: string; criado_em?: Date; arquivado?: boolean }
interface OpcoesBanco { fila?: LinhaFila[]; interrompidas?: string[]; falharEm?: string[]; travaOcupada?: boolean; estoque?: number }
function banco(op: OpcoesBanco = {}) {
  const linhas = (op.fila ?? []).map((l) => ({ card_id: l.card_id, criado_em: l.criado_em ?? CRIADO, arquivado: l.arquivado ?? false }));
  return criarDublePg((c: Chamada): Resposta => {
    if (op.falharEm?.some((t) => c.texto.includes(t)) === true) return new Error('banco caiu');
    if (c.texto.includes('pg_try_advisory_lock')) return [{ ok: op.travaOcupada !== true }];
    if (c.texto.includes("tarefa = 'carga_toque' AND status = 'em_andamento'")) return (op.interrompidas ?? []).map((coleta_id) => ({ coleta_id }));
    if (c.texto.includes('INSERT INTO dspd_bm.ctl_coleta (tarefa')) return [{ coleta_id: '9' }];
    if (c.texto.includes('ORDER BY random()')) return linhas.filter((l) => l.arquivado === c.valores[1]).slice(0, Number(c.valores[2]));
    if (c.texto.includes('FROM dspd_bm.dim_card c')) return linhas;
    if (c.texto.includes('INSERT INTO dspd_bm.stg_toque_instante')) return { rows: [], rowCount: (c.valores[1] as unknown[]).length };
    return [];
  });
}
const sqls = (chamadas: Chamada[], trecho: string): Chamada[] => chamadas.filter((c) => c.texto.includes(trecho));
const falhasGravadas = (chamadas: Chamada[]): unknown[][] => sqls(chamadas, 'INSERT INTO dspd_bm.ctl_coleta_falha').map((c) => [...c.valores]);
const deps = (c: Cenario, o: OpcoesBanco = {}, agora: () => Date = () => AGORA) => {
  const a = api(c);
  const b = banco(o);
  return { d: { cliente: a.cliente, pool: b.pool, S, hostBase: 'bm.exemplo.test', agora }, ...a, ...b };
};
const carga: ModoToque = { tipo: 'carga' };

describe('coletarToque: carga (R6-8)', () => {
  const cenario = (): Cenario => ({
    cards: {
      '1': { revisao: 1 },
      '2': { revisao: 3, comentarios: [{ id: 50, minuto: 30 }, { id: 51, minuto: 31, tipo: 'external' }] },
      '3': { revisao: 2, estado: 'archived' },
    },
  });
  const fila: LinhaFila[] = [{ card_id: '1' }, { card_id: '2' }, { card_id: '3', arquivado: true }];

  it('lê o lote (listagem ativa, arquivados em seguida, comentários em lote, revisões só de revision >= 2), grava por card e projeta o que foi lido', async () => {
    const { d, pedidos, chamadas } = deps(cenario(), { fila });
    const r = await coletarToque(d, carga);
    expect(pedidos.map((p) => `${p.caminho}${p.consulta.state === undefined ? '' : `?${String(p.consulta.state)}`}`)).toEqual([
      '/cards', '/cards?archived', '/cards/comments', '/cards/2/revisions', '/cards/3/revisions',
    ]);
    expect(pedidos[0]!.consulta).toEqual({ card_ids: '1,2,3', fields: 'card_id,revision', per_page: '200', page: 1 });
    expect(pedidos[1]!.consulta).toMatchObject({ card_ids: '3', state: 'archived' });
    expect(r).toMatchObject({
      coletaId: 9, modo: 'carga', estado: 'sucesso', parada: 'fim', candidatos: 3, pendentes: 0, chamadas: 5, lidos: 3, revisaoMaiorQueUm: 2, listaConfere: 2,
      autorPendente: 1, comentariosExternos: 1, eventosNovos: 3, falhas: 0, arquivadosNaFila: 1, arquivadosLidos: 1, errosEmArquivados: 0, portao: null,
    });
    const controle = sqls(chamadas, 'INSERT INTO dspd_bm.ctl_toque_leitura').map((c) => [c.valores[0], c.valores[2], c.valores[4], c.valores[5]]);
    expect(controle).toEqual([['1', 1, 'lido', null], ['2', 3, 'lido', null], ['3', 2, 'autor_pendente', null]]);
    const eventos = sqls(chamadas, 'INSERT INTO dspd_bm.stg_toque_instante').map((c) => [c.valores[0], c.valores[1], c.valores[3]]);
    expect(eventos).toEqual([['2', ['r2', 'c50', 'c51'], [true, true, false]]]);
    expect(sqls(chamadas, 'UPDATE dspd_bm.dim_card')[0]!.valores).toEqual([['1', '2', '3']]);
    const contagens = sqls(chamadas, 'INSERT INTO dspd_bm.ctl_coleta_contagem').map((c) => [c.valores[1], c.valores[2], c.valores[3], c.valores[4]]);
    expect(contagens).toEqual([['toque_card', 3, 3, 0], ['toque_evento', 3, 3, 0]]);
    expect(sqls(chamadas, 'UPDATE dspd_bm.ctl_coleta SET status')[0]!.valores).toEqual([9, 'sucesso', AGORA, null]);
  });

  it('a fila da carga: story que não é "Bug interno" criada nas últimas 12 semanas, sem linha vigente lido nem autor_pendente, e quem falhou vai para o fim', async () => {
    const { d, chamadas } = deps({ cards: {} }, {});
    await coletarToque(d, carga);
    const q = sqls(chamadas, 'FROM dspd_bm.dim_card c')[0]!;
    expect(q.texto).toContain("c.granularidade = 'story' AND c.tipo IS DISTINCT FROM 'Bug interno' AND c.criado_em >= $1");
    expect(q.texto).toContain("(l.estado IS NULL OR l.estado = 'leitura_incompleta')");
    expect(q.texto).toContain('ORDER BY COALESCE(f.n, 0), c.criado_em, c.card_id');
    expect(q.texto).toContain("entidade = 'toque'");
    expect(q.valores).toEqual([new Date('2026-08-24T12:00:00Z')]);
  });

  it('cards da listagem ausente em todos os estados: falha por código, o card segue não lido e a execução fecha parcial ou falha', async () => {
    const { d, chamadas, pedidos } = deps({ cards: { '1': { revisao: 1 } } }, { fila: [{ card_id: '1' }, { card_id: '8', arquivado: true }] });
    const r = await coletarToque(d, carga);
    expect(pedidos.filter((p) => p.caminho === '/cards').map((p) => p.consulta.state)).toEqual([undefined, 'archived', 'discarded']);
    expect(r).toMatchObject({ estado: 'parcial', lidos: 1, falhas: 1, errosEmArquivados: 1, pendentes: 0, errosPorCodigo: { toque_listagem_ausente: 1 } });
    expect(falhasGravadas(chamadas)).toEqual([[9, '8', 'toque_listagem_ausente']]);
    expect(sqls(chamadas, 'INSERT INTO dspd_bm.ctl_toque_leitura').map((c) => c.valores[0])).toEqual(['1']);
  });

  it('listagem ou comentários que falham por HTTP: um código por card, sem valor, o lote não para a execução', async () => {
    const lista = deps({ cards: { '1': { revisao: 2 }, '2': { revisao: 2 } }, erros: { '/cards/comments': new ErroBusinessMap('http', MARCADOR, 500) } }, { fila: [{ card_id: '1' }, { card_id: '2', arquivado: true }] });
    const a = await coletarToque(lista.d, carga);
    expect(a).toMatchObject({ estado: 'falha', lidos: 0, falhas: 2, errosEmArquivados: 1, errosPorCodigo: { toque_comentarios_http_500: 2 } });
    expect(JSON.stringify(lista.chamadas)).not.toContain(MARCADOR);
    const semLista = deps({ cards: { '1': { revisao: 2 } }, erros: { '/cards': new ErroBusinessMap('http', MARCADOR, 503) } }, { fila: [{ card_id: '1' }] });
    const b = await coletarToque(semLista.d, carga);
    expect(b).toMatchObject({ estado: 'falha', falhas: 1, errosPorCodigo: { toque_listagem_http_503: 1 } });
    expect(falhasGravadas(semLista.chamadas)).toEqual([[9, '1', 'toque_listagem_http_503']]);
  });

  it('revisões de um card que falham: o card fica não lido com o código e os outros seguem; a lista longa demais é falha do card, não parada', async () => {
    const c = { cards: { '1': { revisao: 3 }, '2': { revisao: 3 }, '3': { revisao: 3 } }, erros: { '/cards/1/revisions': new ErroBusinessMap('http', MARCADOR, 404) } } as Cenario;
    const x = deps(c, { fila: [{ card_id: '1' }, { card_id: '2' }, { card_id: '3' }] });
    const r = await coletarToque(x.d, carga);
    expect(r).toMatchObject({ estado: 'parcial', lidos: 2, falhas: 1, pendentes: 0, errosPorCodigo: { toque_revisoes_http_404: 1 } });
    expect(falhasGravadas(x.chamadas)).toEqual([[9, '1', 'toque_revisoes_http_404']]);
    const longa = deps({ cards: { '1': { revisao: 3 } }, erros: { '/cards/1/revisions': new ErroBusinessMap('limite-paginas-leitura', 'x') } }, { fila: [{ card_id: '1' }] });
    expect(await coletarToque(longa.d, carga)).toMatchObject({ estado: 'falha', parada: 'fim', errosPorCodigo: { 'toque_revisoes_limite-paginas-leitura': 1 } });
  });

  it('revision que não é inteiro positivo: leitura incompleta com motivo, sem gastar a chamada de revisões; resposta sem a chave vale o mesmo', async () => {
    const x = deps({ cards: { '1': { revisao: 'abc' }, '2': { revisao: undefined } } }, { fila: [{ card_id: '1' }, { card_id: '2' }] });
    const r = await coletarToque(x.d, carga);
    expect(r).toMatchObject({ estado: 'sucesso', lidos: 2, revisaoMaiorQueUm: 0, leituraIncompleta: { revisao_invalida: 2 } });
    expect(x.pedidos.filter((p) => p.caminho.endsWith('/revisions'))).toEqual([]);
    expect(sqls(x.chamadas, 'INSERT INTO dspd_bm.ctl_toque_leitura').map((c) => [c.valores[2], c.valores[4], c.valores[5]])).toEqual([[null, 'leitura_incompleta', 'revisao_invalida'], [null, 'leitura_incompleta', 'revisao_invalida']]);
  });

  it('lista curta: relê o revision do card uma vez e confere de novo; lista que não bate fica leitura_incompleta e fora da conta da lista', async () => {
    const x = deps({ cards: { '1': { revisao: 4, revisoes: 2 }, '2': { revisao: 4, revisoes: 2 } }, relida: { '1': 3 } }, { fila: [{ card_id: '1' }, { card_id: '2' }] });
    const r = await coletarToque(x.d, carga);
    expect(r).toMatchObject({ estado: 'sucesso', lidos: 2, revisaoMaiorQueUm: 2, listaConfere: 1, leituraIncompleta: { lista_curta: 1 } });
    expect(x.pedidos.filter((p) => p.caminho === '/cards' && p.consulta.card_ids === '1')).toHaveLength(1);
    expect(sqls(x.chamadas, 'INSERT INTO dspd_bm.ctl_toque_leitura').map((c) => [c.valores[0], c.valores[2], c.valores[4]])).toEqual([['1', 3, 'lido'], ['2', 4, 'leitura_incompleta']]);
    const semNovo = deps({ cards: { '1': { revisao: 4, revisoes: 2 } }, corpos: {} }, { fila: [{ card_id: '1' }] });
    expect((await coletarToque(semNovo.d, carga)).leituraIncompleta).toEqual({ lista_curta: 1 });
  });

  it('A3 do review do B7a: lote de comentários acima do teto de páginas se divide e o card que sozinho estoura fica com o código, sem parar a execução', async () => {
    const lerLote = deps({ cards: { '1': { revisao: 1 }, '2': { revisao: 1 } } }, { fila: [{ card_id: '1' }, { card_id: '2' }] });
    const original = lerLote.d.cliente.get;
    lerLote.d.cliente.get = ((caminho: string, o?: { consulta?: Record<string, string | number> }) =>
      caminho === '/cards/comments' && String(o?.consulta?.card_ids).includes('2') ? Promise.reject(new ErroBusinessMap('limite-paginas-leitura', 'x')) : original(caminho, o as never)) as never;
    const r = await coletarToque(lerLote.d, carga);
    expect(r).toMatchObject({ estado: 'parcial', parada: 'fim', lidos: 1, falhas: 1, errosPorCodigo: { 'toque_comentarios_limite-paginas-leitura': 1 } });
  });

  it('erro fatal da API (401) para a execução limpa: o que já foi lido fica gravado e projetado, o resto fica pendente', async () => {
    const x = deps({ cards: { '1': { revisao: 3 }, '2': { revisao: 3 } }, erros: { '/cards/2/revisions': new ErroBusinessMap('autenticacao', MARCADOR, 401) } }, { fila: [{ card_id: '1' }, { card_id: '2' }] });
    const r = await coletarToque(x.d, carga);
    expect(r).toMatchObject({ estado: 'parcial', parada: 'fatal', lidos: 1, falhas: 1, pendentes: 1, errosPorCodigo: { autenticacao: 1 } });
    expect(falhasGravadas(x.chamadas)).toEqual([[9, null, 'autenticacao']]);
    expect(sqls(x.chamadas, 'UPDATE dspd_bm.dim_card')[0]!.valores).toEqual([['1']]);
    expect(JSON.stringify([r, x.chamadas])).not.toContain(MARCADOR);
    const logoNoInicio = deps({ cards: { '1': { revisao: 1 } }, erros: { '/cards': new ErroBusinessMap('limite-requisicoes', 'x') } }, { fila: [{ card_id: '1' }] });
    expect(await coletarToque(logoNoInicio.d, carga)).toMatchObject({ estado: 'falha', parada: 'fatal', lidos: 0, pendentes: 1 });
  });

  it('fim da janela: termina o card corrente, grava e sai limpo; janela já esgotada antes do lote não faz chamada nenhuma', async () => {
    const cards = { '1': { revisao: 2 }, '2': { revisao: 2 }, '3': { revisao: 2 } };
    const x = deps({ cards }, { fila: [{ card_id: '1' }, { card_id: '2' }, { card_id: '3' }] });
    x.d.agora = () => new Date(AGORA.getTime() + x.pedidos.length * 13 * 60_000);
    const r = await coletarToque(x.d, { tipo: 'carga', janelaMin: 50 });
    expect(r).toMatchObject({ estado: 'sucesso', parada: 'janela', lidos: 2, pendentes: 1 });
    expect(sqls(x.chamadas, 'INSERT INTO dspd_bm.ctl_toque_leitura').map((c) => c.valores[0])).toEqual(['1', '2']);
    expect(sqls(x.chamadas, 'UPDATE dspd_bm.dim_card')[0]!.valores).toEqual([['1', '2']]);
    const zero = deps({ cards: { '1': { revisao: 1 } } }, { fila: [{ card_id: '1' }] });
    expect(await coletarToque(zero.d, { tipo: 'carga', janelaMin: 0 })).toMatchObject({ parada: 'janela', lidos: 0, pendentes: 1, chamadas: 0 });
  });

  it('resposta de comentário fora da forma: contada por caminho e registrada só com o código e o caminho do campo', async () => {
    const x = deps({ cards: { '1': { revisao: 1 } }, corpos: { '/cards/comments': envelope([{ card_id: 99, comment_id: 1, created_at: iso(1) }, 'lixo']) } }, { fila: [{ card_id: '1' }] });
    const r = await coletarToque(x.d, carga);
    expect(r.formaPorCaminho).toEqual({ 'comments[].card_id': 1, 'comments[]': 1 });
    expect(falhasGravadas(x.chamadas).map((l) => l[2])).toEqual(['toque_forma comments[].card_id', 'toque_forma comments[]']);
    expect(r.estado).toBe('sucesso');
  });

  it('execução anterior que morreu sem fechar é fechada como falha, sem apagar nada', async () => {
    const x = deps({ cards: {} }, { interrompidas: ['4'] });
    await coletarToque(x.d, carga);
    const fechamentos = sqls(x.chamadas, 'UPDATE dspd_bm.ctl_coleta SET status');
    expect(fechamentos.map((c) => [c.valores[0], c.valores[1]])).toEqual([['4', 'falha'], [9, 'sucesso']]);
    expect(fechamentos[0]!.valores[3]).toBe('desconhecido: execução anterior interrompida');
  });

  it('sem esquemas no dep, usa os do ambiente; item da listagem fora da forma ou de card que não foi pedido é ignorado', async () => {
    const x = deps({ cards: { '1': { revisao: 1 } }, corpos: { '/cards': envelope([{ card_id: 1, revision: 1 }, { card_id: 99, revision: 5 }, { card_id: 'x', revision: 1 }, 'lixo', null]) } }, { fila: [{ card_id: '1' }] });
    const r = await coletarToque({ cliente: x.d.cliente, pool: x.d.pool, hostBase: x.d.hostBase, agora: x.d.agora }, carga);
    expect(r).toMatchObject({ estado: 'sucesso', lidos: 1, falhas: 0 });
    expect(sqls(x.chamadas, 'INSERT INTO dspd_bm.ctl_toque_leitura')).toHaveLength(1);
  });

  it('a segunda listagem (releitura do revision) que não traz o card ou traz valor fora da forma mantém a primeira leitura', async () => {
    const x = deps({ cards: { '1': { revisao: 4, revisoes: 2 } }, relida: { '1': 'abc' as never } }, { fila: [{ card_id: '1' }] });
    const r = await coletarToque(x.d, carga);
    expect(r).toMatchObject({ lidos: 1, leituraIncompleta: { lista_curta: 1 } });
    const y = deps({ cards: { '1': { revisao: 4, revisoes: 2 } } }, { fila: [{ card_id: '1' }] });
    const original = y.d.cliente.get;
    let listagens = 0;
    y.d.cliente.get = ((caminho: string, o?: { consulta?: Record<string, string | number> }) =>
      caminho === '/cards' && (listagens += 1) > 1 ? Promise.resolve(envelope([])) : original(caminho, o as never)) as never;
    expect(await coletarToque(y.d, carga)).toMatchObject({ estado: 'sucesso', lidos: 1, leituraIncompleta: { lista_curta: 1 } });
  });

  it('erro de banco fecha a coleta como falha sem a mensagem e repassa; se nem o fechamento der, o erro original segue', async () => {
    const x = deps({ cards: { '1': { revisao: 1 } } }, { fila: [{ card_id: '1' }], falharEm: ['INSERT INTO dspd_bm.ctl_toque_leitura'] });
    await expect(coletarToque(x.d, carga)).rejects.toThrow('banco caiu');
    expect(sqls(x.chamadas, 'UPDATE dspd_bm.ctl_coleta SET status').at(-1)!.valores).toEqual([9, 'falha', AGORA, 'desconhecido: erro-interno']);
    const sem = deps({ cards: { '1': { revisao: 1 } } }, { fila: [{ card_id: '1' }], falharEm: ['INSERT INTO dspd_bm.ctl_toque_leitura', 'UPDATE dspd_bm.ctl_coleta SET status'] });
    await expect(coletarToque(sem.d, carga)).rejects.toThrow('banco caiu');
  });
});

describe('coletarToque: incremental com teto (R6-9)', () => {
  it('a fila por prioridade: sem controle, autor_pendente ou sem_toque com revision que subiu, leitura_incompleta e abertos sem toque; com_toque nunca', async () => {
    const { d, chamadas } = deps({ cards: {} }, {});
    await coletarToque(d, { tipo: 'incremental' });
    const t = sqls(chamadas, 'prioridade')[0]!.texto;
    expect(t).toContain("WHEN l.estado IS NULL THEN 1");
    expect(t).toContain("c.toque_situacao IN ('autor_pendente', 'sem_toque') AND r.revisao_atual > l.revisao_lida THEN 2");
    expect(t).toContain("WHEN l.estado = 'leitura_incompleta' THEN 3");
    expect(t).toContain("c.concluido_em IS NULL AND NOT (c.arquivado_em IS NOT NULL OR c.excluido_em IS NOT NULL OR c.motivo_descarte IS NOT NULL) THEN 4");
    expect(t).toContain('ORDER BY prioridade, falhas, lido_em NULLS FIRST, criado_em, card_id');
    expect(t).not.toContain("'com_toque'");
    expect(t).toContain("stg_card WHERE id_origem = c.card_id ORDER BY stg_sk DESC LIMIT 1");
  });

  it('o teto de chamadas para a execução sem falhar a coleta: o que sobra fica para a seguinte', async () => {
    const cards: Record<string, CardFalso> = {};
    for (let i = 1; i <= 6; i += 1) cards[String(i)] = { revisao: 3 };
    const x = deps({ cards }, { fila: Object.keys(cards).map((card_id) => ({ card_id })) });
    const r = await coletarToque(x.d, { tipo: 'incremental', teto: 5 });
    // listagem (1) + comentários (1) + 1 revisão por card: o teto de 5 chamadas fecha depois do 3º card
    expect(r).toMatchObject({ modo: 'incremental', estado: 'sucesso', parada: 'teto', lidos: 3, pendentes: 3, chamadas: 5 });
    expect(x.pedidos.filter((p) => p.caminho === '/cards' && p.consulta.card_ids !== undefined).map((p) => p.consulta.card_ids)).toEqual(['1,2,3,4,5']);
    expect(sqls(x.chamadas, 'ctl_coleta (tarefa')[0]!.valores[2]).toContain('"teto":5');
  });

  it('o teto padrão é 150 e, esgotado antes do lote seguinte, a execução para sem nova chamada', async () => {
    expect(TETO_TOQUE_POR_EXECUCAO).toBe(150);
    const cards: Record<string, CardFalso> = { '1': { revisao: 1 }, '2': { revisao: 1 } };
    const x = deps({ cards }, { fila: [{ card_id: '1' }, { card_id: '2' }] });
    const r = await coletarToque(x.d, { tipo: 'incremental', teto: 2 });
    expect(r).toMatchObject({ estado: 'sucesso', parada: 'teto', lidos: 0, pendentes: 2, chamadas: 2 });
    const padrao = deps({ cards }, { fila: [{ card_id: '1' }, { card_id: '2' }] });
    expect(await coletarToque(padrao.d, { tipo: 'incremental' })).toMatchObject({ parada: 'fim', lidos: 2 });
    expect(sqls(padrao.chamadas, 'ctl_coleta (tarefa')[0]!.valores[2]).toContain('"teto":150');
    const lote = deps({ cards }, { fila: [{ card_id: '1' }, { card_id: '2' }] });
    expect(await coletarToque(lote.d, { tipo: 'incremental', teto: 1 })).toMatchObject({ parada: 'teto', chamadas: 2, lidos: 0 });
  });
});

describe('coletarToque: portão de carga (R6-8)', () => {
  const cenario = (): Cenario => ({ cards: { '1': { revisao: 3 }, '2': { revisao: 2 }, '3': { revisao: 2, estado: 'archived' }, '4': { revisao: 3, estado: 'discarded' } } });
  const fila: LinhaFila[] = [{ card_id: '1' }, { card_id: '2' }, { card_id: '3', arquivado: true }, { card_id: '4', arquivado: true }];

  it('sorteia metade arquivada ou descartada e a outra metade do resto; aprova com a lista conferindo, zero erro nos arquivados e a amostra toda lida', async () => {
    const x = deps(cenario(), { fila });
    const r = await coletarToque(x.d, { tipo: 'portao', amostra: 4 });
    const sorteios = sqls(x.chamadas, 'ORDER BY random()').map((c) => [c.valores[1], c.valores[2]]);
    expect(sorteios).toEqual([[true, 2], [false, 2]]);
    expect(r).toMatchObject({ modo: 'portao', estado: 'sucesso', candidatos: 4, lidos: 4, revisaoMaiorQueUm: 4, listaConfere: 4, arquivadosNaFila: 2, errosEmArquivados: 0, portao: { passou: true, motivos: [] } });
    expect(sqls(x.chamadas, 'ctl_coleta (tarefa')[0]!.valores[2]).toContain('"amostra":4');
  });

  it('reprova: lista diferente de revision - 1, erro em arquivado, amostra sem metade arquivada ou não lida por inteiro; amostra padrão é 50', async () => {
    const c = cenario();
    c.cards['2']!.revisoes = 5;
    const lista = deps(c, { fila });
    expect((await coletarToque(lista.d, { tipo: 'portao', amostra: 4 })).portao).toEqual({ passou: false, motivos: ['lista_diferente_de_revision_menos_1'] });
    const arq = deps({ ...cenario(), erros: { '/cards/3/revisions': new ErroBusinessMap('http', 'x', 404) } }, { fila });
    expect((await coletarToque(arq.d, { tipo: 'portao', amostra: 4 })).portao).toEqual({ passou: false, motivos: ['amostra_nao_lida_por_inteiro', 'erro_em_arquivado'] });
    const poucos = deps(cenario(), { fila: fila.slice(0, 3) });
    expect((await coletarToque(poucos.d, { tipo: 'portao', amostra: 4 })).portao).toEqual({ passou: false, motivos: ['amostra_sem_metade_arquivada'] });
    const padrao = deps({ cards: {} }, {});
    await coletarToque(padrao.d, { tipo: 'portao' });
    expect(sqls(padrao.chamadas, 'ORDER BY random()').map((c) => c.valores[2])).toEqual([25, 25]);
  });
});

describe('bm:carga-toque: argumentos e trava', () => {
  it('sem argumento é a carga com janela de 60 minutos; --janela e --amostra com limites; o resto é recusado sem eco', () => {
    expect(analisarArgumentosToque([])).toEqual({ tipo: 'carga', janelaMin: 60 });
    expect(analisarArgumentosToque(['--janela=5'])).toEqual({ tipo: 'carga', janelaMin: 5 });
    expect(analisarArgumentosToque(['--janela=600'])).toEqual({ tipo: 'carga', janelaMin: 600 });
    expect(analisarArgumentosToque(['--amostra'])).toEqual({ tipo: 'portao', amostra: 50 });
    expect(analisarArgumentosToque(['--amostra=10'])).toEqual({ tipo: 'portao', amostra: 10 });
    for (const ruim of [['--janela=0'], ['--janela=601'], ['--janela=abc'], ['--amostra=3'], ['--amostra=0'], ['--amostra=202'], ['--amostra=x'], ['--outra'], ['--janela=5', '--amostra'], [MARCADOR]]) {
      let erro: unknown;
      try { analisarArgumentosToque(ruim); } catch (e) { erro = e; }
      expect(erro, ruim.join(' ')).toBeInstanceOf(ErroColetaBm);
      expect((erro as ErroColetaBm).codigo).toBe('uso');
      expect((erro as ErroColetaBm).message).not.toContain(MARCADOR);
    }
  });

  it('roda sob a trava da fonte; sem a trava, recusa', async () => {
    const livre = deps({ cards: {} }, {});
    expect(await executarCargaToque(livre.d, carga)).toMatchObject({ estado: 'sucesso' });
    expect(sqls(livre.chamadas, 'pg_try_advisory_lock')).toHaveLength(1);
    const ocupada = deps({ cards: {} }, { travaOcupada: true });
    await expect(executarCargaToque(ocupada.d, carga)).rejects.toMatchObject({ codigo: 'trava' });
    expect(sqls(ocupada.chamadas, 'ctl_coleta (tarefa')).toHaveLength(0);
  });
});
