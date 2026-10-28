import { FaixaAtencao, estadoFaixa, type ItemAtencao } from '@/components/ui'
import { SecaoPainel } from '@/features/preferencias'
import {
  IndiceDeSecoes,
  SECAO_MAIS_METRICAS,
  type SecaoDoIndice,
} from '@/features/operacional/IndiceDeSecoes'
import { useMetrica } from '@/data'
import { PainelFluxo } from '@/features/painel/PainelPagina'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { CartaoEIFL2 } from '@/features/espera-invisivel/components/CartaoEI'
import { CartaoT1 } from './components/CartaoT1'
import { CartaoT2 } from './components/CartaoT2'
import { CartaoT3 } from './components/CartaoT3'
import { CartaoT4 } from './components/CartaoT4'
import { CartaoT5 } from './components/CartaoT5'
import { CartaoT7 } from './components/CartaoT7'
import { CartaoT9 } from './components/CartaoT9'
import { MaisMetricas } from '@/features/complementares/MaisMetricas'
import { cartaoDeFluxo } from '@/features/complementares/registro'

function Atencao({ filtros }: { filtros: FiltrosFluxo }) {
  const qT2 = useMetrica('T2', filtros)
  const t2 = qT2.dados
  const qT3 = useMetrica('T3', filtros)
  const t3 = qT3.dados
  const qT4 = useMetrica('T4', filtros)
  const t4 = qT4.dados
  const qT9 = useMetrica('T9', filtros)
  const t9 = qT9.dados
  const itens: ItemAtencao[] = []
  const fora2 = t2?.classes.filter((c) => c.statusMeta === 'fora').length ?? 0
  if (fora2)
    itens.push({
      id: 't2',
      texto: `Aderência ao SLE abaixo da meta em ${fora2} ${fora2 === 1 ? 'classe' : 'classes'}`,
      para: '#t2',
    })
  const fora4 = t4?.classes.filter((c) => c.statusMeta === 'fora').length ?? 0
  if (fora4)
    itens.push({
      id: 't4',
      texto: `Razão chegada/vazão fora de 0,9 a 1,0 em ${fora4} ${fora4 === 1 ? 'classe' : 'classes'}`,
      para: '#t4',
    })
  const fora3 =
    t3?.status === 'ok' ? t3.naturezas.filter((n) => n.itens.statusMeta === 'fora').length : 0
  if (fora3)
    itens.push({
      id: 't3',
      texto: `Alocação com desvio acima de 10 p.p. em ${fora3} ${fora3 === 1 ? 'natureza' : 'naturezas'}`,
      para: '#t3',
    })
  if (t9?.projetosComEscopoCrescido)
    itens.push({
      id: 't9',
      texto: `${t9.projetosComEscopoCrescido} ${t9.projetosComEscopoCrescido === 1 ? 'projeto' : 'projetos'} com escopo crescido`,
      para: '#t9',
    })
  const { estado, recarregar } = estadoFaixa([qT2, qT3, qT4, qT9])
  return (
    <FaixaAtencao
      momento="semana"
      itens={itens}
      estado={estado}
      onTentarDeNovo={recarregar}
      reserva={{ mobile: 294, desktop: 130 }}
    />
  )
}

const SECOES: readonly SecaoDoIndice[] = [
  ['publicado', 'Publicado', ['t2', 't1', 't5']],
  ['fila', 'Fila', ['t4', 't3']],
  ['projetos', 'Projetos', ['t9', 't7']],
  ['espera-invisivel', 'Espera invisível', ['ei-fl2']],
  SECAO_MAIS_METRICAS,
]

export default function TaticoPage() {
  return (
    <PainelFluxo
      painel="tatico"
      slug="tatico"
      titulo="Tático"
      pergunta="O projeto está avançando de verdade, e no ritmo previsto?"
      publico="Para coordenadores · quinzenal e mensal."
    >
      {(filtros) => (
        <>
          <Atencao filtros={filtros} />
          <IndiceDeSecoes secoes={SECOES} />
          <SecaoPainel
            cartoes={['t2', 't1', 't5']}
            id="publicado"
            titulo="Estamos cumprindo o que publicamos?"
          >
            <CartaoT2 filtros={filtros} />
            <CartaoT1 filtros={filtros} />
            <CartaoT5 filtros={filtros} />
          </SecaoPainel>
          <SecaoPainel
            cartoes={['t4', 't3']}
            id="fila"
            titulo="O que entra, e o que sai da fila para isso caber?"
          >
            <CartaoT4 filtros={filtros} />
            <CartaoT3 filtros={filtros} />
          </SecaoPainel>
          <SecaoPainel
            cartoes={['t9', 't7']}
            id="projetos"
            titulo="Os projetos estão avançando de verdade?"
          >
            <CartaoT9 filtros={filtros} />
            <CartaoT7 filtros={filtros} />
          </SecaoPainel>
          <SecaoPainel
            cartoes={['ei-fl2']}
            id="espera-invisivel"
            titulo="Quanto do tempo do solicitante fica fora da nossa gestão?"
          >
            <CartaoEIFL2 filtros={filtros} />
          </SecaoPainel>
          <MaisMetricas fonte="BusinessMap" renderizar={(id) => cartaoDeFluxo(id, filtros)} />
        </>
      )}
    </PainelFluxo>
  )
}

export const handle = { titulo: 'Tático' }
