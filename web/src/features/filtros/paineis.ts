import type { PeriodoPadrao } from '@metricas-dspd/contratos'

export type PainelId = 'operacional' | 'tatico' | 'estrategico' | 'espera-invisivel' | 'sustentacao'
export type DominioFiltros = 'fluxo' | 'sustentacao'
export type ChaveFiltro = 'equipe' | 'tipo' | 'sistema' | 'periodo' | 'prioridade'

export interface ConfigPainel {
  dominio: DominioFiltros
  /** Filtros exibidos neste painel (D3: só os que se aplicam). */
  filtros: readonly ChaveFiltro[]
  periodoPadrao: PeriodoPadrao
  /** Períodos oferecidos (spec 2.3): o Estratégico só aceita 6 e 12 meses. */
  periodos: readonly PeriodoPadrao[]
  /** "Personalizado" (De/Até) disponível neste painel. */
  personalizado: boolean
  /** Parâmetros de URL que o painel usa (spec 2.5). Os demais, se conhecidos, são removidos em silêncio (2.6.1). */
  params: readonly string[]
}

const PERIODOS_TODOS: readonly PeriodoPadrao[] = ['4s', '12s', '6m', '12m']
const BASE_FLUXO = ['equipe', 'tipo', 'sistema', 'periodo', 'de', 'ate'] as const

/** Padrões e filtros por painel (spec de UX 2.1 e 2.5). */
export const PAINEIS: Record<PainelId, ConfigPainel> = {
  operacional: {
    dominio: 'fluxo',
    filtros: ['equipe', 'tipo', 'sistema', 'periodo'],
    periodoPadrao: '12s',
    periodos: PERIODOS_TODOS,
    personalizado: true,
    params: [...BASE_FLUXO, 'cadencia', 'o2', 'o3', 'o7', 'o9', 'o10', 'ei_fl1'],
  },
  tatico: {
    dominio: 'fluxo',
    filtros: ['equipe', 'tipo', 'sistema', 'periodo'],
    periodoPadrao: '12s',
    periodos: PERIODOS_TODOS,
    personalizado: true,
    params: [...BASE_FLUXO, 't1', 't2', 't4', 't5', 'ei_fl2'],
  },
  estrategico: {
    dominio: 'fluxo',
    filtros: ['sistema', 'periodo'],
    periodoPadrao: '12m',
    periodos: ['6m', '12m'],
    personalizado: false,
    params: ['sistema', 'periodo', 'e1', 'ei_fl3'],
  },
  'espera-invisivel': {
    dominio: 'fluxo',
    filtros: ['equipe', 'tipo', 'sistema', 'periodo'],
    periodoPadrao: '12s',
    periodos: PERIODOS_TODOS,
    personalizado: true,
    params: [...BASE_FLUXO, 'ei_fl1', 'ei_fl2', 'ei_fl3', 'ei_sust'],
  },
  sustentacao: {
    dominio: 'sustentacao',
    filtros: ['equipe', 'prioridade', 'periodo'],
    periodoPadrao: '6m',
    periodos: PERIODOS_TODOS,
    personalizado: true,
    params: ['equipe', 'prioridade', 'periodo', 'de', 'ate', 's3', 's4', 's5', 's6', 'ei_sust'],
  },
}

export const ROTULO_FILTRO: Record<ChaveFiltro, string> = {
  equipe: 'Equipe',
  tipo: 'Tipo de demanda',
  sistema: 'Sistema',
  periodo: 'Período',
  prioridade: 'Prioridade',
}

export const ROTULO_PERIODO: Record<PeriodoPadrao | 'custom', string> = {
  '4s': 'Últimas 4 semanas',
  '12s': 'Últimas 12 semanas',
  '6m': 'Últimos 6 meses',
  '12m': 'Últimos 12 meses',
  custom: 'Personalizado',
}

/** Todos os parâmetros que o sistema conhece (spec 2.5): fora do painel que os usa, são "não aplicáveis". */
export const PARAMS_CONHECIDOS: readonly string[] = [
  ...new Set(Object.values(PAINEIS).flatMap((c) => c.params)),
]
