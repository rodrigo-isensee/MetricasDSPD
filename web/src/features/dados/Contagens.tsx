import type { Dominio, EstadoColeta } from '@metricas-dspd/contratos'
import { fmtInteiro } from '@/lib/formatar'
import { SecaoDados } from './SecaoDados'

const ITEM_LIDO: Record<Dominio, string> = {
  businessmap: 'cards lidos',
  acelerato: 'chamados lidos',
}

/** Contagens da última coleta ok (CA-14): arquivados e excluídos permanecem na base. */
export function Contagens({ estado }: { estado: EstadoColeta }) {
  const c = estado.ultimaOk?.contagens
  const itens = c
    ? ([
        [c.lidos, ITEM_LIDO[estado.dominio]],
        [c.novos, 'novos'],
        [c.atualizados, 'atualizados'],
        [c.arquivadosPreservados, 'arquivados mantidos'],
        [c.excluidosPreservados, 'excluídos mantidos'],
      ] as const)
    : []
  return (
    <SecaoDados id="contagens" titulo="Contagens da última coleta">
      {c ? (
        <dl
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
          data-testid="contagens"
        >
          {itens.map(([n, rotulo]) => (
            <div key={rotulo} className="flex flex-col-reverse justify-end">
              <dd className="text-2xl font-bold tabular-nums">{fmtInteiro(n)}</dd>
              <dt className="text-texto-2">{rotulo}</dt>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-texto-2">Ainda não há uma coleta concluída para contar.</p>
      )}
      <p className="text-texto-2">
        Arquivados e excluídos: total preservado na base (não é a contagem desta coleta).
      </p>
    </SecaoDados>
  )
}
