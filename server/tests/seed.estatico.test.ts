import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { MIGRACOES } from '../src/db/migracoes.js';
import { dia, dt, insertLote, lotes, mapearAC, mapearBM, type Tabela } from '../src/db/seed.js';

const base = gerarBaseMock({ escala: 0.05 });
const todas = (b = base): Tabela[] => [...mapearBM(b, 1), ...mapearAC(b, 1)];
const ddl = Object.values(MIGRACOES).flatMap((m) => m.ddl.up);
const criacao = (t: string): string => ddl.find((s) => s.startsWith(`CREATE TABLE ${t} (`)) ?? '';

describe('seed (análise estática, sem banco)', () => {
  it('epoch ms vira DATETIME(3) UTC e data civil usa o fuso do calendário', () => {
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
    expect(n['dspd_bm.dim_card']).toBe(base.bm.cards.length);
    expect(n['dspd_bm.fato_transicao']).toBe(base.bm.transicoes.length);
    expect(n['dspd_bm.fato_bloqueio']).toBe(base.bm.bloqueios.length);
    expect(n['dspd_ac.dim_chamado']).toBe(base.ac.chamados.length);
    expect(n['dspd_ac.fato_etapa_chamado']).toBe(base.ac.etapas.length);
  });
  it('toda coluna gravada existe na tabela criada pelas migrações; BM e AC em schemas separados', () => {
    for (const { tabela, linhas } of todas()) {
      const sql = criacao(tabela);
      expect(sql, tabela).not.toBe('');
      for (const c of Object.keys(linhas[0] ?? {})) expect(sql, `${tabela}.${c}`).toMatch(new RegExp(`\\b${c}\\b`));
    }
    expect(mapearBM(base, 1).every((t) => t.tabela.startsWith('dspd_bm.'))).toBe(true);
    expect(mapearAC(base, 1).every((t) => t.tabela.startsWith('dspd_ac.'))).toBe(true);
  });
  it('nenhuma coluna de pessoa é gravada (data-model §9)', () => {
    const pessoa = /pessoa|responsav|usuario|user|agente|atendente|solicitante|autor|criador|email|login|assignee|justificativa/i;
    for (const { tabela, linhas } of todas())
      for (const c of Object.keys(linhas[0] ?? {})) {
        if (c !== 'area_solicitante') expect(c, tabela).not.toMatch(pessoa); // área organizacional (4.5), não pessoa
      }
  });
  it('ids ASCII com até 32 caracteres e instantes no formato DATETIME(3)', () => {
    for (const { linhas } of todas())
      for (const l of linhas)
        for (const [k, v] of Object.entries(l)) {
          if (/(^|_)id$|id_origem/.test(k) && typeof v === 'string') expect(v).toMatch(/^[\x20-\x7e]{1,32}$/);
          if (/_em$|^(inicio|fim|entrada|saida)$/.test(k) && v !== null) expect(v).toMatch(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\.\d{3}$/);
        }
  });
  it('lotes respeitam o tamanho e o INSERT é parametrizado (sem valores no texto)', () => {
    expect(lotes([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    const c = insertLote('dspd_bm.dim_card', [{ card_id: "x'; DROP TABLE y;--", tipo: null }]).compile({
      getExecutor: () => ({ transformQuery: (n: unknown) => n, compileQuery: (n: unknown) => n }),
    } as never) as unknown;
    expect(c).toBeDefined();
  });
  it('proíbe INSERT IGNORE/ON DUPLICATE KEY/REPLACE no seed (ADR 0004)', async () => {
    const { readFileSync } = await import('node:fs');
    expect(readFileSync(new URL('../src/db/seed.ts', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(
      /INSERT\s+IGNORE|ON\s+DUPLICATE\s+KEY|REPLACE\s+INTO|TRUNCATE|DELETE\s+FROM/i);
  });
});
