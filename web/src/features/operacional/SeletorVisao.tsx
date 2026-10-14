import { useEffect, useRef, type RefObject } from 'react'
import { SeletorCadencia } from '@/components/ui'
import { ROTULO_VISAO, VISOES, type Visao } from '@/features/navegacao/visao'

/** Pré-carga do chunk da visão Sustentação: o seletor a chama na intenção (ponteiro ou foco), antes do clique. */
export const carregarSustentacao = () => import('@/features/sustentacao/VisaoSustentacao')

/**
 * A escolha deve manter o foco no rádio (7.2). Trocar de visão pode trocar o molde da página (Resumo, fluxo e
 * Sustentação são moldes diferentes) e remontar o seletor: o foco pedido espera a visão mudar e volta ao rádio.
 */
export function SeletorVisao({
  visao,
  onEscolher,
  focoPendenteRef,
}: {
  visao: Visao
  onEscolher: (v: Visao) => void
  /** Vive na página (que não remonta ao trocar de visão), não no módulo: nada vaza entre montagens. */
  focoPendenteRef: RefObject<boolean>
}) {
  const raiz = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!focoPendenteRef.current) return
    focoPendenteRef.current = false
    raiz.current?.querySelector<HTMLInputElement>('input:checked')?.focus()
  }, [visao, focoPendenteRef])
  return (
    <div ref={raiz}>
      <SeletorCadencia
        rotulo="Visão"
        valor={visao}
        onChange={(v) => {
          focoPendenteRef.current = true
          onEscolher(v)
        }}
        onIntencao={(v) => {
          if (v === 'sustentacao') void carregarSustentacao()
        }}
        opcoes={VISOES.map((v) => ({ valor: v, rotulo: ROTULO_VISAO[v] }))}
      />
    </div>
  )
}

/** Anúncio ao trocar a visão: a fonte de cada uma, sempre dita (a fonte nunca é só cor). */
export const ANUNCIO_DA_VISAO: Record<Visao, string> = {
  resumo: 'Visão Resumo. Fontes: BusinessMap e Acelerato, em blocos separados.',
  diaria: 'Visão Diária. Fonte: BusinessMap.',
  semanal: 'Visão Semanal. Fonte: BusinessMap.',
  sustentacao: 'Visão Sustentação. Fonte: Acelerato.',
}
