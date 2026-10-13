import {
  CATALOGO_CARTOES, fonteDaMetrica, type FiltrosFluxo, type FiltrosSustentacao, type MetricaId, type VersaoCriterio,
} from '@metricas-dspd/contratos';
import {
  acelerato, businessmap, calcularMetrica, CALENDARIO_PADRAO, dataIso, isoLocal, pesquisa, type ContextosMetricas, type ExtensoesMetricas,
} from '@metricas-dspd/metricas';
import type { BaseAC } from '@metricas-dspd/metricas/acelerato';
import { AppError } from '../../plataforma/erros.js';
import type { Esquemas } from '../../plataforma/db/esquemas.js';
import type { Consultavel } from '../../plataforma/db/pool.js';
import { lerVersoes, marcaDagua } from '../operacao/index.js';
import { dataCivil, lerEquipesBM, lerSistemasBM, lerVersaoCriterioVigente } from '../referencia/index.js';
import type { FontePesquisa } from './fonte-pesquisa.js';
import { montarBaseAC, montarBaseBM, type RefBM } from './mapa.js';
import {
  lerAlocacao, lerAlvos, lerBloqueios, lerCards, lerChamados, lerColunas, lerDominio, lerEtapas, lerFichas, lerLimiteFrentes,
  lerLimitesWip, lerSle, lerTransicoes,
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
const BASE_AC_VAZIA: BaseAC = { chamados: [], etapas: [], config: { alvos: [], criterios: [] } };
const BASE_BM_VAZIA = { cards: [], transicoes: [], bloqueios: [], colunas: [], fichas: [], config: {
  limite_wip_fluxo: {}, limite_frentes: 0, sle: [], alocacao: [], objetivos: [], criterios: [], equipes: [], sistemas: [], areas_internas: [],
} };

type Marca = { versao: string; finalizadoEm: Date | null };
type Carga<B> = { versao: string; base: B; finalizadoEm: Date | null; inicio: string | null };
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

export type DepsServico = {
  db: Consultavel; S?: Esquemas; maxResultados?: number;
  /** Fonte das extensões das métricas complementares (hoje só o mock; vira tabelas em T1.3/T1.4/T4.2). Sem ela, o cálculo devolve vazio/insuficiente. */
  extensoes?: () => ExtensoesMetricas;
  /** Fonte da pesquisa de percepção (PV1): mock agora; no B4, as tabelas `pesq_*`. Sem ela, a PV1 devolve `sem-pesquisa`. */
  pesquisa?: FontePesquisa;
};

/**
 * Serviço de métricas: lê as projeções do banco, monta `BaseBM`/`BaseAC` e calcula SÓ pela biblioteca
 * (`calcularMetrica`). A base fica em memória por versão de carga (marca d'água da coleta, relida a cada 60 s) e o
 * resultado é guardado por (métrica, filtros, dataReferencia, versão de carga, versão de critério).
 * Os dois domínios têm carga, versão e cache próprios; só a VISAO_GERAL usa os dois, e só dentro da biblioteca.
 */
export class ServicoMetricas {
  private readonly cargas: { businessmap: Entrada<ReturnType<typeof montarBaseBM>>; acelerato: Entrada<BaseAC> } = {
    businessmap: { lidoEm: -Infinity, carga: null, atual: null },
    acelerato: { lidoEm: -Infinity, carga: null, atual: null },
  };
  private readonly resultados = new Map<string, Map<string, unknown>>();
  private readonly criterios = new Map<string, string>();
  private criteriosEm = -Infinity;

  constructor(private readonly deps: DepsServico) {}

  /** Versão de critério mais recente já vigente em `data`; relida junto com as marcas (60 s). */
  private async versaoCriterio(data: string, agora: number): Promise<string> {
    if (agora - this.criteriosEm >= TTL_VERSAO_MS) {
      this.criterios.clear();
      this.criteriosEm = agora;
    }
    const memo = this.criterios.get(data);
    if (memo !== undefined) return memo;
    const v = (await lerVersaoCriterioVigente(this.deps.db, data, this.deps.S)) ?? '0';
    this.criterios.set(data, v);
    return v;
  }

  /** Versão de carga: coleta + versão de critério mais recente (nova versão também invalida). Lida ANTES da leitura. */
  private async marca(dom: Dom): Promise<Marca> {
    const m = await marcaDagua(this.deps.db, dom, this.deps.S);
    const v = await lerVersaoCriterioVigente(this.deps.db, '9999-12-31', this.deps.S);
    return { versao: `${m?.coletaId ?? '0'}:${v ?? '0'}`, finalizadoEm: m?.finalizadoEm ?? null };
  }

  private async carregarBM({ versao, finalizadoEm }: Marca): Promise<Carga<ReturnType<typeof montarBaseBM>>> {
    const { db, S } = this.deps;
    const [cards, transicoes, bloqueios, colunas] = [await lerCards(db, S), await lerTransicoes(db, S), await lerBloqueios(db, S), await lerColunas(db, S)];
    const ref: RefBM = {
      equipes: await lerEquipesBM(db, S), sistemas: (await lerSistemasBM(db, S)).map((x) => ({ codigo: x.id, rotulo: x.nome })), limitesWip: await lerLimitesWip(db, S),
      limiteFrentes: await lerLimiteFrentes(db, S), sle: await lerSle(db, S), alocacao: await lerAlocacao(db, S),
      objetivos: await lerDominio(db, 'objetivo_estrategico', S), areasInternas: await lerDominio(db, 'area_interna', S),
      fichas: await lerFichas(db, S), criterios: await lerVersoes(db, 'businessmap', S),
    };
    const base = montarBaseBM({ cards, transicoes, bloqueios, colunas, ref });
    const primeiro = cards.reduce<number | null>((a, c) => (a === null || c.criado_em.getTime() < a ? c.criado_em.getTime() : a), null);
    return { versao, base, finalizadoEm, inicio: primeiro === null ? null : dataIso(primeiro, CALENDARIO_PADRAO) };
  }

  private async carregarAC({ versao, finalizadoEm }: Marca): Promise<Carga<BaseAC>> {
    const { db, S } = this.deps;
    const chamados = await lerChamados(db, S);
    const base = montarBaseAC({
      chamados, etapas: await lerEtapas(db, S), alvos: await lerAlvos(db, S), criterios: await lerVersoes(db, 'acelerato', S),
    });
    const primeiro = chamados.reduce<number | null>((a, c) => (a === null || (c.aberto_em as Date).getTime() < a ? (c.aberto_em as Date).getTime() : a), null);
    return { versao, base, finalizadoEm, inicio: primeiro === null ? null : dataIso(primeiro, CALENDARIO_PADRAO) };
  }

  /** Carga de um domínio: reaproveita a base enquanto a marca d'água não muda; recarrega e descarta o cache quando muda. */
  private async carga(dom: 'businessmap', agora: number): Promise<Carga<ReturnType<typeof montarBaseBM>>>;
  private async carga(dom: 'acelerato', agora: number): Promise<Carga<BaseAC>>;
  private async carga(dom: Dom, agora: number): Promise<Carga<unknown>> {
    const e = this.cargas[dom] as Entrada<unknown>;
    if (e.carga !== null) return e.carga;
    if (e.atual !== null && agora - e.lidoEm < TTL_VERSAO_MS) return e.atual;
    const pendente = (async (): Promise<Carga<unknown>> => {
      const marca = await this.marca(dom);
      if (e.atual !== null && e.atual.versao === marca.versao) return e.atual;
      this.resultados.delete(dom);
      this.resultados.delete('ambos');
      return dom === 'businessmap' ? this.carregarBM(marca) : this.carregarAC(marca);
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

  async calcular(id: MetricaId, filtros: FiltrosMetrica, op: OpcoesCalculo, agoraDate: Date): Promise<Calculo> {
    const agora = agoraDate.getTime();
    const dom = dominioDe(id);
    const hoje = dataCivil(agoraDate);
    if (op.dataReferencia !== undefined && op.dataReferencia > hoje) {
      throw new AppError('VALIDATION_ERROR', 'Parâmetros inválidos.', 400, [{ caminho: 'dataReferencia', mensagem: 'Data futura.' }]);
    }
    if (dom === 'pesquisa') return this.calcularPesquisa(id, op.dataReferencia ?? hoje);
    const bm = dom === 'acelerato' ? null : await this.carga('businessmap', agora);
    const ac = dom === 'businessmap' ? null : await this.carga('acelerato', agora);
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
    const versaoCriterio = await this.versaoCriterio(dataReferencia, agora);
    const versoes = [bm?.versao, ac?.versao].filter((x): x is string => x !== undefined).join('|');
    const chave = `${id}|${versoes}|${versaoCriterio}|${dataReferencia}|${normalizar(filtros)}`;
    const cacheKey = dom === 'ambos' ? 'ambos' : dom;
    let mapa = this.resultados.get(cacheKey);
    if (mapa === undefined) {
      mapa = new Map();
      this.resultados.set(cacheKey, mapa);
    }
    const pronto = mapa.get(chave);
    if (pronto !== undefined) return { resultado: pronto, dataReferencia, versaoCriterio, chave };
    const ctx: ContextosMetricas = {
      bm: businessmap.criarContextoBM(bm?.base ?? BASE_BM_VAZIA, corte, CALENDARIO_PADRAO),
      ac: acelerato.criarContextoAC(ac?.base ?? BASE_AC_VAZIA, corte, CALENDARIO_PADRAO),
      ...(COMPLEMENTARES.has(id) && this.deps.extensoes ? { ext: this.deps.extensoes() } : {}),
    };
    const resultado = (calcularMetrica as (i: MetricaId, f: unknown, c: ContextosMetricas) => unknown)(id, filtros, ctx);
    mapa.set(chave, resultado);
    if (mapa.size > (this.deps.maxResultados ?? MAX_RESULTADOS)) mapa.delete(mapa.keys().next().value as string);
    return { resultado, dataReferencia, versaoCriterio, chave };
  }
}

export type { VersaoCriterio };
