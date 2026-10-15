import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams, type Location } from 'react-router'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { EsqueletoCartao } from '@/components/ui'
import { LinhaFiltrosGuardados } from '@/features/filtros'
import { SecaoPainel } from '@/features/preferencias'
import { PainelFluxo, PainelSustentacao } from '@/features/painel/PainelPagina'
import { CartaoEIFL1 } from '@/features/espera-invisivel/components/CartaoEI'
import { MaisMetricas } from '@/features/complementares/MaisMetricas'
import { cartaoDeFluxo } from '@/features/complementares/registro'
import { AtencaoDiaria, AtencaoSemanal } from './AtencaoFluxo'
import { CartaoBloqueados } from './components/CartaoBloqueados'
import { CartaoO1 } from './components/CartaoO1'
import { CartaoO2 } from './components/CartaoO2'
import { CartaoO3 } from './components/CartaoO3'
import { CartaoO4 } from './components/CartaoO4'
import { CartaoO7 } from './components/CartaoO7'
import { CartaoO9 } from './components/CartaoO9'
import { CartaoO10 } from './components/CartaoO10'
import { CartaoO12 } from './components/CartaoO12'
import { CartaoO15 } from './components/CartaoO15'
import { CartaoO18 } from './components/CartaoO18'
import { IndiceDeSecoes, SECAO_MAIS_METRICAS, type SecaoDoIndice } from './IndiceDeSecoes'
import { VisaoResumo } from './resumo/VisaoResumo'
import { ANUNCIO_DA_VISAO, carregarSustentacao, SeletorVisao } from './SeletorVisao'
import { useVisaoOperacional } from './useVisaoOperacional'
import { hrefDaVisao, resolverVisao, ROTULO_VISAO, type Visao } from '@/features/navegacao/visao'

// A visão Sustentação é um chunk à parte: só baixa quando a pessoa a escolhe, chega por link ou mostra intenção.
const VisaoSustentacao = lazy(carregarSustentacao)

const PERGUNTA = {
  diaria: 'Pergunta da daily: "Qual item mais velho não andou desde ontem?"',
  semanal: 'Pergunta: "O que mudou na nossa distribuição de tempo?"',
} as const

const SECOES: readonly SecaoDoIndice[] = [
  ['tempo', 'Tempo', ['o3', 'o9']],
  ['fluxo', 'Fluxo', ['o4']],
  ['compromissos', 'Compromissos', ['o12']],
  ['backlog', 'Backlog', ['o10', 'o7']],
  ['qualidade', 'Qualidade', ['o15', 'o18']],
  ['espera-invisivel', 'Espera invisível', ['ei-fl1']],
  SECAO_MAIS_METRICAS,
]

function ConteudoFluxo({ filtros, visao }: { filtros: FiltrosFluxo; visao: 'diaria' | 'semanal' }) {
  const [params] = useSearchParams()
  if (visao === 'diaria') {
    return (
      <>
        <AtencaoDiaria filtros={filtros} />
        <SecaoPainel cartoes={['o2', 'bloqueados', 'o1']}>
          <CartaoO2 filtros={filtros} />
          <CartaoBloqueados filtros={filtros} />
          <CartaoO1 filtros={filtros} />
        </SecaoPainel>
        <p className="text-sm">
          <Link
            to={hrefDaVisao('semanal', params)}
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
      <AtencaoSemanal filtros={filtros} />
      <IndiceDeSecoes secoes={SECOES} />
      <SecaoPainel cartoes={['o3', 'o9']} id="tempo" titulo="Tempo">
        <CartaoO3 filtros={filtros} />
        <CartaoO9 filtros={filtros} />
      </SecaoPainel>
      <SecaoPainel cartoes={['o4']} id="fluxo" titulo="Fluxo">
        <CartaoO4 filtros={filtros} />
      </SecaoPainel>
      <SecaoPainel cartoes={['o12']} id="compromissos" titulo="Compromissos">
        <CartaoO12 filtros={filtros} />
      </SecaoPainel>
      <SecaoPainel cartoes={['o10', 'o7']} id="backlog" titulo="Backlog">
        <CartaoO10 filtros={filtros} />
        <CartaoO7 filtros={filtros} />
      </SecaoPainel>
      <SecaoPainel cartoes={['o15', 'o18']} id="qualidade" titulo="Qualidade">
        <CartaoO15 filtros={filtros} />
        <CartaoO18 filtros={filtros} />
      </SecaoPainel>
      <SecaoPainel
        cartoes={['ei-fl1']}
        id="espera-invisivel"
        titulo="Quanto do tempo do solicitante fica fora da nossa gestão?"
      >
        <CartaoEIFL1 filtros={filtros} />
      </SecaoPainel>
      <MaisMetricas fonte="BusinessMap" renderizar={(id) => cartaoDeFluxo(id, filtros)} />
    </>
  )
}

/** Esqueleto da visão Sustentação enquanto o chunk baixa: nunca tela em branco (as alturas dos primeiros cartões). */
function EsqueletoDaSustentacao() {
  return (
    <div className="flex flex-col gap-4" data-testid="esqueleto-visao-sustentacao">
      <EsqueletoCartao codigo="S2" titulo="Aderência ao SLA" />
      <EsqueletoCartao codigo="S1" titulo="Primeiro atendimento e restauração" />
    </div>
  )
}

/** Título do documento por visão ("Operacional · Sustentação"); o resto do título vem do shell. */
const tituloDaPagina = (l: Pick<Location, 'search' | 'hash'>): string =>
  `Operacional · ${ROTULO_VISAO[resolverVisao(new URLSearchParams(l.search), l.hash).visao]}`

export default function OperacionalPage() {
  const { visao, escolher } = useVisaoOperacional()
  const [anuncio, setAnuncio] = useState('')
  const { hash } = useLocation()
  const focoPendenteRef = useRef(false)
  const viaSeletorRef = useRef(false)
  const visaoAnterior = useRef(visao)
  const aoEscolher = (v: Visao) => {
    viaSeletorRef.current = true
    escolher(v)
  }
  // O anúncio sai da visão resolvida, não do handler do seletor: Voltar, links "Ver na..." e hash também anunciam.
  // A montagem inicial não anuncia (a visão anterior começa igual à atual).
  useEffect(() => {
    if (visaoAnterior.current === visao) return
    visaoAnterior.current = visao
    setAnuncio(ANUNCIO_DA_VISAO[visao])
    const viaSeletor = viaSeletorRef.current
    viaSeletorRef.current = false
    // Troca por link sem hash: o link some da tela e o foco cairia no body; vai ao título da página (D-03).
    // Pelo seletor o foco volta ao rádio; com hash o foco vai ao cartão.
    if (viaSeletor || hash) return
    // Uma visão lazy que ainda não montou pode não ter o h1: nesse caso só não move o foco.
    const h1 = document.querySelector<HTMLElement>('h1')
    if (!h1) return
    h1.tabIndex = -1
    h1.focus({ preventScroll: true })
  }, [visao, hash])
  const seletor = (
    <SeletorVisao visao={visao} onEscolher={aoEscolher} focoPendenteRef={focoPendenteRef} />
  )
  const comPergunta = (v: 'diaria' | 'semanal') => (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {seletor}
      <p className="text-sm text-texto-2" data-testid="pergunta-cadencia">
        {PERGUNTA[v]}
      </p>
    </div>
  )
  let pagina
  if (visao === 'resumo') pagina = <VisaoResumo extra={seletor} />
  else if (visao === 'sustentacao')
    pagina = (
      <PainelSustentacao
        prefixo="sust_"
        slug="operacional"
        titulo="Operacional"
        pergunta="Estamos atendendo e restaurando dentro do combinado?"
        publico="Para o líder da sustentação · semanal e mensal."
        extra={seletor}
        legendaFiltros="Filtros da Sustentação · Acelerato"
        ondeFiltros="na Sustentação"
        depoisDosFiltros={<LinhaFiltrosGuardados visao="sustentacao" />}
      >
        {(filtros) => (
          <Suspense fallback={<EsqueletoDaSustentacao />}>
            <VisaoSustentacao filtros={filtros} />
          </Suspense>
        )}
      </PainelSustentacao>
    )
  else
    pagina = (
      <PainelFluxo
        painel="operacional"
        slug="operacional"
        titulo="Operacional"
        pergunta="O trabalho está fluindo?"
        publico="Para times · diária e semanal."
        extra={comPergunta(visao)}
        legendaFiltros="Filtros do fluxo de projeto · BusinessMap"
        ondeFiltros="no fluxo de projeto"
        depoisDosFiltros={<LinhaFiltrosGuardados visao="fluxo" />}
      >
        {(filtros) => <ConteudoFluxo filtros={filtros} visao={visao} />}
      </PainelFluxo>
    )
  return (
    <>
      {pagina}
      {/* Região única e permanente (fora de cada molde): o texto muda e o leitor de tela anuncia a troca. */}
      <div role="status" aria-live="polite" className="sr-only" data-testid="anuncio-visao">
        {anuncio}
      </div>
    </>
  )
}

export const handle = { titulo: tituloDaPagina }
