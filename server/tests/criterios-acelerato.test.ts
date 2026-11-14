import { describe, expect, it } from 'vitest';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { CRITERIOS_ACELERATO, CRITERIO_D7_528, registrarCriterioD7528, registrarCriteriosAcelerato } from '../src/modulos/referencia/criterios-acelerato.js';
import { criarDublePg } from './duble-pg.js';

const S = montarEsquemas('');
const AGORA = new Date('2026-11-02T12:00:00Z');

describe('CT-49: marcas da D-7, da D-10 do 066 e do 069 em ref_versao_criterio (T2.6)', () => {
  it('as cinco entradas, com data, e as métricas afetadas (S4, S9, S10, S8 e as cinco do L9-c)', async () => {
    let id = 0;
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [] : q.texto.includes('RETURNING versao_id') ? [{ versao_id: String(++id) }] : []));
    const gravadas = await registrarCriteriosAcelerato(d.pool, S, '2026-11-02', AGORA);
    expect(gravadas).toEqual(['056:D-7', '056:D-10', '066:S8-com-resposta', '069:L9-b-campos-etapa', '069:L9-c-ordem-fluxo']);
    const versoes = d.chamadas.filter((c) => c.texto.includes('INSERT INTO dspd_core.ref_versao_criterio ('));
    expect(versoes.map((c) => [c.valores[0], c.valores[3]])).toEqual([['2026-11-02', '056:D-7'], ['2026-11-02', '056:D-10'], ['2026-11-02', '066:S8-com-resposta'], ['2026-11-02', '069:L9-b-campos-etapa'], ['2026-11-02', '069:L9-c-ordem-fluxo']]);
    expect(versoes.every((c) => c.texto.includes("'acelerato'"))).toBe(true);
    const metricas = d.chamadas.filter((c) => c.texto.includes('ref_versao_criterio_metrica')).map((c) => [c.valores[0], c.valores[1]]);
    expect(metricas).toEqual([['1', 'S4'], ['1', 'S9'], ['1', 'S10'], ['2', 'S8'], ['3', 'S8'], ['5', 'S5'], ['5', 'S6'], ['5', 'S7'], ['5', 'S9'], ['5', 'S11']]);
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

describe('K-308: critério 099:D-7-528 (ADR 0027, item 7.2)', () => {
  it('fica fora de CRITERIOS_ACELERATO: só o comando de reprojeção o grava', () => {
    expect(CRITERIOS_ACELERATO.map((c) => c.referencia)).not.toContain('099:D-7-528');
    expect(CRITERIO_D7_528.metricas).toEqual(['S1', 'S4', 'S9', 'S10', 'EI_SUST']);
    expect(CRITERIO_D7_528.descricao.length).toBeLessThanOrEqual(300);
    expect(CRITERIO_D7_528.motivo.length).toBeLessThanOrEqual(500);
  });
  it('grava a versão do domínio acelerato com a data e as cinco métricas; devolve true', async () => {
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [] : q.texto.includes('RETURNING versao_id') ? [{ versao_id: '9' }] : []));
    expect(await registrarCriterioD7528(d.pool, S, '2026-11-14', AGORA)).toBe(true);
    const v = d.chamadas.find((c) => c.texto.includes('INSERT INTO dspd_core.ref_versao_criterio ('))!;
    expect([v.valores[0], v.valores[3]]).toEqual(['2026-11-14', '099:D-7-528']);
    expect(v.texto).toContain("'acelerato'");
    expect(d.chamadas.filter((c) => c.texto.includes('ref_versao_criterio_metrica')).map((c) => c.valores)).toEqual(
      [['9', 'S1'], ['9', 'S4'], ['9', 'S9'], ['9', 'S10'], ['9', 'EI_SUST']]);
  });
  it('idempotente: existindo a referência, não grava e devolve false', async () => {
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [{ x: 1 }] : []));
    expect(await registrarCriterioD7528(d.pool, S, '2026-11-14', AGORA)).toBe(false);
    expect(d.chamadas.some((c) => c.texto.includes('INSERT'))).toBe(false);
  });
});
