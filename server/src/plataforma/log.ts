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
  'apikey',
  '*.apikey',
  '*.headers.apikey',
  '*.*.headers.apikey',
  '*.token',
  '*.connectionString',
  // Pedido 059 (ADR 0020, revisão 4, R4-2): comentário do apontamento e nome de pessoa, em um e em dois níveis. Defesa secundária: o erro do
  // coletor carrega só código, entidade e `id_origem`, e nenhum objeto com comentário ou nome chega ao logger.
  '*.comment',
  '*.comentario',
  '*.realname',
  '*.responsavel_nome',
  '*.*.comment',
  '*.*.comentario',
  '*.*.realname',
  '*.*.responsavel_nome',
  // Pedido 105 (O22, ADR 0020 R6-7): `user_id` da revisão e `author`, `text` e `attachments` do comentário, em um e em dois níveis (a segunda forma cobre também o
  // objeto dentro de uma lista, `{ itens: [{ text }] }`). Defesa secundária: nenhum objeto de revisão ou comentário chega ao logger.
  '*.user_id',
  '*.author',
  '*.text',
  '*.attachments',
  '*.*.user_id',
  '*.*.author',
  '*.*.text',
  '*.*.attachments',
  // Chave no topo do objeto de log (`log.info({ text, user_id, author })`): os caminhos com prefixo não a alcançam (A1 do parecer 105-o22-coleta).
  'user_id',
  'author',
  'text',
  'attachments',
  'comment',
  'comentario',
  'realname',
  'responsavel_nome',
];

export const opcoesLog = (level: string): LoggerOptions => ({
  level,
  redact: { paths: CAMINHOS_REDIGIDOS, censor: '[redigido]' },
});

const ID_VALIDO = /^[A-Za-z0-9._-]{8,64}$/;
/** `requestId`: aproveita o `x-request-id` de entrada só se for seguro; senão gera um UUID. */
export const gerarRequestId = (entrada: unknown): string =>
  typeof entrada === 'string' && ID_VALIDO.test(entrada) ? entrada : randomUUID();
