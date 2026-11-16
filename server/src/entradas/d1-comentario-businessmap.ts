import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { executarD1 } from '../modulos/businessmap/index.js';
import { carregarConfigBusinessMap } from '../plataforma/config.js';
import { criarClienteHttp } from '../plataforma/http.js';

// Entrada do `pnpm --filter @metricas-dspd/server run bm:d1-comment` (pedido 087, K-330, decisão 4a): só leitura, só GET, sem banco. Imprime uma
// linha JSON com quatro contagens (com comentário, sem chave, comentário vazio, total) de UMA página de worklogs. O `.env` da raiz é lido só aqui; nada dele,
// nem campo do worklog, é impresso. Erro sai como código fechado em stderr, sem eco de valor.
const raiz = fileURLToPath(new URL('../../../', import.meta.url));
try {
  process.loadEnvFile(join(raiz, '.env'));
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
    process.stderr.write('bm:d1-comment falhou: env\n');
    process.exit(2);
  }
}
let codigo: string | null;
let saida = '';
try {
  const cfg = carregarConfigBusinessMap();
  const cliente = criarClienteHttp({
    urlBase: cfg.BUSINESSMAP_URL_BASE, apikey: cfg.BUSINESSMAP_APIKEY, limitePorMinuto: cfg.BUSINESSMAP_LIMITE_POR_MINUTO, timeoutMs: cfg.BUSINESSMAP_TIMEOUT_MS, paginaTamanho: cfg.BUSINESSMAP_PAGINA_TAMANHO,
  });
  ({ saida, erro: codigo } = await executarD1(cliente));
} catch {
  codigo = 'configuracao';
}
if (codigo === null) process.stdout.write(saida);
else {
  process.stderr.write(`bm:d1-comment falhou: ${codigo}\n`);
  process.exitCode = 1;
}
