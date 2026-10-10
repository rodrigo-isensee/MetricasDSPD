import { buildApp } from '../app.js';
import { carregarConfigApi } from '../plataforma/config.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';

// Entrada `api` (imagem única, serviço `api` do Compose): só a credencial `dspd_api`, nunca a do coletor.
const cfg = carregarConfigApi();
const pool = criarPool(cfg.PG_API_URL, { statementTimeoutMs: 10_000 });
const app = await buildApp({ db: pool, S: montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), agora: () => new Date(), nivelLog: cfg.LOG_LEVEL });
const encerrar = async (): Promise<void> => { await app.close(); await pool.end(); };
process.once('SIGTERM', () => void encerrar());
process.once('SIGINT', () => void encerrar());
await app.listen({ host: cfg.HOST, port: cfg.PORT });
