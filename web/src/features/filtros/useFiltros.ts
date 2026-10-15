import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import type { FiltrosFluxo, FiltrosSustentacao, OpcoesFiltro } from '@metricas-dspd/contratos'
import { PERIODOS_PADRAO, TIPO_ID } from '@metricas-dspd/contratos'
import { useOpcoesFiltro } from '@/data'
import type { FiltroAtivo } from '@/components/ui'
import {
  escreverFluxo,
  colapsarTodos,
  escreverSustentacao,
  lerFluxo,
  lerSustentacao,
  paramsDeFluxo,
  textoBusca,
} from './codec'
import { buscaVigente, registrarBusca } from './buscaPendente'
import { useMemoriaAtual, useMemoriaFiltros } from './memoria'
import {
  PAINEIS,
  PARAMS_CONHECIDOS,
  ROTULO_FILTRO,
  ROTULO_PERIODO,
  rotuloDoFiltro,
  type ChaveFiltro,
  type DominioFiltros,
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
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: opcoes } = useOpcoesFiltro(config.dominio === 'fluxo' ? 'businessmap' : 'acelerato')
  return { config, params, navigate, location, opcoes: opcoes, prefixo }
}

/** Nome pelo id; sem opções carregadas (ou id desconhecido), mostra o próprio id. */
const rotuloDe = (lista: readonly { id: string; nome: string }[] | undefined, id: string): string =>
  lista?.find((x) => x.id === id)?.nome ?? id

function chipsDe(
  filtros: FiltrosFluxo | FiltrosSustentacao,
  padrao: string,
  opcoes: OpcoesFiltro | undefined,
  visiveis: readonly ChaveFiltro[],
  dominio: DominioFiltros,
): ChipFiltro[] {
  const chips: ChipFiltro[] = []
  const sistemas = opcoes?.dominio === 'businessmap' ? opcoes.sistemas : undefined
  const f = filtros as FiltrosFluxo & FiltrosSustentacao
  if (visiveis.includes('equipe'))
    for (const id of f.equipe)
      chips.push({
        chave: 'equipe',
        rotulo: rotuloDoFiltro('equipe', dominio),
        valor: rotuloDe(opcoes?.equipes, id),
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
        valor: rotuloDe(sistemas, id),
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
          : ROTULO_PERIODO[f.periodo.tipo],
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
  const { config, params, navigate, location, opcoes } = useBase(painel, prefixo)
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
    // URL canônica (2.5): só valores fora do padrão, em minúsculas, sem repetição e sem "todas as
    // opções" (IF-006). Só com as opções carregadas, que é quando se sabe o que é "todas".
    if (temInvalidos || opcoes)
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
      // `custom` inválido não é "não aplicável": o aviso de ignorado vem da validação (IF-005).
      const personalizadoValido =
        bruto !== 'custom' || !leitura.invalidos.includes('período personalizado')
      if (
        bruto &&
        personalizadoValido &&
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
      { pathname: location.pathname, search: textoBusca(normalizada.p), hash: location.hash },
      {
        replace: true,
        state: normalizada.invalidos
          ? ({ filtrosInvalidos: invalidosAgora } satisfies EstadoNav)
          : (location.state as EstadoNav | null),
      },
    )
  }, [normalizada, navigate, location.pathname, location.hash, location.state, invalidosAgora])

  // Parâmetros "de agora": incluem a última navegação que o router ainda não renderizou, para que
  // uma ação rápida parta do estado que o usuário acabou de montar (IF-001, IS-003).
  const paramsVigentes = useCallback(
    () => new URLSearchParams(buscaVigente(location.pathname, location.search)),
    [location.pathname, location.search],
  )
  const lerAgora = useCallback(
    () =>
      (ehSust
        ? lerSustentacao(paramsVigentes(), opcoes, config.periodoPadrao, prefixo, restricao)
        : lerFluxo(paramsVigentes(), opcoes, config.periodoPadrao, prefixo, restricao)
      ).filtros as FiltrosFluxo & FiltrosSustentacao,
    [paramsVigentes, opcoes, config.periodoPadrao, ehSust, prefixo, restricao],
  )

  const aplicar = useCallback(
    (bruto: FiltrosFluxo | FiltrosSustentacao, replace: boolean) => {
      const novo = colapsarTodos(bruto, opcoes, ehSust)
      const p = ehSust
        ? escreverSustentacao(
            paramsVigentes(),
            novo as FiltrosSustentacao,
            config.periodoPadrao,
            prefixo,
          )
        : escreverFluxo(paramsVigentes(), novo as FiltrosFluxo, config.periodoPadrao, prefixo)
      if (memorizaFluxo) {
        // Ação do usuário é autoridade: os filtros do painel atualizam a memória (período padrão = apaga).
        const f = novo as FiltrosFluxo
        const txt = paramsDeFluxo(f)
        const padraoP = f.periodo.tipo === config.periodoPadrao
        memoria.atualizar({
          ...(config.filtros.includes('equipe') ? { equipe: txt.equipe } : {}),
          ...(config.filtros.includes('tipo') ? { tipo: txt.tipo } : {}),
          sistema: txt.sistema,
          periodo: padraoP ? null : txt.periodo,
          de: padraoP ? null : txt.de,
          ate: padraoP ? null : txt.ate,
        })
      }
      const search = textoBusca(p)
      registrarBusca(location.pathname, search ? `?${search}` : '')
      void navigate({ pathname: location.pathname, search, hash: location.hash }, { replace })
    },
    [
      paramsVigentes,
      navigate,
      location.pathname,
      location.hash,
      opcoes,
      ehSust,
      config,
      prefixo,
      memorizaFluxo,
      memoria,
    ],
  )

  const definir = useCallback(
    (parcial: Partial<FiltrosFluxo & FiltrosSustentacao>, op: { replace?: boolean } = {}) =>
      aplicar({ ...lerAgora(), ...parcial }, op.replace ?? false),
    [aplicar, lerAgora],
  )
  const vazio = useCallback(
    (): FiltrosFluxo & FiltrosSustentacao => ({
      ...lerAgora(),
      equipe: [],
      tipo: [],
      sistema: [],
      prioridade: [],
      periodo: { tipo: config.periodoPadrao },
    }),
    [lerAgora, config.periodoPadrao],
  )
  const remover = useCallback(
    (chave: string, valorId?: string) => {
      const f = { ...lerAgora() }
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
    [lerAgora, aplicar, config.periodoPadrao],
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
    () => chipsDe(efetivo, config.periodoPadrao, opcoes, config.filtros, config.dominio),
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
