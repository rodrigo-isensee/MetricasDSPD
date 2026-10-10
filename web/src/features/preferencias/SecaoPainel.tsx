import type { ReactNode } from 'react'
import { Botao, Secao } from '@/components/ui'
import { usePreferenciasPainel } from '@/components/ui'

/**
 * `Secao` que conhece o recorte: com todos os cartões dela ocultos mostra a orientação para voltar;
 * com o painel inteiro oculto some (o estado vazio é do painel). Sem `titulo`, é só o grupo de cartões.
 */
export function SecaoPainel({
  cartoes,
  titulo,
  children,
  ...resto
}: {
  cartoes: readonly string[]
  titulo?: string
  pergunta?: string
  id?: string
  children: ReactNode
}) {
  const p = usePreferenciasPainel()
  if (p?.tudoOculto) return null
  const vazia = !!p && cartoes.every((c) => p.estaOculto(c))
  const corpo = vazia ? (
    <div
      className="flex flex-wrap items-center gap-3 text-sm lg:col-span-12"
      data-testid="secao-oculta"
    >
      <p>Todas as métricas desta seção estão ocultas.</p>
      <Botao onClick={() => p.mostrarVarios(cartoes)}>
        {titulo ? 'Mostrar métricas da seção' : 'Mostrar métricas'}
      </Botao>
    </div>
  ) : (
    children
  )
  if (!titulo) return <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">{corpo}</div>
  return (
    <Secao titulo={titulo} {...resto}>
      {corpo}
    </Secao>
  )
}
