import { Secao } from '@/components/ui'
import { PainelSustentacao } from '@/features/painel/PainelPagina'
import { CartaoS1 } from './components/CartaoS1'
import { CartaoS2 } from './components/CartaoS2'
import { CartaoS3 } from './components/CartaoS3'
import { CartaoS4 } from './components/CartaoS4'
import { CartaoS5 } from './components/CartaoS5'
import { CartaoS6 } from './components/CartaoS6'
import { CartaoS7 } from './components/CartaoS7'

export default function SustentacaoPage() {
  return (
    <PainelSustentacao
      slug="sustentacao"
      titulo="Sustentação"
      pergunta="Estamos atendendo e restaurando dentro do combinado?"
      publico="Para o líder da sustentação · semanal e mensal."
    >
      {(filtros) => (
        <>
          <p
            className="rounded-md border border-borda bg-superficie p-3 text-sm"
            data-testid="recorte-sustentacao"
          >
            Chamados da organização DSPD Sustentação, tipo DSPD - SSSC, equipes SSSC TOTVS, SENIOR e
            FLUIG, excluídos os removidos. Tempos e aderência usam somente chamados fechados.
            Chamados com exceção de SLA por registro posterior ficam fora destas apurações.
          </p>
          <Secao id="prazos" titulo="Prazos" pergunta="Cumprimos o combinado, em cada prioridade?">
            <CartaoS2 filtros={filtros} />
            <CartaoS1 filtros={filtros} />
          </Secao>
          <Secao
            id="volume"
            titulo="Volume e resolução"
            pergunta="Quanto chega e onde é resolvido?"
          >
            <CartaoS3 filtros={filtros} />
            <CartaoS4 filtros={filtros} />
          </Secao>
          <Secao id="causas" titulo="Escalação, encerramento e reclassificação">
            <CartaoS5 filtros={filtros} />
            <CartaoS6 filtros={filtros} />
            <CartaoS7 filtros={filtros} />
          </Secao>
        </>
      )}
    </PainelSustentacao>
  )
}

export const handle = { titulo: 'Sustentação' }
