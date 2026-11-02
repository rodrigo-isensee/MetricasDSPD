import { afterEach, describe, expect, it } from 'vitest';
import type { ResultadoApontamento } from '../src/modulos/businessmap/apontamento/coleta.js';
import { executarColeta, type DepsComando } from '../src/modulos/businessmap/coleta-comando.js';
import { lerConferencia } from '../src/modulos/businessmap/conferencia.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarClienteHttp } from '../src/plataforma/http.js';
import { bancoFalso, subirServidorBm, type Cenario, type ServidorBm } from './businessmap-coleta-duble.js';
import { criarDublePg, type Chamada, type Resposta } from './duble-pg.js';

// Pedido 059 (ADR 0025 item 3): a etapa do worklog roda depois dos cards, sob a mesma trava, só no incremental e só se os cards não falharam.
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

async function rodar(c: Cenario, modo: 'incremental' | 'carga-inicial', etapa: DepsComando['etapaApontamento'], marca: Date | null = new Date('2026-11-01T00:00:00Z')) {
  const servidor = await subirServidorBm(c);
  abertos.push(servidor);
  const coletor = bancoFalso({ marca });
  const cliente = criarClienteHttp({ urlBase: servidor.url, apikey: 'chave-f3-de-teste-0123456789', limitePorMinuto: 1000, timeoutMs: 2000 }, { dormir: () => Promise.resolve() });
  const deps: DepsComando = { cliente, poolColetor: coletor.pool, poolRef: bancoRef().pool, conf: lerConferencia(), quadros: [35], hostBase: 'bm.exemplo.test', agora: () => AGORA, S, ...(etapa === undefined ? {} : { etapaApontamento: etapa }) };
  return executarColeta(deps, { modo });
}

describe('executarColeta: etapa do worklog (059)', () => {
  it('incremental com cards ok: roda a etapa depois da coleta e devolve o resultado', async () => {
    let chamadas = 0;
    const r = await rodar(cenario(), 'incremental', () => { chamadas += 1; return Promise.resolve(RESULTADO); });
    expect(r.estado).toBe('sucesso');
    expect(chamadas).toBe(1);
    expect(r.apontamento).toBe(RESULTADO);
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
});
