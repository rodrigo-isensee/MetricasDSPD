import { useSearchParams } from 'react-router'
import { Icone } from '@/components/ui'
import { plural } from '@/lib/formatar'
import { contarAtivos } from './contarAtivos'

const ativos = (n: number) => `${n} ${plural(n, 'ativo', 'ativos')}`

/**
 * Status (sem botão) dos filtros do conjunto que a visão atual não usa: continuam guardados na URL para as
 * outras visões. `visao`: onde a pessoa está. Nunca mistura as fontes e nunca altera a URL.
 */
export function LinhaFiltrosGuardados({ visao }: { visao: 'resumo' | 'fluxo' | 'sustentacao' }) {
  const [params] = useSearchParams()
  const fluxo = contarAtivos(params, 'fluxo')
  const sust = contarAtivos(params, 'sustentacao', 'sust_')
  let texto: string | null = null
  if (visao === 'resumo') {
    const partes = [
      fluxo > 0 ? `fluxo de projeto: ${ativos(fluxo)}` : null,
      sust > 0 ? `Sustentação: ${ativos(sust)}` : null,
    ].filter(Boolean)
    if (partes.length > 0)
      texto = `Os filtros guardados (${partes.join(' · ')}) não se aplicam ao Resumo.`
  } else if (visao === 'sustentacao') {
    if (fluxo > 0)
      texto = `Os filtros do fluxo de projeto (${ativos(fluxo)}) continuam guardados para as visões Diária e Semanal.`
  } else if (sust > 0) {
    texto = `Os filtros da Sustentação (${ativos(sust)}) continuam guardados para a visão Sustentação.`
  }
  if (!texto) return null
  return (
    <p className="flex items-center gap-2 text-sm text-texto-2" data-testid="filtros-guardados">
      <Icone nome="info" className="size-4" />
      {texto}
    </p>
  )
}
