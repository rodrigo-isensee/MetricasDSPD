import type { EstadoColeta } from '@metricas-dspd/contratos'
import { Icone, TabelaDados } from '@/components/ui'
import { fmtDataHora } from '@/lib/formatar'
import { ROTULO_EFEITO, ROTULO_TIPO_ERRO } from './rotulos'
import { SecaoDados } from './SecaoDados'

/** Falhas e coletas parciais dos últimos 14 dias: data, tipo de erro (só a categoria) e efeito (CA-15). */
export function FalhasRecentes({ estado }: { estado: EstadoColeta }) {
  return (
    <SecaoDados id="falhas" titulo="Falhas recentes (14 dias)">
      <TabelaDados
        codigo={`FALHAS-${estado.dominio}`}
        legenda="Falhas recentes (14 dias): data, tipo de erro e o que acontece com os dados"
        vazio="Nenhuma falha nos últimos 14 dias."
        colunas={[
          { chave: 'data', titulo: 'Data' },
          { chave: 'erro', titulo: 'Tipo de erro' },
          { chave: 'efeito', titulo: 'O que acontece com os dados' },
        ]}
        linhas={estado.falhasRecentes.map((e) => ({
          data: fmtDataHora(e.inicio),
          erro: (
            <span className="inline-flex items-center gap-1">
              <Icone nome={e.resultado === 'falha' ? 'alerta' : 'relogio'} />
              {e.resultado === 'falha' ? 'Falha' : 'Parcial'}
              {e.tipoErro ? `: ${ROTULO_TIPO_ERRO[e.tipoErro]}` : ''}
            </span>
          ),
          efeito: ROTULO_EFEITO[e.efeito],
        }))}
      />
    </SecaoDados>
  )
}
