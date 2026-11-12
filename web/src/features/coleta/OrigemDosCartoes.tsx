import { useCallback, type ReactNode } from 'react'
import {
  CATALOGO_CARTOES,
  cartoesDoPainel,
  motivoDaOrigemMock,
  origemDaMetrica,
  type MetricaId,
  type PainelComCartoes,
} from '@metricas-dspd/contratos'
import { Icone, idDeMetrica, ProvedorOrigemCartoes, type OrigemCartao } from '@/components/ui'
import { useFonte } from '@/data'
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

/**
 * Liga o selo e o estado de origem de todo cartão à origem da métrica (mapa do contrato), conforme a fonte de dados.
 * Nenhum cartão é simulado (ADR 0030): sem dado real, o cartão mostra "Sem dado real" e o motivo.
 */
export function OrigemDosCartoes({ children }: { children: ReactNode }) {
  const fonte = useFonte()
  const tipo = fonte.tipo
  const origem = useCallback((codigo: string): OrigemCartao => origemDoCartao(codigo, tipo), [tipo])
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
