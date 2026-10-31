import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ARQUIVO_CONFERENCIA, executarSpike } from '../modulos/businessmap/index.js';

// Entrada do `pnpm --filter @metricas-dspd/server run bm:spike` (F1, K-182): manual, nunca agendada, só leitura.
// O `.env` da raiz é lido só aqui, pelo programa, para o ambiente do processo; nada dele é impresso.
// A saída bruta vai para BM_SPIKE_SAIDA ou para uma pasta nova no diretório do usuário, nunca dentro do clone.
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
const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
const dirSaida = process.env.BM_SPIKE_SAIDA ?? join(homedir(), 'metricas-dspd-spike-bm', carimbo);
const r = await executarSpike({
  env: process.env,
  dirSaida,
  raizRepositorio: raiz,
  textoConferencia: readFileSync(ARQUIVO_CONFERENCIA, 'utf8'),
});
if (r.saida) process.stdout.write(`${r.saida}\nSaída bruta em: ${dirSaida}\n`);
if (r.erro) process.stderr.write(`${r.erro}\n`);
process.exitCode = r.codigo;
