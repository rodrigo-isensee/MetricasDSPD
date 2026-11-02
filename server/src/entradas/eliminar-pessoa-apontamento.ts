import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pino } from 'pino';
import { analisarArgumentosEliminacao, eliminarPessoa, ErroColetaBm } from '../modulos/businessmap/index.js';
import { carregarConfigEliminacaoPessoa } from '../plataforma/config.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { criarPool } from '../plataforma/db/pool.js';
import { opcoesLog } from '../plataforma/log.js';

// Entrada do `pnpm --filter @metricas-dspd/server run bm:eliminar-pessoa --usuario=<id> [--confirmar]` (pedido 059, A4, CA-AP-10; ADR 0020 R4-6):
// eliminação a pedido do titular. Manual, com o papel `dspd_migrador` (`PG_MIGRADOR_URL`), nunca na agenda. Sem `--confirmar` só descreve o que
// seria feito (nada é gravado). Com ele: grava a supressão (HMAC do id com `PESSOA_ELIMINADA_SAL`), apaga o nome (`dim_responsavel`) e anula
// `pessoa_ref` no fato; as horas ficam como agregado do time. O `.env` da raiz é lido só aqui, pelo programa. A saída traz só contagens: nunca o
// id, o nome nem a URL.
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
  const args = analisarArgumentosEliminacao(process.argv.slice(2));
  const cfg = carregarConfigEliminacaoPessoa();
  const log = pino(opcoesLog(cfg.LOG_LEVEL));
  pool = criarPool(cfg.PG_MIGRADOR_URL, { statementTimeoutMs: 120_000, max: 2, log: (msg, ctx) => log.warn(ctx, msg) });
  const r = await eliminarPessoa({ pool, S: montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), sal: cfg.PESSOA_ELIMINADA_SAL, agora: () => new Date() }, args);
  process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
} catch (e) {
  // `uso`, `trava` e `configuracao` trazem texto fixo nosso; o resto sai só como código (a mensagem do banco ou da configuração pode trazer valor)
  process.stderr.write(`bm:eliminar-pessoa falhou: ${e instanceof ErroColetaBm ? `${e.codigo} (${e.message})` : 'erro-interno'}\n`);
  process.exitCode = e instanceof ErroColetaBm && e.codigo === 'uso' ? 2 : 1;
} finally {
  await pool?.end();
}
