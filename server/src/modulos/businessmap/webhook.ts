import { createHash, timingSafeEqual } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AppError, erroSchema } from '../../plataforma/erros.js';
import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type PoolLike } from '../../plataforma/db/pool.js';
import { registroWebhook, tipoParaLog } from './allow-list.js';
import { TIPO_EVENTO_WEBHOOK, validarPayload } from '../../plataforma/eventos/index.js';

/** Corpo máximo do webhook: 256 KB (acima disso, 413). */
export const LIMITE_WEBHOOK_BYTES = 256 * 1024;
export const CABECALHO_SEGREDO = 'x-webhook-secret';
export { TIPO_EVENTO_WEBHOOK };

export type DepsWebhook = {
  /** Pool do papel `dspd_webhook` (INSERT em `stg_webhook_evento` e `outbox`; nada mais). */
  pool: PoolLike;
  segredo: string;
  agora: () => Date;
  S?: Esquemas;
};

const aceitoSchema = z.object({ status: z.literal('recebido') }).strict();

const sha = (v: string | Buffer): Buffer => createHash('sha256').update(v).digest();
/** Comparação em tempo constante (os dois lados passam por SHA-256, então têm o mesmo tamanho). */
export const segredoConfere = (recebido: unknown, esperado: string): boolean =>
  timingSafeEqual(sha(typeof recebido === 'string' ? recebido : ''), sha(esperado));

export type ResultadoWebhook = 'gravado' | 'duplicado' | 'ignorado';

/**
 * Grava o REGISTRO DA ALLOW-LIST da entrega (ADR 0020, 4f; o corpo bruto nunca é gravado) e o evento `bm.webhook.recebido` na MESMA
 * transação. O `payload_sha256` é o do corpo bruto. Tipo de evento fora da lista: `ignorado`, nada é gravado. Entrega idêntica (mesmo SHA-256 do corpo)
 * não duplica nada: `ON CONFLICT ON CONSTRAINT uq_stg_webhook_evento DO NOTHING` e nenhum evento novo.
 * Devolve `gravado` se a entrega era nova.
 */
export async function receberWebhook(pool: PoolLike, corpo: Buffer, payload: unknown, agora: Date, S: Esquemas = esquemasDoAmbiente()): Promise<ResultadoWebhook> {
  const registro = registroWebhook(payload);
  if (registro === null) return 'ignorado';
  const hash = sha(corpo);
  // Mesmo contrato do publicarEvento (este INSERT é direto porque o papel não tem RETURNING): valida antes de gravar.
  const eventoPayload = (webhookSk: string) => validarPayload(TIPO_EVENTO_WEBHOOK, { webhookSk, payloadSha256: hash.toString('hex') });
  return emTransacao(pool, async (cx) => {
    const r = await cx.query<{ webhook_sk: string }>(
      `INSERT INTO ${S.bm}.stg_webhook_evento (payload_sha256, payload, recebido_em) VALUES ($1, $2::jsonb, $3)
       ON CONFLICT ON CONSTRAINT uq_stg_webhook_evento DO NOTHING RETURNING webhook_sk`,
      [hash, JSON.stringify(registro), agora]);
    const nova = r.rows[0];
    if (nova === undefined) return 'duplicado';
    // Sem RETURNING: o papel `dspd_webhook` só tem INSERT em `outbox`.
    await cx.query(
      `INSERT INTO ${S.core}.outbox (fonte, tipo, payload) VALUES ('businessmap', $1, $2::jsonb)`,
      [TIPO_EVENTO_WEBHOOK, JSON.stringify(eventoPayload(String(nova.webhook_sk)))]);
    return 'gravado';
  });
}

/** `POST /webhooks/businessmap`: segredo no cabeçalho, corpo JSON (objeto) até 256 KB, 202 sem processar nada na requisição. */
export async function rotasWebhook(app: FastifyInstance, deps: DepsWebhook): Promise<void> {
  await app.register(async (i) => {
    i.addContentTypeParser('application/json', { parseAs: 'buffer', bodyLimit: LIMITE_WEBHOOK_BYTES }, (_req, corpo, pronto) => { pronto(null, corpo); });
    // Autenticação antes de ler o corpo: quem não tem o segredo não consome memória nem banco.
    i.addHook('onRequest', (req, _resposta, pronto) => {
      pronto(segredoConfere(req.headers[CABECALHO_SEGREDO], deps.segredo) ? undefined : new AppError('UNAUTHENTICATED', 'Segredo inválido ou ausente.', 401));
    });
    i.post('/webhooks/businessmap', {
      bodyLimit: LIMITE_WEBHOOK_BYTES,
      schema: { tags: ['webhooks'], summary: 'Recebe a entrega de um webhook do BusinessMap (202; sem processar na requisição)',
        response: { 202: aceitoSchema, 400: erroSchema, 401: erroSchema, 413: erroSchema, 500: erroSchema } },
    }, async (req, resposta) => {
      const corpo = req.body as Buffer;
      let payload: unknown;
      try {
        payload = JSON.parse(corpo.toString('utf8'));
      } catch {
        throw new AppError('PAYLOAD_INVALIDO', 'O corpo deve ser um objeto JSON.', 400);
      }
      // `\u0000` no texto o jsonb do Postgres rejeita; objeto é o único formato do BusinessMap.
      if (payload === null || typeof payload !== 'object' || Array.isArray(payload) || corpo.includes('\\u0000')) {
        throw new AppError('PAYLOAD_INVALIDO', 'O corpo deve ser um objeto JSON.', 400);
      }
      const resultado = await receberWebhook(deps.pool, corpo, payload, deps.agora(), deps.S);
      if (resultado === 'ignorado') req.log.info({ tipo: tipoParaLog(payload) }, 'webhook de tipo fora da lista: não gravado');
      return resposta.code(202).send({ status: 'recebido' as const });
    });
  });
}
