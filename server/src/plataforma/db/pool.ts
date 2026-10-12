import pg from 'pg';

/** Mínimo que os repositórios usam: aceita `pg.Pool`, `pg.PoolClient` e dublês de teste. */
export interface Consultavel {
  query<R extends pg.QueryResultRow = pg.QueryResultRow>(
    texto: string,
    valores?: unknown[],
  ): Promise<{ rows: R[]; rowCount: number | null }>;
}
export interface ClienteLike extends Consultavel {
  /** `true` (ou um erro) destrói a conexão em vez de devolvê-la ao pool; usado quando o estado da sessão é incerto. */
  release(destruir?: boolean | Error): void;
}
export interface PoolLike extends Consultavel {
  connect(): Promise<ClienteLike>;
  end(): Promise<void>;
}

/** Tipos do banco -> TS, definidos num lugar só: int8 e numeric ficam string (nunca number sem verificação), date fica 'AAAA-MM-DD'. */
const OID = { int8: 20, date: 1082, numeric: 1700 } as const;
export const interpretadores = {
  [OID.int8]: (v: string): string => v,
  [OID.numeric]: (v: string): string => v,
  [OID.date]: (v: string): string => v,
} as const;
export const tipos = {
  getTypeParser: (oid: number, formato?: 'text' | 'binary') => {
    const p = (interpretadores as Record<number, ((v: string) => string) | undefined>)[oid];
    return p ?? pg.types.getTypeParser(oid, formato as 'text');
  },
};

export type OpcoesPool = {
  statementTimeoutMs?: number;
  lockTimeoutMs?: number;
  idleInTransactionTimeoutMs?: number;
  connectionTimeoutMs?: number;
  max?: number;
  /** Nome que aparece em `pg_stat_activity`; padrão `dspd-<papel>` a partir do usuário da URL. */
  aplicacao?: string;
};

/** Padrões de C3 (auditoria do banco): nenhuma sessão espera para sempre por lock, conexão ou transação parada. */
export const TIMEOUTS_PADRAO = { statementMs: 30_000, lockMs: 5_000, idleInTransactionMs: 30_000, conexaoMs: 5_000 } as const;

/** Um Pool por papel (ADR 0014). Sessão em UTC; timeouts de statement, lock, transação ociosa e conexão por pool. */
export function criarPool(url: string, opcoes: OpcoesPool = {}): pg.Pool {
  const {
    statementTimeoutMs = TIMEOUTS_PADRAO.statementMs, lockTimeoutMs = TIMEOUTS_PADRAO.lockMs,
    idleInTransactionTimeoutMs = TIMEOUTS_PADRAO.idleInTransactionMs, connectionTimeoutMs = TIMEOUTS_PADRAO.conexaoMs,
    max = 10, aplicacao = `dspd-${decodeURIComponent(new URL(url).username).replace(/^dspd_/, '')}`,
  } = opcoes;
  const pool = new pg.Pool({
    connectionString: url, max, types: tipos, statement_timeout: statementTimeoutMs, lock_timeout: lockTimeoutMs,
    idle_in_transaction_session_timeout: idleInTransactionTimeoutMs, connectionTimeoutMillis: connectionTimeoutMs,
    application_name: aplicacao, options: '-c TimeZone=UTC',
  });
  // Conexão ociosa derrubada pelo servidor (restart, idle_in_transaction, terminate): o pool já a descarta; sem ouvinte o
  // `error` do EventEmitter derrubaria o processo inteiro.
  pool.on('error', () => undefined);
  // Idem para a conexão emprestada: um `error` assíncrono (backend morto) fora de uma query não pode derrubar o processo;
  // a query em andamento (se houver) já rejeita, e `release(true)` descarta a conexão.
  pool.on('connect', (c) => { c.on('error', () => undefined); });
  return pool;
}

/** BEGIN/COMMIT; qualquer erro faz ROLLBACK e é repassado. O cliente sempre volta ao pool. */
export async function emTransacao<T>(pool: PoolLike, fn: (cliente: Consultavel) => Promise<T>): Promise<T> {
  const cliente = await pool.connect();
  let destruir = false;
  try {
    await cliente.query('BEGIN');
    const r = await fn(cliente);
    await cliente.query('COMMIT');
    return r;
  } catch (e) {
    // Se o ROLLBACK também falhar, a sessão está em estado incerto: destrói a conexão e preserva o erro original.
    await cliente.query('ROLLBACK').catch(() => { destruir = true; });
    throw e;
  } finally {
    cliente.release(destruir);
  }
}

/** SQLSTATE 23505 (unique_violation). Idempotência usa ON CONFLICT; isto serve a quem precisa distinguir o erro. */
export const ehDuplicado = (e: unknown): boolean =>
  typeof e === 'object' && e !== null && (e as { code?: string }).code === '23505';

/** Substitui usuário e senha de uma URL (testes por papel). */
export function urlDoPapel(urlBase: string, papel: string, senha: string): string {
  const u = new URL(urlBase);
  u.username = papel;
  u.password = senha;
  return u.toString();
}
