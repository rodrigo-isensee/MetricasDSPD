import { useId, useState } from 'react'
import { MINIMO_AMOSTRA } from '@/contracts/comum'
import { Botao } from './Botao'
import { Icone } from './Icone'

/** Texto fixo da nota: as cinco seções do briefing (spec 4.0.1). Mantenha o texto em um arquivo notas.ts por feature. */
export interface TextoNota {
  oQueE: string
  comoSeCalcula: string
  comoLer: string
  meta: string
  cuidados: string
}

/** Linhas automáticas "Nesta tela" (janela, filtros, base amostral e regra de mínimo). */
export interface NestaTela {
  janela?: string | null
  filtros?: string | null
  base?: string | null
}

interface Props {
  codigo: string
  nota: TextoNota
  nestaTela?: NestaTela
}

const SECOES: { chave: keyof TextoNota; titulo: string }[] = [
  { chave: 'oQueE', titulo: 'O que é' },
  { chave: 'comoSeCalcula', titulo: 'Como se calcula' },
  { chave: 'comoLer', titulo: 'Como ler' },
  { chave: 'meta', titulo: 'Meta' },
  { chave: 'cuidados', titulo: 'Cuidados e limites' },
]

interface BotaoProps {
  aberta: boolean
  onAlternar: () => void
  /** id do bloco que o botão controla. */
  controla: string
}

/** Botão "Como ler e como é calculado" (fica no cabeçalho do cartão, spec 4.0 e 5). */
export function BotaoNota({ aberta, onAlternar, controla }: BotaoProps) {
  return (
    <Botao onClick={onAlternar} aria-expanded={aberta} aria-controls={controla} className="text-xs">
      <Icone nome="livro" />
      Como ler e como é calculado
    </Botao>
  )
}

interface BlocoProps {
  id: string
  aberta: boolean
  nota: TextoNota
  nestaTela?: NestaTela | undefined
  testid?: string
}

/** Conteúdo da nota: cinco seções + "Nesta tela". Expande logo abaixo do cabeçalho do cartão. */
export function BlocoNota({ id, aberta, nota, nestaTela, testid }: BlocoProps) {
  return (
    <div
      id={id}
      {...(testid ? { 'data-testid': testid } : {})}
      hidden={!aberta}
      className="mt-2 rounded-md border border-borda bg-superficie-2 p-3 text-sm"
    >
      {SECOES.map((s) => (
        <section key={s.chave} className="mb-2 last:mb-0">
          <h4 className="font-semibold">{s.titulo}</h4>
          <p className="text-texto-2">{nota[s.chave]}</p>
        </section>
      ))}
      <section className="mt-3 border-t border-borda pt-2">
        <h4 className="font-semibold">Nesta tela</h4>
        <ul className="list-disc pl-5 text-texto-2">
          <li>Janela: {nestaTela?.janela ?? 'não se aplica a este cartão'}</li>
          <li>Filtros aplicados: {nestaTela?.filtros ?? 'nenhum'}</li>
          <li>Base amostral: {nestaTela?.base ?? 'não informada'}</li>
          <li>
            Regra de amostra mínima: estatísticas com menos de {MINIMO_AMOSTRA} itens não são
            publicadas.
          </li>
        </ul>
      </section>
    </div>
  )
}

/**
 * Nota autônoma (botão + bloco juntos), para uso fora do `CartaoMetrica`. Abrir ou fechar não move
 * o foco (critério 83). Fechada por padrão.
 */
export function NotaMetodologica({ codigo, nota, nestaTela }: Props) {
  const [aberta, setAberta] = useState(false)
  const id = useId()
  return (
    <div data-testid={`nota-${codigo}`}>
      <BotaoNota aberta={aberta} onAlternar={() => setAberta((a) => !a)} controla={id} />
      <BlocoNota id={id} aberta={aberta} nota={nota} nestaTela={nestaTela} />
    </div>
  )
}
