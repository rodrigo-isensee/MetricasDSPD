import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { criarDublePg, type Respondedor } from './duble-pg.js';

const AGORA = new Date('2026-10-10T15:00:00Z');
const coleta = (id: string, status: string) => ({
  coleta_id: id, iniciado_em: new Date('2026-10-09T09:00:00Z'), finalizado_em: new Date('2026-10-09T09:01:00Z'), status, erro_resumo: status === 'falha' ? 'tempo-esgotado: x' : null,
});
const responder: Respondedor = (c) => {
  if (c.texto.includes('ctl_coleta_contagem')) return [{ coleta_id: '1', entidade: 'card', lidos: 10, inseridos: 4, ja_existentes: 6 }];
  if (c.texto.includes('ref_versao_criterio v'))
    return c.valores[0] === 'businessmap'
      ? [{ versao_id: '2', vigente_desde: '2026-03-02', descricao: 'Marco de entrada', metrica_id: 'O7' }, { versao_id: '2', vigente_desde: '2026-03-02', descricao: 'Marco de entrada', metrica_id: 'T1' }]
      : [{ versao_id: '1', vigente_desde: '2026-06-01', descricao: 'Etapas novas', metrica_id: 'S1' }, { versao_id: '3', vigente_desde: '2026-03-02', descricao: 'Outra', metrica_id: null }];
  if (c.texto.includes('ctl_coleta')) return [coleta('2', 'falha'), coleta('1', 'sucesso')];
  return [];
};
async function montar() {
  const d = criarDublePg(responder);
  return { app: await buildApp({ db: d.pool, agora: () => AGORA, nivelLog: 'silent' }), d };
}

describe('/api/v1/fontes/:dominio', () => {
  it('estado: selo, última ok e tentativa, cache de 60 s, uma fonte por consulta', async () => {
    const { app, d } = await montar();
    const r = await app.inject('/api/v1/fontes/businessmap/estado');
    expect(r.statusCode).toBe(200);
    expect(r.headers['cache-control']).toBe('private, max-age=60');
    const j = r.json();
    expect(j.dominio).toBe('businessmap');
    expect(j.selo).toBe('falha');
    expect(j.ultimaOk.id).toBe('bm-1');
    expect(j.ultimaTentativa.tipoErro).toBe('tempo-esgotado');
    expect(JSON.stringify(j)).not.toContain('tempo-esgotado: x');
    expect(d.chamadas.every((c) => !c.texto.includes('dspd_ac'))).toBe(true);
    expect((await app.inject('/api/v1/fontes/acelerato/estado')).json().dominio).toBe('acelerato');
  });
  it('coletas: página 1 (mais recente primeiro), além da última vazia', async () => {
    const { app } = await montar();
    const p1 = (await app.inject('/api/v1/fontes/businessmap/coletas')).json();
    expect(p1).toMatchObject({ pagina: 1, porPagina: 20, total: 2 });
    expect(p1.itens.map((i: { id: string }) => i.id)).toEqual(['bm-2', 'bm-1']);
    expect((await app.inject('/api/v1/fontes/businessmap/coletas?pagina=9')).json().itens).toEqual([]);
  });
  it.each([
    '/api/v1/fontes/outra/estado', '/api/v1/fontes/businessmap/estado?x=1', '/api/v1/fontes/businessmap/estado?responsavel=a',
    '/api/v1/fontes/businessmap/coletas?pagina=0', '/api/v1/fontes/businessmap/coletas?pagina=1.5', '/api/v1/fontes/businessmap/coletas?autor=a',
    '/api/v1/criterios?x=1',
  ])('400 VALIDATION_ERROR: %s', async (url) => {
    const { app } = await montar();
    const r = await app.inject(url);
    expect(r.statusCode).toBe(400);
    expect(r.json().error.code).toBe('VALIDATION_ERROR');
  });
  it('criterios: as duas fontes, cada uma com as suas versões, por data e id', async () => {
    const { app } = await montar();
    const r = await app.inject('/api/v1/criterios');
    expect(r.statusCode).toBe(200);
    expect(r.headers['cache-control']).toBe('private, max-age=60');
    expect(r.json()).toEqual([
      { id: '2', data: '2026-03-02', descricao: 'Marco de entrada', afeta: ['O7', 'T1'] },
      { id: '3', data: '2026-03-02', descricao: 'Outra', afeta: [] },
      { id: '1', data: '2026-06-01', descricao: 'Etapas novas', afeta: ['S1'] },
    ]);
  });
});
