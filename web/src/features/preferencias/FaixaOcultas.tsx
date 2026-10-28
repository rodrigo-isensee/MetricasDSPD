import { AvisosCriterioOcultas } from './AvisosCriterioOcultas'
import { Botao, Icone } from '@/components/ui'
import { usePreferenciasPainel } from '@/components/ui'

/**
 * Faixa de uma linha, sempre visível com N>0: quantas e quais métricas estão ocultas e "Mostrar todas" (CA-6).
 * "Usar minhas preferências" fica no botão "Métricas" (P2: topo enxuto).
 */
export function FaixaOcultas() {
  const p = usePreferenciasPainel()
  if (!p || p.ocultos.size === 0) return null
  const c = p.chegada ? p.cartoes.find((x) => x.id === p.chegada) : undefined
  const ids = p.cartoes.filter((c) => p.ocultos.has(c.id)).map((c) => c.codigo)
  return (
    <>
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-borda bg-superficie-2 px-3 py-1 text-sm"
        data-testid="faixa-ocultas"
      >
        <Icone nome="info" />
        <span>
          {p.ocultos.size} {p.ocultos.size === 1 ? 'métrica oculta' : 'métricas ocultas'}:{' '}
          {ids.join(', ')}
        </span>
        <Botao onClick={p.mostrarTodas}>Mostrar todas</Botao>
      </div>
      {/* Chegou por link a uma oculta sem marcador na tela: explica e deixa a um clique (não falha em silêncio). */}
      {c && !p.comMarcador.has(c.id) && (
        <p className="flex flex-wrap items-center gap-2 text-sm" data-testid="chegada-sem-marcador">
          Você chegou a uma métrica oculta: {c.rotulo} ({c.codigo}).
          <Botao onClick={() => p.mostrar(c.id)}>Mostrar {c.codigo}</Botao>
        </p>
      )}
      <AvisosCriterioOcultas p={p} />
    </>
  )
}
