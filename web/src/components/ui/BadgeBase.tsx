import clsx from 'clsx'
import type { BaseAmostral } from '@/contracts/comum'
import { MINIMO_AMOSTRA } from '@/contracts/comum'
import { fmtData, fmtDataCurta, fmtInteiro } from '@/lib/formatar'
import { Icone } from './Icone'

interface Props {
  base: BaseAmostral
  /** `insuficiente`: a estatística do cartão não é publicada; `censo`: "k de n". */
  variante?: 'ok' | 'insuficiente' | 'censo'
  /** Para `censo`: k de n. */
  k?: number
  className?: string
  'data-testid'?: string
}

function janelaTexto(j: BaseAmostral['janela']): string | null {
  if (!j) return null
  return j.inicio === j.fim ? fmtData(j.fim) : `${fmtDataCurta(j.inicio)} a ${fmtData(j.fim)}`
}

/** "Base: 87 itens concluídos · 18/07 a 09/10/2026". Nenhum número sem base (critério 74). */
export function BadgeBase({ base, variante = 'ok', k, className, ...resto }: Props) {
  const janela = janelaTexto(base.janela)
  const insuf = variante === 'insuficiente'
  return (
    <span
      className={clsx(
        'inline-flex flex-wrap items-center gap-x-1 rounded-md border px-2 py-0.5 text-sm',
        insuf
          ? 'border-atencao bg-atencao-fundo text-atencao'
          : 'border-borda bg-superficie-2 text-texto-2',
        className,
      )}
      data-variante={variante}
      {...resto}
    >
      {insuf && <Icone nome="alerta" className="size-3.5" />}
      {insuf ? (
        <span>
          Amostra insuficiente: {fmtInteiro(base.n)} de {MINIMO_AMOSTRA} itens mínimos
        </span>
      ) : variante === 'censo' && k !== undefined ? (
        <span>
          Base: {fmtInteiro(k)} de {fmtInteiro(base.n)} {base.unidade}
        </span>
      ) : (
        <span>
          Base: {fmtInteiro(base.n)} {base.unidade}
        </span>
      )}
      {janela && <span>· {janela}</span>}
      {base.complemento && (
        <span>
          · {fmtInteiro(base.complemento.n)} {base.complemento.unidade}
        </span>
      )}
    </span>
  )
}
