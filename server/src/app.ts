import fastifySwagger from '@fastify/swagger';
import Fastify, { type FastifyInstance } from 'fastify';
import {
  jsonSchemaTransform, serializerCompiler, validatorCompiler,
} from 'fastify-type-provider-zod';
import { rotasWebhook } from './modulos/businessmap/index.js';
import { ServicoMetricas, rotasMetricas, type FontePesquisa } from './modulos/metricas/index.js';
import type { ExtensoesMetricas } from '@metricas-dspd/metricas';
import { rotasOperacao } from './modulos/operacao/index.js';
import { rotasReferencia } from './modulos/referencia/index.js';
import type { Esquemas } from './plataforma/db/esquemas.js';
import { fontePesquisaMock } from './plataforma/db/pesquisa-mock.js';
import { extensoesMock } from './plataforma/db/extensoes-mock.js';
import type { Consultavel, PoolLike } from './plataforma/db/pool.js';
import { rotaNaoEncontrada, tratarErro } from './plataforma/erros.js';
import { gerarRequestId, opcoesLog } from './plataforma/log.js';
import { rotasSaude } from './plataforma/saude.js';

export type DepsApp = {
  /** Pool do papel `dspd_api` (ou dublê de teste). */
  db: Consultavel;
  S?: Esquemas;
  /** Relógio injetado: nenhum serviço lê a hora do sistema. */
  agora: () => Date;
  /** Receptor do webhook do BusinessMap: pool do papel `dspd_webhook` e segredo. Sem isto a rota não existe. */
  webhook?: { pool: PoolLike; segredo: string };
  nivelLog?: string;
  /** Extensões das métricas complementares; padrão = mock. */
  extensoes?: () => ExtensoesMetricas;
  /** Fonte da pesquisa de percepção (PV1); padrão = mock quando `fonteDados !== 'real'`. */
  pesquisa?: FontePesquisa;
  /** Fonte dos dados: só em 'mock' as extensões mockadas entram; em 'real', sem extensão os campos saem insuficientes. Padrão 'mock'. */
  fonteDados?: 'mock' | 'real';
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
  const servico = new ServicoMetricas({ db: deps.db, S: deps.S, extensoes: deps.extensoes ?? (deps.fonteDados === 'real' ? undefined : extensoesMock),
    pesquisa: deps.pesquisa ?? (deps.fonteDados === 'real' ? undefined : fontePesquisaMock) });
  await app.register(async (i) => {
    await rotasReferencia(i, { db: deps.db, S: deps.S, agora: deps.agora });
    await rotasOperacao(i, { db: deps.db, S: deps.S, agora: deps.agora });
    await rotasMetricas(i, { servico, agora: deps.agora });
  }, { prefix: '/api/v1' });
  if (deps.webhook) await rotasWebhook(app, { pool: deps.webhook.pool, segredo: deps.webhook.segredo, agora: deps.agora, S: deps.S });
  return app;
}
