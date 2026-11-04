import { useId, useState } from 'react'
import { Dica, Icone } from '@/components/ui'
import { ID_AVISO_INCOMPLETO, INCOMPLETO } from '../textos'
import type { RegistroIncompleto } from '../types'

/** Há aviso só com ao menos um card incompleto no recorte; campo ausente ou total 0 = nada (nunca "completo"). */
export const temIncompleto = (r: RegistroIncompleto | undefined): r is RegistroIncompleto =>
  r !== undefined && r.total > 0 && r.cards.length > 0

/** Faixa-resumo (lugar 1): ícone e texto, `role="status"`, tom neutro, não dispensável; sem pessoa nem horas. */
export function AvisoRegistroIncompleto({ registro }: { registro: RegistroIncompleto }) {
  const [aberta, setAberta] = useState(false)
  const idLista = useId()
  return (
    <div
      id={ID_AVISO_INCOMPLETO}
      tabIndex={-1}
      role="status"
      className="flex flex-col gap-1 rounded-md border border-borda-controle bg-superficie-2 p-3 text-sm text-texto"
      data-testid="aviso-registro-incompleto"
    >
      <p className="flex items-start gap-2 font-semibold">
        <Icone nome="info" className="mt-0.5 size-4 shrink-0 text-texto-2" />
        <span>{INCOMPLETO.titulo(registro.total)}</span>
      </p>
      <p className="text-texto-2">{INCOMPLETO.corpo}</p>
      <div>
        <button
          type="button"
          className="alvo inline-flex min-h-11 items-center text-acento underline"
          aria-expanded={aberta}
          aria-controls={idLista}
          onClick={() => setAberta((a) => !a)}
        >
          {aberta ? INCOMPLETO.fecharLista : INCOMPLETO.abrirLista}
        </button>
      </div>
      <ul
        id={idLista}
        hidden={!aberta}
        className="flex flex-col gap-2 break-words"
        data-testid="lista-cards-incompletos"
      >
        {registro.cards.map((c) => (
          <li key={c.cardId} className="flex flex-col gap-0.5 border-t border-borda pt-2">
            <span>
              <span className="text-texto-2">{INCOMPLETO.colunaCard}: </span>
              {c.cardId} · {c.titulo}
            </span>
            <span>
              <span className="text-texto-2">{INCOMPLETO.colunaProjeto}: </span>
              {c.projeto.foraDoEscopo
                ? `${c.projeto.rotulo} (Fora dos quadros coletados)`
                : c.projeto.rotulo}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Selo "Horas incompletas" (ícone e texto) com dica focável; o Dica abre ao ativar o selo (clique, toque, Enter ou Espaço), não por foco simples; fecha com Esc. */
export function SeloHorasIncompletas() {
  return (
    <Dica texto={INCOMPLETO.dicaSelo}>
      <button
        type="button"
        className="inline-flex min-h-6 items-center gap-1 rounded border border-borda-controle bg-superficie-2 px-2 py-0.5 text-xs text-texto"
      >
        <Icone nome="info" className="size-3" /> {INCOMPLETO.selo}
      </button>
    </Dica>
  )
}

/** Nota no cartão de KPIs (lugar 3): aponta para a faixa; não repete o número. */
export function NotaKpisIncompleto() {
  return (
    <p className="text-xs text-texto-2" data-testid="nota-kpis-incompleto">
      {INCOMPLETO.notaKpis}{' '}
      <a
        href={`#${ID_AVISO_INCOMPLETO}`}
        className="text-acento underline"
        onClick={(e) => {
          e.preventDefault()
          const el = document.getElementById(ID_AVISO_INCOMPLETO)
          el?.scrollIntoView()
          el?.focus()
        }}
      >
        {INCOMPLETO.irAoAviso}
      </a>
    </p>
  )
}
