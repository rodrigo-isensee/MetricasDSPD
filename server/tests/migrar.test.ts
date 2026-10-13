import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { criarDublePg } from './duble-pg.js';

const configs: Record<string, unknown>[] = [];
const clientes: { query: ReturnType<typeof vi.fn>; end: ReturnType<typeof vi.fn> }[] = [];
let existe = true;
let papeis: { papel: string; conecta: boolean }[] = [];
vi.mock('pg', () => ({
  default: {
    Client: class {
      query = vi.fn((texto: string) => {
        if (texto.includes('FROM unnest($1::text[])')) return Promise.resolve({ rows: papeis });
        if (texto.startsWith('SELECT to_regnamespace')) return Promise.resolve({ rows: [{ ok: existe }] });
        if (texto.startsWith('SELECT n.nspname')) return Promise.resolve({ rows: [{ esquema: `${process.env.DSPD_SCHEMA_PREFIXO ?? ''}dspd_bm`, tabela: 'ctl_coleta', colunas: ['coleta_id'] }] });
        if (texto === 'GRANT FALHA') return Promise.reject(new Error('sem permissão'));
        return Promise.resolve({ rows: [] });
      });
      connect = vi.fn().mockResolvedValue(undefined);
      end = vi.fn().mockResolvedValue(undefined);
      constructor(c: Record<string, unknown>) { configs.push(c); clientes.push(this); }
    },
  },
}));
const runner = vi.fn();
vi.mock('node-pg-migrate', () => ({ runner: (o: unknown) => runner(o) }));

const { aplicarGrants, lerCatalogo, migrar, verificarPapeis } = await import('../src/plataforma/db/migrar.js');
const { montarEsquemas } = await import('../src/plataforma/db/esquemas.js');
const { PAPEIS } = await import('../src/plataforma/db/grants.js');
const TODOS = PAPEIS.map((papel) => ({ papel, conecta: true }));

beforeEach(() => { clientes.length = 0; configs.length = 0; existe = true; papeis = TODOS; runner.mockReset().mockResolvedValue([{ name: '0001_schemas' }]); });
afterEach(() => { delete process.env.DSPD_SCHEMA_PREFIXO; });

describe('migrar (runner do node-pg-migrate mockado)', () => {
  it('up: tabela de controle em S.core, checkOrder, prefixo por env restaurado, GRANTs aplicados e conexão fechada', async () => {
    process.env.DSPD_SCHEMA_PREFIXO = 'antes_';
    let visto = '';
    runner.mockImplementation(() => { visto = process.env.DSPD_SCHEMA_PREFIXO!; return Promise.resolve([{ name: '0001_schemas' }]); });
    const r = await migrar('postgres://x', { prefixo: 't_' });
    expect(visto).toBe('t_');
    expect(process.env.DSPD_SCHEMA_PREFIXO).toBe('antes_');
    expect(r.migracoes).toEqual(['0001_schemas']);
    expect(r.grants).toBeGreaterThan(0);
    const o = runner.mock.calls[0]![0] as Record<string, unknown>;
    expect(o).toMatchObject({ direction: 'up', migrationsTable: 'pgmigrations', migrationsSchema: 't_dspd_core', checkOrder: true, createMigrationsSchema: true });
    expect('count' in o).toBe(false);
    expect(o.singleTransaction).toBe(true);
    expect(configs[0]!.options).toBe('-c TimeZone=UTC -c lock_timeout=5s');
    expect(clientes[0]!.end).toHaveBeenCalled();
    const sqls = clientes[0]!.query.mock.calls.map((c) => c[0] as string);
    expect(sqls).toContain('BEGIN');
    expect(sqls).toContain('COMMIT');
  });
  it('down usa 1 por padrão; quantas explícito; sem prefixo a env some depois', async () => {
    runner.mockImplementationOnce((o: { log: (m: string) => void }) => { o.log('x'); return Promise.resolve([]); });
    await migrar('postgres://x', { direcao: 'down' });
    expect(runner.mock.calls[0]![0]).toMatchObject({ direction: 'down', count: 1 });
    await migrar('postgres://x', { direcao: 'down', quantas: 3, log: () => undefined });
    expect(runner.mock.calls[1]![0]).toMatchObject({ count: 3 });
    await migrar('postgres://x', { quantas: 2 });
    expect(runner.mock.calls[2]![0]).toMatchObject({ direction: 'up', count: 2 });
    expect(process.env.DSPD_SCHEMA_PREFIXO).toBeUndefined();
  });
  it('depois de um down completo (schemas inexistentes) não concede nada; erro do runner fecha a conexão', async () => {
    existe = false;
    expect((await migrar('postgres://x', { direcao: 'down' })).grants).toBe(0);
    runner.mockRejectedValueOnce(new Error('falhou'));
    await expect(migrar('postgres://x')).rejects.toThrow('falhou');
    expect(clientes.at(-1)!.end).toHaveBeenCalled();
  });
});

describe('catálogo e grants', () => {
  it('lerCatalogo agrupa por schema lógico', async () => {
    const { cliente } = criarDublePg(() => [{ esquema: 't_dspd_ac', tabela: 'dim_chamado', colunas: ['chamado_id'] }, { esquema: 't_dspd_core', tabela: 'outbox', colunas: ['evento_sk'] }]);
    expect(await lerCatalogo(cliente, montarEsquemas('t_'))).toEqual({ bm: {}, ac: { dim_chamado: ['chamado_id'] }, core: { outbox: ['evento_sk'] } });
  });
  it('aplicarGrants desfaz tudo se um GRANT falha', async () => {
    const { cliente, chamadas } = criarDublePg((c) => {
      if (c.texto.startsWith('SELECT to_regnamespace')) return [{ ok: true }];
      if (c.texto.startsWith('GRANT USAGE')) return new Error('sem permissão');
      return [];
    });
    await expect(aplicarGrants(cliente, montarEsquemas('t_'))).rejects.toThrow('sem permissão');
    expect(chamadas.at(-1)!.texto).toBe('ROLLBACK');
  });
});

describe('verificarPapeis (volume anterior à 0013)', () => {
  it('papel ausente: falha antes do runner, apontando o script de reparo', async () => {
    papeis = TODOS.filter((p) => p.papel !== 'dspd_pesquisa');
    await expect(migrar('postgres://x')).rejects.toThrow(/dspd_pesquisa.*reparar-papeis\.sh/);
    expect(runner).not.toHaveBeenCalled();
    expect(clientes[0]!.end).toHaveBeenCalled();
  });
  it('papel sem CONNECT: segue e avisa pelo log', async () => {
    papeis = TODOS.map((p) => ({ ...p, conecta: p.papel !== 'dspd_pesquisa' }));
    const log = vi.fn();
    await migrar('postgres://x', { log });
    expect(log).toHaveBeenCalledWith(expect.stringContaining('sem CONNECT neste database: dspd_pesquisa'));
    expect(runner).toHaveBeenCalled();
  });
  it('tudo em ordem: não avisa; down não verifica papéis', async () => {
    const { cliente, chamadas } = criarDublePg(() => TODOS);
    const log = vi.fn();
    await verificarPapeis(cliente, log);
    await verificarPapeis(cliente);
    expect(log).not.toHaveBeenCalled();
    expect(chamadas).toHaveLength(2);
    papeis = [];
    await expect(migrar('postgres://x', { direcao: 'down' })).resolves.toBeDefined();
  });
  it('sem log informado, o aviso de CONNECT é descartado', async () => {
    const { cliente } = criarDublePg(() => [{ papel: 'dspd_pesquisa', conecta: false }, ...TODOS.slice(0, -1)]);
    await expect(verificarPapeis(cliente)).resolves.toBeUndefined();
  });
});
