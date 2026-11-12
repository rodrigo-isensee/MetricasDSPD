import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { lerAlvos } from '../src/modulos/metricas/repositorio.js';
import { ErroAlvos, analisarAlvos, lerArquivoAlvos, referenciaDaVersaoAlvos, sincronizarAlvos } from '../src/modulos/referencia/alvos-acelerato.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { poolDe, url } from './pg/ctx.js';

// Pedido 099, D3: migração 0036 (unidade por prazo de ref_alvo_prioridade) e carregador dos alvos contra o PostgreSQL. Conjunto de schemas próprio.
const d = describe.skipIf(!url);
const AGORA = new Date('2031-02-10T12:00:00Z');
const D1 = '2031-02-10';
const D2 = '2031-02-11';

d('0036 e o carregador de alvos contra PostgreSQL (papel dspd_ref)', () => {
  const P = prefixoDeTeste();
  const E = montarEsquemas(P);
  let dono: pg.Pool;
  let ref: pg.Pool;
  const T = `${E.ac}.ref_alvo_prioridade`;
  const colunas = async (): Promise<string[]> => (await dono.query<{ c: string }>(
    `SELECT column_name AS c FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'ref_alvo_prioridade' ORDER BY ordinal_position`, [E.ac])).rows.map((r) => r.c);
  const linhas = async (): Promise<Record<string, unknown>[]> => (await dono.query(`SELECT * FROM ${T} ORDER BY prioridade, vigente_de`)).rows;
  const limpar = (): Promise<unknown> => dono.query(`DELETE FROM ${T}`);

  beforeAll(async () => {
    await migrar(url!, { prefixo: P });
    dono = poolDe();
    ref = poolDe('dspd_ref');
  }, 120_000);
  afterAll(async () => {
    await ref.end();
    for (const e of [E.bm, E.ac, E.core]) await dono.query(`DROP SCHEMA IF EXISTS ${e} CASCADE`);
    await dono.end();
  });

  it('up: colunas de prazo renomeadas, unidade sem default, só corrido e util', async () => {
    expect(await colunas()).toEqual(['prioridade', 'vigente_de', 'vigente_ate', 'prazo_pa_horas', 'prazo_r_horas', 'unidade_pa', 'unidade_r']);
    await expect(dono.query(`INSERT INTO ${T} (prioridade, vigente_de, prazo_pa_horas, prazo_r_horas) VALUES ('X1', '2031-01-01', 1, 2)`)).rejects.toMatchObject({ code: '23502' });
    await expect(dono.query(`INSERT INTO ${T} (prioridade, vigente_de, prazo_pa_horas, unidade_pa, prazo_r_horas, unidade_r) VALUES ('X1', '2031-01-01', 1, 'dias', 2, 'util')`))
      .rejects.toMatchObject({ code: '23514' });
    await expect(dono.query(`INSERT INTO ${T} (prioridade, vigente_de, prazo_pa_horas, unidade_pa, prazo_r_horas, unidade_r) VALUES ('X1', '2031-01-01', 1, 'util', 2, 'Util')`))
      .rejects.toMatchObject({ code: '23514' });
    expect(await linhas()).toEqual([]);
  });

  it('down sem linha em tempo corrido: devolve os nomes e mantém as linhas e os valores; o up seguinte marca as existentes como util', async () => {
    await dono.query(`INSERT INTO ${T} (prioridade, vigente_de, prazo_pa_horas, unidade_pa, prazo_r_horas, unidade_r) VALUES ('X1', '2031-01-01', 1.5, 'util', 2, 'util')`);
    try {
      await migrar(url!, { prefixo: P, direcao: 'down', quantas: 1 });
      expect(await colunas()).toEqual(['prioridade', 'vigente_de', 'vigente_ate', 'prazo_pa_horas_uteis', 'prazo_r_horas_uteis']);
      expect((await dono.query(`SELECT prazo_pa_horas_uteis AS pa, prazo_r_horas_uteis AS r FROM ${T}`)).rows).toEqual([{ pa: '1.50', r: '2.00' }]);
      await migrar(url!, { prefixo: P });
      expect(await colunas()).toEqual(['prioridade', 'vigente_de', 'vigente_ate', 'prazo_pa_horas', 'prazo_r_horas', 'unidade_pa', 'unidade_r']);
      expect(await linhas()).toEqual([{ prioridade: 'X1', vigente_de: '2031-01-01', vigente_ate: null, prazo_pa_horas: '1.50', prazo_r_horas: '2.00', unidade_pa: 'util', unidade_r: 'util' }]);
    } finally {
      await limpar();
    }
  }, 120_000);

  it('down com linha em tempo corrido (em qualquer um dos dois prazos): recusa sem mudar nada; sem a linha, desfaz', async () => {
    for (const [upa, ur] of [['corrido', 'util'], ['util', 'corrido']] as const) {
      await dono.query(`INSERT INTO ${T} (prioridade, vigente_de, prazo_pa_horas, unidade_pa, prazo_r_horas, unidade_r) VALUES ('X2', '2031-01-01', 1, $1, 2, $2)`, [upa, ur]);
      const antes = await linhas();
      await expect(migrar(url!, { prefixo: P, direcao: 'down', quantas: 1 })).rejects.toThrow(/tem prazo em tempo corrido/);
      expect(await colunas()).toContain('unidade_pa');
      expect(await linhas()).toEqual(antes);
      await limpar();
    }
    await migrar(url!, { prefixo: P, direcao: 'down', quantas: 1 });
    expect(await colunas()).toEqual(['prioridade', 'vigente_de', 'vigente_ate', 'prazo_pa_horas_uteis', 'prazo_r_horas_uteis']);
    await migrar(url!, { prefixo: P });
    expect(await colunas()).toContain('unidade_r');
  }, 120_000);

  describe('carregador (sincronizarAlvos)', () => {
    const lido = lerArquivoAlvos();
    const trocaP2 = (): ReturnType<typeof analisarAlvos> => {
      const a = JSON.parse(JSON.stringify(lido.arquivo)) as typeof lido.arquivo;
      a.alvos[1]!.primeiro_atendimento.unidade = 'util';
      return analisarAlvos(JSON.stringify(a));
    };
    const versoes = async (): Promise<{ referencia: string; vigente_desde: string; metricas: string[] }[]> => (await dono.query<{ referencia: string; vigente_desde: string; metricas: string[] }>(
      `SELECT v.referencia, v.vigente_desde::text AS vigente_desde, array_agg(m.metrica_id ORDER BY m.metrica_id) AS metricas FROM ${E.core}.ref_versao_criterio v
       JOIN ${E.core}.ref_versao_criterio_metrica m USING (versao_id) WHERE v.referencia LIKE '099:alvos:%' GROUP BY v.versao_id ORDER BY v.vigente_desde, v.versao_id`)).rows;

    it('arquivo real: grava as 5 prioridades com a unidade de cada prazo e uma versão de critério só com a S1; repetir não muda nada', async () => {
      const r = await sincronizarAlvos(ref, E, lido, D1, AGORA);
      expect(r).toEqual({ sha256: lido.sha256, inseridos: 5, fechados: 0, versaoRegistrada: true });
      expect((await linhas()).map((l) => [l.prioridade, l.vigente_de, l.vigente_ate, l.prazo_pa_horas, l.unidade_pa, l.prazo_r_horas, l.unidade_r])).toEqual([
        ['P1', D1, null, '0.25', 'corrido', '4.00', 'corrido'], ['P2', D1, null, '0.50', 'corrido', '8.00', 'util'], ['P3', D1, null, '2.00', 'util', '16.00', 'util'],
        ['P4', D1, null, '4.00', 'util', '40.00', 'util'], ['P5', D1, null, '8.00', 'util', '80.00', 'util'],
      ]);
      expect(await versoes()).toEqual([{ referencia: referenciaDaVersaoAlvos(lido.sha256), vigente_desde: D1, metricas: ['S1', 'VISAO_GERAL'] }]);
      const antes = [await linhas(), await versoes()];
      for (const dia of [D1, D2]) expect(await sincronizarAlvos(ref, E, lido, dia, AGORA)).toEqual({ sha256: lido.sha256, inseridos: 0, fechados: 0, versaoRegistrada: false });
      expect([await linhas(), await versoes()]).toEqual(antes);
    });

    it('a leitura da API (lerAlvos) devolve só a vigente, com a unidade', async () => {
      expect((await lerAlvos(ref, E)).map((a) => [a.prioridade, a.prazo_pa_horas, a.unidade_pa, a.prazo_r_horas, a.unidade_r])).toEqual([
        ['P1', '0.25', 'corrido', '4.00', 'corrido'], ['P2', '0.50', 'corrido', '8.00', 'util'], ['P3', '2.00', 'util', '16.00', 'util'],
        ['P4', '4.00', 'util', '40.00', 'util'], ['P5', '8.00', 'util', '80.00', 'util'],
      ]);
    });

    it('trocar só a unidade de um prazo é nova vigência: a antiga fecha na data e fica, as outras prioridades não mudam, e há uma segunda versão', async () => {
      const b = trocaP2();
      expect(b.sha256).not.toBe(lido.sha256);
      const antes = (await linhas()).filter((l) => l.prioridade !== 'P2');
      await expect(sincronizarAlvos(ref, E, b, D1, AGORA)).rejects.toBeInstanceOf(ErroAlvos); // mesma data da vigência: recusa
      expect(await versoes()).toHaveLength(1);
      expect(await sincronizarAlvos(ref, E, b, D2, AGORA)).toEqual({ sha256: b.sha256, inseridos: 1, fechados: 1, versaoRegistrada: true });
      expect((await linhas()).filter((l) => l.prioridade === 'P2').map((l) => [l.vigente_de, l.vigente_ate, l.prazo_pa_horas, l.unidade_pa])).toEqual([
        [D1, D2, '0.50', 'corrido'], [D2, null, '0.50', 'util'],
      ]);
      expect((await linhas()).filter((l) => l.prioridade !== 'P2')).toEqual(antes);
      expect((await versoes()).map((v) => [v.vigente_desde, v.metricas])).toEqual([[D1, ['S1', 'VISAO_GERAL']], [D2, ['S1', 'VISAO_GERAL']]]);
      expect((await lerAlvos(ref, E)).find((a) => a.prioridade === 'P2')).toMatchObject({ unidade_pa: 'util' });
    });

    it('o papel dspd_ref só insere e fecha a vigência: não altera prazo nem unidade, nem apaga; a API só lê', async () => {
      for (const sql of [`UPDATE ${T} SET unidade_pa = 'util'`, `UPDATE ${T} SET prazo_pa_horas = 9`, `DELETE FROM ${T}`]) {
        await expect(ref.query(sql), sql).rejects.toMatchObject({ code: '42501' });
      }
      const api = poolDe('dspd_api');
      try {
        await expect(api.query(`SELECT unidade_pa, unidade_r, prazo_pa_horas, prazo_r_horas FROM ${T}`)).resolves.toBeDefined();
        await expect(api.query(`UPDATE ${T} SET unidade_pa = 'util'`)).rejects.toMatchObject({ code: '42501' });
      } finally {
        await api.end();
      }
    });

    it('volta ao arquivo original numa data posterior: reabre a unidade corrido (nova vigência), sem apagar a história', async () => {
      expect(await sincronizarAlvos(ref, E, lido, '2031-02-12', AGORA)).toMatchObject({ inseridos: 1, fechados: 1 });
      expect((await linhas()).filter((l) => l.prioridade === 'P2')).toHaveLength(3);
      expect((await lerAlvos(ref, E)).find((a) => a.prioridade === 'P2')).toMatchObject({ unidade_pa: 'corrido' });
    });
  });
});
