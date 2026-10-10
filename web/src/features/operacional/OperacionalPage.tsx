import { Secao } from '@/components/ui'
import { PainelFluxo } from '@/features/painel/PainelPagina'
import { PlaceholderPainel } from '@/features/painel/PlaceholderPainel'
import { CartaoO4 } from './components/CartaoO4'

export default function OperacionalPage() {
  return (
    <PainelFluxo
      painel="operacional"
      slug="operacional"
      titulo="Operacional"
      pergunta="O trabalho está fluindo?"
      publico="Para times · diária e semanal."
    >
      {(filtros) => (
        <>
          {/* Cartão de referência da fase A. A fase B o move para a seção "Fluxo" da cadência semanal (3.3). */}
          <Secao id="fluxo" titulo="Fluxo">
            <CartaoO4 filtros={filtros} />
          </Secao>
          <PlaceholderPainel painel="operacional" />
        </>
      )}
    </PainelFluxo>
  )
}

export const handle = { titulo: 'Operacional' }
