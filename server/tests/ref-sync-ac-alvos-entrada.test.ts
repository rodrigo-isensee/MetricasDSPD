import { afterEach, describe, expect, it, vi } from 'vitest';

// Pedido 099, D3: o `ac:ref-sync` grava os alvos de prioridade depois das listas, na mesma data, com o mesmo pool (papel dspd_ref); a saída segue
// só de contagens e hashes. Dublês no lugar do banco e dos arquivos.
const ENTRADA = new URL('../src/entradas/ref-sync-ac.ts', import.meta.url).pathname;

describe('entrada ac:ref-sync: alvos de prioridade (dublês)', () => {
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

  async function rodar(alvos: (E: new (m: string) => Error) => Promise<unknown>, dia = '2031-02-10') {
    const ordem: string[] = [];
    const end = vi.fn(() => Promise.resolve());
    const pool = { end };
    const criarPool = vi.fn(() => pool);
    class ErroDominio extends Error {}
    class ErroAlvos extends Error {}
    const sincronizarDominio = vi.fn(() => { ordem.push('dominio'); return Promise.resolve({ sha256: 'dom', listas: 3 }); });
    const sincronizarAlvos = vi.fn(() => { ordem.push('alvos'); return alvos(ErroAlvos); });
    const lerArquivoAlvos = vi.fn(() => ({ arquivo: {}, sha256: 'alv' }));
    vi.doMock('../src/plataforma/config.js', () => ({ carregarConfigRef: () => ({ LOG_LEVEL: 'silent', PG_REF_URL: 'postgres://segredo@host/db', DSPD_SCHEMA_PREFIXO: 'teste' }) }));
    vi.doMock('../src/plataforma/db/pool.js', () => ({ criarPool }));
    vi.doMock('../src/modulos/referencia/index.js', () => ({
      ErroDominio, ErroAlvos, dataCivilValida: (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d),
      lerDominio: () => ({ arquivo: {}, sha256: 'dom' }), lerArquivoAlvos, sincronizarDominio, sincronizarAlvos,
    }));
    const saida = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const erro = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    process.argv = [process.argv[0]!, ENTRADA, dia];
    await import('../src/entradas/ref-sync-ac.js');
    return { end, criarPool, sincronizarAlvos, sincronizarDominio, lerArquivoAlvos, ordem, saida, erro, ErroAlvos };
  }

  it('grava as listas e depois os alvos, na mesma data e no mesmo pool, e imprime só contagens e hashes', async () => {
    const r = await rodar(() => Promise.resolve({ sha256: 'alv', inseridos: 5, fechados: 0, versaoRegistrada: true }));
    expect(r.ordem).toEqual(['dominio', 'alvos']);
    expect(r.criarPool).toHaveBeenCalledTimes(1);
    expect((r.sincronizarAlvos.mock.calls as unknown[][])[0]![3]).toBe('2031-02-10');
    expect((r.sincronizarDominio.mock.calls as unknown[][])[0]![3]).toBe('2031-02-10');
    expect(JSON.parse(String(r.saida.mock.calls[0]![0]))).toEqual({
      vigenteDesde: '2031-02-10', sha256: 'dom', listas: 3, alvos: { sha256: 'alv', inseridos: 5, fechados: 0, versaoRegistrada: true },
    });
    expect(r.end).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBeUndefined();
  });

  it('recusa do carregador de alvos (ErroAlvos) sai com código 1 e a mensagem dele', async () => {
    const r = await rodar((E) => Promise.reject(new E('alvo P2: a data 2031-02-10 não é posterior à última vigência (2031-02-10); use uma data posterior')));
    expect(process.exitCode).toBe(1);
    expect(r.erro.mock.calls[0]![0]).toBe('ac:ref-sync falhou: alvo P2: a data 2031-02-10 não é posterior à última vigência (2031-02-10); use uma data posterior\n');
    expect(r.end).toHaveBeenCalledTimes(1);
  });

  it('erro de outra natureza sai com código 1 só com a categoria, sem vazar a URL nem o texto', async () => {
    const r = await rodar(() => Promise.reject(new Error('connect postgres://segredo@host/db')));
    expect(process.exitCode).toBe(1);
    expect(String(r.erro.mock.calls[0]![0])).not.toContain('segredo');
    expect(r.end).toHaveBeenCalledTimes(1);
  });
});
