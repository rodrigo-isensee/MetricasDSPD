import { useCallback, useSyncExternalStore, type ReactNode } from 'react'
import {
  CATALOGO_CARTOES,
  cartoesDoPainel,
  motivoDaOrigemMock,
  origemDaMetrica,
  podeSimular,
  type MetricaId,
  type PainelComCartoes,
} from '@metricas-dspd/contratos'
import { Icone, idDeMetrica, ProvedorOrigemCartoes, type OrigemCartao } from '@/components/ui'
import { ehFonteSimuladora, SEM_SIMULADOS, useFonte } from '@/data'
import { plural } from '@/lib/formatar'

/** Cartões do catálogo por id; fora dele vale o código como id de métrica. */
const CARTAO_POR_ID = new Map(CATALOGO_CARTOES.map((c) => [c.id, c]))

/**
 * Origem de UM cartão (P-1 = B; pedido 060). Com a API real (`api`) cada cartão vem inteiro de uma origem, e o mapa de origem
 * do contrato é a fonte única: é "sem dado real" quando alguma métrica dele é `mock` no mapa (a primeira com motivo dá o
 * motivo); a API não calcula nada para ela. Nunca é fictício na API: não há número inventado. O `status` do catálogo não vale
 * aqui. Com a fonte mock o app inteiro é fictício e o aviso global já diz isso: vale só o catálogo.
 */
export function origemDoCartao(codigo: string, tipoFonte: 'mock' | 'api'): OrigemCartao {
  const cartao = CARTAO_POR_ID.get(codigo.toLowerCase())
  const doCatalogo = cartao?.status === 'mock'
  if (tipoFonte === 'mock') return { ficticio: doCatalogo, semDadoReal: false, motivo: null }
  const metricas: readonly MetricaId[] = cartao?.metricas ?? [idDeMetrica(codigo) as MetricaId]
  const semDado = metricas.filter((m) => origemDaMetrica(m) === 'mock')
  return {
    ficticio: false,
    semDadoReal: semDado.length > 0,
    motivo: semDado.map(motivoDaOrigemMock).find((m) => m !== null) ?? null,
  }
}

/** Tira a sigla interna de pendência (ex.: "P-DS-19") do motivo mostrado na faixa: a gerência lê o texto sem jargão. */
export const motivoSemSigla = (motivo: string): string =>
  motivo.replace(/\s*\(P-[A-Z]+-\d+\)/g, '').replace(/,\s*P-[A-Z]+-\d+/g, '')

/**
 * Liga o selo e o estado de origem de todo cartão à origem da métrica (mapa do contrato), conforme a fonte de dados.
 * O "simulado" (pedido 070) vem da camada de dados: a fonte decoradora registra quais métricas estão simuladas, e só
 * vale para cartão que o mapa dá como sem dado real. `origemDoCartao` segue só com o real: contagem do cabeçalho e
 * exportação não enxergam o simulado.
 */
export function OrigemDosCartoes({ children }: { children: ReactNode }) {
  const fonte = useFonte()
  const tipo = fonte.tipo
  const registro = ehFonteSimuladora(fonte) ? fonte.origensSimuladas : SEM_SIMULADOS
  const simulados = useSyncExternalStore(registro.subscribe, registro.getSnapshot)
  const origem = useCallback(
    (codigo: string): OrigemCartao => {
      const real = origemDoCartao(codigo, tipo)
      const id = idDeMetrica(codigo) as MetricaId
      // Falha fechada: o selo só vale para cartão sem dado real que o contrato permite simular.
      const sim = real.semDadoReal && podeSimular(id) ? simulados.get(id) : undefined
      return sim ? { ...real, simulado: true, motivo: motivoSemSigla(sim.motivo) } : real
    },
    [tipo, simulados],
  )
  return <ProvedorOrigemCartoes origem={origem}>{children}</ProvedorOrigemCartoes>
}

/** Quantos cartões do painel estão sem dado real (todos os do painel, ocultos ou não). 0 com a fonte mock. */
export function contarSemDadoReal(painel: PainelComCartoes, tipoFonte: 'mock' | 'api'): number {
  if (tipoFonte === 'mock') return 0
  return cartoesDoPainel(painel).filter((c) => origemDoCartao(c.codigo, tipoFonte).semDadoReal)
    .length
}

/**
 * Nota do cabeçalho do painel: "N cartões sem dado real". Some quando N = 0 e com a fonte mock (o aviso global do app já
 * cobre). Não depende das preferências: ocultar cartão não esconde a nota. Ícone + texto, nunca só cor.
 */
export function NotaSemDadoRealPainel({ painel }: { painel: PainelComCartoes }) {
  const n = contarSemDadoReal(painel, useFonte().tipo)
  if (n === 0) return null
  return (
    <p
      className="flex items-center gap-1 text-sm text-atencao"
      data-testid={`nota-sem-dado-real-${painel}`}
    >
      <Icone nome="info" className="size-4 shrink-0" />
      {n} {plural(n, 'cartão sem dado real', 'cartões sem dado real')}
    </p>
  )
}
