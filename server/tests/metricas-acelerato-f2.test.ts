import { gerarBaseMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { extrasAC, montarBaseAC } from '../src/modulos/metricas/mapa.js';
import type { LinhaChamado } from '../src/modulos/metricas/repositorio.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg, type Respondedor } from './duble-pg.js';

const AGORA = new Date('2026-10-10T15:00:00Z');
const base = gerarBaseMock({ escala: 0.25 });
const T = new Date('2026-09-01T12:00:00Z');
const linha = (id: string, o: Partial<LinhaChamado> = {}): LinhaChamado => ({
  chamado_id: id, natureza: 'incidente', equipe: 'SSSC TOTVS', organizacao: 'O', tipo: 'T', categoria_sistema: 'c', excluido: false, status: 'Aberto', impacto: null, urgencia: null,
  prioridade: 'P2', prioridade_ajustada_manualmente: false, justificativa_informada: false, aberto_em: T, primeiro_atendimento_em: null, restaurado_em: null,
  data_finalizado: null, status_sla_r: null, status_sla_pa: null, motivo_escalacao: null, motivo_pendencia_atual: null, previsao_retorno: null, motivo_encerramento: null,
  avaliacao_problema: null, excecao_sla_registro_posterior: false, incidente_critico_coordenado: false, nivel_resolucao: null, ...o,
});
const vazio = montarBaseAC({ chamados: [], etapas: [], alvos: [], criterios: [] });

describe('extrasAC (D-9 e D-10)', () => {
  it('sem chamado sem agente a base é a própria; sem nenhum campo dos 90 dias projetado não há extensão (S8 sai sem campo, nunca 0%)', () => {
    const linhas = [linha('1'), linha('2', { com_agente: true })];
    const e = extrasAC(vazio, linhas);
    expect(e.semAgenteFora).toBe(vazio);
    expect(e.extensao).toBeUndefined();
  });
  it('sem agente fica fora da base de SLA; sim vira reincidente, não e sem resposta contam como não (denominador = todos os criados)', () => {
    const b = montarBaseAC({ chamados: [linha('1'), linha('2'), linha('3'), linha('4')], etapas: [], alvos: [], criterios: [] });
    const e = extrasAC(b, [linha('1', { com_agente: false, reincidente_90d: 'sim' }), linha('2', { reincidente_90d: 'nao' }), linha('3', { reincidente_90d: 'sem_resposta' }), linha('4', { reincidente_90d: null })]);
    expect(e.semAgenteFora.chamados.map((c) => c.chamado_id)).toEqual(['2', '3', '4']);
    expect(b.chamados).toHaveLength(4);
    expect(e.extensao).toEqual({ causasRaiz: {}, reabertoDe: { '1': '1' }, registroProblema: {} });
  });
});

/** Banco do mock com `com_agente` e `reincidente_90d` nas linhas de `dim_chamado`, como o projetor da F2 os deixa. */
function bancoComF2(sem: (i: number) => boolean, sim: (i: number) => boolean): Respondedor {
  const mock = bancoDoMock(base);
  return (c) => {
    const r = mock(c);
    if (!c.texto.includes('FROM dspd_ac.dim_chamado') || !Array.isArray(r)) return r;
    return r.map((l, i) => ({ ...(l as object), com_agente: !sem(i), reincidente_90d: sim(i) ? 'sim' : 'nao' }));
  };
}
const get = async (db: Respondedor, url: string, fonteDados?: 'real') => {
  const app = await buildApp({ db: criarDublePg(db).pool, agora: () => AGORA, nivelLog: 'silent', ...(fonteDados === undefined ? {} : { fonteDados }) });
  return app.inject(url);
};
const totalS2 = (j: { base: { n: number } }): number => j.base.n;

describe('API (fonte real): D-9 no S2 e D-10 no S8', () => {
  it('S2 não conta os chamados sem agente; S1 e S3 contam todos', async () => {
    const todos = await get(bancoComF2(() => false, () => false), '/api/v1/metricas/S2', 'real');
    const semAlguns = await get(bancoComF2((i) => i % 3 === 0, () => false), '/api/v1/metricas/S2', 'real');
    expect(todos.statusCode).toBe(200);
    expect(totalS2(semAlguns.json())).toBeLessThan(totalS2(todos.json()));
    const s3a = (await get(bancoComF2(() => false, () => false), '/api/v1/metricas/S3', 'real')).json();
    const s3b = (await get(bancoComF2((i) => i % 3 === 0, () => false), '/api/v1/metricas/S3', 'real')).json();
    expect(s3b.base.n).toBe(s3a.base.n);
  });
  it('S8 com o campo dos 90 dias projetado: campo disponível, taxa pelo denominador de todos os criados; sem o campo projetado, sem campo', async () => {
    const comCampo = (await get(bancoComF2(() => false, (i) => i % 5 === 0), '/api/v1/metricas/S8', 'real')).json();
    expect(comCampo.campoDisponivel).toBe(true);
    expect(comCampo.cobertura.n).toBe(comCampo.cobertura.total);
    expect(comCampo.meses.some((m: { reabertos: number }) => m.reabertos > 0)).toBe(true);
    const semCampo = (await get(bancoDoMock(base), '/api/v1/metricas/S8', 'real')).json();
    expect(semCampo.campoDisponivel).toBe(false);
  });
  it('na fonte mock a extensão mockada continua valendo (nada muda)', async () => {
    const r = (await get(bancoComF2(() => false, () => false), '/api/v1/metricas/S8')).json();
    expect(r.campoDisponivel).toBe(true);
  });
});
