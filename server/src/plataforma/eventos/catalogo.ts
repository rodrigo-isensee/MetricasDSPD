import { z } from 'zod';

/**
 * Catálogo de eventos da outbox (docs/contratos/eventos.md): um schema Zod por tipo, validado na publicação.
 * Mudança incompatível de payload = tipo novo (`coleta.concluida.v2`); o consumidor antigo segue até a outbox esvaziar.
 * O payload nunca carrega pessoa: os schemas são `.strict()` e só têm identificadores técnicos.
 */
export const TIPO_COLETA_CONCLUIDA = 'coleta.concluida';
export const TIPO_EVENTO_WEBHOOK = 'bm.webhook.recebido';

const coletaConcluida = z
  .object({
    fonte: z.enum(['businessmap', 'acelerato']),
    coletaId: z.string().min(1),
    status: z.enum(['sucesso', 'parcial', 'falha']),
  })
  .strict();

const webhookRecebido = z
  .object({
    webhookSk: z.string().regex(/^\d+$/),
    payloadSha256: z.string().regex(/^[0-9a-f]{64}$/),
  })
  .strict();

export type CatalogoEventos = Readonly<Record<string, z.ZodType>>;

export const CATALOGO_EVENTOS = {
  [TIPO_COLETA_CONCLUIDA]: coletaConcluida,
  [TIPO_EVENTO_WEBHOOK]: webhookRecebido,
} as const satisfies CatalogoEventos;

/** Um exemplo válido por tipo (usado na documentação gerada e nos testes de contrato). */
export const EXEMPLOS_EVENTOS: Readonly<Record<keyof typeof CATALOGO_EVENTOS, unknown>> = {
  [TIPO_COLETA_CONCLUIDA]: { fonte: 'businessmap', coletaId: '42', status: 'sucesso' },
  [TIPO_EVENTO_WEBHOOK]: { webhookSk: '7', payloadSha256: 'a'.repeat(64) },
};

/**
 * Valida o payload contra o schema do tipo. Tipo fora do catálogo é recusado. A mensagem só traz os caminhos
 * dos campos com problema, nunca os valores (podem ser sensíveis).
 */
export function validarPayload(tipo: string, payload: unknown, catalogo: CatalogoEventos = CATALOGO_EVENTOS): unknown {
  const schema = catalogo[tipo];
  if (schema === undefined) throw new Error(`Evento ${tipo} sem schema no catálogo`);
  const r = schema.safeParse(payload);
  if (!r.success) {
    const campos = r.error.issues.map((i) => (i.path.length > 0 ? i.path.join('.') : '(raiz)')).join(', ');
    throw new Error(`Payload inválido para ${tipo}: ${campos}`);
  }
  return r.data;
}
