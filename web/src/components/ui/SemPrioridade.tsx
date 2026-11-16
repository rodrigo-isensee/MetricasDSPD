import { fmtInteiro, fmtPct } from '@/lib/formatar'
import { Icone } from './Icone'

/** A partir desta fração (em %) a faixa ganha destaque: ícone, fundo e texto, nunca só cor. */
export const LIMITE_DESTAQUE_SEM_PRIORIDADE_PCT = 20

/** Mais da metade do universo sem prioridade: a leitura do cartão avisa em vez de só dizer "amostra insuficiente". */
export const maioriaSemPrioridade = (s: { n: number; total: number }): boolean =>
  s.total > 0 && s.n * 2 > s.total

/**
 * Faixa "Sem prioridade (BusinessMap)": cartões sem prioridade no BusinessMap ficam fora da separação por nível
 * (nunca viram Média) e a contagem aparece sempre, com o universo ("entregues", "criados"...) e a proporção.
 * `complemento` fica depois da frase (ex.: a nota da chegada total no T4).
 */
export function SemPrioridade({
  n,
  total,
  universo,
  codigo,
  complemento,
}: {
  n: number
  total: number
  universo: string
  codigo: string
  complemento?: string
}) {
  const pct = total > 0 ? (n / total) * 100 : 0
  const destaque = pct >= LIMITE_DESTAQUE_SEM_PRIORIDADE_PCT
  return (
    <p
      className={
        destaque
          ? 'flex items-start gap-2 rounded-md border border-alerta bg-alerta-fundo p-2 text-sm'
          : 'text-sm text-texto-2'
      }
      data-testid={`sem-prioridade-${codigo}`}
      data-destaque={destaque ? 'sim' : 'nao'}
    >
      {destaque ? <Icone nome="alerta" className="mt-0.5 size-4 shrink-0" /> : null}
      <span>
        <strong>Sem prioridade (BusinessMap):</strong>{' '}
        {total > 0
          ? `${fmtInteiro(n)} de ${fmtInteiro(total)} ${universo} (${fmtPct(pct)}).`
          : `${fmtInteiro(n)} ${universo}.`}{' '}
        Esses cartões foram trabalhados normalmente; só não têm prioridade preenchida no
        BusinessMap, por isso ficam fora da separação por prioridade.
        {complemento ? ` ${complemento}` : ''}
      </span>
    </p>
  )
}
