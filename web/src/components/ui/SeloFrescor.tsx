import clsx from 'clsx'
import type { SeloFrescor as Selo } from '@metricas-dspd/contratos'
import { Icone, type NomeIcone } from './Icone'

const CFG: Record<Selo, { texto: string; icone: NomeIcone; cor: string }> = {
  atual: { texto: 'Atual', icone: 'check', cor: 'border-ok bg-ok-fundo text-ok' },
  atrasado: {
    texto: 'Atrasado',
    icone: 'relogio',
    cor: 'border-atencao bg-atencao-fundo text-atencao',
  },
  falha: { texto: 'Falha', icone: 'alerta', cor: 'border-alerta bg-alerta-fundo text-alerta' },
  'sem-coleta': {
    texto: 'Sem coleta',
    icone: 'info',
    cor: 'border-borda-controle bg-superficie-2 text-texto-2',
  },
}

/** Texto do selo, igual na tela e no arquivo exportado (P-4). */
export function textoSeloFrescor(selo: Selo, horas?: number | null): string {
  return selo === 'atrasado' && horas != null
    ? `Atrasado: última coleta há ${Math.round(horas)} h`
    : CFG[selo].texto
}

interface Props {
  selo: Selo
  /** Horas desde a última coleta ok: o "Atrasado" diz quantas (CA-03). */
  horas?: number | null
  /** Identifica a fonte nos testes (`selo-frescor-businessmap`). */
  testid?: string
  className?: string
}

/** Selo de frescor da fonte: ícone + texto, nunca só cor (CA-01). */
export function SeloFrescor({ selo, horas, testid, className }: Props) {
  const c = CFG[selo]
  const texto = textoSeloFrescor(selo, horas)
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-sm font-semibold',
        c.cor,
        className,
      )}
      data-selo={selo}
      data-testid={testid}
    >
      <Icone nome={c.icone} className="size-3.5" />
      {texto}
    </span>
  )
}
