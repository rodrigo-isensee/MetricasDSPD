import type {
  DatasProjeto,
  DimCard,
  ExtensaoTambemBM,
  VinculoPredecessor,
} from '@metricas-dspd/metricas/businessmap'
import {
  CALENDARIO_PADRAO as cal,
  diaLocal,
  instanteDe,
  ordenarNeutro,
  proximoDiaUtil,
  somarHorasUteis,
  somarMeses,
} from '@metricas-dspd/metricas/core'
import { bernoulli, escolha, inteiro, lognormal, poisson, uniforme } from '../distribuicoes'
import type { ConfigMock } from '../config'
import { derivar, type Prng } from '../prng'

/**
 * Fase 2 da extensão só de mock do pedido 011 (O22, O26, T13 e E6). Cada campo tem a sua stream
 * (`derivar(semente, 'businessmap/tambem:<campo>')`), então um campo nunca desloca os sorteios de outro e o hash da base
 * e das extensões anteriores não muda. ADR 0020, item 8: `passagens` sai DIRETO como inteiro, sem pessoas,
 * e este arquivo NUNCA lê `responsaveis` nem `usuario` (um teste confere o texto do arquivo).
 * Valores FICTÍCIOS. Função pura de (base, semente), lazy como a fase 1.
 */
export const PARAMETROS_FASE2 = {
  /** O22: mediana (dias úteis) e sigma do atraso até o primeiro toque; teto da cauda. */
  toque: { mediana: 0.7, sigma: 1.1, tetoDiasUteis: 15 },
  /** O22: pedidos abertos mantidos sem nenhum toque (de 5 a 8), sorteados entre os criados nos últimos dias úteis abaixo. */
  semToque: { minimo: 5, maximo: 8, recentesDiasUteis: 12 },
  /** O26: chance de o card não ter `passagens` (entrega anterior à coleta). */
  passagensSemDado: 0.03,
  /** O26: média de passagens de quem tem o menor ciclo e de quem tem o maior (Poisson em r², r = posto do ciclo). */
  passagensLambda: { base: 0.35, acrescimo: 2.6 },
  /** T13: chance de dependência de outro quadro de quem tem o menor e o maior ciclo (média cerca de 35% nas demandas e 50% nas frentes). */
  vinculoStory: { base: 0.15, acrescimo: 0.4 },
  vinculoFrente: { base: 0.3, acrescimo: 0.4 },
  /** T13: parcelas dos vínculos criados: de mesmo quadro (não contam), de quadro desconhecido (semDado) e removidos antes da entrega. */
  vinculoMesmoQuadro: 0.12,
  vinculoDesconhecido: 0.03,
  vinculoRemovido: 0.2,
  /** T13: vínculo criado só depois da entrega (não conta para quem já entregou, R-4). */
  vinculoDepoisDaEntrega: 0.05,
  /** E6: projetos concluídos nos últimos 12 meses com data comprometida registrada (11 a 14, abaixo de 20 de propósito). */
  projetosComData: { minimo: 11, maximo: 14 },
  /** E6: chance de entregar até a data; deslize em dias úteis (negativo = antes). */
  naData: 0.35,
  deslizeAntes: { min: -12, max: 0 },
  deslizeAtraso: { min: 3, max: 63 },
} as const

export interface EntradaFase2 {
  cards: readonly DimCard[]
  config: ConfigMock
}

type Fase2 = Omit<ExtensaoTambemBM, 'entradasSazonais'>

const ativa = (c: DimCard): boolean =>
  !c.eh_subtarefa && c.excluido_em === null && c.motivo_descarte === null

const embaralhar = <T>(r: Prng, itens: readonly T[]): T[] => {
  const a = [...itens]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
}

/** Posto (0 a 1) do ciclo de cada story entregue: o menor ciclo vale 0 e o maior vale 1. */
function postoDoCiclo(stories: readonly DimCard[]): Map<string, number> {
  const entregues = stories
    .filter((c) => c.concluido_em !== null && c.iniciado_em !== null)
    .map((c) => ({
      id: c.card_id,
      dur: (c.concluido_em as number) - (c.iniciado_em as number),
    }))
  const ordenadas = ordenarNeutro(entregues, (e) => [e.dur, e.id])
  const n = ordenadas.length
  return new Map(ordenadas.map((e, i) => [e.id, i / Math.max(1, n - 1)]))
}

export function gerarFase2(base: EntradaFase2): Fase2 {
  const { cards, config } = base
  const hoje = Date.parse(config.hoje)
  const stories = cards.filter((c) => c.granularidade === 'story' && !c.eh_subtarefa)
  const posto = postoDoCiclo(stories)
  const dozeMeses = instanteDe(somarMeses(diaLocal(hoje, cal), -12), 0, cal)
  const P = PARAMETROS_FASE2

  // O22: primeiro comentário humano. Só o instante; nunca autor nem texto.
  const rT = derivar(config.semente, 'businessmap/tambem:primeiro-toque')
  const primeiroToque: Record<string, number | null> = {}
  const abertos = stories.filter(
    (c) => ativa(c) && c.tipo !== 'Bug interno' && c.concluido_em === null,
  )
  // Criados nos últimos `recentesDiasUteis` dias úteis (aproximados em dias corridos).
  const inicioRecente = hoje - Math.ceil((P.semToque.recentesDiasUteis * 7) / 5) * 86_400_000
  const recentes = abertos.filter((c) => c.criado_em >= inicioRecente && c.criado_em <= hoje)
  const quantos = inteiro(rT, P.semToque.minimo, P.semToque.maximo)
  const semToque = new Set(
    embaralhar(rT, recentes)
      .slice(0, quantos)
      .map((c) => c.card_id),
  )
  for (const c of stories) {
    if (c.tipo === 'Bug interno') continue
    if (semToque.has(c.card_id)) {
      primeiroToque[c.card_id] = null
      continue
    }
    const atrasoDu = Math.min(lognormal(rT, P.toque.mediana, P.toque.sigma), P.toque.tetoDiasUteis)
    let t = somarHorasUteis(c.criado_em, atrasoDu * cal.horasPorDia, cal)
    // Antes de entregar o card já teve toque; e quem ainda está aberto não pode ter toque no futuro.
    const teto = c.concluido_em ?? hoje
    if (t > teto) t = c.criado_em + (teto - c.criado_em) * uniforme(rT, 0.1, 0.8)
    primeiroToque[c.card_id] = Math.min(t, hoje)
  }

  // O26: número de passagens por entrega, direto como inteiro (0 a 6), correlacionado ao ciclo. Sem ler responsáveis.
  const rP = derivar(config.semente, 'businessmap/tambem:passagens')
  const passagens: Record<string, number> = {}
  for (const c of stories) {
    const r = posto.get(c.card_id)
    if (r === undefined) continue
    if (bernoulli(rP, P.passagensSemDado)) continue
    passagens[c.card_id] = Math.min(
      6,
      poisson(rP, P.passagensLambda.base + P.passagensLambda.acrescimo * r * r),
    )
  }

  // T13: vínculos `predecessor`, só os que a coleta lê. Uma granularidade (story, frente) por vez, nunca cruzando.
  const rV = derivar(config.semente, 'businessmap/tambem:vinculos')
  const vinculos: VinculoPredecessor[] = []
  const grupos = new Map<string, DimCard[]>()
  for (const c of cards) {
    if (c.eh_subtarefa || c.granularidade === 'projeto') continue
    const k = `${c.granularidade}|${c.quadro_id}`
    const l = grupos.get(k)
    if (l) l.push(c)
    else grupos.set(k, [c])
  }
  const chavesGrupos = [...grupos.keys()].sort()
  const chavesDaGranularidade = {
    story: chavesGrupos.filter((k) => k.startsWith('story|')),
    frente: chavesGrupos.filter((k) => k.startsWith('frente|')),
  }
  for (const c of cards) {
    if (c.eh_subtarefa || c.granularidade === 'projeto') continue
    const par = c.granularidade === 'story' ? P.vinculoStory : P.vinculoFrente
    const r = posto.get(c.card_id) ?? 0.5
    if (!bernoulli(rV, par.base + par.acrescimo * r)) continue
    const mesmo = bernoulli(rV, P.vinculoMesmoQuadro)
    // Quadro do relacionado: o próprio (não conta) ou outro da mesma granularidade; depois, um card dele.
    const proprio = `${c.granularidade}|${c.quadro_id}`
    const outros = chavesDaGranularidade[c.granularidade as 'story' | 'frente'].filter(
      (k) => k !== proprio,
    )
    const quadro = mesmo || outros.length === 0 ? proprio : escolha(rV, outros)
    // `quadro` é sempre uma chave de `grupos` (o próprio quadro do card ou um dos outros), logo o grupo existe e não é vazio.
    const alvo = grupos.get(quadro) as DimCard[]
    const relacionado = escolha(rV, alvo)
    if (relacionado.card_id === c.card_id) continue
    const fim = c.concluido_em ?? hoje
    const conclusao = c.concluido_em
    const depois = conclusao !== null && bernoulli(rV, P.vinculoDepoisDaEntrega)
    const criado =
      conclusao !== null && depois
        ? conclusao + uniforme(rV, 0.5, 20) * 86_400_000
        : c.criado_em + (fim - c.criado_em) * uniforme(rV, 0, 0.7)
    const removido =
      conclusao !== null && !depois && bernoulli(rV, P.vinculoRemovido)
        ? criado + (conclusao - criado) * uniforme(rV, 0.2, 0.9)
        : null
    vinculos.push({
      card_id: c.card_id,
      relacionado_id: relacionado.card_id,
      tipo: 'predecessor',
      outro_quadro: bernoulli(rV, P.vinculoDesconhecido)
        ? null
        : relacionado.quadro_id !== c.quadro_id,
      criado_em: Math.min(criado, hoje),
      removido_em: removido === null ? null : Math.min(removido, hoje),
    })
  }

  // E6: projetos concluídos nos últimos 12 meses; alguns com data comprometida, abaixo de 20 de propósito (variante lenta).
  const rD = derivar(config.semente, 'businessmap/tambem:datas-projeto')
  const concluidos = cards.filter(
    (c) =>
      c.granularidade === 'projeto' &&
      ativa(c) &&
      c.concluido_em !== null &&
      c.concluido_em >= dozeMeses,
  )
  const datasProjeto: Record<string, DatasProjeto> = {}
  const comData = embaralhar(
    rD,
    ordenarNeutro(concluidos, (c) => [c.card_id]),
  ).slice(0, inteiro(rD, P.projetosComData.minimo, P.projetosComData.maximo))
  for (const c of comData) {
    const conclusao = c.concluido_em as number
    const naData = bernoulli(rD, P.naData)
    const deslize = naData
      ? inteiro(rD, P.deslizeAntes.min, P.deslizeAntes.max)
      : inteiro(rD, P.deslizeAtraso.min, P.deslizeAtraso.max)
    const dia = diaLocal(conclusao, cal) - Math.round((deslize * 7) / 5)
    const original0 = instanteDe(proximoDiaUtil(dia, cal), 18 * 60, cal)
    // A data comprometida nunca precede o compromisso do próprio projeto (todo concluído tem compromisso).
    const original = Math.max(original0, (c.comprometido_em as number) + 7 * 86_400_000)
    const replanejamentos = naData ? inteiro(rD, 0, 1) : inteiro(rD, 1, 3)
    datasProjeto[c.card_id] = {
      original,
      final: original + replanejamentos * inteiro(rD, 5, 20) * 86_400_000,
      replanejamentos,
    }
  }

  return {
    primeiroToque,
    passagens,
    vinculos,
    datasProjeto,
  }
}
