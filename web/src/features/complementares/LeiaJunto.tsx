import { cartaoPorIdGlobal, type CartaoCatalogo } from '@metricas-dspd/contratos'
import { useNavigate } from 'react-router'
import { usePreferenciasPainel, type PreferenciasPainel } from '@/components/ui'
import { destinoDoCartao } from '@/lib/destinoCartao'
import { usePreferencias } from '@/features/preferencias/ProvedorPreferencias'

/**
 * "Leia junto: O5 Eficiência de fluxo": do cartão do núcleo para os complementares que o completam. No mesmo
 * painel o link abre a seção "Mais métricas deste painel" e leva ao cartão; para outro painel (O15 a O17, T5 a O14,
 * T9 a E5) navega a `/<painel>#<id>`, e o painel de destino abre a seção e leva o foco ao cartão. Some quando o
 * par está oculto (regra do 007).
 */
export function LeiaJunto({ id }: { id: string }) {
  const p = usePreferenciasPainel()
  return p ? <Pares id={id} p={p} /> : null
}

function Pares({ id, p }: { id: string; p: PreferenciasPainel }) {
  const prefs = usePreferencias()
  const navegar = useNavigate()
  const pares = (p.cartoes.find((c) => c.id === id)?.leiaJunto ?? []).flatMap((x) => {
    const c = cartaoPorIdGlobal(x)
    if (c?.grupo !== 'complementar' && c?.grupo !== 'percepcao') return []
    const oculto =
      c.painel === p.painel ? p.estaOculto(c.id) : prefs.ocultosNaVisita(c.painel).includes(c.id)
    return oculto ? [] : [c]
  })
  if (pares.length === 0) return null
  const ir = (c: CartaoCatalogo) => {
    if (c.painel !== p.painel) void navegar(destinoDoCartao(c))
    else if (c.grupo === 'percepcao') irParaSecaoVisivel(c.id)
    else p.irParaComplementar(c.id)
  }
  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-x-2 text-sm"
      data-testid={`leia-junto-${id}`}
    >
      <span>Leia junto:</span>
      <ul className="m-0 flex list-none flex-wrap gap-x-3 p-0">
        {pares.map((c) => (
          <li key={c.id}>
            <a
              href={destinoDoCartao(c)}
              className="alvo inline-flex items-center text-acento underline"
              aria-label={`${c.codigo} ${c.rotulo}, ${
                c.grupo === 'percepcao'
                  ? 'vai para a seção de percepção de valor'
                  : `abre Mais métricas ${
                      c.painel === p.painel ? 'deste painel' : `do painel ${NOME_PAINEL[c.painel]}`
                    }`
              }`}
              onClick={(e) => {
                e.preventDefault()
                ir(c)
              }}
            >
              {c.codigo} {c.rotulo}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** A pesquisa de percepção já está visível no fim do painel (não fica em "Mais métricas"): rola até ela e leva o foco. */
function irParaSecaoVisivel(id: string) {
  const el = document.getElementById(id)
  el?.scrollIntoView({ block: 'start' })
  el?.querySelector<HTMLElement>('[data-cartao-titulo]')?.focus()
}

const NOME_PAINEL: Record<CartaoCatalogo['painel'], string> = {
  operacional: 'Operacional',
  tatico: 'Tático',
  estrategico: 'Estratégico',
  sustentacao: 'Sustentação',
}
