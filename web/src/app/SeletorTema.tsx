import { useId } from 'react'
import { useTema, type PreferenciaTema } from './tema'

/** "Tema: Claro · Escuro · Sistema". Campo com rótulo visível. */
export function SeletorTema() {
  const { preferencia, definir } = useTema()
  const id = useId()
  return (
    <div className="flex items-center gap-1 text-sm">
      <label htmlFor={id} className="sr-only text-texto-2 sm:not-sr-only">
        Tema:
      </label>
      <select
        id={id}
        value={preferencia}
        onChange={(e) => definir(e.target.value as PreferenciaTema)}
        className="alvo rounded-md border border-borda-controle bg-superficie px-2 py-1 text-texto"
        data-testid="seletor-tema"
      >
        <option value="claro">Claro</option>
        <option value="escuro">Escuro</option>
        <option value="sistema">Sistema</option>
      </select>
    </div>
  )
}
