import { diagnosticar } from '../modulos/businessmap/index.js';

// Entrada do `pnpm run bm:diagnostico`: lê o ambiente, imprime o relatório em Markdown no stdout (só leitura).
const r = await diagnosticar({ env: process.env });
if (r.saida) process.stdout.write(r.saida);
if (r.erro) process.stderr.write(`${r.erro}\n`);
process.exitCode = r.codigo;
