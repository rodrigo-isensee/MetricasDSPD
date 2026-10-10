import { estadoColetaSchema, paginaColetasSchema, versaoCriterioSchema } from '@metricas-dspd/contratos';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { erroSchema } from '../../plataforma/erros.js';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { criterios, estadoColeta, historicoColetas } from './servico.js';

export type DepsOperacao = { db: Consultavel; S?: Esquemas; agora: () => Date };

const CACHE = 'private, max-age=60';
const dominioParams = z.object({ dominio: z.enum(['businessmap', 'acelerato']) }).strict();
/** Sem parâmetro algum além de `pagina`: qualquer outro (inclusive de pessoa) reprova (400). */
const queryColetas = z.object({ pagina: z.coerce.number().int().min(1).default(1) }).strict();
const semQuery = z.object({}).strict();

/** Estado de coleta, histórico e critérios (docs/api/fontes.md). Uma fonte por chamada: nada soma as duas. */
export async function rotasOperacao(app: FastifyInstance, deps: DepsOperacao): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();
  r.get('/fontes/:dominio/estado', {
    schema: { tags: ['fontes'], summary: 'Estado da coleta de uma fonte (selo, calibração)', params: dominioParams, querystring: semQuery,
      response: { 200: estadoColetaSchema, 400: erroSchema, 500: erroSchema } },
  }, async (req, resposta) => {
    void resposta.header('cache-control', CACHE);
    return estadoColeta(deps.db, req.params.dominio, deps.agora(), deps.S);
  });
  r.get('/fontes/:dominio/coletas', {
    schema: { tags: ['fontes'], summary: 'Histórico de coletas de uma fonte (20 por página)', params: dominioParams, querystring: queryColetas,
      response: { 200: paginaColetasSchema, 400: erroSchema, 500: erroSchema } },
  }, async (req, resposta) => {
    void resposta.header('cache-control', CACHE);
    return historicoColetas(deps.db, req.params.dominio, req.query.pagina, deps.S);
  });
  r.get('/criterios', {
    schema: { tags: ['fontes'], summary: 'Versões de critério de cálculo (T2.6)', querystring: semQuery,
      response: { 200: z.array(versaoCriterioSchema), 400: erroSchema, 500: erroSchema } },
  }, async (_req, resposta) => {
    void resposta.header('cache-control', CACHE);
    return criterios(deps.db, deps.S);
  });
}
