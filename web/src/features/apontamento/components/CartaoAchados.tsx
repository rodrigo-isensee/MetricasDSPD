import { Botao } from '@/components/ui'
import { useDadosAba } from '../dados'
import { CARTOES, fraseDoAchado, VAZIO_ACHADOS } from '../textos'
import type { AchadoApontamento, RespostaApontamento } from '../types'
import { CartaoApontamento } from './CartaoApontamento'

type Acao =
  | { tipo: 'filtro'; chave: 'subgrupo' | 'qualidade' | 'projeto'; valor: string }
  | { tipo: 'ancora'; ancora: string }

interface Exibido {
  chave: string
  frase: string
  rotulo: string
  /** `null` quando o atalho não tem alvo (projeto citado que não está nas opções). */
  acao: Acao | null
}

/** Achados que o front sabe dizer: código desconhecido ou `valores` incompletos somem sem erro visível. */
export function achadosExibidos(r: RespostaApontamento): Exibido[] {
  return r.achados.flatMap((a: AchadoApontamento, i): Exibido[] => {
    const projeto =
      a.codigo === 'concentracao-em-projeto'
        ? r.opcoes.projetos.find((p) => p.rotulo === a.rotuloRef)
        : undefined
    const f = fraseDoAchado(a, projeto?.foraDoEscopo ?? false)
    if (!f) return []
    const at = f.atalho
    const acao: Acao | null =
      at.tipo === 'filtro'
        ? { tipo: 'filtro', chave: at.chave, valor: at.valor }
        : at.tipo === 'ancora'
          ? { tipo: 'ancora', ancora: at.ancora }
          : projeto
            ? { tipo: 'filtro', chave: 'projeto', valor: projeto.id }
            : null
    return [{ chave: `${a.codigo}-${i}`, frase: f.frase, rotulo: at.rotulo, acao }]
  })
}

/** O âncora rola a página; o foco vai junto, ao título do cartão (A-12). */
function irAoTitulo(ancora: string) {
  document.getElementById(ancora)?.querySelector<HTMLElement>('[data-cartao-titulo]')?.focus()
}

function Atalho({ acao, rotulo }: { acao: Acao | null; rotulo: string }) {
  const d = useDadosAba()
  if (acao === null) return null
  if (acao.tipo === 'ancora')
    return (
      <a
        href={'#' + acao.ancora}
        onClick={() => irAoTitulo(acao.ancora)}
        className="alvo inline-flex items-center text-xs text-acento underline"
      >
        {rotulo}
      </a>
    )
  return (
    <Botao className="text-xs" onClick={() => d.definirLista(acao.chave, [acao.valor])}>
      {rotulo}
    </Botao>
  )
}

function Achados({ r }: { r: RespostaApontamento }) {
  const itens = achadosExibidos(r)
  if (itens.length === 0)
    return (
      <p className="text-sm text-texto-2" data-testid="achados-vazio">
        {VAZIO_ACHADOS}
      </p>
    )
  return (
    <ul className="flex flex-col gap-2" data-testid="lista-achados">
      {itens.map((e) => (
        <li key={e.chave} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="min-w-0 [overflow-wrap:anywhere]">{e.frase}</span>
          <Atalho acao={e.acao} rotulo={e.rotulo} />
        </li>
      ))}
    </ul>
  )
}

export function CartaoAchados() {
  return (
    <CartaoApontamento
      codigo="AP-ACHADOS"
      titulo="Achados"
      texto={CARTOES.achados}
      semTabela
      className="lg:col-span-12"
    >
      {(r) => <Achados r={r} />}
    </CartaoApontamento>
  )
}
