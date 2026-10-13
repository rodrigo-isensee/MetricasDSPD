import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const SCRIPT = resolve(import.meta.dirname, '../../scripts/db-backup.sh');
const limpar: string[] = [];
afterEach(() => { for (const d of limpar.splice(0)) rmSync(d, { recursive: true, force: true }); });

/** Roda o backup com binários falsos do PostgreSQL no PATH; `pg_restore --list` imprime `linhas` linhas (começando por TABLE). */
function rodar(linhas: number, listaSaiComErro = false) {
  const base = mkdtempSync(join(tmpdir(), 'dspd-bk-'));
  limpar.push(base);
  const bin = join(base, 'bin'), destino = join(base, 'destino');
  mkdirSync(bin);
  const falso = (nome: string, corpo: string): void => { writeFileSync(join(bin, nome), `#!/bin/bash\n${corpo}\n`); chmodSync(join(bin, nome), 0o755); };
  falso('pg_dump', 'echo dump');
  falso('pg_dumpall', 'echo roles');
  falso('psql', 'echo "contagem|t|1"');
  falso('pg_restore', `cat >/dev/null; ${listaSaiComErro ? 'exit 1' : `awk 'BEGIN{for(i=0;i<${linhas};i++) print "123; 1259 16385 TABLE public t" i}'`}`);
  const r = spawnSync('bash', [SCRIPT], {
    env: { PATH: `${bin}:${process.env.PATH}`, HOME: base, DSPD_BACKUP_DIR: destino, DSPD_NAO_CARREGAR_ENV: '1', PGPASSWORD: 'x' },
    encoding: 'utf8',
  });
  return { r, destino };
}

describe('scripts/db-backup.sh', () => {
  it('confirma o backup mesmo quando a lista do pg_restore passa de 64 KB (sem SIGPIPE sob pipefail)', () => {
    const { r, destino } = rodar(20_000); // ~700 KB
    expect(r.status, r.stderr).toBe(0);
    expect(readFileSync(join(destino, 'ultimo-backup-ok'), 'utf8')).toMatch(/^\d{4}-\d{2}-\d{2}\n$/);
  });
  it('falha e não confirma quando o dump não é legível', () => {
    const { r, destino } = rodar(0, true);
    expect(r.status).not.toBe(0);
    expect(existsSync(join(destino, 'ultimo-backup-ok'))).toBe(false);
  });
  it('falha quando o dump não tem tabelas', () => {
    const { r, destino } = rodar(0);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain('sem tabelas');
    expect(existsSync(join(destino, 'ultimo-backup-ok'))).toBe(false);
  });
});
