import { CAUSAS_RAIZ, type CausaRaiz, type NaturezaProjeto } from '@metricas-dspd/contratos'
import type { ExtensaoAC } from '@metricas-dspd/metricas/acelerato'
import type { ExtensaoBM, Sprint, SprintCard } from '@metricas-dspd/metricas/businessmap'
import type { ExtensoesMetricas } from '@metricas-dspd/metricas'
import { CALENDARIO_PADRAO, diaDeIso, diaLocal, isoDeDia } from '@metricas-dspd/metricas/core'
import type { BaseMock } from './index'
import { bernoulli, escolhaPonderada } from './distribuicoes'
import { derivar } from './prng'

/**
 * Extensões das métricas complementares (plano metricas-complementares.md §2). Função pura da base,
 * com streams próprios de PRNG: não consome o de `bm`/`ac`, logo a base e o hash existentes não
 * mudam. Todos os valores são FICTÍCIOS (a interface rotula "Dados fictícios").
 */

const PESO_CAUSA: readonly (readonly [CausaRaiz, number])[] = CAUSAS_RAIZ.map((c) => [
  c,
  c === 'Código' ? 35 : c === 'Requisito' ? 25 : c === 'Configuração' ? 15 : 25 / 4,
])

/** Primeira sprint (segunda-feira) e duração: quinzenais, cobrindo mais de 12 meses. */
const INICIO_SPRINTS = '2025-10-06'
const DIAS_SPRINT = 14
const SINTOMAS = [
  'Erro de acesso',
  'Lentidão',
  'Dado divergente',
  'Falha de integração',
  'Relatório incorreto',
] as const

function gerarBM(base: BaseMock): ExtensaoBM {
  const causas = derivar(base.config.semente, 'complementares:causas')
  const spr = derivar(base.config.semente, 'complementares:sprints')
  const nat = derivar(base.config.semente, 'complementares:natureza')
  const ehBug = (t: string) => t === 'Bug interno' || t === 'Defeito em produção'

  const causasRaiz: Record<string, CausaRaiz> = {}
  const naturezaProjeto: Record<string, NaturezaProjeto> = {}
  for (const c of base.bm.cards) {
    if (c.granularidade === 'story' && ehBug(c.tipo))
      causasRaiz[c.card_id] = escolhaPonderada(causas, PESO_CAUSA)
    if (c.granularidade === 'projeto')
      naturezaProjeto[c.card_id] = bernoulli(nat, 0.6) ? 'Evoluir' : 'Manter'
  }

  const hoje = diaLocal(Date.parse(base.config.hoje), CALENDARIO_PADRAO)
  const sprints: Sprint[] = []
  for (let d = diaDeIso(INICIO_SPRINTS), i = 1; d <= hoje; d += DIAS_SPRINT, i++)
    sprints.push({
      sprint_id: `SPR-${String(i).padStart(2, '0')}`,
      inicio: isoDeDia(d),
      fim: isoDeDia(d + DIAS_SPRINT - 1),
    })
  const sprintCards: SprintCard[] = []
  for (const c of base.bm.cards) {
    if (c.granularidade !== 'story' || c.tipo === 'Bug interno' || c.eh_subtarefa) continue
    const ref = c.iniciado_em ?? c.comprometido_em
    if (ref === null) continue
    const dia = diaLocal(ref, CALENDARIO_PADRAO)
    const s = sprints.find((x) => dia >= diaDeIso(x.inicio) && dia <= diaDeIso(x.fim))
    if (!s) continue
    // 85 a 95% das stories entram em sprint: o sorteio é sempre consumido (ordem estável).
    const entra = spr() < 0.9
    const planejado = spr() >= 0.15
    if (!entra) continue
    const entregue =
      c.concluido_em !== null &&
      diaLocal(c.concluido_em, CALENDARIO_PADRAO) >= diaDeIso(s.inicio) &&
      diaLocal(c.concluido_em, CALENDARIO_PADRAO) <= diaDeIso(s.fim)
    sprintCards.push({
      card_id: c.card_id,
      sprint_id: s.sprint_id,
      planejado_na_entrada: planejado,
      entregue,
    })
  }
  return { causasRaiz, sprints, sprintCards, naturezaProjeto }
}

/** N dias corridos do critério provisório de reabertura (S8, pendente do usuário). */
const DIAS_REABERTURA = 7
const MS_DIA = 86_400_000

function gerarAC(base: BaseMock): ExtensaoAC {
  const reab = derivar(base.config.semente, 'complementares:reabertura')
  const sin = derivar(base.config.semente, 'complementares:sintomas')
  const prob = derivar(base.config.semente, 'complementares:problema')

  const sintomas: Record<string, string> = {}
  const registroProblema: Record<string, boolean> = {}
  for (const c of base.ac.chamados) {
    const n = 3 + (c.categoria_sistema.length % 3)
    const lista = SINTOMAS.slice(0, n)
    sintomas[c.chamado_id] = escolhaPonderada(
      sin,
      lista.map((s, i) => [s, 10 - i * 2] as const),
    )
    if (c.avaliacao_problema !== null) registroProblema[c.chamado_id] = bernoulli(prob, 0.3)
  }

  // Reabertura: vínculo a um incidente posterior da mesma categoria, sem criar chamado.
  const porCategoria = new Map<string, typeof base.ac.chamados>()
  for (const c of base.ac.chamados) {
    if (c.natureza !== 'incidente' || c.excluido) continue
    const l = porCategoria.get(c.categoria_sistema)
    if (l) l.push(c)
    else porCategoria.set(c.categoria_sistema, [c])
  }
  const reabertoDe: Record<string, string> = {}
  for (const lista of porCategoria.values()) {
    const ordenada = [...lista].sort((a, b) => a.aberto_em - b.aberto_em)
    for (const x of ordenada) {
      if (x.status !== 'Concluído' || x.data_finalizado === null) continue
      if (!bernoulli(reab, 0.04)) continue
      const fim = x.data_finalizado
      const y = ordenada.find(
        (z) =>
          z.aberto_em > fim &&
          z.aberto_em <= fim + DIAS_REABERTURA * MS_DIA &&
          reabertoDe[z.chamado_id] === undefined,
      )
      if (y) reabertoDe[y.chamado_id] = x.chamado_id
    }
  }
  return { reabertoDe, sintomas, registroProblema }
}

export function gerarExtensoesMock(base: BaseMock): ExtensoesMetricas {
  return { bm: gerarBM(base), ac: gerarAC(base) }
}
