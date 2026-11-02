import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pino } from 'pino';
import {
  analisarArgumentosApontamento, ErroColetaBm, executarApontamento, montarDepsApontamento,
} from '../modulos/businessmap/index.js';
import { carregarConfigApontamentoBusinessMap } from '../plataforma/config.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { criarPool } from '../plataforma/db/pool.js';
import { ErroBusinessMap, criarClienteHttp } from '../plataforma/http.js';
import { opcoesLog } from '../plataforma/log.js';

// Entrada do `pnpm --filter @metricas-dspd/server run bm:apontamento carga-inicial [--inicio=AAAA-MM-DD]` (pedido 059, E2.19, ADR 0025 item 9): carga inicial do
// worklog, manual (nunca na agenda), na máquina do dono e com ele presente, só GET `/loggedTime`. Pré-requisito: o dicionário carregado por
// `bm:ref-sync-apontamento` e a coleta de cards feita. O incremental não tem entrada própria: roda como etapa do `bm:coleta incremental`. O `.env`
// da raiz é lido só aqui, pelo programa; nada dele é impresso. A saída em JSON traz contagens e códigos (nunca id de pessoa, nome nem comentário).
const raiz = fileURLToPath(new URL('../../../', import.meta.url));
try {
  process.loadEnvFile(join(raiz, '.env'));
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
    process.stderr.write(`falha ao ler o .env (${(e as NodeJS.ErrnoException).code ?? 'erro'})\n`);
    process.exit(2);
  }
}
let pool: ReturnType<typeof criarPool> | undefined;
try {
  const modo = analisarArgumentosApontamento(process.argv.slice(2));
  const cfg = carregarConfigApontamentoBusinessMap();
  const log = pino(opcoesLog(cfg.LOG_LEVEL));
  pool = criarPool(cfg.PG_COLETOR_URL, { statementTimeoutMs: 120_000, log: (msg, ctx) => log.warn(ctx, msg) });
  const cliente = criarClienteHttp(
    { urlBase: cfg.BUSINESSMAP_URL_BASE, apikey: cfg.BUSINESSMAP_APIKEY, limitePorMinuto: cfg.BUSINESSMAP_LIMITE_POR_MINUTO, timeoutMs: cfg.BUSINESSMAP_TIMEOUT_MS, paginaTamanho: cfg.BUSINESSMAP_PAGINA_TAMANHO },
    { log: (e) => log.debug(e, 'businessmap') },
  );
  const deps = await montarDepsApontamento({
    cliente, pool, S: montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), sal: cfg.PESSOA_ELIMINADA_SAL, hostBase: new URL(cfg.BUSINESSMAP_URL_BASE).host, agora: () => new Date(),
  });
  const r = await executarApontamento(deps, modo);
  process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
  process.exitCode = r.estado === 'sucesso' ? 0 : 3;
} catch (e) {
  const codigo = e instanceof ErroColetaBm ? e.codigo : e instanceof ErroBusinessMap ? e.tipo : 'erro-interno';
  // `uso`, `trava`, `dicionario`, `sem-marca`, `cards-falhou` e `configuracao` trazem texto fixo nosso; o resto sai só como código
  process.stderr.write(`bm:apontamento falhou: ${codigo}${e instanceof ErroColetaBm ? ` (${e.message})` : ''}\n`);
  process.exitCode = e instanceof ErroColetaBm && e.codigo === 'uso' ? 2 : 1;
} finally {
  await pool?.end();
}
