import { createHash } from 'node:crypto';
import { z } from 'zod';
import { esquemasDoAmbiente, type Esquemas } from '../../../plataforma/db/esquemas.js';
import { emTransacao, type Consultavel, type PoolLike } from '../../../plataforma/db/pool.js';
import { ErroBusinessMap, type ClienteHttp } from '../../../plataforma/http.js';
import { fecharColeta, type StatusFinal } from '../../operacao/index.js';
import { ErroColetaBm, SOBREPOSICAO_S } from '../coleta.js';
import { resolverResponsaveis } from '../usuarios.js';
import {
  ativosDaJanela, atualizarHierarquia, escopoDoWorklog, excluidosEntre, gravarStgApontamento, pessoasResolvidas, projetarFatoApontamento,
  registrarEventos, type LinhaComPessoa,
} from './gravacao.js';
import { lerLote, LOTE_CARDS, type FiltroWorklog, type Folha } from './lotes.js';
import {
  classificar, conferirClassificacao, idDoBm, lerApontamento, type ClassificarApontamento, type LinhaClassificada, type SaidaClassificacao,
} from './registro.js';
import { SAL_MINIMO_BYTES, usuariosSuprimidos } from './supressao.js';

// Pedido 059 (K-193), A3: coleta do worklog do BusinessMap (ADR 0025). Só GET `/loggedTime` por lote de cards do escopo, pelo cliente da F0.
// Incremental: (1) os NOVOS, `logged_from` = marca d'água - 1 h; (2) a varredura de presença, `from_date` = hoje - 90 dias (aos domingos, 12
// meses), única fonte de edição (hash novo = versão nova) e de exclusão (ausente de lote completo) enquanto o histórico estiver negado.
// Carga inicial: manual, `from_date` = hoje - 12 meses, retomável por lote de cards, sem detectar exclusão. A staging é append-only; o fato
// guarda o estado atual; o comentário e o `user_id` vivem só em memória. Quem chama segura a trava da fonte (exclusão mútua com os cards).

export const VERSAO_COLETOR_APONTAMENTO = 'bm-ap/1';
export const JANELA_VARREDURA_DIAS = 90;
export const MESES_CARGA_APONTAMENTO = 12;
/** Guarda de exclusão em massa (ADR 0025 item 6): acima disto (em %) dos ativos da janela, nenhuma exclusão da execução é gravada. */
export const LIMITE_MASSA_PERCENTUAL = 20;
/**
 * Guarda `recusa_em_massa` (decisão A7 do plano, ADR 0025 item 10): recusas de registro acima deste percentual dos registros lidos na execução,
 * com pelo menos `MINIMO_RECUSAS_MASSA` recusas, fecham `parcial` (muitas recusas juntas indicam mudança de contrato da API) e seguram a marca.
 */
export const LIMITE_RECUSA_PERCENTUAL = 5;
export const MINIMO_RECUSAS_MASSA = 10;
/** Recusa de registro (lista fechada, só dado da origem): vai a `ctl_coleta_falha` e à contagem, mas não é falha de execução (A7). */
const CODIGOS_DE_RECUSA: ReadonlySet<string> = new Set(['id-invalido', 'data-invalida', 'data-futura', 'tempo-invalido', 'campo-invalido']);
const FUSO = 'America/Sao_Paulo';
const DIA_MS = 86_400_000;

export type ModoApontamento = { tipo: 'carga_inicial'; inicio?: string | undefined } | { tipo: 'incremental' };

export interface DepsApontamento {
  cliente: Pick<ClienteHttp, 'get'>;
  /** Papel `dspd_coletor`. */
  pool: PoolLike;
  S?: Esquemas;
  /** Função pura da trilha B (`classificarApontamento`), já ligada ao dicionário vigente. O comentário nunca passa daqui. */
  classificar: ClassificarApontamento;
  /** `PESSOA_ELIMINADA_SAL` (pelo menos 32 bytes): sem ele a coleta não roda (não há recoleta sem supressão, R4-6). */
  sal: string;
  /** Só para o hash que vai a `ctl_coleta`; nunca gravado em claro. */
  hostBase: string;
  agora: () => Date;
  /** Parâmetro técnico da guarda de massa (padrão 20). */
  limiteMassaPercentual?: number;
  /** Parâmetros técnicos da guarda `recusa_em_massa` (padrões 5 e 10), ajustáveis sem mudar código. */
  limiteRecusaPercentual?: number;
  minimoRecusasMassa?: number;
}

export interface ResultadoApontamento {
  coletaId: number;
  modo: ModoApontamento['tipo'];
  estado: StatusFinal;
  /** `from_date` da leitura por data (varredura ou carga). */
  desde: string;
  retomada: boolean;
  lidos: number;
  inseridos: number;
  jaExistentes: number;
  /** Registros que não entraram na staging: recusas de registro e falhas de classificação (a contagem `falhas` de `ctl_coleta_contagem`). */
  invalidos: number;
  excluidos: number;
  reaparecidos: number;
  /** Lotes de cards (200) concluídos sem falha, desde o início (só na carga inicial). */
  lotesConcluidos: number;
  /** Ids de usuário pedidos a `/users`, resolvidos e não resolvidos (contagens; nunca id nem nome). */
  usuarios: { pedidos: number; resolvidos: number; naoResolvidos: number };
  /** Códigos das falhas de execução (nunca mensagens), com a contagem: seguram a marca e fecham `parcial` ou `falha`. */
  falhas: Record<string, number>;
  /** Recusas de registro por código (A7): não seguram a marca nem fecham a coleta `parcial`. */
  recusados: Record<string, number>;
}

const ParametrosCarga = z.object({
  inicio_carga: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  iniciada_em: z.string().datetime(),
  lotes_concluidos: z.number().int().min(0),
});

const sha256 = (t: string): string => createHash('sha256').update(t).digest('hex');
const iso = (d: Date): string => d.toISOString().replace(/\.\d{3}Z$/, 'Z');

/** Data civil (`AAAA-MM-DD`) em America/Sao_Paulo: é o "hoje" da validação, da janela e da chave dos eventos. */
export const diaCivil = (d: Date): string => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(d);
export const menosDias = (dia: string, n: number): string => new Date(Date.parse(`${dia}T00:00:00Z`) - n * DIA_MS).toISOString().slice(0, 10);
export const menosMeses = (dia: string, n: number): string => {
  const d = new Date(`${dia}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - n);
  return d.toISOString().slice(0, 10);
};
export const ehDomingo = (dia: string): boolean => new Date(`${dia}T12:00:00Z`).getUTCDay() === 0;

async function registrarFalha(db: Consultavel, S: Esquemas, coletaId: number, entidade: string, idOrigem: string | null, erro: string): Promise<void> {
  await db.query(`INSERT INTO ${S.bm}.ctl_coleta_falha (coleta_id, entidade, id_origem, erro) VALUES ($1, $2, $3, $4)`, [coletaId, entidade, idOrigem, erro]);
}

async function registrarContagem(db: Consultavel, S: Esquemas, coletaId: number, entidade: string, c: { lidos: number; inseridos: number; jaExistentes: number; falhas: number }): Promise<void> {
  await db.query(
    `INSERT INTO ${S.bm}.ctl_coleta_contagem (coleta_id, entidade, lidos, inseridos, ja_existentes, falhas) VALUES ($1, $2, $3, $4, $5, $6)`,
    [coletaId, entidade, c.lidos, c.inseridos, c.jaExistentes, c.falhas]);
}

interface Passe { filtro: FiltroWorklog; varredura: boolean }

interface Execucao {
  d: DepsApontamento; S: Esquemas; coletaId: number; hoje: string;
  tipos: ReadonlyMap<string, string | null>; escopo: ReadonlySet<string>;
  vistos: Set<string>; completos: Set<string>; falhas: string[]; recusas: string[];
  r: Pick<ResultadoApontamento, 'lidos' | 'inseridos' | 'jaExistentes' | 'invalidos' | 'excluidos' | 'reaparecidos' | 'usuarios'>;
}

/** Tipo do card do apontamento; apontamento de subtarefa vale o tipo do card pai. Só `type_id` (dígitos), nunca texto. */
const tipoDoApontamento = (x: Execucao, l: { card_id: string; parent_card_id: string | null }): string | null =>
  idDoBm(x.tipos.get(l.card_id) ?? x.tipos.get(l.parent_card_id ?? '') ?? null);

/** Classifica em memória (o comentário é descartado aqui). Função que lança ou devolve fora da lista fechada vira `null` (falha só com código). */
function classificarComSeguranca(
  x: Execucao, l: { linha: { card_id: string; parent_card_id: string | null; category_id: string | null }; comentario: string | null },
): SaidaClassificacao | null {
  try {
    return conferirClassificacao(x.d.classificar({ comentario: l.comentario, typeId: tipoDoApontamento(x, l.linha), categoriaId: l.linha.category_id }));
  } catch {
    return null;
  }
}

/** Uma folha: valida e classifica na fronteira, resolve pessoa (supressão antes do `/users`) e grava staging, fato e eventos numa transação. */
async function processarFolha(x: Execucao, passe: Passe, folha: Folha): Promise<void> {
  const { d, S } = x;
  const agora = d.agora();
  const rejeitados: { codigo: string; idOrigem: string | null }[] = [];
  const lidos = new Map<string, { linha: LinhaClassificada; userId: string | null }>();
  for (const item of folha.itens) {
    const l = lerApontamento(item, x.hoje);
    if (!l.ok) {
      rejeitados.push(l);
      if (l.idOrigem !== null) x.vistos.add(l.idOrigem);
      continue;
    }
    x.vistos.add(l.linha.logged_time_id);
    const saida = classificarComSeguranca(x, l);
    if (saida === null) rejeitados.push({ codigo: 'classificacao-falhou', idOrigem: l.linha.logged_time_id });
    else lidos.set(l.linha.logged_time_id, { linha: classificar(l.linha, saida), userId: l.userId });
  }

  const userIds = [...new Set([...lidos.values()].flatMap((v) => (v.userId === null ? [] : [v.userId])))];
  const suprimidos = await usuariosSuprimidos(d.pool, S, d.sal, userIds);
  const resolver = userIds.filter((u) => !suprimidos.has(u));
  const usuarios = await resolverResponsaveis(d.pool, d.cliente, resolver, agora, S, d.sal);
  const pessoas = await pessoasResolvidas(d.pool, S, resolver);
  x.r.usuarios.pedidos += usuarios.pedidos;
  x.r.usuarios.resolvidos += usuarios.resolvidos;
  x.r.usuarios.naoResolvidos += usuarios.naoResolvidos;

  await emTransacao(d.pool, async (db) => {
    for (const f of rejeitados) await registrarFalha(db, S, x.coletaId, 'apontamento', f.idOrigem, f.codigo);
    // falha do lote: `id_origem` é o card quando o lote é de um card só (nunca valor lido)
    if (folha.falha !== null) await registrarFalha(db, S, x.coletaId, 'apontamento', folha.cards.length === 1 ? folha.cards[0]! : null, folha.falha);
    if (usuarios.falha !== null) {
      for (const [id, v] of lidos) {
        // ADR 0020 R4-2: `id_origem` é o `logged_time_id` do apontamento, nunca o `user_id`
        if (v.userId !== null && !suprimidos.has(v.userId) && !pessoas.has(v.userId)) await registrarFalha(db, S, x.coletaId, 'apontamento_usuario', id, usuarios.falha);
      }
    }
    const linhas = [...lidos.values()].map((v) => v.linha);
    if (linhas.length === 0) return;
    const comPessoa: LinhaComPessoa[] = [...lidos.values()].map((v) => ({
      ...v.linha, pessoa_ref: v.userId === null ? null : (pessoas.get(v.userId) ?? null), type_id: tipoDoApontamento(x, v.linha),
    }));
    const novas = await gravarStgApontamento(db, S, linhas, x.coletaId, agora);
    x.r.inseridos += novas;
    x.r.jaExistentes += linhas.length - novas;
    await projetarFatoApontamento(db, S, comPessoa, x.coletaId, agora);
    // apontamento que estava excluído e voltou a aparecer: evento `reaparecido`, volta às somas (nada é apagado)
    const voltaram = await excluidosEntre(db, S, [...lidos.keys()]);
    x.r.reaparecidos += (await registrarEventos(db, S, 'reaparecido', voltaram, x.hoje, x.coletaId, agora)).length;
  });

  x.r.lidos += folha.itens.length;
  x.r.invalidos += rejeitados.length;
  // A7: recusa de registro não é falha de execução; falha de classificação (defeito nosso ou do dicionário) e de lote são
  for (const f of rejeitados) (CODIGOS_DE_RECUSA.has(f.codigo) ? x.recusas : x.falhas).push(f.codigo);
  if (folha.falha !== null) x.falhas.push(folha.falha);
  // só lote completo pode virar fonte de exclusão; recusa com `logged_time_id` válido não tira o lote de completo (o id entrou em `vistos`),
  // recusa com id inválido tira (não se sabe de quem é o registro)
  if (passe.varredura && folha.completo && rejeitados.every((f) => f.idOrigem !== null)) for (const c of folha.cards) x.completos.add(c);
}

/** Guarda `recusa_em_massa` (A7): recusas de registro acima do percentual dos lidos, com o mínimo de recusas. */
const recusaEmMassa = (x: Execucao): boolean =>
  x.recusas.length >= (x.d.minimoRecusasMassa ?? MINIMO_RECUSAS_MASSA)
  && x.recusas.length * 100 > (x.d.limiteRecusaPercentual ?? LIMITE_RECUSA_PERCENTUAL) * x.r.lidos;

/**
 * Exclusão por presença (ADR 0025 item 6): apontamento ativo da janela, de cards cujo lote veio COMPLETO, que não voltou na leitura.
 * Guarda de massa: acima do limite (em %) dos ativos da janela, nenhum evento é gravado e a coleta fecha `parcial`.
 */
async function detectarExclusoes(x: Execucao, desde: string): Promise<void> {
  const { d, S } = x;
  const ativos = await ativosDaJanela(d.pool, S, desde, [...x.escopo]);
  const candidatos = ativos.filter((a) =>
    !x.vistos.has(a.logged_time_id) && [a.card_id, a.parent_card_id].every((c) => c === null || !x.escopo.has(c) || x.completos.has(c)));
  if (candidatos.length * 100 > (d.limiteMassaPercentual ?? LIMITE_MASSA_PERCENTUAL) * ativos.length) {
    x.falhas.push('exclusao_em_massa');
    await registrarFalha(d.pool, S, x.coletaId, 'apontamento', null, 'exclusao_em_massa');
    return;
  }
  const agora = d.agora();
  const marcados = await emTransacao(d.pool, (db) => registrarEventos(db, S, 'excluido_detectado', candidatos, x.hoje, x.coletaId, agora));
  x.r.excluidos += marcados.length;
}

/** Execução anterior que morreu sem fechar (a trava da fonte garante que não há outra rodando): fecha como falha, sem apagar nada. */
async function fecharInterrompidas(pool: PoolLike, S: Esquemas, agora: Date): Promise<void> {
  const r = await pool.query<{ coleta_id: string }>(`SELECT coleta_id FROM ${S.bm}.ctl_coleta WHERE tarefa = 'apontamento' AND status = 'em_andamento'`);
  for (const l of r.rows) {
    await emTransacao(pool, (db) => fecharColeta(db, { fonte: 'businessmap', coletaId: l.coleta_id, status: 'falha', erroResumo: 'desconhecido: execução anterior interrompida', agora }, S));
  }
}

const dividir = <T>(lista: readonly T[], tamanho: number): T[][] => {
  const grupos: T[][] = [];
  for (let i = 0; i < lista.length; i += tamanho) grupos.push(lista.slice(i, i + tamanho));
  return grupos;
};

/**
 * Coleta do worklog. `incremental` exige uma marca d'água anterior (a carga inicial concluída) e que a coleta de cards mais recente não
 * tenha falhado. Marca d'água só em sucesso (falha de lote, de classificação, `lote_no_teto` e as guardas de massa deixam a execução
 * `parcial` e a marca onde estava; registro recusado não deixa, decisão A7).
 */
export async function coletarApontamentos(d: DepsApontamento, modo: ModoApontamento): Promise<ResultadoApontamento> {
  if (Buffer.byteLength(d.sal) < SAL_MINIMO_BYTES) throw new ErroColetaBm('configuracao', `PESSOA_ELIMINADA_SAL ausente ou com menos de ${SAL_MINIMO_BYTES} bytes`);
  const S = d.S ?? esquemasDoAmbiente();
  const inicio = d.agora();
  const hoje = diaCivil(inicio);
  await fecharInterrompidas(d.pool, S, inicio);
  const cards = await d.pool.query<{ status: string }>(`SELECT status FROM ${S.bm}.ctl_coleta WHERE tarefa = 'coleta_incremental' ORDER BY coleta_id DESC LIMIT 1`);
  if (cards.rows[0]?.status === 'falha') throw new ErroColetaBm('cards-falhou', 'a coleta de cards mais recente falhou: o worklog não roda sem o escopo atualizado');

  let iniciadaEm = inicio;
  let marcaDe: Date | null = null;
  let retomada = false;
  let primeiroLote = 0;
  let desde: string;
  let passes: Passe[];
  if (modo.tipo === 'carga_inicial') {
    const ultima = await d.pool.query<{ status: string; parametros: unknown }>(
      `SELECT status, parametros FROM ${S.bm}.ctl_coleta WHERE tarefa = 'apontamento' AND parametros ->> 'tipo' = 'carga_inicial' ORDER BY coleta_id DESC LIMIT 1`);
    const anterior = ParametrosCarga.safeParse(ultima.rows[0]?.parametros);
    retomada = anterior.success && ultima.rows[0]!.status !== 'sucesso' && (modo.inicio === undefined || anterior.data.inicio_carga === modo.inicio);
    if (anterior.success && retomada) {
      desde = anterior.data.inicio_carga;
      primeiroLote = anterior.data.lotes_concluidos;
      iniciadaEm = new Date(anterior.data.iniciada_em);
    } else {
      desde = modo.inicio ?? menosMeses(hoje, MESES_CARGA_APONTAMENTO);
    }
    passes = [{ filtro: { from_date: desde }, varredura: false }];
  } else {
    const m = await d.pool.query<{ marca: Date | null }>(`SELECT max(marca_dagua_ate) AS marca FROM ${S.bm}.ctl_coleta WHERE tarefa = 'apontamento' AND status = 'sucesso'`);
    marcaDe = m.rows[0]?.marca ?? null;
    if (marcaDe === null) throw new ErroColetaBm('sem-marca', "incremental exige uma carga inicial concluída (sem marca d'água)");
    // diária: janela curta; aos domingos, a janela longa (a mesma varredura, com início na carga)
    desde = ehDomingo(hoje) ? menosMeses(hoje, MESES_CARGA_APONTAMENTO) : menosDias(hoje, JANELA_VARREDURA_DIAS);
    passes = [
      { filtro: { logged_from: iso(new Date(marcaDe.getTime() - SOBREPOSICAO_S * 1000)) }, varredura: false },
      { filtro: { from_date: desde }, varredura: true },
    ];
  }

  const parametros = {
    tipo: modo.tipo, host_sha256: sha256(d.hostBase), desde,
    ...(modo.tipo === 'carga_inicial' ? { inicio_carga: desde, iniciada_em: iso(iniciadaEm), lotes_concluidos: primeiroLote } : {}),
  };
  const aberta = await d.pool.query<{ coleta_id: string }>(
    `INSERT INTO ${S.bm}.ctl_coleta (tarefa, iniciado_em, status, marca_dagua_de, sobreposicao_s, versao_coletor, parametros)
     VALUES ('apontamento', $1, 'em_andamento', $2, $3, $4, $5::jsonb) RETURNING coleta_id`,
    [inicio, marcaDe, modo.tipo === 'incremental' ? SOBREPOSICAO_S : 0, VERSAO_COLETOR_APONTAMENTO, JSON.stringify(parametros)]);
  const coletaId = Number(aberta.rows[0]!.coleta_id);

  try {
    const escopoCards = await escopoDoWorklog(d.pool, S);
    const x: Execucao = {
      d, S, coletaId, hoje, tipos: new Map(escopoCards.map((c) => [c.card_id, c.type_id])), escopo: new Set(escopoCards.map((c) => c.card_id)),
      vistos: new Set(), completos: new Set(), falhas: [], recusas: [],
      r: { lidos: 0, inseridos: 0, jaExistentes: 0, invalidos: 0, excluidos: 0, reaparecidos: 0, usuarios: { pedidos: 0, resolvidos: 0, naoResolvidos: 0 } },
    };
    const lotes = dividir(escopoCards.map((c) => c.card_id), LOTE_CARDS);
    let concluidos = primeiroLote;
    let fatal = false;
    try {
      for (const passe of passes) {
        for (const [i, grupo] of lotes.entries()) {
          if (i < primeiroLote) continue;
          const falhasAntes = x.falhas.length;
          await lerLote(d.cliente, grupo, passe.filtro, (folha) => processarFolha(x, passe, folha));
          // checkpoint da carga: só avança enquanto os lotes forem concluídos sem falha de execução, em ordem; lote só de recusas de registro
          // conta como concluído (A7), exceto com a guarda `recusa_em_massa` armada (o checkpoint não anda sobre mudança de contrato)
          if (modo.tipo === 'carga_inicial' && x.falhas.length === falhasAntes && concluidos === i && !recusaEmMassa(x)) {
            concluidos = i + 1;
            await d.pool.query(`UPDATE ${S.bm}.ctl_coleta SET parametros = jsonb_set(parametros, '{lotes_concluidos}', to_jsonb($2::int), true) WHERE coleta_id = $1`, [coletaId, concluidos]);
          }
        }
      }
    } catch (e) {
      if (!(e instanceof ErroBusinessMap)) throw e;
      fatal = true;
      x.falhas.push(e.tipo);
      await registrarFalha(d.pool, S, coletaId, 'apontamento', null, e.tipo);
    }
    if (recusaEmMassa(x)) {
      x.falhas.push('recusa_em_massa');
      await registrarFalha(d.pool, S, coletaId, 'apontamento', null, 'recusa_em_massa');
    }
    if (!fatal && modo.tipo === 'incremental') await detectarExclusoes(x, desde);
    const agoraFim = d.agora();
    await emTransacao(d.pool, (db) => atualizarHierarquia(db, S, coletaId, agoraFim));

    const { r } = x;
    await registrarContagem(d.pool, S, coletaId, 'apontamento', { lidos: r.lidos, inseridos: r.inseridos, jaExistentes: r.jaExistentes, falhas: r.invalidos });
    await registrarContagem(d.pool, S, coletaId, 'apontamento_exclusao', { lidos: 0, inseridos: r.excluidos, jaExistentes: 0, falhas: 0 });
    await registrarContagem(d.pool, S, coletaId, 'apontamento_reaparecido', { lidos: 0, inseridos: r.reaparecidos, jaExistentes: 0, falhas: 0 });
    await registrarContagem(d.pool, S, coletaId, 'apontamento_usuario', { lidos: r.usuarios.pedidos, inseridos: r.usuarios.resolvidos, jaExistentes: 0, falhas: r.usuarios.naoResolvidos });

    // falha só de `/users` não derruba a coleta (ela fica em `ctl_coleta_falha`); o status olha os lotes, os registros e a guarda de massa
    const estado: StatusFinal = x.falhas.length === 0 ? 'sucesso' : r.lidos > 0 ? 'parcial' : 'falha';
    await emTransacao(d.pool, async (db) => {
      if (estado === 'sucesso') await db.query(`UPDATE ${S.bm}.ctl_coleta SET marca_dagua_ate = $2 WHERE coleta_id = $1`, [coletaId, iniciadaEm]);
      await fecharColeta(db, {
        fonte: 'businessmap', coletaId, status: estado, agora: d.agora(),
        erroResumo: estado === 'sucesso' ? null : `${x.falhas.length} falha(s) do worklog (${[...new Set(x.falhas)].join(', ')})`.slice(0, 500),
      }, S);
    });
    const falhas: Record<string, number> = {};
    for (const f of x.falhas) falhas[f] = (falhas[f] ?? 0) + 1;
    const recusados: Record<string, number> = {};
    for (const f of x.recusas) recusados[f] = (recusados[f] ?? 0) + 1;
    return { coletaId, modo: modo.tipo, estado, desde, retomada, ...r, lotesConcluidos: concluidos, falhas, recusados };
  } catch (e) {
    // erro de banco ou de programação: fecha como falha (sem a mensagem, que pode trazer valor) e repassa
    await emTransacao(d.pool, (db) => fecharColeta(db, { fonte: 'businessmap', coletaId, status: 'falha', erroResumo: 'desconhecido: erro-interno', agora: d.agora() }, S)).catch(() => undefined);
    throw e;
  }
}
