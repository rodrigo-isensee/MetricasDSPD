import clsx from 'clsx'
import { useId } from 'react'
import { Icone } from './Icone'

interface Opcao<V extends string> {
  valor: V
  rotulo: string
}

interface Props<V extends string> {
  rotulo?: string
  valor: V
  onChange: (v: V) => void
  opcoes: readonly Opcao<V>[]
  /** Intenção de escolher uma opção (ponteiro sobre ela ou foco): serve para pré-carregar o que ela mostra. */
  onIntencao?: (v: V) => void
}

/** Grupo de rádio segmentado ("Resumo / Diária / Semanal / Sustentação"). O foco permanece no seletor ao alternar. */
export function SeletorCadencia<V extends string>({
  rotulo = 'Cadência',
  valor,
  onChange,
  opcoes,
  onIntencao,
}: Props<V>) {
  const nome = useId()
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="seletor-cadencia">
      <span aria-hidden="true" className="text-sm font-medium text-texto-2">
        {rotulo}:
      </span>
      <div
        role="radiogroup"
        aria-label={rotulo}
        className="grid grid-cols-[repeat(2,minmax(0,1fr))] overflow-hidden rounded-md border border-borda-controle min-[400px]:inline-flex min-[400px]:flex-wrap"
      >
        {opcoes.map((o) => (
          <label
            key={o.valor}
            {...(onIntencao ? { onPointerEnter: () => onIntencao(o.valor) } : {})}
            className={clsx(
              'alvo inline-flex min-w-0 cursor-pointer items-center [overflow-wrap:anywhere] px-3 py-1.5 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-acento',
              valor === o.valor
                ? 'bg-acento font-semibold text-acento-texto'
                : 'bg-superficie text-texto hover:bg-superficie-2',
            )}
          >
            <input
              type="radio"
              name={nome}
              value={o.valor}
              checked={valor === o.valor}
              onChange={() => onChange(o.valor)}
              {...(onIntencao ? { onFocus: () => onIntencao(o.valor) } : {})}
              className="sr-only"
            />
            {valor === o.valor && <Icone nome="check" className="mr-1 size-4" />}
            {o.rotulo}
          </label>
        ))}
      </div>
    </div>
  )
}
