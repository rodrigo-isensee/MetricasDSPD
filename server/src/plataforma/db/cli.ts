import { conectar, criarMigrator } from './migracoes.js';

const url = process.env.MYSQL_MIGRADOR_URL;
if (!url) throw new Error('MYSQL_MIGRADOR_URL ausente (usuário dspd_migrador)');
const comando = process.argv[2] ?? 'up';
const db = conectar(url);
const migrator = criarMigrator(db);
const { error, results } =
  comando === 'down' ? await migrator.migrateDown() : await migrator.migrateToLatest();
for (const r of results ?? []) console.log(`${r.direction} ${r.migrationName}: ${r.status}`);
await db.destroy();
if (error) { console.error(error); process.exit(1); }
