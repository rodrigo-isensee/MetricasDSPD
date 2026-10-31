import { esquemasDoAmbiente, type Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import type { ClienteHttp } from '../../plataforma/http.js';
import type { Conferencia } from './conferencia.js';
import { desembrulhar } from './spike-forma.js';
import { papelDaFolha } from './spike-lista.js';

// F2 do plano 052 (K-182): referência real do quadro (quadros, workflows com nível, colunas por id com papel e tipo, tipos de card),
// lida só por GET pelo cliente da F0 e gravada com vigência (ADR 0016, U-1 e U-2). Nada aqui lê pessoa: só ids, nomes de coluna, de
// workflow e de tipo de card. Nunca roda sozinha: quem chama (comando manual da F3) passa o cliente, a conexão e as datas.

export const QUADRO_PROJETOS = '35';
/** Métricas do fluxo real (H-13, plano 052 F6) marcadas quando um critério de papel, tipo ou nível muda; o limite de WIP só afeta o O1. */
export const METRICAS_DO_FLUXO = ['O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O9', 'O10', 'O11', 'O13', 'EI_FL1'] as const;
export const REFERENCIA_PARTIDA = 'plano-052-F2:partida';
export const ENTIDADE_SEM_CONFERENCIA = 'folha_sem_conferencia';
export const REGISTRADO_POR_F2 = 'f2-referencia';

export class ErroReferencia extends Error {
  constructor(readonly tipo: 'motivo' | 'vigencia' | 'formato', mensagem: string, readonly pendentes: readonly string[] = []) {
    super(mensagem);
    this.name = 'ErroReferencia';
  }
}

type Valor = string | number | boolean | null;
export type Linha = Record<string, Valor>;
export type Nivel = 'projeto' | 'feature' | 'story' | 'nenhum';
export type Motivo = 'processo' | 'correcao';

const ehObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const inteiro = (v: unknown): number | undefined => (typeof v === 'number' && Number.isInteger(v) ? v : undefined);
const idDe = (v: unknown): string | null => (inteiro(v) !== undefined && inteiro(v)! > 0 ? String(v) : null);
const limpo = (v: unknown, max: number, padrao: string): string => {
  const t = typeof v === 'string' ? v.replace(/[\r\n|`]+/g, ' ').trim().slice(0, max) : '';
  return t === '' ? padrao : t;
};
const normalizar = (t: string): string => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** H-1: nível pelo workflow. `type` 2 (linha do tempo) não tem nível; quadro 35 = projeto; `type` 1 = feature ou pacote; `type` 0 = story. */
export function nivelDoWorkflow(quadro: string, tipoApi: number): Nivel {
  if (tipoApi === 2) return 'nenhum';
  if (quadro === QUADRO_PROJETOS) return 'projeto';
  return tipoApi === 1 ? 'feature' : 'story';
}

/** H-2 e H-17: o tipo vem do mapa do arquivo (comparação sem acento nem caixa); tipo fora do mapa vale como o padrão. */
export function classificarTipo(nome: string, conf: Conferencia): { eh_item: boolean; categoria: string | null } {
  const achado = conf.mapa_tipos.tipos.find((t) => normalizar(t.nome) === normalizar(nome));
  return achado === undefined ? { ...conf.mapa_tipos.padrao } : { eh_item: achado.eh_item, categoria: achado.categoria };
}

/* ---------- leitura (só GET) ---------- */

export interface ReferenciaLida {
  quadros: number[];
  /** Corpo de `currentStructure` por quadro. */
  estruturas: Map<number, unknown>;
  /** Corpo de `/boards/{id}/workflows` por quadro. */
  workflows: Map<number, unknown>;
  tipos: unknown;
}

export async function lerReferenciaReal(cliente: Pick<ClienteHttp, 'get'>, quadros: readonly number[]): Promise<ReferenciaLida> {
  const estruturas = new Map<number, unknown>();
  const workflows = new Map<number, unknown>();
  for (const q of quadros) {
    estruturas.set(q, await cliente.get(`/boards/${q}/currentStructure`));
    workflows.set(q, await cliente.get(`/boards/${q}/workflows`));
  }
  return { quadros: [...quadros], estruturas, workflows, tipos: await cliente.get('/cardTypes') };
}

/* ---------- linhas desejadas ---------- */

export const linhaQuadro = (quadro: string): Linha => ({
  quadro_id: quadro, equipe: `Quadro ${quadro}`, nivel: quadro === QUADRO_PROJETOS ? 'gerencia' : 'coordenacao', eh_teste: false,
});

export function linhasWorkflow(quadro: string, corpo: unknown): { linhas: Linha[]; ignorados: number } {
  const linhas: Linha[] = [];
  let ignorados = 0;
  for (const w of desembrulhar(corpo).itens) {
    const id = ehObj(w) ? idDe(w.workflow_id) : null;
    const tipo = ehObj(w) ? inteiro(w.type) : undefined;
    if (id === null || tipo === undefined || tipo < 0 || tipo > 2) {
      ignorados += 1; // tipo desconhecido não se infere: fica fora e é contado
      continue;
    }
    linhas.push({ quadro_id: quadro, workflow_id: id, nome: limpo(Object(w).name, 120, `Workflow ${id}`), tipo_api: tipo, nivel: nivelDoWorkflow(quadro, tipo) });
  }
  return { linhas, ignorados };
}

export function linhasTipoCard(corpo: unknown, conf: Conferencia): Linha[] {
  const linhas: Linha[] = [];
  for (const t of desembrulhar(corpo).itens) {
    const id = ehObj(t) ? idDe(t.type_id) : null;
    if (id === null) continue;
    const nome = limpo(Object(t).name, 80, `Tipo ${id}`);
    linhas.push({ tipo_id: id, nome, ...classificarTipo(nome, conf) });
  }
  return linhas;
}

/** Colunas (mães e folhas) de um quadro, por id, com workflow. Papel e tipo só nas folhas, pela função única da F1. */
export function linhasColuna(quadro: string, corpo: unknown, conf: Conferencia): Linha[] {
  const raiz = desembrulhar(corpo).itens[0];
  const r = ehObj(raiz) ? raiz : {};
  const colunas = ehObj(r.columns) ? r.columns : {};
  const filhas = ehObj(r.child_columns) ? r.child_columns : {};
  const workflows = ehObj(r.workflows) ? r.workflows : {};
  const posicao = (wf: string | null, lista: 'bottom_columns' | 'top_columns', id: string): number => {
    const w = wf === null ? undefined : workflows[wf];
    const i = ehObj(w) && Array.isArray(w[lista]) ? w[lista].map(String).indexOf(id) : -1;
    return i < 0 ? 0 : Math.min(i, 32767);
  };
  const faixa = (v: number | undefined, valores: readonly number[]): number | null => (v !== undefined && valores.includes(v) ? v : null);
  const saida: Linha[] = [];
  for (const [id, bruta] of Object.entries(colunas)) {
    if (!/^\d{1,12}$/.test(id) || !ehObj(bruta)) continue;
    const wf = idDe(bruta.workflow_id);
    const mae = idDe(bruta.parent_column_id);
    const pai = mae === null ? undefined : colunas[mae];
    const secao = faixa(inteiro(bruta.section) ?? (ehObj(pai) ? inteiro(pai.section) : undefined), [1, 2, 3, 4, 5]);
    const flow = faixa(inteiro(bruta.flow_type), [1, 2]);
    const folha = !(Array.isArray(filhas[id]) && filhas[id].length > 0);
    const nome = limpo(bruta.name, 80, `Coluna ${id}`);
    const p = folha
      ? papelDaFolha({ workflow: wf ?? '', coluna: id, nomeNormalizado: normalizar(nome), secao: secao ?? undefined, flowType: flow ?? undefined }, conf)
      : undefined;
    const limite = inteiro(bruta.limit);
    saida.push({
      quadro_id: quadro, coluna_id: id, nome, workflow_id: wf, coluna_mae_id: mae, section: secao, flow_type: flow, eh_folha: folha,
      eh_descarte: p?.papel === 'descarte',
      papel: p === undefined || p.papel === 'descarte' || p.papel === 'sem_papel' ? null : p.papel,
      tipo_coluna: p === undefined || p.tipo === 'sem_tipo' ? null : p.tipo,
      ordem: folha ? posicao(wf, 'bottom_columns', id) : posicao(wf, 'top_columns', id),
      // H-12: 0 = sem limite. Guardado como nulo para o O1 mostrar o WIP sem limite (nunca um limite 0).
      limite_wip: limite === undefined || limite <= 0 ? null : Math.min(limite, 32767),
    });
  }
  return saida;
}

/* ---------- vigência ---------- */

interface Esp {
  tabela: 'ref_quadro' | 'ref_workflow' | 'ref_coluna' | 'ref_tipo_card';
  chave: readonly string[];
  valores: readonly string[];
  /** Muda o significado do cálculo: o operador diz se é mudança de processo ou correção (U-1). */
  sem: readonly string[];
  /** Muda o significado e é sempre processo com marca (limite de WIP, H-12; tipo e nível do workflow, H-1). */
  auto: readonly string[];
  /** Linha editada à mão no banco (quadro de teste, equipe) nunca é refeita pela carga. */
  soInserir?: boolean;
  comMotivo?: boolean;
}

const ESP: readonly Esp[] = [
  { tabela: 'ref_quadro', chave: ['quadro_id'], valores: ['equipe', 'nivel', 'eh_teste'], sem: [], auto: [], soInserir: true },
  { tabela: 'ref_workflow', chave: ['quadro_id', 'workflow_id'], valores: ['nome', 'tipo_api', 'nivel'], sem: [], auto: ['tipo_api', 'nivel'] },
  {
    tabela: 'ref_coluna', chave: ['quadro_id', 'coluna_id'], comMotivo: true,
    valores: ['nome', 'tipo_coluna', 'papel', 'ordem', 'limite_wip', 'workflow_id', 'coluna_mae_id', 'section', 'flow_type', 'eh_folha', 'eh_descarte'],
    sem: ['tipo_coluna', 'papel', 'workflow_id', 'coluna_mae_id', 'section', 'flow_type', 'eh_folha', 'eh_descarte'], auto: ['limite_wip'],
  },
  { tabela: 'ref_tipo_card', chave: ['tipo_id'], valores: ['nome', 'eh_item', 'categoria'], sem: ['eh_item', 'categoria'], auto: [] },
];

export type Classe = 'nova' | 'semantica' | 'processo' | 'rotulo';
export interface Mudanca { tabela: string; chave: string; classe: Classe }
export interface Operacao { esp: Esp; linha: Linha; vigenteDe: string; motivo: Motivo | null; fechar: Linha | undefined }

export interface Vigentes {
  ref_quadro: Linha[]; ref_workflow: Linha[]; ref_coluna: Linha[]; ref_tipo_card: Linha[];
}
export interface Plano {
  operacoes: Operacao[];
  mudancas: Mudanca[];
  /** Folhas novas (a carga já tinha colunas) fora de todas as listas do arquivo: entram pela regra e voltam ao dono. */
  semConferencia: string[];
  /** Mudanças de significado sem motivo informado: nada é gravado até o operador dizer processo ou correção. */
  pendentes: Mudanca[];
  metricasMarcadas: string[];
  inicial: boolean;
  workflowsIgnorados: number;
  /** Chaves vigentes que não vêm mais no quadro (A3). A vigência delas não é fechada: fechar ou não é decisão do arquiteto. */
  ausentes: Ausentes;
  /** Folhas lidas sem papel e sem ser descarte (por exemplo, sem seção): ficam com papel nulo e o comando da F3 mostra (A5). */
  folhasSemPapel: number;
}
export interface Ausentes { ref_coluna: number; ref_workflow: number; ref_tipo_card: number }

const igual = (a: Valor | undefined, b: Valor | undefined): boolean => (a ?? null) === (b ?? null);
const chaveDe = (e: Esp, l: Linha): string => e.chave.map((k) => String(l[k])).join('|');

/** Motivo por chave (A2 do review da F2): `<tabela> <chave>` (a chave como em `Mudanca.chave`, ex.: `ref_coluna 25|2532`) para `processo` ou `correcao`. */
export type MotivosPorChave = ReadonlyMap<string, Motivo>;
export interface OpcoesPlano { hoje: string; inicioCarga: string; motivo?: Motivo | MotivosPorChave | undefined }

export function planejar(lida: ReferenciaLida, vigentes: Vigentes, conf: Conferencia, o: OpcoesPlano): Plano {
  const wf = lida.quadros.map((q) => linhasWorkflow(String(q), lida.workflows.get(q)));
  const desejadas: Record<Esp['tabela'], Linha[]> = {
    ref_quadro: lida.quadros.map((q) => linhaQuadro(String(q))),
    ref_workflow: wf.flatMap((w) => w.linhas),
    ref_coluna: lida.quadros.flatMap((q) => linhasColuna(String(q), lida.estruturas.get(q), conf)),
    ref_tipo_card: linhasTipoCard(lida.tipos, conf),
  };
  const operacoes: Operacao[] = [];
  const mudancas: Mudanca[] = [];
  const pendentes: Mudanca[] = [];
  const marcadas = new Set<string>();
  const inicial = vigentes.ref_coluna.length === 0;
  const listadas = new Set([...conf.excecoes_papel_coluna, ...conf.excecoes_papel_trabalho, ...conf.colunas_descartado].map((c) => c.coluna_id));
  const semConferencia: string[] = [];
  const ausentes: Ausentes = { ref_coluna: 0, ref_workflow: 0, ref_tipo_card: 0 };
  const folhasSemPapel = desejadas.ref_coluna.filter((l) => l.eh_folha === true && l.eh_descarte !== true && l.papel === null).length;

  for (const e of ESP) {
    const atuais = new Map(vigentes[e.tabela].map((l) => [chaveDe(e, l), l]));
    const vazia = atuais.size === 0;
    if (e.tabela !== 'ref_quadro') {
      const vistas = new Set(desejadas[e.tabela].map((l) => chaveDe(e, l)));
      ausentes[e.tabela] = [...atuais.keys()].filter((k) => !vistas.has(k)).length;
    }
    for (const nova of desejadas[e.tabela]) {
      const chave = chaveDe(e, nova);
      const atual = atuais.get(chave);
      if (atual === undefined) {
        operacoes.push({ esp: e, linha: nova, vigenteDe: vazia ? o.inicioCarga : o.hoje, motivo: null, fechar: undefined });
        if (e.tabela === 'ref_coluna' && !inicial && nova.eh_folha === true && !listadas.has(String(nova.coluna_id))) semConferencia.push(chave);
        continue;
      }
      const diferentes = e.valores.filter((c) => !igual(atual[c], nova[c]));
      if (diferentes.length === 0 || e.soInserir === true) continue;
      const sem = diferentes.some((c) => e.sem.includes(c));
      const auto = diferentes.some((c) => e.auto.includes(c));
      const m: Mudanca = { tabela: e.tabela, chave, classe: sem ? 'semantica' : auto ? 'processo' : 'rotulo' };
      mudancas.push(m);
      const informado = typeof o.motivo === 'string' ? o.motivo : o.motivo?.get(`${m.tabela} ${m.chave}`);
      if (sem && informado === undefined) pendentes.push(m);
      const motivo: Motivo | null = sem ? (informado ?? null) : auto ? 'processo' : e.comMotivo === true ? 'correcao' : null;
      if (String(atual.vigente_de) >= o.hoje) throw new ErroReferencia('vigencia', `${e.tabela}: já existe vigência aberta em ${o.hoje} para a mesma chave; repita depois dessa data`);
      operacoes.push({ esp: e, linha: nova, vigenteDe: o.hoje, motivo, fechar: atual });
      if (motivo === 'processo') {
        const soLimite = diferentes.filter((c) => e.sem.includes(c) || e.auto.includes(c)).every((c) => c === 'limite_wip');
        for (const x of soLimite ? ['O1'] : METRICAS_DO_FLUXO) marcadas.add(x);
      }
    }
  }
  return { operacoes, mudancas, semConferencia, pendentes, metricasMarcadas: [...marcadas], inicial, workflowsIgnorados: wf.reduce((s, w) => s + w.ignorados, 0), ausentes, folhasSemPapel };
}

const listaDe = (t: Esp['tabela']): string => {
  const e = ESP.find((x) => x.tabela === t)!;
  return [...e.chave, ...e.valores, ...(e.comMotivo === true ? ['motivo'] : [])].join(', ');
};

export async function carregarVigentes(db: Consultavel, quadros: readonly number[], S: Esquemas = esquemasDoAmbiente()): Promise<Vigentes> {
  const ids = quadros.map(String);
  const ler = async (t: Esp['tabela'], onde: string): Promise<Linha[]> =>
    (await db.query<Linha>(`SELECT ${listaDe(t)}, vigente_de, vigente_ate FROM ${S.bm}.${t} WHERE vigente_ate IS NULL${onde}`, onde === '' ? [] : [ids])).rows;
  return {
    ref_quadro: await ler('ref_quadro', ' AND quadro_id = ANY($1::text[])'),
    ref_workflow: await ler('ref_workflow', ' AND quadro_id = ANY($1::text[])'),
    ref_coluna: await ler('ref_coluna', ' AND quadro_id = ANY($1::text[])'),
    ref_tipo_card: await ler('ref_tipo_card', ''),
  };
}

export interface Resultado {
  inseridas: number; fechadas: number; mudancas: Mudanca[]; semConferencia: number; marca: boolean; workflowsIgnorados: number;
  ausentes: Ausentes; folhasSemPapel: number;
}

async function registrarVersao(
  db: Consultavel, S: Esquemas, v: { desde: string; descricao: string; motivo: string; referencia: string; metricas: readonly string[] }, agora: Date,
): Promise<void> {
  const existe = await db.query<{ versao_id: string }>(
    `SELECT versao_id FROM ${S.core}.ref_versao_criterio WHERE dominio = 'businessmap' AND referencia = $1 ORDER BY versao_id LIMIT 1`, [v.referencia]);
  let id = existe.rows[0]?.versao_id;
  if (id === undefined) {
    const r = await db.query<{ versao_id: string }>(
      `INSERT INTO ${S.core}.ref_versao_criterio (vigente_desde, dominio, descricao, motivo, referencia, registrado_em)
       VALUES ($1, 'businessmap', $2, $3, $4, $5) RETURNING versao_id`,
      [v.desde, v.descricao.slice(0, 300), v.motivo.slice(0, 500), v.referencia.slice(0, 200), agora]);
    id = r.rows[0]!.versao_id;
  }
  for (const m of v.metricas) {
    await db.query(
      `INSERT INTO ${S.core}.ref_versao_criterio_metrica (versao_id, metrica_id)
       SELECT $1::bigint, $2::varchar WHERE NOT EXISTS (SELECT 1 FROM ${S.core}.ref_versao_criterio_metrica WHERE versao_id = $1 AND metrica_id = $2)`,
      [id, m]);
  }
}

export interface OpcoesCarga extends OpcoesPlano { agora?: Date }

/**
 * Lê a vigente, planeja e grava (INSERT de vigência nova e UPDATE de `vigente_ate`, nada mais). Mudança de significado sem `motivo`
 * não grava nada (U-1: processo ou correção é decisão de quem opera, não inferência). Processo gera versão de critério com as métricas
 * afetadas (marca T2.6 na data); correção vale para todo o período (`vigenteEm`) e não marca. A conexão deve estar numa transação.
 */
export async function sincronizarReferencia(
  db: Consultavel, lida: ReferenciaLida, conf: Conferencia, o: OpcoesCarga, S: Esquemas = esquemasDoAmbiente(),
): Promise<Resultado> {
  const plano = planejar(lida, await carregarVigentes(db, lida.quadros, S), conf, o);
  if (plano.pendentes.length > 0) {
    throw new ErroReferencia('motivo', `${plano.pendentes.length} mudança(s) de significado sem motivo (processo ou correcao): ${plano.pendentes.slice(0, 100).map((m) => `${m.tabela} ${m.chave}`).join(', ')}`,
      // `tabela:chave`, a forma que `--motivo-chave=tabela:chave=processo|correcao` aceita (A1 do review da F3); chave de referência, nunca valor de pessoa
      plano.pendentes.slice(0, 100).map((m) => `${m.tabela}:${m.chave}`));
  }
  const agora = o.agora ?? new Date();
  const vc = conf.versao_criterio;
  if (plano.inicial) await registrarVersao(db, S, { desde: o.inicioCarga, ...vc, metricas: [] }, agora);
  let fechadas = 0;
  for (const op of plano.operacoes) {
    if (op.fechar !== undefined) {
      await db.query(
        `UPDATE ${S.bm}.${op.esp.tabela} SET vigente_ate = $1 WHERE vigente_ate IS NULL AND ${op.esp.chave.map((c, i) => `${c} = $${i + 2}`).join(' AND ')}`,
        [o.hoje, ...op.esp.chave.map((c) => op.fechar![c] as Valor)]);
      fechadas += 1;
    }
    const colunas = [...op.esp.chave, ...op.esp.valores, ...(op.esp.comMotivo === true ? ['motivo'] : [])];
    const valores = [...op.esp.chave, ...op.esp.valores].map((c) => op.linha[c] as Valor);
    if (op.esp.comMotivo === true) valores.push(op.motivo);
    await db.query(
      `INSERT INTO ${S.bm}.${op.esp.tabela} (${colunas.join(', ')}, vigente_de) VALUES (${[...colunas, 'vigente_de'].map((_, i) => `$${i + 1}`).join(', ')})`,
      [...valores, op.vigenteDe]);
  }
  const marca = plano.metricasMarcadas.length > 0;
  if (marca) {
    await registrarVersao(db, S, {
      desde: o.hoje, descricao: 'Referência do BusinessMap: mudança de processo no quadro (papel, tipo, nível ou limite de WIP)',
      motivo: 'Mudança de processo registrada pela carga da referência (plano 052, F2, U-1); cartões anteriores medidos como foram.',
      referencia: `plano-052-F2:processo:${o.hoje}`, metricas: plano.metricasMarcadas,
    }, agora);
  }
  return { inseridas: plano.operacoes.length, fechadas, mudancas: plano.mudancas, semConferencia: plano.semConferencia.length, marca, workflowsIgnorados: plano.workflowsIgnorados, ausentes: plano.ausentes, folhasSemPapel: plano.folhasSemPapel };
}

/** Contagem da folha sem conferência na coleta (papel `dspd_coletor`: `ctl_coleta_contagem`); só número, sem id de coluna nem nome. */
export async function registrarFolhasSemConferencia(db: Consultavel, coletaId: number, n: number, S: Esquemas = esquemasDoAmbiente()): Promise<void> {
  const r = await db.query(`UPDATE ${S.bm}.ctl_coleta_contagem SET lidos = $3 WHERE coleta_id = $1 AND entidade = $2`, [coletaId, ENTIDADE_SEM_CONFERENCIA, n]);
  if (r.rowCount) return;
  await db.query(
    `INSERT INTO ${S.bm}.ctl_coleta_contagem (coleta_id, entidade, lidos, inseridos, ja_existentes, falhas) VALUES ($1, $2, $3, 0, 0, 0)`,
    [coletaId, ENTIDADE_SEM_CONFERENCIA, n]);
}

/* ---------- resolução no instante (U-1 e U-2) ---------- */

interface Vigente { vigente_de: string; vigente_ate?: string | null; motivo?: string | null }

/**
 * Linha vigente no dia (AAAA-MM-DD) entre as versões de uma mesma chave. Versão com `motivo = 'correcao'` vale desde o início da
 * versão que corrige (U-1: correção vale para todo o período); `processo` e a de partida valem a partir da sua data ("como foi").
 */
export function vigenteEm<T extends Vigente>(versoes: readonly T[], dia: string): T | undefined {
  const ord = [...versoes].sort((a, b) => a.vigente_de.localeCompare(b.vigente_de));
  let inicio = '';
  let achada: T | undefined;
  ord.forEach((v, i) => {
    inicio = i > 0 && v.motivo === 'correcao' ? inicio : v.vigente_de;
    if (inicio <= dia) achada = v;
  });
  return achada;
}

export interface ReferenciaDoTempo {
  colunas: readonly (Vigente & { quadro_id: string; coluna_id: string; workflow_id: string | null })[];
  workflows: readonly (Vigente & { quadro_id: string; workflow_id: string; nivel: string })[];
  times: readonly (Vigente & { workflow_id: string; time_id: number | null; situacao: string })[];
}

/** U-2: workflow, nível e time de um evento pelo instante dele (o dia): a coluna diz o workflow, o workflow diz nível e time. */
export function contextoDoEvento(e: { quadro: string; coluna: string; dia: string }, ref: ReferenciaDoTempo) {
  const col = vigenteEm(ref.colunas.filter((c) => c.quadro_id === e.quadro && c.coluna_id === e.coluna), e.dia);
  const workflow = col?.workflow_id ?? null;
  const nivel = workflow === null ? undefined : vigenteEm(ref.workflows.filter((w) => w.quadro_id === e.quadro && w.workflow_id === workflow), e.dia)?.nivel;
  const time = workflow === null ? undefined : vigenteEm(ref.times.filter((t) => t.workflow_id === workflow), e.dia);
  return { workflow, nivel: nivel ?? null, time_id: time?.time_id ?? null, situacao: time?.situacao ?? null };
}

/** H-9, H-10 e H-23: as folhas cuja primeira entrada do card marca o compromisso ou a entrega, em ordem. */
export function folhasDoMarco(colunas: readonly Linha[], marco: 'compromisso' | 'entrega'): Linha[] {
  const folhas = colunas.filter((c) => c.eh_folha === true && c.eh_descarte !== true);
  const escolhidas =
    marco === 'entrega'
      ? folhas.filter((c) => c.papel === 'entrega') // H-23: sem folha na seção 4, a primeira entrada é na 5 (também entrega)
      : folhas.filter((c) => c.papel === 'compromisso' || (c.section === 3 && (c.papel === 'trabalho' || c.papel === 'homologacao'))); // H-23 por card: quem pula a seção 2 tem o marco na primeira entrada na seção 3
  return escolhidas.sort((a, b) => Number(a.ordem) - Number(b.ordem));
}
