import { z } from 'zod';

/**
 * Configuração por variáveis de ambiente, validada na inicialização (falha rápida). Cada entrada lê só o que usa:
 * a `api` nunca recebe a credencial do coletor (ADR 0014). A mensagem de erro cita só os NOMES das variáveis,
 * nunca valores (URLs trazem senha).
 */
const urlPg = z.string().regex(/^postgres(ql)?:\/\/\S+$/, 'URL postgres inválida');
/** Variável presente mas vazia (Compose sem o valor) = não definida. */
const vazioIndefinido = <T extends z.ZodType>(esquema: T) => z.preprocess((v) => (v === '' ? undefined : v), esquema);
const comum = {
  DSPD_SCHEMA_PREFIXO: z.string().default(''),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
};

export const FONTES = ['businessmap', 'acelerato'] as const;
export type Fonte = (typeof FONTES)[number];

const esquemaApi = z.object({
  ...comum,
  PG_API_URL: urlPg,
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  // Fonte dos dados: 'mock' (padrão atual, base semeada) liga as extensões mockadas; 'real' as desliga.
  DADOS_FONTE: z.enum(['mock', 'real']).default('mock'),
  HOST: z.string().min(1).default('0.0.0.0'),
  // Webhook do BusinessMap (S-12): as duas variáveis juntas ligam a rota; nenhuma, a rota não existe.
  PG_WEBHOOK_URL: vazioIndefinido(urlPg.optional()),
  WEBHOOK_BM_SEGREDO: vazioIndefinido(z.string().min(16, 'segredo curto').optional()),
}).superRefine((v, ctx) => {
  if ((v.PG_WEBHOOK_URL === undefined) !== (v.WEBHOOK_BM_SEGREDO === undefined)) {
    ctx.addIssue({ code: 'custom', path: [v.PG_WEBHOOK_URL === undefined ? 'PG_WEBHOOK_URL' : 'WEBHOOK_BM_SEGREDO'], message: 'defina as duas do webhook ou nenhuma' });
  }
});
const esquemaWorker = z.object({
  ...comum,
  PG_COLETOR_URL: urlPg,
  WORKER_FONTES: z
    .string()
    .default(FONTES.join(','))
    .transform((s) => s.split(',').map((x) => x.trim()).filter((x) => x !== ''))
    .pipe(z.array(z.enum(FONTES)).min(1)),
  WORKER_INTERVALO_MS: z.coerce.number().int().min(1000).default(15_000),
});
const esquemaMigrar = z.object({ ...comum, PG_MIGRADOR_URL: urlPg });

function validar<T extends z.ZodType>(esquema: T, env: NodeJS.ProcessEnv): z.output<T> {
  const r = esquema.safeParse(env);
  if (r.success) return r.data;
  const nomes = [...new Set(r.error.issues.map((i) => String(i.path[0] ?? '?')))];
  throw new Error(`Configuração inválida (variáveis: ${nomes.join(', ')})`);
}

export type ConfigApi = z.output<typeof esquemaApi>;
export type ConfigWorker = z.output<typeof esquemaWorker>;
export type ConfigMigrar = z.output<typeof esquemaMigrar>;
export const carregarConfigApi = (env: NodeJS.ProcessEnv = process.env): ConfigApi => validar(esquemaApi, env);
export const carregarConfigWorker = (env: NodeJS.ProcessEnv = process.env): ConfigWorker => validar(esquemaWorker, env);
export const carregarConfigMigrar = (env: NodeJS.ProcessEnv = process.env): ConfigMigrar => validar(esquemaMigrar, env);
