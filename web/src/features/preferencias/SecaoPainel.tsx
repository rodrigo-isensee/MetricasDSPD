import { useEffect, type ReactNode } from 'react'
import { cartaoPorId, type CartaoId } from '@metricas-dspd/contratos'
import {
  Botao,
  Icone,
  Secao,
  usePreferenciasPainel,
  type PreferenciasPainel,
} from '@/components/ui'
import { AvisoDentro } from './MarcadorOculto'

/** Seção com todas as métricas ocultas: um único marcador, com os nomes e o "Mostrar" delas (P1, item 4). */
function MarcadorDaSecao({
  p,
  cartoes,
  titulo,
}: {
  p: PreferenciasPainel
  cartoes: readonly string[]
  titulo?: string
}) {
  const registrar = p.registrarMarcador
  const chave = cartoes.join(',')
  useEffect(() => registrar(chave.split(',')), [registrar, chave])
  const nomes = cartoes
    .map((c) => cartaoPorId(p.painel, c))
    .filter((c) => !!c)
    .map((c) => `${c.rotulo} (${c.codigo})`)
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-dashed border-borda-controle bg-superficie-2 px-3 py-1 text-sm lg:col-span-12"
      data-testid="secao-oculta"
    >
      <Icone nome="olho-cortado" className="size-4 text-texto-2" />
      <span className="min-w-0 flex-1">
        {titulo ? `${titulo} · ` : ''}
        {cartoes.length === 1 ? '1 métrica oculta' : `${cartoes.length} métricas ocultas`}:{' '}
        {nomes.join(', ')}
      </span>
      <Botao
        data-cartao-titulo
        className="min-h-11 min-w-11"
        onClick={() => p.mostrarVarios(cartoes)}
      >
        {cartoes.length === 1 ? 'Mostrar' : `Mostrar as ${cartoes.length}`}
      </Botao>
      {cartoes.map((c) => (
        <AvisoDentro key={c} id={c as CartaoId} p={p} />
      ))}
    </div>
  )
}

/**
 * `Secao` que conhece o recorte: com todos os cartões dela ocultos mostra um marcador único (ou a orientação, com os
 * marcadores desligados); com o painel inteiro oculto some (o estado vazio é do painel). O título ganha "N de M
 * visíveis" quando alguma está oculta. Sem `titulo`, é só o grupo de cartões.
 */
export function SecaoPainel({
  cartoes,
  titulo,
  children,
  ...resto
}: {
  cartoes: readonly string[]
  titulo?: string
  pergunta?: string
  id?: string
  children: ReactNode
}) {
  const p = usePreferenciasPainel()
  if (p?.tudoOculto) return null
  const vazia = !!p && cartoes.every((c) => p.estaOculto(c))
  const visiveis = p ? cartoes.filter((c) => !p.estaOculto(c)).length : cartoes.length
  const corpo = vazia ? (
    p.marcadores ? (
      <MarcadorDaSecao p={p} cartoes={cartoes} {...(titulo ? { titulo } : {})} />
    ) : (
      <div
        className="flex flex-wrap items-center gap-3 text-sm lg:col-span-12"
        data-testid="secao-oculta"
      >
        <p>Todas as métricas desta seção estão ocultas.</p>
        <Botao onClick={() => p.mostrarVarios(cartoes)}>
          {titulo ? 'Mostrar métricas da seção' : 'Mostrar métricas'}
        </Botao>
      </div>
    )
  ) : (
    children
  )
  if (!titulo) return <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">{corpo}</div>
  return (
    <Secao
      titulo={titulo}
      {...(visiveis < cartoes.length
        ? { contagem: `${visiveis} de ${cartoes.length} visíveis` }
        : {})}
      {...resto}
    >
      {corpo}
    </Secao>
  )
}
