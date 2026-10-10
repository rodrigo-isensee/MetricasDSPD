import { PRIORIDADES, TIPOS_FILTRO, type Prioridade } from '@metricas-dspd/contratos'
import {
  EQUIPES_SUSTENTACAO_ID,
  PERIODOS_PADRAO,
  TIPO_ID,
  type EquipeSustentacaoId,
  type FiltrosFluxo,
  type FiltrosSustentacao,
  type OpcoesFiltro,
  type PeriodoPadrao,
  type TipoFiltro,
} from '@metricas-dspd/contratos'
import { dataValida } from '@/lib/formatar'
import { validarPeriodoCustom } from './periodo'

/** URL é a fonte da verdade: este módulo converte URLSearchParams <-> filtros tipados (zod nos tipos do contrato). */

export interface Leitura<F> {
  filtros: F
  /** Valores desconhecidos que foram ignorados (spec 2.6), ex.: `equipe "xyz"`. */
  invalidos: string[]
}

type Opcoes = OpcoesFiltro | undefined

const lista = (params: URLSearchParams, chave: string): string[] =>
  (params.get(chave) ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

function lerLista<T extends string>(
  params: URLSearchParams,
  chave: string,
  validos: readonly T[] | null,
  rotulo: string,
  invalidos: string[],
): T[] {
  const bruto = lista(params, chave)
  const ok: T[] = []
  for (const v of bruto) {
    if (validos === null || (validos as readonly string[]).includes(v)) {
      if (!ok.includes(v as T)) ok.push(v as T)
    } else invalidos.push(`${rotulo} "${v}"`)
  }
  // selecionar todos equivale a "Todos" (URL omite o parâmetro)
  if (validos !== null && ok.length === validos.length) return []
  return ok
}

/** Períodos que o painel aceita (2.3). Um período válido, mas fora da lista, é "não aplicável": silêncio, vale o padrão. */
export interface RestricaoPeriodo {
  periodos: readonly PeriodoPadrao[]
  personalizado: boolean
}
const SEM_RESTRICAO: RestricaoPeriodo = { periodos: PERIODOS_PADRAO, personalizado: true }

function lerPeriodo(
  params: URLSearchParams,
  padrao: PeriodoPadrao,
  opcoes: Opcoes,
  invalidos: string[],
  restricao: RestricaoPeriodo,
): FiltrosFluxo['periodo'] {
  const bruto = params.get('periodo')
  if (!bruto) return { tipo: padrao }
  if ((PERIODOS_PADRAO as readonly string[]).includes(bruto))
    return restricao.periodos.includes(bruto as PeriodoPadrao)
      ? { tipo: bruto as PeriodoPadrao }
      : { tipo: padrao }
  if (bruto === 'custom') {
    const de = params.get('de') ?? ''
    const ate = params.get('ate') ?? ''
    const historico = opcoes?.historico
    const erro = historico
      ? validarPeriodoCustom(de, ate, historico)
      : dataValida(de) && dataValida(ate) && de < ate
        ? null
        : 'inválido'
    if (!erro) return restricao.personalizado ? { tipo: 'custom', de, ate } : { tipo: padrao }
    invalidos.push('período personalizado')
    return { tipo: padrao }
  }
  invalidos.push(`período "${bruto}"`)
  return { tipo: padrao }
}

const idsDe = (o: Opcoes, campo: 'equipes' | 'sistemas'): string[] | null => {
  if (!o) return null
  if (campo === 'sistemas') return o.dominio === 'businessmap' ? o.sistemas.map((x) => x.id) : null
  return o.equipes.map((x) => x.id)
}

export function lerFluxo(
  params: URLSearchParams,
  opcoes: Opcoes,
  padrao: PeriodoPadrao,
  prefixo = '',
  restricao: RestricaoPeriodo = SEM_RESTRICAO,
): Leitura<FiltrosFluxo> {
  const p = prefixar(params, prefixo)
  const invalidos: string[] = []
  return {
    filtros: {
      equipe: lerLista(p, 'equipe', idsDe(opcoes, 'equipes'), 'equipe', invalidos),
      tipo: lerLista(
        p,
        'tipo',
        TIPOS_FILTRO.map((t) => TIPO_ID[t]),
        'tipo',
        invalidos,
      ).map((id) => idParaTipo(id)),
      sistema: lerLista(p, 'sistema', idsDe(opcoes, 'sistemas'), 'sistema', invalidos),
      periodo: lerPeriodo(p, padrao, opcoes, invalidos, restricao),
    },
    invalidos,
  }
}

export function lerSustentacao(
  params: URLSearchParams,
  opcoes: Opcoes,
  padrao: PeriodoPadrao,
  prefixo = '',
  restricao: RestricaoPeriodo = SEM_RESTRICAO,
): Leitura<FiltrosSustentacao> {
  const p = prefixar(params, prefixo)
  const invalidos: string[] = []
  return {
    filtros: {
      equipe: lerLista<EquipeSustentacaoId>(
        p,
        'equipe',
        EQUIPES_SUSTENTACAO_ID,
        'equipe',
        invalidos,
      ),
      prioridade: lerLista(
        p,
        'prioridade',
        PRIORIDADES.map((x) => x.toLowerCase()),
        'prioridade',
        invalidos,
      ).map((x) => x.toUpperCase() as Prioridade),
      periodo: lerPeriodo(p, padrao, opcoes, invalidos, restricao),
    },
    invalidos,
  }
}

function idParaTipo(id: string): TipoFiltro {
  const t = TIPOS_FILTRO.find((x) => TIPO_ID[x] === id)
  if (!t) throw new Error(`tipo inválido: ${id}`)
  return t
}

/** Visão dos parâmetros com prefixo removido (usado quando um painel tem dois conjuntos de filtros). */
function prefixar(params: URLSearchParams, prefixo: string): URLSearchParams {
  if (!prefixo) return params
  const out = new URLSearchParams()
  for (const [k, v] of params) if (k.startsWith(prefixo)) out.set(k.slice(prefixo.length), v)
  return out
}

function gravar(
  params: URLSearchParams,
  prefixo: string,
  chave: string,
  valor: string | null,
): void {
  if (valor === null || valor === '') params.delete(prefixo + chave)
  else params.set(prefixo + chave, valor)
}

function gravarPeriodo(
  params: URLSearchParams,
  prefixo: string,
  periodo: FiltrosFluxo['periodo'],
  padrao: PeriodoPadrao,
): void {
  if (periodo.tipo === padrao) {
    gravar(params, prefixo, 'periodo', null)
    gravar(params, prefixo, 'de', null)
    gravar(params, prefixo, 'ate', null)
  } else if (periodo.tipo === 'custom') {
    gravar(params, prefixo, 'periodo', 'custom')
    gravar(params, prefixo, 'de', periodo.de)
    gravar(params, prefixo, 'ate', periodo.ate)
  } else {
    gravar(params, prefixo, 'periodo', periodo.tipo)
    gravar(params, prefixo, 'de', null)
    gravar(params, prefixo, 'ate', null)
  }
}

/** Escreve só os valores fora do padrão. Devolve novos parâmetros, preservando os demais (cadência, mock...). */
export function escreverFluxo(
  base: URLSearchParams,
  f: FiltrosFluxo,
  padrao: PeriodoPadrao,
  prefixo = '',
): URLSearchParams {
  const p = new URLSearchParams(base)
  gravar(p, prefixo, 'equipe', f.equipe.join(',') || null)
  gravar(p, prefixo, 'tipo', f.tipo.map((t) => TIPO_ID[t]).join(',') || null)
  gravar(p, prefixo, 'sistema', f.sistema.join(',') || null)
  gravarPeriodo(p, prefixo, f.periodo, padrao)
  return p
}

export function escreverSustentacao(
  base: URLSearchParams,
  f: FiltrosSustentacao,
  padrao: PeriodoPadrao,
  prefixo = '',
): URLSearchParams {
  const p = new URLSearchParams(base)
  gravar(p, prefixo, 'equipe', f.equipe.join(',') || null)
  gravar(p, prefixo, 'prioridade', f.prioridade.map((x) => x.toLowerCase()).join(',') || null)
  gravarPeriodo(p, prefixo, f.periodo, padrao)
  return p
}

/** Texto de URL de cada filtro de fluxo (para a memória de sessão e para os links). */
export function paramsDeFluxo(
  f: FiltrosFluxo,
): Record<'equipe' | 'tipo' | 'sistema' | 'periodo' | 'de' | 'ate', string | null> {
  return {
    equipe: f.equipe.join(',') || null,
    tipo: f.tipo.map((t) => TIPO_ID[t]).join(',') || null,
    sistema: f.sistema.join(',') || null,
    periodo: f.periodo.tipo,
    de: f.periodo.tipo === 'custom' ? f.periodo.de : null,
    ate: f.periodo.tipo === 'custom' ? f.periodo.ate : null,
  }
}

/** Texto de busca da URL com vírgulas legíveis (`equipe=a,b`): `URLSearchParams` codifica a vírgula como %2C. */
export function textoBusca(p: URLSearchParams): string {
  return p.toString().replaceAll('%2C', ',')
}

/** Marcar todos os valores de um filtro equivale ao padrão ("Todos"): a lista vira vazia (FIL-04). */
export function colapsarTodos<F extends FiltrosFluxo | FiltrosSustentacao>(
  f: F,
  opcoes: Opcoes,
  sustentacao: boolean,
): F {
  const todos = (sel: readonly string[], validos: readonly string[] | null): boolean =>
    validos !== null && validos.length > 0 && validos.every((v) => sel.includes(v))
  const r = { ...f } as FiltrosFluxo & FiltrosSustentacao
  if (todos(r.equipe, sustentacao ? EQUIPES_SUSTENTACAO_ID : idsDe(opcoes, 'equipes')))
    r.equipe = []
  if (sustentacao) {
    if (todos(r.prioridade, PRIORIDADES)) r.prioridade = []
  } else {
    if (todos(r.tipo, TIPOS_FILTRO)) r.tipo = []
    if (todos(r.sistema, idsDe(opcoes, 'sistemas'))) r.sistema = []
  }
  return r as F
}
