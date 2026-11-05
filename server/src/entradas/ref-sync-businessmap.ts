import { pino } from 'pino';
import { carregarConfigRef } from '../plataforma/config.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { opcoesLog } from '../plataforma/log.js';
import { lerDominioBm, sincronizarDominioBm } from '../modulos/businessmap/index.js';
import { ErroDominio, dataCivilValida } from '../modulos/referencia/index.js';

// Entrada `pnpm --filter @metricas-dspd/server run bm:ref-sync [AAAA-MM-DD]` (pedido 069, L2-a): grava em `dspd_bm.ref_dominio` o mapa `field_id` -> coluna
// e os domínios do arquivo versionado `docs/architecture/fontes/businessmap-dominio.json`, com vigência (padrão: hoje, horário de Brasília) e versão de
// critério (T2.6) com o hash do arquivo. Usa o papel `dspd_ref` (`PG_REF_URL`); idempotente. Não chama a API do BusinessMap nem lê a apikey. O caminho do
// arquivo é constante (o único argumento é a data). Imprime só contagens e o hash: nunca a URL, a senha nem o texto do erro do banco.
const dia = process.argv[2] ?? new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);
if (!dataCivilValida(dia) || process.argv.length > 3) {
  process.stderr.write('uso: bm:ref-sync [AAAA-MM-DD]\n');
  process.exit(2);
}
let pool: ReturnType<typeof criarPool> | undefined;
try {
  const cfg = carregarConfigRef();
  const log = pino(opcoesLog(cfg.LOG_LEVEL));
  const lido = lerDominioBm();
  pool = criarPool(cfg.PG_REF_URL, { max: 1, log: (msg, ctx) => log.warn(ctx, msg) });
  const r = await sincronizarDominioBm(pool, montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), lido, dia, new Date());
  process.stdout.write(`${JSON.stringify({ vigenteDesde: dia, ...r })}\n`);
} catch (e) {
  process.stderr.write(`bm:ref-sync falhou: ${e instanceof ErroDominio ? e.message : 'configuração ou banco inválidos'}\n`);
  process.exitCode = 1;
} finally {
  await pool?.end();
}
