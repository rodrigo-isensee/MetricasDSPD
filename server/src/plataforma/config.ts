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
/** Papel de referência (`dspd_ref`): só INSERT de vigência e UPDATE de `vigente_ate` nas tabelas `ref_`. */
const esquemaRef = z.object({ ...comum, PG_REF_URL: urlPg });

/** https sempre, sem credencial, consulta nem fragmento (a chave vai no cabeçalho e não pode trafegar em claro). */
const urlHttps = z.string().refine((v) => {
  const u = URL.canParse(v) ? new URL(v) : undefined;
  return u !== undefined && u.protocol === 'https:' && u.username === '' && u.password === '' && u.search === '' && u.hash === '';
}, 'URL https inválida');
/**
 * Coletor do BusinessMap (F0 do plano 052). Só a coleta lê estas variáveis; a `api` nunca as recebe. A apikey é a do
 * dono (Q-5 = B): só no `.env` da máquina dele, nunca em log. O limite por minuto não passa de 25 (folga sob os 30 da API).
 */
const esquemaBusinessMap = z.object({
  ...comum,
  BUSINESSMAP_URL_BASE: urlHttps,
  BUSINESSMAP_APIKEY: z.string().min(1),
  BUSINESSMAP_QUADROS_IDS: vazioIndefinido(z.string().regex(/^\d+(,\d+)*$/).optional()).transform((v) => [...new Set(v?.split(',').map(Number) ?? [])]),
  BUSINESSMAP_LIMITE_POR_MINUTO: vazioIndefinido(z.coerce.number().int().min(1).max(25).default(25)),
  BUSINESSMAP_TIMEOUT_MS: vazioIndefinido(z.coerce.number().int().min(1000).max(120_000).default(30_000)),
  BUSINESSMAP_PAGINA_TAMANHO: vazioIndefinido(z.coerce.number().int().min(1).max(200).default(100)),
});

function validar<T extends z.ZodType>(esquema: T, env: NodeJS.ProcessEnv): z.output<T> {
  const r = esquema.safeParse(env);
  if (r.success) return r.data;
  const nomes = [...new Set(r.error.issues.map((i) => String(i.path[0] ?? '?')))];
  throw new Error(`Configuração inválida (variáveis: ${nomes.join(', ')})`);
}

export type ConfigApi = z.output<typeof esquemaApi>;
export type ConfigWorker = z.output<typeof esquemaWorker>;
export type ConfigMigrar = z.output<typeof esquemaMigrar>;
export type ConfigRef = z.output<typeof esquemaRef>;
export type ConfigBusinessMap = z.output<typeof esquemaBusinessMap>;
export const carregarConfigApi = (env: NodeJS.ProcessEnv = process.env): ConfigApi => validar(esquemaApi, env);
export const carregarConfigWorker = (env: NodeJS.ProcessEnv = process.env): ConfigWorker => validar(esquemaWorker, env);
export const carregarConfigRef = (env: NodeJS.ProcessEnv = process.env): ConfigRef => validar(esquemaRef, env);
export const carregarConfigMigrar = (env: NodeJS.ProcessEnv = process.env): ConfigMigrar => validar(esquemaMigrar, env);
export const carregarConfigBusinessMap = (env: NodeJS.ProcessEnv = process.env): ConfigBusinessMap => validar(esquemaBusinessMap, env);
