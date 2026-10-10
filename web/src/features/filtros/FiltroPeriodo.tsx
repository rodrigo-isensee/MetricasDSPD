import { Popover } from 'radix-ui'
import { useId, useState } from 'react'
import { Botao, Icone } from '@/components/ui'
import type { Periodo } from '@metricas-dspd/contratos'
import type { PeriodoPadrao } from '@metricas-dspd/contratos'
import { fmtData } from '@/lib/formatar'
import { validarPeriodoCustom } from './periodo'
import { ROTULO_PERIODO } from './paineis'

interface Props {
  periodo: Periodo
  onChange: (p: Periodo, replace: boolean) => void
  historico: { inicio: string; fim: string } | undefined
  /** Períodos oferecidos neste painel (Estratégico: só 6 e 12 meses, spec 2.3). */
  periodos?: readonly PeriodoPadrao[]
  /** "Personalizado" (De/Até) disponível neste painel. */
  personalizado?: boolean
  variante?: 'popover' | 'lista'
}

const TODOS: readonly PeriodoPadrao[] = ['4s', '12s', '6m', '12m']

function Opcoes({
  periodo,
  onChange,
  historico,
  periodos = TODOS,
  personalizado = true,
}: Omit<Props, 'variante'>) {
  const nome = useId()
  const [custom, setCustom] = useState(periodo.tipo === 'custom')
  const [de, setDe] = useState(periodo.tipo === 'custom' ? periodo.de : '')
  const [ate, setAte] = useState(periodo.tipo === 'custom' ? periodo.ate : '')
  const [erro, setErro] = useState<string | null>(null)
  const idErro = useId()

  const aplicar = () => {
    const msg = historico ? validarPeriodoCustom(de, ate, historico) : null
    setErro(msg)
    if (!msg) onChange({ tipo: 'custom', de, ate }, false)
  }
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">Período</legend>
      <div role="radiogroup" aria-label="Período" className="space-y-1">
        {periodos.map((p) => (
          <label
            key={p}
            className="alvo flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-superficie-2"
          >
            <input
              type="radio"
              name={nome}
              className="size-4 accent-[var(--acento)]"
              checked={!custom && periodo.tipo === p}
              onChange={() => {
                setCustom(false)
                setErro(null)
                onChange({ tipo: p }, false)
              }}
            />
            {ROTULO_PERIODO[p]}
          </label>
        ))}
        {personalizado && (
          <label className="alvo flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-superficie-2">
            <input
              type="radio"
              name={nome}
              className="size-4 accent-[var(--acento)]"
              checked={custom}
              onChange={() => setCustom(true)}
            />
            {ROTULO_PERIODO.custom}
          </label>
        )}
      </div>
      {personalizado && custom && (
        <div className="mt-2 flex flex-col gap-2 text-sm">
          <label className="flex flex-col gap-1">
            De
            <input
              type="date"
              value={de}
              min={historico?.inicio}
              max={historico?.fim}
              onChange={(e) => setDe(e.target.value)}
              aria-describedby={erro ? idErro : undefined}
              aria-invalid={erro ? true : undefined}
              className="rounded border border-borda-controle bg-superficie px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            Até
            <input
              type="date"
              value={ate}
              min={historico?.inicio}
              max={historico?.fim}
              onChange={(e) => setAte(e.target.value)}
              aria-describedby={erro ? idErro : undefined}
              aria-invalid={erro ? true : undefined}
              className="rounded border border-borda-controle bg-superficie px-2 py-1"
            />
          </label>
          {erro && (
            <p id={idErro} role="alert" className="text-alerta">
              {erro}
            </p>
          )}
          <Botao variante="primario" onClick={aplicar}>
            Aplicar período
          </Botao>
        </div>
      )}
    </fieldset>
  )
}

function rotuloPeriodo(p: Periodo): string {
  return p.tipo === 'custom'
    ? `${fmtData(p.de)} a ${fmtData(p.ate)}`
    : (ROTULO_PERIODO[p.tipo] ?? p.tipo)
}

/** Filtro de período (uma opção por vez; "Personalizado" valida as datas junto dos campos). */
export function FiltroPeriodo({ variante = 'popover', ...props }: Props) {
  if (variante === 'lista') {
    return (
      <div className="flex flex-col gap-1" data-testid="filtro-periodo">
        <p className="text-sm font-semibold">Período</p>
        <Opcoes {...props} />
      </div>
    )
  }
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Botao
          className="gap-1 text-sm"
          data-testid="filtro-periodo"
          aria-label={`Período: ${rotuloPeriodo(props.periodo)}. Abrir filtro`}
        >
          <span className="text-texto-2">Período:</span>{' '}
          <span className="font-semibold">{rotuloPeriodo(props.periodo)}</span>
          <Icone nome="chevron" />
        </Botao>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-64 rounded-md border border-borda-controle bg-superficie p-3 shadow-lg"
        >
          <Opcoes {...props} />
          <div className="mt-3 flex justify-end">
            <Popover.Close asChild>
              <Botao className="text-xs">Fechar</Botao>
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
