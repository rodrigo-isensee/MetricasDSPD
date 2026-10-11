import pg from 'pg';

/** Mínimo que os repositórios usam: aceita `pg.Pool`, `pg.PoolClient` e dublês de teste. */
export interface Consultavel {
  query<R extends pg.QueryResultRow = pg.QueryResultRow>(
    texto: string,
    valores?: unknown[],
  ): Promise<{ rows: R[]; rowCount: number | null }>;
}
export interface ClienteLike extends Consultavel {
  release(): void;
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

export type OpcoesPool = { statementTimeoutMs?: number; max?: number };

/** Um Pool por papel (ADR 0014). Sessão em UTC; `statement_timeout` por pool. */
export function criarPool(url: string, opcoes: OpcoesPool = {}): pg.Pool {
  const { statementTimeoutMs = 30_000, max = 10 } = opcoes;
  return new pg.Pool({
    connectionString: url, max, types: tipos, statement_timeout: statementTimeoutMs,
    options: '-c TimeZone=UTC',
  });
}

/** BEGIN/COMMIT; qualquer erro faz ROLLBACK e é repassado. O cliente sempre volta ao pool. */
export async function emTransacao<T>(pool: PoolLike, fn: (cliente: Consultavel) => Promise<T>): Promise<T> {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const r = await fn(cliente);
    await cliente.query('COMMIT');
    return r;
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
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
