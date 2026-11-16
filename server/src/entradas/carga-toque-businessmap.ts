import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pino } from 'pino';
import { analisarArgumentosToque, ErroColetaBm, executarCargaToque } from '../modulos/businessmap/index.js';
import { categoriaDoErro, ErroConfiguracao } from '../plataforma/categoria-erro.js';
import { carregarConfigToqueBusinessMap } from '../plataforma/config.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { criarPool } from '../plataforma/db/pool.js';
import { ErroBusinessMap, criarClienteHttp } from '../plataforma/http.js';
import { opcoesLog } from '../plataforma/log.js';

// Entrada do `pnpm --filter @metricas-dspd/server run bm:carga-toque [--janela=<min> | --amostra[=<N>]]` (pedido 105, O22, B7b; ADR 0020 R6-8): carga do passado
// do primeiro toque (retomável, com janela) ou portão de carga (amostra sorteada). Manual, nunca na agenda, só GET no BusinessMap. O `.env` da raiz é lido só aqui,
// pelo programa; nada dele é impresso. A saída em JSON traz só contagens e códigos (nunca id de pessoa, nome, texto nem URL). Código de saída: 0 sem falha
// (e, no portão, com o portão aprovado), 3 com falha de card, parada por erro fatal ou portão reprovado, 2 para uso errado, 1 para erro.
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
  const modo = analisarArgumentosToque(process.argv.slice(2));
  const cfg = carregarConfigToqueBusinessMap();
  const log = pino(opcoesLog(cfg.LOG_LEVEL));
  pool = criarPool(cfg.PG_COLETOR_URL, { statementTimeoutMs: 120_000, log: (msg, ctx) => log.warn(ctx, msg) });
  const cliente = criarClienteHttp(
    { urlBase: cfg.BUSINESSMAP_URL_BASE, apikey: cfg.BUSINESSMAP_APIKEY, limitePorMinuto: cfg.BUSINESSMAP_LIMITE_POR_MINUTO, timeoutMs: cfg.BUSINESSMAP_TIMEOUT_MS, paginaTamanho: cfg.BUSINESSMAP_PAGINA_TAMANHO },
    { log: (e) => log.debug(e, 'businessmap') },
  );
  const r = await executarCargaToque({ cliente, pool, S: montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), hostBase: new URL(cfg.BUSINESSMAP_URL_BASE).host, agora: () => new Date() }, modo);
  process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
  process.exitCode = r.estado === 'sucesso' && r.parada !== 'fatal' && r.portao?.passou !== false ? 0 : 3;
} catch (e) {
  // Configuração ausente ou inválida: só os NOMES das variáveis (K-304), nunca o valor.
  const codigo = e instanceof ErroConfiguracao ? categoriaDoErro(e) : e instanceof ErroColetaBm ? e.codigo : e instanceof ErroBusinessMap ? e.tipo : 'erro-interno';
  // `uso` e `trava` trazem texto fixo nosso; o resto sai só como código
  process.stderr.write(`bm:carga-toque falhou: ${codigo}${e instanceof ErroColetaBm ? ` (${e.message})` : ''}\n`);
  process.exitCode = e instanceof ErroColetaBm && e.codigo === 'uso' ? 2 : 1;
} finally {
  await pool?.end();
}
