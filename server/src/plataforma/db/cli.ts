import { migrar, type Direcao } from './migrar.js';

// Uso: migrate up | down [N] | redo. Exige PG_MIGRADOR_URL (papel dspd_migrador). Prefixo só de DSPD_SCHEMA_PREFIXO.
const url = process.env.PG_MIGRADOR_URL;
if (!url) throw new Error('PG_MIGRADOR_URL ausente (usuário dspd_migrador)');
const comando = process.argv[2] ?? 'up';
const prefixo = process.env.DSPD_SCHEMA_PREFIXO ?? '';
const log = (m: string): void => console.log(m);
const passos: { direcao: Direcao; quantas?: number }[] =
  comando === 'redo' ? [{ direcao: 'down' }, { direcao: 'up' }]
  : comando === 'down' ? [{ direcao: 'down', quantas: Number(process.argv[3] ?? 1) }]
  : [{ direcao: 'up' }];
for (const p of passos) {
  const r = await migrar(url, { ...p, prefixo, log });
  console.log(`${p.direcao}: ${r.migracoes.length} migração(ões), ${r.grants} GRANT(s)`);
}
