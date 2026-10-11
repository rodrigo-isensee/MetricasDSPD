import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';

export type OpcaoLinha = { id: string; nome: string };

/** Equipes de time (não coordenação/gerência) com vigência aberta, sem quadros de teste. */
export async function lerEquipesBM(db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<string[]> {
  const r = await db.query<{ equipe: string }>(
    `SELECT DISTINCT equipe FROM ${S.bm}.ref_quadro
     WHERE vigente_ate IS NULL AND nivel = 'time' AND eh_teste = false ORDER BY equipe`);
  return r.rows.map((x) => x.equipe);
}

/** Sistemas vigentes do domínio `sistema` da referência do BusinessMap (código -> rótulo). */
export async function lerSistemasBM(db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<OpcaoLinha[]> {
  const r = await db.query<{ codigo: string; rotulo: string }>(
    `SELECT codigo, rotulo FROM ${S.bm}.ref_dominio
     WHERE campo = 'sistema' AND vigente_ate IS NULL ORDER BY ordem, codigo`);
  return r.rows.map((x) => ({ id: x.codigo, nome: x.rotulo }));
}

/** Primeira data civil (America/Sao_Paulo) com dado na base de cada fonte; `null` se a base está vazia. */
export async function lerInicioBM(db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<string | null> {
  const r = await db.query<{ inicio: string | null }>(
    `SELECT to_char(min(criado_em) AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') AS inicio FROM ${S.bm}.dim_card`);
  return r.rows[0]?.inicio ?? null;
}
export async function lerInicioAC(db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<string | null> {
  const r = await db.query<{ inicio: string | null }>(
    `SELECT to_char(min(aberto_em) AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') AS inicio FROM ${S.ac}.dim_chamado`);
  return r.rows[0]?.inicio ?? null;
}

/** Id da versão de critério mais recente já vigente em `ate` (AAAA-MM-DD), de qualquer fonte; `null` se não há. */
export async function lerVersaoCriterioVigente(db: Consultavel, ate: string, S: Esquemas = esquemasDoAmbiente()): Promise<string | null> {
  const r = await db.query<{ versao_id: string }>(
    `SELECT versao_id FROM ${S.core}.ref_versao_criterio
     WHERE vigente_desde <= $1 ORDER BY vigente_desde DESC, versao_id DESC LIMIT 1`, [ate]);
  return r.rows[0] === undefined ? null : String(r.rows[0].versao_id);
}
