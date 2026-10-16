import { Dialog } from 'radix-ui'
import { Link } from 'react-router'
import { Botao, Icone } from '@/components/ui'
import { usePreferenciasPainel, type PreferenciasPainel } from '@/components/ui'

/** Seções do painel na ordem do catálogo, com os cartões de cada uma (só do grupo pedido). */
export function secoesDoPainel(
  p: PreferenciasPainel,
  grupo: 'nucleo' | 'complementar' | 'percepcao' = 'nucleo',
) {
  const mapa = new Map<string, { id: string; titulo: string; cartoes: typeof p.cartoes }>()
  for (const c of p.cartoes.filter((x) => x.grupo === grupo)) {
    const s = mapa.get(c.secao) ?? { id: c.secao, titulo: c.secaoTitulo, cartoes: [] }
    mapa.set(c.secao, { ...s, cartoes: [...s.cartoes, c] })
  }
  return [...mapa.values()]
}

function GrupoCaixas({
  p,
  titulo,
  ajuda,
  cartoes,
}: {
  p: PreferenciasPainel
  titulo: string
  ajuda?: string
  cartoes: PreferenciasPainel['cartoes']
}) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="text-sm font-semibold">{titulo}</legend>
      {ajuda && <p className="m-0 text-xs text-texto-2">{ajuda}</p>}
      <ul className="m-0 list-none p-0">
        {cartoes.map((c) => (
          <li key={c.id}>
            <label className="alvo flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-superficie-2">
              <input
                type="checkbox"
                className="size-4 accent-[var(--acento)]"
                checked={!p.estaOculto(c.id)}
                onChange={(e) => p.alternar(c.id, e.target.checked)}
              />
              <span>
                <strong>{c.codigo}</strong> {c.rotulo}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}

/**
 * "Métricas: N de M": abre um painel com as caixas do painel atual (popover no desktop, folha
 * no celular). As mudanças valem só para esta visita e não alteram o perfil (CA-4).
 */
export function BotaoMetricas() {
  const p = usePreferenciasPainel()
  if (!p) return null
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Botao aria-haspopup="dialog" data-testid="botao-metricas">
          <Icone nome="menu" />
          <span>
            Métricas: {p.visiveis} de {p.total}
            {` (+${p.complementaresVisiveis} complementares)`}
          </span>
        </Botao>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 lg:bg-transparent" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-auto rounded-t-lg border border-borda-controle bg-superficie p-4 shadow-xl lg:inset-x-auto lg:bottom-auto lg:right-6 lg:top-40 lg:w-[26rem] lg:max-h-[70dvh] lg:rounded-lg"
          data-testid="popover-metricas"
        >
          <Dialog.Title className="text-lg font-bold">
            {p.painel === 'operacional' || p.painel === 'sustentacao'
              ? 'Métricas desta visão'
              : 'Métricas deste painel'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-texto-2">
            Marque o que aparece. Vale para esta visita; o padrão se edita em{' '}
            <Link to="/preferencias" className="text-acento underline">
              Preferências
            </Link>
            .
          </Dialog.Description>
          <div className="mt-3 flex flex-col gap-3">
            {secoesDoPainel(p).map((s) => (
              <GrupoCaixas key={s.id} p={p} titulo={s.titulo} cartoes={s.cartoes} />
            ))}
            <GrupoCaixas
              p={p}
              titulo="Complementares"
              ajuda='Ficam na seção "Mais métricas deste painel".'
              cartoes={secoesDoPainel(p, 'complementar').flatMap((s) => s.cartoes)}
            />
            {secoesDoPainel(p, 'percepcao').length > 0 && (
              <GrupoCaixas
                p={p}
                titulo="Percepção de valor"
                ajuda="Pesquisa trimestral, no fim do painel."
                cartoes={secoesDoPainel(p, 'percepcao').flatMap((s) => s.cartoes)}
              />
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Botao onClick={p.mostrarTodas}>Mostrar todas</Botao>
            <Botao onClick={p.usarMinhas}>Usar minhas preferências</Botao>
            <Dialog.Close asChild>
              <Botao variante="primario">Fechar</Botao>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
