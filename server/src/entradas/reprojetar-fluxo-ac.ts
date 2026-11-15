import { carregarConfigMigrar } from '../plataforma/config.js';
import { categoriaDoErro } from '../plataforma/categoria-erro.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { reprojetarFluxoAcelerato } from '../modulos/acelerato/index.js';

// Entrada `pnpm --filter @metricas-dspd/server ac:reprojetar-fluxo` (pedido 105, E6.16): preenche `dim_chamado.fluxo` (D2) dos chamados já
// projetados que ficaram com fluxo nulo, a partir do staging, numa transação só e em lotes. Credencial do migrador. Não sobrescreve valor
// existente; repetir não muda nada. Imprime só contagens; nunca imprime a URL, a senha nem o texto do erro do banco.
let pool: ReturnType<typeof criarPool> | undefined;
try {
  const cfg = carregarConfigMigrar();
  pool = criarPool(cfg.PG_MIGRADOR_URL, { max: 1 });
  const r = await reprojetarFluxoAcelerato(pool, montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), () => new Date());
  process.stdout.write(`${JSON.stringify(r)}\n`);
} catch (e) {
  process.stderr.write(`ac:reprojetar-fluxo falhou: ${categoriaDoErro(e)}\n`);
  process.exitCode = 1;
} finally {
  await pool?.end();
}
