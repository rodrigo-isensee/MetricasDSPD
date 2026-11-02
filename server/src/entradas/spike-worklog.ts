import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { executarSpikeWorklog } from '../modulos/businessmap/index.js';

// Entrada do `pnpm --filter @metricas-dspd/server run bm:spike-worklog` (pedido 059, E2.3, K-193): manual, nunca agendada,
// só leitura. O `.env` da raiz é lido só aqui, pelo programa, para o ambiente do processo; nada dele é impresso.
// Não grava arquivo: o relatório (só forma e contagens) sai no stdout.
const raiz = fileURLToPath(new URL('../../../', import.meta.url));
try {
  process.loadEnvFile(join(raiz, '.env'));
} catch (e) {
  // sem .env (ENOENT): vale o ambiente que já existe; qualquer outra falha encerra, sem imprimir o conteúdo do arquivo
  if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
    process.stderr.write(`falha ao ler o .env (${(e as NodeJS.ErrnoException).code ?? 'erro'})\n`);
    process.exit(2);
  }
}
const r = await executarSpikeWorklog({ env: process.env });
if (r.saida) process.stdout.write(`${r.saida}\n`);
if (r.erro) process.stderr.write(`${r.erro}\n`);
process.exitCode = r.codigo;
