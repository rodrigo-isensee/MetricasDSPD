import { gerarBaseMock } from '@metricas-dspd/mock';
import { criarPool } from './pool.js';
import { semear } from './seed.js';

// Usuário com INSERT nas tabelas do seed (em dev, o dspd_migrador). Só ambiente de desenvolvimento.
const url = process.env.PG_SEED_URL ?? process.env.PG_MIGRADOR_URL;
if (!url) throw new Error('PG_SEED_URL (ou PG_MIGRADOR_URL) ausente');
const semente = process.env.MOCK_SEMENTE ? Number(process.env.MOCK_SEMENTE) : undefined;
const pool = criarPool(url);
try {
  console.log(await semear(pool, gerarBaseMock(semente === undefined ? {} : { semente })));
} finally {
  await pool.end();
}
