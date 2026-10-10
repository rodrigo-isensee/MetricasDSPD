import type { EstadoColeta } from '@metricas-dspd/contratos'
import { Contagens } from './Contagens'
import { JanelaCalibracaoFonte } from './JanelaCalibracaoFonte'
import { FalhasRecentes } from './FalhasRecentes'
import { HistoricoColetas } from './HistoricoColetas'
import { MudancasCriterio } from './MudancasCriterio'
import { UltimaColeta } from './UltimaColeta'

/** As seções de `/dados` para UMA fonte, na ordem da especificação. */
export function SecoesFonte({ estado }: { estado: EstadoColeta }) {
  return (
    <div className="flex flex-col gap-4" data-testid={`dados-conteudo-${estado.dominio}`}>
      <UltimaColeta estado={estado} />
      <Contagens estado={estado} />
      <JanelaCalibracaoFonte estado={estado} />
      <FalhasRecentes estado={estado} />
      <HistoricoColetas dominio={estado.dominio} />
      <MudancasCriterio dominio={estado.dominio} />
    </div>
  )
}
