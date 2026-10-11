import type { EstadoColeta } from '@metricas-dspd/contratos'
import { SeloCalibracao } from '@/components/ui'
import { fmtData, fmtDataCurta } from '@/lib/formatar'
import { SecaoDados } from './SecaoDados'

const ORIGEM = {
  'inicio-coleta': 'desde a primeira coleta da fonte',
  criterio: 'aberta por mudança de critério',
} as const

/** Janela(s) de calibração vigente(s), definidas pelo sistema; sem cadastro (CA-06, CA-17). */
export function JanelaCalibracaoFonte({ estado }: { estado: EstadoColeta }) {
  return (
    <SecaoDados id="calibracao" titulo="Janela de calibração">
      {estado.calibracao.length === 0 ? (
        <p>
          Nenhuma janela de calibração vigente nesta fonte. Quando houver, ela é definida
          automaticamente pelo sistema.
        </p>
      ) : (
        <ul className="flex flex-col gap-2" data-testid="janelas-calibracao">
          {estado.calibracao.map((j) => (
            <li
              key={`${j.inicio}-${j.criterioId ?? 'inicio'}`}
              className="flex flex-wrap items-center gap-2"
            >
              <SeloCalibracao />
              <span>
                {fmtDataCurta(j.inicio)} a {fmtData(j.fim)} ({ORIGEM[j.origem]}; métricas:{' '}
                {j.metricas.map((m) => m.replace('_', '-')).join(', ')})
              </span>
            </li>
          ))}
        </ul>
      )}
      {estado.calibracao.length > 0 && (
        <p className="text-texto-2">
          Definida automaticamente pelo sistema. Dados de calibração servem para ajustar o processo,
          não para cobrar pessoas ou times.
        </p>
      )}
    </SecaoDados>
  )
}
