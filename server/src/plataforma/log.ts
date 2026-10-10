import { randomUUID } from 'node:crypto';
import type { LoggerOptions } from 'pino';

/** Campos que nunca chegam ao log (segredos, credenciais, cabeçalhos de autenticação). */
export const CAMINHOS_REDIGIDOS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-webhook-secret"]',
  'res.headers["set-cookie"]',
  '*.password',
  '*.senha',
  '*.apikey',
  '*.token',
  '*.connectionString',
];

export const opcoesLog = (level: string): LoggerOptions => ({
  level,
  redact: { paths: CAMINHOS_REDIGIDOS, censor: '[redigido]' },
});

const ID_VALIDO = /^[A-Za-z0-9._-]{8,64}$/;
/** `requestId`: aproveita o `x-request-id` de entrada só se for seguro; senão gera um UUID. */
export const gerarRequestId = (entrada: unknown): string =>
  typeof entrada === 'string' && ID_VALIDO.test(entrada) ? entrada : randomUUID();
