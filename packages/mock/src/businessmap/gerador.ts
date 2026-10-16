import type {
  ClasseServico,
  FaseDeteccao,
  MotivoBloqueio,
  OrigemDemanda,
  ResponsabilidadeAtraso,
  TipoCard,
} from '@metricas-dspd/contratos'
import { FASES_DETECCAO, MOTIVOS_BLOQUEIO, ORIGENS_DEMANDA } from '@metricas-dspd/contratos'
import {
  CALENDARIO_PADRAO as cal,
  dataIso,
  diaLocal,
  instanteDe,
  instanteDeIso,
  proximoDiaUtil,
  somarHorasUteis,
  somarMeses,
  horasUteisEntre,
  ehDiaUtil,
  MS_HORA,
} from '@metricas-dspd/metricas/core'
import {
  COLUNAS_COORDENACAO,
  COLUNAS_GERENCIA,
  COLUNAS_TIME,
  type BaseBM,
  type DimCard,
  type DimColuna,
  type FatoBloqueio,
  type FatoTransicao,
  type FichaResultado,
  type PapelColuna,
} from '@metricas-dspd/metricas/businessmap'
import type { ConfigMock } from '../config'
import {
  bernoulli,
  escolha,
  escolhaPonderada,
  inteiro,
  lognormal,
  poisson,
  uniforme,
} from '../distribuicoes'
import { CRITERIOS_MOCK } from '../criterios'
import { aplicarTambemFase1, type PassoTambem } from './tambem'
import { derivar, type Prng } from '../prng'
import {
  AREAS_EXTERNAS,
  AREA_INTERNA,
  EQUIPES,
  FORNECEDORES,
  MOTIVOS_DESCARTE,
  OBJETIVOS_ESTRATEGICOS,
  OBJETIVO_OBRIGACAO_LEGAL,
  PESO_SISTEMA,
  SISTEMAS,
  classePorTipo,
  equipeDoSistema,
  pseudonimo,
  tituloFicticio,
} from './catalogos'

interface ColDef {
  coluna: string
  tipo_coluna: 'fila' | 'execucao'
  papel: PapelColuna
}
interface Entrada {
  col: string
  t: number
  retorno?: boolean
}

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const LIMITES_TIME: Record<string, number> = {
  'Em desenvolvimento': 5,
  'Aguardando revisão': 3,
  'Em revisão': 3,
  'Em teste': 3,
  'Aguardando homologação': 3,
  'Em homologação': 3,
}

const hU = (t: number, horas: number): number =>
  Math.round(somarHorasUteis(t, Math.max(horas, 0.05), cal))

/** Passos do fluxo do time (medianas em horas úteis, antes do multiplicador do tipo). */
const PASSOS = [
  { col: 'Pronto para desenvolver', med: 6, sigma: 0.9, pula: false },
  { col: 'Em desenvolvimento', med: 10, sigma: 0.8, pula: false },
  { col: 'Aguardando revisão', med: 3, sigma: 0.8, pula: true },
  { col: 'Em revisão', med: 2, sigma: 0.7, pula: true },
  { col: 'Em teste', med: 4, sigma: 0.8, pula: true },
  { col: 'Aguardando homologação', med: 6, sigma: 1.0, pula: false },
  { col: 'Em homologação', med: 3, sigma: 0.8, pula: false },
] as const

const FILA_ANTES: Record<TipoCard, [number, number]> = {
  Incidente: [2, 1.0],
  Requisição: [24, 1.0],
  Melhoria: [160, 0.9],
  Iniciativa: [160, 0.9],
  'Bug interno': [4, 1.0],
  'Defeito em produção': [6, 1.0],
  'Dívida técnica': [320, 0.9],
}
const MULT_TIPO: Record<TipoCard, number> = {
  Incidente: 0.4,
  Requisição: 0.7,
  Melhoria: 1.6,
  Iniciativa: 1.6,
  'Bug interno': 0.6,
  'Defeito em produção': 0.8,
  'Dívida técnica': 2,
}

export function gerarBaseBusinessMap(
  cfg: ConfigMock,
  opcoes: { tambem?: boolean; omitir?: readonly PassoTambem[] } = {},
): BaseBM {
  const hoje = instanteDeIso(cfg.hoje, cal)
  const hojeDia = diaLocal(hoje, cal)
  const diaInicioHist = somarMeses(hojeDia, -cfg.mesesHistorico)
  const rng = derivar(cfg.semente, 'businessmap')
  const rngProj = derivar(cfg.semente, 'businessmap/projetos')
  const rngOrf = derivar(cfg.semente, 'businessmap/orfaos')
  const rngBug = derivar(cfg.semente, 'businessmap/bugs')
  const rngBlq = derivar(cfg.semente, 'businessmap/bloqueios')

  const cards: DimCard[] = []
  const transicoes: FatoTransicao[] = []
  const trPorCard = new Map<string, FatoTransicao[]>()
  const addTr = (x: FatoTransicao): void => {
    transicoes.push(x)
    const l = trPorCard.get(x.card_id)
    if (l) l.push(x)
    else trPorCard.set(x.card_id, [x])
  }
  const bloqueios: FatoBloqueio[] = []
  const fichas: FichaResultado[] = []
  const contadores: Record<string, number> = {}
  const proxId = (p: string): string => {
    contadores[p] = (contadores[p] ?? 0) + 1
    return `${p}-${String(contadores[p]).padStart(4, '0')}`
  }

  /* ---------- colunas e quadros ---------- */
  const colunas: DimColuna[] = []
  const defsDe = new Map<string, readonly ColDef[]>()
  const quadroTime = (eq: string) => `quadro-${slug(eq)}`
  const quadroCoord = (eq: string) => `coord-${slug(eq)}`
  const addQuadro = (id: string, defs: readonly ColDef[], limites: Record<string, number>) => {
    defsDe.set(id, defs)
    defs.forEach((d, i) =>
      colunas.push({ quadro_id: id, ...d, ordem: i, limite_wip: limites[d.coluna] ?? null }),
    )
  }
  for (const e of EQUIPES) {
    addQuadro(quadroTime(e.nome), COLUNAS_TIME, LIMITES_TIME)
    addQuadro(quadroCoord(e.nome), COLUNAS_COORDENACAO, {})
  }
  addQuadro('quadro-gerencia', COLUNAS_GERENCIA, {})

  /* ---------- emissão de transições e marcos ---------- */
  const novaDim = (
    p: Partial<DimCard> &
      Pick<
        DimCard,
        'card_id' | 'tipo' | 'granularidade' | 'equipe' | 'quadro_id' | 'sistema' | 'criado_em'
      >,
  ): DimCard => ({
    titulo: '',
    classe_servico: 'Padrão',
    area_solicitante: AREA_INTERNA,
    fornecedor: null,
    objetivo_estrategico: null,
    card_pai: null,
    comprometido_em: null,
    iniciado_em: null,
    concluido_em: null,
    arquivado_em: null,
    motivo_descarte: null,
    responsaveis: [],
    tamanho_declarado: null,
    coluna_atual: null,
    excluido_em: null,
    eh_subtarefa: false,
    data_acordada: null,
    responsabilidade_atraso: null,
    origem_demanda: null,
    fase_deteccao: null,
    severidade: null,
    origem_bug: null,
    adicionado_apos_inicio_pai: false,
    ...p,
  })

  function emitir(card: DimCard, entradas: readonly Entrada[]): void {
    const defs = defsDe.get(card.quadro_id) as readonly ColDef[]
    let anterior: string | null = null
    let ultimaEntrega: number | null = null
    let finalEhEntrega = false
    for (const e of entradas) {
      if (e.t > hoje) break
      const d = defs.find((x) => x.coluna === e.col) as ColDef
      addTr({
        card_id: card.card_id,
        coluna_origem: anterior,
        coluna_destino: e.col,
        tipo_coluna: d.tipo_coluna,
        usuario: pseudonimo(rng),
        timestamp: e.t,
        direcao: 'avanco',
      })
      if (d.papel === 'compromisso' && card.comprometido_em === null) card.comprometido_em = e.t
      if (card.iniciado_em === null && d.tipo_coluna === 'execucao' && d.papel === 'trabalho') {
        card.iniciado_em = e.t
      }
      finalEhEntrega = d.papel === 'entrega'
      if (finalEhEntrega) ultimaEntrega = e.t
      anterior = e.col
    }
    card.coluna_atual = anterior
    card.concluido_em = finalEhEntrega ? ultimaEntrega : null
  }

  /** Linha do tempo de uma story: entradas por coluna até a entrega. */
  function linhaStory(
    r: Prng,
    criado: number,
    mult: number,
    fila: [number, number],
    rapido: boolean,
  ): Entrada[] {
    const out: Entrada[] = [{ col: 'Aguardando priorização', t: criado }]
    let t = hU(criado, lognormal(r, fila[0], fila[1]))
    for (const p of PASSOS) {
      if (p.pula && rapido && bernoulli(r, 0.35)) continue
      out.push({ col: p.col, t })
      t = hU(t, lognormal(r, p.med * mult, p.sigma))
    }
    out.push({ col: 'Entregue', t })
    return out
  }

  function aplicarDescarte(r: Prng, card: DimCard, linha: Entrada[], p: number): Entrada[] {
    if (!bernoulli(r, p)) return linha
    const k = inteiro(r, 0, Math.min(5, linha.length - 2))
    const saida = linha[k + 1]
    if (!saida || saida.t > hoje) return linha
    card.arquivado_em = saida.t
    card.motivo_descarte = escolha(r, MOTIVOS_DESCARTE)
    if (bernoulli(r, 0.12)) {
      card.excluido_em = saida.t
      card.motivo_descarte = 'Criado por engano'
    }
    return linha.slice(0, k + 1)
  }

  /** Cria bloqueios (não movem o card de coluna) para um card já emitido. */
  function criarBloqueios(card: DimCard, p: number): void {
    if (card.iniciado_em === null || card.arquivado_em !== null) return
    const fimAtivo = card.concluido_em ?? hoje
    const emTrans = trPorCard.get(card.card_id) as FatoTransicao[]
    const colunaEm = (t: number): string => {
      let c = card.coluna_atual as string
      for (const x of emTrans) {
        if (x.timestamp <= t) c = x.coluna_destino
        else break
      }
      return c
    }
    const aberto = card.concluido_em === null
    if (!bernoulli(rngBlq, aberto ? 0.12 : p)) return
    const n = inteiro(rngBlq, 1, 3)
    const totalH = horasUteisEntre(card.iniciado_em, fimAtivo, cal)
    let cursor = card.iniciado_em
    for (let i = 0; i < n; i++) {
      const off = uniforme(rngBlq, 0, Math.max(totalH * 0.8, 0.5))
      const ini = Math.max(hU(card.iniciado_em, off), cursor)
      if (ini >= fimAtivo) break
      const durH = lognormal(rngBlq, 8, 0.9)
      let fim: number | null = hU(ini, durH)
      if (fim > fimAtivo) fim = card.concluido_em !== null ? card.concluido_em : null
      const motivo = escolha(rngBlq, MOTIVOS_BLOQUEIO) as MotivoBloqueio
      const coluna = colunaEm(ini)
      bloqueios.push({
        card_id: card.card_id,
        motivo,
        coluna_em_que_bloqueou: coluna,
        fornecedor:
          motivo === 'Aguardando fornecedor' || motivo === 'Aguardando licença ou contrato'
            ? escolha(rngBlq, FORNECEDORES)
            : null,
        inicio: ini,
        fim,
        duracao_horas_uteis: fim === null ? null : horasUteisEntre(ini, fim, cal),
      })
      if (fim === null) break
      cursor = fim
    }
  }

  /** data_acordada / responsabilidade (O12). */
  function acordar(r: Prng, card: DimCard, forcar: boolean): void {
    if (card.comprometido_em === null) return
    if (!forcar && !bernoulli(r, 0.3)) return
    const compromisso = card.comprometido_em
    if (card.concluido_em !== null) {
      const hrs = horasUteisEntre(compromisso, card.concluido_em, cal)
      card.data_acordada = hU(compromisso, Math.max(2, hrs * lognormal(r, 1.4, 0.35)))
    } else {
      card.data_acordada = hU(compromisso, lognormal(r, 60, 0.6))
    }
    const vencido = card.data_acordada < (card.concluido_em ?? hoje)
    if (vencido) {
      card.responsabilidade_atraso = bernoulli(r, 0.15)
        ? null
        : (escolhaPonderada(r, [
            ['Interno', 40],
            ['Solicitante', 30],
            ['Terceiro', 15],
          ] as const) as ResponsabilidadeAtraso)
    }
  }

  function origemDemanda(r: Prng, sistema: string): OrigemDemanda | null {
    const pf: Record<string, number> = {
      Protheus: 0.38,
      Fluig: 0.25,
      Senior: 0.2,
      CRM: 0.15,
      'Site/Marketing': 0.1,
      'Data Lake': 0.1,
      'Core 5G': 0.12,
      'Portal do cliente': 0.3,
    }
    if (!bernoulli(r, pf[sistema] as number)) return null
    return escolhaPonderada(r, [
      [ORIGENS_DEMANDA[0], 20],
      [ORIGENS_DEMANDA[1], 22],
      [ORIGENS_DEMANDA[2], 30],
      [ORIGENS_DEMANDA[3], 16],
      [ORIGENS_DEMANDA[4], 12],
    ] as const)
  }

  /* ---------- fábrica de story ---------- */
  interface OpcStory {
    r: Prng
    tipo: TipoCard
    criado: number
    sistema: string
    equipe: string
    pai: string | null
    mult: number
    fila: [number, number]
    descarte: number
    esquecido?: boolean
    classe?: ClasseServico
    origemBug?: string
    fase?: FaseDeteccao
    area?: string
  }
  let seqTitulo = 0
  function criarStory(o: OpcStory): DimCard {
    const { r } = o
    const rapido = o.tipo === 'Incidente' || o.tipo === 'Requisição'
    const area =
      o.area ??
      (o.tipo === 'Dívida técnica' || o.tipo === 'Bug interno' || bernoulli(r, 0.12)
        ? AREA_INTERNA
        : escolha(r, AREAS_EXTERNAS))
    const card = novaDim({
      card_id: proxId('S'),
      titulo: tituloFicticio(seqTitulo++, o.sistema, o.tipo),
      tipo: o.tipo,
      classe_servico: o.classe ?? classePorTipo(o.tipo, r()),
      sistema: o.sistema,
      area_solicitante: area,
      fornecedor: null,
      card_pai: o.pai,
      criado_em: o.criado,
      granularidade: 'story',
      equipe: o.equipe,
      quadro_id: quadroTime(o.equipe),
      responsaveis: [pseudonimo(r)],
      tamanho_declarado: escolha(r, ['P', 'M', 'G'] as const),
      origem_demanda:
        o.tipo === 'Bug interno' || o.tipo === 'Defeito em produção' || o.tipo === 'Dívida técnica'
          ? null
          : origemDemanda(r, o.sistema),
      origem_bug: o.origemBug ?? null,
      fase_deteccao: o.fase ?? null,
      severidade: o.fase ? escolha(r, ['Crítica', 'Alta', 'Média', 'Baixa'] as const) : null,
    })
    let linha = linhaStory(r, o.criado, o.mult, o.esquecido ? [2400, 0.5] : o.fila, rapido)
    linha = aplicarDescarte(r, card, linha, o.descarte)
    cards.push(card)
    emitir(card, linha)
    return card
  }

  /* ---------- reabertura (P10) ---------- */
  function reabrir(r: Prng, card: DimCard): void {
    if (
      card.concluido_em === null ||
      card.tipo === 'Bug interno' ||
      card.tipo === 'Defeito em produção'
    )
      return
    if (!bernoulli(r, 0.03)) return
    const tR = hU(card.concluido_em, lognormal(r, 40, 0.8))
    if (tR > hoje) return
    const mult = 1
    const t1 = hU(tR, lognormal(r, 6 * mult, 0.7))
    const t2 = hU(t1, lognormal(r, 3, 0.7))
    const entradas: Entrada[] = [
      { col: 'Em desenvolvimento', t: tR, retorno: true },
      { col: 'Em homologação', t: t1 },
      { col: 'Entregue', t: t2 },
    ]
    const defs = defsDe.get(card.quadro_id) as readonly ColDef[]
    let anterior: string | null = 'Entregue'
    for (const e of entradas) {
      if (e.t > hoje) break
      const d = defs.find((x) => x.coluna === e.col) as ColDef
      addTr({
        card_id: card.card_id,
        coluna_origem: anterior,
        coluna_destino: e.col,
        tipo_coluna: d.tipo_coluna,
        usuario: pseudonimo(rng),
        timestamp: e.t,
        direcao: e.retorno ? 'retorno' : 'avanco',
      })
      anterior = e.col
    }
    card.coluna_atual = anterior
    card.concluido_em = anterior === 'Entregue' ? t2 : null
    // defeito vinculado para a contagem de qualidade (4.2)
    criarStory({
      r,
      tipo: 'Defeito em produção',
      criado: tR,
      sistema: card.sistema,
      equipe: card.equipe,
      pai: null,
      mult: MULT_TIPO['Defeito em produção'],
      fila: FILA_ANTES['Defeito em produção'],
      descarte: 0,
      origemBug: card.card_id,
      fase: 'Produção',
      area: card.area_solicitante,
    })
  }

  /** Bugs gerados a partir de uma story entregue (O15, O18). */
  function gerarBugs(card: DimCard): void {
    if (card.concluido_em === null || card.iniciado_em === null) return
    const lambda = bernoulli(rngBug, 0.85) ? (card.tipo === 'Melhoria' ? 0.12 : 0.04) : 1.5
    const n = poisson(rngBug, lambda)
    for (let i = 0; i < n; i++) {
      const fase = escolhaPonderada(rngBug, [
        [FASES_DETECCAO[0], 32],
        [FASES_DETECCAO[1], 24],
        [FASES_DETECCAO[2], 26],
        [FASES_DETECCAO[3], 12],
        [FASES_DETECCAO[4], 6],
      ] as const)
      let criado: number
      let tipo: TipoCard
      if (fase === 'Produção') {
        tipo = 'Defeito em produção'
        criado = instanteDe(diaLocal(card.concluido_em, cal) + inteiro(rngBug, 1, 60), 10 * 60, cal)
      } else {
        tipo = 'Bug interno'
        criado = card.iniciado_em + Math.floor(rngBug() * (card.concluido_em - card.iniciado_em))
      }
      if (criado > hoje) continue
      criarStory({
        r: rngBug,
        tipo,
        criado,
        sistema: card.sistema,
        equipe: card.equipe,
        pai: null,
        mult: MULT_TIPO[tipo],
        fila: FILA_ANTES[tipo],
        descarte: 0.02,
        origemBug: card.card_id,
        fase,
        area: tipo === 'Bug interno' ? AREA_INTERNA : card.area_solicitante,
      })
    }
  }

  const finalizarStory = (card: DimCard, r: Prng, forcarAcordo = false): void => {
    acordar(r, card, forcarAcordo || card.classe_servico === 'Prazo fixo')
    criarBloqueios(card, 0.2)
    reabrir(r, card)
    gerarBugs(card)
  }

  /* ---------- demanda sem projeto (sustentação e não planejada) ---------- */
  {
    const dias: number[] = []
    for (let d = diaInicioHist; d <= hojeDia; d++) if (ehDiaUtil(d, cal)) dias.push(d)
    const lambda = (1500 * cfg.escala) / dias.length
    for (const d of dias) {
      const n = poisson(rngOrf, lambda)
      for (let i = 0; i < n; i++) {
        const sistema = escolhaPonderada(rngOrf, PESO_SISTEMA)
        const equipe = bernoulli(rngOrf, 0.95)
          ? equipeDoSistema(sistema)
          : escolha(rngOrf, EQUIPES).nome
        const tipo = escolhaPonderada(rngOrf, [
          ['Incidente', 32],
          ['Requisição', 38],
          ['Melhoria', 24],
          ['Dívida técnica', 6],
        ] as const) as TipoCard
        const criado = instanteDe(d, 8 * 60 + inteiro(rngOrf, 0, 9 * 60 - 1), cal)
        if (criado > hoje) continue
        const card = criarStory({
          r: rngOrf,
          tipo,
          criado,
          sistema,
          equipe,
          pai: null,
          mult: MULT_TIPO[tipo],
          fila: FILA_ANTES[tipo],
          descarte: 0.06,
          esquecido:
            (tipo === 'Melhoria' && bernoulli(rngOrf, 0.1)) ||
            (tipo === 'Dívida técnica' && bernoulli(rngOrf, 0.3)),
        })
        finalizarStory(card, rngOrf)
      }
    }
  }

  /* ---------- projetos -> frentes -> stories ---------- */
  const nProjetos = Math.max(4, Math.round(40 * cfg.escala))
  const diaIniProj = somarMeses(hojeDia, -cfg.mesesHistorico) + 14
  const diaFimProj = somarMeses(hojeDia, -1)
  let adicionadoGarantido = false
  const iniciativasIdx = new Set<number>()
  while (iniciativasIdx.size < Math.min(11, nProjetos))
    iniciativasIdx.add(inteiro(rngProj, 0, nProjetos - 1))
  const iniciativasSemFicha = new Set<number>()
  for (const i of [...iniciativasIdx].slice(0, 2)) iniciativasSemFicha.add(i)

  for (let pi = 0; pi < nProjetos; pi++) {
    const r = rngProj
    const sistema = escolhaPonderada(r, PESO_SISTEMA)
    const eIniciativa = iniciativasIdx.has(pi)
    const dia = proximoDiaUtil(inteiro(r, diaIniProj, diaFimProj), cal)
    const criadoP = instanteDe(dia, 10 * 60, cal)
    const inicioP = hU(criadoP, lognormal(r, 320, 0.6))
    const horizonteH = lognormal(r, 480, 0.5)
    const objetivo = bernoulli(r, 0.1)
      ? OBJETIVO_OBRIGACAO_LEGAL
      : bernoulli(r, 0.15)
        ? null
        : escolha(r, OBJETIVOS_ESTRATEGICOS)
    const projeto = novaDim({
      card_id: proxId('P'),
      titulo: tituloFicticio(pi, sistema, 'Projeto'),
      tipo: eIniciativa ? 'Iniciativa' : 'Melhoria',
      sistema,
      area_solicitante: escolha(r, AREAS_EXTERNAS),
      objetivo_estrategico: objetivo,
      criado_em: criadoP,
      granularidade: 'projeto',
      equipe: 'Portfólio',
      quadro_id: 'quadro-gerencia',
      responsaveis: [pseudonimo(r)],
    })

    const nOrig = inteiro(r, 3, 8)
    const nAdd =
      bernoulli(r, 0.35) || (!adicionadoGarantido && pi === nProjetos - 1) ? inteiro(r, 1, 4) : 0
    if (nAdd > 0) adicionadoGarantido = true
    let projetoCompleto = true
    let ultimaEntregaFrente = criadoP

    for (let fi = 0; fi < nOrig + nAdd; fi++) {
      const adicionada = fi >= nOrig
      const criadoF = adicionada
        ? hU(inicioP, uniforme(r, 4, Math.max(8, horizonteH * 0.6)))
        : Math.floor(criadoP + r() * Math.max(inicioP - criadoP, MS_HORA))
      if (criadoF > hoje) {
        projetoCompleto = false
        continue
      }
      const equipeF = bernoulli(r, 0.9) ? equipeDoSistema(sistema) : escolha(r, EQUIPES).nome
      const frente = novaDim({
        card_id: proxId('F'),
        titulo: tituloFicticio(fi + pi * 9, sistema, 'Frente'),
        tipo: 'Melhoria',
        sistema,
        area_solicitante: projeto.area_solicitante,
        card_pai: projeto.card_id,
        criado_em: criadoF,
        granularidade: 'frente',
        equipe: equipeF,
        quadro_id: quadroCoord(equipeF),
        adicionado_apos_inicio_pai: adicionada,
        responsaveis: [pseudonimo(r)],
      })
      const compF = adicionada ? hU(criadoF, lognormal(r, 24, 0.6)) : 0
      const inicioF = adicionada
        ? hU(compF, lognormal(r, 16, 0.8))
        : hU(inicioP, uniforme(r, 0, horizonteH * 0.7))
      const compromissoF = adicionada
        ? compF
        : Math.round(Math.max(criadoF, inicioF - lognormal(r, 60, 0.6) * MS_HORA))
      const durF = lognormal(r, 90, 0.5)
      cards.push(frente)

      // 4% das frentes são descartadas antes de começar
      if (bernoulli(r, 0.04) && compromissoF <= hoje) {
        frente.arquivado_em = compromissoF
        frente.motivo_descarte = 'Cancelado pelo solicitante'
        emitir(frente, [
          { col: 'Aguardando priorização', t: criadoF },
          { col: 'Pronto para iniciar', t: compromissoF },
        ])
        continue
      }

      const nStories = inteiro(r, 4, 20)
      let ultimaEntrega = 0
      let frenteCompleta = true
      for (let si = 0; si < nStories; si++) {
        const off = uniforme(r, -40, durF * 0.6)
        const criadoS = Math.max(
          criadoF,
          off < 0 ? Math.round(inicioF + off * MS_HORA) : hU(inicioF, off),
        )
        if (criadoS > hoje) {
          frenteCompleta = false
          continue
        }
        const semPai = bernoulli(r, 0.03)
        const story = criarStory({
          r,
          tipo: 'Melhoria',
          criado: criadoS,
          sistema,
          equipe: equipeF,
          pai: semPai ? null : frente.card_id,
          mult: 1,
          fila: [24, 0.8],
          descarte: 0.06,
          area: frente.area_solicitante,
        })
        finalizarStory(story, r)
        if (story.arquivado_em !== null) continue
        if (story.concluido_em === null) frenteCompleta = false
        else ultimaEntrega = Math.max(ultimaEntrega, story.concluido_em)
      }

      const entradasF: Entrada[] = [
        { col: 'Aguardando priorização', t: criadoF },
        { col: 'Pronto para iniciar', t: compromissoF },
        { col: 'Em execução', t: inicioF },
      ]
      if (frenteCompleta && ultimaEntrega > 0) {
        const entregaF = hU(ultimaEntrega, uniforme(r, 4, 24))
        entradasF.push({ col: 'Entregue', t: entregaF })
        ultimaEntregaFrente = Math.max(ultimaEntregaFrente, entregaF)
        if (entregaF > hoje) projetoCompleto = false
      } else {
        projetoCompleto = false
      }
      emitir(frente, entradasF)
      criarBloqueios(frente, 0)
    }

    const entradasP: Entrada[] = [
      { col: 'Pronto para iniciar', t: criadoP },
      { col: 'Em execução', t: inicioP },
    ]
    if (projetoCompleto)
      entradasP.push({ col: 'Entregue', t: hU(ultimaEntregaFrente, uniforme(r, 8, 40)) })
    cards.push(projeto)
    emitir(projeto, entradasP)

    if (eIniciativa) {
      const concluido = projeto.concluido_em !== null
      const previsto = inteiro(r, 20, 200)
      if (!iniciativasSemFicha.has(pi)) {
        fichas.push({
          card_id: projeto.card_id,
          resultado_esperado: `Reduzir o tempo de ${escolha(r, ['fechamento mensal', 'atendimento ao cliente', 'conciliação', 'provisionamento'])}`,
          declarado_antes_do_inicio: !bernoulli(r, 0.1),
          unidade: escolha(r, ['horas por mês', 'dias por ciclo', '% de retrabalho']),
          ganho_previsto: previsto,
          ganho_medido: concluido ? Math.round(previsto * uniforme(r, 0.4, 1.3)) : null,
          medida: concluido ? 'Medido 60 dias após a entrega' : 'A medir após a entrega',
          data_declaracao: dataIso(criadoP - 3 * 86400000, cal),
        })
      }
    }
  }

  const aloc = [
    { natureza: 'Sustentação', pct: 30 },
    { natureza: 'Evolução', pct: 15 },
    { natureza: 'Projetos', pct: 45 },
    { natureza: 'Dívida técnica', pct: 10 },
  ] as const

  // limites de WIP por fluxo (uma linha por equipe)
  const limiteFluxo: Record<string, number> = {}
  for (const e of EQUIPES) limiteFluxo[e.nome] = 14

  // B11a (pedido 011): ajuste da fase 1 sobre a base pronta, em streams próprias (ver `tambem.ts`).
  if (opcoes.tambem !== false)
    aplicarTambemFase1({
      omitir: opcoes.omitir ?? [],
      semente: cfg.semente,
      hoje,
      hojeDia,
      diaInicioHist,
      cards,
      transicoes,
      bloqueios,
      proxId,
      novoProjeto: (id, titulo, sistema, criado) =>
        novaDim({
          card_id: id,
          titulo,
          tipo: 'Melhoria',
          sistema,
          criado_em: criado,
          granularidade: 'projeto',
          equipe: 'Portfólio',
          quadro_id: 'quadro-gerencia',
        }),
    })

  return {
    cards,
    transicoes: transicoes.sort(
      (a, b) => a.timestamp - b.timestamp || a.card_id.localeCompare(b.card_id),
    ),
    bloqueios,
    colunas,
    fichas,
    config: {
      limite_wip_fluxo: limiteFluxo,
      limite_frentes: 12,
      sle: [
        { classe: 'Urgente', dias_uteis: 4, publicado_em: '2026-06-15' },
        { classe: 'Prazo fixo', dias_uteis: 8, publicado_em: '2026-06-15' },
        { classe: 'Padrão', dias_uteis: 5, publicado_em: '2026-06-15' },
        { classe: 'Intangível', dias_uteis: null, publicado_em: '2026-06-15' },
      ],
      alocacao: aloc.map((a) => ({ ...a })),
      objetivos: [...OBJETIVOS_ESTRATEGICOS],
      criterios: CRITERIOS_MOCK,
      equipes: EQUIPES.map((e) => ({ nome: e.nome, sistemas: [...e.sistemas] })),
      sistemas: [...SISTEMAS],
      areas_internas: [AREA_INTERNA],
    },
  }
}
