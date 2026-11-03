import type { Consultavel } from './pool.js';

/**
 * Portas G2 (seed) e coleta do plano 060-sem-mock (P1): seed e coleta real nunca dividem o mesmo esquema. O seed é marcado pelo
 * prefixo da versão do coletor em `ctl_coleta` (`seed-mock` e `seed-mock-coleta`); o que não tem essa marca é coleta real.
 * Estes contadores só leem e devolvem números: quem recusa monta a mensagem só com nome de tabela e contagem (ADR 0020).
 */
export const PREFIXO_COLETA_SEED = 'seed-mock';

/**
 * Trava `dspd:seed` (A1 do review do P1): o seed a toma na transação inteira; a guarda da coleta e a do projetor a tomam antes de contar.
 * Com a mesma trava, uma guarda e um seed simultâneos no mesmo banco se serializam: quem entra depois enxerga o que o outro gravou.
 * Trava de transação (`pg_advisory_xact_lock`): vale até o fim da transação em que foi tomada.
 */
export const TRAVA_DO_SEED = 'dspd:seed';
export async function tomarTravaDoSeed(trx: Consultavel): Promise<void> {
  await trx.query('SELECT pg_advisory_xact_lock(hashtext($1))', [TRAVA_DO_SEED]);
}

const IDENT = /^[a-z][a-z0-9_]*$/;
const ident = (nome: string): string => {
  if (!IDENT.test(nome)) throw new Error('identificador inválido');
  return nome;
};
const contagem = (r: { rows: { n: string | number }[] }): number => Number(r.rows[0]?.n ?? 0);

/** Linhas de `ctl_coleta` do esquema marcadas como seed. */
export async function contarColetasDoSeed(db: Consultavel, schema: string): Promise<number> {
  return contagem(await db.query<{ n: string }>(
    `SELECT count(*) AS n FROM ${ident(schema)}.ctl_coleta WHERE starts_with(versao_coletor, $1)`, [PREFIXO_COLETA_SEED]));
}

/** Linhas de `ctl_coleta` do esquema que não são do seed (coleta real, projeção real, teste). */
export async function contarColetasReais(db: Consultavel, schema: string): Promise<number> {
  return contagem(await db.query<{ n: string }>(
    `SELECT count(*) AS n FROM ${ident(schema)}.ctl_coleta WHERE NOT coalesce(starts_with(versao_coletor, $1), false)`, [PREFIXO_COLETA_SEED]));
}

/** Itens (`dim_card` ou `dim_chamado`) cuja última coleta gravadora não é a do seed. */
export async function contarItensReais(db: Consultavel, schema: string, tabela: 'dim_card' | 'dim_chamado'): Promise<number> {
  const s = ident(schema);
  return contagem(await db.query<{ n: string }>(
    `SELECT count(*) AS n FROM ${s}.${tabela} t WHERE NOT EXISTS (
       SELECT 1 FROM ${s}.ctl_coleta c WHERE c.coleta_id = t.atualizado_por_coleta_id AND starts_with(c.versao_coletor, $1))`,
    [PREFIXO_COLETA_SEED]));
}

/**
 * Eventos de webhook do BusinessMap (`stg_webhook_evento`) contam como dado real (ADR 0026, A3): esquema com entrega de webhook não recebe seed.
 * Só o esquema do BusinessMap tem a tabela. Lido pelo papel migrador do seed; não muda GRANT.
 */
export async function contarEventosDeWebhook(db: Consultavel, schema: string): Promise<number> {
  return contagem(await db.query<{ n: string }>(`SELECT count(*) AS n FROM ${ident(schema)}.stg_webhook_evento`));
}

/** Mensagem só de nome de tabela e contagem. */
export const descreverColetasDoSeed = (schema: string, n: number): string =>
  `${schema}.ctl_coleta: ${n} linha(s) de coleta do seed; rode o db:limpar-seed antes da coleta real`;
