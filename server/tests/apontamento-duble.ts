import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

// Servidor falso do worklog do BusinessMap (pedido 059, K-193, plano de testes §8). Só 127.0.0.1, porta efêmera; ids, nomes e comentários
// inventados (marcadores de teste, ids na faixa 9 000 000 000+). O `GET /loggedTime` valida `fields` como a API v2, não pagina (o lote
// vem inteiro, até `per_page`: com mais registros, devolve só os primeiros, como o teto real), aplica `card_ids`, `from_date`, `to_date`
// e `logged_from`, e pode IGNORAR `fields` (devolve campos a mais, para a 2ª camada: a allow-list). `/loggedTime/history` responde 403
// (como a chave do dono no spike) e `/loggedTimeCategories` devolve um catálogo; os dois só contam o pedido (o cliente nunca os chama).

export type Registro = Record<string, unknown>;
export interface PedidoWorklog { metodo: string; caminho: string; consulta: URLSearchParams }

export interface CenarioWorklog {
  /** Todo o worklog da "conta" (o servidor filtra por card, data e registro). */
  registros: Registro[];
  /** `user_id` -> objeto que `/users` devolve (com e-mail e `attributes`, como a API real). */
  users: Record<string, Record<string, unknown>>;
  /** Caminho -> status forçado (`/loggedTime`, `/users`). */
  status: Record<string, number>;
  /** Devolve os campos a mais mesmo com `fields` (2ª camada da allow-list). */
  ignorarFields?: boolean;
  /** Corpo truncado na n-ésima chamada de `/loggedTime` (1 = primeira): JSON inválido. */
  truncarNaChamada?: number;
  /** Forma do corpo de `/loggedTime`: `{data:[...]}` (padrão) ou lista direta. */
  formaDireta?: boolean;
  /** Ids de card cujo lote sempre vem incompleto (5xx) quando pedido sozinho. */
  falharCards?: string[];
  /** Status forçado para um lote de cards (`undefined` = responde normal). */
  statusPorLote?: (cards: string[]) => number | undefined;
}
export const cenarioWorklogVazio = (): CenarioWorklog => ({ registros: [], users: {}, status: {} });

export interface ServidorWorklog {
  url: string;
  pedidos: PedidoWorklog[];
  cenario: CenarioWorklog;
  /** Pedidos a `/users` por `user_id` (para provar que a supressão não o chama). */
  usuariosPedidos: Map<string, number>;
  fechar: () => Promise<void>;
}

/** Valores de `fields` que a API v2 aceita no `/loggedTime` (os 12 pedidos, mais o que a doc lista). */
export const FIELDS_API_WORKLOG = new Set([
  'logged_time_id', 'parent_card_id', 'card_id', 'subtask_id', 'lane_id', 'column_id', 'user_id', 'category_id', 'date', 'time', 'comment', 'logged_at',
]);

export const MENSAGEM_400_WORKLOG = 'The query parameters did not pass validation';
const ids = (v: unknown): string => (typeof v === 'number' || typeof v === 'string' ? String(v) : '');

export async function subirServidorWorklog(cenario: CenarioWorklog = cenarioWorklogVazio()): Promise<ServidorWorklog> {
  const pedidos: PedidoWorklog[] = [];
  const usuariosPedidos = new Map<string, number>();
  let chamadas = 0;
  const server: Server = createServer((req, res) => {
    const u = new URL(req.url ?? '', 'http://x');
    pedidos.push({ metodo: req.method ?? '', caminho: u.pathname, consulta: u.searchParams });
    const enviar = (status: number, corpo: unknown): void => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(corpo));
    };
    const q = u.searchParams;
    if (u.pathname === '/loggedTime') {
      chamadas += 1;
      const forcado = cenario.status['/loggedTime'];
      if (forcado !== undefined) return enviar(forcado, {});
      const campos = (q.get('fields') ?? '').split(',').filter((c) => c !== '');
      const cards = (q.get('card_ids') ?? '').split(',').filter((c) => c !== '');
      if (!campos.every((c) => FIELDS_API_WORKLOG.has(c)) || cards.length === 0 || cards.length > 200) {
        return enviar(400, { error: { code: 'validation', message: MENSAGEM_400_WORKLOG } });
      }
      if (cards.length === 1 && (cenario.falharCards ?? []).includes(cards[0]!)) return enviar(500, {});
      const doLote = cenario.statusPorLote?.(cards);
      if (doLote !== undefined) return enviar(doLote, {});
      const de = q.get('from_date');
      const ate = q.get('to_date');
      const registrado = q.get('logged_from');
      const lote = cenario.registros.filter((r) =>
        (cards.includes(ids(r.card_id)) || cards.includes(ids(r.parent_card_id)))
        && (de === null || String(r.date) >= de) && (ate === null || String(r.date) <= ate)
        && (registrado === null || Date.parse(String(r.logged_at)) >= Date.parse(registrado)));
      const teto = Number(q.get('per_page') ?? '200');
      const itens = lote.slice(0, teto).map((r) => (cenario.ignorarFields === true ? r : Object.fromEntries(Object.entries(r).filter(([k]) => campos.includes(k)))));
      if (cenario.truncarNaChamada === chamadas) {
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end('{"data":[{"logged_time_id":');
      }
      return enviar(200, cenario.formaDireta === true ? itens : { data: itens });
    }
    if (u.pathname === '/loggedTime/history') return enviar(403, {});
    if (u.pathname === '/loggedTimeCategories') return enviar(200, { data: [{ category_id: 1, name: 'CATEGORIA-MARCADOR' }] });
    if (u.pathname === '/users') {
      const pedidos_ = (q.get('user_ids') ?? '').split(',').filter((i) => i !== '');
      for (const i of pedidos_) usuariosPedidos.set(i, (usuariosPedidos.get(i) ?? 0) + 1);
      if (cenario.status['/users'] !== undefined) return enviar(cenario.status['/users'], {});
      return enviar(200, { data: pedidos_.flatMap((i) => (cenario.users[i] === undefined ? [] : [cenario.users[i]])) });
    }
    return enviar(404, {});
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, pedidos, cenario, usuariosPedidos,
    fechar: async () => { server.closeAllConnections(); await new Promise<void>((ok) => server.close(() => ok())); },
  };
}

/** Registro de worklog como a API devolve (os 12 campos de `fields`), com valores sobrescrevíveis. */
let sequencia = 9_000_000_000;
export const registroWorklog = (extra: Registro = {}): Registro => ({
  logged_time_id: ++sequencia, card_id: 9_100_000_000, parent_card_id: null, subtask_id: null, lane_id: 9_200_000_001, column_id: 9_300_000_001,
  user_id: 9_400_000_001, category_id: null, date: '2026-10-20', time: 3600, comment: 'Reuniao de alinhamento', logged_at: '2026-10-20T14:00:00Z', ...extra,
});
