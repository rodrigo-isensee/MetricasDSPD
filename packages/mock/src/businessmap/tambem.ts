import type { MotivoBloqueio } from '@metricas-dspd/contratos'
import {
  CALENDARIO_PADRAO as cal,
  ehDiaUtil,
  horasUteisEntre,
  instanteDe,
} from '@metricas-dspd/metricas/core'
import {
  COLUNAS_TIME,
  type DimCard,
  type FatoBloqueio,
  type FatoTransicao,
} from '@metricas-dspd/metricas/businessmap'
import { bernoulli, escolha, uniforme } from '../distribuicoes'
import { derivar } from '../prng'
import {
  AREAS_EXTERNAS,
  MOTIVOS_DESCARTE,
  OBJETIVOS_ESTRATEGICOS,
  PESO_SISTEMA,
  pseudonimo,
  tituloFicticio,
} from './catalogos'

/**
 * Ajuste do mock para a fase 1 de "métricas também disponíveis" (pedido 011, B11a). Pós-processamento determinístico
 * da base do BusinessMap: cada comportamento tem a sua stream (`derivar(semente, 'businessmap/tambem:<campo>')`),
 * então as streams do gerador principal não ganham nem perdem sorteios e o que nenhum ajuste toca sai idêntico.
 * O Acelerato não passa por aqui. Valores de faixa: ver os testes "mock" de cada métrica (O19, O20, O21, O24, O25, T12, E9).
 */
export const PARAMETROS_TAMBEM = {
  /** O25: parcela dos entregues convertida em descarte antes do início. */
  descarteAntes: 0.09,
  /** O25: de cada tantos descartes convertidos, 1 é excluído (garante excluído no período). */
  excluidoACada: 8,
  /** O24: chance de trocar dois vizinhos da fila FIFO (ordem de chegada imperfeita). */
  trocaDeFila: 0.3,
  /** T12: demandas com ida e volta pelo critério (a) e (b), e pelos dois. */
  idaPorBloqueio: 0.15,
  idaPorRetornoAoBacklog: 0.02,
  idaPorAmbos: 0.02,
  /** O21: parcela dos entregues com retorno dentro da execução. */
  retorno: 0.23,
  /** T12: áreas que ficam com poucas demandas e a chance de uma demanda delas mudar de área. */
  areasPequenas: [
    ['Recursos Humanos', 0.85],
    ['Logística', 0.85],
  ] as readonly (readonly [string, number])[],
  /** O19: motivos que passam a ter poucos bloqueios e a chance de mudar de motivo. */
  motivosRaros: [
    ['Dependência de outra demanda', 0.8],
    ['Janela de mudança', 0.8],
  ] as readonly (readonly [MotivoBloqueio, number])[],
  /** O25: cards abertos com motivo de descarte e sem descarte (aviso de preenchimento). */
  avisos: 3,
  /** O23: parcela dos itens em andamento cuja última transição recua para mais de 5 dias úteis atrás. */
  parados: 0.6,
  /** O23: dos itens que começaram há pouco (sem como recuar sem mexer no início), a parcela cujo início recua junto. */
  paradosEnvelhecidos: 0.35,
  /** O23: faixa (dias úteis antes de "hoje") sorteada para a última transição dos parados; começa acima do limite de 5. */
  paradosDias: [6, 14] as readonly [number, number],
  /** E9: idades (dias úteis) dos projetos aprovados e não iniciados que se somam aos do gerador. */
  projetosParados: [95, 140, 200, 255] as readonly number[],
} as const

export const PASSOS_TAMBEM = [
  'descarte',
  'ordem',
  'area',
  'ida-e-volta',
  'retorno',
  'motivo',
  'aviso',
  'parados',
  'projetos',
] as const
export type PassoTambem = (typeof PASSOS_TAMBEM)[number]

export interface EntradaTambem {
  /** Passos a pular (testes: provar que um passo não mexe no que não é dele). Nunca usado na base servida. */
  omitir: readonly PassoTambem[]
  semente: number
  hoje: number
  hojeDia: number
  diaInicioHist: number
  cards: DimCard[]
  transicoes: FatoTransicao[]
  bloqueios: FatoBloqueio[]
  proxId: (prefixo: string) => string
  novoProjeto: (id: string, titulo: string, sistema: string, criado: number) => DimCard
}

const tipoColuna = (coluna: string): 'fila' | 'execucao' =>
  (COLUNAS_TIME.find((c) => c.coluna === coluna) as (typeof COLUNAS_TIME)[number]).tipo_coluna

/** Demanda do time: story que não é subtarefa nem bug interno e não foi excluída. */
const ehDemandaDoTime = (c: DimCard): boolean =>
  c.granularidade === 'story' &&
  c.tipo !== 'Bug interno' &&
  !c.eh_subtarefa &&
  c.excluido_em === null

const HORA_MS = 60 * 60 * 1000

const compactar = <T>(lista: T[], manter: (x: T) => boolean): void => {
  let n = 0
  for (const x of lista) if (manter(x)) lista[n++] = x
  lista.length = n
}

export function aplicarTambemFase1(e: EntradaTambem): void {
  const { semente, hoje, cards, transicoes, bloqueios } = e
  const P = PARAMETROS_TAMBEM

  /* ---------- índice por card (ordem de emissão = ordem do tempo) ---------- */
  const porCard = new Map<string, FatoTransicao[]>()
  for (const t of transicoes) {
    const l = porCard.get(t.card_id)
    if (l) l.push(t)
    else porCard.set(t.card_id, [t])
  }
  const lista = (id: string): FatoTransicao[] => porCard.get(id) as FatoTransicao[]
  const rUsuario = derivar(semente, 'businessmap/tambem:usuario')
  const nova = (
    id: string,
    origem: string | null,
    destino: string,
    timestamp: number,
    direcao: 'avanco' | 'retorno',
  ): FatoTransicao => ({
    card_id: id,
    coluna_origem: origem,
    coluna_destino: destino,
    tipo_coluna: tipoColuna(destino),
    usuario: pseudonimo(rUsuario),
    timestamp,
    direcao,
  })
  /** Insere duas transições entre a do índice `i` e a seguinte (ou o "hoje"): vão e volta no meio do intervalo. */
  const idaEVolta = (
    c: DimCard,
    i: number,
    par: readonly [string, string, string],
    direcaoDaIda: 'retorno',
    fracoes: readonly [number, number],
  ): void => {
    const trs = lista(c.card_id)
    const t0 = (trs[i] as FatoTransicao).timestamp
    const intervalo = (trs[i + 1]?.timestamp ?? hoje) - t0
    const ida = nova(
      c.card_id,
      par[0],
      par[1],
      t0 + Math.floor(intervalo * fracoes[0]),
      direcaoDaIda,
    )
    const volta = nova(c.card_id, par[1], par[2], t0 + Math.floor(intervalo * fracoes[1]), 'avanco')
    trs.splice(i + 1, 0, ida, volta)
    transicoes.push(ida, volta)
  }
  /* ---------- O25: descarte antes do início, excluído e aviso ---------- */
  const passos: Record<PassoTambem, () => void> = {
    /* ---------- O25: descarte antes do início, excluído e aviso ---------- */
    descarte: () => {
      const r = derivar(semente, 'businessmap/tambem:descarte')
      const referenciados = new Set(cards.map((c) => c.origem_bug))
      const removidas = new Set<FatoTransicao>()
      const cardsRemovidos = new Set<string>()
      let n = 0
      for (const c of cards) {
        const trs = lista(c.card_id)
        if (!(
          ehDemandaDoTime(c) &&
          c.classe_servico === 'Padrão' &&
          c.tipo !== 'Defeito em produção' &&
          c.concluido_em !== null &&
          c.arquivado_em === null &&
          !referenciados.has(c.card_id) &&
          !trs.some((t) => t.direcao === 'retorno') &&
          bernoulli(r, P.descarteAntes)
        ))
          continue
        const k = bernoulli(r, 0.5) ? 1 : 2
        const saida = trs[k] as FatoTransicao
        const excluir = n++ % P.excluidoACada === 0
        c.arquivado_em = saida.timestamp
        c.motivo_descarte = excluir ? 'Criado por engano' : escolha(r, MOTIVOS_DESCARTE)
        c.excluido_em = excluir ? saida.timestamp : null
        for (const t of trs.slice(k)) removidas.add(t)
        trs.length = k
        cardsRemovidos.add(c.card_id)
        c.iniciado_em = null
        c.concluido_em = null
        c.coluna_atual = (trs[k - 1] as FatoTransicao).coluna_destino
        c.comprometido_em = k === 2 ? (trs[1] as FatoTransicao).timestamp : null
        c.data_acordada = null
        c.responsabilidade_atraso = null
      }
      compactar(transicoes, (t) => !removidas.has(t))
      compactar(bloqueios, (b) => !cardsRemovidos.has(b.card_id))
    },

    /* ---------- O24: a ordem de chegada passa a ser a regra, com exceções ---------- */
    ordem: () => {
      const r = derivar(semente, 'businessmap/tambem:ordem')
      const criadoDaFrente = new Map(
        cards.filter((c) => c.granularidade === 'frente').map((c) => [c.card_id, c.criado_em]),
      )
      // o card nunca passa a ser criado depois da sua primeira subtarefa ou bug filho
      const primeiroFilho = new Map<string, number>()
      for (const f of cards)
        for (const pai of [f.card_pai, f.origem_bug])
          if (pai !== null && f.criado_em < (primeiroFilho.get(pai) ?? Infinity))
            primeiroFilho.set(pai, f.criado_em)
      const grupos = new Map<string, DimCard[]>()
      for (const c of cards) {
        if (!(
          ehDemandaDoTime(c) &&
          c.classe_servico === 'Padrão' &&
          c.tipo !== 'Defeito em produção'
        ))
          continue
        const chave = `${c.quadro_id}|${c.tipo}`
        const l = grupos.get(chave)
        if (l) l.push(c)
        else grupos.set(chave, [c])
      }
      const sai = (c: DimCard): number =>
        Math.min(c.iniciado_em ?? Infinity, c.arquivado_em ?? Infinity)
      const cmp = (a: number, b: number): number => (a < b ? -1 : a > b ? 1 : 0)
      for (const g of grupos.values()) {
        const porSaida = [...g].sort((a, b) => cmp(sai(a), sai(b)) || cmp(a.criado_em, b.criado_em))
        const criados = g.map((c) => c.criado_em).sort(cmp)
        for (let i = 0; i < criados.length - 1; i++)
          if (bernoulli(r, P.trocaDeFila)) {
            ;[criados[i], criados[i + 1]] = [criados[i + 1] as number, criados[i] as number]
            i++
          }
        porSaida.forEach((c, i) => {
          const trs = lista(c.card_id)
          const piso = criadoDaFrente.get(c.card_pai as string) ?? 0
          const teto = Math.min(trs[1]?.timestamp ?? hoje, primeiroFilho.get(c.card_id) ?? Infinity)
          c.criado_em = Math.max(piso, Math.min(criados[i] as number, teto))
          ;(trs[0] as FatoTransicao).timestamp = c.criado_em
        })
      }
    },

    /* ---------- T12: áreas pequenas e demandas com ida e volta ---------- */
    area: () => {
      const r = derivar(semente, 'businessmap/tambem:area')
      for (const c of cards) {
        if (c.granularidade !== 'story' || c.tipo === 'Bug interno') continue
        const pequena = P.areasPequenas.find(([area]) => area === c.area_solicitante)
        if (pequena && bernoulli(r, pequena[1])) {
          const outras = AREAS_EXTERNAS.filter((a) => !P.areasPequenas.some(([p]) => p === a))
          c.area_solicitante = escolha(r, outras)
        }
      }
    },
    'ida-e-volta': () => {
      const r = derivar(semente, 'businessmap/tambem:ida-e-volta')
      for (const c of cards) {
        if (!(ehDemandaDoTime(c) && c.arquivado_em === null)) continue
        const u = r()
        const porBloqueio = u < P.idaPorBloqueio
        const porRetorno =
          c.comprometido_em !== null &&
          (u < P.idaPorAmbos ||
            (u >= P.idaPorBloqueio && u < P.idaPorBloqueio + P.idaPorRetornoAoBacklog))
        const trs = lista(c.card_id)
        if (porBloqueio) {
          const fimRef = c.iniciado_em ?? hoje
          const ini = Math.round(c.criado_em + (fimRef - c.criado_em) * uniforme(r, 0.2, 0.6))
          const fim = Math.round(ini + (fimRef - ini) * uniforme(r, 0.3, 0.8))
          const emColuna = trs.filter((t) => t.timestamp <= ini).pop() as FatoTransicao
          bloqueios.push({
            card_id: c.card_id,
            motivo: 'Falta de informação no chamado',
            coluna_em_que_bloqueou: emColuna.coluna_destino,
            fornecedor: null,
            inicio: ini,
            fim,
            duracao_horas_uteis: horasUteisEntre(ini, fim, cal),
          })
        }
        if (porRetorno) {
          const i = trs.findIndex((t) => t.coluna_destino === 'Pronto para desenvolver')
          idaEVolta(
            c,
            i,
            ['Pronto para desenvolver', 'Aguardando priorização', 'Pronto para desenvolver'],
            'retorno',
            [0.3, 0.6],
          )
        }
      }
    },

    /* ---------- O21: retorno dentro do intervalo de execução ---------- */
    retorno: () => {
      const r = derivar(semente, 'businessmap/tambem:retorno')
      for (const c of cards) {
        if (!(ehDemandaDoTime(c) && c.concluido_em !== null && c.arquivado_em === null)) continue
        const trs = lista(c.card_id)
        if (trs.some((t) => t.direcao === 'retorno') || !bernoulli(r, P.retorno)) continue
        const iTeste = trs.findIndex((t) => t.coluna_destino === 'Em teste')
        const doTeste = iTeste >= 0 && bernoulli(r, 0.5)
        const coluna = doTeste ? 'Em teste' : 'Em homologação'
        const i = doTeste ? iTeste : trs.findIndex((t) => t.coluna_destino === 'Em homologação')
        idaEVolta(c, i, [coluna, 'Em desenvolvimento', coluna], 'retorno', [0.35, 0.7])
      }
    },

    /* ---------- O19: motivos raros ---------- */
    motivo: () => {
      const r = derivar(semente, 'businessmap/tambem:motivo')
      const destinos: readonly MotivoBloqueio[] = [
        'Aguardando validação do negócio',
        'Aguardando ambiente ou infraestrutura',
        'Falta de informação no chamado',
      ]
      for (const b of bloqueios) {
        const raro = P.motivosRaros.find(([m]) => m === b.motivo)
        if (raro && bernoulli(r, raro[1])) b.motivo = escolha(r, destinos)
      }
    },

    /* ---------- O25: aviso de preenchimento (motivo preenchido, sem descarte) ---------- */
    aviso: () => {
      const r = derivar(semente, 'businessmap/tambem:aviso')
      const abertos = cards.filter(
        (c) =>
          ehDemandaDoTime(c) &&
          c.concluido_em === null &&
          c.arquivado_em === null &&
          c.motivo_descarte === null,
      )
      for (let i = 0; i < P.avisos; i++) {
        const c = abertos.splice(Math.floor(r() * abertos.length), 1)[0] as DimCard
        c.motivo_descarte = escolha(r, MOTIVOS_DESCARTE)
      }
    },

    /* ---------- O23: estoque parado dentro do WIP (última transição recuada, início e coluna intactos) ---------- */
    parados: () => {
      const r = derivar(semente, 'businessmap/tambem:parados')
      const dias: number[] = []
      for (let d = e.hojeDia; dias.length <= P.paradosDias[1]; d--)
        if (ehDiaUtil(d, cal)) dias.push(d)
      const criadoDaFrente = new Map(
        cards.filter((c) => c.granularidade === 'frente').map((c) => [c.card_id, c.criado_em]),
      )
      const ligados = new Set(cards.flatMap((c) => [c.card_pai, c.origem_bug]))
      for (const c of cards) {
        if (
          !(
            ehDemandaDoTime(c) &&
            c.iniciado_em !== null &&
            c.concluido_em === null &&
            c.arquivado_em === null
          ) ||
          !bernoulli(r, P.parados)
        )
          continue
        const trs = lista(c.card_id)
        const ultima = trs[trs.length - 1] as FatoTransicao
        const inicio = c.iniciado_em
        // o recuo cabe entre o início e o limite: sorteia só entre as idades possíveis (6 a 14 dias úteis antes de "hoje")
        const possiveis = dias.filter(
          (d, i) => i >= P.paradosDias[0] && instanteDe(d, 10 * 60, cal) > inicio + HORA_MS,
        )
        if (possiveis.length > 0 && ultima.timestamp !== inicio) {
          // início e coluna intactos: as transições depois do início se comprimem até o novo instante
          const novo = instanteDe(escolha(r, possiveis), 10 * 60, cal)
          if (novo >= ultima.timestamp) continue
          const fator = (novo - inicio) / (ultima.timestamp - inicio)
          for (const t of trs)
            if (t.timestamp > inicio)
              t.timestamp = inicio + Math.floor((t.timestamp - inicio) * fator)
          continue
        }
        // o item começou há pouco: só uma parcela é "envelhecida" (o card inteiro recua junto, sem filhos nem bugs a ele ligados)
        if (!bernoulli(r, P.paradosEnvelhecidos) || ligados.has(c.card_id)) continue
        const alvo = instanteDe(
          escolha(
            r,
            dias.filter((_, i) => i >= P.paradosDias[0]),
          ),
          10 * 60,
          cal,
        )
        const delta = ultima.timestamp - alvo
        const piso = Math.max(
          criadoDaFrente.get(c.card_pai as string) ?? 0,
          instanteDe(e.diaInicioHist, 0, cal),
        )
        if (delta <= 0 || c.criado_em - delta < piso) continue
        for (const t of trs) t.timestamp -= delta
        for (const b of bloqueios)
          if (b.card_id === c.card_id) {
            b.inicio -= delta
            b.fim = b.fim === null ? null : b.fim - delta
          }
        c.criado_em -= delta
        c.iniciado_em = inicio - delta
        c.comprometido_em = (c.comprometido_em as number) - delta // todo item iniciado já foi comprometido
        if (c.data_acordada !== null) c.data_acordada -= delta
      }
    },

    /* ---------- E9: projetos aprovados e não iniciados, com idades em todas as faixas ---------- */
    projetos: () => {
      const r = derivar(semente, 'businessmap/tambem:projetos-parados')
      const dias: number[] = []
      const maisAntigo = P.projetosParados[P.projetosParados.length - 1] as number // a lista é crescente
      for (let d = e.hojeDia; dias.length <= maisAntigo; d--) if (ehDiaUtil(d, cal)) dias.push(d)
      P.projetosParados.forEach((idade, i) => {
        const sistema = escolha(r, PESO_SISTEMA)[0]
        const criado = instanteDe(Math.max(dias[idade] as number, e.diaInicioHist), 10 * 60, cal)
        const p = e.novoProjeto(
          e.proxId('P'),
          tituloFicticio(i + 100, sistema, 'Projeto'),
          sistema,
          criado,
        )
        p.area_solicitante = escolha(r, AREAS_EXTERNAS)
        p.objetivo_estrategico = escolha(r, OBJETIVOS_ESTRATEGICOS)
        p.responsaveis = [pseudonimo(r)]
        p.comprometido_em = criado
        p.coluna_atual = 'Pronto para iniciar'
        cards.push(p)
        transicoes.push({
          card_id: p.card_id,
          coluna_origem: null,
          coluna_destino: 'Pronto para iniciar',
          tipo_coluna: 'fila',
          usuario: pseudonimo(rUsuario),
          timestamp: criado,
          direcao: 'avanco',
        })
      })
    },
  }
  for (const [nome, passo] of Object.entries(passos))
    if (!e.omitir.includes(nome as PassoTambem)) passo()
}
