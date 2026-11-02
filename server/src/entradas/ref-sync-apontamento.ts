import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pino } from 'pino';
import { carregarConfigRef } from '../plataforma/config.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { opcoesLog } from '../plataforma/log.js';
import { ErroDicionario, lerDicionario, sincronizarDicionario } from '../modulos/businessmap/index.js';
import { dataCivilValida } from '../modulos/referencia/index.js';

// Entrada `pnpm --filter @metricas-dspd/server run bm:ref-sync-apontamento [AAAA-MM-DD]` (pedido 059, E2.19 e E2.27): grava em `dspd_bm.ref_apontamento_*`
// o dicionário de subgrupo do arquivo versionado `docs/architecture/fontes/apontamento-dicionario.json`, com versão de critério (T2.6) e o hash
// do arquivo. Usa o papel `dspd_ref` (`PG_REF_URL`); INSERT e UPDATE de `vigente_ate`, idempotente: termo novo abre vigência, mudado fecha a antiga e abre a nova, retirado só fecha (nada é apagado). Imprime só contagens e o hash: nunca a URL, a senha nem o
// texto do erro do banco. O `.env` da raiz é lido só aqui, pelo programa (como nos comandos `bm:*`); nada dele é impresso.
const raiz = fileURLToPath(new URL('../../../', import.meta.url));
try {
  process.loadEnvFile(join(raiz, '.env'));
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
    process.stderr.write(`falha ao ler o .env (${(e as NodeJS.ErrnoException).code ?? 'erro'})\n`);
    process.exit(2);
  }
}
const dia = process.argv[2] ?? new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);
if (!dataCivilValida(dia) || process.argv.length > 3) {
  process.stderr.write('uso: bm:ref-sync-apontamento [AAAA-MM-DD]\n');
  process.exit(2);
}
let pool: ReturnType<typeof criarPool> | undefined;
try {
  const cfg = carregarConfigRef();
  const log = pino(opcoesLog(cfg.LOG_LEVEL));
  const lido = lerDicionario();
  pool = criarPool(cfg.PG_REF_URL, { max: 1, log: (msg, ctx) => log.warn(ctx, msg) });
  const r = await sincronizarDicionario(pool, montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), lido, dia, new Date());
  process.stdout.write(`${JSON.stringify({ vigenteDesde: dia, ...r })}\n`);
} catch (e) {
  process.stderr.write(`bm:ref-sync-apontamento falhou: ${e instanceof ErroDicionario ? e.message : 'configuração ou banco inválidos'}\n`);
  process.exitCode = 1;
} finally {
  await pool?.end();
}
