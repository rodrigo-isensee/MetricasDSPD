import { ESLint } from 'eslint';
import { readFile } from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { carregarConfigApi, carregarConfigMigrar, carregarConfigWorker } from '../src/plataforma/config.js';
import { comTravaDaFonte } from '../src/plataforma/db/trava.js';
import { RegistroConsumidores } from '../src/plataforma/eventos/index.js';
import { MAX_TENTATIVAS, backoffMs, processarOutbox, publicarEvento } from '../src/plataforma/eventos/index.js';
import { gerarOpenapi } from '../src/plataforma/openapi.js';
import { devida, ultimoAgendado, type Tarefa } from '../src/plataforma/agenda.js';
import { criarWorker, dormir } from '../src/plataforma/worker.js';
import { consumidorColetaConcluida, fecharColeta } from '../src/modulos/operacao/index.js';
import { montarEsquemas } from '../src/plataforma/db/esquemas.js';
import { criarDublePg } from './duble-pg.js';

const PG = 'postgres://u:senha-secreta@h:5432/d';
const AGORA = new Date('2026-10-10T15:00:00Z');

describe('config', () => {
  it('api: padrões e validação sem vazar valores', () => {
    expect(carregarConfigApi({ PG_API_URL: PG })).toMatchObject({ PORT: 3000, DADOS_FONTE: 'mock', HOST: '0.0.0.0', DSPD_SCHEMA_PREFIXO: '', LOG_LEVEL: 'info' });
    expect(() => carregarConfigApi({ PG_API_URL: 'mysql://x:senha-secreta@h/d' })).toThrow('variáveis: PG_API_URL');
    try { carregarConfigApi({ PG_API_URL: 'mysql://x:senha-secreta@h/d' }); } catch (e) { expect(String(e)).not.toContain('senha-secreta'); }
    expect(carregarConfigApi({ PG_API_URL: PG, DADOS_FONTE: 'real' }).DADOS_FONTE).toBe('real');
    expect(() => carregarConfigApi({ PG_API_URL: PG, DADOS_FONTE: 'x' })).toThrow('DADOS_FONTE');
    expect(() => carregarConfigApi({ PG_API_URL: PG, PORT: '0' })).toThrow('PORT');
  });
  it('worker: fontes padrão, lista e fonte desconhecida recusada', () => {
    expect(carregarConfigWorker({ PG_COLETOR_URL: PG }).WORKER_FONTES).toEqual(['businessmap', 'acelerato']);
    expect(carregarConfigWorker({ PG_COLETOR_URL: PG, WORKER_FONTES: ' acelerato ,' }).WORKER_FONTES).toEqual(['acelerato']);
    expect(() => carregarConfigWorker({ PG_COLETOR_URL: PG, WORKER_FONTES: 'jira' })).toThrow('WORKER_FONTES');
    expect(() => carregarConfigWorker({ PG_COLETOR_URL: PG, WORKER_FONTES: '' })).toThrow('WORKER_FONTES');
  });
  it('migrar e variável ausente (nome de variável, sem "?")', () => {
    expect(carregarConfigMigrar({ PG_MIGRADOR_URL: PG }).PG_MIGRADOR_URL).toBe(PG);
    expect(() => carregarConfigMigrar({})).toThrow('PG_MIGRADOR_URL');
    expect(() => carregarConfigApi({ PG_API_URL: PG, DSPD_SCHEMA_PREFIXO: 1 as unknown as string })).toThrow('DSPD_SCHEMA_PREFIXO');
  });
  it('config sem caminho de issue cai em "?"', async () => {
    const { z } = await import('zod');
    expect(z.object({}).safeParse(1).success).toBe(false);
    expect(() => carregarConfigApi(1 as unknown as NodeJS.ProcessEnv)).toThrow('?');
  });
});

describe('registro de consumidores', () => {
  it('recusa fonte cruzada e duplicado; entrega só por (fonte, tipo)', () => {
    const r = new RegistroConsumidores();
    const f = vi.fn();
    r.registrar('businessmap', 'bm.webhook.recebido', f).registrar('acelerato', 'coleta.concluida', f);
    expect(() => r.registrar('acelerato', 'bm.webhook.recebido', f)).toThrow('pertence a businessmap');
    expect(() => r.registrar('businessmap', 'ac.x', f)).toThrow('pertence a acelerato');
    expect(() => r.registrar('businessmap', 'bm.webhook.recebido', f)).toThrow('duplicado');
    expect(r.obter('acelerato', 'bm.webhook.recebido')).toBeUndefined();
    expect(r.obter('businessmap', 'bm.webhook.recebido')).toBe(f);
  });
});

describe('outbox (SQL com dublê)', () => {
  const S = montarEsquemas('t_');
  it('publicarEvento grava no schema core com parâmetros', async () => {
    const d = criarDublePg(() => [{ evento_id: 'u1' }]);
    expect(await publicarEvento(d.cliente, { fonte: 'businessmap', tipo: 'bm.webhook.recebido', payload: { webhookSk: '1', payloadSha256: 'b'.repeat(64) } }, S)).toBe('u1');
    expect(d.chamadas[0]!.texto).toContain('t_dspd_core.outbox');
    expect(d.chamadas[0]!.valores).toEqual(['businessmap', 'bm.webhook.recebido', JSON.stringify({ webhookSk: '1', payloadSha256: 'b'.repeat(64) })]);
    const d2 = criarDublePg(() => [{ evento_id: 'u2' }]);
    await publicarEvento(d2.cliente, { fonte: 'acelerato', tipo: 'coleta.concluida', payload: { fonte: 'acelerato', coletaId: '3', status: 'sucesso' } });
    expect(d2.chamadas[0]!.texto).toContain('dspd_core.outbox');
  });
  it('backoff exponencial com teto', () => {
    expect([1, 2, 3].map(backoffMs)).toEqual([30_000, 60_000, 120_000]);
    expect(backoffMs(20)).toBe(3_600_000);
  });
  const evento = (t: number) => ({ evento_sk: '5', evento_id: 'e5', tipo: 'bm.x', payload: { k: 1 }, tentativas: t });
  it('sucesso, erro com backoff, esgotamento em falha e retenção', async () => {
    const consumidores = new RegistroConsumidores().registrar('businessmap', 'bm.x', async (e) => {
      if (e.payload && (e.payload as { k: number }).k === 1 && e.tentativas >= 0 && falhar) throw new TypeError('segredo no texto');
    });
    let falhar = false;
    let tent = 0;
    const d = criarDublePg((c) => {
      if (c.texto.includes('FOR UPDATE SKIP LOCKED')) return [evento(tent)];
      if (c.texto.startsWith('DELETE')) return { rows: [], rowCount: 3 };
      return [];
    });
    const ok = await processarOutbox(d.pool, { fonte: 'businessmap', agora: AGORA, consumidores, S, limite: 5 });
    expect(ok).toEqual({ processados: 1, reagendados: 0, falhas: 0, apagados: 3 });
    expect(d.chamadas.find((c) => c.texto.includes('SKIP LOCKED'))!.valores.slice(0, 1)).toEqual(['businessmap']);
    falhar = true;
    const re = await processarOutbox(d.pool, { fonte: 'businessmap', agora: AGORA, consumidores, S });
    expect(re).toMatchObject({ processados: 0, reagendados: 1, falhas: 0 });
    const upd = d.chamadas.filter((c) => c.texto.includes("SET status = $2")).at(-1)!;
    expect(upd.valores[1]).toBe('pendente');
    expect(upd.valores[3]).toBe('TypeError');
    expect((upd.valores[2] as Date).getTime()).toBe(AGORA.getTime() + 30_000);
    tent = MAX_TENTATIVAS - 1;
    expect(await processarOutbox(d.pool, { fonte: 'businessmap', agora: AGORA, consumidores, S })).toMatchObject({ falhas: 1, reagendados: 0 });
    // erro que não é Error: categoria desconhecida
    const c2 = new RegistroConsumidores().registrar('businessmap', 'bm.x', () => Promise.reject('texto'));
    await processarOutbox(d.pool, { fonte: 'businessmap', agora: AGORA, consumidores: c2, S });
    expect(d.chamadas.filter((c) => c.texto.includes('SET status = $2')).at(-1)!.valores[3]).toBe('desconhecido');
  });
  it('só reserva tipos com consumidor (tipos da fonte vão no SELECT); delete sem rowCount; fila vazia não reserva', async () => {
    const d = criarDublePg((c) => (c.texto.includes('SKIP LOCKED') ? [evento(0)] : c.texto.startsWith('DELETE') ? { rows: [], rowCount: undefined as unknown as number } : []));
    const cons = new RegistroConsumidores().registrar('businessmap', 'bm.x', async () => {}).registrar('acelerato', 'coleta.concluida', async () => {});
    expect(cons.tipos('businessmap')).toEqual(['bm.x']);
    const r = await processarOutbox(d.pool, { fonte: 'businessmap', agora: AGORA, consumidores: cons, S });
    expect(r).toMatchObject({ processados: 1, apagados: 0 });
    expect(d.chamadas.find((c) => c.texto.includes('SKIP LOCKED'))!.valores[3]).toEqual(['bm.x']);
    const vazio = criarDublePg();
    await processarOutbox(vazio.pool, { fonte: 'acelerato', agora: AGORA, consumidores: new RegistroConsumidores() });
    expect(vazio.chamadas.some((c) => c.texto.includes("'processando', reservado_ate"))).toBe(false);
  });
  it('transação desfeita se a reserva falha', async () => {
    const d = criarDublePg((c) => (c.texto.includes('SKIP LOCKED') ? new Error('x') : []));
    await expect(processarOutbox(d.pool, { fonte: 'acelerato', agora: AGORA, consumidores: new RegistroConsumidores() })).rejects.toThrow('x');
    expect(d.chamadas.map((c) => c.texto)).toContain('ROLLBACK');
  });
});

describe('fecharColeta e consumidor', () => {
  it('fecha e publica na mesma conexão; coleta já fechada não publica', async () => {
    const d = criarDublePg((c) => (c.texto.startsWith('UPDATE') ? { rows: [], rowCount: 1 } : [{ evento_id: 'u' }]));
    expect(await fecharColeta(d.cliente, { fonte: 'acelerato', coletaId: 9, status: 'falha', erroResumo: 'indisponivel: x', agora: AGORA })).toBe(true);
    expect(d.chamadas[0]!.texto).toContain('dspd_ac.ctl_coleta');
    expect(d.chamadas[1]!.valores[2]).toBe('{"fonte":"acelerato","coletaId":"9","status":"falha"}');
    const d2 = criarDublePg(() => ({ rows: [], rowCount: 0 }));
    expect(await fecharColeta(d2.cliente, { fonte: 'businessmap', coletaId: '1', status: 'sucesso', agora: AGORA })).toBe(false);
    expect(d2.chamadas).toHaveLength(1);
    expect(d2.chamadas[0]!.valores[3]).toBeNull();
    const d3 = criarDublePg(() => ({ rows: [], rowCount: null as unknown as number }));
    expect(await fecharColeta(d3.cliente, { fonte: 'businessmap', coletaId: '1', status: 'sucesso', agora: AGORA })).toBe(false);
  });
  it('alerta só para falha e parcial', async () => {
    const warn = vi.fn();
    const c = consumidorColetaConcluida({ warn });
    const base = { eventoId: 'e', fonte: 'acelerato' as const, tipo: 'coleta.concluida', tentativas: 1 };
    await c({ ...base, payload: { coletaId: '1', status: 'sucesso' } });
    expect(warn).not.toHaveBeenCalled();
    await c({ ...base, payload: { coletaId: '2', status: 'falha' } });
    await c({ ...base, payload: { coletaId: '3', status: 'parcial' } });
    expect(warn).toHaveBeenCalledTimes(2);
  });
});

describe('trava por fonte', () => {
  it('executa com a trava e libera; sem a trava não executa', async () => {
    const d = criarDublePg((c) => (c.texto.includes('try_advisory') ? [{ ok: true }] : []));
    expect(await comTravaDaFonte(d.pool, 'acelerato', async () => 7)).toEqual({ executou: true, valor: 7 });
    expect(d.chamadas.some((c) => c.texto.includes('advisory_unlock'))).toBe(true);
    const e = criarDublePg((c) => (c.texto.includes('try_advisory') ? [{ ok: false }] : []));
    expect(await comTravaDaFonte(e.pool, 'acelerato', async () => 7)).toEqual({ executou: false });
    expect(e.estado.liberados).toBe(1);
    const f = criarDublePg((c) => (c.texto.includes('try_advisory') ? [{ ok: true }] : []));
    await expect(comTravaDaFonte(f.pool, 'x', async () => { throw new Error('y'); })).rejects.toThrow('y');
    expect(f.chamadas.some((c) => c.texto.includes('advisory_unlock'))).toBe(true);
    expect(f.estado.destruidos).toBe(0);
  });
  it('unlock com falha destrói a conexão (solta o lock) e não perde o resultado nem o erro de fn', async () => {
    const quebra = (c: { texto: string }) => (c.texto.includes('advisory_unlock') ? new Error('sem conexão') : [{ ok: true }]);
    const a = criarDublePg(quebra);
    expect(await comTravaDaFonte(a.pool, 'acelerato', async () => 7)).toEqual({ executou: true, valor: 7 });
    expect(a.estado.destruidos).toBe(1);
    const b = criarDublePg(quebra);
    await expect(comTravaDaFonte(b.pool, 'x', async () => { throw new Error('y'); })).rejects.toThrow('y');
    expect(b.estado.destruidos).toBe(1);
  });
});

describe('agenda', () => {
  const dia = { tipo: 'diaria', hora: 6, minuto: 0 } as const;
  it('diária: último agendado antes ou depois do horário (UTC-3)', () => {
    expect(ultimoAgendado(dia, new Date('2026-10-10T12:00:00Z')).toISOString()).toBe('2026-10-10T09:00:00.000Z');
    expect(ultimoAgendado(dia, new Date('2026-10-10T08:00:00Z')).toISOString()).toBe('2026-10-09T09:00:00.000Z');
  });
  it('semanal: domingo 03:00 local', () => {
    const sem = { tipo: 'semanal', diaSemana: 0, hora: 3, minuto: 0 } as const;
    expect(ultimoAgendado(sem, new Date('2026-10-10T15:00:00Z')).toISOString()).toBe('2026-10-04T06:00:00.000Z');
    expect(ultimoAgendado(sem, new Date('2026-10-11T10:00:00Z')).toISOString()).toBe('2026-10-11T06:00:00.000Z');
  });
  it('devida: nunca rodou, antes e depois do horário', () => {
    const t: Tarefa = { nome: 'a', fonte: 'acelerato', periodicidade: dia, executar: async () => undefined };
    const agora = new Date('2026-10-10T12:00:00Z');
    expect(devida(t, agora, null)).toBe(true);
    expect(devida(t, agora, new Date('2026-10-10T09:30:00Z'))).toBe(false);
    expect(devida(t, agora, new Date('2026-10-09T09:30:00Z'))).toBe(true);
  });
});

describe('worker', () => {
  const log = () => ({ info: vi.fn(), error: vi.fn() });
  it('roda tarefa devida sob a trava, só da fonte, e uma vez; poller por fonte', async () => {
    const ex = vi.fn(async () => undefined);
    const outra = vi.fn(async () => undefined);
    const tarefas: Tarefa[] = [
      { nome: 'bm', fonte: 'businessmap', periodicidade: { tipo: 'diaria', hora: 6, minuto: 0 }, executar: ex },
      { nome: 'ac', fonte: 'acelerato', periodicidade: { tipo: 'diaria', hora: 6, minuto: 0 }, executar: outra },
    ];
    const d = criarDublePg((c) => (c.texto.includes('try_advisory') ? [{ ok: true }] : c.texto.includes('SKIP LOCKED') ? [{ evento_sk: '1', evento_id: 'e', tipo: 'bm.x', payload: {}, tentativas: 0 }] : []));
    const l = log();
    const w = criarWorker({ pool: d.pool, fontes: ['businessmap'], consumidores: new RegistroConsumidores().registrar('businessmap', 'bm.x', async () => undefined), tarefas, agora: () => AGORA, log: l });
    await w.ciclo();
    await w.ciclo();
    expect(ex).toHaveBeenCalledTimes(1);
    expect(outra).not.toHaveBeenCalled();
    expect(l.info).toHaveBeenCalledWith(expect.objectContaining({ fonte: 'businessmap', processados: 1 }), 'outbox processada');
  });
  it('fonte ocupada, tarefa que falha e poller que falha são registrados sem derrubar o ciclo', async () => {
    const tarefa = (executar: () => Promise<void>): Tarefa => ({ nome: 't', fonte: 'acelerato', periodicidade: { tipo: 'diaria', hora: 6, minuto: 0 }, executar });
    const ocupado = criarDublePg((c) => (c.texto.includes('try_advisory') ? [{ ok: false }] : []));
    const l = log();
    await criarWorker({ pool: ocupado.pool, fontes: ['acelerato'], consumidores: new RegistroConsumidores(), tarefas: [tarefa(async () => undefined)], agora: () => AGORA, log: l }).ciclo();
    expect(l.info).toHaveBeenCalledWith({ fonte: 'acelerato', tarefa: 't' }, expect.stringContaining('outra execução'));
    const quebra = criarDublePg((c) => (c.texto.includes('try_advisory') ? [{ ok: true }] : c.texto.includes('SKIP LOCKED') ? new Error('db') : []));
    const l2 = log();
    await criarWorker({ pool: quebra.pool, fontes: ['acelerato'], consumidores: new RegistroConsumidores(), tarefas: [tarefa(async () => { throw new Error('boom'); })], agora: () => AGORA, log: l2 }).ciclo();
    expect(l2.error).toHaveBeenCalledTimes(2);
  });
  it('rodar para ao abortar; dormir acorda no aborto e no tempo', async () => {
    const d = criarDublePg();
    const w = criarWorker({ pool: d.pool, fontes: ['acelerato'], consumidores: new RegistroConsumidores(), tarefas: [], agora: () => AGORA, log: log() });
    const ac = new AbortController();
    let n = 0;
    await w.rodar(ac.signal, 10, async () => { if (++n === 2) ac.abort(); });
    expect(n).toBe(2);
    await dormir(1, new AbortController().signal);
    const a2 = new AbortController();
    const p = dormir(60_000, a2.signal);
    a2.abort();
    await p;
  });
});

describe('OpenAPI', () => {
  it('gerado = versionado (docs/api/openapi.json), sem listen e sem banco', async () => {
    const semBanco = { query: () => Promise.reject(new Error('x')) };
    const pool = { ...semBanco, connect: () => Promise.reject(new Error('x')), end: () => Promise.resolve() };
    const app = await buildApp({ db: semBanco, agora: () => new Date(0), nivelLog: 'silent', webhook: { pool, segredo: 'so-para-gerar-o-contrato' } });
    const gerado = await gerarOpenapi(app);
    const versionado = await readFile(new URL('../../docs/api/openapi.json', import.meta.url), 'utf8');
    expect(gerado).toBe(versionado);
    const caminhos = Object.keys(JSON.parse(gerado).paths);
    expect(caminhos.slice(0, 8)).toEqual(['/health/live', '/health/ready', '/health', '/api/v1/filtros/{dominio}', '/api/v1/referencia',
      '/api/v1/fontes/{dominio}/estado', '/api/v1/fontes/{dominio}/coletas', '/api/v1/criterios']);
    expect(caminhos.filter((c) => c.startsWith('/api/v1/metricas/'))).toHaveLength(57); // 56 métricas + o 404 genérico
    expect(caminhos).toContain('/webhooks/businessmap');
  });
});

describe('regras de lint (ADR 0013 §9 e 0014)', () => {
  const eslint = new ESLint({ cwd: new URL('..', import.meta.url).pathname });
  const regras = async (codigo: string, arquivo: string) =>
    (await eslint.lintText(codigo, { filePath: new URL(`../${arquivo}`, import.meta.url).pathname }))[0]!.messages.map((m) => m.message);
  const casos: [string, string, string, RegExp][] = [
    ['SELECT *', 'export const q = `SELECT * FROM x`;', 'src/modulos/operacao/x.ts', /SELECT \*/],
    ['ON CONFLICT sem alvo', "export const q = 'INSERT INTO t VALUES (1) ON CONFLICT DO NOTHING';", 'src/plataforma/x.ts', /alvo explícito/],
    ['ON CONFLICT (coluna)', "export const q = 'INSERT INTO t VALUES (1) ON CONFLICT (a) DO NOTHING';", 'src/plataforma/x.ts', /alvo explícito/],
    ['DO UPDATE', "export const q = 'ON CONFLICT ON CONSTRAINT uq DO UPDATE SET a = 1';", 'src/plataforma/x.ts', /DO UPDATE/],
    ['arquivo interno de outro módulo', "import { x } from '../operacao/servico.js'; export default x;", 'src/modulos/referencia/y.ts', /index\.ts/],
    ['businessmap importa acelerato', "import { x } from '../acelerato/index.js'; export default x;", 'src/modulos/businessmap/y.ts', /nunca se misturam/],
    ['acelerato importa businessmap', "import { x } from '../businessmap/index.js'; export default x;", 'src/modulos/acelerato/y.ts', /nunca se misturam/],
    ['plataforma importa interno de módulo', "import { x } from '../modulos/operacao/servico.js'; export default x;", 'src/plataforma/y.ts', /index\.ts/],
    ['mock no servidor', "import { x } from '@metricas-dspd/mock'; export default x;", 'src/plataforma/y.ts', /mock/],
    ['Date.now no serviço', 'export const t = Date.now();', 'src/modulos/operacao/servico.ts', /Relógio/],
    ['new Date() no repositório', 'export const t = new Date();', 'src/modulos/operacao/repositorio.ts', /Relógio/],
    ['Math.random no serviço', 'export const t = Math.random();', 'src/modulos/operacao/servico.ts', /random/],
  ];
  for (const [nome, codigo, arquivo, esperado] of casos) {
    it(`reprova: ${nome}`, async () => {
      expect((await regras(codigo, arquivo)).join('|')).toMatch(esperado);
    });
  }
  it('aprova o permitido', async () => {
    expect(await regras("export const q = 'ON CONFLICT ON CONSTRAINT uq_a DO NOTHING RETURNING a';", 'src/plataforma/x.ts')).toEqual([]);
    expect(await regras("import { x } from '../operacao/index.js'; export default x;", 'src/modulos/referencia/y.ts')).toEqual([]);
  });
});
