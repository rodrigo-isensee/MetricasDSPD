import type { ReactNode } from 'react'
import { CabecalhoPainel, ErroPagina, ProvedorContextoPainel } from '@/components/ui'
import type { Dominio, FiltrosFluxo, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { useDataReferencia, useErroDePainelSimulado, useEstadoColeta, useModoMock } from '@/data'
import { FaixaCalibracaoFonte } from '@/features/coleta/CalibracaoDasFontes'
import { FrescorFonte } from '@/features/coleta/FrescorFonte'
import { SemDadosDaFonte } from '@/features/coleta/SemDadosDaFonte'
import { BotaoExportar } from '@/features/exportar'
import type { NivelExportacao } from '@/features/exportar/selecao'
import { BarraFiltros, useFiltros, type PainelId, type UseFiltros } from '@/features/filtros'
import {
  BotaoMetricas,
  FaixaOcultas,
  PainelOcultoVazio,
  ProvedorPainelPreferencias,
  usePreferencias,
} from '@/features/preferencias'

interface Base {
  titulo: string
  pergunta: string
  publico?: string
  slug: string
  /** Conteúdo entre o cabeçalho e a barra de filtros (ex.: seletor de visão). */
  extra?: ReactNode
  /** Nome da fonte dos filtros quando a página tem duas ("Filtros da Sustentação · Acelerato"). */
  legendaFiltros?: string
  /** Onde um valor inválido do link não existe ("na Sustentação"): o aviso cita a fonte. */
  ondeFiltros?: string
  /** Conteúdo logo abaixo da barra de filtros (ex.: a linha dos filtros guardados da outra fonte). */
  depoisDosFiltros?: ReactNode
}

type PainelFluxoId = Exclude<PainelId, 'sustentacao'>

/** Corpo do painel de UMA fonte: sem nenhuma coleta ok não há o que mostrar (CA-09); nas outras situações os dados anteriores continuam. */
export function CorpoDaFonte({ dominio, children }: { dominio: Dominio; children: ReactNode }) {
  const { data } = useEstadoColeta(dominio)
  return data?.ultimaOk === null ? <SemDadosDaFonte dominio={dominio} /> : children
}

function Casca({
  painelDoCorpo,
  uso,
  base,
  fonte,
  dominio,
  estrategico,
  children,
}: {
  /** Nível do botão "Exportar" (o mesmo id do painel). */
  painelDoCorpo: NivelExportacao
  /** Fonte que o painel usa: o selo dela aparece no cabeçalho (BusinessMap e Acelerato nunca se misturam). */
  dominio: Dominio
  uso: UseFiltros<FiltrosFluxo> | UseFiltros<FiltrosSustentacao>
  base: Base
  fonte: string
  estrategico?: boolean
  children: ReactNode
}) {
  const dataCorte = useDataReferencia()
  const erroSimulado = useErroDePainelSimulado()
  // Faixa de calibração e "Atualizado em" só existem depois do estado de coleta; o resto da tela espera num
  // bloco reservado para o conteúdo não descer quando a faixa entra (IR-001, CLS a 375 px).
  const pendenteBm = useEstadoColeta('businessmap').isPending
  const pendenteAc = useEstadoColeta('acelerato').isPending
  // `?mock=carregando` quer ver os esqueletos dos cartões (o estado de coleta também nunca resolve nele).
  // As preferências também são esperadas: o recorte certo aparece de primeira, sem piscar.
  const preferenciasProntas = usePreferencias().pronto
  const aguardando =
    useModoMock() !== 'carregando' &&
    ((dominio === 'businessmap' ? pendenteBm : pendenteAc) || !preferenciasProntas)
  // mock=erro (6.6): erro de painel, não de cartão. O shell continua; o painel não carrega.
  if (erroSimulado)
    return <ErroPagina erro="Erro simulado (mock=erro)" onTentarDeNovo={() => undefined} />
  return (
    <ProvedorContextoPainel
      filtrosAtivos={uso.chips}
      removerFiltro={uso.remover}
      limparFiltros={uso.limpar}
    >
      <ProvedorPainelPreferencias painel={painelDoCorpo}>
        <div className="flex flex-col gap-4">
          <CabecalhoPainel
            titulo={base.titulo}
            pergunta={base.pergunta}
            dataCorte={dataCorte}
            fonte={fonte}
            slug={base.slug}
            frescor={
              <div className="flex flex-col gap-1">
                <FrescorFonte dominio={dominio} />
              </div>
            }
            {...(base.publico ? { publico: base.publico } : {})}
          />
          {aguardando ? (
            <div className="min-h-screen" aria-hidden="true" data-testid="aguardando-coleta" />
          ) : (
            <>
              <FaixaCalibracaoFonte dominio={dominio} />
              {base.extra}
              <div className="flex flex-wrap items-center gap-2" data-testid="barra-metricas">
                <BotaoMetricas />
                <BotaoExportar base={painelDoCorpo} />
                <BotaoExportar base="personalizada" />
              </div>
              <BarraFiltros
                uso={uso}
                {...(estrategico ? { estrategico } : {})}
                {...(base.legendaFiltros ? { legenda: base.legendaFiltros } : {})}
                {...(base.ondeFiltros ? { onde: base.ondeFiltros } : {})}
              />
              {base.depoisDosFiltros}
              <FaixaOcultas />
              <PainelOcultoVazio />
              <CorpoDaFonte dominio={dominio}>{children}</CorpoDaFonte>
            </>
          )}
        </div>
      </ProvedorPainelPreferencias>
    </ProvedorContextoPainel>
  )
}

/**
 * Molde de painel do FLUXO (BusinessMap): cabeçalho, filtros na URL, contexto dos cartões
 * (filtros ativos, remover, limpar) e o conteúdo, que recebe os filtros já tipados.
 */
export function PainelFluxo({
  painel,
  children,
  ...base
}: Base & {
  painel: PainelFluxoId
  children: (filtros: FiltrosFluxo, uso: UseFiltros<FiltrosFluxo>) => ReactNode
}) {
  const uso = useFiltros(painel)
  return (
    <Casca
      painelDoCorpo={painel}
      uso={uso}
      base={base}
      fonte="BusinessMap"
      dominio="businessmap"
      estrategico={painel === 'estrategico'}
    >
      {children(uso.filtros, uso)}
    </Casca>
  )
}

/**
 * Molde da visão SUSTENTAÇÃO (Acelerato), com filtros próprios que nunca vêm do fluxo. `prefixo` (`sust_`) guarda os
 * filtros dela na mesma URL dos filtros do fluxo (a Sustentação é uma visão do Operacional).
 */
export function PainelSustentacao({
  children,
  prefixo,
  ...base
}: Base & {
  prefixo: string
  children: (filtros: FiltrosSustentacao, uso: UseFiltros<FiltrosSustentacao>) => ReactNode
}) {
  const uso = useFiltros('sustentacao', { prefixo })
  return (
    <Casca painelDoCorpo="sustentacao" uso={uso} base={base} fonte="Acelerato" dominio="acelerato">
      {children(uso.filtros, uso)}
    </Casca>
  )
}
