import { executarSpikePaginacao } from '../modulos/businessmap/index.js';

// Entrada do `pnpm run bm:spike-paginacao -- <id do card>`: 1 GET em /loggedTime; só forma e contagens (só leitura).
const r = await executarSpikePaginacao({ env: process.env, argumentos: process.argv.slice(2) });
if (r.saida) process.stdout.write(r.saida);
if (r.erro) process.stderr.write(`${r.erro}\n`);
process.exitCode = r.codigo;
