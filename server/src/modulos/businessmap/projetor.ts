import type { QueryResultRow } from 'pg';
import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type Consultavel, type PoolLike } from '../../plataforma/db/pool.js';
import { comTravaDaFonte } from '../../plataforma/db/trava.js';
import { ErroColetaBm } from './coleta.js';
import { gravarResponsaveis, COLUNAS_VERSAO } from './responsaveis.js';
import {
  agrupar, instanteDoBm, projetarCard, type CardProjetado, type EntradaCard, type LinhaColuna, type LinhaTime, type LinhaTimeWorkflow,
  type LinhaTipo, type LinhaWorkflow, type Referencia, type TransicaoStg,
} from './normalizador.js';

// F4 do plano 052 (K-182): projetor do BusinessMap, do staging (append-only) para `evt_card`, `fato_transicao` (fonte `revision`),
// `dim_card` e `dim_card_versao` (SCD2, ADR 0016, U-1 e U-2). Roda DEPOIS da coleta, por comando manual (H-20), sob a trava da fonte.
// Idempotente: fato e versão só entram se ainda não existem (ON CONFLICT DO NOTHING, versão só se algum atributo mudou), `dim_card` é
// projeção refeita por card. Nunca escreve nome: `dim_responsavel` é do coletor (F3) e nem consta das tabelas que a reconstrução limpa
// (DT-1). Não tem cliente HTTP: reprojetar nunca chama o BusinessMap (nem `/users`).

export const VERSAO_PROJETOR = 'bm-f4/1';
export const TAMANHO_LOTE = 500;
/** DT-1: a reconstrução limpa SÓ estas tabelas. As outras (evt, fato, versão) são append-only e se completam por idempotência; `dim_responsavel` nunca. */
export const TABELAS_LIMPAS_NA_RECONSTRUCAO = ['dim_card'] as const;

export type ResponsaveisDoCard = ReadonlyMap<string, readonly string[] | null>;

export interface DepsProjecao {
  /** Papel `dspd_coletor`. */
  pool: PoolLike;
  S?: Esquemas;
  agora: () => Date;
  /** Responsáveis lidos em memória pela coleta da MESMA execução (I-2, ADR 0020 4b); sem isso, o valor já gravado não muda. */
  responsaveis?: ResponsaveisDoCard;
  /** Limpa `TABELAS_LIMPAS_NA_RECONSTRUCAO` antes de projetar tudo de novo a partir da staging. */
  reconstruir?: boolean;
}

export interface ResultadoProjecao {
  coletaId: number;
  cards: number;
  /** Cards sem data de criação utilizável: ficam só no staging. */
  semCriacao: number;
  versoes: number;
  eventos: { lidos: number; inseridos: number };
  transicoes: { lidas: number; inseridas: number; semInstante: number };
  /** Por motivo, a quantidade de cards (nunca id de card nem valor). */
  notas: Record<string, number>;
  responsaveisGravados: number;
}

type Valor = string | number | boolean | Date | readonly string[] | null;

const linhas = <T extends QueryResultRow>(db: Consultavel, texto: string, valores: unknown[] = []): Promise<T[]> => db.query<T>(texto, valores).then((r) => r.rows);

/** Referência inteira (todas as vigências) em memória: as tabelas são pequenas (ADR 0016). */
export async function carregarReferencia(db: Consultavel, S: Esquemas): Promise<Referencia> {
  // uma conexão só, dentro da transação: as leituras são em série
  const colunas = await linhas<LinhaColuna>(db, `SELECT quadro_id, coluna_id, workflow_id, section, eh_descarte, papel, tipo_coluna, ordem, motivo, vigente_de, vigente_ate FROM ${S.bm}.ref_coluna`);
  const workflows = await linhas<LinhaWorkflow>(db, `SELECT quadro_id, workflow_id, nivel, vigente_de, vigente_ate FROM ${S.bm}.ref_workflow`);
  const timesDoWorkflow = await linhas<LinhaTimeWorkflow>(db, `SELECT workflow_id, time_id, situacao, motivo, vigente_de, vigente_ate FROM ${S.bm}.ref_time_workflow`);
  const times = await linhas<LinhaTime>(db, `SELECT time_id, nome, motivo, vigente_de, vigente_ate FROM ${S.bm}.ref_time`);
  const tipos = await linhas<LinhaTipo>(db, `SELECT tipo_id, eh_item, categoria, vigente_de, vigente_ate FROM ${S.bm}.ref_tipo_card`);
  return {
    colunas: agrupar(colunas, (c) => `${c.quadro_id}|${c.coluna_id}`),
    workflows: agrupar(workflows, (w) => `${w.quadro_id}|${w.workflow_id}`),
    timesDoWorkflow: agrupar(timesDoWorkflow, (t) => t.workflow_id),
    times: agrupar(times, (t) => String(t.time_id)),
    tipos: agrupar(tipos, (t) => t.tipo_id),
  };
}

type LinhaStaging = { stg_sk: string; id_origem: string; payload: Record<string, unknown>; excluido_detectado: boolean; coletado_em: Date };
type VersaoAtual = Record<string, unknown> & { card_id: string; vigente_de: Date; responsaveis: string[] | null };

/** Insere em lote (`INSERT ... VALUES`, parâmetros sempre posicionais). Devolve as linhas realmente inseridas. */
async function inserir(
  db: Consultavel, tabela: string, colunas: readonly string[], registros: readonly (readonly Valor[])[], sufixo: string,
): Promise<number> {
  let total = 0;
  for (let i = 0; i < registros.length; i += TAMANHO_LOTE) {
    const valores: Valor[] = [];
    const grupos = registros.slice(i, i + TAMANHO_LOTE).map((l) => `(${l.map((v, k) => { valores.push(v); return colunas[k] === 'responsaveis' ? `$${valores.length}::text[]` : `$${valores.length}`; }).join(', ')})`);
    const r = await db.query(`INSERT INTO ${tabela} (${colunas.join(', ')}) VALUES ${grupos.join(', ')} ${sufixo}`, valores);
    total += r.rowCount ?? 0;
  }
  return total;
}

/** Transições do card como o staging as guarda: uma linha por (coluna, entrada); a mais nova vence (a fechada vem depois da aberta). */
function transicoesDoStaging(linhasRev: readonly { payload: Record<string, unknown> }[], contagem: { semInstante: number }): TransicaoStg[] {
  const porChave = new Map<string, TransicaoStg>();
  for (const r of linhasRev) {
    const p = r.payload;
    const inicio = instanteDoBm(p.start);
    const coluna = typeof p.column_id === 'number' || typeof p.column_id === 'string' ? String(p.column_id) : null;
    if (inicio === null || coluna === null) { contagem.semInstante += 1; continue; }
    const texto = (v: unknown): string | null => (typeof v === 'number' || typeof v === 'string' ? String(v) : null);
    porChave.set(`${coluna}|${inicio}`, { coluna, inicio, quadro: texto(p.board_id), workflow: texto(p.workflow_id) });
  }
  return [...porChave.values()];
}

const IGUAIS = (a: unknown, b: unknown): boolean => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

async function projetarLote(
  db: Consultavel, S: Esquemas, ids: readonly string[], ref: Referencia, d: DepsProjecao, coletaId: number, inicio: Date,
  acc: ResultadoProjecao,
): Promise<void> {
  const stg = await linhas<LinhaStaging>(db,
    `SELECT DISTINCT ON (id_origem) stg_sk, id_origem, payload, excluido_detectado, coletado_em FROM ${S.bm}.stg_card
      WHERE id_origem = ANY($1::text[]) ORDER BY id_origem, stg_sk DESC`, [ids]);
  const revisoes = await linhas<{ card_id: string; payload: Record<string, unknown> }>(db,
    `SELECT card_id, payload FROM ${S.bm}.stg_revision WHERE card_id = ANY($1::text[]) AND payload ->> 'start' IS NOT NULL ORDER BY revision_sk`, [ids]);
  const revDe = new Map<string, { payload: Record<string, unknown> }[]>();
  for (const r of revisoes) revDe.set(r.card_id, [...(revDe.get(r.card_id) ?? []), r]);

  const paisPedidos = new Set<string>();
  for (const l of stg) for (const v of Array.isArray(l.payload.linked_cards) ? (l.payload.linked_cards as { card_id?: unknown; link_type?: unknown }[]) : []) {
    if (v?.link_type === 'parent' && (typeof v.card_id === 'number' || typeof v.card_id === 'string')) paisPedidos.add(String(v.card_id));
  }
  const tiposDosPais = new Map<string, string>();
  if (paisPedidos.size > 0) {
    for (const p of await linhas<{ id_origem: string; tipo: string | null }>(db,
      `SELECT DISTINCT ON (id_origem) id_origem, payload ->> 'type_id' AS tipo FROM ${S.bm}.stg_card WHERE id_origem = ANY($1::text[]) ORDER BY id_origem, stg_sk DESC`, [[...paisPedidos]])) {
      if (p.tipo !== null) tiposDosPais.set(p.id_origem, p.tipo);
    }
  }

  const projetados: { stg: LinhaStaging; p: CardProjetado }[] = [];
  for (const l of stg) {
    acc.cards += 1;
    const entrada: EntradaCard = {
      id: l.id_origem, card: l.payload, coletadoEm: new Date(l.coletado_em), excluidoDetectado: l.excluido_detectado,
      transicoes: transicoesDoStaging(revDe.get(l.id_origem) ?? [], acc.transicoes), tipoDoPai: (id) => tiposDosPais.get(id),
    };
    const p = projetarCard(entrada, ref);
    if (p === null) { acc.semCriacao += 1; continue; }
    for (const n of new Set(p.notas)) acc.notas[n] = (acc.notas[n] ?? 0) + 1;
    projetados.push({ stg: l, p });
  }
  const ok = projetados.map((x) => x.p.dim.card_id);

  // fatos append-only: só entra o que ainda não existe
  const ev = projetados.flatMap((x) => x.p.eventos);
  acc.eventos.lidos += ev.length;
  acc.eventos.inseridos += await inserir(db, `${S.bm}.evt_card`, ['card_id', 'tipo', 'ocorrido_em', 'coletado_em', 'coleta_id'],
    ev.map((e) => [e.card_id, e.tipo, e.ocorrido_em, inicio, coletaId]), 'ON CONFLICT ON CONSTRAINT uq_evt_card DO NOTHING');
  const tr = projetados.flatMap((x) => x.p.transicoes);
  acc.transicoes.lidas += tr.length;
  acc.transicoes.inseridas += await inserir(db, `${S.bm}.fato_transicao`,
    ['card_id', 'quadro_id', 'coluna_origem_id', 'coluna_destino_id', 'tipo_coluna', 'direcao', 'fonte', 'id_origem', 'ocorrido_em', 'coletado_em', 'coleta_id'],
    tr.map((t) => [t.card_id, t.quadro_id, t.coluna_origem_id, t.coluna_destino_id, t.tipo_coluna, t.direcao, 'revision', t.id_origem, t.ocorrido_em, inicio, coletaId]),
    'ON CONFLICT ON CONSTRAINT uq_fato_transicao DO NOTHING');
  if (ok.length === 0) return;

  // versão vigente de cada card (SCD2): só entra versão nova se algum atributo mudou
  const atuais = new Map((await linhas<VersaoAtual>(db,
    `SELECT DISTINCT ON (card_id) card_id, vigente_de, responsaveis, ${COLUNAS_VERSAO.join(', ')} FROM ${S.bm}.dim_card_versao
      WHERE card_id = ANY($1::text[]) ORDER BY card_id, vigente_de DESC`, [ok])).map((v) => [v.card_id, v]));
  const existentes = new Map((await linhas<{ card_id: string; responsaveis: string[] }>(db,
    `SELECT card_id, responsaveis FROM ${S.bm}.dim_card WHERE card_id = ANY($1::text[])`, [ok])).map((v) => [v.card_id, v.responsaveis]));
  const doColetor = d.responsaveis;
  const respDe = (id: string): string[] => {
    const novo = doColetor?.get(id);
    return novo !== undefined && novo !== null ? [...novo] : (existentes.get(id) ?? atuais.get(id)?.responsaveis ?? []);
  };

  const novasVersoes: (readonly Valor[])[] = [];
  for (const { stg: l, p } of projetados) {
    const atual = atuais.get(l.id_origem);
    const dim = p.dim as unknown as Record<string, unknown>;
    if (atual !== undefined && COLUNAS_VERSAO.every((c) => IGUAIS(atual[c], dim[c]))) continue;
    // vigente_de é o instante da coleta que viu a versão; nunca anterior nem igual à versão que ela substitui (a chave é card e vigente_de)
    const minimo = atual === undefined ? 0 : new Date(atual.vigente_de).getTime() + 1;
    const vigenteDe = new Date(Math.max(new Date(l.coletado_em).getTime(), minimo));
    novasVersoes.push([l.id_origem, vigenteDe, l.stg_sk, ...COLUNAS_VERSAO.map((c) => (dim[c] ?? null) as Valor), respDe(l.id_origem), inicio, coletaId]);
  }
  acc.versoes += await inserir(db, `${S.bm}.dim_card_versao`, ['card_id', 'vigente_de', 'stg_card_sk', ...COLUNAS_VERSAO, 'responsaveis', 'coletado_em', 'coleta_id'],
    novasVersoes, 'ON CONFLICT ON CONSTRAINT uq_dim_card_versao DO NOTHING');

  // dim_card: projeção, refeita por card (a história fica no staging e em dim_card_versao); `responsaveis` nunca vem do staging
  await db.query(`DELETE FROM ${S.bm}.dim_card WHERE card_id = ANY($1::text[])`, [ok]);
  const COLUNAS_DIM = ['card_id', 'tipo', 'card_pai', 'criado_em', 'comprometido_em', 'iniciado_em', 'concluido_em', 'arquivado_em', 'motivo_descarte', 'titulo',
    'granularidade', 'equipe', 'quadro_id', 'coluna_atual_id', 'excluido_em'] as const;
  await inserir(db, `${S.bm}.dim_card`, [...COLUNAS_DIM, 'responsaveis', 'coletado_em', 'atualizado_por_coleta_id'],
    projetados.map(({ p }) => [...COLUNAS_DIM.map((c) => (p.dim as unknown as Record<string, Valor>)[c] ?? null), respDe(p.dim.card_id), inicio, coletaId]), '');

  // I-2: na mesma execução, o conjunto lido pela coleta (muda de dono sem mudar o staging); `null` não sobrescreve nada
  for (const { stg: l } of projetados) {
    const r = doColetor?.get(l.id_origem);
    if (r === undefined || r === null) continue;
    const g = await gravarResponsaveis(db, { cardId: l.id_origem, responsaveis: [...r], stgCardSk: l.stg_sk, vigenteDe: inicio, coletaId, agora: inicio }, S);
    if (g.versao || g.dimCard) acc.responsaveisGravados += 1;
  }
}

/**
 * Projeta toda a staging do BusinessMap, numa transação, e registra a execução em `ctl_coleta` (tarefa `projecao`) com as contagens em
 * `ctl_coleta_contagem` (só números). Roda de novo sem efeito colateral: o que já está gravado não é duplicado nem alterado.
 */
export async function projetarBusinessMap(d: DepsProjecao): Promise<ResultadoProjecao> {
  const S = d.S ?? esquemasDoAmbiente();
  return emTransacao(d.pool, async (db) => {
    const inicio = d.agora();
    const ctl = await db.query<{ coleta_id: string }>(
      `INSERT INTO ${S.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor) VALUES ('projecao', $1, 'em_andamento', $2) RETURNING coleta_id`, [inicio, VERSAO_PROJETOR]);
    const coletaId = Number(ctl.rows[0]!.coleta_id);
    const acc: ResultadoProjecao = {
      coletaId, cards: 0, semCriacao: 0, versoes: 0, eventos: { lidos: 0, inseridos: 0 }, transicoes: { lidas: 0, inseridas: 0, semInstante: 0 }, notas: {},
      responsaveisGravados: 0,
    };
    if (d.reconstruir === true) for (const t of TABELAS_LIMPAS_NA_RECONSTRUCAO) await db.query(`DELETE FROM ${S.bm}.${t}`);
    const ref = await carregarReferencia(db, S);
    let depois = '';
    for (;;) {
      const ids = (await linhas<{ id_origem: string }>(db,
        `SELECT DISTINCT id_origem FROM ${S.bm}.stg_card WHERE id_origem > $1 ORDER BY id_origem LIMIT ${TAMANHO_LOTE}`, [depois])).map((l) => l.id_origem);
      if (ids.length === 0) break;
      await projetarLote(db, S, ids, ref, d, coletaId, inicio, acc);
      depois = ids[ids.length - 1]!;
    }
    const contagem = async (entidade: string, lidos: number, inseridos: number, falhas: number): Promise<void> => {
      await db.query(
        `INSERT INTO ${S.bm}.ctl_coleta_contagem (coleta_id, entidade, lidos, inseridos, ja_existentes, falhas) VALUES ($1, $2, $3, $4, $5, $6)`,
        [coletaId, entidade, lidos, inseridos, Math.max(0, lidos - inseridos - falhas), falhas]);
    };
    await contagem('projecao_card', acc.cards, acc.cards - acc.semCriacao, acc.semCriacao);
    await contagem('projecao_transicao', acc.transicoes.lidas + acc.transicoes.semInstante, acc.transicoes.inseridas, acc.transicoes.semInstante);
    await contagem('projecao_evento', acc.eventos.lidos, acc.eventos.inseridos, 0);
    await contagem('projecao_versao', acc.versoes, acc.versoes, 0);
    // motivo de card fora ou com ressalva (nunca id): `lidos` = quantidade de cards
    for (const [nota, n] of Object.entries(acc.notas)) await contagem(`nota_${nota}`.slice(0, 40), n, n, 0);
    await db.query(`UPDATE ${S.bm}.ctl_coleta SET status = 'sucesso', finalizado_em = $2 WHERE coleta_id = $1`, [coletaId, d.agora()]);
    return acc;
  });
}

const USO_PROJETOR = 'uso: bm:projetar [--reconstruir]';

/** Argumentos do comando `bm:projetar`; qualquer coisa fora do formato é recusada com a linha de uso (sem eco do valor recebido). */
export function analisarArgumentosProjetor(argv: readonly string[]): { reconstruir: boolean } {
  if (argv.length === 0) return { reconstruir: false };
  if (argv.length === 1 && argv[0] === '--reconstruir') return { reconstruir: true };
  throw new ErroColetaBm('uso', USO_PROJETOR);
}

/** Comando manual do projetor (sem agenda, H-20): sob a trava da fonte, depois do `bm:coleta`; recusa se a coleta estiver rodando. */
export async function executarProjetor(d: DepsProjecao): Promise<ResultadoProjecao> {
  const r = await comTravaDaFonte(d.pool, 'businessmap', () => projetarBusinessMap(d));
  if (!r.executou) throw new ErroColetaBm('trava', 'outra coleta ou projeção do BusinessMap em andamento');
  return r.valor;
}
