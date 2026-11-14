import fastifySwagger from '@fastify/swagger';
import Fastify, { type FastifyInstance } from 'fastify';
import {
  jsonSchemaTransform, serializerCompiler, validatorCompiler,
} from 'fastify-type-provider-zod';
import { rotasApontamento } from './modulos/apontamento/index.js';
import { rotasWebhook } from './modulos/businessmap/index.js';
import { ServicoMetricas, criarFontePesquisaReal, filtrosPadraoDe, rotasMetricas, type FontePesquisa } from './modulos/metricas/index.js';
import type { ExtensoesMetricas } from './modulos/metricas/index.js';
import type { ExtensaoTambemBM } from '@metricas-dspd/metricas/businessmap';
import { rotasOperacao } from './modulos/operacao/index.js';
import { rotasReferencia } from './modulos/referencia/index.js';
import type { Esquemas } from './plataforma/db/esquemas.js';
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
  /**
   * Aba Apontamento (pedido 059, ADR 0020 revisão 4): pool do papel `dspd_api_apontamento` e o interruptor `APONTAMENTO_NOMES`. Sem isto a rota
   * `GET /api/apontamento` não existe. `redeLocal` = `APONTAMENTO_REDE_LOCAL`, aceito no `Host` e no `Origin` além do loopback.
   */
  apontamento?: { pool: Consultavel; nomesReais: boolean; redeLocal?: string };
  nivelLog?: string;
  /**
   * Modo mock (pedido 060, P2): só por ativação explícita, na homologação (`DSPD_MODO_MOCK=homologacao`) e nos testes e E2E (injeção). Liga o
   * conjunto inteiro: todas as métricas lêem a base semeada (leitura de mock, sem o portão do mapa real), com as extensões e a pesquisa
   * fictícias, e a resposta leva o cabeçalho `x-dados-ficticios: 1` (selo global). Padrão (ausente): só dado real, e a métrica fora de
   * `METRICAS_ORIGEM_REAL` responde "sem dado real" com o motivo.
   */
  modoMock?: boolean;
  /** Extensões das métricas complementares; só entram por injeção ou pelo modo mock. `null` = nenhuma, mesmo no modo mock (testes do campo ausente). */
  extensoes?: (() => ExtensoesMetricas) | null;
  /** Extensão do pedido 011 (T11, O22, O26, T13, E6, E8 e T14); só por injeção ou pelo modo mock. `null` = nenhuma, mesmo no modo mock. */
  extensaoTambem?: (() => ExtensaoTambemBM) | null;
  /** Fonte da pesquisa de percepção (PV1); padrão = a leitura de `pesq_*` (ou a do mock, no modo mock). */
  pesquisa?: FontePesquisa;
  /** Aquece a base em memória e o código das métricas antes de aceitar requisições (SNO-005). Padrão: desligado (testes). */
  aquecer?: boolean;
  /** Prazo máximo que a subida espera pelo aquecimento (ms). Padrão 5000, bem abaixo do pluginTimeout de 10 s. */
  prazoAquecimentoMs?: number;
  /** Destino do log (testes capturam); padrão stdout. */
  destinoLog?: { write(msg: string): void };
};

export const VERSAO_API = '0.1.0';
const PRAZO_ESPERA_AQUECIMENTO_MS = 5000;
const classeDoErro = (e: unknown): string => (e as Error).constructor.name;

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
  const modoMock = deps.modoMock === true;
  // As fontes fictícias só são carregadas (import dinâmico) no modo mock: a partida padrão não toca o código do mock.
  const mock = modoMock
    ? { ...(await import('./plataforma/db/extensoes-mock.js')), ...(await import('./plataforma/db/pesquisa-mock.js')) }
    : undefined;
  if (modoMock) app.log.info({ modoMock: true }, 'modo mock ligado: dados fictícios (pedido 060, só homologação e testes)');
  app.addHook('onSend', (req, reply, _payload, pronto) => {
    void reply.header('x-request-id', req.id);
    if (modoMock) void reply.header('x-dados-ficticios', '1');
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
  const servico = new ServicoMetricas({ db: deps.db, S: deps.S, modoMock,
    log: (contexto, mensagem) => { app.log.warn(contexto, mensagem); },
    extensoes: deps.extensoes === undefined ? mock?.extensoesMock : deps.extensoes ?? undefined,
    extensaoTambem: deps.extensaoTambem === undefined ? mock?.extensaoTambemMock : deps.extensaoTambem ?? undefined,
    pesquisa: deps.pesquisa ?? (mock === undefined ? criarFontePesquisaReal(deps.db, deps.S) : mock.fontePesquisaMock) });
  if (deps.aquecer === true) {
    // O onReady está sujeito ao pluginTimeout do Fastify (10 s): se o aquecimento passasse disso, ready()/listen falharia
    // com FST_ERR_HOOK_TIMEOUT e a API não subiria. Por isso a espera é limitada; o aquecimento segue em segundo plano.
    const prazo = deps.prazoAquecimentoMs ?? PRAZO_ESPERA_AQUECIMENTO_MS;
    app.addHook('onReady', async () => {
      const t0 = performance.now();
      const aquecimento = servico.aquecer(deps.agora(), filtrosPadraoDe).then(
        (r) => {
          const ms = Math.round(performance.now() - t0);
          if (r.falhas.length > 0) app.log.warn({ metricas: r.metricas, falhas: r.falhas, ms }, 'aquecimento concluído com métricas que falharam; a consulta real as trata');
          else app.log.info({ metricas: r.metricas, falhas: r.falhas, ms }, 'aquecimento concluído');
          return 'concluido' as const;
        },
        (e: unknown) => {
          app.log.warn({ erro: classeDoErro(e) }, 'aquecimento falhou; a primeira consulta carrega a base');
          return 'concluido' as const;
        },
      );
      let timer: NodeJS.Timeout = undefined as never;
      const vencido = new Promise<'prazo'>((res) => { timer = setTimeout(() => { res('prazo'); }, prazo); });
      const quem = await Promise.race([aquecimento, vencido]);
      clearTimeout(timer);
      if (quem === 'prazo') app.log.warn({ prazoMs: prazo }, 'aquecimento não terminou no prazo; a API sobe e ele continua em segundo plano');
    });
  }
  await app.register(async (i) => {
    await rotasReferencia(i, { db: deps.db, S: deps.S, agora: deps.agora, times: !modoMock });
    await rotasOperacao(i, { db: deps.db, S: deps.S, agora: deps.agora });
    await rotasMetricas(i, { servico, agora: deps.agora });
  }, { prefix: '/api/v1' });
  if (deps.apontamento) await rotasApontamento(app, { db: deps.apontamento.pool, S: deps.S, agora: deps.agora, nomesReais: deps.apontamento.nomesReais, redeLocal: deps.apontamento.redeLocal });
  if (deps.webhook) await rotasWebhook(app, { pool: deps.webhook.pool, segredo: deps.webhook.segredo, agora: deps.agora, S: deps.S });
  return app;
}
