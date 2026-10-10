import { gerarBaseMock } from '@metricas-dspd/mock';
import { conectar } from './migracoes.js';
import { semear } from './seed.js';

// Usuário com INSERT nas tabelas do seed (em dev, o dspd_migrador). Só ambiente de desenvolvimento.
const url = process.env.MYSQL_SEED_URL ?? process.env.MYSQL_MIGRADOR_URL;
if (!url) throw new Error('MYSQL_SEED_URL (ou MYSQL_MIGRADOR_URL) ausente');
const semente = process.env.MOCK_SEMENTE ? Number(process.env.MOCK_SEMENTE) : undefined;
const db = conectar(url);
try {
  console.log(await semear(db, gerarBaseMock(semente === undefined ? {} : { semente })));
} finally {
  await db.destroy();
}
