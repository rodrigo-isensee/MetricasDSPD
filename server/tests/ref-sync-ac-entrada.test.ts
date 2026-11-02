import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const ENTRADA = new URL('../src/entradas/ref-sync-ac.ts', import.meta.url).pathname;

describe('entrada ac:ref-sync: argumento de data', () => {
  it.each(['2026-02-30', '2026-13-01', 'ontem'])('data %s é recusada com a mensagem de uso e código 2, antes de ler a configuração', (data) => {
    const r = spawnSync(process.execPath, ['--import', 'tsx', ENTRADA, data], { encoding: 'utf8', env: { PATH: process.env.PATH ?? '' }, timeout: 60_000 });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('uso: ac:ref-sync [AAAA-MM-DD]');
    expect(r.stdout).toBe('');
  });
});
