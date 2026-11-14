import { useState } from 'react'
import { useOpcoesFiltro } from '@/data'
import { RECORTE_RESERVA, montarRecorte, type ListaExpansivel } from '../recorte'

/** Lista completa num `<details>` nativo, fechado por padrão; o estado não persiste (UX K-215, CA-3, CA-10). */
function ListaCompleta({ lista }: { lista: ListaExpansivel }) {
  const [aberta, setAberta] = useState(false)
  return (
    <details
      open={aberta}
      className="rounded-md border border-borda bg-superficie text-sm"
      data-testid="recorte-lista"
    >
      <summary
        className="alvo flex min-h-11 cursor-pointer items-center px-3 font-bold"
        // O navegador alterna o `open`; o estado só acompanha para trocar o texto do resumo sem depender do evento `toggle`.
        onClick={() => setAberta((a) => !a)}
      >
        {aberta ? lista.aberto : lista.fechado}
      </summary>
      <ul className="list-disc break-words px-3 pb-3 pl-8 md:columns-2 lg:columns-3 [column-gap:1rem]">
        {lista.itens.map((nome, i) => (
          <li key={`${i}-${nome}`}>{nome}</li>
        ))}
      </ul>
    </details>
  )
}

/**
 * Texto que explica o recorte da Sustentação, lido do campo `recorte` das opções do Acelerato (mesmo cache do
 * filtro, sem pedido novo). Sem o campo, carregando ou em erro: o texto de antes, literal.
 */
export function RecorteSustentacao() {
  const { data } = useOpcoesFiltro('acelerato')
  const texto = data?.recorte ? montarRecorte(data.recorte) : null
  return (
    <div className="flex flex-col gap-2">
      <p
        className="rounded-md border border-borda bg-superficie p-3 text-sm"
        data-testid="recorte-sustentacao"
      >
        {texto ? texto.frase : RECORTE_RESERVA}
      </p>
      {texto?.listas.map((l) => (
        <ListaCompleta key={l.fechado} lista={l} />
      ))}
    </div>
  )
}
