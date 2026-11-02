import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pino } from 'pino';
import { analisarArgumentosProjetor, ErroColetaBm, executarProjetor } from '../modulos/businessmap/index.js';
import { carregarConfigProjetorBusinessMap } from '../plataforma/config.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { criarPool } from '../plataforma/db/pool.js';
import { opcoesLog } from '../plataforma/log.js';

// Entrada do `pnpm --filter @metricas-dspd/server run bm:projetar [--reconstruir]` (F4, K-182): manual, sem registro na agenda (H-20),
// roda DEPOIS do `bm:coleta` (ou junto, com `bm:coleta ... --projetar`, que é o que leva os responsáveis ao projetor). Só o banco do
// coletor: não lê a chave do BusinessMap nem chama a API (nem `/users`). O `.env` da raiz é lido só aqui, pelo programa; nada dele é
// impresso. A saída em JSON traz só contagens e códigos (nunca id de card, nome nem valor de pessoa).
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
  const args = analisarArgumentosProjetor(process.argv.slice(2));
  const cfg = carregarConfigProjetorBusinessMap();
  const log = pino(opcoesLog(cfg.LOG_LEVEL));
  pool = criarPool(cfg.PG_COLETOR_URL, { statementTimeoutMs: 120_000, log: (msg, ctx) => log.warn(ctx, msg) });
  const r = await executarProjetor({ pool, S: montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), agora: () => new Date(), reconstruir: args.reconstruir });
  process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
} catch (e) {
  // `uso` e `trava` trazem texto fixo nosso; o resto sai só como código
  process.stderr.write(`bm:projetar falhou: ${e instanceof ErroColetaBm ? `${e.codigo} (${e.message})` : 'erro-interno'}\n`);
  process.exitCode = e instanceof ErroColetaBm && e.codigo === 'uso' ? 2 : 1;
} finally {
  await pool?.end();
}
