import { createHash } from 'node:crypto';
import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type Consultavel, type PoolLike } from '../../plataforma/db/pool.js';
import { ErroBusinessMap, type ClienteHttp } from '../../plataforma/http.js';
import { fecharColeta, type StatusFinal } from '../operacao/index.js';
import { exigirEsquemaSemSeedNoPool } from './coleta.js';
import { normalizarToque, type MotivoLeitura, type ResultadoToque } from './toque.js';
import { gravarLeitura, projetarToque } from './toque-gravacao.js';
import { codigoDoErro, ehDoCardOuDoLote, lerComentariosDoLote, lerToqueDoCard, lerTodasAsPaginas, MAX_CARDS_POR_LOTE } from './toque-leitura.js';

/**
 * Coleta do primeiro toque do O22 (pedido 105, B7b; ADR 0020 revisão 6, R6-4, R6-8 e R6-9): a carga do passado (`bm:carga-toque`, retomável, com janela), o portão
 * de carga (amostra sorteada) e o incremental (etapa do `bm:coleta incremental`, com teto de chamadas). Só GET pelo cliente de lista fechada; quem chama segura a
 * trava da fonte (carga e coleta diária nunca rodam juntas). Por card: `revision` fresco da listagem, comentários em lote, lista de revisões; os eventos e a linha
 * de controle de um card vão na MESMA transação. Falha de chamada deixa o card não lido (sem linha de controle) e vai a `ctl_coleta_falha` só com código e
 * `id_origem = card_id`. Nada de pessoa, texto ou valor lido chega ao banco, ao log ou ao resumo: o resumo só tem contagens e códigos.
 */

export const VERSAO_COLETOR_TOQUE = 'bm-toque/1';
/** Teto de chamadas por execução do incremental (R6-9), para caber nos 15 minutos da coleta diária. */
export const TETO_TOQUE_POR_EXECUCAO = 150;
export const JANELA_PADRAO_MIN = 60;
export const AMOSTRA_PADRAO = 50;
/** O conjunto do O22: stories de demanda criadas nas últimas 12 semanas. */
export const SEMANAS_DO_CONJUNTO = 12;
const SEMANA_MS = 7 * 86_400_000;
const ESTADOS_DA_FORMA = new Set<MotivoLeitura | null>(['lista_com_buraco', 'lista_curta', 'lista_longa', 'revisao_invalida']);

export type ModoToque =
  | { tipo: 'carga'; janelaMin?: number | undefined }
  | { tipo: 'portao'; amostra?: number | undefined }
  | { tipo: 'incremental'; teto?: number | undefined };

export interface DepsToque {
  cliente: Pick<ClienteHttp, 'get'>;
  /** Papel `dspd_coletor`. */
  pool: PoolLike;
  S?: Esquemas;
  /** Só para o hash que vai a `ctl_coleta`; nunca gravado em claro. */
  hostBase: string;
  agora: () => Date;
}

export interface ResumoToque {
  coletaId: number;
  modo: ModoToque['tipo'];
  estado: StatusFinal;
  /** Por que a execução parou de ler: acabou a fila, a janela, o teto de chamadas ou um erro fatal (autenticação, limite de requisições). */
  parada: 'fim' | 'janela' | 'teto' | 'fatal';
  /** Cards na fila no início; `pendentes` = os que ficaram para a próxima execução (nem lidos nem com falha). */
  candidatos: number;
  pendentes: number;
  chamadas: number;
  /** Cards com linha de controle gravada nesta execução. */
  lidos: number;
  /** Cards lidos com `revision >= 2` e, entre eles, os que a lista confere com `revision - 1` (R6-8). */
  revisaoMaiorQueUm: number;
  listaConfere: number;
  /** `leitura_incompleta` por motivo (código), `autor_pendente`, revisões sem autor e comentários externos (contagens). */
  leituraIncompleta: Record<string, number>;
  autorPendente: number;
  revisoesSemAutor: number;
  comentariosExternos: number;
  eventosNovos: number;
  /** Cards sem leitura por falha de chamada, e as falhas por código (inclui o status HTTP: `toque_revisoes_http_404`). */
  falhas: number;
  errosPorCodigo: Record<string, number>;
  /** Respostas de comentário fora da forma, por caminho do campo (nunca valor). */
  formaPorCaminho: Record<string, number>;
  arquivadosNaFila: number;
  arquivadosLidos: number;
  errosEmArquivados: number;
  portao: { passou: boolean; motivos: string[] } | null;
}

interface Candidato { cardId: string; criadoEm: number; arquivado: boolean }
type LinhaCandidato = { card_id: string; criado_em: Date; arquivado: boolean };

const sha256 = (t: string): string => createHash('sha256').update(t).digest('hex');
const inteiroPositivo = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v > 0;
const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Arquivado ou descartado, como `dim_card` os guarda. */
const ARQUIVADO = '(c.arquivado_em IS NOT NULL OR c.excluido_em IS NOT NULL OR c.motivo_descarte IS NOT NULL)';
/** Conjunto do O22: `ehDemandaCard` (story que não é "Bug interno") criada na janela de 12 semanas, em qualquer estado. */
const CONJUNTO = `c.granularidade = 'story' AND c.tipo IS DISTINCT FROM 'Bug interno' AND c.criado_em >= $1`;
/** Falhas anteriores por card (R-T8, A5 do parecer de segurança): quem falha em execuções seguidas vai para o fim da fila, sem parar a execução. */
const FALHAS = (S: Esquemas): string => `LEFT JOIN (SELECT id_origem, count(*) AS n FROM ${S.bm}.ctl_coleta_falha WHERE entidade = 'toque' GROUP BY id_origem) f ON f.id_origem = c.card_id`;
const VIGENTE = (S: Esquemas): string => `LEFT JOIN LATERAL (SELECT estado, revisao_lida, lido_em FROM ${S.bm}.ctl_toque_leitura WHERE card_id = c.card_id ORDER BY leitura_sk DESC LIMIT 1) l ON true`;

const comoCandidato = (l: LinhaCandidato): Candidato => ({ cardId: l.card_id, criadoEm: l.criado_em.getTime(), arquivado: l.arquivado });

/** Carga (R6-8): o conjunto sem linha vigente `lido` nem `autor_pendente` (relê os não lidos e os `leitura_incompleta`), do mais antigo ao mais novo. */
async function candidatosDaCarga(db: Consultavel, S: Esquemas, desde: Date): Promise<Candidato[]> {
  const r = await db.query<LinhaCandidato>(
    `SELECT c.card_id, c.criado_em, ${ARQUIVADO} AS arquivado
       FROM ${S.bm}.dim_card c ${VIGENTE(S)} ${FALHAS(S)}
      WHERE ${CONJUNTO} AND (l.estado IS NULL OR l.estado = 'leitura_incompleta')
      ORDER BY COALESCE(f.n, 0), c.criado_em, c.card_id`, [desde]);
  return r.rows.map(comoCandidato);
}

/**
 * Incremental (R6-9), por prioridade e, dentro dela, quem falhou menos e foi lido há mais tempo: (1) sem linha de controle; (2) `autor_pendente` ou `sem_toque` cujo `revision`
 * na versão mais recente de `stg_card` passou de `revisao_lida`; (3) `leitura_incompleta`; (4) cards abertos `sem_toque` ou `autor_pendente`, todo dia (um comentário novo
 * pode não mudar `revision`). Card `com_toque` nunca é relido.
 */
async function candidatosDoIncremental(db: Consultavel, S: Esquemas, desde: Date): Promise<Candidato[]> {
  const r = await db.query<LinhaCandidato>(
    `SELECT card_id, criado_em, arquivado FROM (
       SELECT c.card_id, c.criado_em, ${ARQUIVADO} AS arquivado, COALESCE(f.n, 0) AS falhas, l.lido_em,
              CASE WHEN l.estado IS NULL THEN 1
                   WHEN c.toque_situacao IN ('autor_pendente', 'sem_toque') AND r.revisao_atual > l.revisao_lida THEN 2
                   WHEN l.estado = 'leitura_incompleta' THEN 3
                   WHEN c.toque_situacao IN ('autor_pendente', 'sem_toque') AND c.concluido_em IS NULL AND NOT ${ARQUIVADO} THEN 4 END AS prioridade
         FROM ${S.bm}.dim_card c ${VIGENTE(S)} ${FALHAS(S)}
         LEFT JOIN LATERAL (SELECT CASE WHEN payload ->> 'revision' ~ '^[0-9]{1,9}$' THEN (payload ->> 'revision')::int END AS revisao_atual
                              FROM ${S.bm}.stg_card WHERE id_origem = c.card_id ORDER BY stg_sk DESC LIMIT 1) r ON true
        WHERE ${CONJUNTO}
     ) q WHERE prioridade IS NOT NULL
     ORDER BY prioridade, falhas, lido_em NULLS FIRST, criado_em, card_id`, [desde]);
  return r.rows.map(comoCandidato);
}

/** Portão de carga (R6-8): amostra sorteada do conjunto, metade arquivada ou descartada (a outra metade, o resto). */
async function candidatosDoPortao(db: Consultavel, S: Esquemas, desde: Date, amostra: number): Promise<Candidato[]> {
  const sorteio = async (arquivados: boolean, n: number): Promise<Candidato[]> => (await db.query<LinhaCandidato>(
    `SELECT c.card_id, c.criado_em, ${ARQUIVADO} AS arquivado FROM ${S.bm}.dim_card c
      WHERE ${CONJUNTO} AND ${ARQUIVADO} = $2 ORDER BY random() LIMIT $3`, [desde, arquivados, n])).rows.map(comoCandidato);
  const metade = Math.floor(amostra / 2);
  return [...(await sorteio(true, metade)), ...(await sorteio(false, amostra - metade))];
}

/** `revision` fresco da listagem (`/cards` com `card_ids` e `fields` mínimos). Cards que a listagem ativa não devolve são pedidos como arquivados e como descartados. */
async function revisoesFrescas(cliente: Pick<ClienteHttp, 'get'>, ids: readonly string[]): Promise<Map<string, unknown>> {
  const achados = new Map<string, unknown>();
  let faltam = [...ids];
  for (const estado of [undefined, 'archived', 'discarded'] as const) {
    if (faltam.length === 0) break;
    const itens = await lerTodasAsPaginas(cliente, '/cards', { card_ids: faltam.join(','), fields: 'card_id,revision', per_page: '200', ...(estado === undefined ? {} : { state: estado }) });
    const pedidos = new Set(faltam);
    for (const item of itens) {
      const id = ehObjeto(item) && inteiroPositivo(item.card_id) ? String(item.card_id) : null;
      if (id !== null && pedidos.has(id)) achados.set(id, (item as Record<string, unknown>).revision);
    }
    faltam = faltam.filter((id) => !achados.has(id));
  }
  return achados;
}

async function registrarFalha(db: Consultavel, S: Esquemas, coletaId: number, idOrigem: string | null, erro: string): Promise<void> {
  await db.query(`INSERT INTO ${S.bm}.ctl_coleta_falha (coleta_id, entidade, id_origem, erro) VALUES ($1, 'toque', $2, $3)`, [coletaId, idOrigem, erro]);
}

async function registrarContagem(db: Consultavel, S: Esquemas, coletaId: number, entidade: string, c: { lidos: number; inseridos: number; falhas: number }): Promise<void> {
  await db.query(
    `INSERT INTO ${S.bm}.ctl_coleta_contagem (coleta_id, entidade, lidos, inseridos, ja_existentes, falhas) VALUES ($1, $2, $3, $4, 0, $5)`,
    [coletaId, entidade, c.lidos, c.inseridos, c.falhas]);
}

/** Execução anterior que morreu sem fechar (a trava da fonte garante que não há outra rodando): fecha como falha, sem apagar nada. */
async function fecharInterrompidas(pool: PoolLike, S: Esquemas, agora: Date): Promise<void> {
  const r = await pool.query<{ coleta_id: string }>(`SELECT coleta_id FROM ${S.bm}.ctl_coleta WHERE tarefa = 'carga_toque' AND status = 'em_andamento'`);
  for (const l of r.rows) {
    await emTransacao(pool, (db) => fecharColeta(db, { fonte: 'businessmap', coletaId: l.coleta_id, status: 'falha', erroResumo: 'desconhecido: execução anterior interrompida', agora }, S));
  }
}

interface Execucao {
  d: DepsToque; S: Esquemas; coletaId: number; inicio: Date; modo: ModoToque;
  cliente: Pick<ClienteHttp, 'get'>; chamadas: () => number; r: ResumoToque;
  /** Cards com falha de chamada nesta execução (o erro fatal da API não entra: o card dele segue pendente). */
  cardsComFalha: number;
}

/** Janela (carga) ou teto de chamadas (incremental) esgotados; o portão não tem limite (são poucos cards). */
function motivoDeParar(x: Execucao): 'janela' | 'teto' | null {
  if (x.modo.tipo === 'carga' && x.d.agora().getTime() - x.inicio.getTime() >= (x.modo.janelaMin ?? JANELA_PADRAO_MIN) * 60_000) return 'janela';
  if (x.modo.tipo === 'incremental' && x.chamadas() >= (x.modo.teto ?? TETO_TOQUE_POR_EXECUCAO)) return 'teto';
  return null;
}

async function falhar(x: Execucao, c: Candidato, codigo: string): Promise<void> {
  await registrarFalha(x.d.pool, x.S, x.coletaId, c.cardId, codigo);
  x.r.falhas += 1;
  x.cardsComFalha += 1;
  x.r.errosPorCodigo[codigo] = (x.r.errosPorCodigo[codigo] ?? 0) + 1;
  if (c.arquivado) x.r.errosEmArquivados += 1;
}

/** Soma o resultado de um card lido ao resumo (só contagens). */
function somar(x: Execucao, c: Candidato, res: ResultadoToque): void {
  const { r } = x;
  r.lidos += 1;
  if (c.arquivado) r.arquivadosLidos += 1;
  if (res.revisaoLida !== null && res.revisaoLida >= 2) {
    r.revisaoMaiorQueUm += 1;
    if (!ESTADOS_DA_FORMA.has(res.motivo)) r.listaConfere += 1;
  }
  if (res.estado === 'autor_pendente') r.autorPendente += 1;
  if (res.motivo !== null) r.leituraIncompleta[res.motivo] = (r.leituraIncompleta[res.motivo] ?? 0) + 1;
  r.revisoesSemAutor += res.revisoesSemAutor;
  r.comentariosExternos += res.comentariosExternos;
}

/** Lê e grava um card (comentários já lidos no lote, `revision` já fresco). Falha de chamada vira código; erro fatal sobe. */
async function lerUmCard(x: Execucao, c: Candidato, revisao: unknown, comentarios: Parameters<typeof lerToqueDoCard>[0]['comentarios']): Promise<boolean> {
  let res: ResultadoToque;
  try {
    res = inteiroPositivo(revisao)
      ? await lerToqueDoCard({
        cliente: x.cliente, cardId: c.cardId, revisao, criadoEm: c.criadoEm, comentarios,
        relerRevisao: async () => { const v = (await revisoesFrescas(x.cliente, [c.cardId])).get(c.cardId); return inteiroPositivo(v) ? v : null; },
      })
      // `revision` que não é inteiro positivo: leitura incompleta com motivo, sem gastar a chamada de revisões
      : normalizarToque({ cardId: c.cardId, revisao, criadoEm: c.criadoEm, itensRevisao: [], comentarios: [] });
  } catch (e) {
    if (!ehDoCardOuDoLote(e)) throw e;
    await falhar(x, c, codigoDoErro('toque_revisoes', e));
    return false;
  }
  const agora = x.d.agora();
  const novos = await emTransacao(x.d.pool, (db) => gravarLeitura(db, x.S, x.coletaId, agora, res));
  x.r.eventosNovos += novos;
  somar(x, c, res);
  return true;
}

/** Um lote de até 200 cards. Devolve `false` se a janela ou o teto pararam a execução no meio dele. A projeção do que foi lido sai sempre, mesmo com erro fatal. */
async function lerLote(x: Execucao, lote: readonly Candidato[]): Promise<boolean> {
  const ids = lote.map((c) => c.cardId);
  let revisoes: Map<string, unknown>;
  try {
    revisoes = await revisoesFrescas(x.cliente, ids);
  } catch (e) {
    if (!ehDoCardOuDoLote(e)) throw e;
    for (const c of lote) await falhar(x, c, codigoDoErro('toque_listagem', e));
    return true;
  }
  const comentarios = await lerComentariosDoLote(x.cliente, ids);
  for (const o of comentarios.ocorrencias) {
    await registrarFalha(x.d.pool, x.S, x.coletaId, null, `${o.codigo} ${o.caminho}`);
    x.r.formaPorCaminho[o.caminho] = (x.r.formaPorCaminho[o.caminho] ?? 0) + o.quantidade;
  }
  const lidos: string[] = [];
  try {
    for (const c of lote) {
      const motivo = motivoDeParar(x);
      if (motivo !== null) {
        x.r.parada = motivo;
        return false;
      }
      const dosComentarios = comentarios.porCard.get(c.cardId)!;
      if (!dosComentarios.ok) await falhar(x, c, dosComentarios.codigo);
      else if (!revisoes.has(c.cardId)) await falhar(x, c, 'toque_listagem_ausente');
      else if (await lerUmCard(x, c, revisoes.get(c.cardId), dosComentarios.comentarios)) lidos.push(c.cardId);
    }
    return true;
  } finally {
    if (lidos.length > 0) await emTransacao(x.d.pool, (db) => projetarToque(db, x.S, lidos));
  }
}

/** Portão de carga (R6-8): passa só com a lista conferindo em todos os cards com `revision >= 2`, zero erro nos arquivados, metade da amostra arquivada e todos lidos. */
function veredito(r: ResumoToque, amostra: number): { passou: boolean; motivos: string[] } {
  const motivos: string[] = [];
  if (r.pendentes > 0 || r.falhas > 0) motivos.push('amostra_nao_lida_por_inteiro');
  if (r.listaConfere !== r.revisaoMaiorQueUm) motivos.push('lista_diferente_de_revision_menos_1');
  if (r.errosEmArquivados > 0) motivos.push('erro_em_arquivado');
  if (r.arquivadosNaFila < Math.floor(amostra / 2)) motivos.push('amostra_sem_metade_arquivada');
  return { passou: motivos.length === 0, motivos };
}

const resumoVazio = (coletaId: number, modo: ModoToque['tipo']): ResumoToque => ({
  coletaId, modo, estado: 'sucesso', parada: 'fim', candidatos: 0, pendentes: 0, chamadas: 0, lidos: 0, revisaoMaiorQueUm: 0, listaConfere: 0, leituraIncompleta: {}, autorPendente: 0,
  revisoesSemAutor: 0, comentariosExternos: 0, eventosNovos: 0, falhas: 0, errosPorCodigo: {}, formaPorCaminho: {}, arquivadosNaFila: 0, arquivadosLidos: 0, errosEmArquivados: 0, portao: null,
});

/**
 * Executa a coleta do toque (carga, portão ou incremental). Estado final: `sucesso` sem falha de card, `parcial` com falha e algum card lido, `falha` com falha e nenhum lido.
 * Erro fatal da API (autenticação, limite de requisições) para a execução limpo, com o que já foi lido gravado. A coleta fica registrada em `ctl_coleta` (tarefa `carga_toque`).
 */
export async function coletarToque(d: DepsToque, modo: ModoToque): Promise<ResumoToque> {
  const S = d.S ?? esquemasDoAmbiente();
  await exigirEsquemaSemSeedNoPool(d.pool, S);
  const inicio = d.agora();
  await fecharInterrompidas(d.pool, S, inicio);
  const parametros = { tipo: modo.tipo, host_sha256: sha256(d.hostBase), janela_min: modo.tipo === 'carga' ? (modo.janelaMin ?? JANELA_PADRAO_MIN) : null,
    teto: modo.tipo === 'incremental' ? (modo.teto ?? TETO_TOQUE_POR_EXECUCAO) : null, amostra: modo.tipo === 'portao' ? (modo.amostra ?? AMOSTRA_PADRAO) : null };
  const aberta = await d.pool.query<{ coleta_id: string }>(
    `INSERT INTO ${S.bm}.ctl_coleta (tarefa, iniciado_em, status, versao_coletor, parametros) VALUES ('carga_toque', $1, 'em_andamento', $2, $3::jsonb) RETURNING coleta_id`,
    [inicio, VERSAO_COLETOR_TOQUE, JSON.stringify(parametros)]);
  const coletaId = Number(aberta.rows[0]!.coleta_id);
  let chamadas = 0;
  const get = ((caminho: string, opcoes?: Parameters<ClienteHttp['get']>[1]) => { chamadas += 1; return d.cliente.get(caminho, opcoes); }) as ClienteHttp['get'];
  const cliente: Pick<ClienteHttp, 'get'> = { get };
  const x: Execucao = { d, S, coletaId, inicio, modo, cliente, chamadas: () => chamadas, r: resumoVazio(coletaId, modo.tipo), cardsComFalha: 0 };
  try {
    const desde = new Date(inicio.getTime() - SEMANAS_DO_CONJUNTO * SEMANA_MS);
    const amostra = modo.tipo === 'portao' ? (modo.amostra ?? AMOSTRA_PADRAO) : 0;
    const fila = modo.tipo === 'carga' ? await candidatosDaCarga(d.pool, S, desde)
      : modo.tipo === 'incremental' ? await candidatosDoIncremental(d.pool, S, desde) : await candidatosDoPortao(d.pool, S, desde, amostra);
    x.r.candidatos = fila.length;
    x.r.arquivadosNaFila = fila.filter((c) => c.arquivado).length;
    try {
      for (let i = 0; i < fila.length;) {
        // incremental: o lote não passa do que resta do teto (a listagem e os comentários também contam como chamada)
        const tamanho = modo.tipo === 'incremental' ? Math.min(MAX_CARDS_POR_LOTE, Math.max(1, (modo.teto ?? TETO_TOQUE_POR_EXECUCAO) - chamadas)) : MAX_CARDS_POR_LOTE;
        const parar = motivoDeParar(x);
        if (parar !== null) {
          x.r.parada = parar;
          break;
        }
        if (!(await lerLote(x, fila.slice(i, i + tamanho)))) break;
        i += tamanho;
      }
    } catch (e) {
      if (!(e instanceof ErroBusinessMap)) throw e;
      x.r.parada = 'fatal';
      x.r.falhas += 1;
      x.r.errosPorCodigo[e.tipo] = (x.r.errosPorCodigo[e.tipo] ?? 0) + 1;
      await registrarFalha(d.pool, S, coletaId, null, e.tipo);
    }
    const { r } = x;
    r.chamadas = chamadas;
    r.pendentes = r.candidatos - r.lidos - x.cardsComFalha;
    r.estado = r.falhas === 0 ? 'sucesso' : r.lidos > 0 ? 'parcial' : 'falha';
    if (modo.tipo === 'portao') r.portao = veredito(r, amostra);
    await registrarContagem(d.pool, S, coletaId, 'toque_card', { lidos: r.lidos + r.falhas, inseridos: r.lidos, falhas: r.falhas });
    await registrarContagem(d.pool, S, coletaId, 'toque_evento', { lidos: r.eventosNovos, inseridos: r.eventosNovos, falhas: 0 });
    await emTransacao(d.pool, (db) => fecharColeta(db, {
      fonte: 'businessmap', coletaId, status: r.estado, agora: d.agora(),
      erroResumo: r.estado === 'sucesso' ? null : `${r.falhas} falha(s) do toque (${Object.keys(r.errosPorCodigo).join(', ')})`.slice(0, 500),
    }, S));
    return r;
  } catch (e) {
    // erro de banco ou de programação: fecha como falha (sem a mensagem, que pode trazer valor) e repassa
    await emTransacao(d.pool, (db) => fecharColeta(db, { fonte: 'businessmap', coletaId, status: 'falha', erroResumo: 'desconhecido: erro-interno', agora: d.agora() }, S)).catch(() => undefined);
    throw e;
  }
}
