import { AmostraInsuficiente, Icone, NumeroGrande } from '@/components/ui'
import { fmtInteiro, fmtNumero } from '@/lib/formatar'
import { useDadosAba } from '../dados'
import { fmtHoras } from '../formatar'
import { ANOMALIA, CARTOES } from '../textos'
import type { RespostaApontamento } from '../types'
import { CartaoApontamento } from './CartaoApontamento'

function Kpis({ r }: { r: RespostaApontamento }) {
  const { kpis } = r
  const { completos } = kpis
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <NumeroGrande
          valor={fmtHoras(kpis.segundos)}
          rotulo="horas apontadas"
          textoCompleto={`Horas apontadas: ${fmtHoras(kpis.segundos)}`}
          data-testid="kpi-horas"
        />
        <NumeroGrande
          valor={fmtInteiro(kpis.apontamentos)}
          rotulo="apontamentos"
          textoCompleto={`Apontamentos: ${fmtInteiro(kpis.apontamentos)}`}
          data-testid="kpi-apontamentos"
        />
        <NumeroGrande
          valor={fmtInteiro(kpis.pessoasAtivas)}
          rotulo="pessoas que apontaram"
          textoCompleto={`Pessoas que apontaram no período: ${fmtInteiro(kpis.pessoasAtivas)}`}
          data-testid="kpi-pessoas"
        />
        {completos.status === 'ok' ? (
          <NumeroGrande
            valor={`${fmtNumero(completos.pct, 0)}%`}
            rotulo="apontamentos completos"
            textoCompleto={`Apontamentos completos: ${fmtNumero(completos.pct, 0)}%, ${fmtInteiro(completos.k)} de ${fmtInteiro(completos.n)}`}
            complemento={`${fmtInteiro(completos.k)} de ${fmtInteiro(completos.n)}`}
            data-testid="kpi-completos"
          />
        ) : (
          <NumeroGrande
            valor={`${fmtInteiro(completos.k)} de ${fmtInteiro(completos.n)}`}
            rotulo="apontamentos completos"
            textoCompleto={`Apontamentos completos: ${fmtInteiro(completos.k)} de ${fmtInteiro(completos.n)}; percentual não publicado`}
            data-testid="kpi-completos"
          />
        )}
        <NumeroGrande
          valor={fmtInteiro(kpis.atipicos)}
          rotulo={ANOMALIA.marca}
          textoCompleto={`${ANOMALIA.marca}: ${fmtInteiro(kpis.atipicos)} apontamentos`}
          complemento={
            kpis.atipicos > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Icone nome="alerta" className="size-3" /> marcados para conferência
              </span>
            ) : undefined
          }
          data-testid="kpi-atipicos"
        />
      </div>
      {completos.status === 'insuficiente' && (
        <AmostraInsuficiente n={completos.n} codigo="AP-KPIS" oQue="O percentual de completos" />
      )}
    </div>
  )
}

export function CartaoKpis() {
  const { resposta } = useDadosAba()
  const k = resposta?.kpis
  const leitura = k
    ? `${fmtHoras(k.segundos)} apontadas em ${fmtInteiro(k.apontamentos)} apontamentos por ${fmtInteiro(k.pessoasAtivas)} ${k.pessoasAtivas === 1 ? 'pessoa' : 'pessoas'}.`
    : undefined
  return (
    <CartaoApontamento
      codigo="AP-KPIS"
      titulo="KPIs"
      texto={CARTOES.kpis}
      leitura={leitura}
      base={k ? { n: k.apontamentos, unidade: 'apontamentos' } : undefined}
      baseInsuficiente={k?.completos.status === 'insuficiente'}
      semTabela
      className="lg:col-span-12"
    >
      {(r) => <Kpis r={r} />}
    </CartaoApontamento>
  )
}
