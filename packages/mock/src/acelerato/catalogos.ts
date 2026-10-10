import type { EquipeSustentacao, Prioridade } from '@metricas-dspd/contratos'
import type { Chamado } from '@metricas-dspd/metricas/acelerato'

export const EQUIPES_SUST: readonly (readonly [EquipeSustentacao, number])[] = [
  ['SSSC TOTVS', 50],
  ['SSSC SENIOR', 25],
  ['SSSC FLUIG', 25],
]

export const CATEGORIAS: Record<EquipeSustentacao, readonly string[]> = {
  'SSSC TOTVS': [
    'Protheus - Financeiro',
    'Protheus - Compras',
    'Protheus - Faturamento',
    'Protheus - Estoque',
  ],
  'SSSC SENIOR': ['Senior - Folha', 'Senior - Ponto', 'Senior - Benefícios'],
  'SSSC FLUIG': ['Fluig - Processos', 'Fluig - Documentos', 'Fluig - Portal'],
}

/** Pares (impacto, urgência) que produzem cada prioridade na matriz de 3.4. */
export const PARES_POR_PRIORIDADE: Record<
  Prioridade,
  readonly (readonly [Chamado['impacto'], Chamado['urgencia']])[]
> = {
  P1: [['Alto', 'Alta']],
  P2: [
    ['Alto', 'Média'],
    ['Médio', 'Alta'],
  ],
  P3: [
    ['Alto', 'Baixa'],
    ['Médio', 'Média'],
    ['Baixo', 'Alta'],
  ],
  P4: [
    ['Médio', 'Baixa'],
    ['Baixo', 'Média'],
  ],
  P5: [['Baixo', 'Baixa']],
}

/** Mediana do relógio de SLA (horas úteis), calibrada para aderência entre ~80% e ~90%. */
export const MEDIANA_PA: Record<Prioridade, number> = {
  P1: 0.1,
  P2: 0.2,
  P3: 0.8,
  P4: 1.6,
  P5: 3.2,
}
export const MEDIANA_R: Record<Prioridade, number> = { P1: 1.5, P2: 4.2, P3: 7.5, P4: 20, P5: 32 }
