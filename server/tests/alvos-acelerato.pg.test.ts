import type pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { lerAlvos } from '../src/modulos/metricas/repositorio.js';
import { ErroAlvos, analisarAlvos, lerArquivoAlvos, referenciaDaVersaoAlvos, sincronizarAlvos } from '../src/modulos/referencia/alvos-acelerato.js';
import { lerCalendario, sincronizarCalendario } from '../src/modulos/referencia/calendario.js';
import { montarEsquemas, prefixoDeTeste } from '../src/plataforma/db/esquemas.js';
import { migrar } from '../src/plataforma/db/migrar.js';
import { poolDe, url } from './pg/ctx.js';

// Pedido 099, D3 e K-314: migrações 0036 (relógio por prazo de ref_alvo_prioridade) e 0037 (unidade de exibição) e carregador dos alvos contra o PostgreSQL. Conjunto de schemas próprio.
const d = describe.skipIf(!url);
const AGORA = new Date('2031-02-10T12:00:00Z');
const D1 = '2031-02-10';
const D2 = '2031-02-11';

d('0036, 0037 e o carregador de alvos contra PostgreSQL (papel dspd_ref)', () => {
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

  const COLUNAS = ['prioridade', 'vigente_de', 'vigente_ate', 'prazo_pa_horas', 'prazo_r_horas', 'unidade_pa', 'unidade_r', 'exibir_pa', 'exibir_r'];
  const ANTIGAS = ['prioridade', 'vigente_de', 'vigente_ate', 'prazo_pa_horas_uteis', 'prazo_r_horas_uteis'];
  const ins = (p: string, upa: string, ur: string, epa: string | null, er: string | null): Promise<unknown> => dono.query(
    `INSERT INTO ${T} (prioridade, vigente_de, prazo_pa_horas, unidade_pa, prazo_r_horas, unidade_r, exibir_pa, exibir_r) VALUES ($1, '2031-01-01', 1, $2, 2, $3, $4, $5)`, [p, upa, ur, epa, er]);

  it('up: colunas de prazo renomeadas, unidade sem default, só corrido e util', async () => {
    expect(await colunas()).toEqual(COLUNAS);
    await expect(dono.query(`INSERT INTO ${T} (prioridade, vigente_de, prazo_pa_horas, prazo_r_horas) VALUES ('X1', '2031-01-01', 1, 2)`)).rejects.toMatchObject({ code: '23502' });
    await expect(dono.query(`INSERT INTO ${T} (prioridade, vigente_de, prazo_pa_horas, unidade_pa, prazo_r_horas, unidade_r) VALUES ('X1', '2031-01-01', 1, 'dias', 2, 'util')`))
      .rejects.toMatchObject({ code: '23514' });
    await expect(dono.query(`INSERT INTO ${T} (prioridade, vigente_de, prazo_pa_horas, unidade_pa, prazo_r_horas, unidade_r) VALUES ('X1', '2031-01-01', 1, 'util', 2, 'Util')`))
      .rejects.toMatchObject({ code: '23514' });
    expect(await linhas()).toEqual([]);
  });

  it('0037 (K-314): exibir_pa e exibir_r nulos e sem default, só min, h e dia, preenchidos em par, e "dia" só em relógio útil', async () => {
    try {
      await ins('X3', 'util', 'util', null, null); // linha antiga (anterior ao K-314): nula, sem inferência
      expect((await linhas()).map((l) => [l.exibir_pa, l.exibir_r])).toEqual([[null, null]]);
      await limpar();
      for (const [epa, er] of [['min', 'h'], ['h', 'dia'], ['dia', 'dia']] as const) { await ins('X3', 'util', 'util', epa, er); await limpar(); }
      await ins('X3', 'corrido', 'corrido', 'min', 'h'); await limpar();
      for (const [epa, er] of [['semana', 'h'], ['h', 'Dia'], ['', 'h']] as const) await expect(ins('X3', 'util', 'util', epa, er)).rejects.toMatchObject({ code: '23514' });
      for (const [epa, er] of [['h', null], [null, 'h']] as const) await expect(ins('X3', 'util', 'util', epa, er)).rejects.toMatchObject({ code: '23514', constraint: 'ck_ref_alvo_exibir_par' });
      for (const [upa, ur, epa, er] of [['corrido', 'util', 'dia', 'h'], ['util', 'corrido', 'h', 'dia']] as const) {
        await expect(ins('X3', upa, ur, epa, er)).rejects.toMatchObject({ code: '23514', constraint: 'ck_ref_alvo_exibir_relogio' });
      }
      expect(await linhas()).toEqual([]);
    } finally {
      await limpar();
    }
  });

  it('0037: o down tira as duas colunas e as restrições sem tocar nos prazos; o up seguinte devolve as colunas nulas', async () => {
    await ins('X4', 'util', 'util', 'h', 'dia');
    try {
      await migrar(url!, { prefixo: P, direcao: 'down', quantas: 1 });
      expect(await colunas()).toEqual(COLUNAS.slice(0, 7));
      expect((await dono.query(`SELECT prazo_pa_horas AS pa, unidade_pa AS u FROM ${T}`)).rows).toEqual([{ pa: '1.00', u: 'util' }]);
      await migrar(url!, { prefixo: P });
      expect(await colunas()).toEqual(COLUNAS);
      expect((await linhas()).map((l) => [l.exibir_pa, l.exibir_r])).toEqual([[null, null]]);
    } finally {
      await limpar();
    }
  }, 120_000);

  it('down sem linha em tempo corrido: devolve os nomes e mantém as linhas e os valores; o up seguinte marca as existentes como util', async () => {
    await dono.query(`INSERT INTO ${T} (prioridade, vigente_de, prazo_pa_horas, unidade_pa, prazo_r_horas, unidade_r) VALUES ('X1', '2031-01-01', 1.5, 'util', 2, 'util')`);
    try {
      await migrar(url!, { prefixo: P, direcao: 'down', quantas: 2 }); // 0037 e 0036
      expect(await colunas()).toEqual(ANTIGAS);
      expect((await dono.query(`SELECT prazo_pa_horas_uteis AS pa, prazo_r_horas_uteis AS r FROM ${T}`)).rows).toEqual([{ pa: '1.50', r: '2.00' }]);
      await migrar(url!, { prefixo: P });
      expect(await colunas()).toEqual(COLUNAS);
      expect(await linhas()).toEqual([{ prioridade: 'X1', vigente_de: '2031-01-01', vigente_ate: null, prazo_pa_horas: '1.50', prazo_r_horas: '2.00', unidade_pa: 'util', unidade_r: 'util', exibir_pa: null, exibir_r: null }]);
    } finally {
      await limpar();
    }
  }, 120_000);

  it('down com linha em tempo corrido (em qualquer um dos dois prazos): recusa sem mudar nada; sem a linha, desfaz', async () => {
    for (const [upa, ur] of [['corrido', 'util'], ['util', 'corrido']] as const) {
      await dono.query(`INSERT INTO ${T} (prioridade, vigente_de, prazo_pa_horas, unidade_pa, prazo_r_horas, unidade_r) VALUES ('X2', '2031-01-01', 1, $1, 2, $2)`, [upa, ur]);
      const antes = await linhas();
      await expect(migrar(url!, { prefixo: P, direcao: 'down', quantas: 2 })).rejects.toThrow(/tem prazo em tempo corrido/);
      expect(await colunas()).toEqual(COLUNAS); // o lote é uma transação só: a 0037 também não foi desfeita
      expect(await linhas()).toEqual(antes);
      await limpar();
    }
    await migrar(url!, { prefixo: P, direcao: 'down', quantas: 2 });
    expect(await colunas()).toEqual(ANTIGAS);
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

    it('Decisão 13: sem o expediente de 528 min gravado (ref:sync-calendario antes), o carregador recusa e nada é gravado', async () => {
      await expect(sincronizarAlvos(ref, E, lido, D1, AGORA)).rejects.toThrow(/difere do expediente gravado da Sustentação \(0 min\); rode o ref:sync-calendario antes/);
      expect(await linhas()).toEqual([]);
      await sincronizarCalendario(ref, E, lerCalendario(), D1, AGORA);
    });

    it('arquivo real: grava as 5 prioridades com a unidade de cada prazo e uma versão de critério só com a S1; repetir não muda nada', async () => {
      const r = await sincronizarAlvos(ref, E, lido, D1, AGORA);
      expect(r).toEqual({ sha256: lido.sha256, inseridos: 5, fechados: 0, versaoRegistrada: true });
      expect((await linhas()).map((l) => [l.prioridade, l.vigente_de, l.vigente_ate, l.prazo_pa_horas, l.unidade_pa, l.prazo_r_horas, l.unidade_r])).toEqual([
        ['P1', D1, null, '0.25', 'corrido', '4.00', 'corrido'], ['P2', D1, null, '0.50', 'corrido', '8.00', 'util'], ['P3', D1, null, '2.00', 'util', '17.60', 'util'],
        ['P4', D1, null, '4.00', 'util', '44.00', 'util'], ['P5', D1, null, '8.80', 'util', '88.00', 'util'],
      ]);
      expect(await versoes()).toEqual([{ referencia: referenciaDaVersaoAlvos(lido.sha256), vigente_desde: D1, metricas: ['S1', 'VISAO_GERAL'] }]);
      const antes = [await linhas(), await versoes()];
      for (const dia of [D1, D2]) expect(await sincronizarAlvos(ref, E, lido, dia, AGORA)).toEqual({ sha256: lido.sha256, inseridos: 0, fechados: 0, versaoRegistrada: false });
      expect([await linhas(), await versoes()]).toEqual(antes);
    });

    it('arquivo real: cada prazo grava a unidade de exibição do PROC (min, h ou dia)', async () => {
      expect((await linhas()).map((l) => [l.prioridade, l.exibir_pa, l.exibir_r])).toEqual([
        ['P1', 'min', 'h'], ['P2', 'min', 'h'], ['P3', 'h', 'dia'], ['P4', 'h', 'dia'], ['P5', 'dia', 'dia'],
      ]);
      expect((await lerAlvos(ref, E)).map((a) => [a.prioridade, a.exibir_pa, a.exibir_r])).toEqual([
        ['P1', 'min', 'h'], ['P2', 'min', 'h'], ['P3', 'h', 'dia'], ['P4', 'h', 'dia'], ['P5', 'dia', 'dia'],
      ]);
    });

    it('a leitura da API (lerAlvos) devolve só a vigente, com a unidade', async () => {
      expect((await lerAlvos(ref, E)).map((a) => [a.prioridade, a.prazo_pa_horas, a.unidade_pa, a.prazo_r_horas, a.unidade_r])).toEqual([
        ['P1', '0.25', 'corrido', '4.00', 'corrido'], ['P2', '0.50', 'corrido', '8.00', 'util'], ['P3', '2.00', 'util', '17.60', 'util'],
        ['P4', '4.00', 'util', '44.00', 'util'], ['P5', '8.80', 'util', '88.00', 'util'],
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
      for (const sql of [`UPDATE ${T} SET unidade_pa = 'util'`, `UPDATE ${T} SET prazo_pa_horas = 9`, `UPDATE ${T} SET exibir_pa = 'h'`, `UPDATE ${T} SET exibir_r = NULL`, `DELETE FROM ${T}`]) {
        await expect(ref.query(sql), sql).rejects.toMatchObject({ code: '42501' });
      }
      const api = poolDe('dspd_api');
      try {
        await expect(api.query(`SELECT unidade_pa, unidade_r, prazo_pa_horas, prazo_r_horas, exibir_pa, exibir_r FROM ${T}`)).resolves.toBeDefined();
      await expect(api.query(`UPDATE ${T} SET exibir_pa = 'h'`)).rejects.toMatchObject({ code: '42501' });
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

    it('K-314: vigentes anteriores à migração (exibição nula) viram 5 novas vigências com a unidade, sem versão de critério; no mesmo dia a guarda recusa', async () => {
      await limpar();
      const antes = await versoes();
      for (const a of lido.arquivo.alvos) {
        await dono.query(`INSERT INTO ${T} (prioridade, vigente_de, prazo_pa_horas, unidade_pa, prazo_r_horas, unidade_r) VALUES ($1, '2031-03-01', $2, $3, $4, $5)`,
          [a.prioridade, a.primeiro_atendimento.horas, a.primeiro_atendimento.unidade, a.restauracao.horas, a.restauracao.unidade]);
      }
      await expect(sincronizarAlvos(ref, E, lido, '2031-03-01', AGORA)).rejects.toThrow(/não é posterior à última vigência \(2031-03-01\); use uma data posterior/);
      expect(await sincronizarAlvos(ref, E, lido, '2031-03-02', AGORA)).toEqual({ sha256: lido.sha256, inseridos: 5, fechados: 5, versaoRegistrada: false });
      expect((await linhas()).map((l) => [l.prioridade, l.vigente_de, l.vigente_ate, l.exibir_pa, l.exibir_r])).toEqual([
        ['P1', '2031-03-01', '2031-03-02', null, null], ['P1', '2031-03-02', null, 'min', 'h'],
        ['P2', '2031-03-01', '2031-03-02', null, null], ['P2', '2031-03-02', null, 'min', 'h'],
        ['P3', '2031-03-01', '2031-03-02', null, null], ['P3', '2031-03-02', null, 'h', 'dia'],
        ['P4', '2031-03-01', '2031-03-02', null, null], ['P4', '2031-03-02', null, 'h', 'dia'],
        ['P5', '2031-03-01', '2031-03-02', null, null], ['P5', '2031-03-02', null, 'dia', 'dia'],
      ]);
      expect(await versoes()).toEqual(antes);
      expect(await sincronizarAlvos(ref, E, lido, '2031-03-03', AGORA)).toEqual({ sha256: lido.sha256, inseridos: 0, fechados: 0, versaoRegistrada: false });
    });
  });
});
