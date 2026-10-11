import pg from 'pg';
import { limparTestes } from './limpar-testes.js';

const url = process.env.PG_TESTE_URL;
if (!url) throw new Error('PG_TESTE_URL ausente');
const cliente = new pg.Client({ connectionString: url });
await cliente.connect();
try {
  const removidos = await limparTestes(cliente);
  console.log(`${removidos.length} schema(s) de teste removido(s)`);
} finally {
  await cliente.end();
}
