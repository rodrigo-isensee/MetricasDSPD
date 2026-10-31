import { createHash } from 'node:crypto';
import { z } from 'zod';
import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import { emTransacao, type Consultavel, type PoolLike } from '../../plataforma/db/pool.js';
import { ErroBusinessMap, type ClienteHttp } from '../../plataforma/http.js';
import { fecharColeta, type StatusFinal } from '../operacao/index.js';
import { CAMPOS_CARD, extrairResponsaveis, revisionIdDaTransicao, transicoesDoCard, type DominiosCamposCustomizados } from './allow-list.js';
import { ErroReferencia } from './referencia.js';
import { desembrulhar } from './spike-forma.js';
import { gravarStgCard, gravarStgRevision } from './staging.js';
import { resolverResponsaveis, type ResultadoUsuarios } from './usuarios.js';

// F3 do plano 052 (K-182): coleta dos cards do BusinessMap para o staging, incremental e carga inicial de 12 meses. Só GET, pelo
// cliente da F0; staging só pelos `registro*` da allow-list (append-only, dedupe por hash); nome de responsável só em
// `dim_responsavel`. Sem registro na agenda (H-20 = C): quem chama é o comando manual. Quem chama também segura a trava da fonte.
// Nada aqui loga corpo de resposta, nome, id de pessoa nem chave; falha vai ao banco só com código e id do card.

export const VERSAO_COLETOR = 'bm-f3/1';
/** Sobreposição da coleta incremental (data-model §6): lê a partir da marca d'água menos isto; o dedupe do staging torna isso seguro. */
export const SOBREPOSICAO_S = 3600;
export const MESES_CARGA = 12;
export const ESTADOS = ['active', 'archived', 'discarded'] as const;
export type EstadoCard = (typeof ESTADOS)[number];

/**
 * `fields=` explícito (I-2): os campos escalares da allow-list do card mais os que a coleta usa só em memória (responsáveis e
 * `block_reason`/`child_card_stats`, reduzidos pela allow-list). `custom_fields` e `linked_cards` vêm por `expand`. Os fields 36
 * (ID Acelerato, H-16) e 42 (Responsável CR, pessoa) não têm entrada no mapa e nunca entram.
 */
export const CAMPOS_PEDIDO_CARDS = [...CAMPOS_CARD, 'owner_user_id', 'co_owner_ids', 'block_reason', 'child_card_stats'].join(',');
/** `transitions` (E2.46): histórico de colunas na própria listagem, sem GET por card; `block_times` fica fora (F3b, negado por padrão). */
export const EXPAND_COLETA = 'custom_fields,linked_cards,transitions';
export const CAMPOS_CUSTOMIZADOS_FORA = ['36', '42'] as const;

/** Mapa `field_id` -> domínio (ADR 0020, 4d). Vazio: ainda não há mapa (A6 da F2); campo sem entrada não é gravado. */
const MAPA_DOMINIOS: DominiosCamposCustomizados = new Map();
export function dominiosDaColeta(): DominiosCamposCustomizados {
  const m = new Map(MAPA_DOMINIOS);
  for (const f of CAMPOS_CUSTOMIZADOS_FORA) m.delete(f);
  return m;
}

export class ErroColetaBm extends Error {
  constructor(readonly codigo: 'uso' | 'sem-marca' | 'trava' | 'configuracao', mensagem: string) {
    super(mensagem);
    this.name = 'ErroColetaBm';
  }
}

export type ModoColeta = { tipo: 'carga_inicial'; inicio?: string | undefined } | { tipo: 'incremental' };

export interface DepsColeta {
  cliente: Pick<ClienteHttp, 'get'>;
  /** Papel `dspd_coletor`. */
  pool: PoolLike;
  S?: Esquemas;
  quadros: readonly number[];
  /** Só para o hash que vai a `ctl_coleta` (E1.2); nunca gravado em claro. */
  hostBase: string;
  agora: () => Date;
  paginaTamanho?: number;
  /** Etapa da referência da F2 (transação do papel de referência), rodada depois de abrir a coleta e antes dos cards. */
  etapaReferencia?: (coletaId: number) => Promise<unknown>;
}

export interface ContagemTransicoes { lidas: number; inseridas: number; jaExistentes: number; invalidas: number }
export interface ResumoStream { quadro: number; estado: EstadoCard; lidos: number; inseridos: number; jaExistentes: number; falhas: number; transicoes: ContagemTransicoes }
export interface ResultadoColeta {
  coletaId: number;
  modo: ModoColeta['tipo'];
  estado: StatusFinal;
  inicioCarga: string | null;
  retomada: boolean;
  streams: ResumoStream[];
  usuarios: ResultadoUsuarios | null;
  referencia: unknown;
  /** Chaves da referência que pedem motivo (`tabela:chave`, até 100), no formato do `--motivo-chave`; vazio se não houve pendência. */
  motivosPendentes: string[];
  /** Códigos das falhas (nunca mensagens), com a contagem. */
  falhas: Record<string, number>;
}

const ParametrosCarga = z.object({
  inicio_carga: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  iniciada_em: z.string().datetime(),
  paginas: z.record(z.string(), z.object({ ultima: z.number().int().min(0), total: z.number().int().min(0) })),
});
type Paginas = z.infer<typeof ParametrosCarga>['paginas'];

const sha256 = (t: string): string => createHash('sha256').update(t).digest('hex');
const iso = (d: Date): string => d.toISOString().replace(/\.\d{3}Z$/, 'Z');
const dataUtc = (d: Date): string => d.toISOString().slice(0, 10);

/** Hoje menos 12 meses (UTC), no formato do filtro de data da API. */
export function inicioDaCarga(agora: Date, meses = MESES_CARGA): string {
  const d = new Date(agora);
  d.setUTCMonth(d.getUTCMonth() - meses);
  return dataUtc(d);
}

/** Categoria de `erro_resumo` aceita pela API de coletas (só categoria, nunca mensagem). */
const CATEGORIA: Record<string, string> = {
  autenticacao: 'autenticacao', 'tempo-esgotado': 'tempo-esgotado', indisponivel: 'indisponivel', 'limite-requisicoes': 'indisponivel',
  formato: 'dados-invalidos', 'card-sem-id': 'dados-invalidos', 'limite-bytes': 'dados-invalidos',
};
/** Erros de leitura que não impedem a próxima leitura; os outros (autenticação, limites, configuração) param a execução. */
const NAO_FATAIS = new Set(['indisponivel', 'tempo-esgotado', 'http', 'formato']);

/** Código de falha, nunca mensagem: o que sai do erro vai ao banco e ao relatório. */
export function codigoDe(e: unknown): string {
  if (e instanceof ErroBusinessMap) return e.tipo;
  if (e instanceof ErroReferencia) return `referencia-${e.tipo}`;
  return 'erro-interno';
}

const idDeCard = (card: unknown): string | null => {
  const id = typeof card === 'object' && card !== null ? (card as Record<string, unknown>).card_id : undefined;
  return typeof id === 'number' && Number.isInteger(id) && id > 0 ? String(id) : null;
};

async function registrarFalha(db: Consultavel, S: Esquemas, coletaId: number, entidade: string, idOrigem: string | null, erro: string): Promise<void> {
  await db.query(`INSERT INTO ${S.bm}.ctl_coleta_falha (coleta_id, entidade, id_origem, erro) VALUES ($1, $2, $3, $4)`, [coletaId, entidade, idOrigem, erro]);
}

async function registrarContagem(db: Consultavel, S: Esquemas, coletaId: number, entidade: string, c: { lidos: number; inseridos: number; jaExistentes: number; falhas: number }): Promise<void> {
  await db.query(
    `INSERT INTO ${S.bm}.ctl_coleta_contagem (coleta_id, entidade, lidos, inseridos, ja_existentes, falhas) VALUES ($1, $2, $3, $4, $5, $6)`,
    [coletaId, entidade, c.lidos, c.inseridos, c.jaExistentes, c.falhas]);
}

/** Execução anterior que morreu sem fechar (a trava da fonte garante que não há outra rodando): fecha como falha, sem apagar nada. */
async function fecharInterrompidas(pool: PoolLike, S: Esquemas, agora: Date): Promise<void> {
  const r = await pool.query<{ coleta_id: string }>(
    `SELECT coleta_id FROM ${S.bm}.ctl_coleta WHERE tarefa = 'coleta_incremental' AND status = 'em_andamento' AND versao_coletor = $1`, [VERSAO_COLETOR]);
  for (const l of r.rows) {
    await emTransacao(pool, (db) => fecharColeta(db, { fonte: 'businessmap', coletaId: l.coleta_id, status: 'falha', erroResumo: 'desconhecido: execução anterior interrompida', agora }, S));
  }
}

/** Última carga inicial (qualquer estado) com os parâmetros que permitem retomar; parâmetros ilegíveis valem como "sem carga". */
async function ultimaCarga(db: Consultavel, S: Esquemas): Promise<{ status: string; parametros: z.infer<typeof ParametrosCarga> } | undefined> {
  const r = await db.query<{ status: string; parametros: unknown }>(
    `SELECT status, parametros FROM ${S.bm}.ctl_coleta
     WHERE tarefa = 'coleta_incremental' AND parametros ->> 'tipo' = 'carga_inicial' ORDER BY coleta_id DESC LIMIT 1`);
  const linha = r.rows[0];
  const p = ParametrosCarga.safeParse(linha?.parametros);
  return linha === undefined || !p.success ? undefined : { status: linha.status, parametros: p.data };
}

async function marcaDagua(db: Consultavel, S: Esquemas): Promise<Date | null> {
  const r = await db.query<{ marca: Date | null }>(
    `SELECT max(marca_dagua_ate) AS marca FROM ${S.bm}.ctl_coleta WHERE tarefa = 'coleta_incremental' AND status = 'sucesso'`);
  return r.rows[0]?.marca ?? null;
}

interface Execucao {
  d: DepsColeta; S: Esquemas; coletaId: number; filtro: (estado: EstadoCard) => Record<string, string>;
  dominios: DominiosCamposCustomizados; vistos: Set<string>; falhas: string[]; motivosPendentes: string[];
}

/** Uma leitura (quadro e estado): página por página, cada página numa transação com a marca da página (retomável). */
async function lerStream(x: Execucao, quadro: number, estado: EstadoCard, primeira: number, c: ResumoStream): Promise<void> {
  const entidade = `card_${quadro}_${estado}`;
  let total = primeira; // a primeira resposta diz o total de verdade
  for (let pagina = primeira; pagina <= total; pagina += 1) {
    const corpo = await x.d.cliente.get('/cards', {
      consulta: {
        board_ids: String(quadro), state: estado, fields: CAMPOS_PEDIDO_CARDS, expand: EXPAND_COLETA,
        per_page: x.d.paginaTamanho ?? 100, page: pagina, ...x.filtro(estado),
      },
    });
    const env = desembrulhar(corpo);
    total = env.paginas ?? 1;
    await emTransacao(x.d.pool, async (db) => {
      const agora = x.d.agora();
      for (const card of env.itens) {
        c.lidos += 1;
        const id = idDeCard(card);
        if (id === null) {
          c.falhas += 1;
          x.falhas.push('card-sem-id');
          await registrarFalha(db, x.S, x.coletaId, entidade, null, 'card-sem-id');
          continue;
        }
        for (const r of extrairResponsaveis(card) ?? []) x.vistos.add(r);
        const r = await gravarStgCard(db, {
          idOrigem: id, card, dominios: x.dominios, coletaId: x.coletaId, agora, quadroId: String(quadro),
          arquivado: estado === 'archived', excluidoDetectado: false,
        }, x.S);
        if (r === 'inserido') c.inseridos += 1;
        else c.jaExistentes += 1;
        for (const t of transicoesDoCard(card) ?? []) {
          c.transicoes.lidas += 1;
          const revisionId = revisionIdDaTransicao(t);
          if (revisionId === null) {
            c.transicoes.invalidas += 1;
            x.falhas.push('transicao-invalida');
            await registrarFalha(db, x.S, x.coletaId, entidade, id, 'transicao-invalida');
            continue;
          }
          if (await gravarStgRevision(db, { cardId: id, revisionId, revisao: t, tipo: 'transicao', coletaId: x.coletaId, agora }, x.S)) c.transicoes.inseridas += 1;
          else c.transicoes.jaExistentes += 1;
        }
      }
      await db.query(
        `UPDATE ${x.S.bm}.ctl_coleta SET parametros = jsonb_set(parametros, ARRAY['paginas', $2::text], jsonb_build_object('ultima', $3::int, 'total', $4::int), true) WHERE coleta_id = $1`,
        [x.coletaId, `${quadro}|${estado}`, pagina, total]);
    });
  }
}

/**
 * Coleta dos cards nos três estados, por quadro. Carga inicial (Q-2, Q-2b, Q-2c): `active` sem filtro de data, `archived` por
 * `archived_from` e `discarded` por `discarded_from`, a partir de hoje menos 12 meses; retomável pela última página concluída de cada
 * quadro e estado (relê a última, o dedupe cobre). Incremental: `last_modified_from` = marca d'água menos a sobreposição, nos três
 * estados. Marca d'água só em sucesso; a de uma carga retomada é a do início da primeira tentativa (nada modificado no meio se perde).
 */
export async function coletarCards(d: DepsColeta, modo: ModoColeta): Promise<ResultadoColeta> {
  const S = d.S ?? esquemasDoAmbiente();
  const inicio = d.agora();
  await fecharInterrompidas(d.pool, S, inicio);

  let iniciadaEm = inicio;
  let paginas: Paginas = {};
  let inicioCarga: string | null = null;
  let marcaDe: Date | null = null;
  let retomada = false;
  let filtro: (estado: EstadoCard) => Record<string, string>;
  if (modo.tipo === 'carga_inicial') {
    const anterior = await ultimaCarga(d.pool, S);
    retomada = anterior !== undefined && anterior.status !== 'sucesso' && (modo.inicio === undefined || anterior.parametros.inicio_carga === modo.inicio);
    if (anterior !== undefined && retomada) {
      inicioCarga = anterior.parametros.inicio_carga;
      paginas = anterior.parametros.paginas;
      iniciadaEm = new Date(anterior.parametros.iniciada_em);
    } else {
      inicioCarga = modo.inicio ?? inicioDaCarga(inicio);
    }
    const desde = inicioCarga;
    filtro = (estado): Record<string, string> =>
      estado === 'archived' ? { archived_from: desde } : estado === 'discarded' ? { discarded_from: desde } : {};
  } else {
    marcaDe = await marcaDagua(d.pool, S);
    if (marcaDe === null) throw new ErroColetaBm('sem-marca', 'incremental exige uma carga inicial concluída (sem marca d\'água)');
    const desde = iso(new Date(marcaDe.getTime() - SOBREPOSICAO_S * 1000));
    filtro = () => ({ last_modified_from: desde });
  }

  const parametros = {
    tipo: modo.tipo, host_sha256: sha256(d.hostBase), quadros_sha256: sha256([...d.quadros].join(',')), paginas,
    ...(inicioCarga === null ? {} : { inicio_carga: inicioCarga, iniciada_em: iso(iniciadaEm) }),
  };
  const aberta = await d.pool.query<{ coleta_id: string }>(
    `INSERT INTO ${S.bm}.ctl_coleta (tarefa, iniciado_em, status, marca_dagua_de, sobreposicao_s, versao_coletor, parametros)
     VALUES ('coleta_incremental', $1, 'em_andamento', $2, $3, $4, $5::jsonb) RETURNING coleta_id`,
    [inicio, marcaDe, modo.tipo === 'incremental' ? SOBREPOSICAO_S : 0, VERSAO_COLETOR, JSON.stringify(parametros)]);
  const coletaId = Number(aberta.rows[0]!.coleta_id);
  const x: Execucao = { d, S, coletaId, filtro, dominios: dominiosDaColeta(), vistos: new Set(), falhas: [], motivosPendentes: [] };

  try {
    let referencia: unknown = null;
    if (d.etapaReferencia !== undefined) {
      try {
        referencia = await d.etapaReferencia(coletaId);
      } catch (e) {
        x.falhas.push(codigoDe(e));
        if (e instanceof ErroReferencia) x.motivosPendentes.push(...e.pendentes);
        await registrarFalha(d.pool, S, coletaId, 'referencia', null, codigoDe(e));
      }
    }
    const streams: ResumoStream[] = [];
    let fatal = false;
    for (const quadro of d.quadros) {
      for (const estado of ESTADOS) {
        if (fatal) break;
        const anterior = paginas[`${quadro}|${estado}`];
        if (anterior !== undefined && anterior.total > 0 && anterior.ultima >= anterior.total) continue;
        const c: ResumoStream = { quadro, estado, lidos: 0, inseridos: 0, jaExistentes: 0, falhas: 0, transicoes: { lidas: 0, inseridas: 0, jaExistentes: 0, invalidas: 0 } };
        try {
          await lerStream(x, quadro, estado, Math.max(1, anterior?.ultima ?? 1), c);
        } catch (e) {
          if (!(e instanceof ErroBusinessMap)) throw e;
          c.falhas += 1;
          x.falhas.push(e.tipo);
          await registrarFalha(d.pool, S, coletaId, `card_${quadro}_${estado}`, null, e.tipo);
          fatal = !NAO_FATAIS.has(e.tipo);
        }
        streams.push(c);
        await registrarContagem(d.pool, S, coletaId, `card_${quadro}_${estado}`, c);
        await registrarContagem(d.pool, S, coletaId, `transicao_${quadro}_${estado}`,
          { lidos: c.transicoes.lidas, inseridos: c.transicoes.inseridas, jaExistentes: c.transicoes.jaExistentes, falhas: c.transicoes.invalidas });
      }
    }

    let usuarios: ResultadoUsuarios | null = null;
    if (!fatal) {
      usuarios = await resolverResponsaveis(d.pool, d.cliente, x.vistos, d.agora(), S);
      if (usuarios.falha !== null) await registrarFalha(d.pool, S, coletaId, 'usuario', null, usuarios.falha);
      await registrarContagem(d.pool, S, coletaId, 'usuario_nao_resolvido', { lidos: 0, inseridos: 0, jaExistentes: 0, falhas: usuarios.naoResolvidos });
    }

    const lidos = streams.reduce((s, c) => s + c.lidos, 0);
    // falha só de `/users` não derruba a coleta (plano F3): fica em `usuarios.falha` e em `ctl_coleta_falha`; o status olha cards e referência
    const estado: StatusFinal = x.falhas.length === 0 ? 'sucesso' : lidos > 0 ? 'parcial' : 'falha';
    await emTransacao(d.pool, async (db) => {
      if (estado === 'sucesso') await db.query(`UPDATE ${S.bm}.ctl_coleta SET marca_dagua_ate = $2 WHERE coleta_id = $1`, [coletaId, iniciadaEm]);
      await fecharColeta(db, {
        fonte: 'businessmap', coletaId, status: estado, agora: d.agora(),
        erroResumo: estado === 'sucesso' ? null : `${CATEGORIA[x.falhas[0]!] ?? 'desconhecido'}: ${x.falhas.length} falha(s) (${[...new Set(x.falhas)].join(', ')})`.slice(0, 500),
      }, S);
    });
    const falhas: Record<string, number> = {};
    for (const f of x.falhas) falhas[f] = (falhas[f] ?? 0) + 1;
    return { coletaId, modo: modo.tipo, estado, inicioCarga, retomada, streams, usuarios, referencia, motivosPendentes: x.motivosPendentes, falhas };
  } catch (e) {
    // erro de banco ou de programação: fecha como falha (sem a mensagem, que pode trazer valor) e repassa
    await emTransacao(d.pool, (db) => fecharColeta(db, { fonte: 'businessmap', coletaId, status: 'falha', erroResumo: 'desconhecido: erro-interno', agora: d.agora() }, S)).catch(() => undefined);
    throw e;
  }
}
