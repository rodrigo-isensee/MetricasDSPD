import type { ReactNode } from 'react'
import { CabecalhoPainel, ErroPagina, ProvedorContextoPainel } from '@/components/ui'
import type { Dominio, FiltrosFluxo, FiltrosSustentacao } from '@metricas-dspd/contratos'
import { useDataReferencia, useErroDePainelSimulado, useEstadoColeta, useModoMock } from '@/data'
import { FaixaCalibracaoFonte } from '@/features/coleta/CalibracaoDasFontes'
import { FrescorFonte } from '@/features/coleta/FrescorFonte'
import { SemDadosDaFonte } from '@/features/coleta/SemDadosDaFonte'
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

/** Corpo do painel de UMA fonte: sem nenhuma coleta ok não há o que mostrar (CA-09); nas outras situações os dados anteriores continuam. */
function CorpoDaFonte({ dominio, children }: { dominio: Dominio; children: ReactNode }) {
  const { data } = useEstadoColeta(dominio)
  return data?.ultimaOk === null ? <SemDadosDaFonte dominio={dominio} /> : children
}

function Casca({
  uso,
  base,
  fonte,
  fontes,
  estrategico,
  children,
}: {
  /** Fontes que o painel usa: o selo de cada uma aparece no cabeçalho, sempre separado. */
  fontes: readonly Dominio[]
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
  const aguardando =
    useModoMock() !== 'carregando' &&
    ((fontes.includes('businessmap') && pendenteBm) || (fontes.includes('acelerato') && pendenteAc))
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
          frescor={
            <div className="flex flex-col gap-1">
              {fontes.map((d) => (
                <FrescorFonte key={d} dominio={d} comNome={fontes.length > 1} />
              ))}
            </div>
          }
          {...(base.publico ? { publico: base.publico } : {})}
        />
        {aguardando ? (
          <div className="min-h-screen" aria-hidden="true" data-testid="aguardando-coleta" />
        ) : (
          <>
            {fontes.map((d) => (
              <FaixaCalibracaoFonte key={d} dominio={d} />
            ))}
            {base.extra}
            <BarraFiltros uso={uso} {...(estrategico ? { estrategico } : {})} />
            {fontes.length === 1 ? (
              <CorpoDaFonte dominio={fontes[0] as Dominio}>{children}</CorpoDaFonte>
            ) : (
              children
            )}
          </>
        )}
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
  fonte = 'BusinessMap',
  fontes = ['businessmap'],
  ...base
}: Base & {
  /** Sobrepõe a fonte do cabeçalho (só a Espera invisível, que reúne os dois sistemas em blocos). */
  fonte?: string
  fontes?: readonly Dominio[]
  painel: PainelFluxoId
  children: (filtros: FiltrosFluxo, uso: UseFiltros<FiltrosFluxo>) => ReactNode
}) {
  const uso = useFiltros(painel)
  return (
    <Casca
      uso={uso}
      base={base}
      fonte={fonte}
      fontes={fontes}
      estrategico={painel === 'estrategico'}
    >
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
    <Casca uso={uso} base={base} fonte="Acelerato" fontes={['acelerato']}>
      {children(uso.filtros, uso)}
    </Casca>
  )
}
