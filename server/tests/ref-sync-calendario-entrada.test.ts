import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ambienteFilho } from './ajuda-cli-filho.js';

const ENTRADA = new URL('../src/entradas/ref-sync-calendario.ts', import.meta.url).pathname;

describe('entrada ref:sync-calendario: argumento de data e uso', () => {
  it.each(['2026-02-30', '2026-13-01', 'ontem'])('data %s é recusada com a mensagem de uso e código 2, antes de ler a configuração', (data) => {
    const r = spawnSync(process.execPath, ['--import', 'tsx', ENTRADA, data], { encoding: 'utf8', env: ambienteFilho(), timeout: 60_000 });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('uso: ref:sync-calendario [AAAA-MM-DD]');
    expect(r.stdout).toBe('');
  });

  it('argumento a mais também é recusado com o uso e código 2', () => {
    const r = spawnSync(process.execPath, ['--import', 'tsx', ENTRADA, '2026-05-01', 'extra'], { encoding: 'utf8', env: ambienteFilho(), timeout: 60_000 });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('uso: ref:sync-calendario [AAAA-MM-DD]');
  });

  it('sem configuração do banco falha com código 1 e a categoria com o nome da variável, sem vazar detalhe', () => {
    const r = spawnSync(process.execPath, ['--import', 'tsx', ENTRADA, '2026-05-01'], { encoding: 'utf8', env: ambienteFilho(), timeout: 60_000 });
    expect(r.status).toBe(1);
    expect(r.stderr).toBe('ref:sync-calendario falhou: configuração: PG_REF_URL\n');
    expect(r.stdout).toBe('');
  });
});

describe('entrada ref:sync-calendario: execução com dublês (sem banco, sem arquivo real)', () => {
  const argvOriginal = process.argv;
  afterEach(() => {
    process.argv = argvOriginal;
    process.exitCode = undefined;
    vi.restoreAllMocks();
    vi.resetModules();
    vi.doUnmock('../src/plataforma/config.js');
    vi.doUnmock('../src/plataforma/db/pool.js');
    vi.doUnmock('../src/modulos/referencia/index.js');
  });

  async function rodar(sincronizar: () => Promise<unknown>, dia = '2031-02-10') {
    const end = vi.fn(() => Promise.resolve());
    const criarPool = vi.fn(() => ({ end }));
    const sincronizarCalendario = vi.fn(sincronizar);
    class ErroCalendario extends Error {}
    vi.doMock('../src/plataforma/config.js', () => ({ carregarConfigRef: () => ({ LOG_LEVEL: 'silent', PG_REF_URL: 'postgres://segredo@host/db', DSPD_SCHEMA_PREFIXO: 'teste' }) }));
    vi.doMock('../src/plataforma/db/pool.js', () => ({ criarPool }));
    vi.doMock('../src/modulos/referencia/index.js', () => ({
      ErroCalendario,
      dataCivilValida: (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d),
      lerCalendario: () => ({ arquivo: {}, sha256: 'abc' }),
      sincronizarCalendario,
    }));
    const saida = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const erro = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    process.argv = [process.argv[0]!, ENTRADA, dia];
    await import('../src/entradas/ref-sync-calendario.js');
    return { end, criarPool, sincronizarCalendario, saida, erro, ErroCalendario };
  }

  it('caminho feliz: sincroniza com a data dada, imprime só contagens e hash, e fecha o pool', async () => {
    const r = await rodar(() => Promise.resolve({ sha256: 'abc', dominios: [], feriadosDivergentes: 0 }));
    expect(r.sincronizarCalendario).toHaveBeenCalledOnce();
    expect(r.sincronizarCalendario.mock.calls[0]).toEqual(expect.arrayContaining(['2031-02-10']));
    expect(r.saida).toHaveBeenCalledWith(`${JSON.stringify({ vigenteDesde: '2031-02-10', sha256: 'abc', dominios: [], feriadosDivergentes: 0 })}\n`);
    expect(JSON.stringify(r.saida.mock.calls)).not.toContain('segredo');
    expect(r.end).toHaveBeenCalledOnce();
    expect(process.exitCode).toBeUndefined();
  });

  it('erro do banco: código 1, só a categoria sem o texto do erro, e fecha o pool', async () => {
    const r = await rodar(() => Promise.reject(new Error('password authentication failed for user dspd_ref')));
    expect(process.exitCode).toBe(1);
    const texto = r.erro.mock.calls.map((c) => String(c[0])).join('');
    expect(texto).toBe('ref:sync-calendario falhou: outro\n');
    expect(texto).not.toContain('password');
    expect(r.end).toHaveBeenCalledOnce();
  });

  it.each([['28P01', 'autenticação'], ['ECONNREFUSED', 'conexão']])('erro do banco com código %s imprime só a categoria %s', async (code, categoria) => {
    const r = await rodar(() => Promise.reject(Object.assign(new Error('falha em postgres://segredo@host/db'), { code })));
    const texto = r.erro.mock.calls.map((c) => String(c[0])).join('');
    expect(texto).toBe(`ref:sync-calendario falhou: ${categoria}\n`);
    expect(process.exitCode).toBe(1);
  });
});
