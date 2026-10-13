import { migrar, type Direcao } from './migrar.js';
import { lerConfirmacaoBackup, motivoDeRecusa } from './trava-down.js';

// Uso: migrate up | down [N] | redo. Exige PG_MIGRADOR_URL (papel dspd_migrador). Prefixo só de DSPD_SCHEMA_PREFIXO.
// down e redo sem prefixo de teste exigem DSPD_PERMITIR_DOWN=1 e o backup de hoje confirmado em DSPD_BACKUP_DIR (C2).
const url = process.env.PG_MIGRADOR_URL;
if (!url) throw new Error('PG_MIGRADOR_URL ausente (usuário dspd_migrador)');
const comando = process.argv[2] ?? 'up';
const prefixo = process.env.DSPD_SCHEMA_PREFIXO ?? '';
const recusa = motivoDeRecusa({
  comando, prefixo, permitir: process.env.DSPD_PERMITIR_DOWN,
  confirmacaoBackup: lerConfirmacaoBackup(process.env.DSPD_BACKUP_DIR), agora: new Date(),
});
if (recusa) throw new Error(recusa);
const log = (m: string): void => console.log(m);
const passos: { direcao: Direcao; quantas?: number }[] =
  comando === 'redo' ? [{ direcao: 'down' }, { direcao: 'up' }]
  : comando === 'down' ? [{ direcao: 'down', quantas: Number(process.argv[3] ?? 1) }]
  : [{ direcao: 'up' }];
for (const p of passos) {
  const r = await migrar(url, { ...p, prefixo, log });
  console.log(`${p.direcao}: ${r.migracoes.length} migração(ões), ${r.grants} GRANT(s)`);
}
