import { Link, useSearchParams } from 'react-router'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import {
  FaixaAtencao,
  estadoFaixa,
  SeletorCadencia,
  usePreferenciasPainel,
  type ItemAtencao,
} from '@/components/ui'
import { useMetrica } from '@/data'
import { useParametroLocal } from '@/features/filtros'
import { SecaoPainel } from '@/features/preferencias'
import { PainelFluxo } from '@/features/painel/PainelPagina'
import { fmtInteiro, fmtPct, plural } from '@/lib/formatar'
import { CartaoEIFL1 } from '@/features/espera-invisivel/components/CartaoEI'
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

const CADENCIAS = ['diaria', 'semanal'] as const
type Cadencia = (typeof CADENCIAS)[number]
const PERGUNTA: Record<Cadencia, string> = {
  diaria: 'Pergunta da daily: "Qual item mais velho não andou desde ontem?"',
  semanal: 'Pergunta: "O que mudou na nossa distribuição de tempo?"',
}

/** Itens da faixa "Pede atenção hoje", montados dos DTOs que os cartões já carregam (mesma consulta, sem recálculo). */
function AtencaoDiaria({ filtros }: { filtros: FiltrosFluxo }) {
  const qO2 = useMetrica('O2', filtros)
  const o2 = qO2.dados
  const qBLOQUEADOS = useMetrica('BLOQUEADOS', filtros)
  const bl = qBLOQUEADOS.dados
  const qO1 = useMetrica('O1', filtros)
  const o1 = qO1.dados
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
      codigo: 'BLOQUEADOS',
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
  const { estado, recarregar } = estadoFaixa([qO2, qBLOQUEADOS, qO1])
  return (
    <FaixaAtencao
      momento="hoje"
      itens={itens}
      estado={estado}
      onTentarDeNovo={recarregar}
      reserva={{ mobile: 202, desktop: 88 }}
    />
  )
}

/** Itens da faixa "Pede atenção na semana": backlog parado há mais de 180 dias (O10) e vencidos por causa interna (O12). */
function AtencaoSemanal({ filtros }: { filtros: FiltrosFluxo }) {
  const qO3 = useMetrica('O3', filtros)
  const o3 = qO3.dados
  const qO10 = useMetrica('O10', filtros)
  const o10 = qO10.dados
  const qO12 = useMetrica('O12', filtros)
  const o12 = qO12.dados
  const itens: ItemAtencao[] = []
  // A decisão "subiu" vem do DTO (variação publicada só com 20 itens ou mais nas duas janelas).
  const subiu = (o3?.classes ?? []).filter(
    (c) => c.variacaoP85.status === 'ok' && (c.variacaoP85.variacaoPct ?? 0) > 0,
  )
  if (subiu.length > 0)
    itens.push({
      id: 'o3',
      codigo: 'O3',
      para: '#o3',
      texto: `P85 do tempo de ciclo subiu: ${subiu
        .map((c) => `${c.tipo} (+${fmtPct(c.variacaoP85.variacaoPct as number, 0)})`)
        .join(', ')}`,
    })
  if (o10 && o10.acimaDe180.time > 0)
    itens.push({
      id: 'o10',
      codigo: 'O10',
      para: '#o10',
      texto: `${fmtInteiro(o10.acimaDe180.time)} ${plural(o10.acimaDe180.time, 'item do backlog com', 'itens do backlog com')} mais de 180 dias`,
    })
  if (o12 && o12.vencidosCausaInterna > 0)
    itens.push({
      id: 'o12',
      codigo: 'O12',
      para: '#o12',
      texto: `${fmtInteiro(o12.vencidosCausaInterna)} ${plural(o12.vencidosCausaInterna, 'vencido', 'vencidos')} por causa interna`,
    })
  const { estado, recarregar } = estadoFaixa([qO3, qO10, qO12])
  return <FaixaAtencao momento="semana" itens={itens} estado={estado} onTentarDeNovo={recarregar} />
}

const SECOES = [
  ['tempo', 'Tempo', ['o3', 'o9', 'ei-fl1']],
  ['fluxo', 'Fluxo', ['o4']],
  ['compromissos', 'Compromissos', ['o12']],
  ['backlog', 'Backlog', ['o10', 'o7']],
  ['qualidade', 'Qualidade', ['o15', 'o18']],
] as const

function Conteudo({ filtros, cadencia }: { filtros: FiltrosFluxo; cadencia: Cadencia }) {
  const [params] = useSearchParams()
  const prefs = usePreferenciasPainel()
  // "Ir para" só lista seção com alguma métrica visível (CA-12).
  const secoesVisiveis = SECOES.filter(
    ([, , ids]) => !prefs || ids.some((c) => !prefs.estaOculto(c)),
  )
  if (cadencia === 'diaria') {
    // O link nunca carrega o parâmetro oculto `mock` (6.6).
    const p = new URLSearchParams(params)
    p.delete('mock')
    p.set('cadencia', 'semanal')
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
      <AtencaoSemanal filtros={filtros} />
      <nav aria-label="Ir para" className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-texto-2">Ir para:</span>
        {secoesVisiveis.map(([id, nome]) => (
          <a
            key={id}
            href={`#${id}`}
            className="alvo inline-flex items-center text-acento underline"
          >
            {nome}
          </a>
        ))}
      </nav>
      <SecaoPainel cartoes={['o3', 'o9', 'ei-fl1']} id="tempo" titulo="Tempo">
        <CartaoO3 filtros={filtros} />
        <CartaoO9 filtros={filtros} />
        <CartaoEIFL1 filtros={filtros} variante="compacto" />
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
