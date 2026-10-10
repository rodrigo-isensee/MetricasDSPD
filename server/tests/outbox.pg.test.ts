import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { emTransacao } from '../src/plataforma/db/pool.js';
import { RegistroConsumidores, processarOutbox, publicarEvento } from '../src/plataforma/eventos/index.js';
import { fecharColeta } from '../src/modulos/operacao/index.js';
import { S, novaColeta, poolDe, unico, url } from './pg/ctx.js';

const d = url ? describe : describe.skip;
d('outbox e rotas no Postgres', () => {
  const migrador = url ? poolDe() : (undefined as never);
  const coletor = url ? poolDe('dspd_coletor') : (undefined as never);
  const api = url ? poolDe('dspd_api') : (undefined as never);
  afterAll(async () => { if (url) await Promise.all([migrador.end(), coletor.end(), api.end()]); });
  // O banco grava disponivel_em = now(): o "agora" do poller precisa estar à frente do relógio real.
  const AGORA = new Date(Date.now() + 3_600_000);
  const DIA_FIXO = new Date('2026-10-10T15:00:00Z');
  const tipo = () => `bm.${unico('t')}`;
  const status = async (id: string) => (await migrador.query<{ status: string; tentativas: number; ultimo_erro: string | null }>(
    `SELECT status, tentativas, ultimo_erro FROM ${S.core}.outbox WHERE evento_id = $1`, [id])).rows[0]!;

  it('evento só existe se a transação confirmou (rollback some com ele)', async () => {
    const t = tipo();
    await expect(emTransacao(coletor, async (c) => { await publicarEvento(c, { fonte: 'businessmap', tipo: t, payload: {} }, S); throw new Error('desfaz'); })).rejects.toThrow('desfaz');
    expect((await migrador.query(`SELECT 1 FROM ${S.core}.outbox WHERE tipo = $1`, [t])).rowCount).toBe(0);
    const id = await emTransacao(coletor, (c) => publicarEvento(c, { fonte: 'businessmap', tipo: t, payload: { a: 1 } }, S));
    expect((await status(id)).status).toBe('pendente');
  });

  it('processa uma vez; reexecução não duplica; só a fonte pedida', async () => {
    const t = tipo();
    const id = await publicarEvento(coletor, { fonte: 'businessmap', tipo: t, payload: {} }, S);
    const idAc = await publicarEvento(coletor, { fonte: 'acelerato', tipo: 'coleta.concluida', payload: {} }, S);
    let chamadas = 0;
    const consumidores = new RegistroConsumidores().registrar('businessmap', t, async () => { chamadas++; });
    const op = { fonte: 'businessmap' as const, agora: AGORA, consumidores, S, limite: 500 };
    await processarOutbox(coletor, op);
    await processarOutbox(coletor, op);
    expect(chamadas).toBe(1);
    expect((await status(id)).status).toBe('processado');
    expect((await status(idAc)).status).toBe('pendente');
  });

  it('dois pollers simultâneos não processam o mesmo evento', async () => {
    const t = tipo();
    const ids = await Promise.all(Array.from({ length: 6 }, () => publicarEvento(coletor, { fonte: 'businessmap', tipo: t, payload: {} }, S)));
    const vistos: string[] = [];
    const consumidores = new RegistroConsumidores().registrar('businessmap', t, async (e) => { await new Promise((r) => setTimeout(r, 30)); vistos.push(e.eventoId); });
    const op = { fonte: 'businessmap' as const, agora: AGORA, consumidores, S, limite: 3 };
    // outros testes deixam eventos de outros tipos; limite alto evitaria o paralelismo, então só contamos os nossos
    await Promise.all([processarOutbox(coletor, op), processarOutbox(coletor, op), processarOutbox(coletor, op), processarOutbox(coletor, op)]);
    await processarOutbox(coletor, op);
    await processarOutbox(coletor, op);
    expect(new Set(vistos).size).toBe(vistos.length);
    expect(vistos.every((v) => ids.includes(v))).toBe(true);
  });

  it('erro reagenda com backoff e guarda só a categoria; 8 tentativas = falha; reserva expirada é retomada', async () => {
    const t = tipo();
    const id = await publicarEvento(coletor, { fonte: 'businessmap', tipo: t, payload: {} }, S);
    const consumidores = new RegistroConsumidores().registrar('businessmap', t, async () => { throw new RangeError('segredo=123'); });
    let agora = AGORA;
    await processarOutbox(coletor, { fonte: 'businessmap', agora, consumidores, S, limite: 500 });
    let s = await status(id);
    expect(s).toMatchObject({ status: 'pendente', tentativas: 1, ultimo_erro: 'RangeError' });
    for (let i = 2; i <= 8; i++) {
      agora = new Date(agora.getTime() + 2 * 3_600_000);
      await processarOutbox(coletor, { fonte: 'businessmap', agora, consumidores, S, limite: 500 });
    }
    s = await status(id);
    expect(s).toMatchObject({ status: 'falha', tentativas: 8 });
    // reserva expirada: um consumidor que "morreu" deixou o evento em processando
    const id2 = await publicarEvento(coletor, { fonte: 'businessmap', tipo: t, payload: {} }, S);
    await migrador.query(`UPDATE ${S.core}.outbox SET status = 'processando', reservado_ate = $2, tentativas = 1 WHERE evento_id = $1`, [id2, new Date(AGORA.getTime() - 1000)]);
    const ok = new RegistroConsumidores().registrar('businessmap', t, async () => undefined);
    await processarOutbox(coletor, { fonte: 'businessmap', agora: AGORA, consumidores: ok, S, limite: 500 });
    expect(await status(id2)).toMatchObject({ status: 'processado', tentativas: 2 });
  });

  it('retenção: processado com mais de 30 dias é apagado; recente fica', async () => {
    const a = await publicarEvento(coletor, { fonte: 'acelerato', tipo: 'coleta.concluida', payload: {} }, S);
    const b = await publicarEvento(coletor, { fonte: 'acelerato', tipo: 'coleta.concluida', payload: {} }, S);
    await migrador.query(`UPDATE ${S.core}.outbox SET status = 'processado', processado_em = $2 WHERE evento_id = $1`, [a, new Date(AGORA.getTime() - 31 * 86_400_000)]);
    await migrador.query(`UPDATE ${S.core}.outbox SET status = 'processado', processado_em = $2 WHERE evento_id = $1`, [b, new Date(AGORA.getTime() - 5 * 86_400_000)]);
    const r = await processarOutbox(coletor, { fonte: 'businessmap', agora: AGORA, consumidores: new RegistroConsumidores(), S, limite: 1 });
    expect(r.apagados).toBeGreaterThanOrEqual(1);
    expect((await migrador.query(`SELECT 1 FROM ${S.core}.outbox WHERE evento_id = $1`, [a])).rowCount).toBe(0);
    expect((await migrador.query(`SELECT 1 FROM ${S.core}.outbox WHERE evento_id = $1`, [b])).rowCount).toBe(1);
  });

  it('fecharColeta atualiza ctl_coleta e publica coleta.concluida na mesma transação', async () => {
    const id = await novaColeta(migrador, S.ac);
    await migrador.query(`UPDATE ${S.ac}.ctl_coleta SET tarefa = 'reconciliacao' WHERE coleta_id = $1`, [id]);
    expect(await emTransacao(coletor, (c) => fecharColeta(c, { fonte: 'acelerato', coletaId: id, status: 'falha', erroResumo: 'indisponivel: x', agora: AGORA }, S))).toBe(true);
    const e = await migrador.query<{ payload: { coletaId: string; status: string } }>(`SELECT payload FROM ${S.core}.outbox WHERE tipo = 'coleta.concluida' AND payload->>'coletaId' = $1`, [String(id)]);
    expect(e.rows[0]!.payload).toMatchObject({ status: 'falha' });
    expect((await migrador.query<{ status: string }>(`SELECT status FROM ${S.ac}.ctl_coleta WHERE coleta_id = $1`, [id])).rows[0]!.status).toBe('falha');
    expect(await emTransacao(coletor, (c) => fecharColeta(c, { fonte: 'acelerato', coletaId: id, status: 'sucesso', agora: AGORA }, S))).toBe(false);
  });

  it('rotas com o papel dspd_api: ready, filtros e referência; api não lê a outbox', async () => {
    const app = await buildApp({ db: api, S, agora: () => DIA_FIXO, nivelLog: 'silent' });
    expect((await app.inject('/health/ready')).statusCode).toBe(200);
    for (const dom of ['businessmap', 'acelerato']) {
      const r = await app.inject(`/api/v1/filtros/${dom}`);
      expect(r.statusCode, r.body).toBe(200);
      expect(r.json().historico.fim).toBe('2026-10-10');
    }
    const ref = await app.inject('/api/v1/referencia');
    expect(ref.statusCode, ref.body).toBe(200);
    expect(ref.json().dataReferencia).toMatch(/^\d{4}-\d{2}-\d{2}$/); // S-a: data da última coleta bem-sucedida (outros testes criam coletas)
    await expect(api.query(`SELECT 1 FROM ${S.core}.outbox`)).rejects.toMatchObject({ code: '42501' });
  });
});
