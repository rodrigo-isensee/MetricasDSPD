import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

// K-394 (pedido 105): o gerador apaga e regera deploy/sql, então chamado sem o wrapper (DSPD_GERADOR_VIA_WRAPPER=1) recusa com
// código 3 antes de tocar no disco. A cópia do .mjs roda num diretório temporário: a RAIZ do script é a pasta acima dele, logo o
// deploy/sql afetado seria o do temporário, nunca o do repositório.
const GERADOR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts', 'gerar-sql-migracoes.mjs');
let raiz = '';
afterEach(() => { if (raiz) rmSync(raiz, { recursive: true, force: true }); raiz = ''; });

const preparar = () => {
  raiz = mkdtempSync(join(tmpdir(), 'gerador-recusa-'));
  mkdirSync(join(raiz, 'scripts'));
  mkdirSync(join(raiz, 'deploy', 'sql'), { recursive: true });
  copyFileSync(GERADOR, join(raiz, 'scripts', 'gerar-sql-migracoes.mjs'));
  writeFileSync(join(raiz, 'deploy', 'sql', '0001_existente.sql'), 'SELECT 1;\n');
  writeFileSync(join(raiz, 'deploy', 'sql', 'LEIAME.txt'), 'não é .sql\n');
};
const estado = () => Object.fromEntries(readdirSync(join(raiz, 'deploy', 'sql')).map((f) => [f, readFileSync(join(raiz, 'deploy', 'sql', f), 'utf8')]));
const rodar = (fase: string, valor?: string) => {
  const env = { ...process.env };
  delete env.DSPD_GERADOR_VIA_WRAPPER;
  if (valor !== undefined) env.DSPD_GERADOR_VIA_WRAPPER = valor;
  return spawnSync(process.execPath, [join(raiz, 'scripts', 'gerar-sql-migracoes.mjs'), fase], { env, encoding: 'utf8' });
};

describe('gerar-sql-migracoes.mjs: recusa fora do wrapper', () => {
  it.each(['arquivos', 'grants', ''])('fase %j sem a variável: saída 3, mensagem e deploy/sql intacto', (fase) => {
    preparar();
    const antes = estado();
    const r = rodar(fase);
    expect(r.status).toBe(3);
    expect(r.stderr).toContain('recusado');
    expect(r.stderr).toContain('pnpm run db:sql');
    expect(estado()).toEqual(antes);
  });
  it.each(['0', 'true', ''])('variável com valor %j (diferente de 1) também recusa e não apaga nada', (valor) => {
    preparar();
    const antes = estado();
    const r = rodar('arquivos', valor);
    expect(r.status).toBe(3);
    expect(estado()).toEqual(antes);
  });
});
