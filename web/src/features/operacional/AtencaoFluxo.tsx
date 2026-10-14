import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { FaixaAtencao, estadoFaixa } from '@/components/ui'
import { useMetrica } from '@/data'
import { itensDiaria, itensSemanal } from './atencao'

export const FONTE_FLUXO = 'Fluxo de projeto (BusinessMap)'

/** Faixa "Pede atenção hoje", montada dos DTOs que os cartões já carregam (mesma consulta, sem recálculo). */
export function AtencaoDiaria({ filtros }: { filtros: FiltrosFluxo }) {
  const qO2 = useMetrica('O2', filtros)
  const qBLOQUEADOS = useMetrica('BLOQUEADOS', filtros)
  const qO1 = useMetrica('O1', filtros)
  const { estado, recarregar } = estadoFaixa([qO2, qBLOQUEADOS, qO1])
  return (
    <FaixaAtencao
      momento="hoje"
      fonte={FONTE_FLUXO}
      itens={itensDiaria(qO2.dados, qBLOQUEADOS.dados, qO1.dados)}
      estado={estado}
      onTentarDeNovo={recarregar}
      reserva={{ mobile: 202, desktop: 88 }}
    />
  )
}

/** Faixa "Pede atenção na semana": P85 que subiu (O3), backlog parado há mais de 180 dias (O10) e vencidos por causa interna (O12). */
export function AtencaoSemanal({ filtros }: { filtros: FiltrosFluxo }) {
  const qO3 = useMetrica('O3', filtros)
  const qO10 = useMetrica('O10', filtros)
  const qO12 = useMetrica('O12', filtros)
  const { estado, recarregar } = estadoFaixa([qO3, qO10, qO12])
  return (
    <FaixaAtencao
      momento="semana"
      fonte={FONTE_FLUXO}
      itens={itensSemanal(qO3.dados, qO10.dados, qO12.dados)}
      estado={estado}
      onTentarDeNovo={recarregar}
    />
  )
}
