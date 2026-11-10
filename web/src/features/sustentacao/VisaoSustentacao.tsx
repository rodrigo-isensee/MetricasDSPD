import { FaixaAtencao, estadoFaixa } from '@/components/ui'
import { SecaoPainel } from '@/features/preferencias'
import { useMetrica, useOpcoesFiltro } from '@/data'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import {
  IndiceDeSecoes,
  SECAO_MAIS_METRICAS,
  type SecaoDoIndice,
} from '@/features/operacional/IndiceDeSecoes'
import { textoPeriodoCurto } from '@/features/filtros/paineis'
import { itensSustentacao } from '@/features/operacional/atencao'
import { CartaoEISust } from '@/features/espera-invisivel/components/CartaoEI'
import { CartaoS1 } from './components/CartaoS1'
import { CartaoS2 } from './components/CartaoS2'
import { CartaoS3 } from './components/CartaoS3'
import { CartaoS4 } from './components/CartaoS4'
import { CartaoS5 } from './components/CartaoS5'
import { CartaoS6 } from './components/CartaoS6'
import { CartaoS7 } from './components/CartaoS7'
import { CartaoPV1 } from '@/features/percepcao/CartaoPV1'
import { MaisMetricas } from '@/features/complementares/MaisMetricas'
import { cartaoDeSustentacao } from '@/features/complementares/registro'

/** "Pede atenção no período": S2 abaixo de 90% e S1 com mediana acima do alvo, por prioridade (SUS-01). */
function Atencao({ filtros }: { filtros: FiltrosSustentacao }) {
  const qS2 = useMetrica('S2', filtros)
  const qS1 = useMetrica('S1', filtros)
  const { estado, recarregar } = estadoFaixa([qS2, qS1])
  return (
    <FaixaAtencao
      titulo="Pede atenção no período · Sustentação (Acelerato)"
      vazio="Nada pede atenção na Sustentação no período selecionado."
      janela={`Período do filtro: ${textoPeriodoCurto(filtros.periodo)}`}
      itens={itensSustentacao(qS2.dados, qS1.dados)}
      estado={estado}
      onTentarDeNovo={recarregar}
      reserva={{ mobile: 108, desktop: 88 }}
    />
  )
}

/** Seções do índice da visão, na ordem da tela (a percepção de valor fica depois de "Mais métricas"). */
const SECOES: readonly SecaoDoIndice[] = [
  ['prazos', 'Prazos', ['s2', 's1']],
  ['volume', 'Volume e resolução', ['s3', 's4']],
  ['causas', 'Escalação, encerramento e reclassificação', ['s5', 's6', 's7']],
  ['espera', 'Espera invisível', ['ei-sust']],
  SECAO_MAIS_METRICAS,
  ['percepcao', 'Percepção de valor', ['pv1']],
]

/** Equipes do recorte em texto: "SSSC TOTVS, SENIOR e FLUIG" (a marca comum, primeira palavra, aparece só na primeira). */
function textoEquipes(nomes: readonly string[]): string {
  const marca = `${nomes.join(' ').split(' ')[0]} `
  const curtos = nomes.map((n, i) => (i > 0 && n.startsWith(marca) ? n.slice(marca.length) : n))
  const ultimo = curtos.pop()
  return curtos.length > 0 ? `${curtos.join(', ')} e ${ultimo}` : `${ultimo}`
}

/** Equipes de hoje, usadas enquanto a API não devolve o recorte (sem dado, o texto não muda). */
const EQUIPES_PADRAO = 'SSSC TOTVS, SENIOR e FLUIG'

/**
 * Texto do recorte da visão. As equipes vêm das opções de filtro do Acelerato que a API devolve; sem elas (carregando,
 * erro ou lista vazia), vale o texto de hoje. Organização e tipo ainda não são expostos pela API (ver relatório do K-215).
 */
function RecorteSustentacao() {
  const { data } = useOpcoesFiltro('acelerato')
  const nomes = data?.equipes.map((e) => e.nome) ?? []
  const equipes = nomes.length > 0 ? textoEquipes(nomes) : EQUIPES_PADRAO
  return (
    <p
      className="rounded-md border border-borda bg-superficie p-3 text-sm"
      data-testid="recorte-sustentacao"
    >
      Chamados da organização DSPD Sustentação, tipo DSPD - SSSC, equipes {equipes}, excluídos os
      removidos. Tempos e aderência usam somente chamados fechados. Chamados com exceção de SLA por
      registro posterior ficam fora destas apurações.
    </p>
  )
}

/**
 * Conteúdo da visão Sustentação do Operacional (Acelerato): carregado sob demanda, em chunk próprio, só quando a
 * pessoa escolhe a visão ou chega por link (o seletor pré-carrega na intenção). O molde (cabeçalho, filtros com
 * prefixo `sust_`) é montado pela página.
 */
export default function VisaoSustentacao({ filtros }: { filtros: FiltrosSustentacao }) {
  return (
    <>
      <RecorteSustentacao />
      <Atencao filtros={filtros} />
      <IndiceDeSecoes secoes={SECOES} />
      <SecaoPainel
        cartoes={['s2', 's1']}
        id="prazos"
        titulo="Prazos"
        pergunta="Cumprimos o combinado, em cada prioridade?"
      >
        <CartaoS2 filtros={filtros} />
        <CartaoS1 filtros={filtros} />
      </SecaoPainel>
      <SecaoPainel
        cartoes={['s3', 's4']}
        id="volume"
        titulo="Volume e resolução"
        pergunta="Quanto chega e onde é resolvido?"
      >
        <CartaoS3 filtros={filtros} />
        <CartaoS4 filtros={filtros} />
      </SecaoPainel>
      <SecaoPainel
        cartoes={['s5', 's6', 's7']}
        id="causas"
        titulo="Escalação, encerramento e reclassificação"
      >
        <CartaoS5 filtros={filtros} />
        <CartaoS6 filtros={filtros} />
        <CartaoS7 filtros={filtros} />
      </SecaoPainel>
      <SecaoPainel
        cartoes={['ei-sust']}
        id="espera"
        titulo="Quanto do tempo do solicitante fica fora da nossa gestão?"
      >
        <CartaoEISust filtros={filtros} />
      </SecaoPainel>
      <MaisMetricas fonte="Acelerato" renderizar={(id) => cartaoDeSustentacao(id, filtros)} />
      <SecaoPainel
        cartoes={['pv1']}
        id="percepcao"
        titulo="Percepção de valor · pesquisa trimestral"
        pergunta="O serviço entrega valor para as áreas atendidas? Leia ao lado de S1 e S2, sem cálculo cruzado."
      >
        <CartaoPV1 />
      </SecaoPainel>
    </>
  )
}
