import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ErroDominio, analisarDominio, lerDominio, referenciaDaVersao, sincronizarDominio } from '../src/modulos/referencia/dominio-acelerato.js';
import type { PoolLike } from '../src/plataforma/db/pool.js';
import { carregarNaturezaPorPrefixo } from '../src/modulos/acelerato/projetor.js';
import { carregarListas } from '../src/modulos/acelerato/referencia.js';
import { poolDe, S, url } from './pg/ctx.js';

const d = describe.skipIf(!url);
const CAMPO = 'campo_personalizado';
const AGORA = new Date('2026-11-02T12:00:00Z');
const D1 = '2026-11-02';
const D2 = '2026-11-03';

const texto = (itens: [string, string][], extra = ''): string => JSON.stringify({
  versao: 1,
  versao_criterio: { dominio: 'acelerato', descricao: `Lista de teste ${extra}`, motivo: 'Teste do ac:ref-sync', referencia: 'teste' },
  schema: 'dspd_ac', tabela: 'ref_dominio', regra: 'teste', dominios: { [CAMPO]: itens.map(([codigo, rotulo]) => ({ codigo, rotulo })) },
});

d('ac:ref-sync contra PostgreSQL (papel dspd_ref, vigência e versão de critério)', () => {
  let ref: pg.Pool, coletor: pg.Pool;
  beforeAll(() => { ref = poolDe('dspd_ref'); coletor = poolDe('dspd_coletor'); });
  afterAll(async () => { await Promise.all([ref.end(), coletor.end()]); });

  /**
   * Tudo numa transação do papel de referência desfeita no fim (as tabelas de vigência não aceitam DELETE). O `COMMIT` do
   * sincronizador e o `BEGIN` dele ficam por conta da transação externa; o `ROLLBACK` final é o do teste.
   */
  async function comoRef(fn: (pool: PoolLike, c: pg.PoolClient) => Promise<void>): Promise<void> {
    const c = await ref.connect();
    const pool: PoolLike = {
      query: (t, v) => c.query(t, v),
      connect: () => Promise.resolve({ query: (t: string, v?: unknown[]) => (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(t) ? Promise.resolve({ rows: [], rowCount: 0 }) : c.query(t, v)), release: () => undefined }),
      end: () => Promise.resolve(),
    };
    try {
      await c.query('BEGIN');
      await fn(pool, c);
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
  }
  const linhas = async (c: pg.PoolClient): Promise<{ codigo: string; rotulo: string; vigente_de: string; vigente_ate: string | null; ordem: number }[]> =>
    (await c.query(`SELECT codigo, rotulo, vigente_de, vigente_ate, ordem FROM ${S.ac}.ref_dominio WHERE campo = $1 ORDER BY codigo, vigente_de`, [CAMPO])).rows;
  const versoes = async (c: pg.PoolClient, sha: string): Promise<number> =>
    Number((await c.query(`SELECT count(*) AS n FROM ${S.core}.ref_versao_criterio WHERE dominio = 'acelerato' AND referencia = $1`, [referenciaDaVersao(sha)])).rows[0].n);

  it('grava, repete sem duplicar e registra uma versão de critério só', async () => {
    await comoRef(async (pool, c) => {
      const lido = analisarDominio(texto([['t1', 'Um'], ['t2', 'Dois']]));
      expect(await sincronizarDominio(pool, S, lido, D1, AGORA)).toMatchObject({ inseridas: 2, fechadas: 0, versaoRegistrada: true });
      expect(await linhas(c)).toEqual([
        { codigo: 't1', rotulo: 'Um', vigente_de: D1, vigente_ate: null, ordem: 0 },
        { codigo: 't2', rotulo: 'Dois', vigente_de: D1, vigente_ate: null, ordem: 1 },
      ]);
      expect(await sincronizarDominio(pool, S, lido, D1, AGORA)).toMatchObject({ inseridas: 0, fechadas: 0, versaoRegistrada: false });
      expect(await sincronizarDominio(pool, S, lido, D2, AGORA)).toMatchObject({ inseridas: 0, fechadas: 0 });
      expect(await linhas(c)).toHaveLength(2);
      expect(await versoes(c, lido.sha256)).toBe(1);
      const v = await c.query(`SELECT vigente_desde FROM ${S.core}.ref_versao_criterio WHERE referencia = $1`, [referenciaDaVersao(lido.sha256)]);
      expect(v.rows).toEqual([{ vigente_desde: D1 }]);
    });
  });

  it('E4.42: o arquivo real grava etapa, prioridade e natureza_prefixo (nome com acento e prefixo com espaço) e a coleta os lê de volta', async () => {
    await comoRef(async (pool) => {
      const real = lerDominio();
      const r = await sincronizarDominio(pool, S, real, D1, AGORA);
      expect(r.versaoRegistrada).toBe(true);
      const listas = await carregarListas(pool, S);
      const d = real.arquivo.dominios;
      expect(listas.etapas.size).toBe(d.etapa!.length);
      expect(listas.prioridades.has('SSSC - REQUISIÇÃO - MÉDIA')).toBe(true);
      expect(listas.etapas.has('Aguardando Janela de Mudança (Deploy Produção)')).toBe(true);
      const natureza = await carregarNaturezaPorPrefixo(pool, S);
      expect([...natureza]).toEqual([['SSSC-I-', 'incidente'], ['SSSC-I ', 'incidente'], ['SSSC-R-', 'requisicao'], ['SSSC-R ', 'requisicao']]);
    });
  });

  it('mudança de lista fecha a vigência, abre a nova e abre uma versão nova; a história permanece', async () => {
    await comoRef(async (pool, c) => {
      const v1 = analisarDominio(texto([['t1', 'Um'], ['t2', 'Dois']]));
      await sincronizarDominio(pool, S, v1, D1, AGORA);
      const v2 = analisarDominio(texto([['t1', 'Um corrigido'], ['t3', 'Tres']]));
      expect(await sincronizarDominio(pool, S, v2, D2, AGORA)).toMatchObject({ inseridas: 2, fechadas: 2, versaoRegistrada: true });
      expect(await linhas(c)).toEqual([
        { codigo: 't1', rotulo: 'Um', vigente_de: D1, vigente_ate: D2, ordem: 0 },
        { codigo: 't1', rotulo: 'Um corrigido', vigente_de: D2, vigente_ate: null, ordem: 0 },
        { codigo: 't2', rotulo: 'Dois', vigente_de: D1, vigente_ate: D2, ordem: 1 },
        { codigo: 't3', rotulo: 'Tres', vigente_de: D2, vigente_ate: null, ordem: 1 },
      ]);
      expect(await versoes(c, v1.sha256)).toBe(1);
      expect(await versoes(c, v2.sha256)).toBe(1);
      expect(v1.sha256).not.toBe(v2.sha256);
    });
  });

  it('mudança no mesmo dia da vigência aberta é recusada e nada é gravado (nunca sobrescreve)', async () => {
    await comoRef(async (pool, c) => {
      await sincronizarDominio(pool, S, analisarDominio(texto([['t1', 'Um']])), D1, AGORA);
      const antes = await linhas(c);
      await expect(sincronizarDominio(pool, S, analisarDominio(texto([['t1', 'Outro']])), D1, AGORA)).rejects.toBeInstanceOf(ErroDominio);
      expect(await linhas(c)).toEqual(antes);
    });
  });

  it('data retroativa é recusada (sem sobreposição nem versão com data passada) e nada é gravado', async () => {
    await comoRef(async (pool, c) => {
      await sincronizarDominio(pool, S, analisarDominio(texto([['t1', 'Um']])), D2, AGORA);
      const v2 = analisarDominio(texto([['t1', 'Um corrigido']]));
      const antes = await linhas(c);
      await expect(sincronizarDominio(pool, S, v2, D1, AGORA)).rejects.toThrow(/anterior à última vigência/);
      expect(await linhas(c)).toEqual(antes);
      expect(await versoes(c, v2.sha256)).toBe(0);
      // Vigência já fechada também conta: depois de fechar em D3, D2 é retroativa.
      await sincronizarDominio(pool, S, v2, '2026-11-04', AGORA);
      await expect(sincronizarDominio(pool, S, analisarDominio(texto([['t1', 'Terceiro']])), D2, AGORA)).rejects.toBeInstanceOf(ErroDominio);
      expect(await linhas(c)).toHaveLength(2);
    });
  });

  it('o arquivo real do repositório entra pelo papel de referência (categoria 135 e descrição do workflow 19)', async () => {
    await comoRef(async (pool, c) => {
      const lido = lerDominio();
      const r = await sincronizarDominio(pool, S, lido, D1, AGORA);
      expect(r.sha256).toBe(lido.sha256);
      const n = async (campo: string): Promise<number> =>
        Number((await c.query(`SELECT count(*) AS n FROM ${S.ac}.ref_dominio WHERE campo = $1 AND vigente_ate IS NULL`, [campo])).rows[0].n);
      expect(await n('categoria')).toBe(135);
      expect(await n('descricao_workflow')).toBe(19);
      expect(await sincronizarDominio(pool, S, lido, D2, AGORA)).toMatchObject({ inseridas: 0, fechadas: 0, versaoRegistrada: false });
    });
  });

  it('privilégios: o papel de referência só fecha a vigência (outro UPDATE e DELETE são recusados) e o coletor não escreve', async () => {
    await comoRef(async (pool, c) => {
      await sincronizarDominio(pool, S, analisarDominio(texto([['t1', 'Um']])), D1, AGORA);
      const recusa = async (sql: string): Promise<string | undefined> => {
        await c.query('SAVEPOINT s');
        try { await c.query(sql); } catch (e) { await c.query('ROLLBACK TO SAVEPOINT s'); return (e as { code?: string }).code; }
        throw new Error(`esperava recusa: ${sql}`);
      };
      expect(await recusa(`UPDATE ${S.ac}.ref_dominio SET rotulo = 'x' WHERE campo = '${CAMPO}'`)).toBe('42501');
      expect(await recusa(`DELETE FROM ${S.ac}.ref_dominio WHERE campo = '${CAMPO}'`)).toBe('42501');
    });
    await expect(coletor.query(`INSERT INTO ${S.ac}.ref_dominio (campo, codigo, vigente_de, rotulo, ordem) VALUES ('${CAMPO}', 'x', '${D1}', 'x', 0)`))
      .rejects.toMatchObject({ code: '42501' });
  });
});
