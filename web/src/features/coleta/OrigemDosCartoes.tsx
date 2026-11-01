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
 * Origem de UM cartão (P-1 = B). Com a API real (`api`) cada cartão vem inteiro de uma origem, e o mapa de origem do contrato
 * é a fonte única: é fictício quando alguma métrica dele é `mock` no mapa (a primeira com motivo dá o motivo). O `status` do
 * catálogo não vale aqui: ele marca o que depende de extensão mockada (S8 e S12, por exemplo) e já foi superado pelo mapa
 * quando a métrica passa a vir do dado coletado (E2.115). Com a fonte mock o app inteiro é fictício e o aviso global já diz
 * isso: vale só o catálogo.
 */
export function origemDoCartao(codigo: string, tipoFonte: 'mock' | 'api'): OrigemCartao {
  const cartao = CARTAO_POR_ID.get(codigo.toLowerCase())
  const doCatalogo = cartao?.status === 'mock'
  if (tipoFonte === 'mock') return { ficticio: doCatalogo, motivo: null }
  const metricas: readonly MetricaId[] = cartao?.metricas ?? [idDeMetrica(codigo) as MetricaId]
  const ficticias = metricas.filter((m) => origemDaMetrica(m) === 'mock')
  return {
    ficticio: ficticias.length > 0,
    motivo: ficticias.map(motivoDaOrigemMock).find((m) => m !== null) ?? null,
  }
}

/** Liga o selo "Dados fictícios" de todo cartão à origem da métrica (mapa do contrato), conforme a fonte de dados. */
export function OrigemDosCartoes({ children }: { children: ReactNode }) {
  const tipo = useFonte().tipo
  const origem = useCallback((codigo: string) => origemDoCartao(codigo, tipo), [tipo])
  return <ProvedorOrigemCartoes origem={origem}>{children}</ProvedorOrigemCartoes>
}

/** Quantos cartões do painel ainda têm dado fictício (todos os do painel, ocultos ou não). 0 com a fonte mock. */
export function contarFicticios(painel: PainelComCartoes, tipoFonte: 'mock' | 'api'): number {
  if (tipoFonte === 'mock') return 0
  return cartoesDoPainel(painel).filter((c) => origemDoCartao(c.codigo, tipoFonte).ficticio).length
}

/**
 * Nota do cabeçalho do painel (P-1 = B): "N cartões ainda com dados fictícios". Some quando N = 0 e com a fonte mock
 * (o aviso global do app já cobre). Não depende das preferências: ocultar cartão não esconde a nota.
 */
export function NotaFicticiosPainel({ painel }: { painel: PainelComCartoes }) {
  const n = contarFicticios(painel, useFonte().tipo)
  if (n === 0) return null
  return (
    <p
      className="flex items-center gap-1 text-sm text-atencao"
      data-testid={`nota-ficticios-${painel}`}
    >
      <Icone nome="info" className="size-4 shrink-0" />
      {n} {plural(n, 'cartão ainda com dados fictícios', 'cartões ainda com dados fictícios')}
    </p>
  )
}
