import type { ReactNode } from 'react'
import {
  type FiltroFluxoChave,
  type BaseAmostral,
  type CriteriosResultado,
  type MetricaId,
  type Periodo,
} from '@metricas-dspd/contratos'
import { CartaoMetrica } from '@/components/ui'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import type { MetricaQuery } from '@/data'
import { aplicaveisDe } from '@/features/painel/propsCartao'
import { CampoSemFonte } from './comuns'
import { NOTAS_COMPLEMENTARES } from './notas'

type Dto = { base: BaseAmostral; criterios: CriteriosResultado; campoDisponivel?: boolean }

interface Props<D extends Dto> {
  id: keyof typeof NOTAS_COMPLEMENTARES & MetricaId
  q: MetricaQuery<D>
  leitura?: string | undefined
  /** `insuficiente` quando a estatística principal não é publicada (o corpo explica). */
  baseVariante?: 'ok' | 'insuficiente' | 'censo'
  /** Base do cabeçalho quando ela difere da base do DTO (ex.: T13 em Frentes: n das frentes, não das demandas). */
  baseDoCartao?: (d: D) => BaseAmostral
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
 * com a nota da métrica, a fonte e a granularidade do catálogo e o selo "Dados fictícios" (que o
 * `CartaoMetrica` decide pela origem do cartão).
 */
export function CartaoComplementar<D extends Dto>({
  id,
  q,
  leitura,
  baseVariante,
  baseDoCartao,
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
  const d = q.dados
  const semFonte = d?.campoDisponivel === false && !semFonteParcial
  return (
    <CartaoMetrica
      codigo={id}
      titulo={m.nome}
      pergunta={m.pergunta}
      estado={q.estado}
      atualizando={q.atualizando}
      {...(d
        ? {
            criterios: d.criterios,
            ...(semFonte || semBase ? {} : { base: baseDoCartao ? baseDoCartao(d) : d.base }),
          }
        : {})}
      {...(d && !semFonte && !semBase && baseVariante ? { baseVariante } : {})}
      {...(leitura && !semFonte ? { leitura } : {})}
      {...(janelaPercentis && periodo && !semFonte ? { janelaPercentis, periodo } : {})}
      nota={NOTAS_COMPLEMENTARES[id]}
      meta={m.meta}
      fonte={m.fonte}
      granularidade={m.granularidade}
      {...(m.fonte === 'BusinessMap' ? { aplicaveis: aplicaveis ?? aplicaveisDe(id) } : {})}
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
