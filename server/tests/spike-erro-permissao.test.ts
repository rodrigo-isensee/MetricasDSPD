import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// O erro de permissão ao criar a saída é simulado no `mkdir` (EACCES), sem depender de rodar como não-root:
// como root o sistema operacional não nega a criação, e o ramo de spike.ts ficaria sem cobertura.
vi.mock('node:fs/promises', async (importOriginal) => {
  const real = await importOriginal<typeof import('node:fs/promises')>();
  return {
    ...real,
    mkdir: vi.fn(() => Promise.reject(Object.assign(new Error('EACCES: permission denied, mkdir'), { code: 'EACCES' }))),
  };
});

const { executarSpike } = await import('../src/modulos/businessmap/spike.js');

let tmp: string;
beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), 'spike-perm-'));
});
afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

describe('F1: erro de permissão ao preparar a saída', () => {
  it('mkdir negado (EACCES): código 2 com mensagem limpa, sem rede', async () => {
    const chamadas: string[] = [];
    const r = await executarSpike({
      env: { BUSINESSMAP_URL_BASE: 'http://127.0.0.1:1', BUSINESSMAP_APIKEY: 'chave-de-teste-0123456789', BUSINESSMAP_QUADROS_IDS: '10' },
      dirSaida: join(tmp, 'saida'),
      raizRepositorio: join(tmp, 'repo'),
      textoConferencia: '',
      fetch: (() => {
        chamadas.push('fetch');
        return Promise.reject(new Error('rede não deve ser usada'));
      }) as unknown as typeof fetch,
    } as Parameters<typeof executarSpike>[0]);
    expect(r).toEqual({ codigo: 2, saida: '', erro: 'não foi possível preparar o diretório da saída bruta (EACCES)' });
    expect(chamadas).toHaveLength(0);
  });
});
