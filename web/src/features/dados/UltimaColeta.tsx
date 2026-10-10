import type { EstadoColeta } from '@metricas-dspd/contratos'
import { SeloFrescor } from '@/components/ui'
import { fmtDataHora } from '@/lib/formatar'
import { ROTULO_RESULTADO } from './rotulos'
import { SecaoDados } from './SecaoDados'

/** Última coleta ok, última tentativa com resultado e próxima prevista (CA-13). */
export function UltimaColeta({ estado }: { estado: EstadoColeta }) {
  return (
    <SecaoDados id="ultima-coleta" titulo="Última coleta">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <SeloFrescor selo={estado.selo} horas={estado.horasDesdeUltimaOk} />
        <span>
          Última coleta ok:{' '}
          <strong>{estado.ultimaOk ? fmtDataHora(estado.ultimaOk.fim) : 'nenhuma ainda'}</strong>
        </span>
        <span>
          Última tentativa:{' '}
          <strong>
            {estado.ultimaTentativa ? ROTULO_RESULTADO[estado.ultimaTentativa.resultado] : '—'}
          </strong>
          {estado.ultimaTentativa && ` (${fmtDataHora(estado.ultimaTentativa.inicio)})`}
        </span>
        <span>
          Próxima prevista: <strong>{fmtDataHora(estado.proximaPrevista)}</strong>
        </span>
      </p>
    </SecaoDados>
  )
}
