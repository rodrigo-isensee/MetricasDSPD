import { Popover } from 'radix-ui'
import { useEffect, useId, useRef, useState, type RefObject, type ReactNode } from 'react'
import { Botao, Icone } from '@/components/ui'
import type { OpcaoFiltro } from '@metricas-dspd/contratos'

interface Props {
  /** Usado no data-testid (`filtro-equipe`). */
  id: string
  rotulo: string
  opcoes: readonly OpcaoFiltro[]
  selecionados: readonly string[]
  /** `replace`: mudanças seguintes no mesmo popover não criam novas entradas de histórico. */
  onChange: (ids: string[], replace: boolean) => void
  variante?: 'popover' | 'lista'
  dica?: ReactNode
  genero?: 'f' | 'm'
}

function resumo(opcoes: readonly OpcaoFiltro[], sel: readonly string[], genero: 'f' | 'm'): string {
  if (sel.length === 0) return genero === 'f' ? 'Todas' : 'Todos'
  if (sel.length === 1) return opcoes.find((o) => o.id === sel[0])?.nome ?? (sel[0] as string)
  return `${sel.length} selecionad${genero === 'f' ? 'as' : 'os'}`
}

function Lista({
  id,
  rotulo,
  opcoes,
  selecionados,
  onChange,
  aoMudar,
  atualRef,
  registrar,
}: Props & {
  aoMudar: () => boolean
  atualRef: RefObject<string[]>
  registrar: (ids: string[]) => void
}) {
  // `selecionados` aqui são as marcações exibidas (a última seleção do usuário), não a prop da URL.
  const base = useId()
  const alternar = (opcaoId: string, marcado: boolean) => {
    const replace = aoMudar()
    // Parte da última seleção emitida, não da prop: cliques em sequência rápida chegam antes de a URL
    // (fonte da prop) re-renderizar, e a prop velha perderia a marcação anterior (bug 004).
    const base = atualRef.current
    const prox = marcado
      ? [...base.filter((x) => x !== opcaoId), opcaoId]
      : base.filter((x) => x !== opcaoId)
    registrar(prox)
    onChange(prox, replace)
  }
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">{rotulo}</legend>
      <ul className="m-0 max-h-64 list-none space-y-1 overflow-auto p-0">
        {opcoes.map((o) => (
          <li key={o.id}>
            <label
              htmlFor={`${base}-${o.id}`}
              className="alvo flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-superficie-2"
            >
              <input
                id={`${base}-${o.id}`}
                type="checkbox"
                className="size-4 accent-[var(--acento)]"
                checked={selecionados.includes(o.id)}
                onChange={(e) => alternar(o.id, e.target.checked)}
                data-testid={`${id}-opcao-${o.id}`}
              />
              {o.nome}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}

/**
 * Filtro de seleção múltipla. Aplica na hora a cada marcação. `popover`: botão com rótulo visível
 * ("Equipe: Todas") que abre a lista, Esc fecha e devolve o foco. `lista`: lista inline (folha mobile).
 */
export function FiltroMulti(props: Props) {
  const {
    id,
    rotulo,
    opcoes,
    selecionados,
    onChange,
    variante = 'popover',
    dica,
    genero = 'f',
  } = props
  const mudou = useRef(false)
  const atual = useRef<string[]>([...selecionados])
  // Marcações exibidas: seguem a última ação do usuário, não a prop. Com a prop (URL) atrasada, a caixa
  // recém-marcada voltaria a desmarcada e o clique seguinte (desmarcar) viraria "marcar" de novo.
  const [exibidos, setExibidos] = useState<readonly string[]>(selecionados)
  const fixar = (ids: string[]) => {
    atual.current = ids
    setExibidos(ids)
  } // Seleções emitidas que a prop ainda não alcançou: uma prop igual a uma emissão anterior (a URL de um
  // clique antigo, que chega atrasada sob carga) não sobrescreve `atual` (IF-002/IS-003). Uma prop que
  // nunca foi emitida é mudança de fora (chip removido, Limpar) e ressincroniza.
  const emitida = useRef<{ chaves: Set<string>; ultima: string; em: number } | null>(null)
  const chaveProp = selecionados.join('\u0000')
  useEffect(() => {
    const pend = emitida.current
    if (
      pend &&
      pend.ultima !== chaveProp &&
      pend.chaves.has(chaveProp) &&
      Date.now() - pend.em < 3000
    )
      return
    // A URL (fonte da prop) alcançou a última seleção emitida (ou mudou por fora): ressincroniza.
    emitida.current = null
    fixar(chaveProp === '' ? [] : chaveProp.split('\u0000'))
  }, [chaveProp])
  const registrar = (ids: string[]) => {
    // Marcar todas vira "Todas" na URL (prop vazia): é essa a chave que a prop vai alcançar.
    const todas = opcoes.length > 0 && opcoes.every((o) => ids.includes(o.id))
    const chave = todas ? '' : ids.join('\u0000')
    const chaves = emitida.current?.chaves ?? new Set<string>()
    chaves.add(chave)
    emitida.current = { chaves, ultima: chave, em: Date.now() }
    // "Todas" não é uma lista marcada: as caixas voltam a vazias, como a URL vai ficar.
    fixar(todas ? [] : ids)
  }
  const aoMudar = () => {
    const replace = mudou.current
    mudou.current = true
    return replace
  }
  if (variante === 'lista') {
    return (
      <div className="flex flex-col gap-1" data-testid={`filtro-${id}`}>
        <p className="flex items-center gap-1 text-sm font-semibold">
          {rotulo}
          {dica}
        </p>
        <Lista
          {...props}
          selecionados={exibidos}
          aoMudar={aoMudar}
          atualRef={atual}
          registrar={registrar}
        />
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1">
      <Popover.Root onOpenChange={(a) => a && (mudou.current = false)}>
        <Popover.Trigger asChild>
          <Botao
            className="gap-1 text-sm"
            data-testid={`filtro-${id}`}
            aria-haspopup="dialog"
            aria-label={`${rotulo}: ${resumo(opcoes, selecionados, genero)}`}
          >
            <span className="text-texto-2">{rotulo}:</span>{' '}
            <span className="font-semibold">{resumo(opcoes, selecionados, genero)}</span>
            <Icone nome="chevron" />
          </Botao>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="z-50 w-64 rounded-md border border-borda-controle bg-superficie p-3 shadow-lg"
          >
            <Lista
              {...props}
              selecionados={exibidos}
              aoMudar={aoMudar}
              atualRef={atual}
              registrar={registrar}
            />
            <div className="mt-3 flex justify-between gap-2">
              <Botao
                onClick={() => {
                  registrar([])
                  onChange([], mudou.current)
                }}
                className="text-xs"
              >
                Limpar
              </Botao>
              <Popover.Close asChild>
                <Botao className="text-xs">Fechar</Botao>
              </Popover.Close>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {dica}
    </div>
  )
}
