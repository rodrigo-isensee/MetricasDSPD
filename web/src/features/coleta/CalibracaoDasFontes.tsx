import { useMemo, type ReactNode } from 'react'
import type { Dominio } from '@metricas-dspd/contratos'
import { FaixaCalibracao, ProvedorCalibracao } from '@/components/ui'
import { useEstadoColeta, useMetricasEmCalibracao } from '@/data'
import { NOME_FONTE, ROTA_DADOS, SIGLA_FONTE } from './fontes'

/** Liga os cartões e as faixas "Pede atenção" ao estado de calibração das duas fontes (cada id pertence a uma só). */
export function CalibracaoDasFontes({ children }: { children: ReactNode }) {
  const bm = useMetricasEmCalibracao('businessmap')
  const ac = useMetricasEmCalibracao('acelerato')
  const metricas = useMemo(() => new Set<string>([...bm, ...ac]), [bm, ac])
  const pendenteBm = useEstadoColeta('businessmap').isPending
  const pendenteAc = useEstadoColeta('acelerato').isPending
  const pendente = pendenteBm || pendenteAc
  return (
    <ProvedorCalibracao metricas={metricas} pronta={!pendente}>
      {children}
    </ProvedorCalibracao>
  )
}

/** Faixa de calibração de UMA fonte; some quando não há janela vigente. */
export function FaixaCalibracaoFonte({ dominio }: { dominio: Dominio }) {
  const { data } = useEstadoColeta(dominio)
  if (!data || data.calibracao.length === 0) return null
  return (
    <FaixaCalibracao
      fonte={NOME_FONTE[dominio]}
      janelas={data.calibracao}
      saibaMais={`${ROTA_DADOS}?fonte=${SIGLA_FONTE[dominio]}#calibracao`}
      testid={`faixa-calibracao-${dominio}`}
    />
  )
}
