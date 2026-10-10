import {
  Kysely, MysqlAdapter, MysqlIntrospector, MysqlQueryCompiler,
  type CompiledQuery, type DatabaseConnection, type Driver, type QueryResult,
} from 'kysely';

export type Chamada = { sql: string; parametros: readonly unknown[] };
export type Respondedor = (c: Chamada) => unknown[] | { rows: unknown[]; insertId?: bigint } | Error;

/** Kysely com driver falso: registra o SQL compilado e responde por função. Sem rede, sem MySQL. */
export function criarDubleDb(responder: Respondedor = () => []): { db: Kysely<unknown>; chamadas: Chamada[] } {
  const chamadas: Chamada[] = [];
  const conexao: DatabaseConnection = {
    executeQuery: <R>(q: CompiledQuery): Promise<QueryResult<R>> => {
      const c = { sql: q.sql, parametros: q.parameters };
      chamadas.push(c);
      const r = responder(c);
      if (r instanceof Error) return Promise.reject(r);
      const out = Array.isArray(r) ? { rows: r } : r;
      return Promise.resolve(out as QueryResult<R>);
    },
    streamQuery: () => { throw new Error('não usado'); },
  };
  const driver: Driver = {
    init: () => Promise.resolve(),
    acquireConnection: () => Promise.resolve(conexao),
    beginTransaction: () => Promise.resolve(),
    commitTransaction: () => Promise.resolve(),
    rollbackTransaction: () => Promise.resolve(),
    releaseConnection: () => Promise.resolve(),
    destroy: () => Promise.resolve(),
  };
  const db = new Kysely<unknown>({
    dialect: {
      createAdapter: () => new MysqlAdapter(),
      createDriver: () => driver,
      createIntrospector: (k) => new MysqlIntrospector(k),
      createQueryCompiler: () => new MysqlQueryCompiler(),
    },
  });
  return { db, chamadas };
}
