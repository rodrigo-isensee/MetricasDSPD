import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { S_PADRAO } from '../src/plataforma/db/esquemas.js';
import { violaLgpd } from '../src/plataforma/db/lgpd.js';
import { dia, dt, insertLote, lotes, mapearAC, mapearBM, type Tabela } from '../src/plataforma/db/seed.js';
import { MIGRACOES } from './migracoes.js';

const base = gerarBaseMock({ escala: 0.05 });
const todas = (b = base): Tabela[] => [...mapearBM(b, 1, S_PADRAO), ...mapearAC(b, 1, S_PADRAO)];
const ddl = Object.values(MIGRACOES).flatMap((m) => m.ddl(S_PADRAO).up);
const criacao = (t: string): string => ddl.find((s) => s.startsWith(`CREATE TABLE ${t} (`)) ?? '';

describe('seed (análise estática, sem banco)', () => {
  it('epoch ms vira timestamptz(3) UTC e data civil usa o fuso do calendário', () => {
    expect(dt(0)).toBe('1970-01-01 00:00:00.000');
    expect(dt(1_760_000_000_123)).toBe('2025-10-09 08:53:20.123');
    expect(dia(Date.parse('2026-10-10T01:00:00Z'))).toBe('2026-10-09');
  });
  it('determinístico pela semente e diferente com outra semente', () => {
    expect(todas(gerarBaseMock({ escala: 0.05 }))).toEqual(todas());
    expect(todas(gerarBaseMock({ escala: 0.05, semente: 7 }))).not.toEqual(todas());
  });
  it('uma linha por item do mock, inclusive arquivados e excluídos (nunca descarta histórico)', () => {
    const n = Object.fromEntries(todas().map((t) => [t.tabela, t.linhas.length]));
    expect(n[`${S_PADRAO.bm}.dim_card`]).toBe(base.bm.cards.length);
    expect(n[`${S_PADRAO.bm}.fato_transicao`]).toBe(base.bm.transicoes.length);
    expect(n[`${S_PADRAO.bm}.fato_bloqueio`]).toBe(base.bm.bloqueios.length);
    expect(n[`${S_PADRAO.ac}.dim_chamado`]).toBe(base.ac.chamados.length);
    expect(n[`${S_PADRAO.ac}.fato_etapa_chamado`]).toBe(base.ac.etapas.length);
  });
  it('toda coluna gravada existe na tabela criada pelas migrações; BM e AC em schemas separados; prefixo respeitado', () => {
    for (const { tabela, linhas } of todas()) {
      const sql = criacao(tabela);
      expect(sql, tabela).not.toBe('');
      for (const c of Object.keys(linhas[0] ?? {})) expect(sql, `${tabela}.${c}`).toMatch(new RegExp(`\\b${c}\\b`));
    }
    expect(mapearBM(base, 1, S_PADRAO).every((t) => t.tabela.startsWith(`${S_PADRAO.bm}.`))).toBe(true);
    expect(mapearAC(base, 1, S_PADRAO).every((t) => t.tabela.startsWith(`${S_PADRAO.ac}.`))).toBe(true);
    expect(mapearBM(base, 1, { ...S_PADRAO, bm: 'p_dspd_bm' })[0]!.tabela).toBe('p_dspd_bm.dim_card');
    expect(mapearBM(base, 1)[0]!.tabela).toMatch(/dspd_bm\.dim_card$/);
  });
  it('nenhuma coluna de pessoa é gravada (data-model §9)', () => {
    for (const { tabela, linhas } of todas())
      for (const c of Object.keys(linhas[0] ?? {})) expect(violaLgpd(tabela, c) || /responsaveis|usuario|justificativa/.test(c), `${tabela}.${c}`).toBe(false);
  });
  it('ids ASCII visível com até 32 caracteres e instantes no formato timestamptz(3)', () => {
    for (const { linhas } of todas())
      for (const l of linhas)
        for (const [k, v] of Object.entries(l)) {
          if (/(^|_)id$|id_origem/.test(k) && typeof v === 'string') expect(v).toMatch(/^[\x21-\x7e]{1,32}$/);
          if (/_em$|^(inicio|fim|entrada|saida)$/.test(k) && v !== null) expect(v).toMatch(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d{3}$/);
        }
  });
  it('lotes respeitam o tamanho e o INSERT é parametrizado ($n, sem valores no texto)', () => {
    expect(lotes([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(lotes([1, 2, 3])).toEqual([[1, 2, 3]]);
    const perigo = "x'; DROP TABLE y;--";
    const q = insertLote('s.dim_card', [{ card_id: perigo, tipo: null }, { card_id: 'b' }]);
    expect(q.texto).toBe('INSERT INTO s.dim_card (card_id, tipo) VALUES ($1, $2), ($3, $4)');
    expect(q.valores).toEqual([perigo, null, 'b', null]);
    expect(insertLote('s.x', []).texto).toBe('INSERT INTO s.x () VALUES ');
  });
  it('proíbe ON CONFLICT DO UPDATE, TRUNCATE e DELETE no seed (nunca sobrescreve)', async () => {
    const { readFileSync } = await import('node:fs');
    expect(readFileSync(new URL('../src/plataforma/db/seed.ts', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(
      /DO\s+UPDATE|TRUNCATE|DELETE\s+FROM|SELECT\s+\*/i);
  });
});
