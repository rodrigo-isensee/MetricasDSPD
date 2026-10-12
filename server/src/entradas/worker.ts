import { pino } from 'pino';
import { consumidorColetaConcluida, TIPO_COLETA_CONCLUIDA } from '../modulos/operacao/index.js';
import { carregarConfigWorker } from '../plataforma/config.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { RegistroConsumidores } from '../plataforma/eventos/index.js';
import { opcoesLog } from '../plataforma/log.js';
import { criarWorker, dormir } from '../plataforma/worker.js';

// Entrada `worker`: credencial `dspd_coletor`; agenda das coletas e poller da outbox. Fonte desconhecida = erro na partida.
const cfg = carregarConfigWorker();
const log = pino(opcoesLog(cfg.LOG_LEVEL));
const pool = criarPool(cfg.PG_COLETOR_URL, { statementTimeoutMs: 60_000, log: (msg, ctx) => log.warn(ctx, msg) });
const consumidores = new RegistroConsumidores();
for (const fonte of cfg.WORKER_FONTES) consumidores.registrar(fonte, TIPO_COLETA_CONCLUIDA, consumidorColetaConcluida(log));
// Tarefas agendadas (coleta incremental diária e varredura semanal) entram com o coletor (WS2); hoje a lista é vazia.
const worker = criarWorker({
  pool, fontes: cfg.WORKER_FONTES, consumidores, tarefas: [], agora: () => new Date(), log, S: montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO),
});
const parar = new AbortController();
process.once('SIGTERM', () => parar.abort());
process.once('SIGINT', () => parar.abort());
log.info({ fontes: cfg.WORKER_FONTES, intervaloMs: cfg.WORKER_INTERVALO_MS }, 'worker iniciado');
await worker.rodar(parar.signal, cfg.WORKER_INTERVALO_MS, dormir);
await pool.end();
