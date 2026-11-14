import { consultaApontamentoSchema, respostaApontamentoSchema } from '@metricas-dspd/contratos';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { AppError, erroSchema, tratarErro } from '../../plataforma/erros.js';
import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { nomesAceitos, origemPermitida } from './hosts.js';
import { montarApontamento } from './servico.js';

// Pedido 059 (K-193), ADR 0020 revisão 4, R4-5: rota única `GET /api/apontamento` (docs/api/apontamento.md). Consulta estrita (chave desconhecida = 400),
// `Cache-Control: no-store` em toda resposta do módulo, `Host`/`Origin` fora da lista fechada = 421 sem corpo e sem eco, nenhum log de corpo nem de
// resposta, CORS fechado (nenhum cabeçalho `Access-Control-*`). Sem autenticação até o login pelo AD (decisão do dono).

export type DepsApontamento = {
  /** Pool do papel `dspd_api_apontamento` (ou dublê de teste); aberto só neste módulo (`abrirPoolApontamento`). */
  db: Consultavel;
  S?: Esquemas;
  agora: () => Date;
  /** `APONTAMENTO_NOMES` ligado: o rótulo da pessoa é o nome real; desligado, "Pessoa n" (padrão). */
  nomesReais: boolean;
  /** `APONTAMENTO_REDE_LOCAL`: único endereço privado aceito além do loopback no `Host` e no `Origin`. */
  redeLocal?: string;
};

/** Mesmo schema do contrato, mais a recusa de valor repetido nas listas (`pessoa=p1,p1`, CA-AP-6). */
const consultaDaRota = consultaApontamentoSchema.superRefine((c, ctx) => {
  for (const campo of ['pessoa', 'projeto', 'tipo', 'equipe', 'subtarefa', 'subgrupo', 'qualidade'] as const) {
    const itens = c[campo] as string[] | undefined;
    if (itens !== undefined && new Set(itens).size !== itens.length) ctx.addIssue({ code: 'custom', path: [campo], message: 'repetido' });
  }
});

/** 400 só com caminho e código do problema: nunca `message` do schema nem o valor recebido (B-4, CA-AP-6). */
function tratarErroDaAba(erro: Error, req: FastifyRequest, resposta: FastifyReply): FastifyReply {
  if (hasZodFastifySchemaValidationErrors(erro)) {
    const details = erro.validation.map((v) => ({ path: v.instancePath.split('/').filter(Boolean).join('.'), code: v.keyword }));
    return resposta.status(400).send({ error: { code: 'VALIDATION_ERROR', message: 'Parâmetros inválidos.', details } });
  }
  return tratarErro(erro as never, req, resposta);
}

/**
 * Registro de requisição da aba: só `MÉTODO /caminho`, sem a consulta (que traz filtro de pessoa) e sem o `Host` recebido, para nenhum valor enviado
 * (nem o inválido) ir ao log (CA-AP-3, CA-AP-6). O serializador padrão do Fastify loga `url` inteira e `host`.
 */
export const serializadorDaAba = { req: (req: { method?: string; url?: string }): string => `${req.method ?? '?'} ${(req.url ?? '').split('?')[0]!}` };

export async function rotasApontamento(app: FastifyInstance, deps: DepsApontamento): Promise<void> {
  const aceitos = nomesAceitos(deps.redeLocal);
  await app.register(async (i) => {
    i.setErrorHandler(tratarErroDaAba);
    // Nada de cache em resposta alguma da aba (CA-AP-7), nem a 421, a 400 ou a 500.
    i.addHook('onSend', (_req, reply, _payload, pronto) => {
      void reply.header('cache-control', 'no-store');
      pronto();
    });
    // R4-5: valida antes de qualquer outra coisa, com o interruptor de nome ligado ou desligado. O valor recebido nunca é devolvido nem logado.
    i.addHook('onRequest', (req, reply, pronto) => {
      if (origemPermitida(req.headers.host, req.headers.origin, aceitos)) return pronto();
      req.log.warn({ codigo: 'host-ou-origin-fora-da-lista' }, 'requisição recusada com 421');
      void reply.code(421).send();
      return undefined;
    });
    i.withTypeProvider<ZodTypeProvider>().get('/api/apontamento', {
      schema: {
        tags: ['apontamento'], summary: 'Aba Apontamento: horas apontadas no BusinessMap (capacidade, utilização e distribuição do tempo do time)',
        querystring: consultaDaRota, response: { 200: respostaApontamentoSchema, 400: erroSchema, 500: erroSchema },
      },
    }, async (req) => {
      try {
        return await montarApontamento({ db: deps.db, S: deps.S ?? esquemasDoAmbiente(), agora: deps.agora, nomesReais: deps.nomesReais }, req.query);
      } catch (e) {
        // Só a classe e o SQLSTATE vão ao log: a mensagem do driver pode trazer valor (nome, id) e nunca é repassada.
        req.log.error({ erro: (e as Error).constructor.name, sqlstate: (e as { code?: unknown }).code }, 'falha na consulta da aba Apontamento');
        throw new AppError('INTERNAL_ERROR', 'Erro interno.', 500);
      }
    });
  }, { logSerializers: serializadorDaAba });
}
