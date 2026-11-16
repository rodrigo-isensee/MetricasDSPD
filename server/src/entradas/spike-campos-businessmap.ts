import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { executarSpikeCampos } from '../modulos/businessmap/index.js';

// Entrada do `bm:spike-campos` (pedido 105, E7.172, L0): manual, nunca agendada, só GET. O relatório com rótulo vai para BM_SPIKE_SAIDA ou para
// uma pasta nova no diretório do usuário, nunca dentro do clone; o stdout leva só contagens. O `.env` da raiz é lido só aqui; nada dele é impresso.
const raiz = fileURLToPath(new URL('../../../', import.meta.url));
try {
  process.loadEnvFile(join(raiz, '.env'));
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
    process.stderr.write(`falha ao ler o .env (${(e as NodeJS.ErrnoException).code ?? 'erro'})\n`);
    process.exit(2);
  }
}
const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
const dirSaida = process.env.BM_SPIKE_SAIDA ?? join(homedir(), 'metricas-dspd-spike-campos', carimbo);
const r = await executarSpikeCampos({ env: process.env, dirSaida, raizRepositorio: raiz });
if (r.saida) process.stdout.write(`${r.saida}\n`);
if (r.erro) process.stderr.write(`${r.erro}\n`);
process.exitCode = r.codigo;
