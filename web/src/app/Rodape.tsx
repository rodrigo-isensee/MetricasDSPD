import { Link } from 'react-router'
import { useDataReferencia } from '@/data'
import { fmtData } from '@/lib/formatar'

export function Rodape() {
  const data = useDataReferencia()
  return (
    <footer
      className="mt-8 border-t border-borda bg-superficie px-4 py-4 text-sm text-texto-2"
      data-testid="rodape"
    >
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2">
        <p>
          Dados fictícios gerados para validar a experiência. Nenhum número representa a operação
          real.
          {data ? ` Dados até ${fmtData(data)}.` : ''}
        </p>
        <p className="flex gap-4">
          <Link to="/ajuda" className="text-acento underline">
            Ajuda
          </Link>
          <Link to="/ajuda#regras" className="text-acento underline">
            Regras de uso
          </Link>
        </p>
      </div>
    </footer>
  )
}
