import type { PoolLike } from './pool.js';

/**
 * Exclusão por fonte entre coleta, agenda e consumidores: `pg_try_advisory_lock` de sessão numa conexão dedicada.
 * Sem a trava, não executa (`executou: false`) e quem chamou reagenda.
 */
export async function comTravaDaFonte<T>(
  pool: PoolLike,
  fonte: string,
  fn: () => Promise<T>,
): Promise<{ executou: true; valor: T } | { executou: false }> {
  const cliente = await pool.connect();
  try {
    const r = await cliente.query<{ ok: boolean }>('SELECT pg_try_advisory_lock(hashtext($1)) AS ok', [`dspd:fonte:${fonte}`]);
    if (!r.rows[0]!.ok) return { executou: false };
    try {
      return { executou: true, valor: await fn() };
    } finally {
      await cliente.query('SELECT pg_advisory_unlock(hashtext($1))', [`dspd:fonte:${fonte}`]);
    }
  } finally {
    cliente.release();
  }
}
