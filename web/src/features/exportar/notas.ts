import type { MetricaId } from '@metricas-dspd/contratos'
import type { TextoNota } from '@/components/ui'
import { NOTAS_EI } from '@/features/espera-invisivel/notas'
import { NOTAS_ESTRATEGICO } from '@/features/estrategico/notas'
import { NOTAS_OPERACIONAL } from '@/features/operacional/notas'
import { NOTAS_SUSTENTACAO } from '@/features/sustentacao/notas'
import { NOTAS_TATICO } from '@/features/tatico/notas'

const EI = { EI_FL1: 'FL1', EI_FL2: 'FL2', EI_FL3: 'FL3', EI_SUST: 'SUST' } as const

/** A mesma nota metodológica que o cartão mostra (nenhum texto duplicado aqui). */
export function notaDaMetrica(id: MetricaId): TextoNota {
  if (id in EI) return NOTAS_EI[EI[id as keyof typeof EI]]
  const tabela: Record<string, TextoNota | undefined> = {
    ...NOTAS_OPERACIONAL,
    ...NOTAS_TATICO,
    ...NOTAS_ESTRATEGICO,
    ...NOTAS_SUSTENTACAO,
  }
  const nota = tabela[id]
  if (!nota) throw new Error(`Métrica sem nota metodológica: ${id}`)
  return nota
}
