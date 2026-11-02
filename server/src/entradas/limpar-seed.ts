import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { carregarConfigMigrar } from '../plataforma/config.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { analisarArgumentosLimpezaSeed, ErroLimpezaSeed, limparSeed } from '../plataforma/db/limpar-seed.js';
import { criarPool } from '../plataforma/db/pool.js';

// Entrada do `pnpm --filter @metricas-dspd/server run db:limpar-seed [--aplicar]` (pedido 052, E2.96): tira o seed mock da base real.
// Manual, nunca agendado. Sem `--aplicar` só simula (transação somente leitura). Usa o `dspd_migrador` (dono das tabelas; `fato_transicao`
// é append-only por gatilho). O `.env` da raiz é lido só aqui, pelo programa; nada dele é impresso. Saída só com contagens por tabela.
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
  const args = analisarArgumentosLimpezaSeed(process.argv.slice(2));
  const cfg = carregarConfigMigrar();
  pool = criarPool(cfg.PG_MIGRADOR_URL, { statementTimeoutMs: 300_000 });
  const r = await limparSeed(pool, { aplicar: args.aplicar, S: montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO) });
  process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
  if (!args.aplicar) process.stdout.write('simulação: nada foi gravado; para aplicar, rode de novo com --aplicar\n');
} catch (e) {
  // mensagens de ErroLimpezaSeed são texto nosso (nome de tabela e contagem); o resto sai só como código
  process.stderr.write(`db:limpar-seed falhou: ${e instanceof ErroLimpezaSeed ? `${e.codigo} (${e.message})` : 'erro-interno'}\n`);
  process.exitCode = e instanceof ErroLimpezaSeed && e.codigo === 'uso' ? 2 : 1;
} finally {
  await pool?.end();
}
