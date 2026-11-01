import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

// Servidor falso do BusinessMap e banco falso da F3 (plano 052, K-182). Nenhuma chamada ao BusinessMap real; ids, nomes, e-mails e
// campos customizados são inventados (marcadores de teste). O servidor aplica os filtros de data e a paginação como a API faz.

export type Cartao = Record<string, unknown>;
export interface Pedido { metodo: string; caminho: string; consulta: URLSearchParams }
export interface Cenario {
  /** `quadro|estado` -> cards devolvidos (antes dos filtros de data). */
  cards: Record<string, Cartao[]>;
  porPagina: number;
  /** `user_id` -> objeto completo que a API devolve (com e-mail, `attributes` etc.). */
  users: Record<string, Record<string, unknown>>;
  /** `quadro|estado` ou `users` -> status HTTP forçado. */
  status: Record<string, number>;
  /** Corpos por caminho (referência: estrutura, workflows, tipos). */
  corpos: Record<string, unknown>;
  /** A resposta de /cards vem como lista simples, sem o bloco de paginação. */
  semPaginacao?: boolean;
}
export const cenarioVazio = (): Cenario => ({ cards: {}, porPagina: 100, users: {}, status: {}, corpos: {} });

export interface ServidorBm { url: string; pedidos: Pedido[]; cenario: Cenario; fechar: () => Promise<void> }

const quando = (v: unknown): number => (typeof v === 'string' ? Date.parse(v) : Number.NEGATIVE_INFINITY);

/**
 * Validação de consulta como a API v2 (E2.83, falha da carga real de 2026-11-01): os valores aceitos de `fields` e `expand` são os
 * enums do `GET /cards` da OpenAPI pública da API v2; fora deles, ou filtro de data sem hora, a API responde 400
 * "The query parameters did not pass validation". `co_owner_ids` é valor de `expand`, não de `fields`.
 */
export const FIELDS_API_CARDS = new Set([
  'card_id', 'title', 'description', 'custom_id', 'owner_user_id', 'type_id', 'size', 'priority', 'color', 'deadline', 'reporter',
  'created_at', 'revision', 'last_modified', 'in_current_position_since', 'board_id', 'workflow_id', 'column_id', 'lane_id', 'section',
  'position', 'last_column_id', 'last_lane_id', 'version_id', 'archived_at', 'reason_id', 'discard_comment', 'discarded_at',
  'is_blocked', 'block_reason', 'current_block_time', 'current_logged_time', 'current_cycle_time', 'child_card_stats',
  'finished_subtask_count', 'unfinished_subtask_count', 'comment_count', 'last_comment', 'first_request_time', 'first_start_time',
  'first_end_time', 'last_request_time', 'last_start_time', 'last_end_time',
]);
export const EXPAND_API_CARDS = new Set([
  'custom_fields', 'stickers', 'tag_ids', 'milestone_ids', 'co_owner_ids', 'watcher_ids', 'attachments', 'cover_image',
  'checked_column_checklist_items', 'initiative_details', 'annotations', 'subtasks', 'linked_cards', 'transitions', 'block_times',
  'logged_times', 'logged_times_for_child_cards', 'lead_time_per_column', 'card_outcomes', 'last_comment',
]);
/** Filtros `*_from`/`*_to` com data e hora (a API real aceita `AAAA-MM-DDT00:00:00Z`; a data pura vai pelo `*_date`). */
const COM_HORA = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}Z?$/;
const FILTROS_DATA = ['archived_from', 'archived_to', 'discarded_from', 'discarded_to', 'last_modified_from', 'last_modified_to'];
export const MENSAGEM_400 = 'The query parameters did not pass validation';

/** `true` se a API real aceitaria a consulta de `/cards`. */
export function consultaValida(q: URLSearchParams): boolean {
  const lista = (nome: string): string[] => (q.get(nome) ?? '').split(',').filter((x) => x !== '');
  if (!lista('fields').every((f) => FIELDS_API_CARDS.has(f))) return false;
  if (!lista('expand').every((e) => EXPAND_API_CARDS.has(e))) return false;
  return FILTROS_DATA.every((f) => !q.has(f) || COM_HORA.test(q.get(f)!));
}

/** `co_owner_ids` só vem com `expand=co_owner_ids` (como a API): sem ele, o card sai sem a chave. */
function expandir(card: Cartao, q: URLSearchParams): Cartao {
  if ((q.get('expand') ?? '').split(',').includes('co_owner_ids')) return card;
  return Object.fromEntries(Object.entries(card).filter(([k]) => k !== 'co_owner_ids'));
}

/** Aplica o filtro de data do pedido como a API: `archived_from` só no estado archived, `discarded_from` no discarded, `last_modified_from` em todos. */
function filtrar(cards: Cartao[], estado: string, q: URLSearchParams): Cartao[] {
  const af = q.get('archived_from');
  const df = q.get('discarded_from');
  const lm = q.get('last_modified_from');
  return cards.filter((c) =>
    (af === null || estado !== 'archived' || quando(c.archived_at) >= Date.parse(af))
    && (df === null || estado !== 'discarded' || quando(c.discarded_at) >= Date.parse(df))
    && (lm === null || quando(c.last_modified) >= Date.parse(lm)));
}

export async function subirServidorBm(cenario: Cenario = cenarioVazio()): Promise<ServidorBm> {
  const pedidos: Pedido[] = [];
  const server: Server = createServer((req, res) => {
    const u = new URL(req.url ?? '', 'http://x');
    pedidos.push({ metodo: req.method ?? '', caminho: u.pathname, consulta: u.searchParams });
    const enviar = (status: number, corpo: unknown): void => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(corpo));
    };
    if (u.pathname === '/cards') {
      const estado = u.searchParams.get('state') ?? '';
      const chave = `${u.searchParams.get('board_ids')}|${estado}`;
      const forcado = cenario.status[chave];
      if (forcado !== undefined) return enviar(forcado, {});
      if (!consultaValida(u.searchParams)) return enviar(400, { error: { code: 'validation', message: MENSAGEM_400 } });
      const todos = filtrar(cenario.cards[chave] ?? [], estado, u.searchParams).map((c) => expandir(c, u.searchParams));
      const pagina = Number(u.searchParams.get('page') ?? '1');
      const paginas = Math.max(1, Math.ceil(todos.length / cenario.porPagina));
      const itens = todos.slice((pagina - 1) * cenario.porPagina, pagina * cenario.porPagina);
      return enviar(200, cenario.semPaginacao === true ? { data: itens } : { data: { data: itens, pagination: { all_pages: paginas, current_page: pagina } } });
    }
    if (u.pathname === '/users') {
      if (cenario.status.users !== undefined) return enviar(cenario.status.users, {});
      const ids = (u.searchParams.get('user_ids') ?? '').split(',');
      // a API devolve o objeto inteiro (com `attributes`), mesmo com `fields`
      return enviar(200, { data: ids.flatMap((i) => (cenario.users[i] === undefined ? [] : [cenario.users[i]])) });
    }
    const corpo = cenario.corpos[u.pathname];
    return enviar(corpo === undefined ? 404 : 200, corpo ?? {});
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, pedidos, cenario,
    fechar: async () => { server.closeAllConnections(); await new Promise<void>((ok) => server.close(() => ok())); },
  };
}

export interface OpcoesBanco {
  /** `ctl_coleta` interrompidas (em andamento) de uma execução anterior. */
  interrompidas?: string[];
  ultimaCarga?: { status: string; parametros: unknown };
  marca?: Date | null;
  /** ids de responsável com linha recente em `dim_responsavel`. */
  frescos?: string[];
  /** Falha o INSERT em `stg_card` (erro de banco). */
  falharAoGravar?: boolean;
  /** Outra coleta do BusinessMap segura a trava da fonte. */
  travaOcupada?: boolean;
  coletaId?: string;
}

export interface EstadoBanco {
  aberta?: { params: readonly unknown[]; parametros: Record<string, unknown> };
  stg: { idOrigem: string; quadro: string; arquivado: boolean; payload: string; coleta: unknown }[];
  revisoes: { cardId: string; revisionId: string; payload: string; coleta: unknown }[];
  checkpoints: { chave: string; ultima: number; total: number }[];
  falhas: { entidade: string; idOrigem: unknown; erro: string }[];
  contagens: { entidade: string; lidos: number; inseridos: number; jaExistentes: number; falhas: number }[];
  usuarios: { ids: string[]; nomes: string[]; agora: unknown }[];
  marca?: { coletaId: unknown; ate: unknown };
  fechamentos: { coletaId: unknown; status: unknown; erro: unknown }[];
}

/** Banco falso, com estado, para `coletarCards`. Responde pelo texto do SQL (as consultas são as do módulo). */
export function bancoFalso(op: OpcoesBanco = {}) {
  const estado: EstadoBanco = { stg: [], revisoes: [], checkpoints: [], falhas: [], contagens: [], usuarios: [], fechamentos: [] };
  let sk = 100;
  const ultimas = new Map<string, { stg_sk: string; payload_sha256: Buffer }>();
  const responder = (c: Chamada): Resposta => {
    const t = c.texto;
    const v = c.valores;
    if (t.includes('pg_try_advisory_lock')) return [{ ok: op.travaOcupada !== true }];
    if (t.includes("status = 'em_andamento' AND versao_coletor")) return (op.interrompidas ?? []).map((coleta_id) => ({ coleta_id }));
    if (t.includes("parametros ->> 'tipo' = 'carga_inicial'")) return op.ultimaCarga === undefined ? [] : [op.ultimaCarga];
    if (t.includes('max(marca_dagua_ate)')) return [{ marca: op.marca ?? null }];
    // F4: o projetor roda na mesma execução (`--projetar`) e lê o que a coleta acabou de gravar no staging
    if (t.includes("'projecao'")) return [{ coleta_id: '88' }];
    if (t.startsWith('SELECT DISTINCT id_origem')) return [...new Set(estado.stg.map((x) => x.idOrigem))].filter((i) => i > (v[0] as string)).sort().map((id_origem) => ({ id_origem }));
    if (t.includes('SELECT DISTINCT ON (id_origem) stg_sk, id_origem, payload')) {
      return estado.stg.filter((x) => (v[0] as string[]).includes(x.idOrigem))
        .map((x, i) => ({ stg_sk: String(500 + i), id_origem: x.idOrigem, payload: JSON.parse(x.payload) as unknown, excluido_detectado: false, coletado_em: new Date('2026-11-02T12:00:00Z') }));
    }
    if (t.startsWith('INSERT INTO dspd_bm.ctl_coleta (')) {
      estado.aberta = { params: v, parametros: JSON.parse(v[4] as string) as Record<string, unknown> };
      return [{ coleta_id: op.coletaId ?? '77' }];
    }
    if (t.includes('FROM dspd_bm.stg_card WHERE id_origem')) {
      const u = ultimas.get(v[0] as string);
      return u === undefined ? [] : [u];
    }
    if (t.startsWith('INSERT INTO dspd_bm.stg_card')) {
      if (op.falharAoGravar === true) return new Error('falha simulada do banco');
      sk += 1;
      ultimas.set(v[0] as string, { stg_sk: String(sk), payload_sha256: v[2] as Buffer });
      estado.stg.push({ idOrigem: v[0] as string, quadro: v[4] as string, arquivado: v[5] as boolean, payload: v[3] as string, coleta: v[8] });
      return [{ stg_sk: String(sk) }];
    }
    if (t.startsWith('INSERT INTO dspd_bm.stg_revision')) {
      // UNIQUE (card_id, revision_id) com ON CONFLICT DO NOTHING
      if (estado.revisoes.some((r) => r.cardId === v[0] && r.revisionId === v[1])) return [];
      estado.revisoes.push({ cardId: v[0] as string, revisionId: v[1] as string, payload: v[3] as string, coleta: v[5] });
      return [{ revision_sk: String(estado.revisoes.length) }];
    }
    if (t.includes("SET parametros = jsonb_set(parametros, ARRAY['paginas'")) {
      estado.checkpoints.push({ chave: v[1] as string, ultima: v[2] as number, total: v[3] as number });
      return [];
    }
    if (t.startsWith('INSERT INTO dspd_bm.ctl_coleta_falha')) {
      estado.falhas.push({ entidade: v[1] as string, idOrigem: v[2], erro: v[3] as string });
      return [];
    }
    if (t.startsWith('INSERT INTO dspd_bm.ctl_coleta_contagem')) {
      estado.contagens.push({ entidade: v[1] as string, lidos: v[2] as number, inseridos: v[3] as number, jaExistentes: v[4] as number, falhas: v[5] as number });
      return [];
    }
    if (t.includes('FROM dspd_bm.dim_responsavel WHERE')) return (op.frescos ?? []).map((responsavel_id) => ({ responsavel_id }));
    if (t.startsWith('INSERT INTO dspd_bm.dim_responsavel')) {
      estado.usuarios.push({ ids: v[0] as string[], nomes: v[1] as string[], agora: v[2] });
      return [];
    }
    if (t.includes('SET marca_dagua_ate')) {
      estado.marca = { coletaId: v[0], ate: v[1] };
      return [];
    }
    if (t.includes('SET status = $2, finalizado_em')) {
      estado.fechamentos.push({ coletaId: v[0], status: v[1], erro: v[3] });
      return { rows: [], rowCount: 1 };
    }
    if (t.includes('INSERT INTO dspd_core.outbox')) return [{ evento_id: '1' }];
    return [];
  };
  return { ...criarDublePg(responder), estado };
}
