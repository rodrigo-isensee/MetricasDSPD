import { PainelSustentacao } from '@/features/painel/PainelPagina'
import { PlaceholderPainel } from '@/features/painel/PlaceholderPainel'

export default function SustentacaoPage() {
  return (
    <PainelSustentacao
      slug="sustentacao"
      titulo="Sustentação"
      pergunta="Estamos atendendo e restaurando dentro do combinado?"
      publico="Para o líder da sustentação · semanal e mensal."
    >
      {() => (
        <>
          <p
            className="rounded-md border border-borda bg-superficie p-3 text-sm"
            data-testid="recorte-sustentacao"
          >
            Chamados da organização DSPD Sustentação, tipo DSPD - SSSC, equipes SSSC TOTVS, SENIOR e
            FLUIG, excluídos os removidos. Tempos e aderência usam somente chamados fechados.
            Chamados com exceção de SLA por registro posterior ficam fora destas apurações.
          </p>
          <PlaceholderPainel painel="sustentacao" />
        </>
      )}
    </PainelSustentacao>
  )
}

export const handle = { titulo: 'Sustentação' }
