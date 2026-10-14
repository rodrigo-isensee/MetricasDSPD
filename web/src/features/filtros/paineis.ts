import type { FiltrosSustentacao, PeriodoPadrao } from '@metricas-dspd/contratos'
import { fmtData } from '@/lib/formatar'

export type PainelId = 'operacional' | 'tatico' | 'estrategico' | 'sustentacao'
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
    // Os parâmetros de cartão da Sustentação (`s3`...`ei_sust`) valem em `/operacional`: sem eles a Diária e a
    // Semanal os apagariam (2.6.1) e trocar de visão perderia o que foi escolhido. Os `sust_*` nunca são conhecidos.
    params: [
      ...BASE_FLUXO,
      'cadencia',
      'o2',
      'o3',
      'o7',
      'o9',
      'o10',
      'ei_fl1',
      's3',
      's4',
      's5',
      's6',
      'ei_sust',
    ],
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
  sustentacao: {
    dominio: 'sustentacao',
    filtros: ['equipe', 'prioridade', 'periodo'],
    periodoPadrao: '6m',
    periodos: PERIODOS_TODOS,
    personalizado: true,
    params: ['equipe', 'prioridade', 'periodo', 'de', 'ate', 's3', 's4', 's5', 's6', 'ei_sust'],
  },
}

/** Filtro de equipe da Sustentação: as equipes são outras (H2), então o rótulo diz de quem são. */
export const ROTULO_EQUIPE_SUSTENTACAO = 'Equipe de sustentação'

/** Rótulo de um filtro no domínio: só a equipe muda de nome na Sustentação. */
export const rotuloDoFiltro = (chave: ChaveFiltro, dominio: DominioFiltros): string =>
  chave === 'equipe' && dominio === 'sustentacao' ? ROTULO_EQUIPE_SUSTENTACAO : ROTULO_FILTRO[chave]

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

const TEXTO_PERIODO_CURTO: Record<PeriodoPadrao, string> = {
  '4s': '4 semanas',
  '12s': '12 semanas',
  '6m': '6 meses',
  '12m': '12 meses',
}

/** Período do filtro em texto corrido ("6 meses"; personalizado: "de a"), para escrever a janela de um alerta. */
export function textoPeriodoCurto(p: FiltrosSustentacao['periodo']): string {
  return p.tipo === 'custom' ? `${fmtData(p.de)} a ${fmtData(p.ate)}` : TEXTO_PERIODO_CURTO[p.tipo]
}
