import { sql } from 'kysely';
import { conectar } from './migracoes.js';
import { gerarGrants } from './grants.js';

// Aplica os GRANTs por papel; exige conta com GRANT OPTION (root local) em MYSQL_GRANTS_URL.
const url = process.env.MYSQL_GRANTS_URL;
if (!url) throw new Error('MYSQL_GRANTS_URL ausente (conta com GRANT OPTION)');
const db = conectar(url);
const tabelas = async (schema: string): Promise<string[]> => {
  const r = await sql<{ n: string }>`SELECT table_name AS n FROM information_schema.tables WHERE table_schema = ${schema}`.execute(db);
  return r.rows.map((x) => x.n);
};
const stmts = gerarGrants({ bm: await tabelas('dspd_bm'), ac: await tabelas('dspd_ac'), core: await tabelas('dspd_core') });
for (const s of stmts) await sql.raw(s).execute(db);
console.log(`${stmts.length} GRANTs aplicados`);
await db.destroy();
