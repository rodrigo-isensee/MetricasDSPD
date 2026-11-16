import { fmtInteiro } from '@/lib/formatar'

/**
 * Faixa "Sem prioridade": cartões sem prioridade no BusinessMap ficam fora da separação por nível
 * (nunca viram Média) e a contagem aparece sempre, para o tamanho da perda ficar visível.
 */
export function SemPrioridade({ n, codigo }: { n: number; codigo: string }) {
  return (
    <p className="text-sm text-texto-2" data-testid={`sem-prioridade-${codigo}`}>
      <strong>Sem prioridade:</strong>{' '}
      {n === 1
        ? '1 cartão ficou fora da separação por prioridade.'
        : `${fmtInteiro(n)} cartões ficaram fora da separação por prioridade.`}
    </p>
  )
}
