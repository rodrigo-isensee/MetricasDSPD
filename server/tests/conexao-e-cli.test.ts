import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fake = { destroy: vi.fn().mockResolvedValue(undefined) };
const migrator = { migrateToLatest: vi.fn(), migrateDown: vi.fn() };
const execute = vi.fn().mockResolvedValue(undefined);
const linhas = vi.fn();

vi.mock('../src/db/migracoes.js', () => ({
  conectar: () => fake,
  criarMigrator: () => migrator,
}));
vi.mock('kysely', async (orig) => ({
  ...(await orig<typeof import('kysely')>()),
  sql: Object.assign(
    () => ({ execute: () => Promise.resolve({ rows: linhas() }) }),
    { raw: (s: string) => ({ execute: () => execute(s) }) },
  ),
}));
const semear = vi.fn().mockResolvedValue('semeado');
vi.mock('../src/db/seed.js', () => ({ semear: (...a: unknown[]) => semear(...a) }));
vi.mock('@metricas-dspd/mock', () => ({ gerarBaseMock: (o: unknown) => ({ opcoes: o }) }));

const ENV = ['MYSQL_MIGRADOR_URL', 'MYSQL_GRANTS_URL', 'MYSQL_SEED_URL', 'MOCK_SEMENTE'];
const salvo = [...process.argv];
let exit: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  for (const k of ENV) delete process.env[k];
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
  process.argv = [...salvo];
});
afterEach(() => { vi.restoreAllMocks(); process.argv = salvo; });

describe('cli de migração', () => {
  it('exige MYSQL_MIGRADOR_URL', async () => {
    await expect(import('../src/db/cli.js')).rejects.toThrow('MYSQL_MIGRADOR_URL ausente');
  });
  it('up por padrão, lista resultados e encerra a conexão', async () => {
    process.env.MYSQL_MIGRADOR_URL = 'mysql://x';
    migrator.migrateToLatest.mockResolvedValue({ results: [{ direction: 'Up', migrationName: '0001', status: 'Success' }] });
    await import('../src/db/cli.js');
    expect(migrator.migrateToLatest).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Up 0001: Success');
    expect(fake.destroy).toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });
  it('down com erro sai com código 1; sem results não lista', async () => {
    process.env.MYSQL_MIGRADOR_URL = 'mysql://x';
    process.argv[2] = 'down';
    migrator.migrateDown.mockResolvedValue({ error: new Error('falhou') });
    await import('../src/db/cli.js');
    expect(migrator.migrateDown).toHaveBeenCalled();
    expect(exit).toHaveBeenCalledWith(1);
  });
});

describe('cli de grants', () => {
  it('exige MYSQL_GRANTS_URL', async () => {
    await expect(import('../src/db/grants-cli.js')).rejects.toThrow('MYSQL_GRANTS_URL ausente');
  });
  it('aplica os GRANTs gerados a partir das tabelas reais', async () => {
    process.env.MYSQL_GRANTS_URL = 'mysql://x';
    linhas.mockReturnValue([{ n: 'ref_x' }]);
    await import('../src/db/grants-cli.js');
    expect(execute).toHaveBeenCalled();
    expect(String(execute.mock.calls[0]![0])).toMatch(/^GRANT /);
    expect(console.log).toHaveBeenCalledWith(`${execute.mock.calls.length} GRANTs aplicados`);
    expect(fake.destroy).toHaveBeenCalled();
  });
});

describe('cli de seed', () => {
  it('exige uma URL', async () => {
    await expect(import('../src/db/seed-cli.js')).rejects.toThrow('MYSQL_SEED_URL');
  });
  it('usa o migrador como fallback, mock padrão sem semente', async () => {
    process.env.MYSQL_MIGRADOR_URL = 'mysql://x';
    await import('../src/db/seed-cli.js');
    expect(semear).toHaveBeenCalledWith(fake, { opcoes: {} });
    expect(console.log).toHaveBeenCalledWith('semeado');
    expect(fake.destroy).toHaveBeenCalled();
  });
  it('MOCK_SEMENTE vira número e a conexão fecha mesmo com erro', async () => {
    process.env.MYSQL_SEED_URL = 'mysql://x';
    process.env.MOCK_SEMENTE = '42';
    semear.mockRejectedValueOnce(new Error('x'));
    await expect(import('../src/db/seed-cli.js')).rejects.toThrow('x');
    expect(semear).toHaveBeenCalledWith(fake, { opcoes: { semente: 42 } });
    expect(fake.destroy).toHaveBeenCalled();
  });
});
