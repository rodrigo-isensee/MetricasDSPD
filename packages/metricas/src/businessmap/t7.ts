import { MINIMO_AMOSTRA } from '@metricas-dspd/contratos'
import type { ResultadoT7 } from '@metricas-dspd/contratos'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { diaDeIso, fimDoExpediente } from '../core/calendario'
import { percentis } from '../core/estatistica'
import { FAIXAS, histograma } from '../core/histograma'
import { amostraBM } from './amostra'
import {
  baseAmostral,
  criterios,
  dentro,
  du,
  janelaPercentis,
  periodoDe,
  r2,
  selecionar,
} from './comum'
import { estadoEm, idadeHUEm } from './estado'
import type { ContextoBM } from './indice'
import type { DimCard } from './modelo'
import { ordenarNeutro } from '../core/ordenar'

/** T7: fluxo de frentes. Granularidade frente: nunca entra em histograma de story. */
export function calcularT7(ctx: ContextoBM, f: FiltrosFluxo): ResultadoT7 {
  const periodo = periodoDe(ctx, f)
  const janela = janelaPercentis(ctx, f, 'frente')
  const t = Math.min(ctx.hoje, fimDoExpediente(diaDeIso(periodo.fim), ctx.cal))
  const frentes = selecionar(ctx, f, 'frente', { semTipo: true })
  const concluidas = frentes.filter((m) => m.cicloHU !== null && dentro(ctx, m.entrega, janela))
  const amostra = amostraBM(
    'frente',
    concluidas.map((m) => du(ctx, m.cicloHU as number)),
    janela,
  )
  const referencia = percentis(amostra)
  const hist = histograma(amostra, FAIXAS.frente)
  const abertas = frentes.filter((m) => estadoEm(ctx, m, t).emWip)

  const nomeProjeto = (id: string | null) =>
    id ? (ctx.idx.porId.get(id) as DimCard).titulo : 'Sem projeto'
  const porProj = new Map<string, number>()
  for (const m of abertas) {
    const k = m.projetoId ?? '-'
    porProj.set(k, (porProj.get(k) ?? 0) + 1)
  }
  const limite = ctx.idx.base.config.limite_frentes
  return {
    base: baseAmostral(abertas.length, 'frentes abertas', janela, {
      n: concluidas.length,
      unidade: 'frentes concluídas na janela',
    }),
    criterios: criterios('T7', periodo, janela, ctx),
    janelaPercentis: janela,
    kpis: {
      frentesEmAndamento: abertas.length,
      projetosComFrentes: porProj.size,
      limiteFrentes: limite,
      acimaDoLimite: abertas.length > limite,
    },
    porProjeto: ordenarNeutro(
      [...porProj.entries()].map(([id, abertasN]) => ({
        projetoId: id,
        projeto: nomeProjeto(id === '-' ? null : id),
        abertas: abertasN,
      })),
      (x) => [-x.abertas, x.projetoId],
    ),
    idades: ordenarNeutro(
      abertas.map((m) => {
        const idade = du(ctx, idadeHUEm(ctx, m, t))
        const situacao: 'acima-p95' | 'entre-p85-p95' | 'dentro' | 'sem-referencia' =
          referencia.status !== 'ok'
            ? 'sem-referencia'
            : idade > referencia.valor.p95
              ? 'acima-p95'
              : idade > referencia.valor.p85
                ? 'entre-p85-p95'
                : 'dentro'
        return {
          cardId: m.card.card_id,
          titulo: m.card.titulo,
          projeto: nomeProjeto(m.projetoId),
          idadeDiasUteis: r2(idade),
          situacao,
        }
      }),
      (x) => [-x.idadeDiasUteis, x.cardId],
    ),
    referencia,
    histograma:
      hist === null
        ? { status: 'insuficiente', n: concluidas.length, minimo: MINIMO_AMOSTRA, janela }
        : { status: 'ok', n: concluidas.length, valor: { faixas: hist }, janela },
  }
}
