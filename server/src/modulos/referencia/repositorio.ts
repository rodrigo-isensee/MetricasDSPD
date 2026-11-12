import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { CORTE_CARDS, CORTE_CHAMADOS } from './cortes.js';

export type OpcaoLinha = { id: string; nome: string };

/** Equipes de time (não coordenação/gerência) com vigência aberta, sem quadros de teste. */
export async function lerEquipesBM(db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<string[]> {
  const r = await db.query<{ equipe: string }>(
    `SELECT DISTINCT equipe FROM ${S.bm}.ref_quadro
     WHERE vigente_ate IS NULL AND nivel = 'time' AND eh_teste = false ORDER BY equipe`);
  return r.rows.map((x) => x.equipe);
}

/** Times ativos da tabela de times (vigência aberta): o filtro de equipe do painel operacional real. Nenhuma agregação por time. */
export async function lerTimesAtivos(db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<string[]> {
  const r = await db.query<{ nome: string }>(
    `SELECT DISTINCT nome FROM ${S.bm}.ref_time WHERE vigente_ate IS NULL AND ativo = true ORDER BY nome`);
  return r.rows.map((x) => x.nome);
}


/** Sistemas vigentes do domínio `sistema` da referência do BusinessMap (código -> rótulo). */
export async function lerSistemasBM(db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<OpcaoLinha[]> {
  const r = await db.query<{ codigo: string; rotulo: string }>(
    `SELECT codigo, rotulo FROM ${S.bm}.ref_dominio
     WHERE campo = 'sistema' AND vigente_ate IS NULL ORDER BY ordem, codigo`);
  return r.rows.map((x) => ({ id: x.codigo, nome: x.rotulo }));
}

/** Categorias de tipo presentes nas stories (L6 do 097, E4): o filtro de tipo só vale para story. Mesmo corte de `lerCards`. Nenhuma pessoa, nenhuma contagem. */
export async function lerTiposBM(db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<string[]> {
  const r = await db.query<{ tipo: string | null }>(
    `SELECT DISTINCT tipo FROM ${S.bm}.dim_card WHERE ${CORTE_CARDS} AND granularidade = 'story'`);
  return r.rows.map((x) => x.tipo).filter((t): t is string => typeof t === 'string');
}

/** Equipes presentes nos chamados do Acelerato (L7a do 097, E4): `DISTINCT equipe` no mesmo corte de `lerChamados`. Nenhuma pessoa, nenhuma contagem. */
export async function lerEquipesAC(db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<string[]> {
  const r = await db.query<{ equipe: string | null }>(
    `SELECT DISTINCT equipe FROM ${S.ac}.dim_chamado WHERE ${CORTE_CHAMADOS} ORDER BY equipe COLLATE "C"`);
  // K-288: ordem de bytes (UTF-8) também no código, para que dois nomes de mesmo slug resolvam sempre para o mesmo (o primeiro), sem depender da collation do banco.
  return r.rows.map((x) => x.equipe).filter((t): t is string => typeof t === 'string')
    .sort((a, b) => Buffer.compare(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8')));
}

/** Prioridades presentes nos chamados do Acelerato (L6 do 097, E4). Mesmo corte de `lerChamados` (recorte, equipe e abertura). */
export async function lerPrioridadesAC(db: Consultavel, S: Esquemas = esquemasDoAmbiente()): Promise<string[]> {
  const r = await db.query<{ prioridade: string | null }>(
    `SELECT DISTINCT prioridade FROM ${S.ac}.dim_chamado WHERE ${CORTE_CHAMADOS} AND prioridade IS NOT NULL`);
  return r.rows.map((x) => x.prioridade).filter((t): t is string => typeof t === 'string');
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

/**
 * Id da versão de critério mais recente já vigente em `ate` (AAAA-MM-DD), de qualquer fonte; `null` se não há. Só conta
 * versão que afeta alguma métrica, o mesmo critério de `lerVersoes`: a versão de partida da tabela de times (migração
 * 0017) não leva métrica e não vira `versaoCriterio`.
 */
export async function lerVersaoCriterioVigente(db: Consultavel, ate: string, S: Esquemas = esquemasDoAmbiente()): Promise<string | null> {
  const r = await db.query<{ versao_id: string }>(
    `SELECT versao_id FROM ${S.core}.ref_versao_criterio
     WHERE vigente_desde <= $1 AND versao_id IN (SELECT versao_id FROM ${S.core}.ref_versao_criterio_metrica)
     ORDER BY vigente_desde DESC, versao_id DESC LIMIT 1`, [ate]);
  return r.rows[0] === undefined ? null : String(r.rows[0].versao_id);
}

export type CalendarioDaReferencia = { feriados: string[]; offsetMinutos: number };

/**
 * Calendário vigente de um domínio e classe na referência (`ref_calendario_aplicacao` com `vigente_ate` nulo): feriados e deslocamento.
 * `null` = sem carga na referência (quem chama decide o padrão). Ponto único de leitura da aba Apontamento e das métricas (pedido 069, L7-b;
 * ADR 0027): o domínio é sempre parâmetro, então BusinessMap e Acelerato nunca leem o calendário um do outro.
 */
export async function lerCalendarioVigente(
  db: Consultavel, S: Esquemas | undefined, dominio: 'businessmap' | 'acelerato', classe: string,
): Promise<CalendarioDaReferencia | null> {
  const E = S ?? esquemasDoAmbiente();
  const a = await db.query<{ calendario_id: string; offset_minutos: number }>(
    `SELECT a.calendario_id, c.offset_minutos FROM ${E.core}.ref_calendario_aplicacao a
     JOIN ${E.core}.ref_calendario c ON c.calendario_id = a.calendario_id
     WHERE a.dominio = $1 AND a.classe = $2 AND a.vigente_ate IS NULL`, [dominio, classe]);
  const cal = a.rows[0];
  if (cal === undefined) return null;
  const f = await db.query<{ data: string }>(`SELECT data FROM ${E.core}.ref_feriado WHERE calendario_id = $1::smallint ORDER BY data`, [cal.calendario_id]);
  return { feriados: f.rows.map((x) => x.data), offsetMinutos: cal.offset_minutos };
}
