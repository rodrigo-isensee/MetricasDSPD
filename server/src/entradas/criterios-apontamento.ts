import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { carregarConfigMigrar } from '../plataforma/config.js';
import { categoriaDoErro } from '../plataforma/categoria-erro.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { dataCivilValida, registrarCriteriosApontamento } from '../modulos/referencia/index.js';

// Entrada `criterios-apontamento [AAAA-MM-DD]`: registra em `ref_versao_criterio` os critérios da aba Apontamento (T2.6: limiares dos achados, limite do dia atípico e, pedido 089, o `sem-vinculo`
// só para sem comentário) com a data de vigência (padrão: hoje, horário de Brasília). Para o 089 informe a data da primeira varredura completa (Q3). Usa o migrador (dono da referência); idempotente. Imprime só as referências gravadas; na falha, só a categoria de `categoriaDoErro` (nunca pilha, host, porta nem usuário).
// O `.env` da raiz é lido só aqui, pelo programa, como em `bm:ref-sync-apontamento`; nada dele é impresso. Uso: `pnpm --filter @metricas-dspd/server run bm:criterios-apontamento <data>`.
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
  process.stderr.write('uso: bm:criterios-apontamento [AAAA-MM-DD]\n');
  process.exit(2);
}
let pool: ReturnType<typeof criarPool> | undefined;
try {
  const cfg = carregarConfigMigrar();
  pool = criarPool(cfg.PG_MIGRADOR_URL, { max: 1 });
  const gravadas = await registrarCriteriosApontamento(pool, montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), dia, new Date());
  process.stdout.write(`${JSON.stringify({ vigenteDesde: dia, gravadas })}\n`);
} catch (e) {
  process.stderr.write(`bm:criterios-apontamento falhou: ${categoriaDoErro(e)}\n`);
  process.exitCode = 1;
} finally {
  await pool?.end();
}
