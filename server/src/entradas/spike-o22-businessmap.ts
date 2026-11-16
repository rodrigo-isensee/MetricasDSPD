import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { executarSpikeO22, QUANTIDADE_SPIKE_O22 } from '../modulos/businessmap/index.js';
import { carregarConfigBusinessMap } from '../plataforma/config.js';
import { criarClienteHttp } from '../plataforma/http.js';

// Entrada do `pnpm --filter @metricas-dspd/server run bm:spike-o22 <arquivo-de-saida> [quantidade]` (pedido 105, E7.104, B5 do O22): manual, nunca
// agendada, só GET, sem banco. O arquivo de saída (com nome de conta) é do dono: caminho absoluto FORA do repositório, que o programa recusa se
// estiver dentro dele ou já existir. O `.env` da raiz é lido só aqui; nada dele é impresso. Erro sai como código em stderr, sem eco de valor.
const raiz = fileURLToPath(new URL('../../../', import.meta.url));
try {
  process.loadEnvFile(join(raiz, '.env'));
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
    process.stderr.write('bm:spike-o22 falhou: env\n');
    process.exit(2);
  }
}
const [caminhoSaida, qtd] = process.argv.slice(2);
const quantidade = qtd === undefined ? QUANTIDADE_SPIKE_O22 : Number(qtd);
if (caminhoSaida === undefined || !Number.isInteger(quantidade) || quantidade < 1) {
  process.stderr.write('uso: bm:spike-o22 <arquivo-de-saida-absoluto-fora-do-repositorio> [quantidade-de-cards]\n');
  process.exit(2);
}
let codigo: string | null;
let saida = '';
try {
  const cfg = carregarConfigBusinessMap();
  const cliente = criarClienteHttp({
    urlBase: cfg.BUSINESSMAP_URL_BASE, apikey: cfg.BUSINESSMAP_APIKEY, limitePorMinuto: cfg.BUSINESSMAP_LIMITE_POR_MINUTO, timeoutMs: cfg.BUSINESSMAP_TIMEOUT_MS, paginaTamanho: cfg.BUSINESSMAP_PAGINA_TAMANHO,
  });
  ({ saida, erro: codigo } = await executarSpikeO22({ cliente, quadros: cfg.BUSINESSMAP_QUADROS_IDS, caminhoSaida, raizRepositorio: raiz, quantidade }));
} catch {
  codigo = 'configuracao';
}
if (codigo === null) process.stdout.write(saida);
else {
  process.stderr.write(`bm:spike-o22 falhou: ${codigo}\n`);
  process.exitCode = 1;
}
