import { FaixaAtencao, estadoFaixa, Secao, type ItemAtencao } from '@/components/ui'
import { useMetrica } from '@/data'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { PainelSustentacao } from '@/features/painel/PainelPagina'
import { CartaoEISust } from '@/features/espera-invisivel/components/CartaoEI'
import { CartaoS1 } from './components/CartaoS1'
import { CartaoS2 } from './components/CartaoS2'
import { CartaoS3 } from './components/CartaoS3'
import { CartaoS4 } from './components/CartaoS4'
import { CartaoS5 } from './components/CartaoS5'
import { CartaoS6 } from './components/CartaoS6'
import { CartaoS7 } from './components/CartaoS7'

/** "Pede atenção na semana": S2 abaixo de 90% e S1 com mediana acima do alvo, por prioridade (SUS-01). */
function Atencao({ filtros }: { filtros: FiltrosSustentacao }) {
  const qS2 = useMetrica('S2', filtros)
  const s2 = qS2.dados
  const qS1 = useMetrica('S1', filtros)
  const s1 = qS1.dados
  const itens: ItemAtencao[] = []
  const fora2 =
    s2?.prioridades.filter(
      (p) => p.primeiroAtendimento.statusMeta === 'fora' || p.restauracao.statusMeta === 'fora',
    ).length ?? 0
  if (fora2)
    itens.push({
      id: 's2',
      texto: `Aderência ao SLA abaixo de 90% em ${fora2} ${fora2 === 1 ? 'prioridade' : 'prioridades'}`,
      para: '#s2',
    })
  const fora1 = s1?.prioridades.filter((p) => p.restauracao.statusMeta === 'fora').length ?? 0
  if (fora1)
    itens.push({
      id: 's1',
      texto: `Mediana acima do alvo em ${fora1} ${fora1 === 1 ? 'prioridade' : 'prioridades'}`,
      para: '#s1',
    })
  const { estado, recarregar } = estadoFaixa([qS2, qS1])
  return <FaixaAtencao momento="semana" itens={itens} estado={estado} onTentarDeNovo={recarregar} />
}

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
          <Atencao filtros={filtros} />
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
          <Secao id="espera" titulo="Espera invisível do nível">
            <CartaoEISust filtros={filtros} variante="compacto" />
          </Secao>
        </>
      )}
    </PainelSustentacao>
  )
}

export const handle = { titulo: 'Sustentação' }
