import { describe, expect, it } from 'vitest';
import { criarFontePesquisaReal, lerBasePesquisa, TTL_PESQUISA_MS } from '../src/modulos/metricas/index.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg, type Chamada } from './duble-pg.js';

const S = montarEsquemas('t_');
const NIVEL = (c: Chamada, re: RegExp): boolean => re.test(c.texto);

/** Banco da pesquisa: uma carga reenviada (2 e 3 no mesmo trimestre), duas versões de questionário (a 2ª sem perguntas ainda). */
function banco(extra: { cargas?: unknown[] } = {}) {
  return (c: Chamada) => {
    if (NIVEL(c, /FROM t_dspd_core\.ref_pesq_area/)) return [{ codigo: 'comercial', rotulo: 'Comercial' }];
    if (NIVEL(c, /LEFT JOIN t_dspd_core\.ref_pesq_pergunta/)) return [
      { versao_id: '5', vigente_desde: '2026-01-01', codigo: 'p1', ordem: 1, texto: 'Pergunta 1' },
      { versao_id: '5', vigente_desde: '2026-01-01', codigo: 'p2', ordem: 2, texto: 'Pergunta 2' },
      { versao_id: '6', vigente_desde: '2026-07-01', codigo: null, ordem: null, texto: null }];
    if (NIVEL(c, /FROM t_dspd_core\.pesq_carga/)) return extra.cargas ?? [
      { carga_id: '2', trimestre: '2026-T2', versao_id: '5', recebida_em: '2026-07-10', o_que_mudou: null },
      { carga_id: '3', trimestre: '2026-T2', versao_id: '5', recebida_em: '2026-07-20', o_que_mudou: 'Ajuste.' }];
    if (NIVEL(c, /FROM t_dspd_core\.pesq_resultado/)) return [
      { carga_id: '2', area_codigo: 'comercial', pergunta_codigo: 'p1', f1: 0, f2: 0, f3: 1, f4: 2, f5: 3, convidados: 8 },
      { carga_id: '3', area_codigo: 'comercial', pergunta_codigo: 'p1', f1: 0, f2: 1, f3: 1, f4: 2, f5: 3, convidados: 8 }];
    if (NIVEL(c, /ref_versao_criterio v\s+LEFT JOIN t_dspd_core\.ref_versao_criterio_metrica/)) return [
      { versao_id: '6', vigente_desde: '2026-07-01', descricao: 'Questionário v2', metrica_id: 'PV1' }];
    return [];
  };
}

describe('leitura real da pesquisa (PV1)', () => {
  it('monta a base com todas as cargas (reenvio guardado), linhas por área e pergunta, versões e critérios', async () => {
    const d = criarDublePg(banco());
    const base = await lerBasePesquisa(d.pool, S);
    expect(base.areas).toEqual([{ codigo: 'comercial', rotulo: 'Comercial' }]);
    expect(base.versoes).toEqual([
      { id: '5', vigenteDesde: '2026-01-01', perguntas: [{ codigo: 'p1', ordem: 1, texto: 'Pergunta 1' }, { codigo: 'p2', ordem: 2, texto: 'Pergunta 2' }] },
      { id: '6', vigenteDesde: '2026-07-01', perguntas: [] }]);
    expect(base.cargas.map((c) => [c.cargaId, c.trimestre, c.versaoId, c.recebidaEm, c.oQueMudou, c.linhas.length])).toEqual([
      [2, '2026-T2', '5', '2026-07-10', null, 1], [3, '2026-T2', '5', '2026-07-20', 'Ajuste.', 1]]);
    expect(base.cargas[1]!.linhas[0]).toEqual({ trimestre: '2026-T2', area: 'comercial', pergunta: 'p1', f1: 0, f2: 1, f3: 1, f4: 2, f5: 3, convidados: 8 });
    expect(base.criterios).toEqual([{ id: '6', data: '2026-07-01', descricao: 'Questionário v2', afeta: ['PV1'] }]);
  });

  it('só colunas explícitas, só leitura, só dspd_core (nunca BusinessMap nem Acelerato, nunca SELECT *)', async () => {
    const d = criarDublePg(banco());
    await lerBasePesquisa(d.pool, S);
    const sql = d.chamadas.map((c) => c.texto).join('\n');
    expect(sql).not.toMatch(/SELECT\s+\*|\w\.\*|INSERT|UPDATE|DELETE|dspd_bm|dspd_ac/i);
    expect(sql).toMatch(/pesq_carga/);
    expect(d.chamadas.every((c) => c.valores.length <= 1)).toBe(true);
  });

  it('cargas sem linhas ficam com lista vazia; sem nada no banco a base é vazia', async () => {
    const vazio = criarDublePg();
    expect(await lerBasePesquisa(vazio.pool)).toEqual({ areas: [], versoes: [], cargas: [], criterios: [] });
    const semLinhas = criarDublePg((c) => (NIVEL(c, /FROM \S*pesq_carga/) ? [{ carga_id: '1', trimestre: '2026-T1', versao_id: '5', recebida_em: '2026-04-01', o_que_mudou: null }] : []));
    expect((await lerBasePesquisa(semLinhas.pool)).cargas[0]!.linhas).toEqual([]);
  });

  it('fonte: reaproveita a leitura dentro do TTL e a mantém igual quando o banco não mudou', async () => {
    const d = criarDublePg(banco());
    let agora = 1_000;
    const fonte = criarFontePesquisaReal(d.pool, S, () => agora);
    const a = await fonte.ler();
    const n = d.chamadas.length;
    agora += TTL_PESQUISA_MS - 1;
    expect(await fonte.ler()).toBe(a);
    expect(d.chamadas.length).toBe(n);
    agora += 2;
    const b = await fonte.ler();
    expect(d.chamadas.length).toBeGreaterThan(n);
    expect(b).toBe(a);
    expect(a.versao).toMatch(/^[0-9a-f]{16}$/);
  });

  it('fonte: carga nova muda a versão (invalida o cache do serviço)', async () => {
    const estado: { cargas?: unknown[] } = {};
    const d = criarDublePg((c) => banco(estado)(c));
    let agora = 0;
    const fonte = criarFontePesquisaReal(d.pool, S, () => agora);
    const a = await fonte.ler();
    estado.cargas = [{ carga_id: '9', trimestre: '2026-T3', versao_id: '5', recebida_em: '2026-10-09', o_que_mudou: null }];
    agora += TTL_PESQUISA_MS;
    const b = await fonte.ler();
    expect(b.versao).not.toBe(a.versao);
    expect(b.base.cargas.map((c) => c.cargaId)).toEqual([9]);
  });

  it('fonte com relógio padrão', async () => {
    expect((await criarFontePesquisaReal(criarDublePg(banco()).pool, S).ler()).base.cargas).toHaveLength(2);
  });
});
