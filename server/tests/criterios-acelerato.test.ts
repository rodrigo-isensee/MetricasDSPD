import { describe, expect, it } from 'vitest';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { CRITERIOS_ACELERATO, registrarCriteriosAcelerato } from '../src/modulos/referencia/criterios-acelerato.js';
import { criarDublePg } from './duble-pg.js';

const S = montarEsquemas('');
const AGORA = new Date('2026-11-02T12:00:00Z');

describe('CT-49: marcas da D-7 e da D-10 em ref_versao_criterio (T2.6)', () => {
  it('as duas entradas, com data, e as métricas afetadas (S4, S9, S10 e S8)', async () => {
    let id = 0;
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [] : q.texto.includes('RETURNING versao_id') ? [{ versao_id: String(++id) }] : []));
    const gravadas = await registrarCriteriosAcelerato(d.pool, S, '2026-11-02', AGORA);
    expect(gravadas).toEqual(['056:D-7', '056:D-10']);
    const versoes = d.chamadas.filter((c) => c.texto.includes('INSERT INTO dspd_core.ref_versao_criterio ('));
    expect(versoes.map((c) => [c.valores[0], c.valores[3]])).toEqual([['2026-11-02', '056:D-7'], ['2026-11-02', '056:D-10']]);
    expect(versoes.every((c) => c.texto.includes("'acelerato'"))).toBe(true);
    const metricas = d.chamadas.filter((c) => c.texto.includes('ref_versao_criterio_metrica')).map((c) => [c.valores[0], c.valores[1]]);
    expect(metricas).toEqual([['1', 'S4'], ['1', 'S9'], ['1', 'S10'], ['2', 'S8']]);
  });
  it('idempotente: o que já existe pela referência não é gravado de novo', async () => {
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [{ x: 1 }] : []));
    expect(await registrarCriteriosAcelerato(d.pool, S, '2026-11-02', AGORA)).toEqual([]);
    expect(d.chamadas.some((c) => c.texto.includes('INSERT'))).toBe(false);
  });
  it('descrição e motivo cabem nas colunas (300 e 500) e as referências são únicas', () => {
    for (const c of CRITERIOS_ACELERATO) { expect(c.descricao.length).toBeLessThanOrEqual(300); expect(c.motivo.length).toBeLessThanOrEqual(500); }
    expect(new Set(CRITERIOS_ACELERATO.map((c) => c.referencia)).size).toBe(CRITERIOS_ACELERATO.length);
  });
});
