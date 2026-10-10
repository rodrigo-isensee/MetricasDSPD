import { Link, useSearchParams } from 'react-router'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { FaixaAtencao, Secao, SeletorCadencia, type ItemAtencao } from '@/components/ui'
import { useMetrica } from '@/data'
import { useParametroLocal } from '@/features/filtros'
import { PainelFluxo } from '@/features/painel/PainelPagina'
import { fmtInteiro, plural } from '@/lib/formatar'
import { CartaoBloqueados } from './components/CartaoBloqueados'
import { CartaoO1 } from './components/CartaoO1'
import { CartaoO2 } from './components/CartaoO2'
import { CartaoO3 } from './components/CartaoO3'
import { CartaoO4 } from './components/CartaoO4'

const CADENCIAS = ['diaria', 'semanal'] as const
type Cadencia = (typeof CADENCIAS)[number]
const PERGUNTA: Record<Cadencia, string> = {
  diaria: 'Pergunta da daily: "Qual item mais velho não andou desde ontem?"',
  semanal: 'Pergunta: "O que mudou na nossa distribuição de tempo?"',
}

/** Itens da faixa "Pede atenção hoje", montados dos DTOs que os cartões já carregam (mesma consulta, sem recálculo). */
function AtencaoDiaria({ filtros }: { filtros: FiltrosFluxo }) {
  const o2 = useMetrica('O2', filtros).dados
  const bl = useMetrica('BLOQUEADOS', filtros).dados
  const o1 = useMetrica('O1', filtros).dados
  const itens: ItemAtencao[] = []
  if (o2 && o2.acimaP95 > 0)
    itens.push({
      id: 'o2',
      codigo: 'O2',
      para: '#o2',
      texto: `${fmtInteiro(o2.acimaP95)} ${plural(o2.acimaP95, 'item acima', 'itens acima')} do P95`,
    })
  if (bl && bl.itens.length > 0)
    itens.push({
      id: 'bloqueados',
      codigo: 'Bloqueados',
      para: '#bloqueados',
      texto: `${fmtInteiro(bl.itens.length)} ${plural(bl.itens.length, 'bloqueado', 'bloqueados')}`,
    })
  if (o1 && o1.hoje.acimaDoLimite > 0)
    itens.push({
      id: 'o1',
      codigo: 'O1',
      para: '#o1',
      texto: `WIP ${fmtInteiro(o1.hoje.acimaDoLimite)} acima do limite`,
    })
  return <FaixaAtencao momento="hoje" itens={itens} />
}

function Conteudo({ filtros, cadencia }: { filtros: FiltrosFluxo; cadencia: Cadencia }) {
  const [params] = useSearchParams()
  if (cadencia === 'diaria') {
    // O link nunca carrega o parâmetro oculto `mock` (6.6).
    const p = new URLSearchParams(params)
    p.delete('mock')
    p.set('cadencia', 'semanal')
    return (
      <>
        <AtencaoDiaria filtros={filtros} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <CartaoO2 filtros={filtros} />
          <CartaoBloqueados filtros={filtros} />
          <CartaoO1 filtros={filtros} />
        </div>
        <p className="text-sm">
          <Link
            to={{ search: p.toString().replaceAll('%2C', ',') }}
            className="alvo inline-flex items-center text-acento underline"
          >
            Ver também a visão semanal (tempo de ciclo, vazão, qualidade)
          </Link>
        </p>
      </>
    )
  }
  return (
    <>
      <Secao id="tempo" titulo="Tempo">
        <CartaoO3 filtros={filtros} />
      </Secao>
      <Secao id="fluxo" titulo="Fluxo">
        <CartaoO4 filtros={filtros} />
      </Secao>
    </>
  )
}

export default function OperacionalPage() {
  const [cadencia, setCadencia] = useParametroLocal('cadencia', CADENCIAS, 'diaria')
  return (
    <PainelFluxo
      painel="operacional"
      slug="operacional"
      titulo="Operacional"
      pergunta="O trabalho está fluindo?"
      publico="Para times · diária e semanal."
      extra={
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <SeletorCadencia
            valor={cadencia}
            onChange={setCadencia}
            opcoes={[
              { valor: 'diaria', rotulo: 'Diária' },
              { valor: 'semanal', rotulo: 'Semanal' },
            ]}
          />
          <p className="text-sm text-texto-2" data-testid="pergunta-cadencia">
            {PERGUNTA[cadencia]}
          </p>
        </div>
      }
    >
      {(filtros) => <Conteudo filtros={filtros} cadencia={cadencia} />}
    </PainelFluxo>
  )
}

export const handle = { titulo: 'Operacional' }
