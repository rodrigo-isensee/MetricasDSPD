import type { ReactNode } from 'react'
import { CabecalhoPainel, ErroPagina, ProvedorContextoPainel } from '@/components/ui'
import type { FiltrosFluxo, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { useDataReferencia, useErroDePainelSimulado } from '@/data'
import { BarraFiltros, useFiltros, type PainelId, type UseFiltros } from '@/features/filtros'

interface Base {
  titulo: string
  pergunta: string
  publico?: string
  slug: string
  /** Conteúdo entre o cabeçalho e a barra de filtros (ex.: seletor de cadência). */
  extra?: ReactNode
}

type PainelFluxoId = Exclude<PainelId, 'sustentacao'>

function Casca<F>({
  uso,
  base,
  fonte,
  estrategico,
  children,
}: {
  uso: UseFiltros<F>
  base: Base
  fonte: string
  estrategico?: boolean
  children: ReactNode
}) {
  const dataCorte = useDataReferencia()
  const erroSimulado = useErroDePainelSimulado()
  // mock=erro (6.6): erro de painel, não de cartão. O shell continua; o painel não carrega.
  if (erroSimulado)
    return <ErroPagina erro="Erro simulado (mock=erro)" onTentarDeNovo={() => undefined} />
  return (
    <ProvedorContextoPainel
      filtrosAtivos={uso.chips}
      removerFiltro={uso.remover}
      limparFiltros={uso.limpar}
    >
      <div className="flex flex-col gap-4">
        <CabecalhoPainel
          titulo={base.titulo}
          pergunta={base.pergunta}
          dataCorte={dataCorte}
          fonte={fonte}
          slug={base.slug}
          {...(base.publico ? { publico: base.publico } : {})}
        />
        {base.extra}
        <BarraFiltros
          uso={uso as unknown as Parameters<typeof BarraFiltros>[0]['uso']}
          {...(estrategico ? { estrategico } : {})}
        />
        {children}
      </div>
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
    <Casca uso={uso} base={base} fonte="BusinessMap" estrategico={painel === 'estrategico'}>
      {children(uso.filtros, uso)}
    </Casca>
  )
}

/** Molde do painel de SUSTENTAÇÃO (Acelerato), com filtros próprios que nunca vêm do fluxo. */
export function PainelSustentacao({
  children,
  ...base
}: Base & {
  children: (filtros: FiltrosSustentacao, uso: UseFiltros<FiltrosSustentacao>) => ReactNode
}) {
  const uso = useFiltros('sustentacao')
  return (
    <Casca uso={uso} base={base} fonte="Acelerato">
      {children(uso.filtros, uso)}
    </Casca>
  )
}
