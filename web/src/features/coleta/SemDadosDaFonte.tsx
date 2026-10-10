import { Link } from 'react-router'
import type { Dominio } from '@metricas-dspd/contratos'
import { Icone } from '@/components/ui'
import { NOME_FONTE } from './fontes'

/** Nunca houve coleta ok: não é "filtro sem dados" nem erro (CA-09, W5). */
export function SemDadosDaFonte({ dominio }: { dominio: Dominio }) {
  return (
    <div
      className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-borda-controle bg-superficie p-4 text-sm"
      data-testid={`sem-dados-${dominio}`}
    >
      <p className="flex items-center gap-2 font-semibold">
        <Icone nome="info" /> Ainda não há dados desta fonte
      </p>
      <p className="text-texto-2">
        A primeira coleta do {NOME_FONTE[dominio]} ainda não terminou. Volte mais tarde.
      </p>
      <Link to="/" className="alvo text-acento underline">
        Voltar à Visão geral
      </Link>
    </div>
  )
}
