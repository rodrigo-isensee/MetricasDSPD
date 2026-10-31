import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pino } from 'pino';
import { analisarArgumentos, ErroColetaBm, executarColeta, lerConferencia } from '../modulos/businessmap/index.js';
import { carregarConfigColetaBusinessMap } from '../plataforma/config.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { criarPool } from '../plataforma/db/pool.js';
import { ErroBusinessMap, criarClienteHttp } from '../plataforma/http.js';
import { opcoesLog } from '../plataforma/log.js';

// Entrada do `pnpm --filter @metricas-dspd/server run bm:coleta carga-inicial|incremental` (F3, K-182): manual, sem registro na
// agenda (H-20 = C), só GET no BusinessMap. O `.env` da raiz é lido só aqui, pelo programa; nada dele é impresso. A saída em JSON
// traz só contagens e códigos (nunca nome, id de pessoa, chave, URL nem texto de erro do driver ou da API).
const raiz = fileURLToPath(new URL('../../../', import.meta.url));
try {
  process.loadEnvFile(join(raiz, '.env'));
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
    process.stderr.write(`falha ao ler o .env (${(e as NodeJS.ErrnoException).code ?? 'erro'})\n`);
    process.exit(2);
  }
}
let poolColetor: ReturnType<typeof criarPool> | undefined;
let poolRef: ReturnType<typeof criarPool> | undefined;
try {
  const args = analisarArgumentos(process.argv.slice(2));
  const cfg = carregarConfigColetaBusinessMap();
  const log = pino(opcoesLog(cfg.LOG_LEVEL));
  const avisar = (msg: string, ctx: { aplicacao: string; erro: string }): void => log.warn(ctx, msg);
  poolColetor = criarPool(cfg.PG_COLETOR_URL, { statementTimeoutMs: 60_000, log: avisar });
  poolRef = criarPool(cfg.PG_REF_URL, { statementTimeoutMs: 60_000, max: 2, log: avisar });
  const cliente = criarClienteHttp(
    { urlBase: cfg.BUSINESSMAP_URL_BASE, apikey: cfg.BUSINESSMAP_APIKEY, limitePorMinuto: cfg.BUSINESSMAP_LIMITE_POR_MINUTO, timeoutMs: cfg.BUSINESSMAP_TIMEOUT_MS, paginaTamanho: cfg.BUSINESSMAP_PAGINA_TAMANHO },
    { log: (e) => log.debug(e, 'businessmap') },
  );
  const r = await executarColeta({
    cliente, poolColetor, poolRef, conf: lerConferencia(), quadros: cfg.BUSINESSMAP_QUADROS_IDS, hostBase: new URL(cfg.BUSINESSMAP_URL_BASE).host,
    agora: () => new Date(), paginaTamanho: cfg.BUSINESSMAP_PAGINA_TAMANHO, S: montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO),
  }, args);
  process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
  process.exitCode = r.estado === 'sucesso' ? 0 : 3;
} catch (e) {
  const codigo = e instanceof ErroColetaBm ? e.codigo : e instanceof ErroBusinessMap ? e.tipo : 'erro-interno';
  // `uso` e `trava` trazem texto fixo nosso; o resto sai só como código
  process.stderr.write(`bm:coleta falhou: ${codigo}${e instanceof ErroColetaBm ? ` (${e.message})` : ''}\n`);
  process.exitCode = e instanceof ErroColetaBm && e.codigo === 'uso' ? 2 : 1;
} finally {
  await Promise.all([poolColetor?.end(), poolRef?.end()]);
}
