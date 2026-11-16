import { describe, expect, it } from 'vitest';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { CRITERIO_CLASSE_SERVICO, REFERENCIA_CLASSE_SERVICO, registrarCriterioClasseServico } from '../src/modulos/referencia/criterios-classe-servico.js';
import { criarDublePg } from './duble-pg.js';

const S = montarEsquemas('');
const AGORA = new Date('2026-11-16T12:00:00Z');

describe('pedido 105 (E7.3, T2.6): versão de critério da classe de serviço pelas etiquetas', () => {
  it('grava uma versão do domínio businessmap com a data informada e as seis métricas que leem a classe, só com INSERT', async () => {
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [] : q.texto.includes('RETURNING versao_id') ? [{ versao_id: '3' }] : []));
    expect(await registrarCriterioClasseServico(d.pool, S, '2026-11-17', AGORA)).toEqual([REFERENCIA_CLASSE_SERVICO]);
    const v = d.chamadas.find((c) => c.texto.includes('INSERT INTO dspd_core.ref_versao_criterio ('))!;
    expect(v.texto).toContain("'businessmap'");
    expect(v.valores[0]).toBe('2026-11-17');
    expect(v.valores[3]).toBe('105:classe-por-etiqueta');
    expect(d.chamadas.filter((c) => c.texto.includes('ref_versao_criterio_metrica')).map((c) => c.valores)).toEqual(
      ['O6', 'O24', 'T1', 'T2', 'T4', 'T6'].map((m) => ['3', m]));
    expect(d.chamadas.some((c) => /\b(UPDATE|DELETE)\b/.test(c.texto))).toBe(false);
  });
  it('idempotente: já registrada, não grava nada; descrição e motivo cabem nas colunas', async () => {
    const d = criarDublePg((q) => (q.texto.startsWith('SELECT 1') ? [{ '?column?': 1 }] : []));
    expect(await registrarCriterioClasseServico(d.pool, S, '2026-11-17', AGORA)).toEqual([]);
    expect(d.chamadas.filter((c) => c.texto.includes('INSERT'))).toEqual([]);
    expect(CRITERIO_CLASSE_SERVICO.descricao.length).toBeLessThanOrEqual(300);
    expect(CRITERIO_CLASSE_SERVICO.motivo.length).toBeLessThanOrEqual(500);
    expect(CRITERIO_CLASSE_SERVICO.descricao).toContain('Intangível deixa de ser classe');
  });
});
