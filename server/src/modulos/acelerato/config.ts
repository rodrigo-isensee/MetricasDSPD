import { z } from 'zod';
import { ErroConfiguracao } from '../../plataforma/categoria-erro.js';
import { carregarConfigWorker, type ConfigWorker } from '../../plataforma/config.js';
import { ErroColeta } from './erros.js';
import { normalizarImpressao } from './tls.js';

/**
 * Configuração da leitura do MySQL (ADR 0023, itens 1 e 3), validada na partida. Host, porta, banco, usuário e senha
 * em variáveis SEPARADAS (nunca URL de conexão com senha). Sem valor padrão, exceto o teto de consulta e a margem do
 * incremental, que a ADR fixa. A mensagem de erro cita só os NOMES das variáveis, nunca o valor recebido (M2).
 */
export const VARIAVEIS_ACELERATO = [
  'ACELERATO_MYSQL_HOST', 'ACELERATO_MYSQL_PORT', 'ACELERATO_MYSQL_DATABASE', 'ACELERATO_MYSQL_USER',
  'ACELERATO_MYSQL_PASSWORD', 'ACELERATO_MYSQL_TLS_SHA256', 'ACELERATO_MYSQL_TLS_CERT_FILE',
  'ACELERATO_MYSQL_MAX_EXEC_MS', 'ACELERATO_MYSQL_MARGEM_HORAS',
] as const;

const impressao = z.string().transform((v, ctx) => {
  const n = normalizarImpressao(v);
  if (n === null) ctx.addIssue({ code: 'custom', message: 'impressão inválida' });
  return n ?? '';
});

const esquema = z.object({
  ACELERATO_MYSQL_HOST: z.string().regex(/^[A-Za-z0-9._-]{1,253}$/),
  ACELERATO_MYSQL_PORT: z.coerce.number().int().min(1).max(65535),
  ACELERATO_MYSQL_DATABASE: z.string().regex(/^[A-Za-z0-9_]{1,64}$/),
  ACELERATO_MYSQL_USER: z.string().min(1).max(64),
  ACELERATO_MYSQL_PASSWORD: z.string().min(1).max(256),
  ACELERATO_MYSQL_TLS_SHA256: impressao,
  ACELERATO_MYSQL_TLS_CERT_FILE: z.string().min(1).max(1024),
  ACELERATO_MYSQL_MAX_EXEC_MS: z.coerce.number().int().min(1000).max(600_000).default(120_000),
  ACELERATO_MYSQL_MARGEM_HORAS: z.coerce.number().int().min(1).max(168).default(24),
});

export type ConfigAcelerato = {
  host: string;
  porta: number;
  banco: string;
  usuario: string;
  senha: string;
  tlsSha256: string;
  tlsCertFile: string;
  maxExecMs: number;
  margemHoras: number;
};

/** `NODE_TLS_REJECT_UNAUTHORIZED=0` desligaria a verificação do certificado (M3): a partida é recusada. */
export function carregarConfigAcelerato(env: NodeJS.ProcessEnv = process.env): ConfigAcelerato {
  const tlsDesligado = env.NODE_TLS_REJECT_UNAUTHORIZED === '0';
  const bruto: Record<string, string | undefined> = {};
  for (const nome of VARIAVEIS_ACELERATO) bruto[nome] = env[nome] === '' ? undefined : env[nome];
  const r = esquema.safeParse(bruto);
  // A recusa do TLS não interrompe a validação: a lista de nomes sai completa (K-311).
  const nomes = [...(tlsDesligado ? ['NODE_TLS_REJECT_UNAUTHORIZED'] : []), ...(r.success ? [] : variaveisInvalidas(r.error))];
  if (!r.success || nomes.length > 0) throw new ErroColeta('configuracao-invalida', { coluna: nomes.join(',') });
  const v = r.data;
  return {
    host: v.ACELERATO_MYSQL_HOST, porta: v.ACELERATO_MYSQL_PORT, banco: v.ACELERATO_MYSQL_DATABASE, usuario: v.ACELERATO_MYSQL_USER,
    senha: v.ACELERATO_MYSQL_PASSWORD, tlsSha256: v.ACELERATO_MYSQL_TLS_SHA256, tlsCertFile: v.ACELERATO_MYSQL_TLS_CERT_FILE,
    maxExecMs: v.ACELERATO_MYSQL_MAX_EXEC_MS, margemHoras: v.ACELERATO_MYSQL_MARGEM_HORAS,
  };
}

/** Nomes (nunca valores) das variáveis que falharam. */
export const variaveisInvalidas = (e: z.ZodError): string[] => [...new Set(e.issues.map((i) => String(i.path[0])))];

/**
 * Configuração da coleta manual do Acelerato (K-304): a do worker (banco do coletor) e a do MySQL, validadas juntas. Se faltar ou for inválida
 * alguma, a falha lista os NOMES de todas de uma vez (nunca valor, nem parte dele), como `ErroConfiguracao`.
 */
export function carregarConfigColetaAcelerato(env: NodeJS.ProcessEnv = process.env): { worker: ConfigWorker; config: ConfigAcelerato } {
  const nomes: string[] = [];
  let worker: ConfigWorker | undefined;
  let config: ConfigAcelerato | undefined;
  try {
    worker = carregarConfigWorker(env);
  } catch (e) {
    if (!(e instanceof ErroConfiguracao)) throw e;
    nomes.push(...e.nomes);
  }
  try {
    config = carregarConfigAcelerato(env);
  } catch (e) {
    if (!(e instanceof ErroColeta) || e.codigo !== 'configuracao-invalida' || e.coluna === undefined) throw e;
    nomes.push(...e.coluna.split(','));
  }
  if (worker === undefined || config === undefined) {
    const unicos = [...new Set(nomes)];
    throw new ErroConfiguracao(`Configuração inválida (variáveis: ${unicos.join(', ')})`, unicos);
  }
  return { worker, config };
}
