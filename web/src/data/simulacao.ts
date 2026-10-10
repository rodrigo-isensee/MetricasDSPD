import type { Dominio, EstadoColeta, MetricaId, PaginaColetas } from '@metricas-dspd/contratos'
import { METRICAS_SUSTENTACAO } from '@metricas-dspd/contratos'

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

/** Filtros que não casam com nenhum registro, para forçar o estado vazio sem tocar nos DTOs. */
export function filtrosSemDados<F>(id: MetricaId, filtros: F): F {
  const base = filtros as Record<string, unknown>
  return METRICAS_SUSTENTACAO.includes(id)
    ? ({ ...base, equipe: [SEM_DADOS] } as F)
    : ({ ...base, equipe: [SEM_DADOS], sistema: [SEM_DADOS] } as F)
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
