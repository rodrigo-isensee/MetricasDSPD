import type { ReactNode } from 'react'
import type { FiltroFluxoChave, MarcacaoCriterio } from '@metricas-dspd/contratos'
import { CartaoMetrica, type EstadoCartao } from '@/components/ui'
import { fmtData } from '@/lib/formatar'
import { useDadosAba } from '../dados'
import { notaDe, type TextosCartao } from '../textos'
import type { RespostaApontamento } from '../types'

interface Props {
  /** Código do cartão (`AP-KPIS`): vira o id `ap-kpis` e o `data-testid` `metrica-AP-KPIS`. */
  codigo: string
  titulo: string
  texto: TextosCartao
  /** Frase de leitura gerada dos dados (nunca número escrito à mão). */
  leitura?: string | undefined
  base?: { n: number; unidade: string } | undefined
  baseInsuficiente?: boolean
  /** Filtros que atuam no cartão; omitido = todos os ativos atuam. */
  aplicaveis?: readonly string[]
  /** Mudanças de critério que a série atravessa (T2.6). */
  criterios?: readonly MarcacaoCriterio[]
  /** Família do critério cuja versão vigente (a mais recente de `criterios[]`) é datada na linha "Critério" (A-9). */
  familiaCriterio?: 'dicionario' | 'calendario'
  acoes?: ReactNode
  /** Frase acrescentada ao "Como ler" (063: só com o sinal de registro incompleto). */
  comoLerExtra?: string | undefined
  semTabela?: boolean
  className: string
  /** Corpo do cartão: só é chamado quando a resposta existe (estado `ok`). */
  children: (r: RespostaApontamento) => ReactNode
}

/**
 * Cartão da aba: o `CartaoMetrica` do painel com a fonte fixa (BusinessMap), o estado vindo da consulta única
 * e a nota montada a partir dos textos do UX. O vazio da aba é tratado uma vez, na página (nunca por cartão).
 */
export function CartaoApontamento({
  codigo,
  titulo,
  texto,
  leitura,
  base,
  baseInsuficiente,
  aplicaveis,
  criterios,
  familiaCriterio,
  acoes,
  comoLerExtra,
  semTabela,
  className,
  children,
}: Props) {
  const d = useDadosAba()
  const periodo = d.resposta?.periodo
  const estado: EstadoCartao = d.estado
  const vigente = familiaCriterio
    ? d.resposta?.criterios
        .filter((c) => c.id.startsWith(familiaCriterio))
        .reduce<string | null>((a, c) => (a === null || c.data > a ? c.data : a), null)
    : null
  const textoBase = comoLerExtra ? { ...texto, comoLer: `${texto.comoLer} ${comoLerExtra}` } : texto
  const nota = notaDe(
    vigente
      ? { ...textoBase, criterio: `${texto.criterio} Versão vigente desde ${fmtData(vigente)}.` }
      : textoBase,
  )
  return (
    <CartaoMetrica
      codigo={codigo}
      titulo={titulo}
      pergunta={texto.pergunta}
      estado={estado}
      atualizando={d.atualizando}
      nota={nota}
      fonte="BusinessMap"
      granularidade="apontamento"
      {...(base && periodo
        ? {
            base: {
              n: base.n,
              unidade: base.unidade,
              janela: { inicio: periodo.de, fim: periodo.ate },
            },
            baseVariante: baseInsuficiente ? ('insuficiente' as const) : ('ok' as const),
          }
        : {})}
      {...(leitura ? { leitura } : {})}
      {...(aplicaveis ? { aplicaveis: aplicaveis as readonly FiltroFluxoChave[] } : {})}
      {...(criterios && criterios.length > 0
        ? { criterios: { serie: [...criterios], janela: [] } }
        : {})}
      {...(acoes ? { acoes } : {})}
      {...(semTabela ? { semTabela } : {})}
      className={className}
      erro={d.erro}
      onTentarDeNovo={d.tentarDeNovo}
    >
      {d.resposta ? children(d.resposta) : null}
    </CartaoMetrica>
  )
}
