import { textoJanela } from '@/lib/formatar'
import { Dica } from './Dica'

interface Props {
  /** Janela de percentis (parâmetro único): o texto é gerado dela, nunca escrito à mão. */
  janela: { unidade: 'semanas' | 'meses'; quantidade: number }
}

/** "Janela fixa: 12 semanas": aparece quando o período escolhido difere da janela (spec 2.3, critério 29). */
export function SeloJanela({ janela }: Props) {
  const t = textoJanela(janela)
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-borda bg-superficie-2 px-2 py-0.5 text-xs text-texto-2">
      Janela fixa: {t}
      <Dica
        texto={`Os percentis usam sempre as últimas ${t} do período escolhido.`}
        rotulo="Sobre a janela fixa"
      />
    </span>
  )
}
