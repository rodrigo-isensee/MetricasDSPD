import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ARQUIVO_BACKUP_OK, hojeEmBrasilia, lerConfirmacaoBackup, motivoDeRecusa } from '../src/plataforma/db/trava-down.js';

// 2026-10-12 12:00 UTC = 09:00 em Brasília. 2026-10-13 01:00 UTC ainda é dia 12 em Brasília (22:00).
const agora = new Date('2026-10-12T12:00:00Z');
const base = { comando: 'down', prefixo: '', permitir: '1', confirmacaoBackup: '2026-10-12\n', agora } as const;

describe('hojeEmBrasilia', () => {
  it('usa o dia de Brasília, não o UTC', () => {
    expect(hojeEmBrasilia(agora)).toBe('2026-10-12');
    expect(hojeEmBrasilia(new Date('2026-10-13T01:00:00Z'))).toBe('2026-10-12');
    expect(hojeEmBrasilia(new Date('2026-10-13T03:00:00Z'))).toBe('2026-10-13');
  });
});

describe('motivoDeRecusa (trava do down/redo)', () => {
  it('só vigia down e redo', () => {
    expect(motivoDeRecusa({ ...base, comando: 'up', permitir: undefined })).toBeNull();
    expect(motivoDeRecusa({ ...base, comando: 'status', permitir: undefined })).toBeNull();
  });
  it('com prefixo de teste, passa sem exigir nada', () => {
    expect(motivoDeRecusa({ ...base, prefixo: 't1_', permitir: undefined, confirmacaoBackup: undefined })).toBeNull();
  });
  it('sem prefixo e sem DSPD_PERMITIR_DOWN=1, recusa (down e redo)', () => {
    expect(motivoDeRecusa({ ...base, permitir: undefined })).toContain('down recusado');
    expect(motivoDeRecusa({ ...base, comando: 'redo', permitir: '0' })).toContain('redo recusado');
    expect(motivoDeRecusa({ ...base, permitir: 'true' })).toContain('DSPD_PERMITIR_DOWN=1');
  });
  it('permitido, mas sem backup de hoje confirmado, recusa', () => {
    expect(motivoDeRecusa({ ...base, confirmacaoBackup: undefined })).toContain('backup de hoje (2026-10-12)');
    expect(motivoDeRecusa({ ...base, confirmacaoBackup: '2026-10-11' })).toContain('não confirmado');
    expect(motivoDeRecusa({ ...base, confirmacaoBackup: '' })).toContain('não confirmado');
  });
  it('permitido e com o backup de hoje confirmado, segue', () => {
    expect(motivoDeRecusa(base)).toBeNull();
    expect(motivoDeRecusa({ ...base, comando: 'redo', confirmacaoBackup: '2026-10-12' })).toBeNull();
  });
});

describe('lerConfirmacaoBackup', () => {
  it('lê o arquivo; sem diretório ou sem arquivo devolve undefined', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dspd-bk-'));
    try {
      expect(lerConfirmacaoBackup(undefined)).toBeUndefined();
      expect(lerConfirmacaoBackup('')).toBeUndefined();
      expect(lerConfirmacaoBackup(dir)).toBeUndefined();
      writeFileSync(join(dir, ARQUIVO_BACKUP_OK), '2026-10-12\n');
      expect(lerConfirmacaoBackup(dir)).toBe('2026-10-12\n');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
