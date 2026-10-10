import { PainelFluxo } from '@/features/painel/PainelPagina'
import { PlaceholderPainel } from '@/features/painel/PlaceholderPainel'

export default function TaticoPage() {
  return (
    <PainelFluxo
      painel="tatico"
      slug="tatico"
      titulo="Tático"
      pergunta="O projeto está avançando de verdade, e no ritmo previsto?"
      publico="Para coordenadores · quinzenal e mensal."
    >
      {() => <PlaceholderPainel painel="tatico" />}
    </PainelFluxo>
  )
}

export const handle = { titulo: 'Tático' }
