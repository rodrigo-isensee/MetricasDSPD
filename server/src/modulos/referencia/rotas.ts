import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { erroSchema } from '../../plataforma/erros.js';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { dominioParamsSchema, opcoesFiltroSchema, referenciaSchema, semQuerySchema } from './schemas.js';
import { opcoesFiltro, referencia } from './servico.js';

export type DepsReferencia = { db: Consultavel; S?: Esquemas; agora: () => Date; /** Base real (F6 do 052): o filtro de equipe lista os times ativos. */ times?: boolean };

const CACHE = 'private, max-age=60';

export async function rotasReferencia(app: FastifyInstance, deps: DepsReferencia): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();
  r.get('/filtros/:dominio', {
    schema: {
      tags: ['referencia'], summary: 'Opções dos filtros de uma fonte (sem opção de pessoa)',
      params: dominioParamsSchema, querystring: semQuerySchema,
      response: { 200: opcoesFiltroSchema, 400: erroSchema, 500: erroSchema },
    },
  }, async (req, resposta) => {
    void resposta.header('cache-control', CACHE);
    return opcoesFiltro(deps.db, req.params.dominio, deps.agora(), deps.S, { times: deps.times === true });
  });
  r.get('/referencia', {
    schema: {
      tags: ['referencia'], summary: 'Data de referência, última coleta por fonte e versão de critério',
      querystring: semQuerySchema,
      response: { 200: referenciaSchema, 400: erroSchema, 500: erroSchema },
    },
  }, async (_req, resposta) => {
    void resposta.header('cache-control', CACHE);
    return referencia(deps.db, deps.agora(), deps.S);
  });
}
