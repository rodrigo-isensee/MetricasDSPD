import { useMemo } from 'react'
import {
  CabecalhoPainel,
  EstadoVazio,
  ProvedorContextoPainel,
  ProvedorOrigemCartoes,
  Secao,
  type EstadoCartao,
} from '@/components/ui'
import { ChipsFiltros } from '@/features/filtros/ChipsFiltros'
import { IndiceDeSecoes, type SecaoDoIndice } from '@/features/operacional/IndiceDeSecoes'
import { BarraFiltrosApontamento } from './components/BarraFiltrosApontamento'
import {
  AvisoNomeReal,
  FrescorEPeriodo,
  LegendaFinalidade,
} from './components/CabecalhoApontamento'
import { CartaoAchados } from './components/CartaoAchados'
import { CartaoDiario } from './components/CartaoDiario'
import { CartaoDistribuicao } from './components/CartaoDistribuicao'
import { CartaoKpis } from './components/CartaoKpis'
import { CartaoMatriz } from './components/CartaoMatriz'
import { CartaoCapacidadeMensal, CartaoCapacidadePessoa } from './components/CartoesCapacidade'
import { CartaoQualidadeGeral, CartaoQualidadePessoa } from './components/CartoesQualidade'
import { ProvedorDadosAba, type DadosAba } from './dados'
import { fonteFicticia } from './fixture'
import { filtrosAtivos, useFiltrosApontamento } from './filtros'
import { CARREGANDO, SECOES, VAZIO } from './textos'
import type { FonteApontamento } from './types'
import { useApontamento } from './useApontamento'

const INDICE: readonly SecaoDoIndice[] = [
  ['secao-kpis', 'Quanto foi apontado', []],
  ['secao-distribuicao', 'Onde o esforço foi gasto', []],
  ['secao-qualidade', 'Qualidade dos apontamentos', []],
  ['secao-capacidade', 'Capacidade', []],
  ['secao-achados', 'Achados', []],
  ['secao-diario', 'Dia a dia', []],
]

/** Origem dos dados: enquanto a rota não existe (C2), tudo vem da fixture e o selo "Dados fictícios" diz isso. */
const origemFicticia = () => ({ ficticio: true, motivo: 'aguardando a rota da API' })

/**
 * Aba Apontamento (pedido 059, trilha C1): contrato v1 contra fixture tipada. Uma consulta, seis seções; o
 * vazio é tratado uma vez, aqui. Não tem botão de exportar (o4) e não grava pessoa em lugar nenhum além da URL.
 */
export default function ApontamentoPage({ fonte = fonteFicticia }: { fonte?: FonteApontamento }) {
  const uso = useFiltrosApontamento()
  const dados = useApontamento(fonte, uso.consulta)
  const resposta = dados.resposta
  const ativos = useMemo(
    () => filtrosAtivos(uso.consulta, resposta?.opcoes),
    [uso.consulta, resposta],
  )
  const estado: EstadoCartao = dados.resposta ? 'ok' : dados.erro ? 'erro' : 'carregando'
  const valor = useMemo<DadosAba>(
    () => ({
      resposta: dados.resposta,
      estado,
      erro: dados.erro,
      atualizando: dados.atualizando,
      tentarDeNovo: dados.tentarDeNovo,
      ordem: uso.ordem,
      nivelMatriz: uso.consulta.nivelMatriz,
      definirNivel: uso.definirNivel,
      definirLista: (chave, ids) => uso.definirLista(chave, ids),
      diarioDe: uso.consulta.diarioDe,
      diarioAte: uso.consulta.diarioAte,
      definirDiario: uso.definirDiario,
    }),
    [dados.resposta, dados.erro, dados.atualizando, dados.tentarDeNovo, estado, uso],
  )
  const vazio = dados.resposta !== undefined && dados.resposta.kpis.apontamentos === 0
  return (
    <ProvedorContextoPainel
      filtrosAtivos={ativos}
      removerFiltro={uso.remover}
      limparFiltros={uso.limpar}
    >
      <ProvedorOrigemCartoes origem={origemFicticia}>
        <ProvedorDadosAba valor={valor}>
          <div className="flex flex-col gap-6" data-testid="aba-apontamento">
            {dados.resposta?.nomesReais && <AvisoNomeReal />}
            <CabecalhoPainel
              titulo="Apontamento"
              pergunta="Onde o tempo apontado foi gasto e a capacidade acompanha o período?"
              publico="Para o time e a liderança · fonte única: BusinessMap."
              fonte="BusinessMap"
              slug="apontamento"
              frescor={<FrescorEPeriodo resposta={dados.resposta} />}
            >
              <LegendaFinalidade />
              {resposta ? (
                <BarraFiltrosApontamento
                  opcoes={resposta.opcoes}
                  uso={uso}
                  ativos={ativos}
                  nomesReais={resposta.nomesReais}
                />
              ) : (
                ativos.length > 0 && <ChipsFiltros chips={ativos} onRemover={uso.remover} />
              )}
            </CabecalhoPainel>
            <div
              role="status"
              aria-live="polite"
              className="sr-only"
              data-testid="anuncio-carregando"
            >
              {estado === 'carregando' ? CARREGANDO : ''}
            </div>
            <IndiceDeSecoes secoes={INDICE} />
            {vazio ? (
              <EstadoVazio codigo="AP" titulo={VAZIO.titulo} texto={VAZIO.texto} />
            ) : (
              <>
                <Secao id="secao-kpis" titulo={SECOES.kpis}>
                  <CartaoKpis />
                </Secao>
                <Secao id="secao-distribuicao" titulo={SECOES.distribuicao}>
                  <CartaoDistribuicao bloco="projeto" />
                  <CartaoDistribuicao bloco="tipo" />
                  <CartaoDistribuicao bloco="subgrupo" />
                </Secao>
                <Secao id="secao-qualidade" titulo={SECOES.qualidade}>
                  <CartaoQualidadeGeral />
                  <CartaoMatriz />
                  <CartaoQualidadePessoa />
                </Secao>
                <Secao id="secao-capacidade" titulo={SECOES.capacidade}>
                  <CartaoCapacidadeMensal />
                  <CartaoCapacidadePessoa />
                </Secao>
                <Secao id="secao-achados" titulo={SECOES.achados}>
                  <CartaoAchados />
                </Secao>
                <Secao id="secao-diario" titulo={SECOES.diario}>
                  <CartaoDiario />
                </Secao>
              </>
            )}
          </div>
        </ProvedorDadosAba>
      </ProvedorOrigemCartoes>
    </ProvedorContextoPainel>
  )
}

export const handle = { titulo: 'Operacional · Apontamento' }
