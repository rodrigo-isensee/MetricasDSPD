import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import type { FiltrosFluxo, FiltrosSustentacao, OpcoesFiltro } from '@/contracts/filtros'
import { PERIODOS_PADRAO, TIPO_ID } from '@/contracts/filtros'
import { useOpcoesFiltro } from '@/data'
import type { FiltroAtivo } from '@/components/ui'
import {
  escreverFluxo,
  escreverSustentacao,
  lerFluxo,
  lerSustentacao,
  paramsDeFluxo,
} from './codec'
import { useMemoriaAtual, useMemoriaFiltros } from './memoria'
import {
  PAINEIS,
  PARAMS_CONHECIDOS,
  ROTULO_FILTRO,
  ROTULO_PERIODO,
  type ChaveFiltro,
  type PainelId,
} from './paineis'
import { fmtData } from '@/lib/formatar'

export interface ChipFiltro extends FiltroAtivo {
  /** id do valor (para remover só aquele). */
  valorId: string | null
}

export interface UseFiltros<F> {
  /** Filtros efetivos do painel (os que não se aplicam ao painel vêm vazios). */
  filtros: F
  config: (typeof PAINEIS)[PainelId]
  opcoes: OpcoesFiltro | undefined
  /** Aplica na hora (sem botão "Aplicar"): cada chamada é uma entrada no histórico (Voltar desfaz). */
  definir: (parcial: Partial<F>, opcoes?: { replace?: boolean }) => void
  /** Remove um filtro (ou só um valor dele). Período volta ao padrão. */
  remover: (chave: string, valorId?: string) => void
  limpar: () => void
  foraDoPadrao: boolean
  chips: ChipFiltro[]
  /** Valores do link que não existem e foram ignorados (spec 2.6); a URL já foi corrigida. */
  invalidos: string[]
  dispensarInvalidos: () => void
  /** Rótulos dos filtros guardados na memória da sessão que este painel não usa (ex.: "Equipe" no Estratégico). */
  guardadosNaoAplicaveis: string[]
}

interface OpcaoHook {
  /** Prefixo dos parâmetros (ex.: "sust_"), para um painel com dois conjuntos de filtros. */
  prefixo?: string
}

interface EstadoNav {
  filtrosInvalidos?: string[]
}

function useBase(painel: PainelId, prefixo: string) {
  const config = PAINEIS[painel]
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: opcoes } = useOpcoesFiltro(config.dominio === 'fluxo' ? 'businessmap' : 'acelerato')
  return { config, params, setParams, navigate, location, opcoes: opcoes, prefixo }
}

const rotuloDe = (
  opcoes: OpcoesFiltro | undefined,
  chave: 'equipes' | 'sistemas' | 'tipos',
  id: string,
): string => {
  const lista = opcoes
    ? chave === 'sistemas' && opcoes.dominio === 'acelerato'
      ? []
      : chave === 'tipos' && opcoes.dominio === 'acelerato'
        ? []
        : ((opcoes as unknown as Record<string, { id: string; nome: string }[]>)[chave] ?? [])
    : []
  return lista.find((x) => x.id === id)?.nome ?? id
}

function chipsDe(
  filtros: FiltrosFluxo | FiltrosSustentacao,
  padrao: string,
  opcoes: OpcoesFiltro | undefined,
  visiveis: readonly ChaveFiltro[],
): ChipFiltro[] {
  const chips: ChipFiltro[] = []
  const f = filtros as FiltrosFluxo & FiltrosSustentacao
  if (visiveis.includes('equipe'))
    for (const id of f.equipe)
      chips.push({
        chave: 'equipe',
        rotulo: ROTULO_FILTRO.equipe,
        valor: rotuloDe(opcoes, 'equipes', id),
        valorId: id,
      })
  if (visiveis.includes('tipo'))
    for (const t of f.tipo)
      chips.push({ chave: 'tipo', rotulo: ROTULO_FILTRO.tipo, valor: t, valorId: TIPO_ID[t] })
  if (visiveis.includes('sistema'))
    for (const id of f.sistema)
      chips.push({
        chave: 'sistema',
        rotulo: ROTULO_FILTRO.sistema,
        valor: rotuloDe(opcoes, 'sistemas', id),
        valorId: id,
      })
  if (visiveis.includes('prioridade'))
    for (const p of f.prioridade)
      chips.push({
        chave: 'prioridade',
        rotulo: ROTULO_FILTRO.prioridade,
        valor: p,
        valorId: p.toLowerCase(),
      })
  if (f.periodo.tipo !== padrao) {
    chips.push({
      chave: 'periodo',
      rotulo: ROTULO_FILTRO.periodo,
      valor:
        f.periodo.tipo === 'custom'
          ? `${fmtData(f.periodo.de)} a ${fmtData(f.periodo.ate)}`
          : (ROTULO_PERIODO[f.periodo.tipo] ?? f.periodo.tipo),
      valorId: null,
    })
  }
  return chips
}

export function useFiltros(painel: 'sustentacao', o?: OpcaoHook): UseFiltros<FiltrosSustentacao>
export function useFiltros(
  painel: Exclude<PainelId, 'sustentacao'>,
  o?: OpcaoHook,
): UseFiltros<FiltrosFluxo>
/**
 * Único ponto de leitura e escrita dos filtros: a URL é a fonte da verdade. Valores inválidos
 * caem no padrão, a URL é corrigida com `replace` e o aviso (2.6) fica disponível em `invalidos`.
 * Fluxo e sustentação têm tipos distintos e nunca se herdam.
 */
export function useFiltros(
  painel: PainelId,
  o: OpcaoHook = {},
): UseFiltros<FiltrosFluxo> | UseFiltros<FiltrosSustentacao> {
  const prefixo = o.prefixo ?? ''
  const { config, params, setParams, navigate, location, opcoes } = useBase(painel, prefixo)
  const ehSust = config.dominio === 'sustentacao'
  const memoria = useMemoriaFiltros()
  const guardados = useMemoriaAtual()
  const restricao = useMemo(
    () => ({ periodos: config.periodos, personalizado: config.personalizado }),
    [config],
  )

  const leitura = useMemo(
    () =>
      ehSust
        ? lerSustentacao(params, opcoes, config.periodoPadrao, prefixo, restricao)
        : lerFluxo(params, opcoes, config.periodoPadrao, prefixo, restricao),
    [params, opcoes, config.periodoPadrao, ehSust, prefixo, restricao],
  )

  // Filtros que o painel não oferece (equipe e tipo no Estratégico) não entram nos cálculos.
  const efetivo = useMemo(() => {
    const f = leitura.filtros as FiltrosFluxo & FiltrosSustentacao
    if (ehSust) return f
    return {
      ...f,
      equipe: config.filtros.includes('equipe') ? f.equipe : [],
      tipo: config.filtros.includes('tipo') ? f.tipo : [],
    }
  }, [leitura, config, ehSust])

  const estado = (location.state ?? {}) as EstadoNav
  const invalidosEstado = estado.filtrosInvalidos ?? []

  // Memória de sessão (filtros de fluxo): URL -> memória. Presente na URL = guarda; ausente = apaga
  // só nos filtros que o painel oferece (a URL é a verdade ali). O período do Estratégico, restrito
  // a 6m/12m, não é apagado por ausência (o valor guardado pertence ao outro painel).
  const memorizaFluxo = !ehSust && prefixo === ''
  useEffect(() => {
    if (!memorizaFluxo || !opcoes) return
    const livre = lerFluxo(params, opcoes, config.periodoPadrao, '').filtros
    const txt = paramsDeFluxo(livre)
    const upd: Parameters<typeof memoria.atualizar>[0] = {}
    for (const k of ['equipe', 'tipo', 'sistema'] as const) {
      if (params.has(k)) upd[k] = txt[k]
      else if (config.filtros.includes(k)) upd[k] = null
    }
    if (params.has('periodo')) {
      upd.periodo = txt.periodo
      upd.de = txt.de
      upd.ate = txt.ate
    } else if (config.periodos.length === PAINEIS.operacional.periodos.length) {
      upd.periodo = null
      upd.de = null
      upd.ate = null
    }
    memoria.atualizar(upd)
  }, [memorizaFluxo, opcoes, params, config, memoria])

  // Normaliza a URL com `replace`: (1) valores inválidos caem no padrão, com aviso (2.6); (2) parâmetros
  // conhecidos que o painel não usa são removidos em silêncio (2.6.1).
  const normalizada = useMemo(() => {
    const temInvalidos = leitura.invalidos.length > 0 && !!opcoes
    let p = new URLSearchParams(params)
    if (temInvalidos)
      p = ehSust
        ? escreverSustentacao(
            params,
            leitura.filtros as FiltrosSustentacao,
            config.periodoPadrao,
            prefixo,
          )
        : escreverFluxo(params, leitura.filtros as FiltrosFluxo, config.periodoPadrao, prefixo)
    if (prefixo === '') {
      for (const k of PARAMS_CONHECIDOS) if (!config.params.includes(k)) p.delete(k)
      // Período válido, mas fora das opções do painel (periodo=4s no Estratégico): não aplicável.
      const ef = leitura.filtros.periodo
      const bruto = params.get('periodo')
      if (
        bruto &&
        ((PERIODOS_PADRAO as readonly string[]).includes(bruto) || bruto === 'custom') &&
        ef.tipo === config.periodoPadrao &&
        bruto !== config.periodoPadrao
      ) {
        p.delete('periodo')
        p.delete('de')
        p.delete('ate')
      }
    }
    if (p.toString() === params.toString()) return null
    return { p, invalidos: temInvalidos }
  }, [leitura, opcoes, params, ehSust, config, prefixo])
  const invalidosAgora = leitura.invalidos
  useEffect(() => {
    if (!normalizada) return
    void navigate(
      { pathname: location.pathname, search: normalizada.p.toString(), hash: location.hash },
      {
        replace: true,
        state: normalizada.invalidos
          ? ({ filtrosInvalidos: invalidosAgora } satisfies EstadoNav)
          : (location.state as EstadoNav | null),
      },
    )
  }, [normalizada, navigate, location.pathname, location.hash, location.state, invalidosAgora])

  const aplicar = useCallback(
    (novo: FiltrosFluxo | FiltrosSustentacao, replace: boolean) => {
      const p = ehSust
        ? escreverSustentacao(params, novo as FiltrosSustentacao, config.periodoPadrao, prefixo)
        : escreverFluxo(params, novo as FiltrosFluxo, config.periodoPadrao, prefixo)
      if (memorizaFluxo) {
        // Ação do usuário é autoridade: os filtros do painel atualizam a memória (período padrão = apaga).
        const f = novo as FiltrosFluxo
        const txt = paramsDeFluxo(f)
        const padraoP = f.periodo.tipo === config.periodoPadrao
        memoria.atualizar({
          ...(config.filtros.includes('equipe') ? { equipe: txt.equipe } : {}),
          ...(config.filtros.includes('tipo') ? { tipo: txt.tipo } : {}),
          ...(config.filtros.includes('sistema') ? { sistema: txt.sistema } : {}),
          periodo: padraoP ? null : txt.periodo,
          de: padraoP ? null : txt.de,
          ate: padraoP ? null : txt.ate,
        })
      }
      setParams(p, { replace })
    },
    [params, setParams, ehSust, config, prefixo, memorizaFluxo, memoria],
  )

  const base = leitura.filtros as FiltrosFluxo & FiltrosSustentacao
  const definir = useCallback(
    (parcial: Partial<FiltrosFluxo & FiltrosSustentacao>, op: { replace?: boolean } = {}) =>
      aplicar({ ...base, ...parcial }, op.replace ?? false),
    [aplicar, base],
  )
  const vazio = useCallback(
    (): FiltrosFluxo & FiltrosSustentacao => ({
      ...base,
      equipe: [],
      tipo: [],
      sistema: [],
      prioridade: [],
      periodo: { tipo: config.periodoPadrao },
    }),
    [base, config.periodoPadrao],
  )
  const remover = useCallback(
    (chave: string, valorId?: string) => {
      const f = { ...base } as FiltrosFluxo & FiltrosSustentacao
      if (chave === 'periodo') f.periodo = { tipo: config.periodoPadrao }
      else if (chave === 'tipo')
        f.tipo = valorId ? f.tipo.filter((t) => TIPO_ID[t] !== valorId && t !== valorId) : []
      else if (chave === 'prioridade')
        f.prioridade = valorId
          ? f.prioridade.filter((x) => x.toLowerCase() !== valorId.toLowerCase())
          : []
      else if (chave === 'equipe')
        f.equipe = (valorId ? f.equipe.filter((x) => x !== valorId) : []) as typeof f.equipe
      else if (chave === 'sistema')
        f.sistema = valorId ? f.sistema.filter((x) => x !== valorId) : []
      aplicar(f, false)
    },
    [base, aplicar, config.periodoPadrao],
  )
  const limpar = useCallback(() => aplicar(vazio(), false), [aplicar, vazio])
  const dispensarInvalidos = useCallback(
    () =>
      void navigate(
        { pathname: location.pathname, search: location.search, hash: location.hash },
        { replace: true, state: null },
      ),
    [navigate, location],
  )

  const chips = useMemo(
    () => chipsDe(efetivo, config.periodoPadrao, opcoes, config.filtros),
    [efetivo, config, opcoes],
  )

  return {
    filtros: efetivo,
    config,
    opcoes,
    definir,
    remover,
    limpar,
    foraDoPadrao: chips.length > 0,
    chips,
    invalidos: invalidosEstado,
    dispensarInvalidos,
    guardadosNaoAplicaveis: memorizaFluxo
      ? (['equipe', 'tipo'] as const)
          .filter((k) => !config.filtros.includes(k) && guardados[k])
          .map((k) => ROTULO_FILTRO[k])
      : [],
  }
}
