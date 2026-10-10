import { useId, useState, type CSSProperties } from 'react'
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

export type EstadoFaixa = 'ok' | 'carregando' | 'erro'

/** Combina as consultas que alimentam a faixa: erro vence carregando, que vence ok. */
export function estadoFaixa(qs: readonly { estado: string; recarregar?: () => void }[]): {
  estado: EstadoFaixa
  recarregar: () => void
} {
  const estado = qs.some((q) => q.estado === 'erro')
    ? 'erro'
    : qs.some((q) => q.estado === 'carregando')
      ? 'carregando'
      : 'ok'
  return { estado, recarregar: () => qs.forEach((q) => q.recarregar?.()) }
}

interface Props {
  /** Enquanto carrega ou com erro, nunca afirma "Nada pede atenção". */
  estado?: EstadoFaixa
  onTentarDeNovo?: () => void
  /** Qual dos três títulos da spec 7.3. */
  momento?: keyof typeof TITULOS_FAIXA
  /** Texto livre; sobrepõe `momento`. */
  titulo?: string
  itens: readonly ItemAtencao[]
  vazio?: string
  /** Máximo de itens antes de "Ver todos os alertas (N)". */
  maximo?: number
  /** Altura (px) da faixa já pronta, em coluna única e em `lg`; reservada enquanto carrega (sem salto, K-050). */
  reserva?: { mobile: number; desktop: number }
}

/** "Pede atenção": primeiro o que pede ação. Cada item leva ao cartão; ícone + texto, nunca só cor. */
export function FaixaAtencao({
  momento = 'agora',
  titulo = TITULOS_FAIXA[momento],
  itens,
  vazio = 'Nada pede atenção agora com base nas metas publicadas.',
  maximo,
  estado = 'ok',
  onTentarDeNovo,
  reserva,
}: Props) {
  const [todos, setTodos] = useState(false)
  const idLista = useId()
  const reservando = estado === 'carregando' && reserva !== undefined
  const lista = maximo && !todos ? itens.slice(0, maximo) : itens
  return (
    <section
      aria-label={titulo}
      className={`rounded-lg border border-borda bg-superficie p-3${reservando ? ' min-h-[var(--fa-m)] lg:min-h-[var(--fa-d)]' : ''}`}
      style={
        reservando
          ? ({ '--fa-m': `${reserva.mobile}px`, '--fa-d': `${reserva.desktop}px` } as CSSProperties)
          : undefined
      }
      data-testid="faixa-atencao"
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-texto-2">{titulo}</h2>
      {estado === 'carregando' ? (
        <p
          className="mt-2 text-sm text-texto-2"
          role="status"
          aria-busy="true"
          data-testid="faixa-atencao-carregando"
        >
          Verificando o que pede atenção…
        </p>
      ) : estado === 'erro' ? (
        <div role="alert" className="mt-2 text-sm" data-testid="faixa-atencao-erro">
          <p className="flex items-center gap-2 text-alerta">
            <Icone nome="alerta" /> Não foi possível verificar o que pede atenção.
          </p>
          {onTentarDeNovo && (
            <button
              type="button"
              onClick={onTentarDeNovo}
              className="alvo mt-1 rounded text-acento underline"
            >
              Tentar de novo
            </button>
          )}
        </div>
      ) : itens.length === 0 ? (
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
      {estado === 'ok' && maximo !== undefined && itens.length > maximo && (
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
