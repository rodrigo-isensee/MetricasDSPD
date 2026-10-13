import type { ClienteLike, PoolLike } from '../src/plataforma/db/pool.js';

export type Chamada = { texto: string; valores: readonly unknown[] };
export type Resposta = unknown[] | { rows: unknown[]; rowCount?: number } | Error;
export type Respondedor = (c: Chamada) => Resposta;

/** Pool e cliente falsos: registram o SQL e os parâmetros e respondem por função. Sem rede, sem Postgres. */
export function criarDublePg(responder: Respondedor = () => []) {
  const chamadas: Chamada[] = [];
  const estado = { liberados: 0, destruidos: 0, conexoes: 0, encerrado: false };
  const query = (texto: string, valores: unknown[] = []) => {
    const c = { texto, valores };
    chamadas.push(c);
    const r = responder(c);
    if (r instanceof Error) return Promise.reject(r);
    const out = Array.isArray(r) ? { rows: r, rowCount: r.length } : { rowCount: r.rows.length, ...r };
    return Promise.resolve(out as { rows: never[]; rowCount: number });
  };
  const cliente: ClienteLike = { query, release: (destruir) => { estado.liberados++; if (destruir) estado.destruidos++; } };
  const pool: PoolLike = {
    query,
    connect: () => { estado.conexoes++; return Promise.resolve(cliente); },
    end: () => { estado.encerrado = true; return Promise.resolve(); },
  };
  return { pool, cliente, chamadas, estado };
}
