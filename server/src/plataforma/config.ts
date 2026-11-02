import { z } from 'zod';
import { urlDoPapel } from './db/pool.js';

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

/**
 * Endereço único de IPv4 privado (10/8, 172.16/12, 192.168/16) da máquina do dono na rede local (ADR 0020, R4-5). Recusa `0.0.0.0`, `::`, faixa
 * (CIDR), lista, nome de host e endereço público.
 */
const octeto = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
const IPV4_PRIVADO = new RegExp(`^(?:10\\.${octeto}\\.${octeto}\\.${octeto}|172\\.(?:1[6-9]|2\\d|3[01])\\.${octeto}\\.${octeto}|192\\.168\\.${octeto}\\.${octeto})$`);
/** Endereços em que o servidor pode escutar com o nome real ligado (R4-5): só a própria máquina. */
const HOSTS_LOOPBACK = ['127.0.0.1', '::1'] as const;

const esquemaApi = z.object({
  ...comum,
  PG_API_URL: urlPg,
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  // Fonte dos dados: 'mock' (padrão atual, base semeada) liga as extensões mockadas; 'real' as desliga.
  DADOS_FONTE: z.enum(['mock', 'real']).default('mock'),
  HOST: z.string().min(1).default('0.0.0.0'),
  // F6 do plano 052: prefixo dos schemas da base do SEED. Definido liga o modo de duas bases (DSPD_SCHEMA_PREFIXO = base real).
  DSPD_SCHEMA_PREFIXO_SEED: vazioIndefinido(z.string().regex(/^[a-z][a-z0-9_]{0,30}$/).optional()),
  // Webhook do BusinessMap (S-12): as duas variáveis juntas ligam a rota; nenhuma, a rota não existe.
  PG_WEBHOOK_URL: vazioIndefinido(urlPg.optional()),
  WEBHOOK_BM_SEGREDO: vazioIndefinido(z.string().min(16, 'segredo curto').optional()),
  // Aba Apontamento (pedido 059, ADR 0020 revisão 4, R4-5). A rota só existe com a URL do papel `dspd_api_apontamento`. `APONTAMENTO_NOMES`
  // NÃO usa `vazioIndefinido`: valor vazio ou diferente de 0 e 1 recusa a partida (CA-AP-4); ausente = desligado.
  PG_APONTAMENTO_URL: vazioIndefinido(urlPg.optional()),
  APONTAMENTO_NOMES: z.enum(['0', '1']).default('0'),
  APONTAMENTO_REDE_LOCAL: vazioIndefinido(z.string().regex(IPV4_PRIVADO, 'um IPv4 privado específico').optional()),
  APONTAMENTO_PUBLICACAO_LOOPBACK: vazioIndefinido(z.literal('1').optional()),
}).superRefine((v, ctx) => {
  // Guarda de partida (R4-5): com o nome real ligado, a API só escuta onde só o dono (ou a rede local declarada) a alcança.
  const escutaSegura = (HOSTS_LOOPBACK as readonly string[]).includes(v.HOST) || v.HOST === v.APONTAMENTO_REDE_LOCAL
    || (v.HOST === '0.0.0.0' && v.APONTAMENTO_PUBLICACAO_LOOPBACK === '1');
  if (v.APONTAMENTO_NOMES === '1' && !escutaSegura) {
    ctx.addIssue({ code: 'custom', path: ['HOST'], message: 'APONTAMENTO_NOMES=1 exige HOST em 127.0.0.1, ::1 ou APONTAMENTO_REDE_LOCAL (ou 0.0.0.0 com APONTAMENTO_PUBLICACAO_LOOPBACK=1)' });
  }
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

/**
 * Comando manual da coleta (F3): a configuração do BusinessMap mais as URLs dos papéis `dspd_coletor` (cards, controle) e `dspd_ref`
 * (só a carga da referência). Sem `PG_REF_URL`, a do `dspd_ref` sai da do coletor trocando o papel e a senha (`DSPD_PWD_REF`).
 */
const esquemaColetaBusinessMap = esquemaBusinessMap
  .extend({
    PG_COLETOR_URL: urlPg, PG_REF_URL: vazioIndefinido(urlPg.optional()), DSPD_PWD_REF: vazioIndefinido(z.string().min(1).optional()),
    // Pedido 059 (ADR 0020 revisão 4, R4-6): sal do HMAC da lista de supressão; a coleta do worklog exige 32 caracteres ou mais (sem ele, não roda).
    PESSOA_ELIMINADA_SAL: vazioIndefinido(z.string().min(32).optional()),
  })
  .superRefine((v, ctx) => {
    if (v.PG_REF_URL === undefined && v.DSPD_PWD_REF === undefined) ctx.addIssue({ code: 'custom', path: ['PG_REF_URL'], message: 'defina PG_REF_URL ou DSPD_PWD_REF' });
  })
  .transform((v) => ({ ...v, PG_REF_URL: v.PG_REF_URL ?? urlDoPapel(v.PG_COLETOR_URL, 'dspd_ref', v.DSPD_PWD_REF!) }));

/** Projetor do BusinessMap (F4): só o banco do coletor. Não lê a chave nem a URL do BusinessMap: reprojetar nunca chama a API. */
const esquemaProjetorBusinessMap = z.object({ ...comum, PG_COLETOR_URL: urlPg });

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
export type ConfigProjetorBusinessMap = z.output<typeof esquemaProjetorBusinessMap>;
export type ConfigColetaBusinessMap = z.output<typeof esquemaColetaBusinessMap>;
export const carregarConfigApi = (env: NodeJS.ProcessEnv = process.env): ConfigApi => validar(esquemaApi, env);
export const carregarConfigWorker = (env: NodeJS.ProcessEnv = process.env): ConfigWorker => validar(esquemaWorker, env);
export const carregarConfigRef = (env: NodeJS.ProcessEnv = process.env): ConfigRef => validar(esquemaRef, env);
export const carregarConfigMigrar = (env: NodeJS.ProcessEnv = process.env): ConfigMigrar => validar(esquemaMigrar, env);
export const carregarConfigColetaBusinessMap = (env: NodeJS.ProcessEnv = process.env): ConfigColetaBusinessMap => validar(esquemaColetaBusinessMap, env);
export const carregarConfigBusinessMap = (env: NodeJS.ProcessEnv = process.env): ConfigBusinessMap => validar(esquemaBusinessMap, env);
export const carregarConfigProjetorBusinessMap = (env: NodeJS.ProcessEnv = process.env): ConfigProjetorBusinessMap => validar(esquemaProjetorBusinessMap, env);
