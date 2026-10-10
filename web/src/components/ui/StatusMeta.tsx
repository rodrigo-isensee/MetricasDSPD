import clsx from 'clsx'
import type { StatusMeta as Status } from '@metricas-dspd/contratos'
import { SeloCalibracao, useCartaoCalibracao } from './Calibracao'
import { Icone, type NomeIcone } from './Icone'

const CFG: Record<Status, { texto: string; icone: NomeIcone; cor: string }> = {
  dentro: { texto: 'Dentro da meta', icone: 'check', cor: 'text-ok bg-ok-fundo' },
  fora: { texto: 'Fora da meta', icone: 'alerta', cor: 'text-alerta bg-alerta-fundo' },
  'sem-referencia': { texto: 'Sem referência', icone: 'info', cor: 'text-texto-2 bg-superficie-2' },
}

interface Props {
  status: Status | 'sem-meta'
  /** Substitui o texto padrão (ex.: "Mediana dentro do alvo"). */
  texto?: string
  className?: string
}

/** Status de meta: sempre ícone + texto (a cor nunca é o único canal). */
export function StatusMeta({ status, texto, className }: Props) {
  // Em calibração a meta não é avaliada: o selo toma o lugar de Dentro/Fora (CA-05).
  const calibrando = useCartaoCalibracao()
  if (calibrando) return <SeloCalibracao testid="selo-calibracao-meta" />
  const c =
    status === 'sem-meta'
      ? { texto: 'Sem meta numérica', icone: 'info' as const, cor: 'text-texto-2 bg-superficie-2' }
      : CFG[status]
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold',
        c.cor,
        className,
      )}
      data-status={status}
    >
      <Icone nome={c.icone} className="size-3.5" />
      {texto ?? c.texto}
    </span>
  )
}
