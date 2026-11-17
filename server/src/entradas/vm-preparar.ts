import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { carregarConfigMigrar } from '../plataforma/config.js';
import { categoriaDoErro } from '../plataforma/categoria-erro.js';
import { DIR_MIGRACOES } from '../plataforma/db/migrar.js';
import { criarPool } from '../plataforma/db/pool.js';
import { montarEsquemas } from '../plataforma/db/esquemas.js';
import { lerConfirmacaoBackup } from '../plataforma/db/trava-down.js';
import { PASSOS, PROXIMO_PASSO, estadoDasMigracoes, executarPassos, nomesDeMigracao, recusaDeBackup } from '../plataforma/db/vm-preparar.js';

// Entrada `vm:preparar` (K-396, decisão do dono): deixa a base pronta, em ordem e parando no primeiro erro (nomeia o passo): migrações, listas de
// referência, reprojeções do Acelerato e marcas de critério. Idempotente; sem primeira carga. Roda no serviço `migrate` do docker-compose.prod.yml
// (a subida) ou à mão (`pnpm run vm:preparar`), caso em que carrega o `.env` da raiz (o Docker não tem esse arquivo). Variável já no ambiente vale
// mais que o `.env`. Antes de migrar sobre base com dados, exige o backup de hoje confirmado (`recusaDeBackup`). Imprime só o que os passos imprimem
// (nunca URL, senha nem texto de erro do banco: a falha da conferência sai só por categoria).
class RecusaDeBackup extends Error {}
const aviso = (m: string): void => void process.stderr.write(`vm:preparar: ${m}\n`);
const dirServidor = fileURLToPath(new URL('../..', import.meta.url));
const envRaiz = fileURLToPath(new URL('../../../.env', import.meta.url));
if (existsSync(envRaiz)) process.loadEnvFile(envRaiz);

const confirmarBackup = async (): Promise<void> => {
  const cfg = carregarConfigMigrar();
  const pool = criarPool(cfg.PG_MIGRADOR_URL, { max: 1 });
  try {
    const estado = await estadoDasMigracoes(pool, montarEsquemas(cfg.DSPD_SCHEMA_PREFIXO), nomesDeMigracao(readdirSync(DIR_MIGRACOES)));
    const recusa = recusaDeBackup({
      ...estado, agora: new Date(),
      confirmacao: process.env.DSPD_BACKUP_CONFIRMADO ?? lerConfirmacaoBackup(process.env.DSPD_BACKUP_DIR),
    });
    if (recusa !== null) throw new RecusaDeBackup(recusa);
    process.stdout.write(`vm:preparar: ${estado.pendentes.length} migração(ões) pendente(s), ${estado.aplicadas} aplicada(s)\n`);
  } finally {
    await pool.end();
  }
};

const passos = PASSOS.filter((p) => !p.opcional || existsSync(`${dirServidor}src/entradas/${p.entrada}.ts`));
const r = await executarPassos(passos, async (p, i, total) => {
  process.stdout.write(`vm:preparar: passo ${i}/${total} ${p.nome}\n`);
  if (p.nome === 'migrar') {
    try {
      await confirmarBackup();
    } catch (e) {
      aviso(`${p.nome} recusado: ${e instanceof RecusaDeBackup ? e.message : categoriaDoErro(e)}`);
      return 1;
    }
  }
  const f = spawnSync(process.execPath, ['--import', 'tsx', `src/entradas/${p.entrada}.ts`], { cwd: dirServidor, stdio: 'inherit', env: process.env });
  return f.status ?? 1;
});
if (!r.ok) {
  aviso(`FALHOU no passo "${r.falhou}" (código ${r.codigo}); passos feitos: ${r.feitos.join(', ') || 'nenhum'}. Nada depois dele rodou; repita o comando depois de corrigir.`);
  process.exitCode = 1;
} else {
  process.stdout.write(`vm:preparar: ok, ${r.feitos.length} passo(s): ${r.feitos.join(', ')}\n${PROXIMO_PASSO}\n`);
}
