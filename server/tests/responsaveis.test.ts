import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COLUNAS_VERSAO, gravarResponsaveis } from '../src/modulos/businessmap/responsaveis.js';
import { criarDublePg } from './duble-pg.js';

const e = { cardId: 'c1', responsaveis: ['1', '2'], stgCardSk: 5, vigenteDe: new Date('2026-10-02T00:00:00Z'), coletaId: 3, agora: new Date('2026-10-02T01:00:00Z') };
const ehSelect = (t: string): boolean => t.startsWith('SELECT');

describe('COLUNAS_VERSAO contra o esquema', () => {
  it('é exatamente as colunas de dim_card_versao, menos chaves, responsaveis e colunas de coleta', () => {
    const snap = JSON.parse(readFileSync(new URL('./pg/esquema.snapshot.json', import.meta.url), 'utf8')) as unknown;
    const linhas = (Array.isArray(snap) ? snap : Object.values(snap as object).flat()) as string[];
    const colunas = linhas.filter((l) => l.startsWith('dspd_bm.dim_card_versao.')).map((l) => l.split(' ')[0]!.split('.')[2]!);
    const fora = new Set(['card_versao_sk', 'card_id', 'vigente_de', 'stg_card_sk', 'responsaveis', 'coletado_em', 'coleta_id', 'sistema_origem']);
    expect(colunas.length).toBeGreaterThan(10);
    expect([...COLUNAS_VERSAO].sort()).toEqual(colunas.filter((c) => !fora.has(c)).sort());
  });
});

describe('gravarResponsaveis: bordas de vigente_de', () => {
  const dub = (vigenteDe: string, resp: string[] | null) => criarDublePg((c) => (ehSelect(c.texto) ? [{ vigente_de: new Date(vigenteDe), responsaveis: resp }] : { rows: [{ card_versao_sk: 1 }], rowCount: 1 }));
  it('igual ao vigente com conjunto diferente: nada é gravado, nem a projeção', async () => {
    const { pool, chamadas } = dub('2026-10-02T00:00:00Z', []);
    expect(await gravarResponsaveis(pool, e)).toEqual({ dimCard: false, versao: false });
    expect(chamadas).toHaveLength(1);
  });
  it('anterior ao vigente com conjunto diferente: nada é gravado', async () => {
    const { pool, chamadas } = dub('2026-10-03T00:00:00Z', null);
    expect(await gravarResponsaveis(pool, e)).toEqual({ dimCard: false, versao: false });
    expect(chamadas).toHaveLength(1);
  });
  it('posterior ao vigente: atualiza a projeção e insere a versão, exigindo vigente_de maior no SQL', async () => {
    const { pool, chamadas } = dub('2026-10-01T00:00:00Z', []);
    expect(await gravarResponsaveis(pool, e)).toEqual({ dimCard: true, versao: true });
    expect(chamadas[2]!.texto).toContain('$2::timestamptz > v.vigente_de');
  });
  it('mesmo conjunto do vigente, mesmo na borda: segue o fluxo normal (projeção pode ser corrigida)', async () => {
    const { pool, chamadas } = dub('2026-10-02T00:00:00Z', ['1', '2']);
    await gravarResponsaveis(pool, e);
    expect(chamadas).toHaveLength(3);
  });
  it('sem versão vigente: a projeção é atualizada e nenhuma versão é inventada', async () => {
    const { pool } = criarDublePg((c) => (ehSelect(c.texto) ? [] : { rows: [], rowCount: 0 }));
    expect(await gravarResponsaveis(pool, e)).toEqual({ dimCard: false, versao: false });
  });
  it('null não consulta nada', async () => {
    const { pool, chamadas } = dub('2026-10-01T00:00:00Z', []);
    await gravarResponsaveis(pool, { ...e, responsaveis: null });
    expect(chamadas).toHaveLength(0);
  });
});
