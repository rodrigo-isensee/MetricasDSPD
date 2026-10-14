import type { ReactNode } from 'react'
import { useId } from 'react'
import {
  JANELA_PERCENTIS_PADRAO,
  type Dominio,
  type PainelComCartoes,
} from '@metricas-dspd/contratos'
import { useEstadoColeta, useModoMock } from '@/data'
import { FaixaCalibracaoFonte } from '@/features/coleta/CalibracaoDasFontes'
import { NOME_FONTE } from '@/features/coleta/fontes'
import { CorpoDaFonte } from '@/features/painel/PainelPagina'
import { ProvedorPainelPreferencias, usePreferencias } from '@/features/preferencias'
import { fmtData, textoJanela } from '@/lib/formatar'
import { dataDoInstante } from './consultas'

/**
 * Um bloco do Resumo: UMA fonte, com título, selo de fonte, frescor próprio e a mesma estrutura (alertas, números,
 * tendência, links). `SemDadosDaFonte` e a calibração valem só para a fonte do bloco; os blocos nunca se misturam.
 */
export function BlocoResumo({
  id,
  titulo,
  dominio,
  painel,
  reserva,
  children,
}: {
  /** `resumo-fluxo` ou `resumo-sustentacao`: âncora do bloco. */
  id: string
  titulo: string
  dominio: Dominio
  /** Conjunto de preferências dos cartões de origem (a chave gravada continua `operacional` / `sustentacao`). */
  painel: PainelComCartoes
  /** Altura reservada enquanto espera o estado de coleta e as preferências (sem salto de layout). */
  reserva: number
  children: ReactNode
}) {
  const idTitulo = useId()
  const coleta = useEstadoColeta(dominio)
  const prefsProntas = usePreferencias().pronto
  const aguardando = useModoMock() !== 'carregando' && (coleta.isPending || !prefsProntas)
  const ate = coleta.data?.ultimaOk ? fmtData(dataDoInstante(coleta.data.ultimaOk.fim)) : null
  return (
    <section
      id={id}
      aria-labelledby={idTitulo}
      className="flex flex-col gap-4 rounded-lg border border-borda bg-superficie p-4"
      data-testid={id}
    >
      <header className="flex flex-col gap-1">
        <h2 id={idTitulo} className="text-lg font-bold">
          {titulo}
        </h2>
        <p className="text-sm text-texto-2" data-testid={`${id}-fonte`}>
          Fonte: {NOME_FONTE[dominio]}
          {ate ? ` · Dados até ${ate}` : ''} · {textoJanela(JANELA_PERCENTIS_PADRAO)}
        </p>
      </header>
      {aguardando ? (
        <div aria-hidden="true" style={{ minHeight: reserva }} data-testid={`${id}-aguardando`} />
      ) : (
        <ProvedorPainelPreferencias painel={painel}>
          <FaixaCalibracaoFonte dominio={dominio} />
          <CorpoDaFonte dominio={dominio}>{children}</CorpoDaFonte>
        </ProvedorPainelPreferencias>
      )}
    </section>
  )
}
