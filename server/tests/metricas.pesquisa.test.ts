import { SCHEMAS_RESULTADO } from '@metricas-dspd/contratos/validacao';
import { calcularMetrica, CALENDARIO_PADRAO, pesquisa, businessmap, acelerato } from '@metricas-dspd/metricas';
import { CONFIG_PADRAO, gerarBaseMock, gerarPesquisaMock } from '@metricas-dspd/mock';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { ServicoMetricas, type FontePesquisa } from '../src/modulos/metricas/index.js';
import { fontePesquisaMock } from '../src/plataforma/db/pesquisa-mock.js';
import { bancoDoMock } from './base-duble.js';
import { criarDublePg } from './duble-pg.js';

const AGORA = new Date('2026-10-10T15:00:00Z');
const base = gerarBaseMock({ escala: 0.25 });
const mock = gerarPesquisaMock(CONFIG_PADRAO);
const novoDb = () => criarDublePg(bancoDoMock(base));
const tocouBmOuAc = (d: { chamadas: { texto: string }[] }): boolean => d.chamadas.some((c) => /dim_card|dim_chamado|fato_/.test(c.texto));

describe('PV1 (pesquisa de percepção)', () => {
  it('rota: 200, DTO do contrato, igual ao cálculo da biblioteca sobre o mock, sem ler BusinessMap nem Acelerato', async () => {
    const d = novoDb();
    const app = await buildApp({ db: d.pool, agora: () => AGORA, nivelLog: 'silent' });
    const r = await app.inject('/api/v1/metricas/PV1');
    expect(r.statusCode).toBe(200);
    expect(SCHEMAS_RESULTADO.PV1.safeParse(r.json()).success).toBe(true);
    const ctx = {
      bm: businessmap.criarContextoBM(base.bm, '2026-10-10', CALENDARIO_PADRAO),
      ac: acelerato.criarContextoAC(base.ac, '2026-10-10', CALENDARIO_PADRAO),
      pesq: pesquisa.criarContextoPesquisa(mock, '2026-10-10'),
    };
    expect(r.json()).toEqual(JSON.parse(JSON.stringify(calcularMetrica('PV1', {} as never, ctx))));
    expect(r.json().status).not.toBe('sem-pesquisa');
    expect(r.headers['x-data-referencia']).toBe('2026-10-10');
    expect(tocouBmOuAc(d)).toBe(false);
    expect(r.headers['cache-control']).toBe('private, max-age=60');
    const r2 = await app.inject({ method: 'GET', url: '/api/v1/metricas/PV1', headers: { 'if-none-match': r.headers.etag as string } });
    expect(r2.statusCode).toBe(304);
  });

  it('rota: só dataReferencia; qualquer outro parâmetro é 400 e data futura também', async () => {
    const app = await buildApp({ db: novoDb().pool, agora: () => AGORA, nivelLog: 'silent' });
    expect((await app.inject('/api/v1/metricas/PV1?dataReferencia=2026-09-30')).statusCode).toBe(200);
    for (const q of ['equipe=totvs', 'periodo=12s', 'prioridade=P1', 'responsavel=x', 'dataReferencia=2026-12-01']) {
      expect((await app.inject(`/api/v1/metricas/PV1?${q}`)).statusCode, q).toBe(400);
    }
  });

  it('dataReferencia antes da primeira carga: sem dados e versão de critério anterior', async () => {
    const app = await buildApp({ db: novoDb().pool, agora: () => AGORA, nivelLog: 'silent' });
    const r = await app.inject('/api/v1/metricas/PV1?dataReferencia=2000-01-01');
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-versao-criterio']).toBe('0');
  });

  it('versão de critério: a mais recente vigente na data (desempate pelo id) vem da fonte da pesquisa', async () => {
    const fonte: FontePesquisa = { ler: () => Promise.resolve({ versao: 'v', base: { ...mock, criterios: [
      { id: 'p2', data: '2026-01-01', descricao: 'b', afeta: ['PV1'] },
      { id: 'p1', data: '2026-01-01', descricao: 'a', afeta: ['PV1'] },
      { id: 'p0', data: '2025-01-01', descricao: 'z', afeta: ['PV1'] },
      { id: 'p9', data: '2027-01-01', descricao: 'futura', afeta: ['PV1'] },
    ] } }) };
    const s = new ServicoMetricas({ db: novoDb().pool, pesquisa: fonte });
    expect((await s.calcular('PV1', {}, {}, AGORA)).versaoCriterio).toBe('p2');
    expect((await s.calcular('PV1', {}, { dataReferencia: '2025-06-01' }, AGORA)).versaoCriterio).toBe('p0');
  });

  it('cache próprio: mesma chave não recalcula; nova versão da fonte recalcula; limite descarta os mais antigos', async () => {
    let n = 0;
    let versao = 'a';
    const fonte: FontePesquisa = { ler: () => { n += 1; return Promise.resolve({ versao, base: mock }); } };
    const s = new ServicoMetricas({ db: novoDb().pool, pesquisa: fonte, maxResultados: 2 });
    const a = await s.calcular('PV1', {}, {}, AGORA);
    const b = await s.calcular('PV1', {}, {}, AGORA);
    expect(b.resultado).toBe(a.resultado);
    versao = 'b';
    const c = await s.calcular('PV1', {}, {}, AGORA);
    expect(c.resultado).not.toBe(a.resultado);
    expect(c.chave).not.toBe(a.chave);
    await s.calcular('PV1', {}, { dataReferencia: '2026-09-01' }, AGORA);
    await s.calcular('PV1', {}, { dataReferencia: '2026-08-01' }, AGORA);
    expect((await s.calcular('PV1', {}, {}, AGORA)).resultado).not.toBe(c.resultado);
    expect(n).toBe(6);
  });

  it('fonte real sem nenhuma carga em pesq_*: sem-pesquisa, nunca dado inventado nem erro', async () => {
    const app = await buildApp({ db: criarDublePg().pool, agora: () => AGORA, nivelLog: 'silent', fonteDados: 'real' });
    const r = await app.inject('/api/v1/metricas/PV1');
    expect(r.statusCode).toBe(200);
    expect(r.json().status).toBe('sem-pesquisa');
    expect(r.headers['x-versao-criterio']).toBe('0');
  });

  it('serviço sem fonte da pesquisa configurada: sem-pesquisa e versão de critério 0', async () => {
    const c = await new ServicoMetricas({ db: criarDublePg().pool }).calcular('PV1', {}, {}, AGORA);
    expect(c.resultado).toMatchObject({ status: 'sem-pesquisa', fonte: 'pesquisa' });
    expect(c.versaoCriterio).toBe('0');
  });

  it('fonte injetada na app e fonte mock memoizada', async () => {
    expect(await fontePesquisaMock.ler()).toBe(await fontePesquisaMock.ler());
    const app = await buildApp({ db: novoDb().pool, agora: () => AGORA, nivelLog: 'silent', fonteDados: 'real', pesquisa: fontePesquisaMock });
    expect((await app.inject('/api/v1/metricas/PV1')).json().status).not.toBe('sem-pesquisa');
  });

  it('nenhum dado individual na resposta', async () => {
    const app = await buildApp({ db: novoDb().pool, agora: () => AGORA, nivelLog: 'silent' });
    expect((await app.inject('/api/v1/metricas/PV1')).body).not.toMatch(/email|e-mail|respondente_id|usuario|responsavel|assignee/i);
  });
});
