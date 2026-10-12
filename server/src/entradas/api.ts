import { buildApp } from '../app.js';
import { carregarConfigApi } from '../plataforma/config.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';

// Entrada `api` (imagem única, serviço `api` do Compose): só a credencial `dspd_api`, nunca a do coletor.
const cfg = carregarConfigApi();
const pool = criarPool(cfg.PG_API_URL, { statementTimeoutMs: 10_000 });
const poolWebhook = cfg.PG_WEBHOOK_URL === undefined ? null : criarPool(cfg.PG_WEBHOOK_URL, { statementTimeoutMs: 5_000, max: 4 });
const webhook = poolWebhook === null ? undefined : { pool: poolWebhook, segredo: cfg.WEBHOOK_BM_SEGREDO as string };
const app = await buildApp({ db: pool, S: montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), agora: () => new Date(), nivelLog: cfg.LOG_LEVEL, webhook, fonteDados: cfg.DADOS_FONTE });
const encerrar = async (): Promise<void> => { await app.close(); await pool.end(); await poolWebhook?.end(); };
process.once('SIGTERM', () => void encerrar());
process.once('SIGINT', () => void encerrar());
await app.listen({ host: cfg.HOST, port: cfg.PORT });
