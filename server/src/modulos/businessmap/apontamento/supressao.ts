import { createHmac } from 'node:crypto';
import type { Esquemas } from '../../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../../plataforma/db/pool.js';

// Pedido 059 (K-193), A3: lista de supressão da eliminação a pedido (ADR 0020, revisão 4, R4-6; ADR 0025 item 8). O projetor confere o
// `user_id` de cada apontamento contra `cfg_pessoa_eliminada` ANTES de chamar `/users` e de criar `dim_responsavel` ou `pessoa_ref`.
// A tabela guarda só o HMAC-SHA256 do `user_id` com o sal `PESSOA_ELIMINADA_SAL` (do `.env`); o id nunca é gravado em claro.

/** Mínimo de bytes do sal (R4-6): sal ausente ou curto impede a coleta, que não pode recoletar sem a supressão. */
export const SAL_MINIMO_BYTES = 32;

/** HMAC-SHA256 do `user_id` com o sal, em hexadecimal. */
export const hmacUsuario = (sal: string, userId: string): string => createHmac('sha256', sal).update(userId).digest('hex');

/** Dos `userIds`, os que estão na lista de supressão (consulta só pelo HMAC; o `user_id` não vai ao banco). */
export async function usuariosSuprimidos(db: Consultavel, S: Esquemas, sal: string, userIds: readonly string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  const porHash = new Map(userIds.map((id) => [hmacUsuario(sal, id), id]));
  const r = await db.query<{ hash: string }>(
    `SELECT encode(hash_usuario, 'hex') AS hash FROM ${S.bm}.cfg_pessoa_eliminada
     WHERE hash_usuario = ANY(SELECT decode(h, 'hex') FROM unnest($1::text[]) AS h)`, [[...porHash.keys()]]);
  return new Set(r.rows.map((l) => porHash.get(l.hash)!));
}
