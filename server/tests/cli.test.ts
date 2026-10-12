import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const migrar = vi.fn();
const pool = { end: vi.fn().mockResolvedValue(undefined) };
const semear = vi.fn().mockResolvedValue('semeado');
const limpar = vi.fn().mockResolvedValue(['t1_dspd_bm']);
const cliente = { connect: vi.fn().mockResolvedValue(undefined), end: vi.fn().mockResolvedValue(undefined) };
const escrever = vi.fn();
const recusa = vi.fn<(e: unknown) => string | null>().mockReturnValue(null);
const confirmacao = vi.fn<(d: unknown) => string | undefined>().mockReturnValue('2026-10-12');
vi.mock('../src/plataforma/db/trava-down.js', () => ({ motivoDeRecusa: (e: unknown) => recusa(e), lerConfirmacaoBackup: (d: unknown) => confirmacao(d) }));
vi.mock('../src/plataforma/db/migrar.js', () => ({ migrar: (...a: unknown[]) => migrar(...a), DIR_MIGRACOES: '/tmp/x' }));
vi.mock('../src/plataforma/db/pool.js', () => ({ criarPool: () => pool }));
vi.mock('../src/plataforma/db/seed.js', () => ({ semear: (...a: unknown[]) => semear(...a) }));
vi.mock('../src/plataforma/db/limpar-testes.js', () => ({ limparTestes: () => limpar() }));
vi.mock('pg', () => ({ default: { Client: class { constructor() { return cliente; } } } }));
vi.mock('@metricas-dspd/mock', () => ({ gerarBaseMock: (o: unknown) => ({ opcoes: o }) }));
vi.mock('node:fs', () => ({ readdirSync: () => ['0002_b.ts', '0001_a.ts', 'checksums.json'], writeFileSync: (...a: unknown[]) => escrever(...a) }));

const ENV = ['DSPD_PERMITIR_DOWN', 'DSPD_BACKUP_DIR', 'PG_MIGRADOR_URL', 'PG_SEED_URL', 'PG_TESTE_URL', 'MOCK_SEMENTE', 'DSPD_SCHEMA_PREFIXO'];
const salvo = [...process.argv];
beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks();
  migrar.mockResolvedValue({ migracoes: ['a'], grants: 3 });
  recusa.mockReturnValue(null);
  for (const k of ENV) delete process.env[k];
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  process.argv = [...salvo];
});
afterEach(() => { vi.restoreAllMocks(); process.argv = salvo; });

describe('cli de migração', () => {
  it('exige PG_MIGRADOR_URL', async () => {
    await expect(import('../src/plataforma/db/cli.js')).rejects.toThrow('PG_MIGRADOR_URL ausente');
  });
  it('up por padrão, com o prefixo do ambiente e log', async () => {
    process.env.PG_MIGRADOR_URL = 'postgres://x';
    process.env.DSPD_SCHEMA_PREFIXO = 't_';
    await import('../src/plataforma/db/cli.js');
    expect(migrar).toHaveBeenCalledTimes(1);
    expect(migrar.mock.calls[0]![1]).toMatchObject({ direcao: 'up', prefixo: 't_' });
    (migrar.mock.calls[0]![1] as { log: (m: string) => void }).log('linha');
    expect(console.log).toHaveBeenCalledWith('linha');
    expect(console.log).toHaveBeenCalledWith('up: 1 migração(ões), 3 GRANT(s)');
  });
  it('down N e redo', async () => {
    process.env.PG_MIGRADOR_URL = 'postgres://x';
    process.argv[2] = 'down'; process.argv[3] = '2';
    await import('../src/plataforma/db/cli.js');
    expect(migrar.mock.calls[0]![1]).toMatchObject({ direcao: 'down', quantas: 2, prefixo: '' });
    vi.resetModules(); migrar.mockClear();
    process.argv[3] = undefined as never;
    await import('../src/plataforma/db/cli.js');
    expect(migrar.mock.calls[0]![1]).toMatchObject({ quantas: 1 });
    vi.resetModules(); migrar.mockClear();
    process.argv[2] = 'redo';
    await import('../src/plataforma/db/cli.js');
    expect(migrar.mock.calls.map((c) => (c[1] as { direcao: string }).direcao)).toEqual(['down', 'up']);
  });
});

describe('cli de migração: trava do down/redo (C2)', () => {
  it('repassa comando, prefixo, DSPD_PERMITIR_DOWN e a confirmação do backup; recusa antes de migrar', async () => {
    process.env.PG_MIGRADOR_URL = 'postgres://x';
    process.env.DSPD_PERMITIR_DOWN = '1';
    process.env.DSPD_BACKUP_DIR = '/mnt/backup';
    process.argv[2] = 'down';
    recusa.mockReturnValue('down recusado: motivo');
    await expect(import('../src/plataforma/db/cli.js')).rejects.toThrow('down recusado: motivo');
    expect(migrar).not.toHaveBeenCalled();
    expect(confirmacao).toHaveBeenCalledWith('/mnt/backup');
    expect(recusa.mock.calls[0]![0]).toMatchObject({ comando: 'down', prefixo: '', permitir: '1', confirmacaoBackup: '2026-10-12' });
  });
});

describe('cli de seed', () => {
  it('exige uma URL', async () => {
    await expect(import('../src/plataforma/db/seed-cli.js')).rejects.toThrow('PG_SEED_URL');
  });
  it('usa o migrador como fallback, mock padrão sem semente', async () => {
    process.env.PG_MIGRADOR_URL = 'postgres://x';
    await import('../src/plataforma/db/seed-cli.js');
    expect(semear).toHaveBeenCalledWith(pool, { opcoes: {} });
    expect(console.log).toHaveBeenCalledWith('semeado');
    expect(pool.end).toHaveBeenCalled();
  });
  it('MOCK_SEMENTE vira número e a conexão fecha mesmo com erro', async () => {
    process.env.PG_SEED_URL = 'postgres://x';
    process.env.MOCK_SEMENTE = '42';
    semear.mockRejectedValueOnce(new Error('x'));
    await expect(import('../src/plataforma/db/seed-cli.js')).rejects.toThrow('x');
    expect(semear).toHaveBeenCalledWith(pool, { opcoes: { semente: 42 } });
    expect(pool.end).toHaveBeenCalled();
  });
});

describe('cli de limpeza de testes e checksums', () => {
  it('limpar-testes exige PG_TESTE_URL e fecha a conexão', async () => {
    await expect(import('../src/plataforma/db/limpar-testes-cli.js')).rejects.toThrow('PG_TESTE_URL ausente');
    vi.resetModules();
    process.env.PG_TESTE_URL = 'postgres://x';
    await import('../src/plataforma/db/limpar-testes-cli.js');
    expect(console.log).toHaveBeenCalledWith('1 schema(s) de teste removido(s)');
    expect(cliente.end).toHaveBeenCalled();
  });
  it('checksums grava um hash por migração, em ordem', async () => {
    vi.doMock('/tmp/x/0001_a.ts', () => ({ ddl: () => ({ up: ['a'], down: ['b'] }) }));
    vi.doMock('/tmp/x/0002_b.ts', () => ({ ddl: () => ({ up: ['c'], down: ['d'] }) }));
    await import('../src/plataforma/db/checksums-cli.js');
    const json = JSON.parse(escrever.mock.calls[0]![1] as string) as Record<string, string>;
    expect(Object.keys(json)).toEqual(['0001_a', '0002_b']);
    expect(json['0001_a']).toMatch(/^[0-9a-f]{64}$/);
  });
});
