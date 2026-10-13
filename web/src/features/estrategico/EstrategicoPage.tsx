import { FaixaAtencao, estadoFaixa, type ItemAtencao } from '@/components/ui'
import { SecaoPainel } from '@/features/preferencias'
import { useMetrica } from '@/data'
import { PainelFluxo } from '@/features/painel/PainelPagina'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { CartaoEIFL3 } from '@/features/espera-invisivel/components/CartaoEI'
import { CartaoE1 } from './components/CartaoE1'
import { CartaoE2 } from './components/CartaoE2'
import { CartaoE3 } from './components/CartaoE3'
import { MaisMetricas } from '@/features/complementares/MaisMetricas'
import { cartaoDeFluxo } from '@/features/complementares/registro'

function Atencao({ filtros }: { filtros: FiltrosFluxo }) {
  const qE2 = useMetrica('E2', filtros)
  const e2 = qE2.dados
  const qE3 = useMetrica('E3', filtros)
  const e3 = qE3.dados
  const itens: ItemAtencao[] = []
  if (e3 && e3.semFicha > 0)
    itens.push({
      id: 'e3',
      texto: `${e3.semFicha} ${e3.semFicha === 1 ? 'iniciativa sem resultado declarado' : 'iniciativas sem resultado declarado'}`,
      para: '#e3',
    })
  if (e2?.statusMeta === 'fora')
    itens.push({ id: 'e2', texto: 'Evolução vinculada a objetivo abaixo da meta', para: '#e2' })
  const { estado, recarregar } = estadoFaixa([qE2, qE3])
  return (
    <FaixaAtencao
      momento="agora"
      itens={itens}
      estado={estado}
      onTentarDeNovo={recarregar}
      reserva={{ mobile: 108, desktop: 98 }}
    />
  )
}

export default function EstrategicoPage() {
  return (
    <PainelFluxo
      painel="estrategico"
      slug="estrategico"
      titulo="Estratégico"
      pergunta="Estamos fazendo as apostas certas, e elas estão terminando?"
      publico="Para o gerente · mensal e trimestral."
    >
      {(filtros) => (
        <>
          <Atencao filtros={filtros} />
          <SecaoPainel cartoes={['e1']} id="prazo" titulo="Quanto tempo leva decidir e entregar?">
            <CartaoE1 filtros={filtros} />
          </SecaoPainel>
          <SecaoPainel
            cartoes={['e2', 'e3']}
            id="apostas"
            titulo="As entregas refletem as prioridades e geram resultado?"
          >
            <CartaoE2 filtros={filtros} />
            <CartaoE3 filtros={filtros} />
          </SecaoPainel>
          <SecaoPainel
            cartoes={['ei-fl3']}
            id="espera-invisivel"
            titulo="Espera invisível do nível"
          >
            <CartaoEIFL3 filtros={filtros} variante="compacto" />
          </SecaoPainel>
          <MaisMetricas fonte="BusinessMap" renderizar={(id) => cartaoDeFluxo(id, filtros)} />
        </>
      )}
    </PainelFluxo>
  )
}

export const handle = { titulo: 'Estratégico' }
