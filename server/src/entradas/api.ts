import { pino } from 'pino';
import { buildApp } from '../app.js';
import { abrirPoolApontamento } from '../modulos/apontamento/index.js';
import { carregarConfigApi } from '../plataforma/config.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { exigirMockSemColetaReal } from '../plataforma/db/guarda-mock.js';
import { opcoesLog } from '../plataforma/log.js';

// Entrada `api` (imagem única, serviço `api` do Compose): só a credencial `dspd_api`, nunca a do coletor.
const cfg = carregarConfigApi();
const logPool = pino(opcoesLog(cfg.LOG_LEVEL));
const avisar = (msg: string, ctx: { aplicacao: string; erro: string }): void => logPool.warn(ctx, msg);
const pool = criarPool(cfg.PG_API_URL, { statementTimeoutMs: 10_000, log: avisar });
const poolWebhook = cfg.PG_WEBHOOK_URL === undefined ? null : criarPool(cfg.PG_WEBHOOK_URL, { statementTimeoutMs: 5_000, max: 4, log: avisar });
const webhook = poolWebhook === null ? undefined : { pool: poolWebhook, segredo: cfg.WEBHOOK_BM_SEGREDO as string };
const poolApontamento = cfg.PG_APONTAMENTO_URL === undefined ? null : abrirPoolApontamento(cfg.PG_APONTAMENTO_URL, avisar);
const apontamento = poolApontamento === null ? undefined : { pool: poolApontamento, nomesReais: cfg.APONTAMENTO_NOMES === '1', redeLocal: cfg.APONTAMENTO_REDE_LOCAL };
const S = montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO);
const modoMock = cfg.DSPD_MODO_MOCK === 'homologacao';
// Modo mock nunca sobe sobre base com coleta real (revisão de segurança A1): recusa antes de abrir a porta.
if (modoMock) {
  try { await exigirMockSemColetaReal(pool, S); } catch (e) { await pool.end(); await poolWebhook?.end(); await poolApontamento?.end(); throw e; }
}
const app = await buildApp({ db: pool, apontamento, S, agora: () => new Date(), nivelLog: cfg.LOG_LEVEL, webhook, modoMock, aquecer: true });
const encerrar = async (): Promise<void> => { await app.close(); await pool.end(); await poolWebhook?.end(); await poolApontamento?.end(); };
process.once('SIGTERM', () => void encerrar());
process.once('SIGINT', () => void encerrar());
await app.listen({ host: cfg.HOST, port: cfg.PORT });
