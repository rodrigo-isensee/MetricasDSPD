import { useId } from 'react'
import { Icone } from '@/components/ui'
import { DICA_LEITURA_RELATIVA, SELO_LEITURA_RELATIVA } from '../textos'

/**
 * Selo fixo de leitura relativa (`capacidade.leituraRelativa`): ícone e texto, sempre visível, cor neutra
 * (sem verde, amarelo nem vermelho). A dica longa é texto visível ligado por `aria-describedby`, nunca só hover.
 */
export function SeloLeituraRelativa() {
  const idDica = useId()
  return (
    <div className="flex flex-col gap-1" data-testid="selo-leitura-relativa">
      <span
        className="inline-flex w-fit items-center gap-1 rounded-md border border-borda-controle bg-superficie-2 px-2 py-0.5 text-sm font-semibold text-texto-2"
        aria-describedby={idDica}
      >
        <Icone nome="info" className="size-3.5" />
        {SELO_LEITURA_RELATIVA}
      </span>
      <p id={idDica} className="text-xs text-texto-2">
        {DICA_LEITURA_RELATIVA}
      </p>
    </div>
  )
}
