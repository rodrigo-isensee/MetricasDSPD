import { PainelFluxo } from '@/features/painel/PainelPagina'
import { PlaceholderPainel } from '@/features/painel/PlaceholderPainel'

export default function EstrategicoPage() {
  return (
    <PainelFluxo
      painel="estrategico"
      slug="estrategico"
      titulo="Estratégico"
      pergunta="Estamos fazendo as apostas certas, e elas estão terminando?"
      publico="Para o gerente · mensal e trimestral."
    >
      {() => <PlaceholderPainel painel="estrategico" />}
    </PainelFluxo>
  )
}

export const handle = { titulo: 'Estratégico' }
