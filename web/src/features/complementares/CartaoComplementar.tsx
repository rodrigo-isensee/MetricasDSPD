import type { ReactNode } from 'react'
import {
  CATALOGO_CARTOES,
  type FiltroFluxoChave,
  type BaseAmostral,
  type CriteriosResultado,
  type MetricaId,
  type Periodo,
} from '@metricas-dspd/contratos'
import { CartaoMetrica, Icone } from '@/components/ui'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import type { MetricaQuery } from '@/data'
import { aplicaveisDe } from '@/features/painel/propsCartao'
import { CampoSemFonte } from './comuns'
import { NOTAS_COMPLEMENTARES } from './notas'

/** Selo "Dados fictícios": a métrica complementar só tem dado mockado até a coleta real existir. */
export function SeloFicticio() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-atencao bg-atencao-fundo px-2 py-0.5 text-xs font-semibold text-atencao"
      data-testid="selo-ficticio"
    >
      <Icone nome="info" className="size-3.5" />
      Dados fictícios
    </span>
  )
}

type Dto = { base: BaseAmostral; criterios: CriteriosResultado; campoDisponivel?: boolean }

interface Props<D extends Dto> {
  id: keyof typeof NOTAS_COMPLEMENTARES & MetricaId
  q: MetricaQuery<D>
  leitura?: string | undefined
  /** `insuficiente` quando a estatística principal não é publicada (o corpo explica). */
  baseVariante?: 'ok' | 'insuficiente' | 'censo'
  janelaPercentis?: { unidade: 'semanas' | 'meses'; quantidade: number } | undefined
  periodo?: Periodo
  acoes?: ReactNode
  semTabela?: boolean
  /** O campo ausente atinge só uma parte do cartão: o resto é real e continua visível (o corpo trata `campoDisponivel`). */
  semFonteParcial?: boolean
  /** Não mostra a base ("n itens"): o n revelaria um total que o cartão precisa ocultar (T14, T14-M1 = B). */
  semBase?: boolean
  /** Filtros que atuam, quando diferem da aplicabilidade do contrato (E9 e E8 ignoram o período). */
  aplicaveis?: readonly FiltroFluxoChave[]
  className?: string
  children: (d: D) => ReactNode
}

/**
 * Molde de cartão complementar: o mesmo cartão do núcleo (estados carregando, erro e sem dados vêm dele),
 * com a nota da métrica, a fonte e a granularidade do catálogo e o selo "Dados fictícios" quando o
 * status do catálogo único é `mock`.
 */
export function CartaoComplementar<D extends Dto>({
  id,
  q,
  leitura,
  baseVariante,
  janelaPercentis,
  periodo,
  acoes,
  semTabela,
  semFonteParcial,
  semBase,
  aplicaveis,
  className = 'lg:col-span-6',
  children,
}: Props<D>) {
  const m = entradaDoCatalogo(id)
  const ficticio = CATALOGO_CARTOES.some((c) => c.id === id.toLowerCase() && c.status === 'mock')
  const d = q.dados
  const semFonte = d?.campoDisponivel === false && !semFonteParcial
  return (
    <CartaoMetrica
      codigo={id}
      titulo={m.nome}
      pergunta={m.pergunta}
      estado={q.estado}
      atualizando={q.atualizando}
      {...(d ? { criterios: d.criterios, ...(semFonte || semBase ? {} : { base: d.base }) } : {})}
      {...(d && !semFonte && !semBase && baseVariante ? { baseVariante } : {})}
      {...(leitura && !semFonte ? { leitura } : {})}
      {...(janelaPercentis && periodo && !semFonte ? { janelaPercentis, periodo } : {})}
      nota={NOTAS_COMPLEMENTARES[id]}
      meta={m.meta}
      fonte={m.fonte}
      granularidade={m.granularidade}
      {...(m.fonte === 'BusinessMap' ? { aplicaveis: aplicaveis ?? aplicaveisDe(id) } : {})}
      selos={ficticio ? <SeloFicticio /> : undefined}
      acoes={acoes}
      {...(semTabela || semFonte ? { semTabela: true } : {})}
      onTentarDeNovo={q.recarregar}
      erro={q.erro}
      className={className}
    >
      {d && (semFonte ? <CampoSemFonte codigo={id} /> : children(d))}
    </CartaoMetrica>
  )
}
