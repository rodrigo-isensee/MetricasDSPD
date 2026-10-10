import { Dialog } from 'radix-ui'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { Botao, Icone } from '@/components/ui'
import { CHAVES_MEMORIA, useMemoriaAtual } from '@/features/filtros'
import { DESTINOS } from './rotas'

/**
 * Os links para painéis de FLUXO são montados com os filtros de fluxo da SESSÃO (memória em memória,
 * não só a URL do painel de origem): quem sai do Operacional com `equipe=fluig`, passa pelo
 * Estratégico (que não usa equipe) e volta, encontra a equipe de novo. Sustentação e Visão geral
 * são sempre limpas (spec 1.2, critério 6). O parâmetro oculto `mock` nunca é propagado (6.6).
 */
function useBusca(): (destino: (typeof DESTINOS)[number]) => string {
  const memoria = useMemoriaAtual()
  return (d) => {
    const p = new URLSearchParams()
    if (d.fluxo) for (const k of CHAVES_MEMORIA) if (memoria[k]) p.set(k, memoria[k])
    const s = p.toString()
    return s ? `?${s}` : ''
  }
}

const cls = ({ isActive }: { isActive: boolean }) =>
  `alvo inline-flex items-center rounded-md px-3 py-1.5 text-sm hover:bg-superficie-2 ${isActive ? 'font-bold underline decoration-2 underline-offset-4' : 'font-medium'}`

export function NavegacaoGlobal() {
  const busca = useBusca()
  const [aberta, setAberta] = useState(false)
  return (
    <>
      <nav aria-label="Navegação principal" className="hidden lg:block">
        <ul className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
          {DESTINOS.map((d) => (
            <li key={d.to}>
              <NavLink to={{ pathname: d.to, search: busca(d) }} end={d.to === '/'} className={cls}>
                {d.rotulo}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="lg:hidden">
        <Dialog.Root open={aberta} onOpenChange={setAberta}>
          <Dialog.Trigger asChild>
            <Botao data-testid="abrir-menu">
              <Icone nome="menu" /> Menu
            </Botao>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
            <Dialog.Content
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] overflow-auto border-r border-borda-controle bg-superficie p-4 shadow-xl"
              aria-describedby={undefined}
            >
              <Dialog.Title className="mb-3 text-lg font-bold">Menu</Dialog.Title>
              <nav aria-label="Navegação principal">
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {DESTINOS.map((d) => (
                    <li key={d.to}>
                      <NavLink
                        to={{ pathname: d.to, search: busca(d) }}
                        end={d.to === '/'}
                        className={cls}
                        onClick={() => setAberta(false)}
                      >
                        {d.rotulo}
                      </NavLink>
                    </li>
                  ))}
                  <li>
                    <Link
                      to="/ajuda"
                      className="alvo inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium hover:bg-superficie-2"
                      onClick={() => setAberta(false)}
                    >
                      Ajuda
                    </Link>
                  </li>
                </ul>
              </nav>
              <Dialog.Close asChild>
                <Botao className="mt-4">Fechar</Botao>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  )
}
