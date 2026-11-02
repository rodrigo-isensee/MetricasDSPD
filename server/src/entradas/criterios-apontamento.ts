import { carregarConfigMigrar } from '../plataforma/config.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { registrarCriteriosApontamento } from '../modulos/referencia/index.js';

// Entrada `criterios-apontamento [AAAA-MM-DD]`: registra em `ref_versao_criterio` os limiares dos achados da aba Apontamento (T2.6) com a data de vigência (padrão:
// hoje, horário de Brasília). Usa o migrador (dono da referência); idempotente. Imprime só as referências gravadas.
const dia = process.argv[2] ?? new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) {
  process.stderr.write('uso: criterios-apontamento.ts [AAAA-MM-DD]\n');
  process.exit(2);
}
const cfg = carregarConfigMigrar();
const pool = criarPool(cfg.PG_MIGRADOR_URL, { max: 1 });
try {
  const gravadas = await registrarCriteriosApontamento(pool, montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), dia, new Date());
  process.stdout.write(`${JSON.stringify({ vigenteDesde: dia, gravadas })}\n`);
} finally {
  await pool.end();
}
