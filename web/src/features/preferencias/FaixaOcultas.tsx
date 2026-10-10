import { AvisosCriterioOcultas } from './AvisosCriterioOcultas'
import { Botao, Icone } from '@/components/ui'
import { usePreferenciasPainel } from '@/components/ui'

/** Faixa sempre visível com N>0: quantas e quais métricas estão ocultas, e como voltar (CA-6). */
export function FaixaOcultas() {
  const p = usePreferenciasPainel()
  if (!p || p.ocultos.size === 0) return null
  const ids = p.cartoes.filter((c) => p.ocultos.has(c.id)).map((c) => c.codigo)
  return (
    <>
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-borda bg-superficie-2 p-3 text-sm"
        data-testid="faixa-ocultas"
      >
        <Icone nome="info" />
        <span>
          {p.ocultos.size} {p.ocultos.size === 1 ? 'métrica oculta' : 'métricas ocultas'}:{' '}
          {ids.join(', ')}
        </span>
        <Botao onClick={p.mostrarTodas}>Mostrar todas</Botao>
        <Botao onClick={p.usarMinhas}>Usar minhas preferências</Botao>
      </div>
      <AvisosCriterioOcultas p={p} />
    </>
  )
}
