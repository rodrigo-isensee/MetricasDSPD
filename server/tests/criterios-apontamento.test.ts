import { describe, expect, it } from 'vitest';
import { LIMIARES_ACHADO_PADRAO } from '@metricas-dspd/metricas/businessmap';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { CRITERIOS_APONTAMENTO, METRICA_ACHADOS_APONTAMENTO, registrarCriteriosApontamento } from '../src/modulos/referencia/criterios-apontamento.js';
import { criarDublePg } from './duble-pg.js';

const S = montarEsquemas('');
const AGORA = new Date('2026-11-02T12:00:00Z');

describe('E2.21: limiares provisórios dos achados da aba Apontamento em ref_versao_criterio (T2.6)', () => {
  it('uma versão de critério do domínio businessmap, com a data de vigência e a métrica dos achados', async () => {
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [] : q.texto.includes('RETURNING versao_id') ? [{ versao_id: '7' }] : []));
    expect(await registrarCriteriosApontamento(d.pool, S, '2026-11-02', AGORA)).toEqual(['059:limiares-achados']);
    const versoes = d.chamadas.filter((c) => c.texto.includes('INSERT INTO dspd_core.ref_versao_criterio ('));
    expect(versoes).toHaveLength(1);
    expect(versoes[0]!.texto).toContain("'businessmap'");
    expect(versoes[0]!.valores[0]).toBe('2026-11-02');
    expect(versoes[0]!.valores[3]).toBe('059:limiares-achados');
    expect(d.chamadas.filter((c) => c.texto.includes('ref_versao_criterio_metrica')).map((c) => c.valores)).toEqual([['7', METRICA_ACHADOS_APONTAMENTO]]);
  });
  it('idempotente: o que já existe pela referência não é gravado de novo', async () => {
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [{ x: 1 }] : []));
    expect(await registrarCriteriosApontamento(d.pool, S, '2026-11-02', AGORA)).toEqual([]);
    expect(d.chamadas.some((c) => c.texto.includes('INSERT'))).toBe(false);
  });
  it('a descrição traz os cinco limiares vigentes da biblioteca (20, 20, 50, 1, 10) e cabe nas colunas (300 e 500)', () => {
    expect(LIMIARES_ACHADO_PADRAO).toEqual({ naoClassificadoPct: 20, semComentarioPct: 20, concentracaoPct: 50, diasAtipicos: 1, variacaoUtilizacaoPp: 10 });
    const c = CRITERIOS_APONTAMENTO[0]!;
    for (const n of Object.values(LIMIARES_ACHADO_PADRAO)) expect(c.descricao).toContain(String(n));
    expect(c.descricao.length).toBeLessThanOrEqual(300);
    expect(c.motivo.length).toBeLessThanOrEqual(500);
    expect(new Set(CRITERIOS_APONTAMENTO.map((x) => x.referencia)).size).toBe(CRITERIOS_APONTAMENTO.length);
  });
});
