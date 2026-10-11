import type { Consultavel } from './pool.js';

/** Remove schemas `t<6 base36>_dspd_*` de execuções de teste interrompidas. Só em desenvolvimento (PG_TESTE_URL). */
export const PADRAO_TESTE = '^t[0-9a-z]{6}_dspd_(bm|ac|core)$';

export async function limparTestes(cliente: Consultavel): Promise<string[]> {
  const r = await cliente.query<{ nspname: string }>('SELECT nspname FROM pg_namespace WHERE nspname ~ $1', [PADRAO_TESTE]);
  for (const { nspname } of r.rows) await cliente.query(`DROP SCHEMA IF EXISTS ${nspname} CASCADE`);
  return r.rows.map((x) => x.nspname);
}
