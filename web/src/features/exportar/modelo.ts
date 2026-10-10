import {
  APLICABILIDADE_FLUXO,
  METRICAS_SUSTENTACAO,
  type FiltroFluxoChave,
  type FiltrosFluxo,
  type FiltrosSustentacao,
  type MetricaId,
  type OpcoesFiltro,
  type ResultadoVisaoGeral,
  type VersaoCriterio,
} from '@metricas-dspd/contratos'
import type { TextoNota } from '@/components/ui'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { ROTULO_FILTRO, ROTULO_PERIODO } from '@/features/filtros/paineis'
import { fmtData, fmtInteiro, fmtNumero, textoJanela } from '@/lib/formatar'

/**
 * Modelo puro da exportação (pedido 008): DTO + filtros viram blocos de texto e tabela. Nada é recalculado
 * (a regra dos 20 itens, a base e as mudanças de critério já vêm decididas no DTO) e nada identifica pessoa.
 * O desenhista (`desenhista.ts`) só pinta o que este módulo devolve.
 */

export type FonteExportacao = 'BusinessMap' | 'Acelerato'
export const ORDEM_FONTES: readonly FonteExportacao[] = ['BusinessMap', 'Acelerato']

/** Limite de métricas por exportação (plano 008, seção 5). */
export const LIMITE_METRICAS = 12
export const MAX_LINHAS_TABELA = 20
export const MAX_COLUNAS_TABELA = 8

export const RODAPE_PADRAO = 'O sistema não compara equipes nem avalia pessoas.'
export const TEXTO_FICTICIO = 'Dados fictícios'

export interface TabelaBloco {
  colunas: string[]
  linhas: string[][]
  /** Linhas além do limite que não couberam (o PDF avisa). */
  omitidas: number
}

export interface BlocoExportacao {
  /** Id da métrica (`O3`, `EI_FL1`). */
  id: string
  codigo: string
  titulo: string
  fonte: FonteExportacao
  /** Filtros aplicados, em texto. */
  filtros: string
  /** Janela dos dados e, quando há, a janela móvel de percentis. */
  janela: string | null
  base: string
  /** Um texto por ocorrência de "amostra insuficiente" no DTO; vazio se não houve. */
  amostraInsuficiente: string[]
  /** Nota metodológica resumida (a mesma do cartão). */
  nota: string
  /** Mudanças de critério de cálculo que afetam a métrica ("Critério alterado em ..."). */
  criterios: string[]
  /** Dados do cartão em tabela (equivalente textual do gráfico); null se o DTO não tem série tabular. */
  tabela: TabelaBloco | null
}

export interface SecaoExportacao {
  fonte: FonteExportacao
  blocos: BlocoExportacao[]
}

export interface ConteudoExportacao {
  /** Rótulo do escopo para o cabeçalho ("Operacional", "Exportação personalizada"). */
  escopo: string
  mock: boolean
  /** Dados até (AAAA-MM-DD), de `fonte.dataReferencia()`. */
  dataReferencia: string
  /** "10/10/2026 14:30", no fuso de São Paulo. */
  geradoEm: string
  secoes: SecaoExportacao[]
}

/* ---------- nome do arquivo ---------- */

/** Minúsculas, sem acento, só letras, números e hífen. */
export function slugArquivo(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** AAAA-MM-DD no fuso de São Paulo (o dia civil do usuário, não o UTC). */
export function dataCivil(agora: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(agora)
}

/** DD/MM/AAAA HH:MM no fuso de São Paulo. */
export function dataHoraCivil(agora: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(agora)
      .map((x) => [x.type, x.value]),
  )
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`
}

/** `metricas-dspd_<escopo>_<AAAA-MM-DD>[_ficticio].pdf`. */
export function nomeArquivo(escopo: string, agora: Date, mock: boolean): string {
  return `metricas-dspd_${slugArquivo(escopo)}_${dataCivil(agora)}${mock ? '_ficticio' : ''}.pdf`
}

export const excedeLimite = (quantidade: number): boolean => quantidade > LIMITE_METRICAS

/* ---------- filtros em texto ---------- */

const nomeDe = (lista: readonly { id: string; nome: string }[] | undefined, id: string): string =>
  lista?.find((x) => x.id === id)?.nome ?? id

const textoPeriodo = (p: FiltrosFluxo['periodo']): string =>
  p.tipo === 'custom' ? `${fmtData(p.de)} a ${fmtData(p.ate)}` : ROTULO_PERIODO[p.tipo]

const lista = (valores: readonly string[]): string =>
  valores.length > 0 ? valores.join(', ') : 'Todos'

/** Só os filtros que atuam na métrica (tabela 2.2 da spec), com "Todos" quando o filtro está vazio. */
export function textoFiltros(
  id: MetricaId,
  filtros: FiltrosFluxo | FiltrosSustentacao,
  opcoes: OpcoesFiltro | undefined,
): string {
  const equipes = filtros.equipe.map((e) => nomeDe(opcoes?.equipes, e))
  const partes = [`${ROTULO_FILTRO.equipe}: ${lista(equipes)}`]
  if (METRICAS_SUSTENTACAO.includes(id)) {
    partes.push(`${ROTULO_FILTRO.prioridade}: ${lista((filtros as FiltrosSustentacao).prioridade)}`)
  } else {
    const f = filtros as FiltrosFluxo
    const aplicaveis = APLICABILIDADE_FLUXO[id] as readonly FiltroFluxoChave[]
    const sistemas = opcoes?.dominio === 'businessmap' ? opcoes.sistemas : undefined
    if (!aplicaveis.includes('equipe')) partes.pop()
    if (aplicaveis.includes('tipo')) partes.push(`${ROTULO_FILTRO.tipo}: ${lista(f.tipo)}`)
    if (aplicaveis.includes('sistema'))
      partes.push(`${ROTULO_FILTRO.sistema}: ${lista(f.sistema.map((s) => nomeDe(sistemas, s)))}`)
  }
  partes.push(`${ROTULO_FILTRO.periodo}: ${textoPeriodo(filtros.periodo)}`)
  return partes.join(' · ')
}

/* ---------- leitura do DTO (sem recalcular) ---------- */

type Json = unknown
const ehObjeto = (v: Json): v is Record<string, Json> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const ehPrimitivo = (v: Json): v is string | number | boolean | null =>
  v === null || ['string', 'number', 'boolean'].includes(typeof v)

/** Campos que identificariam ou atribuiriam a uma pessoa: nunca entram no arquivo (regra inviolável). */
export const CAMPO_PESSOAL =
  /(pessoa|responsavel|agente|autor|assignee|usuario|dono|owner|atendente)/i
/** Chaves que não viram coluna: já aparecem em linhas próprias do bloco. */
const CHAVES_DO_BLOCO = new Set(['base', 'criterios', 'janelaPercentis'])

/** Todo objeto `{ status: 'insuficiente', n }` do DTO: a decisão dos 20 itens já foi tomada pela biblioteca. */
function coletarInsuficientes(v: Json, achados: number[] = []): number[] {
  if (Array.isArray(v)) for (const x of v) coletarInsuficientes(x, achados)
  else if (ehObjeto(v)) {
    if (v.status === 'insuficiente' && typeof v.n === 'number') achados.push(v.n)
    for (const [k, x] of Object.entries(v))
      if (!CAMPO_PESSOAL.test(k)) coletarInsuficientes(x, achados)
  }
  return achados
}

export function textoInsuficiente(dto: Json): string[] {
  const ns = coletarInsuficientes(dto)
  if (ns.length === 0) return []
  const unicos = [...new Set(ns)].sort((a, b) => a - b)
  const recortes = ns.length === 1 ? '1 recorte' : `${fmtInteiro(ns.length)} recortes`
  return [
    `Amostra insuficiente em ${recortes} (n = ${unicos.map(fmtInteiro).join(', ')}; mínimo de 20 itens). Nenhuma estatística foi publicada nesses recortes.`,
  ]
}

const rotuloColuna = (caminho: string[]): string => {
  const util = caminho.filter((c) => !['estatistica', 'valor'].includes(c))
  const texto = (util.length > 0 ? util : caminho)
    .join(' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function formatarValor(v: string | number | boolean | null): string {
  if (v === null) return '-'
  if (typeof v === 'boolean') return v ? 'sim' : 'não'
  if (typeof v === 'number') return Number.isInteger(v) ? fmtInteiro(v) : fmtNumero(v, 1)
  return v
}

type Celula = { caminho: string[]; valor: string }

/** Achata um objeto em células; estatística `ok` entra pelo `valor`, `insuficiente` vira o texto, e listas internas ficam de fora. */
function achatar(o: Record<string, Json>, caminho: string[] = [], nivel = 0): Celula[] {
  const celulas: Celula[] = []
  for (const [k, v] of Object.entries(o)) {
    if (CAMPO_PESSOAL.test(k) || CHAVES_DO_BLOCO.has(k) || Array.isArray(v)) continue
    const c = [...caminho, k]
    if (ehPrimitivo(v)) celulas.push({ caminho: c, valor: formatarValor(v) })
    else {
      // JSON só tem primitivos, listas (puladas acima) e objetos.
      const o = v as Record<string, Json>
      if (o.status === 'insuficiente') celulas.push({ caminho: c, valor: 'amostra insuficiente' })
      else if (o.status === 'ok' && ehObjeto(o.valor))
        celulas.push(
          { caminho: [...c, 'itens'], valor: formatarValor(o.n as number) },
          ...achatar(o.valor, c, nivel + 1),
        )
      else if (nivel < 2) celulas.push(...achatar(o, c, nivel + 1))
    }
  }
  return celulas
}

/** Listas de objetos do DTO (fora de listas), com o caminho: candidatas a tabela. */
function listasDeObjetos(
  v: Json,
  caminho: string[] = [],
  achadas: { caminho: string[]; itens: Record<string, Json>[] }[] = [],
): { caminho: string[]; itens: Record<string, Json>[] }[] {
  if (!ehObjeto(v)) return achadas
  for (const [k, x] of Object.entries(v)) {
    if (CAMPO_PESSOAL.test(k) || CHAVES_DO_BLOCO.has(k)) continue
    if (Array.isArray(x) && x.length > 0 && x.every(ehObjeto))
      achadas.push({ caminho: [...caminho, k], itens: x })
    else listasDeObjetos(x, [...caminho, k], achadas)
  }
  return achadas
}

/**
 * Tabela dos dados do cartão. Escolhe a lista menor (>= 2 colunas) do DTO, normalmente o resumo por classe;
 * sem lista, vira "Indicador, Valor" com os números do topo. Gráficos não entram: o orçamento F11 não comporta
 * o svg2pdf, e a tabela é o equivalente textual do gráfico.
 */
export function tabelaDoDto(dto: Json): TabelaBloco | null {
  const candidatas = listasDeObjetos(dto)
    .map((l) => ({ ...l, linhas: l.itens.map((i) => achatar(i)) }))
    .filter((l) => (l.linhas[0] as Celula[]).length >= 2)
    .sort((a, b) => a.itens.length - b.itens.length)
  const escolhida = candidatas[0]
  if (escolhida) {
    const colunas = (escolhida.linhas[0] as Celula[]).slice(0, MAX_COLUNAS_TABELA)
    const linhas = escolhida.linhas.map((l) =>
      colunas.map((c) => l.find((x) => x.caminho.join('.') === c.caminho.join('.'))?.valor ?? '-'),
    )
    return {
      colunas: colunas.map((c) => rotuloColuna(c.caminho)),
      linhas: linhas.slice(0, MAX_LINHAS_TABELA),
      omitidas: Math.max(0, linhas.length - MAX_LINHAS_TABELA),
    }
  }
  const topo = ehObjeto(dto) ? achatar(dto) : []
  if (topo.length === 0) return null
  return {
    colunas: ['Indicador', 'Valor'],
    linhas: topo.slice(0, MAX_LINHAS_TABELA).map((c) => [rotuloColuna(c.caminho), c.valor]),
    omitidas: Math.max(0, topo.length - MAX_LINHAS_TABELA),
  }
}

/* ---------- blocos ---------- */

interface DtoComum {
  base: {
    n: number
    unidade: string
    janela: { inicio: string; fim: string } | null
    complemento?: { n: number; unidade: string } | undefined
  }
  criterios: {
    serie: { data: string; descricao: string; id: string }[]
    janela: { data: string; descricao: string; id: string }[]
  }
  janelaPercentis?: {
    inicio: string
    fim: string
    unidade: 'semanas' | 'meses'
    quantidade: number
  }
}

const intervalo = (j: { inicio: string; fim: string }) => `${fmtData(j.inicio)} a ${fmtData(j.fim)}`

export function textoBase(b: DtoComum['base']): string {
  const base = `Base: ${fmtInteiro(b.n)} ${b.unidade}`
  return b.complemento ? `${base}; ${fmtInteiro(b.complemento.n)} ${b.complemento.unidade}` : base
}

export function textoCriterios(c: { data: string; descricao: string; id: string }[]): string[] {
  const vistos = new Set<string>()
  return c
    .filter((x) => !vistos.has(x.id) && vistos.add(x.id))
    .map((x) => `Critério alterado em ${fmtData(x.data)}: ${x.descricao}`)
}

/** Nota resumida: "O que é" e "Como ler" (as mesmas frases do cartão). */
export function resumoDaNota(n: TextoNota): string {
  return `${n.oQueE} ${n.comoLer}`
}

function textoJanelaBloco(d: DtoComum): string | null {
  const dados = d.base.janela ? `Janela dos dados: ${intervalo(d.base.janela)}` : null
  const perc = d.janelaPercentis
    ? `percentis em janela móvel de ${textoJanela(d.janelaPercentis)} (${intervalo(d.janelaPercentis)})`
    : null
  return [dados, perc].filter(Boolean).join('; ') || null
}

export interface EntradaBloco {
  id: MetricaId
  dto: unknown
  filtros: FiltrosFluxo | FiltrosSustentacao
  opcoes: OpcoesFiltro | undefined
  nota: TextoNota
  /** Código exibido (`EI-FL1`); o do catálogo é usado se ausente. */
  codigo?: string
  titulo?: string
}

/** Bloco de uma métrica: tudo que o cartão mostra de obrigatório, lido do DTO. */
export function construirBloco(e: EntradaBloco): BlocoExportacao {
  const d = e.dto as DtoComum
  const cat = entradaDoCatalogo(e.id)
  return {
    id: e.id,
    codigo: e.codigo ?? cat.codigo,
    titulo: e.titulo ?? cat.nome,
    fonte: cat.fonte,
    filtros: textoFiltros(e.id, e.filtros, e.opcoes),
    janela: textoJanelaBloco(d),
    base: textoBase(d.base),
    amostraInsuficiente: textoInsuficiente(e.dto),
    nota: resumoDaNota(e.nota),
    criterios: textoCriterios([...d.criterios.serie, ...d.criterios.janela]),
    tabela: tabelaDoDto(e.dto),
  }
}

const NOME_NIVEL: Record<'operacional' | 'tatico' | 'estrategico' | 'sustentacao', string> = {
  operacional: 'Operacional',
  tatico: 'Tático',
  estrategico: 'Estratégico',
  sustentacao: 'Sustentação',
}

const NOTA_VISAO_GERAL =
  'Resumo dos painéis com os indicadores principais de cada nível. Cada indicador segue a regra da sua métrica; abaixo de 20 itens a estatística não é publicada.'

/**
 * Visão geral: um bloco por nível (cada um de UMA fonte) e um por Espera invisível, todos no formato do DTO
 * (sem somar BusinessMap e Acelerato). Os critérios são os registrados para as métricas do bloco.
 */
export function blocosVisaoGeral(
  dto: ResultadoVisaoGeral,
  criterios: readonly VersaoCriterio[],
): BlocoExportacao[] {
  const criteriosDe = (ids: readonly string[]) =>
    textoCriterios(criterios.filter((c) => c.afeta.some((a) => ids.includes(a))))
  const niveis = dto.niveis.map((n): BlocoExportacao => {
    const recorte =
      n.nivel === 'estrategico'
        ? dto.recortes.estrategico
        : n.nivel === 'sustentacao'
          ? dto.recortes.sustentacao
          : dto.recortes.fluxo
    return {
      id: `VISAO_GERAL_${n.nivel}`,
      codigo: NOME_NIVEL[n.nivel],
      titulo: `Visão geral · ${NOME_NIVEL[n.nivel]}`,
      fonte: n.fonte,
      filtros: 'Padrões do painel de origem',
      janela: `Janela dos dados: ${intervalo(recorte)}`,
      base: 'Base: informada em cada indicador',
      amostraInsuficiente: textoInsuficiente(n),
      nota: NOTA_VISAO_GERAL,
      criterios: criteriosDe(n.indicadores.map((i) => i.metrica)),
      tabela: tabelaDoDto({
        indicadores: n.indicadores,
      }),
    }
  })
  const espera = dto.esperaInvisivel.map((e): BlocoExportacao => ({
    id: `VISAO_GERAL_EI_${e.nivel}`,
    codigo: `EI-${e.nivel}`,
    titulo: `Visão geral · Espera invisível (${e.nivel})`,
    fonte: e.fonte,
    filtros: 'Padrões do painel de origem',
    janela: `Janela dos dados: ${intervalo(dto.recortes[e.fonte === 'Acelerato' ? 'sustentacao' : 'fluxo'])}`,
    base: 'Base: informada em cada segmento',
    amostraInsuficiente: textoInsuficiente(e),
    nota: NOTA_VISAO_GERAL,
    criterios: criteriosDe([`EI_${e.nivel}`]),
    tabela: tabelaDoDto({ segmentos: e.segmentos }),
  }))
  return [...niveis, ...espera]
}

/** Agrupa em seções por fonte: BusinessMap e depois Acelerato, nunca misturadas; seção vazia não existe. */
export function agruparPorFonte(blocos: readonly BlocoExportacao[]): SecaoExportacao[] {
  return ORDEM_FONTES.map((fonte) => ({
    fonte,
    blocos: blocos.filter((b) => b.fonte === fonte),
  })).filter((s) => s.blocos.length > 0)
}

export function montarConteudo(p: {
  escopo: string
  blocos: readonly BlocoExportacao[]
  mock: boolean
  dataReferencia: string
  agora: Date
}): ConteudoExportacao {
  return {
    escopo: p.escopo,
    mock: p.mock,
    dataReferencia: p.dataReferencia,
    geradoEm: dataHoraCivil(p.agora),
    secoes: agruparPorFonte(p.blocos),
  }
}
