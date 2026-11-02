import { afterEach, describe, expect, it } from 'vitest';
import type { ResultadoApontamento } from '../src/modulos/businessmap/apontamento/coleta.js';
import { ErroColetaBm } from '../src/modulos/businessmap/coleta.js';
import { executarColeta, type ArgsColeta, type DepsComando } from '../src/modulos/businessmap/coleta-comando.js';
import { hmacUsuario } from '../src/modulos/businessmap/apontamento/supressao.js';
import { lerConferencia } from '../src/modulos/businessmap/conferencia.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { bancoFalso, subirServidorBm, type Cenario, type ServidorBm } from './businessmap-coleta-duble.js';
import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

// Pedido 059 (ADR 0025 item 3): a etapa do worklog roda depois dos cards e da projeção, sob a mesma trava, só no incremental com --projetar e só se os
// cards não falharam (A6 do review da coleta); falha conhecida dela vai ao campo `apontamento` por código, sem derrubar o comando (A5).
const S = montarEsquemas('');
const AGORA = new Date('2026-11-02T12:00:00Z');
const abertos: ServidorBm[] = [];
afterEach(async () => { for (const s of abertos.splice(0)) await s.fechar(); });

const estrutura = {
  data: {
    columns: { '3001': { name: 'Fazendo', section: 3, flow_type: 1, parent_column_id: 0, workflow_id: 300, limit: 0 }, '3002': { name: 'Feito', section: 4, flow_type: 1, parent_column_id: 0, workflow_id: 300, limit: 0 } },
    child_columns: {}, workflows: { '300': { name: 'WF', top_columns: [3001, 3002], bottom_columns: [3001, 3002] } },
  },
};
const cenario = (status: Cenario['status'] = {}): Cenario => ({
  cards: { '35|active': [{ card_id: 1, title: 'Card 1', last_modified: '2026-10-30T10:00:00Z' }] }, porPagina: 100, users: {}, status,
  corpos: { '/boards/35/currentStructure': estrutura, '/boards/35/workflows': { data: [{ workflow_id: 300, name: 'Projetos', type: 0 }] }, '/cardTypes': { data: [{ type_id: 1, name: 'Story' }] } },
});
const bancoRef = () => criarDublePg((c: Chamada): Resposta => (/ref_versao_criterio WHERE/.test(c.texto) ? [] : /INSERT INTO \S*ref_versao_criterio \(/.test(c.texto) ? [{ versao_id: '7' }] : []));
const RESULTADO = { coletaId: 9, estado: 'sucesso' } as unknown as ResultadoApontamento;

async function rodar(c: Cenario, modo: 'incremental' | 'carga-inicial', etapa: DepsComando['etapaApontamento'], marca: Date | null = new Date('2026-11-01T00:00:00Z'), extra: Partial<ArgsColeta> = { projetar: true }) {
  const servidor = await subirServidorBm(c);
  abertos.push(servidor);
  const coletor = bancoFalso({ marca });
  const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-f3-de-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });
  const deps: DepsComando = { cliente, poolColetor: coletor.pool, poolRef: bancoRef().pool, conf: lerConferencia(), quadros: [35], hostBase: 'bm.exemplo.test', agora: () => AGORA, S, ...(etapa === undefined ? {} : { etapaApontamento: etapa }) };
  return executarColeta(deps, { modo, ...extra });
}

describe('executarColeta: etapa do worklog (059)', () => {
  it('incremental com cards ok: roda a etapa depois da coleta e devolve o resultado', async () => {
    let chamadas = 0;
    const r = await rodar(cenario(), 'incremental', () => { chamadas += 1; return Promise.resolve(RESULTADO); });
    expect(r.estado).toBe('sucesso');
    expect(chamadas).toBe(1);
    expect(r.apontamento).toBe(RESULTADO);
  });
  it('A6: sem --projetar a etapa não roda (dim_card seria o da projeção anterior) e a coleta de cards sai normal', async () => {
    let chamadas = 0;
    const r = await rodar(cenario(), 'incremental', () => { chamadas += 1; return Promise.resolve(RESULTADO); }, undefined, {});
    expect(r.estado).toBe('sucesso');
    expect(r.projecao).toBeNull();
    expect(chamadas).toBe(0);
    expect(r.apontamento).toBeNull();
  });
  it('A5: a etapa roda depois da projeção, no mesmo comando', async () => {
    const r = await rodar(cenario(), 'incremental', () => Promise.resolve(RESULTADO));
    expect(r.projecao).not.toBeNull();
    expect(r.apontamento).toBe(RESULTADO);
  });
  it('A9: a etapa recebe o pool do coletor do próprio comando (a entrada não precisa de apelido para a variável de fechamento)', async () => {
    const servidor = await subirServidorBm(cenario());
    abertos.push(servidor);
    const coletor = bancoFalso({ marca: new Date('2026-11-01T00:00:00Z') });
    const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-f3-de-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });
    let recebido: unknown;
    const deps: DepsComando = { cliente, poolColetor: coletor.pool, poolRef: bancoRef().pool, conf: lerConferencia(), quadros: [35], hostBase: 'bm.exemplo.test', agora: () => AGORA, S, etapaApontamento: (pool) => { recebido = pool; return Promise.resolve(RESULTADO); } };
    await executarColeta(deps, { modo: 'incremental', projetar: true });
    expect(recebido).toBe(coletor.pool);
  });
  it.each(['sem-marca', 'dicionario', 'configuracao'] as const)('A5: etapa que lança %s (sem carga inicial do worklog, sem dicionário) não derruba o comando: os cards ficam no resultado e o worklog vai por código', async (codigo) => {
    const r = await rodar(cenario(), 'incremental', () => Promise.reject(new ErroColetaBm(codigo, 'texto interno que não deve sair')));
    expect(r.estado).toBe('sucesso');
    expect(r.streams.length).toBeGreaterThan(0);
    expect(r.apontamento).toEqual({ falha: codigo });
    expect(JSON.stringify(r)).not.toContain('texto interno');
  });
  it('A5: erro que não é falha conhecida (bug, banco) segue subindo', async () => {
    await expect(rodar(cenario(), 'incremental', () => Promise.reject(new Error('bug')))).rejects.toThrow('bug');
  });
  it('carga inicial dos cards não roda a etapa (a carga do worklog é um comando próprio)', async () => {
    let chamadas = 0;
    const r = await rodar(cenario(), 'carga-inicial', () => { chamadas += 1; return Promise.resolve(RESULTADO); });
    expect(chamadas).toBe(0);
    expect(r.apontamento).toBeNull();
  });
  it('cards que falharam: a etapa não roda; sem etapa configurada, nada muda', async () => {
    let chamadas = 0;
    const falhou = await rodar(cenario({ '35|active': 404, '35|archived': 404, '35|discarded': 404 }), 'incremental', () => { chamadas += 1; return Promise.resolve(RESULTADO); });
    expect(falhou.estado).toBe('falha');
    expect(chamadas).toBe(0);
    expect(falhou.apontamento).toBeNull();
    const sem = await rodar(cenario(), 'incremental', undefined);
    expect(sem.apontamento).toBeNull();
  });
  it('A1 da segurança: o sal vai à coleta de cards, e o /users dos cards só pede quem não está na lista de supressão', async () => {
    const SAL = 'sal-de-teste-com-pelo-menos-32-bytes!!';
    const c = cenario();
    c.cards['35|active'] = [{ card_id: 1, title: 'Card 1', last_modified: '2026-11-02T10:00:00Z', owner_user_id: 5, co_owner_ids: [6] }];
    c.users = { '5': { user_id: 5, realname: 'NOME-ELIMINADO' }, '6': { user_id: 6, realname: 'NOME-OUTRA' } };
    const servidor = await subirServidorBm(c);
    abertos.push(servidor);
    const coletor = bancoFalso({ marca: new Date('2026-11-01T00:00:00Z'), suprimidos: [hmacUsuario(SAL, '5')] });
    const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-f3-de-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });
    const deps: DepsComando = { cliente, poolColetor: coletor.pool, poolRef: bancoRef().pool, conf: lerConferencia(), quadros: [35], hostBase: 'bm.exemplo.test', agora: () => AGORA, S, sal: SAL };
    const r = await executarColeta(deps, { modo: 'incremental', projetar: true });
    expect(r.usuarios).toMatchObject({ pedidos: 1, resolvidos: 1 });
    expect(servidor.pedidos.filter((p) => p.caminho === '/users').map((p) => p.consulta.get('user_ids'))).toEqual(['6']);
  });
});
