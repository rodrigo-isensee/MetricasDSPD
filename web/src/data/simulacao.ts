import type { MetricaId } from '@/contracts/comum'
import { METRICAS_SUSTENTACAO } from '@/contracts/metricas'

/**
 * Parâmetro oculto `?mock=` (spec de UX 6.6): força estados para validação e QA.
 *   carregando            todos os cartões no esqueleto, indefinidamente
 *   erro                  erro de painel ("Não foi possível abrir este painel")
 *   vazio                 todos os cartões no estado vazio
 *   erro:{ids}            só os cartões listados falham, em todas as tentativas (ex.: erro:o3,t1)
 *   erro-uma-vez:{ids}    só os listados falham na primeira carga; "Tentar de novo" funciona
 * Ids = ids de âncora (minúsculas, com hífen: `ei-fl1`, `bloqueados`); id inexistente é ignorado.
 * O parâmetro vale só para a página que o contém: os links não o propagam nem o "Copiar link".
 */
export type ModoMock = 'carregando' | 'erro' | 'vazio' | `erro:${string}` | `erro-uma-vez:${string}`

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
  if (v === 'carregando' || v === 'erro' || v === 'vazio') return v
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
