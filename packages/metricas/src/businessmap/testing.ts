/**
 * Construtores de fixtures pequenas, montadas à mão, para testar uma regra por vez (não usam o gerador).
 * Só para testes.
 */
import { CALENDARIO_PADRAO } from '../core/calendario'
import type { TipoCard, Granularidade } from '@metricas-dspd/contratos'
import { instanteDeIso } from '../core/calendario'
import {
  COLUNAS_TIME,
  type BaseBM,
  type DimCard,
  type DimColuna,
  type FatoBloqueio,
  type FatoTransicao,
} from './modelo'

export const HOJE_TESTE = '2026-10-09T18:00:00-03:00'
const QUADRO = 'quadro-teste'

const colunas: DimColuna[] = COLUNAS_TIME.map((c, i) => ({
  quadro_id: QUADRO,
  ...c,
  ordem: i,
  limite_wip: null,
}))
const t = (iso: string) => instanteDeIso(iso, CALENDARIO_PADRAO)

export interface EspecCard {
  id: string
  tipo?: TipoCard
  gran?: Granularidade
  equipe?: string
  sistema?: string
  criado: string
  /** Pares [coluna, instante ISO] em ordem. */
  trilha: [string, string][]
  retornoEm?: [string, string][]
  pai?: string | null
  descarte?: string
  classe?: DimCard['classe_servico']
  origemBug?: string
  fase?: DimCard['fase_deteccao']
  subtarefa?: boolean
  dataAcordada?: string
  area?: string
}

export function umCard(e: EspecCard): { card: DimCard; trs: FatoTransicao[] } {
  const trs: FatoTransicao[] = []
  let ant: string | null = null
  const todas: [string, string, boolean][] = [
    ...e.trilha.map(([c, i]) => [c, i, false] as [string, string, boolean]),
    ...(e.retornoEm ?? []).map(([c, i], k) => [c, i, k === 0] as [string, string, boolean]),
  ]
  for (const [col, iso, retorno] of todas) {
    const def = colunas.find((c) => c.coluna === col)
    if (!def) throw new Error(`coluna ${col}`)
    trs.push({
      card_id: e.id,
      coluna_origem: ant,
      coluna_destino: col,
      tipo_coluna: def.tipo_coluna,
      usuario: 'Pessoa 01',
      timestamp: t(iso),
      direcao: retorno ? 'retorno' : 'avanco',
    })
    ant = col
  }
  const first = (papel: DimColuna['papel']) =>
    trs.find((x) => colunas.find((c) => c.coluna === x.coluna_destino)?.papel === papel)
      ?.timestamp ?? null
  const ini = trs.find((x) => ['Em desenvolvimento'].includes(x.coluna_destino))?.timestamp ?? null
  const ultima = trs[trs.length - 1]
  const card: DimCard = {
    card_id: e.id,
    titulo: `Card ${e.id}`,
    tipo: e.tipo ?? 'Melhoria',
    classe_servico: e.classe ?? 'Padrão',
    sistema: e.sistema ?? 'Protheus',
    area_solicitante: e.area ?? 'Financeiro',
    fornecedor: null,
    objetivo_estrategico: null,
    card_pai: e.pai ?? null,
    criado_em: t(e.criado),
    comprometido_em: first('compromisso'),
    iniciado_em: ini,
    concluido_em: ultima && ultima.coluna_destino === 'Entregue' ? ultima.timestamp : null,
    arquivado_em: e.descarte ? t(e.descarte) : null,
    motivo_descarte: e.descarte ? 'Duplicado' : null,
    responsaveis: ['Pessoa 01'],
    tamanho_declarado: null,
    granularidade: e.gran ?? 'story',
    equipe: e.equipe ?? 'Equipe A',
    quadro_id: QUADRO,
    coluna_atual: ultima?.coluna_destino ?? null,
    excluido_em: null,
    eh_subtarefa: e.subtarefa ?? false,
    data_acordada: e.dataAcordada ? t(e.dataAcordada) : null,
    responsabilidade_atraso: null,
    origem_demanda: null,
    fase_deteccao: e.fase ?? null,
    severidade: null,
    origem_bug: e.origemBug ?? null,
    adicionado_apos_inicio_pai: false,
  }
  return { card, trs }
}

export function umaBase(especs: EspecCard[], bloqueios: FatoBloqueio[] = []): BaseBM {
  const feitos = especs.map(umCard)
  return {
    cards: feitos.map((x) => x.card),
    transicoes: feitos.flatMap((x) => x.trs).sort((a, b) => a.timestamp - b.timestamp),
    bloqueios,
    colunas,
    fichas: [],
    config: {
      limite_wip_fluxo: { 'Equipe A': 5 },
      limite_frentes: 3,
      sle: [{ classe: 'Padrão', dias_uteis: 5, publicado_em: '2026-06-15' }],
      alocacao: [],
      objetivos: [],
      criterios: [],
      equipes: [{ nome: 'Equipe A', sistemas: ['Protheus'] }],
      sistemas: ['Protheus'],
      areas_internas: ['DSPD (interno)'],
    },
  }
}

/** Trilha típica: criado, compromisso, início, entrega. */
export function trilhaSimples(
  criado: string,
  comp: string,
  ini: string,
  fim: string,
): [string, string][] {
  return [
    ['Aguardando priorização', criado],
    ['Pronto para desenvolver', comp],
    ['Em desenvolvimento', ini],
    ['Entregue', fim],
  ]
}
