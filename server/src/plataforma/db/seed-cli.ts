import { gerarBaseMock } from '@metricas-dspd/mock';
import { criarPool } from './pool.js';
import { semear } from './seed.js';

// Usuário com INSERT nas tabelas do seed (o dspd_migrador), num banco que NÃO é o da coleta real (homologação, CI, teste).
// Sem fallback para PG_MIGRADOR_URL (plano 060-sem-mock, P1): quem semeia diz o alvo, e o `semear` ainda recusa esquema com coleta real.
const url = process.env.PG_SEED_URL;
if (!url) throw new Error('PG_SEED_URL ausente: o seed só roda com o alvo explícito (nunca na base real)');
const semente = process.env.MOCK_SEMENTE ? Number(process.env.MOCK_SEMENTE) : undefined;
const pool = criarPool(url);
try {
  console.log(await semear(pool, gerarBaseMock(semente === undefined ? {} : { semente })));
} finally {
  await pool.end();
}
