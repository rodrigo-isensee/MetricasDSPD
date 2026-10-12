import { Popover } from 'radix-ui'
import { Icone } from '@/components/ui'
import { useFonte } from '@/data'

/**
 * Selo permanente "Dados fictícios" (D12): sempre no cabeçalho, com texto + ícone, contraste >= 4,5:1,
 * e sem nenhum botão que o remova. O popover só explica. Só aparece com a fonte mock: contra a
 * API real os dados não são fictícios (plano integracao-real D5).
 */
export function AvisoDadosFicticios() {
  const { tipo } = useFonte()
  if (tipo !== 'mock') return null
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="alvo inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-atencao bg-atencao-fundo px-2 py-1 text-xs font-semibold text-atencao sm:text-sm"
          data-testid="aviso-dados-ficticios"
        >
          <Icone nome="info" />
          Dados fictícios
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 max-w-xs rounded-md border border-borda-controle bg-superficie p-3 text-sm text-texto shadow-lg"
        >
          Estes painéis usam dados gerados para validar a experiência. Nenhum número representa a
          operação real. Mesmo com a coleta ativa, o cartão marcado "Dados fictícios" ainda não tem
          fonte real.
          <Popover.Arrow className="fill-superficie" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
