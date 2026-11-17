import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { ambienteFilho } from './ajuda-cli-filho.js';

const ENTRADA = new URL('../src/entradas/ref-sync-sle.ts', import.meta.url).pathname;

describe('entrada bm:ref-sync-sle: uso e configuração (K-214)', () => {
  it('argumento é recusado com a mensagem de uso e código 2, antes de ler a configuração', () => {
    const r = spawnSync(process.execPath, ['--import', 'tsx', ENTRADA, '2026-11-12'], { encoding: 'utf8', env: ambienteFilho(), timeout: 60_000 });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('uso: bm:ref-sync-sle');
    expect(r.stdout).toBe('');
  });

  it('sem configuração do banco falha com código 1 e a categoria com o nome da variável, sem vazar detalhe', () => {
    const r = spawnSync(process.execPath, ['--import', 'tsx', ENTRADA], { encoding: 'utf8', env: ambienteFilho(), timeout: 60_000 });
    expect(r.status).toBe(1);
    expect(r.stderr).toBe('bm:ref-sync-sle falhou: configuração: PG_REF_URL\n');
    expect(r.stdout).toBe('');
  });
});
