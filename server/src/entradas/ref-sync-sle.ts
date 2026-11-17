import { pino } from 'pino';
import { carregarConfigRef } from '../plataforma/config.js';
import { categoriaDoErro } from '../plataforma/categoria-erro.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { opcoesLog } from '../plataforma/log.js';
import { ErroSle, lerSleBm, sincronizarSleBm } from '../modulos/referencia/index.js';

// Entrada `pnpm --filter @metricas-dspd/server run bm:ref-sync-sle` (pedido 105, K-214): grava em `dspd_bm.ref_sle` os prazos aprovados do arquivo versionado
// `docs/architecture/fontes/businessmap-sle.json` (prioridade nativa, dias úteis, data de aprovação) e a versão de critério (T2.6). Sem argumentos: a vigência de
// cada prazo é a sua data de aprovação. Usa o papel `dspd_ref` (`PG_REF_URL`); idempotente; só INSERT e `UPDATE (vigente_ate)`. Arquivo vazio não grava nada
// (o T2 segue "não definido"). Imprime só contagens e o hash: nunca a URL, a senha nem o texto do erro do banco.
if (process.argv.length > 2) {
  process.stderr.write('uso: bm:ref-sync-sle\n');
  process.exit(2);
}
const hoje = new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);
let pool: ReturnType<typeof criarPool> | undefined;
try {
  const cfg = carregarConfigRef();
  const log = pino(opcoesLog(cfg.LOG_LEVEL));
  const lido = lerSleBm();
  pool = criarPool(cfg.PG_REF_URL, { max: 1, log: (msg, ctx) => log.warn(ctx, msg) });
  const r = await sincronizarSleBm(pool, montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), lido, hoje, new Date());
  process.stdout.write(`${JSON.stringify(r)}\n`);
} catch (e) {
  process.stderr.write(`bm:ref-sync-sle falhou: ${e instanceof ErroSle ? e.message : categoriaDoErro(e)}\n`);
  process.exitCode = 1;
} finally {
  await pool?.end();
}
