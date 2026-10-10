import { Secao } from '@/components/ui'
import { useFiltros } from '@/features/filtros'
import { PainelFluxo } from '@/features/painel/PainelPagina'
import { CartaoEIFL1, CartaoEIFL2, CartaoEIFL3, CartaoEISust } from './components/CartaoEI'

/** Bloco da Sustentação: filtros próprios (prefixo `sust_`), nunca os do fluxo (BusinessMap e Acelerato não se misturam). */
function BlocoSustentacao() {
  const { filtros } = useFiltros('sustentacao', { prefixo: 'sust_' })
  return (
    <Secao
      id="espera-sustentacao"
      titulo="Sustentação (Acelerato)"
      pergunta="Fonte diferente: horas úteis, por prioridade. Não é comparável com FL1 a FL3."
    >
      <CartaoEISust filtros={filtros} />
    </Secao>
  )
}

export default function EsperaInvisivelPage() {
  return (
    <PainelFluxo
      painel="espera-invisivel"
      slug="espera-invisivel"
      titulo="Espera invisível"
      pergunta="Quanto do tempo do solicitante acontece fora da nossa gestão?"
      publico="Para todos."
    >
      {(filtros) => (
        <>
          <Secao
            id="espera-fluxo"
            titulo="Fluxo (BusinessMap)"
            pergunta="Um nível por bloco, uma classe por vez, em dias úteis."
          >
            <CartaoEIFL1 filtros={filtros} />
            <CartaoEIFL2 filtros={filtros} />
            <CartaoEIFL3 filtros={filtros} />
          </Secao>
          <BlocoSustentacao />
        </>
      )}
    </PainelFluxo>
  )
}

export const handle = { titulo: 'Espera invisível' }
