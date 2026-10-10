import type { ResultadoT9 } from '@/contracts/metricas'
import type { FiltrosFluxo } from '@/contracts/filtros'
import { baseAmostral, criterios, periodoDe, r2, selecionar } from './comum'
import type { ContextoBM } from './indice'

/** T9: avanço real (frentes concluídas ÷ total, pelos filhos) e crescimento de escopo. Censo por projeto. */
export function calcularT9(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT9 {
  const periodo = periodoDe(ctx, f)
  const projetos = selecionar(ctx, f, 'projeto', { semEquipe: true, semTipo: true }).filter(
    (p) => p.entrega === null && !p.arquivadoSemDesfecho,
  )
  const frentes = selecionar(ctx, f, 'frente', { semTipo: true })
  const linhas = projetos
    .map((p) => {
      const fs = frentes.filter((m) => m.card.card_pai === p.card.card_id)
      const adicionadas = fs.filter((m) => m.card.adicionado_apos_inicio_pai).length
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
    .sort(
      (a, b) => b.crescimentoEscopoPct - a.crescimentoEscopoPct || b.totalFrentes - a.totalFrentes,
    )
  return {
    base: baseAmostral(linhas.length, 'projetos em andamento', null),
    criterios: criterios('T9', periodo, periodo, ctx),
    projetos: linhas,
    projetosComEscopoCrescido: linhas.filter((l) => l.adicionadas > 0).length,
  }
}
