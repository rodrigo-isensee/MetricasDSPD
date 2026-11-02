import {
  CATALOGO_CARTOES, METRICA_IDS, fonteDaMetrica, origemDaMetrica, type FiltrosFluxo, type FiltrosSustentacao, type MetricaId, type VersaoCriterio,
} from '@metricas-dspd/contratos';
import {
  acelerato, businessmap, calcularMetrica, CALENDARIO_PADRAO, dataIso, isoLocal, pesquisa, type ContextosMetricas, type ExtensoesMetricas,
} from '@metricas-dspd/metricas';
import type { BaseAC, ExtensaoAC } from '@metricas-dspd/metricas/acelerato';
import { EXTENSAO_BM_VAZIA, type ExtensaoTambemBM } from '@metricas-dspd/metricas/businessmap';
import { AppError } from '../../plataforma/erros.js';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { resolverTipoDasTransicoes } from '../businessmap/index.js';
import { lerVersoes, marcaDagua } from '../operacao/index.js';
import { dataCivil, lerEquipesBM, lerSistemasBM, lerTimesAtivos, lerVersaoCriterioVigente } from '../referencia/index.js';
import type { FontePesquisa } from './fonte-pesquisa.js';
import { extrasAC, montarBaseAC, montarBaseBM, type ExtrasAC, type RefBM } from './mapa.js';
import {
  lerAlocacao, lerAlvos, lerBloqueios, lerCards, lerChamados, lerColunas, lerColunasReais, lerDominio, lerEtapas, lerFichas, lerLimiteFrentes,
  lerLimitesWip, lerSle, lerTransicoes, lerVersoesColuna,
} from './repositorio.js';

export type FiltrosMetrica = FiltrosFluxo | FiltrosSustentacao | Record<string, never>;
export type Dom = 'businessmap' | 'acelerato';
export type OpcoesCalculo = { dataReferencia?: string };
export type Calculo = {
  resultado: unknown; dataReferencia: string; versaoCriterio: string; chave: string;
};

/** Releitura da marca d'água da coleta (versão de carga): a cada 60 s. */
export const TTL_VERSAO_MS = 60_000;
/** Limite de resultados guardados por chave de versão (descarta os mais antigos). */
export const MAX_RESULTADOS = 500;
/** Métricas que leem `config.alvos` (prazos por prioridade); sem a referência o cálculo não tem o que comparar. */
const METRICAS_COM_ALVOS: readonly MetricaId[] = ['S1', 'VISAO_GERAL'];
/** Métricas de SLA que não contam os chamados sem agente (D-9 do plano 056): a biblioteca recebe a base sem eles. */
const METRICAS_SEM_AGENTE: readonly MetricaId[] = ['S2', 'TENDENCIA_SUST'];
/** Por base carregada: a base sem os chamados sem agente (D-9) e a extensão do S8 (D-10). Só da fonte real; a base semeada tem tudo com agente. */
const EXTRAS_AC = new WeakMap<BaseAC, ExtrasAC>();
const BASE_AC_VAZIA: BaseAC = { chamados: [], etapas: [], config: { alvos: [], criterios: [] } };
const BASE_BM_VAZIA = { cards: [], transicoes: [], bloqueios: [], colunas: [], fichas: [], config: {
  limite_wip_fluxo: {}, limite_frentes: 0, sle: [], alocacao: [], objetivos: [], criterios: [], equipes: [], sistemas: [], areas_internas: [],
} };

type Marca = { versao: string; finalizadoEm: Date | null };
type Carga<B> = { versao: string; base: B; finalizadoEm: Date | null; inicio: string | null; sleDefinido?: boolean };
type Entrada<B> = { lidoEm: number; carga: Promise<Carga<B>> | null; atual: Carga<B> | null };

/** Fonte de dados da métrica: `fonteDaMetrica` é o ponto único (a PV1 é `pesquisa`, nunca BusinessMap nem Acelerato). */
const dominioDe = fonteDaMetrica;

/** Chave normalizada: listas ordenadas, ordem das propriedades fixa. */
export function normalizar(f: FiltrosMetrica): string {
  const o = f as Partial<FiltrosFluxo & FiltrosSustentacao>;
  const lista = (l: readonly string[] | undefined): string => [...new Set(l ?? [])].sort().join(',');
  return JSON.stringify([lista(o.equipe), lista(o.tipo), lista(o.sistema), lista(o.prioridade), o.periodo ?? null]);
}

/** Métricas complementares (catálogo de cartões): as únicas que leem as extensões (dados fictícios até a coleta real). */
const COMPLEMENTARES = new Set<MetricaId>(CATALOGO_CARTOES.filter((c) => c.grupo === 'complementar').flatMap((c) => c.metricas));

/** Métricas do pedido 011 que leem a extensão separada `ExtensaoTambemBM` (T11 da fase 1; O22, O26, T13, E6, E8 e T14 da fase 2). */
const COM_EXTENSAO_TAMBEM = new Set<MetricaId>(['T11', 'O22', 'O26', 'T13', 'E6', 'E8', 'T14']);

export type DepsServico = {
  db: Consultavel; S?: Esquemas; maxResultados?: number;
  /** Fonte das extensões das métricas complementares (hoje só o mock; vira tabelas em T1.3/T1.4/T4.2). Sem ela, o cálculo devolve vazio/insuficiente. */
  extensoes?: () => ExtensoesMetricas;
  /** Extensão do pedido 011 (T11 e as seis da fase 2), só de mock e lazy: chamada só quando uma dessas métricas é pedida. Sem ela, elas devolvem vazio ou insuficiente. */
  extensaoTambem?: () => ExtensaoTambemBM;
  /** Fonte da pesquisa de percepção (PV1): mock agora; no B4, as tabelas `pesq_*`. Sem ela, a PV1 devolve `sem-pesquisa`. */
  pesquisa?: FontePesquisa;
  /**
   * F6 do plano 052: schemas da base do SEED (mock). Definido = modo de duas bases: `S` é a base REAL e cada métrica vem inteira de uma só,
   * pela origem do contrato (`origemDaMetrica`): `real` lê `S`, `mock` lê estes schemas. Nunca as duas na mesma métrica. Sem isto, base única.
   */
  SMock?: Esquemas;
  /** Registro estruturado (só números e nomes de campo, nunca valor de card). */
  log?: (contexto: Record<string, unknown>, mensagem: string) => void;
};

/**
 * Serviço de métricas: lê as projeções do banco, monta `BaseBM`/`BaseAC` e calcula SÓ pela biblioteca
 * (`calcularMetrica`). A base fica em memória por versão de carga (marca d'água da coleta, relida a cada 60 s) e o
 * resultado é guardado por (métrica, filtros, dataReferencia, versão de carga, versão de critério).
 * Os dois domínios têm carga, versão e cache próprios; só a VISAO_GERAL usa os dois, e só dentro da biblioteca.
 */
export class ServicoMetricas {
  /** Uma carga por (domínio, base): `businessmap|real`, `businessmap|base`, `acelerato|base`... (`base` = a única ou a do seed). */
  private readonly cargas = new Map<string, Entrada<unknown>>();
  private readonly resultados = new Map<string, Map<string, unknown>>();
  private readonly criterios = new Map<string, string>();
  private criteriosEm = -Infinity;

  constructor(private readonly deps: DepsServico) {}

  /** Origem da métrica no modo de duas bases (F6, H-13): `true` = lê a base real. Na base única, nunca (a regra de sempre). */
  private ehReal(id: MetricaId): boolean {
    return this.deps.SMock !== undefined && origemDaMetrica(id) === 'real';
  }

  /** Schemas de onde a métrica lê: a base real (`S`) ou, no modo de duas bases, a do seed para as que seguem mock. */
  private esquemasDe(real: boolean): Esquemas | undefined {
    return this.deps.SMock !== undefined && !real ? this.deps.SMock : this.deps.S;
  }

  /** Versão de critério mais recente já vigente em `data`; relida junto com as marcas (60 s). */
  private async versaoCriterio(data: string, agora: number, real: boolean): Promise<string> {
    if (agora - this.criteriosEm >= TTL_VERSAO_MS) {
      this.criterios.clear();
      this.criteriosEm = agora;
    }
    const k = `${String(real)}|${data}`;
    const memo = this.criterios.get(k);
    if (memo !== undefined) return memo;
    const v = (await lerVersaoCriterioVigente(this.deps.db, data, this.esquemasDe(real))) ?? '0';
    this.criterios.set(k, v);
    return v;
  }

  /** Versão de carga: coleta + versão de critério mais recente (nova versão também invalida). Lida ANTES da leitura. */
  private async marca(dom: Dom, real: boolean): Promise<Marca> {
    const S = this.esquemasDe(real);
    const m = await marcaDagua(this.deps.db, dom, S);
    const v = await lerVersaoCriterioVigente(this.deps.db, '9999-12-31', S);
    return { versao: `${m?.coletaId ?? '0'}:${v ?? '0'}`, finalizadoEm: m?.finalizadoEm ?? null };
  }

  private async carregarBM({ versao, finalizadoEm }: Marca, real: boolean): Promise<Carga<ReturnType<typeof montarBaseBM>>> {
    const { db } = this.deps;
    const S = this.esquemasDe(real);
    const [cards, bloqueios] = [await lerCards(db, S), await lerBloqueios(db, S)];
    // Base real (A4 da E2.67): o tipo da coluna de cada transição é o da versão vigente no dia, resolvido aqui na leitura (o fato não é reescrito).
    const transicoes = real
      ? resolverTipoDasTransicoes(await lerTransicoes(db, S, { tipoResolvidoNaLeitura: true }), await lerVersoesColuna(db, S), new Map(cards.map((c) => [c.card_id, c.quadro_id ?? ''])))
      : await lerTransicoes(db, S);
    const colunas = real ? await lerColunasReais(db, S) : await lerColunas(db, S);
    const ref: RefBM = {
      equipes: real ? await lerTimesAtivos(db, S) : await lerEquipesBM(db, S), sistemas: (await lerSistemasBM(db, S)).map((x) => ({ codigo: x.id, rotulo: x.nome })), limitesWip: await lerLimitesWip(db, S),
      limiteFrentes: await lerLimiteFrentes(db, S), sle: await lerSle(db, S), alocacao: await lerAlocacao(db, S),
      objetivos: await lerDominio(db, 'objetivo_estrategico', S), areasInternas: await lerDominio(db, 'area_interna', S),
      fichas: await lerFichas(db, S), criterios: await lerVersoes(db, 'businessmap', S),
    };
    const base = montarBaseBM({ cards, transicoes, bloqueios, colunas, ref, real }, {
      aoDescartarTipo: (quantos) => this.deps.log?.({ cardsForaDoContrato: quantos }, 'cards com tipo fora de TIPOS_CARD ficaram fora do contexto'),
    });
    const primeiro = cards.reduce<number | null>((a, c) => (a === null || c.criado_em.getTime() < a ? c.criado_em.getTime() : a), null);
    return { versao, base, finalizadoEm, inicio: primeiro === null ? null : dataIso(primeiro, CALENDARIO_PADRAO), sleDefinido: ref.sle.length > 0 };
  }

  private async carregarAC({ versao, finalizadoEm }: Marca, real: boolean): Promise<Carga<BaseAC>> {
    const { db } = this.deps;
    const S = this.esquemasDe(real);
    const chamados = await lerChamados(db, S);
    const base = montarBaseAC({
      chamados, etapas: await lerEtapas(db, S), alvos: await lerAlvos(db, S), criterios: await lerVersoes(db, 'acelerato', S),
    });
    EXTRAS_AC.set(base, extrasAC(base, chamados));
    const primeiro = chamados.reduce<number | null>((a, c) => (a === null || (c.aberto_em as Date).getTime() < a ? (c.aberto_em as Date).getTime() : a), null);
    return { versao, base, finalizadoEm, inicio: primeiro === null ? null : dataIso(primeiro, CALENDARIO_PADRAO) };
  }

  /** Carga de um domínio: reaproveita a base enquanto a marca d'água não muda; recarrega e descarta o cache quando muda. */
  private async carga(dom: 'businessmap', agora: number, real: boolean): Promise<Carga<ReturnType<typeof montarBaseBM>>>;
  private async carga(dom: 'acelerato', agora: number, real: boolean): Promise<Carga<BaseAC>>;
  private async carga(dom: Dom, agora: number, real: boolean): Promise<Carga<unknown>> {
    const chave = `${dom}|${real ? 'real' : 'base'}`;
    const e = this.cargas.get(chave) ?? { lidoEm: -Infinity, carga: null, atual: null };
    this.cargas.set(chave, e);
    if (e.carga !== null) return e.carga;
    if (e.atual !== null && agora - e.lidoEm < TTL_VERSAO_MS) return e.atual;
    const pendente = (async (): Promise<Carga<unknown>> => {
      const marca = await this.marca(dom, real);
      if (e.atual !== null && e.atual.versao === marca.versao) return e.atual;
      this.resultados.delete(chave);
      this.resultados.delete('ambos');
      return dom === 'businessmap' ? this.carregarBM(marca, real) : this.carregarAC(marca, real);
    })();
    e.carga = pendente;
    try {
      e.atual = await pendente;
      e.lidoEm = agora;
      return e.atual;
    } finally {
      e.carga = null;
    }
  }

  /** PV1: fonte própria (carga, versão de critério e cache próprios); não lê BusinessMap nem Acelerato. Sem fonte configurada: `sem-pesquisa`. */
  private async calcularPesquisa(id: MetricaId, dataReferencia: string): Promise<Calculo> {
    const leitura = this.deps.pesquisa === undefined ? null : await this.deps.pesquisa.ler();
    const vigentes = (leitura?.base.criterios ?? []).filter((c) => c.data <= dataReferencia)
      .sort((x, y) => `${x.data}|${x.id}`.localeCompare(`${y.data}|${y.id}`));
    const versaoCriterio = vigentes.at(-1)?.id ?? '0';
    const chave = `${id}|${leitura?.versao ?? '0'}|${versaoCriterio}|${dataReferencia}`;
    let mapa = this.resultados.get('pesquisa');
    if (mapa === undefined) {
      mapa = new Map();
      this.resultados.set('pesquisa', mapa);
    }
    const pronto = mapa.get(chave);
    if (pronto !== undefined) return { resultado: pronto, dataReferencia, versaoCriterio, chave };
    const ctx: ContextosMetricas = {
      bm: businessmap.criarContextoBM(BASE_BM_VAZIA, dataReferencia, CALENDARIO_PADRAO),
      ac: acelerato.criarContextoAC(BASE_AC_VAZIA, dataReferencia, CALENDARIO_PADRAO),
      ...(leitura === null ? {} : { pesq: pesquisa.criarContextoPesquisa(leitura.base, dataReferencia) }),
    };
    const resultado = (calcularMetrica as (i: MetricaId, f: unknown, c: ContextosMetricas) => unknown)(id, {}, ctx);
    mapa.set(chave, resultado);
    if (mapa.size > (this.deps.maxResultados ?? MAX_RESULTADOS)) mapa.delete(mapa.keys().next().value as string);
    return { resultado, dataReferencia, versaoCriterio, chave };
  }

  /**
   * Aquecimento (SNO-005): carrega as duas bases em memória e roda uma vez cada métrica de fluxo e de sustentação (filtros
   * padrão), para que a primeira consulta depois de subir não pague a leitura do banco, a indexação nem a compilação a
   * quente do código. Chamado antes de a API aceitar requisições. Falha de uma métrica não impede a subida: a classe do erro (sem mensagem) volta
   * na lista e a consulta real o trata como sempre.
   */
  async aquecer(agoraDate: Date, filtrosPadrao: (id: MetricaId) => FiltrosMetrica): Promise<{ metricas: number; falhas: { id: MetricaId; erro: string }[] }> {
    const agora = agoraDate.getTime();
    // Cada métrica carrega a base da sua origem; o pré-aquecimento carrega as de todas, uma vez cada.
    const bases = new Set<string>();
    for (const id of METRICA_IDS) if (dominioDe(id) !== 'pesquisa') bases.add(`${this.ehReal(id) ? 'real' : 'base'}`);
    await Promise.all([...bases].flatMap((b) => [this.carga('businessmap', agora, b === 'real'), this.carga('acelerato', agora, b === 'real')]));
    const falhas: { id: MetricaId; erro: string }[] = [];
    let metricas = 0;
    for (const id of METRICA_IDS) {
      if (dominioDe(id) === 'pesquisa') continue;
      try {
        await this.calcular(id, filtrosPadrao(id), {}, agoraDate);
        metricas += 1;
      } catch (e) {
        falhas.push({ id, erro: (e as Error).constructor.name });
      }
    }
    return { metricas, falhas };
  }

  async calcular(id: MetricaId, filtros: FiltrosMetrica, op: OpcoesCalculo, agoraDate: Date): Promise<Calculo> {
    const agora = agoraDate.getTime();
    const dom = dominioDe(id);
    const hoje = dataCivil(agoraDate);
    if (op.dataReferencia !== undefined && op.dataReferencia > hoje) {
      throw new AppError('VALIDATION_ERROR', 'Parâmetros inválidos.', 400, [{ caminho: 'dataReferencia', mensagem: 'Data futura.' }]);
    }
    if (dom === 'pesquisa') return this.calcularPesquisa(id, op.dataReferencia ?? hoje);
    const real = this.ehReal(id);
    const bm = dom === 'acelerato' ? null : await this.carga('businessmap', agora, real);
    const ac = dom === 'businessmap' ? null : await this.carga('acelerato', agora, real);
    if (ac !== null && ac.base.config.alvos.length === 0 && METRICAS_COM_ALVOS.includes(id)) {
      throw new AppError('REFERENCIA_AUSENTE', 'Referência não carregada: alvos de prioridade (ref_alvo_prioridade).', 503);
    }
    // Data de corte (S-a): a informada (fim do dia) ou a da última coleta bem-sucedida; sem coleta, agora. Os dois domínios da
    // Visão geral usam o mesmo corte (o mais antigo dos dois: nenhum painel mostra dado além da própria coleta).
    const corteDe = (c: Carga<unknown> | null): string | null =>
      c === null ? null : op.dataReferencia !== undefined ? `${op.dataReferencia}T23:59:59-03:00` : isoLocal((c.finalizadoEm ?? agoraDate).getTime());
    const cortes = [corteDe(bm), corteDe(ac)].filter((x): x is string => x !== null).sort();
    const corte = cortes[0] as string;
    const dataReferencia = corte.slice(0, 10);
    const per = (filtros as Partial<FiltrosFluxo>).periodo;
    if (per?.tipo === 'custom') {
      const inicio = (bm ?? ac)?.inicio ?? dataReferencia;
      if (per.de > per.ate || per.de < inicio || per.ate > dataReferencia) {
        throw new AppError('PERIODO_FORA_DO_HISTORICO', 'Período fora do histórico.', 422, [{ caminho: 'periodo', mensagem: `Use datas entre ${inicio} e ${dataReferencia}, com de <= ate.` }]);
      }
    }
    const versaoCriterio = await this.versaoCriterio(dataReferencia, agora, real);
    const versoes = [bm?.versao, ac?.versao].filter((x): x is string => x !== undefined).join('|');
    const chave = `${id}|${versoes}|${versaoCriterio}|${dataReferencia}|${normalizar(filtros)}`;
    const cacheKey = dom === 'ambos' ? 'ambos' : `${dom}|${real ? 'real' : 'base'}`;
    let mapa = this.resultados.get(cacheKey);
    if (mapa === undefined) {
      mapa = new Map();
      this.resultados.set(cacheKey, mapa);
    }
    const pronto = mapa.get(chave);
    if (pronto !== undefined) return { resultado: pronto, dataReferencia, versaoCriterio, chave };
    const extras = ac === null ? undefined : EXTRAS_AC.get(ac.base);
    const baseAC = ac === null ? BASE_AC_VAZIA : METRICAS_SEM_AGENTE.includes(id) && extras !== undefined ? extras.semAgenteFora : ac.base;
    // S8 na fonte real (D-10): o campo dos 90 dias vira a extensão da biblioteca; no modo de duas bases a métrica real nunca recebe o mock;
    // com extensões mockadas e base única (fonte `mock`) vale o mock.
    const extReal: ExtensaoAC | undefined = id === 'S8' && (real || this.deps.extensoes === undefined) ? extras?.extensao : undefined;
    const ctx: ContextosMetricas = {
      bm: businessmap.criarContextoBM(bm?.base ?? BASE_BM_VAZIA, corte, CALENDARIO_PADRAO),
      ac: acelerato.criarContextoAC(baseAC, corte, CALENDARIO_PADRAO),
      ...(extReal !== undefined ? { ext: { bm: EXTENSAO_BM_VAZIA, ac: extReal } } : {}),
      ...(COMPLEMENTARES.has(id) && this.deps.extensoes && !real ? { ext: this.deps.extensoes() } : {}),
      ...(COM_EXTENSAO_TAMBEM.has(id) && this.deps.extensaoTambem && !real ? { tambem: this.deps.extensaoTambem() } : {}),
    };
    let resultado = (calcularMetrica as (i: MetricaId, f: unknown, c: ContextosMetricas) => unknown)(id, filtros, ctx);
    // H-24: o SLE do O3 vem da governança (Q-7c); sem ele na base real o O3 sai com os percentis e a nota "SLE não definido".
    if (id === 'O3' && real && (bm as NonNullable<typeof bm>).sleDefinido !== true) resultado = { ...(resultado as object), notas: ['sle-nao-definido'] };
    mapa.set(chave, resultado);
    if (mapa.size > (this.deps.maxResultados ?? MAX_RESULTADOS)) mapa.delete(mapa.keys().next().value as string);
    return { resultado, dataReferencia, versaoCriterio, chave };
  }
}

export type { VersaoCriterio };
