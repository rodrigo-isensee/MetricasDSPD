import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { tratarErro } from '../src/plataforma/erros.js';

const MARCA = 'MARCADOR-K347-LINHA';

async function montar() {
  const linhas: string[] = [];
  const app = Fastify({ logger: { level: 'info', stream: { write: (m: string) => { linhas.push(m); } } } });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(tratarErro);
  app.get('/qualquer/banco', async () => {
    throw Object.assign(new Error(`Key (id)=(${MARCA}) already exists.`), { code: '23505', detail: MARCA });
  });
  app.get('/qualquer/schema', { schema: { response: { 200: z.object({ n: z.number() }) } } }, async () => ({ n: MARCA }) as never);
  app.post('/webhooks/businessmap', async () => { throw new Error(`valor ${MARCA}`); });
  await app.ready();
  return { app, linhas };
}

describe('K-347: todo 5xx loga só tipo e código', () => {
  it('erro de banco em rota qualquer: o marcador não vai à resposta nem ao log; tipo e código sim', async () => {
    const { app, linhas } = await montar();
    const r = await app.inject({ method: 'GET', url: '/qualquer/banco' });
    expect(r.statusCode).toBe(500);
    expect(r.body).not.toContain(MARCA);
    const log = linhas.join('');
    expect(log).not.toContain(MARCA);
    expect(log).toContain('23505');
    expect(log).toContain('Error');
  });
  it('resposta fora do schema: o marcador não vai ao log', async () => {
    const { app, linhas } = await montar();
    const r = await app.inject({ method: 'GET', url: '/qualquer/schema' });
    expect(r.statusCode).toBe(500);
    expect(r.json().error.code).toBe('INTERNAL_ERROR');
    expect(linhas.join('')).not.toContain(MARCA);
    const linha = linhas.map((l) => JSON.parse(l) as Record<string, unknown>).find((l) => l.msg === 'resposta fora do schema');
    expect(linha).toBeDefined();
    // só tipo e código: o erro cru (campo err, com mensagem e pilha) não vai ao log
    expect(linha).not.toHaveProperty('err');
    expect(Object.keys(linha!.erro as object).sort()).toEqual(['codigo', 'tipo'].filter((k) => k in (linha!.erro as object)).sort());
    expect(linha!.erro).toHaveProperty('tipo');
  });
  it('webhook segue sem a mensagem crua no log', async () => {
    const { app, linhas } = await montar();
    const r = await app.inject({ method: 'POST', url: '/webhooks/businessmap', payload: {} });
    expect(r.statusCode).toBe(500);
    expect(linhas.join('')).not.toContain(MARCA);
  });
});
