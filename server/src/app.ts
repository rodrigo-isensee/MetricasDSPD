import fastifySwagger from '@fastify/swagger';
import Fastify, { type FastifyInstance } from 'fastify';
import {
  jsonSchemaTransform, serializerCompiler, validatorCompiler,
} from 'fastify-type-provider-zod';
import { rotasReferencia } from './modulos/referencia/index.js';
import type { Esquemas } from './plataforma/db/esquemas.js';
import type { Consultavel } from './plataforma/db/pool.js';
import { rotaNaoEncontrada, tratarErro } from './plataforma/erros.js';
import { gerarRequestId, opcoesLog } from './plataforma/log.js';
import { rotasSaude } from './plataforma/saude.js';

export type DepsApp = {
  /** Pool do papel `dspd_api` (ou dublê de teste). */
  db: Consultavel;
  S?: Esquemas;
  /** Relógio injetado: nenhum serviço lê a hora do sistema. */
  agora: () => Date;
  nivelLog?: string;
  /** Destino do log (testes capturam); padrão stdout. */
  destinoLog?: { write(msg: string): void };
};

export const VERSAO_API = '0.1.0';

/** Monta o Fastify (sem `listen`): usado pela entrada `api`, pelos testes (`inject`) e pelo gerador do OpenAPI. */
export async function buildApp(deps: DepsApp): Promise<FastifyInstance> {
  const app = Fastify({
    logger: deps.destinoLog
      ? { ...opcoesLog(deps.nivelLog ?? 'info'), stream: deps.destinoLog }
      : opcoesLog(deps.nivelLog ?? 'info'),
    requestIdLogLabel: 'requestId',
    genReqId: (req) => gerarRequestId(req.headers['x-request-id']),
  });
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.setErrorHandler(tratarErro);
  app.setNotFoundHandler(rotaNaoEncontrada);
  app.addHook('onSend', (req, reply, _payload, pronto) => {
    void reply.header('x-request-id', req.id);
    pronto();
  });
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: { title: 'API de métricas DSPD', version: VERSAO_API, description: 'Somente leitura. Nenhuma rota expõe dado por pessoa.' },
    },
    transform: jsonSchemaTransform,
  });
  await app.register(async (i) => rotasSaude(i, deps.db));
  await app.register(async (i) => rotasReferencia(i, { db: deps.db, S: deps.S, agora: deps.agora }), { prefix: '/api/v1' });
  return app;
}
