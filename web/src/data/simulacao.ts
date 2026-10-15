import type {
  Dominio,
  EstadoColeta,
  MetricaId,
  PaginaColetas,
  ResultadoPV1,
  ResultadoTendenciaFluxo,
  ResultadoTendenciaSust,
} from '@metricas-dspd/contratos'
import { fonteDaMetrica } from '@metricas-dspd/contratos'

/**
 * Parâmetro oculto `?mock=` (spec de UX 6.6): força estados para validação e QA.
 *   carregando            todos os cartões no esqueleto, indefinidamente
 *   erro                  erro de painel ("Não foi possível abrir este painel")
 *   vazio                 todos os cartões no estado vazio
 *   erro:{ids}            só os cartões listados falham, em todas as tentativas (ex.: erro:o3,t1)
 *   erro-uma-vez:{ids}    só os listados falham na primeira carga; "Tentar de novo" funciona
 * Ids = ids de âncora (minúsculas, com hífen: `ei-fl1`, `bloqueados`); id inexistente é ignorado.
 *   coleta-atrasada:bm|ac   selo "Atrasado" na fonte indicada (bm = BusinessMap, ac = Acelerato)
 *   coleta-vazia:bm|ac      fonte sem nenhuma coleta ("Ainda não há coletas desta fonte")
 *   coleta-erro:bm|ac       falha de leitura do estado e do histórico da fonte ("Tentar de novo")
 *   sem-calibracao          nenhuma janela de calibração vigente (cartões mostram Dentro/Fora da meta)
 *   pesquisa:sem            PV1 no estado "sem pesquisa" (nenhuma carga da pesquisa)
 *   pesquisa:insuficiente   PV1 com 4 respostas no trimestre (base insuficiente, sem faixas nem percentuais)
 *   tendencia-poucos        Resumo do Operacional: meses com menos de 20 itens nas duas tendências (junho no fluxo;
 *                           junho com 3 prioridades e julho sem nenhuma, na Sustentação), para ver o marcador vazado
 * (`carregando` também deixa o estado de coleta carregando.)
 * O parâmetro vale só para a página que o contém: os links não o propagam nem o "Copiar link".
 */
export type SiglaFonte = 'bm' | 'ac'
export type ModoColeta = 'coleta-atrasada' | 'coleta-vazia' | 'coleta-erro'
export type ModoMock =
  | 'carregando'
  | 'erro'
  | 'vazio'
  | `erro:${string}`
  | `erro-uma-vez:${string}`
  | `${ModoColeta}:${SiglaFonte}`
  | 'sem-calibracao'
  | 'pesquisa:sem'
  | 'pesquisa:insuficiente'
  | 'tendencia-poucos'

const DOMINIO_DA_SIGLA: Record<SiglaFonte, Dominio> = { bm: 'businessmap', ac: 'acelerato' }

export class ErroSimulado extends Error {
  readonly codigo = 'MOCK_ERRO_SIMULADO'
  constructor(id: string) {
    super(`Erro simulado em ${id}`)
    this.name = 'ErroSimulado'
  }
}

export function lerModoMock(valor: string | null): ModoMock | null {
  if (!valor) return null
  const v = valor.trim().toLowerCase()
  if (v === 'carregando' || v === 'erro' || v === 'vazio' || v === 'sem-calibracao') return v
  if (v === 'pesquisa:sem' || v === 'pesquisa:insuficiente' || v === 'tendencia-poucos') return v
  if (/^coleta-(atrasada|vazia|erro):(bm|ac)$/.test(v)) return v as ModoMock
  if (/^(erro|erro-uma-vez):[a-z0-9_-]+(,[a-z0-9_-]+)*$/.test(v)) return v as ModoMock
  return null
}

/** `EI_FL1` -> `ei-fl1`: o id de âncora usado na URL. */
export const idDeAncora = (id: string): string => id.toLowerCase().replace(/_/g, '-')

function idsDoModo(modo: ModoMock, prefixo: 'erro:' | 'erro-uma-vez:'): string[] | null {
  return modo.startsWith(prefixo) ? modo.slice(prefixo.length).split(',') : null
}

/** true se o modo é o erro de painel (`mock=erro`): a página inteira falha, não os cartões. */
export const ehErroDePainel = (modo: ModoMock | null): boolean => modo === 'erro'

const SEM_DADOS = '__sem-dados__'

const ehTendencia = (id: MetricaId): boolean => id === 'TENDENCIA_FLUXO' || id === 'TENDENCIA_SUST'

/** Filtros que não casam com nenhum registro, para forçar o estado vazio sem tocar nos DTOs. */
export function filtrosSemDados<F>(id: MetricaId, filtros: F): F {
  const base = filtros as Record<string, unknown>
  const fonte = fonteDaMetrica(id)
  // A pesquisa só aceita `dataReferencia`: nenhum filtro a esvazia, e o "sem pesquisa" é um estado próprio.
  if (fonte === 'pesquisa') return filtros
  return fonte === 'acelerato'
    ? ({ ...base, equipe: [SEM_DADOS] } as F)
    : ({ ...base, equipe: [SEM_DADOS], sistema: [SEM_DADOS] } as F)
}

/** PV1 com 4 respostas no trimestre vigente (mínimo 5): só o total, sem faixas, áreas nem percentuais. */
function pesquisaInsuficiente(r: unknown): unknown {
  const v = r as ResultadoPV1
  if (v.status !== 'ok') return r
  const bloco = { status: 'base-insuficiente', n: 4, minimo: 5 } as const
  return {
    ...v,
    consolidado: bloco,
    participacao: {
      respondentes: 4,
      convidados: 10,
      taxa: { status: 'insuficiente', k: 4, n: 10, minimo: 20 },
    },
    porArea: { status: 'nao-publicado', motivo: 'base-insuficiente' },
    tendencia: v.tendencia.slice(-1).map((t) => ({ ...t, bloco })),
    base: { ...v.base, n: 4 },
  } satisfies ResultadoPV1
}

const POUCOS = 14

/** Mês da tendência do fluxo com todos os tipos abaixo de 20 itens na janela (estatística não publicada). */
function fluxoComPoucos(r: ResultadoTendenciaFluxo): ResultadoTendenciaFluxo {
  return {
    ...r,
    meses: r.meses.map((m, i) =>
      i === 2
        ? {
            ...m,
            p85PorTipo: m.p85PorTipo.map((c) => ({
              ...c,
              n: POUCOS,
              estatistica: {
                status: 'insuficiente' as const,
                n: POUCOS,
                minimo: 20 as const,
                janela: m.janelaPercentis,
              },
            })),
          }
        : m,
    ),
  }
}

/** Tendência da Sustentação: em junho a P2 fica com menos de 20 chamados (sobram 3 prioridades avaliadas) e em julho nenhuma prioridade chega a 20. */
function sustComPoucos(r: ResultadoTendenciaSust): ResultadoTendenciaSust {
  const sem = (
    c: ResultadoTendenciaSust['meses'][number]['prioridades'][number]['restauracao'],
  ) => ({
    taxa: { status: 'insuficiente' as const, k: 0, n: POUCOS, minimo: 20 as const },
    statusMeta: c.statusMeta === 'sem-referencia' ? c.statusMeta : ('sem-referencia' as const),
  })
  return {
    ...r,
    meses: r.meses.map((m, i) => {
      if (i !== 2 && i !== 3) return m
      return {
        ...m,
        prioridades: m.prioridades.map((p) =>
          i === 3 || p.prioridade === 'P2'
            ? {
                ...p,
                primeiroAtendimento: sem(p.primeiroAtendimento),
                restauracao: sem(p.restauracao),
              }
            : p,
        ),
      }
    }),
  }
}

/**
 * Aplica o modo simulado à chamada de dados. Sem modo, repassa. `jaFalhou` guarda os ids que já
 * falharam em `erro-uma-vez` (a recuperação com "Tentar de novo" precisa de estado entre chamadas).
 */
export async function aplicarSimulacao<F, R>(
  modo: ModoMock | null,
  id: MetricaId,
  filtros: F,
  obter: (f: F) => Promise<R>,
  jaFalhou: Set<string> = new Set(),
): Promise<R> {
  if (modo === 'carregando') return new Promise<R>(() => undefined)
  if (modo === 'erro') throw new ErroSimulado(id)
  if (modo) {
    const alvo = idDeAncora(id)
    const sempre = idsDoModo(modo, 'erro:')
    if (sempre?.includes(alvo)) throw new ErroSimulado(id)
    const umaVez = idsDoModo(modo, 'erro-uma-vez:')
    if (umaVez?.includes(alvo) && !jaFalhou.has(id)) {
      jaFalhou.add(id)
      throw new ErroSimulado(id)
    }
  }
  if (id === 'PV1' && (modo === 'pesquisa:sem' || modo === 'pesquisa:insuficiente')) {
    if (modo === 'pesquisa:sem') return { status: 'sem-pesquisa', fonte: 'pesquisa' } as R
    return pesquisaInsuficiente(await obter(filtros)) as R
  }
  if (modo === 'tendencia-poucos' && id === 'TENDENCIA_FLUXO')
    return fluxoComPoucos((await obter(filtros)) as ResultadoTendenciaFluxo) as R
  if (modo === 'tendencia-poucos' && id === 'TENDENCIA_SUST')
    return sustComPoucos((await obter(filtros)) as ResultadoTendenciaSust) as R
  // Tendência sem histórico: o resultado real, sem nenhum mês (nenhum filtro vai para a API).
  if (modo === 'vazio' && ehTendencia(id)) return { ...(await obter(filtros)), meses: [] }
  if (modo === 'vazio' && id !== 'VISAO_GERAL') return obter(filtrosSemDados(id, filtros))
  return obter(filtros)
}

/** O modo de coleta que vale para a fonte (`coleta-erro:bm` só afeta o BusinessMap), ou null. */
function modoDaFonte(modo: ModoMock | null, dominio: Dominio): ModoColeta | null {
  const m = /^(coleta-(?:atrasada|vazia|erro)):(bm|ac)$/.exec(modo ?? '')
  return m && DOMINIO_DA_SIGLA[m[2] as SiglaFonte] === dominio ? (m[1] as ModoColeta) : null
}

const HORAS_ATRASO_SIMULADO = 26

/** Aplica o modo simulado ao estado de coleta de uma fonte. `carregando` nunca resolve; só a fonte indicada muda. */
export async function aplicarSimulacaoEstado(
  modo: ModoMock | null,
  dominio: Dominio,
  obter: () => Promise<EstadoColeta>,
): Promise<EstadoColeta> {
  if (modo === 'carregando') return new Promise<EstadoColeta>(() => undefined)
  const doDominio = modoDaFonte(modo, dominio)
  if (doDominio === 'coleta-erro') throw new ErroSimulado(`coleta ${dominio}`)
  const real = await obter()
  const base =
    modo === 'sem-calibracao' ? { ...real, calibracao: [], metricasEmCalibracao: [] } : real
  if (doDominio === 'coleta-atrasada')
    return { ...base, selo: 'atrasado', horasDesdeUltimaOk: HORAS_ATRASO_SIMULADO }
  if (doDominio === 'coleta-vazia')
    return {
      ...base,
      selo: 'sem-coleta',
      horasDesdeUltimaOk: null,
      ultimaOk: null,
      ultimaTentativa: null,
      falhasRecentes: [],
      calibracao: [],
      metricasEmCalibracao: [],
    }
  return base
}

/** Aplica o modo simulado ao histórico de coletas de uma fonte. */
export async function aplicarSimulacaoHistorico(
  modo: ModoMock | null,
  dominio: Dominio,
  obter: () => Promise<PaginaColetas>,
): Promise<PaginaColetas> {
  if (modo === 'carregando') return new Promise<PaginaColetas>(() => undefined)
  const doDominio = modoDaFonte(modo, dominio)
  if (doDominio === 'coleta-erro') throw new ErroSimulado(`coleta ${dominio}`)
  const real = await obter()
  return doDominio === 'coleta-vazia' ? { ...real, itens: [], total: 0 } : real
}
