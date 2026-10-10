import { hasZodFastifySchemaValidationErrors, isResponseSerializationError } from 'fastify-type-provider-zod';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

/** Erro de negócio lançado por serviços; o handler global o converte para o formato único da ADR 0007. */
export class AppError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly details: unknown[] = [],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const erroSchema = z.object({
  error: z.object({ code: z.string(), message: z.string(), details: z.array(z.unknown()).optional() }),
});
export type CorpoErro = z.infer<typeof erroSchema>;

const corpo = (code: string, message: string, details?: unknown[]): CorpoErro => ({
  error: details === undefined ? { code, message } : { code, message, details },
});

/** Só caminho e mensagem do schema; o valor recebido nunca é devolvido. */
const detalhes = (issues: readonly { path: PropertyKey[]; message: string }[]): unknown[] =>
  issues.map((i) => ({ caminho: i.path.map(String).join('.'), mensagem: i.message }));

export function tratarErro(erro: FastifyError, req: FastifyRequest, resposta: FastifyReply): FastifyReply {
  if (hasZodFastifySchemaValidationErrors(erro)) {
    return resposta.status(400).send(corpo('VALIDATION_ERROR', 'Parâmetros inválidos.', detalhes(erro.validation.map((v) => ({
      path: v.instancePath.split('/').filter(Boolean), message: v.message as string,
    })))));
  }
  if (erro instanceof AppError) {
    return resposta.status(erro.status).send(corpo(erro.code, erro.message, erro.details.length > 0 ? erro.details : undefined));
  }
  if (isResponseSerializationError(erro)) {
    req.log.error({ err: erro }, 'resposta fora do schema');
    return resposta.status(500).send(corpo('INTERNAL_ERROR', 'Erro interno.'));
  }
  const status = erro.statusCode ?? 500;
  if (status >= 400 && status < 500) {
    return resposta.status(status).send(corpo(status === 400 ? 'VALIDATION_ERROR' : 'REQUISICAO_INVALIDA', 'Requisição inválida.'));
  }
  req.log.error({ err: erro }, 'erro inesperado');
  return resposta.status(500).send(corpo('INTERNAL_ERROR', 'Erro interno.'));
}

export const rotaNaoEncontrada = (_req: FastifyRequest, resposta: FastifyReply): FastifyReply =>
  resposta.status(404).send(corpo('ROTA_NAO_ENCONTRADA', 'Rota não encontrada.'));
