import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { Consultavel } from './db/pool.js';
import { AppError, erroSchema } from './erros.js';

const okSchema = z.object({ status: z.literal('ok') }).strict();

/** `/health/live` não toca o banco; `/health/ready` (e o alias `/health`) consulta o banco e devolve 503 se ele não responde. */
export async function rotasSaude(app: FastifyInstance, db: Consultavel): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const resposta = { 200: okSchema, 503: erroSchema };
  r.get('/health/live', { schema: { tags: ['saude'], summary: 'Processo no ar', response: resposta } }, () => ({ status: 'ok' as const }));
  const pronto = async (): Promise<{ status: 'ok' }> => {
    try {
      await db.query('SELECT 1 AS ok');
      return { status: 'ok' };
    } catch (e) {
      app.log.error({ err: e }, 'base indisponível');
      throw new AppError('BASE_INDISPONIVEL', 'Base indisponível.', 503);
    }
  };
  for (const rota of ['/health/ready', '/health']) {
    r.get(rota, { schema: { tags: ['saude'], summary: 'Pronto para atender (consulta o banco)', response: resposta } }, pronto);
  }
}
