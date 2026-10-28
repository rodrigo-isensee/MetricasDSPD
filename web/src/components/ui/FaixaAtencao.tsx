import { useId, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { useCalibracaoPronta, useEmCalibracao } from './Calibracao'
import { Icone } from './Icone'
import { usePreferenciasPainel } from './PreferenciasPainel'

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
  /** Fonte da faixa, quando a página tem duas: "Pede atenção na semana · Sustentação (Acelerato)". */
  fonte?: string
  itens: readonly ItemAtencao[]
  vazio?: string
  /** Linha auxiliar sob o título com a janela dos números do alerta ("Janela: últimas 12 semanas"). */
  janela?: string
  /** Máximo de itens antes de "Ver todos os alertas (N)". */
  maximo?: number
  /** Altura (px) da faixa já pronta, em coluna única e em `lg`; reservada enquanto carrega (sem salto, K-050). */
  reserva?: { mobile: number; desktop: number }
  /** Nível do título: `h2` nas páginas; `h3` quando a faixa vive dentro de um bloco que já tem `h2` (Resumo). */
  nivel?: 'h2' | 'h3'
}

/** "Pede atenção": primeiro o que pede ação. Cada item leva ao cartão; ícone + texto, nunca só cor. */
export function FaixaAtencao({
  momento = 'agora',
  fonte,
  titulo = fonte ? `${TITULOS_FAIXA[momento]} · ${fonte}` : TITULOS_FAIXA[momento],
  itens: itensBrutos,
  vazio = 'Nada pede atenção agora com base nas metas publicadas.',
  janela,
  maximo,
  estado: estadoDaConsulta = 'ok',
  onTentarDeNovo,
  reserva,
  nivel = 'h2',
}: Props) {
  const Titulo = nivel
  const idTitulo = useId()
  const emCalibracao = useEmCalibracao()
  const prefs = usePreferenciasPainel()
  // Antes de saber o que está em calibração nada é afirmado: nem alerta, nem "Nada pede atenção".
  const calibracaoPronta = useCalibracaoPronta()
  const estado: EstadoFaixa =
    estadoDaConsulta === 'ok' && !calibracaoPronta ? 'carregando' : estadoDaConsulta
  // Métrica em calibração não pede atenção: dados de calibração não são para cobrar (CA-05).
  const itens = itensBrutos.filter((i) => !emCalibracao(i.codigo ?? i.id))
  const omitidos = itensBrutos.length - itens.length
  const [todos, setTodos] = useState(false)
  const idLista = useId()
  const reservando = estado === 'carregando' && reserva !== undefined
  const lista = maximo && !todos ? itens.slice(0, maximo) : itens
  return (
    <section
      aria-labelledby={idTitulo}
      className={`rounded-lg border border-borda bg-superficie p-3${reservando ? ' min-h-[var(--fa-m)] lg:min-h-[var(--fa-d)]' : ''}`}
      style={
        reservando
          ? ({ '--fa-m': `${reserva.mobile}px`, '--fa-d': `${reserva.desktop}px` } as CSSProperties)
          : undefined
      }
      data-testid="faixa-atencao"
    >
      <Titulo id={idTitulo} className="text-sm font-bold uppercase tracking-wide text-texto-2">
        {titulo}
      </Titulo>
      {janela && (
        <p className="mt-1 text-xs text-texto-2" data-testid="faixa-atencao-janela">
          {janela}
        </p>
      )}
      {estado === 'carregando' ? (
        <p
          className="mt-2 text-sm text-texto-2"
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
            // Alerta de métrica oculta continua aqui (nunca é filtrado), com selo e volta pontual (CA-8).
            if (prefs?.estaOculto(i.id)) {
              const cod = i.codigo ?? i.id.toUpperCase()
              return (
                <li key={i.id}>
                  <span
                    className="inline-flex flex-wrap items-center gap-2 rounded-md border border-borda bg-superficie-2 px-3 py-1.5 text-sm text-texto"
                    data-testid={`atencao-oculta-${i.id}`}
                  >
                    <Icone nome="alerta" className="size-4 text-alerta" />
                    <span>{i.texto}</span>
                    <span className="rounded border border-borda-controle px-1.5 text-xs font-semibold">
                      métrica oculta
                    </span>
                    <button
                      type="button"
                      onClick={() => prefs.mostrar(i.id)}
                      className="alvo rounded text-acento underline"
                    >
                      Mostrar {cod}
                    </button>
                  </span>
                </li>
              )
            }
            const interno = i.para.startsWith('#')
            const conteudo = (
              <>
                <Icone nome="alerta" className="size-4 text-alerta" />
                <span className="min-w-0">{i.texto}</span>
                <span className="text-acento underline">
                  {i.rotuloLink ?? `Ver ${i.codigo ?? i.id.toUpperCase()}`}
                </span>
              </>
            )
            const cls =
              'alvo inline-flex max-w-full items-center gap-2 rounded-md border border-borda bg-superficie-2 px-3 py-1.5 text-sm text-texto hover:bg-acento-fundo'
            return (
              <li key={i.id} className="min-w-0 max-w-full">
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
      {estado === 'ok' && omitidos > 0 && (
        <p className="mt-2 text-xs text-texto-2" data-testid="atencao-omitidos-calibracao">
          Itens de métricas em calibração não aparecem aqui.
        </p>
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
