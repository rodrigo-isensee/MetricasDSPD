import { Popover } from 'radix-ui'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
  type ReactNode,
} from 'react'
import { Botao, Icone } from '@/components/ui'
import type { OpcaoFiltro } from '@metricas-dspd/contratos'
import { VALIDADE_MS } from './buscaPendente'

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

/** Texto sem acentos e em minúsculas, para a busca ignorar os dois. */
export function normalizarBusca(t: string): string {
  return t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

/**
 * Regra única do Esc nos filtros: com texto na busca, só limpa o texto (não fecha o Popover nem a folha).
 * Sem texto, o Esc segue e fecha.
 */
function escLimpaBusca(e: { preventDefault: () => void }, texto: string, limpar: () => void) {
  if (!texto) return
  e.preventDefault()
  limpar()
}

/**
 * Para a folha mobile: o campo de busca (com texto) da lista do alvo do Esc, ou `false`. Só olha a lista
 * onde está o foco; texto em outro filtro não segura o Esc (A1 do review).
 */
export function escLimpaBuscaFocada(alvo: EventTarget | null): boolean {
  // O alvo de um teclado é sempre um elemento (no mínimo o body).
  const campo = (alvo as Element)
    .closest('fieldset')
    ?.querySelector<HTMLInputElement>('[data-busca-filtro]')
  return !!campo?.value
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
  busca,
  setBusca,
  buscaRef,
  genero = 'f',
}: Props & {
  busca: string
  setBusca: (t: string) => void
  buscaRef: RefObject<HTMLInputElement | null>
  aoMudar: () => boolean
  atualRef: RefObject<string[]>
  registrar: (ids: string[]) => void
}) {
  // `selecionados` aqui são as marcações exibidas (a última seleção do usuário), não a prop da URL.
  const base = useId()
  const [retorno, setRetorno] = useState('')
  const alternar = (opcaoId: string, marcado: boolean) => {
    // O retorno vale só até a próxima ação; o Enter o redefine logo depois (N1 da revisão de UX do K-278).
    setRetorno('')
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
  const termo = normalizarBusca(busca)
  const visiveis = termo ? opcoes.filter((o) => normalizarBusca(o.nome).includes(termo)) : opcoes
  const foraDaBusca = termo
    ? selecionados.filter((s) => !visiveis.some((o) => o.id === s)).length
    : 0
  const sufixo = (genero === 'f' ? 'a' : 'o') + (foraDaBusca === 1 ? '' : 's')
  const textoFora = `${foraDaBusca} selecionad${sufixo} fora da busca (continua${foraDaBusca === 1 ? '' : 'm'} aplicad${sufixo}).`
  const contagem = !termo
    ? ''
    : visiveis.length === 0
      ? 'Nenhuma opção encontrada.'
      : `${visiveis.length} ${visiveis.length === 1 ? 'opção encontrada' : 'opções encontradas'} de ${opcoes.length}.`
  // Uma só região viva: contagem, aviso das marcações escondidas e retorno do Enter (A3, A4, A5).
  const anuncio = [contagem, foraDaBusca > 0 ? textoFora : '', retorno].filter(Boolean).join(' ')
  const caixas = (el: Element) =>
    Array.from(el.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))
  // Esc no campo ou numa opção: limpa o texto; quem fecha (Popover ou Dialog) é impedido pelo contêiner.
  const aoEsc = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') escLimpaBusca(e, busca, () => {
        setRetorno('')
        setBusca('')
      })
  }
  const aoTeclarCampo = (e: KeyboardEvent<HTMLInputElement>) => {
    aoEsc(e)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      caixas(e.currentTarget.closest('fieldset') as HTMLElement)[0]?.focus()
    } else if (e.key === 'Enter') {
      // Nunca envia formulário; com uma única opção visível, marca ou desmarca.
      e.preventDefault()
      const unica = visiveis.length === 1 ? visiveis[0] : undefined
      if (unica) {
        const marcar = !selecionados.includes(unica.id)
        alternar(unica.id, marcar)
        setRetorno(`${marcar ? 'Marcada' : 'Desmarcada'}: ${unica.nome}.`)
      }
    }
  }
  const aoTeclarLista = (e: KeyboardEvent<HTMLInputElement>) => {
    aoEsc(e)
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    const todas = caixas(e.currentTarget.closest('ul') as HTMLElement)
    const i = todas.indexOf(e.currentTarget)
    e.preventDefault()
    if (e.key === 'ArrowDown') todas[i + 1]?.focus()
    else if (i === 0) buscaRef.current?.focus()
    else todas[i - 1]?.focus()
  }
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="sr-only">{rotulo}</legend>
      <div className="mb-2 flex flex-col gap-1">
        <label htmlFor={`${base}-busca`} className="text-xs font-semibold text-texto-2">
          Buscar <span className="sr-only">em {rotulo}</span>
        </label>
        <input
          ref={buscaRef}
          id={`${base}-busca`}
          type="text"
          autoComplete="off"
          placeholder="Digite para buscar"
          value={busca}
          onChange={(e) => {
            setRetorno('')
            setBusca(e.target.value)
          }}
          onKeyDown={aoTeclarCampo}
          className="alvo w-full rounded border border-borda-controle bg-superficie px-2 py-1 text-sm"
          data-testid={`${id}-busca`}
          data-busca-filtro=""
        />
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {anuncio}
      </p>
      {!termo && opcoes.length > 12 && (
        <p className="mb-1 text-xs text-texto-2" aria-hidden="true">
          {opcoes.length} opções
        </p>
      )}
      {foraDaBusca > 0 && (
        <p
          className="mb-1 text-xs text-texto-2"
          data-testid={`${id}-fora-da-busca`}
          aria-hidden="true"
        >
          {textoFora}
        </p>
      )}
      {termo && visiveis.length === 0 && (
        <p className="py-1 text-sm text-texto-2">Nenhuma opção com “{busca.trim()}”.</p>
      )}
      <ul className="m-0 max-h-64 list-none space-y-1 overflow-auto p-0">
        {visiveis.map((o) => (
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
                onKeyDown={aoTeclarLista}
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
  const [busca, setBusca] = useState('')
  const buscaRef = useRef<HTMLInputElement>(null)
  const atual = useRef<string[]>([...selecionados])
  // Marcações exibidas: seguem a última ação do usuário, não a prop. Com a prop (URL) atrasada, a caixa
  // recém-marcada voltaria a desmarcada e o clique seguinte (desmarcar) viraria "marcar" de novo.
  const [exibidos, setExibidos] = useState<readonly string[]>(selecionados)
  const fixar = (ids: string[]) => {
    atual.current = ids
    setExibidos(ids)
  }
  // Seleções emitidas que a prop ainda não alcançou: uma prop igual a uma emissão anterior (a URL de um
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
      Date.now() - pend.em < VALIDADE_MS
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
          busca={busca}
          setBusca={setBusca}
          buscaRef={buscaRef}
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
      <Popover.Root
        onOpenChange={(a) => {
          // Abrir ou fechar zera o texto da busca; ele nunca vai para a URL.
          setBusca('')
          if (a) mudou.current = false
        }}
      >
        <Popover.Trigger asChild>
          <Botao
            className="gap-1 text-sm"
            data-testid={`filtro-${id}`}
            aria-haspopup="dialog"
            aria-label={`${rotulo}: ${resumo(opcoes, exibidos, genero)}`}
          >
            <span className="text-texto-2">{rotulo}:</span>{' '}
            <span className="font-semibold">{resumo(opcoes, exibidos, genero)}</span>
            <Icone nome="chevron" />
          </Botao>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            aria-label={rotulo}
            sideOffset={6}
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              buscaRef.current?.focus()
            }}
            onEscapeKeyDown={(e) => {
              // Mesma regra da folha (A6): só limpa com o foco na lista de opções com texto digitado;
              // fora dela (Limpar, Fechar) o Esc fecha e devolve o foco ao botão.
              if (escLimpaBuscaFocada(e.target)) escLimpaBusca(e, busca, () => setBusca(''))
            }}
            className="z-50 w-64 rounded-md border border-borda-controle bg-superficie p-3 shadow-lg"
          >
            <Lista
              {...props}
              busca={busca}
              setBusca={setBusca}
              buscaRef={buscaRef}
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
                Limpar seleção
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
