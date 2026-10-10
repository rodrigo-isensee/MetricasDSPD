import { useMemo, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import type { Dominio } from '@metricas-dspd/contratos'
import { FaixaCalibracao, ProvedorCalibracao } from '@/components/ui'
import { useEstadoColeta, useMetricasEmCalibracao } from '@/data'
import { dominiosDaRota, NOME_FONTE, ROTA_DADOS, SIGLA_FONTE } from './fontes'

/** Liga os cartões e as faixas "Pede atenção" ao estado de calibração das duas fontes (cada id pertence a uma só). */
export function CalibracaoDasFontes({ children }: { children: ReactNode }) {
  const bm = useMetricasEmCalibracao('businessmap')
  const ac = useMetricasEmCalibracao('acelerato')
  const metricas = useMemo(() => new Set<string>([...bm, ...ac]), [bm, ac])
  const estadoBm = useEstadoColeta('businessmap')
  const estadoAc = useEstadoColeta('acelerato')
  const pendenteBm = estadoBm.isPending
  const pendenteAc = estadoAc.isPending
  // `pronta` espera só as fontes que a rota usa (K-061, A4): a Sustentação não espera o BusinessMap.
  const usadas = dominiosDaRota(useLocation().pathname)
  const pendente =
    (usadas.includes('businessmap') && pendenteBm) || (usadas.includes('acelerato') && pendenteAc)
  // Leitura falhou numa fonte da rota: não dá para saber se está em calibração; oculta o status de meta.
  const falhou =
    (usadas.includes('businessmap') && estadoBm.isError) ||
    (usadas.includes('acelerato') && estadoAc.isError)
  return (
    <ProvedorCalibracao metricas={metricas} pronta={!pendente} statusOculto={falhou}>
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
