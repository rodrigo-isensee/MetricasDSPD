import { Link } from 'react-router'
import type { Dominio } from '@metricas-dspd/contratos'
import { Botao, Icone, SeloFrescor } from '@/components/ui'
import { useEstadoColeta } from '@/data'
import { fmtDataHora } from '@/lib/formatar'
import { NOME_FONTE, ROTA_DADOS, SIGLA_FONTE } from './fontes'

interface Props {
  dominio: Dominio
  /** Mostra o nome da fonte antes do selo (páginas com as duas fontes, em blocos separados). */
  comNome?: boolean
}

/**
 * Frescor de UMA fonte no cabeçalho do painel: "Atualizado em", selo, "Entenda" e, em falha, o aviso
 * de que os dados anteriores continuam na tela (CA-01, CA-03, CA-09). Nunca soma as duas fontes.
 */
export function FrescorFonte({ dominio, comNome = false }: Props) {
  const q = useEstadoColeta(dominio)
  const nome = NOME_FONTE[dominio]
  const e = q.data
  return (
    <div
      className="flex flex-col gap-1 text-sm"
      data-testid={`frescor-${dominio}`}
      aria-busy={q.isPending || undefined}
    >
      {q.isPending && (
        // Reserva a altura da linha pronta (texto, selo, "Entenda"): a linha invisível quebra como a real (IR-001).
        <div className="relative">
          <p role="status" className="absolute inset-x-0 top-0 text-texto-2">
            {comNome ? `${nome}: ` : ''}Verificando a coleta…
          </p>
          <p aria-hidden="true" className="invisible flex flex-wrap items-center gap-x-2 gap-y-1">
            {comNome && <span className="font-semibold">{nome}:</span>}
            <span>Atualizado em 00/00/0000 00:00</span>
            <SeloFrescor selo="atual" />
            <span className="alvo">Entenda</span>
          </p>
        </div>
      )}
      {q.isError && (
        <p role="alert" className="flex flex-wrap items-center gap-2 text-alerta">
          <Icone nome="alerta" /> {comNome ? `${nome}: ` : ''}Não foi possível verificar a coleta.
          <Botao onClick={() => void q.refetch()} className="text-xs">
            Tentar de novo
          </Botao>
        </p>
      )}
      {e && (
        <>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {comNome && <span className="font-semibold">{nome}:</span>}
            <span className="text-texto-2">
              {e.ultimaOk
                ? `Atualizado em ${fmtDataHora(e.ultimaOk.fim)}`
                : 'Nenhuma coleta concluída'}
            </span>
            <SeloFrescor
              selo={e.selo}
              horas={e.horasDesdeUltimaOk}
              testid={`selo-frescor-${dominio}`}
            />
            <Link
              to={`${ROTA_DADOS}?fonte=${SIGLA_FONTE[dominio]}`}
              className="alvo text-acento underline"
              aria-label={`Entenda a coleta do ${nome}`}
            >
              Entenda
            </Link>
          </p>
          {e.selo === 'falha' && e.ultimaTentativa && (
            <p className="text-texto-2" data-testid={`falha-coleta-${dominio}`}>
              Coleta falhou em {fmtDataHora(e.ultimaTentativa.inicio)}.
              {e.ultimaOk ? ` Mostrando dados de ${fmtDataHora(e.ultimaOk.fim)}.` : ''}
            </p>
          )}
        </>
      )}
    </div>
  )
}
