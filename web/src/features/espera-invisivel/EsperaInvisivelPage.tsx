import { PainelFluxo } from '@/features/painel/PainelPagina'
import { PlaceholderPainel } from '@/features/painel/PlaceholderPainel'

export default function EsperaInvisivelPage() {
  return (
    <PainelFluxo
      painel="espera-invisivel"
      slug="espera-invisivel"
      titulo="Espera invisível"
      pergunta="Quanto do tempo do solicitante acontece fora da nossa gestão?"
      publico="Para todos."
    >
      {() => <PlaceholderPainel painel="espera-invisivel" />}
    </PainelFluxo>
  )
}

export const handle = { titulo: 'Espera invisível' }
