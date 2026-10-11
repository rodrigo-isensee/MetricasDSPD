import { randomBytes } from 'node:crypto';
import pg from 'pg';
import { inject } from 'vitest';
import { montarEsquemas } from '../../src/plataforma/db/esquemas.js';
import { criarPool, urlDoPapel } from '../../src/plataforma/db/pool.js';

/** Contexto dos testes de banco: o `globalSetup` injeta o prefixo desta execução e a URL do migrador. */
export const url: string | undefined = inject('dspdUrl');
export const prefixo: string = inject('dspdPrefixo') ?? '';
export const S = montarEsquemas(prefixo);

const SENHAS: Record<string, string | undefined> = {
  dspd_api: process.env.DSPD_PWD_API ?? 'api_dev', dspd_coletor: process.env.DSPD_PWD_COLETOR ?? 'coletor_dev',
  dspd_ref: process.env.DSPD_PWD_REF ?? 'ref_dev', dspd_webhook: process.env.DSPD_PWD_WEBHOOK ?? 'webhook_dev',
  dspd_automacao: process.env.DSPD_PWD_AUTOMACAO ?? 'automacao_dev',
};

/** Pool do migrador (dono dos objetos) ou de um papel de aplicação. */
export const poolDe = (papel?: string): pg.Pool =>
  criarPool(papel ? urlDoPapel(url!, papel, SENHAS[papel]!) : url!, { max: 8 });

/** Sufixo único: cada teste cria os próprios dados e não supõe tabela vazia. */
export const unico = (p = 't'): string => `${p}${randomBytes(5).toString('hex')}`;

export const hash = (s: string): Buffer => Buffer.from(s.padEnd(32, '0').slice(0, 32));

/**
 * Abre uma coleta em andamento no schema e devolve o id. A tarefa é `reconciliacao` para não aparecer no estado
 * de coleta (`coleta_incremental`), que outro arquivo de teste verifica.
 */
export async function novaColeta(db: pg.Pool, schema: string): Promise<number> {
  const r = await db.query<{ coleta_id: string }>(
    `INSERT INTO ${schema}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor)
     VALUES ('reconciliacao', now(), 'em_andamento', 'teste') RETURNING coleta_id`);
  return Number(r.rows[0]!.coleta_id);
}
