import type { ResultadoT9 } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import {
  baseAmostral,
  criterios,
  frenteAdicionadaAposInicio,
  periodoDe,
  r2,
  selecionar,
} from './comum'
import type { ContextoBM } from './indice'
import { ordenarNeutro } from '../core/ordenar'

/**
 * T9: avanço real (frentes concluídas ÷ total, pelos filhos) e crescimento de escopo. Censo por projeto.
 *
 * Decisão do dono (2026-11-16, D-T9 "T9 A", pedido 105): frente adicionada depois do início = frente criada (`criado_em`) depois do início do
 * projeto (`iniciado_em`). A base não guarda o instante do vínculo, então a frente criada antes e ligada depois conta como original (a nota do
 * cartão diz isso). A regra é derivada na leitura; `adicionado_apos_inicio_pai` não é lida. Projeto sem início fica fora e é contado
 * (`projetosSemInicio`). O T9 é censo por projeto e não publica estatística agregada (percentil, percentual do conjunto): só "k de n".
 */
const LINHA_VAZIA = {
  totalFrentes: 0,
  originais: 0,
  adicionadas: 0,
  concluidas: 0,
  emAndamento: 0,
  aFazer: 0,
  avancoPct: 0,
  crescimentoEscopoPct: 0,
}

export function calcularT9(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT9 {
  const periodo = periodoDe(ctx, f)
  const projetos = selecionar(ctx, f, 'projeto', {
    semEquipe: true,
    semSetor: true,
    semTipo: true,
  }).filter((p) => p.entrega === null && !p.arquivadoSemDesfecho)
  const frentes = selecionar(ctx, f, 'frente', { semTipo: true })
  let projetosSemInicio = 0
  const linhasBrutas = projetos
    .map((p) => {
      const fs = frentes.filter((m) => m.card.card_pai === p.card.card_id)
      const inicioProjeto = p.card.iniciado_em
      if (inicioProjeto === null) {
        if (fs.length > 0) projetosSemInicio += 1
        return { ...LINHA_VAZIA, projetoId: p.card.card_id, projeto: p.card.titulo }
      }
      const adicionadas = fs.filter((m) => frenteAdicionadaAposInicio(m.card, inicioProjeto)).length
      const originais = fs.length - adicionadas
      const concluidas = fs.filter((m) => m.entrega !== null).length
      const emAndamento = fs.filter((m) => m.entrega === null && m.inicio !== null).length
      return {
        projetoId: p.card.card_id,
        projeto: p.card.titulo,
        totalFrentes: fs.length,
        originais,
        adicionadas,
        concluidas,
        emAndamento,
        aFazer: fs.length - concluidas - emAndamento,
        avancoPct: fs.length === 0 ? 0 : r2((concluidas / fs.length) * 100),
        crescimentoEscopoPct: originais === 0 ? 0 : r2((adicionadas / originais) * 100),
      }
    })
    .filter((l) => l.totalFrentes > 0)
  const linhas = ordenarNeutro(linhasBrutas, (l) => [
    -l.crescimentoEscopoPct,
    -l.totalFrentes,
    l.projetoId,
  ])
  return {
    base: baseAmostral(
      linhas.reduce((t, l) => t + l.totalFrentes, 0),
      `frentes (${linhas.reduce((t, l) => t + l.originais, 0)} originais, ${linhas.reduce((t, l) => t + l.adicionadas, 0)} adicionadas)`,
      null,
    ),
    criterios: criterios('T9', periodo, periodo, ctx),
    projetos: linhas,
    projetosComEscopoCrescido: linhas.filter((l) => l.adicionadas > 0).length,
    projetosSemInicio,
  }
}
