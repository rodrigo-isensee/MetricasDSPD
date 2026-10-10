import { useId, useState } from 'react'
import { Link } from 'react-router'
import { Icone } from './Icone'

export interface ItemAtencao {
  id: string
  texto: string
  /** Âncora do cartão na mesma página (`#o2`) ou rota (`/operacional#o2`). */
  para: string
  /** Código do cartão para o rótulo do link ("Ver O2"); padrão: o `id` em maiúsculas. */
  codigo?: string
  rotuloLink?: string
}

/** Títulos da faixa por painel (spec 7.3): Visão geral e Operacional "hoje", Tático e Sustentação "na semana", Estratégico "agora". */
export const TITULOS_FAIXA = {
  hoje: 'Pede atenção hoje',
  semana: 'Pede atenção na semana',
  agora: 'Pede atenção agora',
} as const

interface Props {
  /** Qual dos três títulos da spec 7.3. */
  momento?: keyof typeof TITULOS_FAIXA
  /** Texto livre; sobrepõe `momento`. */
  titulo?: string
  itens: readonly ItemAtencao[]
  vazio?: string
  /** Máximo de itens antes de "Ver todos os alertas (N)". */
  maximo?: number
}

/** "Pede atenção": primeiro o que pede ação. Cada item leva ao cartão; ícone + texto, nunca só cor. */
export function FaixaAtencao({
  momento = 'agora',
  titulo = TITULOS_FAIXA[momento],
  itens,
  vazio = 'Nada pede atenção agora com base nas metas publicadas.',
  maximo,
}: Props) {
  const [todos, setTodos] = useState(false)
  const idLista = useId()
  const lista = maximo && !todos ? itens.slice(0, maximo) : itens
  return (
    <section
      aria-label={titulo}
      className="rounded-lg border border-borda bg-superficie p-3"
      data-testid="faixa-atencao"
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-texto-2">{titulo}</h2>
      {itens.length === 0 ? (
        <p className="mt-2 flex items-center gap-2 text-sm text-ok">
          <Icone nome="check" /> {vazio}
        </p>
      ) : (
        <ul id={idLista} className="mt-2 flex flex-wrap gap-2">
          {lista.map((i) => {
            const interno = i.para.startsWith('#')
            const conteudo = (
              <>
                <Icone nome="alerta" className="size-4 text-alerta" />
                <span>{i.texto}</span>
                <span className="text-acento underline">
                  {i.rotuloLink ?? `Ver ${i.codigo ?? i.id.toUpperCase()}`}
                </span>
              </>
            )
            const cls =
              'alvo inline-flex items-center gap-2 rounded-md border border-borda bg-superficie-2 px-3 py-1.5 text-sm text-texto hover:bg-acento-fundo'
            return (
              <li key={i.id}>
                {interno ? (
                  <a href={i.para} className={cls}>
                    {conteudo}
                  </a>
                ) : (
                  <Link to={i.para} className={cls}>
                    {conteudo}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {maximo !== undefined && itens.length > maximo && (
        <button
          type="button"
          aria-expanded={todos}
          aria-controls={idLista}
          onClick={() => setTodos((t) => !t)}
          className="alvo mt-2 rounded text-sm text-acento underline"
        >
          {todos ? 'Mostrar menos alertas' : `Ver todos os alertas (${itens.length})`}
        </button>
      )}
    </section>
  )
}
