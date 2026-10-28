import { Dialog } from 'radix-ui'
import { useRef, useState } from 'react'
import {
  PAINEIS_COM_CARTOES,
  ROTULO_PAINEL,
  cartoesDoPainel,
  type PainelComCartoes,
} from '@metricas-dspd/contratos'
import { Botao, Icone } from '@/components/ui'
import { OpcaoMarcadores } from './OpcaoMarcadores'
import { usePreferencias } from './ProvedorPreferencias'

function GrupoPainel({ painel }: { painel: PainelComCartoes }) {
  const prefs = usePreferencias()
  const todos = cartoesDoPainel(painel)
  const cartoes = todos.filter((c) => c.grupo === 'nucleo')
  const complementares = todos.filter((c) => c.grupo === 'complementar')
  const ocultos = prefs.ocultosSalvos(painel)
  const percepcao = todos.filter((c) => c.grupo === 'percepcao')
  const secoes = [...new Set(cartoes.map((c) => c.secao))]
  const grupos = [
    ...secoes.map((s) => {
      const doGrupo = cartoes.filter((c) => c.secao === s)
      return { chave: s, titulo: doGrupo[0]?.secaoTitulo, cartoes: doGrupo }
    }),
    { chave: 'complementares', titulo: 'Complementares', cartoes: complementares },
    ...(percepcao.length > 0
      ? [{ chave: 'percepcao', titulo: 'Percepção de valor (pesquisa)', cartoes: percepcao }]
      : []),
  ]
  return (
    <fieldset
      className="m-0 min-w-0 rounded-lg border border-borda bg-superficie p-4"
      data-testid={`grupo-${painel}`}
    >
      <legend className="px-1 text-lg font-bold">{ROTULO_PAINEL[painel]}</legend>
      <p className="text-sm text-texto-2" data-testid={`contador-${painel}`}>
        {cartoes.filter((c) => !ocultos.includes(c.id)).length} de {cartoes.length} do núcleo e{' '}
        {complementares.filter((c) => !ocultos.includes(c.id)).length} de {complementares.length}{' '}
        complementares visíveis
        {percepcao.length > 0 &&
          ` · ${percepcao.filter((c) => !ocultos.includes(c.id)).length} de ${percepcao.length} da pesquisa de percepção`}
      </p>
      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
        {grupos.map((g) => {
          return (
            <div key={g.chave} role="group" aria-label={g.titulo}>
              <p className="text-sm font-semibold">{g.titulo}</p>
              <ul className="m-0 list-none p-0">
                {g.cartoes.map((c) => (
                  <li key={c.id}>
                    <label className="alvo flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-superficie-2">
                      <input
                        type="checkbox"
                        className="size-4 accent-[var(--acento)]"
                        checked={!ocultos.includes(c.id)}
                        onChange={(e) =>
                          prefs.definirSalvos(
                            painel,
                            e.target.checked
                              ? ocultos.filter((x) => x !== c.id)
                              : [...ocultos, c.id],
                          )
                        }
                      />
                      <span>
                        <strong>{c.codigo}</strong> {c.rotulo}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

function RestaurarPadrao({ ocultos }: { ocultos: readonly string[] }) {
  const {
    restaurarPadrao,
    podeDesfazerRestauracao,
    restauradas,
    desfazerRestauracao,
    dispensarDesfazer,
  } = usePreferencias()
  const [aberto, setAberto] = useState(false)
  const gatilho = useRef<HTMLButtonElement>(null)
  const desfazer = useRef<HTMLButtonElement>(null)
  const [anuncio, setAnuncio] = useState('')
  const confirmou = useRef(false)
  const sair = (aoFechar: () => void) => {
    aoFechar()
    // O botão que tinha o foco some: o foco volta ao "Restaurar padrão".
    setTimeout(() => gatilho.current?.focus(), 0)
  }
  return (
    <>
      <Dialog.Root open={aberto} onOpenChange={setAberto}>
        <Dialog.Trigger asChild>
          <Botao ref={gatilho}>Restaurar padrão</Botao>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
          <Dialog.Content
            onCloseAutoFocus={(e) => {
              if (!confirmou.current) return
              confirmou.current = false
              e.preventDefault()
            }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(28rem,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-borda-controle bg-superficie p-4 shadow-xl"
          >
            <Dialog.Title className="text-lg font-bold">Restaurar o padrão?</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm">
              {ocultos.length === 0
                ? 'Nenhuma métrica está oculta no seu padrão. Os painéis seguem como estão.'
                : `${ocultos.length === 1 ? 'A métrica oculta' : `As ${ocultos.length} métricas ocultas`} (${ocultos.join(', ')}) ${ocultos.length === 1 ? 'volta' : 'voltam'} a aparecer em todos os painéis e a seção "Mais métricas deste painel" volta a abrir.`}
              {ocultos.length > 0 && ' Dá para desfazer logo depois.'}
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Botao>Cancelar</Botao>
              </Dialog.Close>
              <Botao
                variante="primario"
                onClick={() => {
                  restaurarPadrao()
                  setAnuncio(
                    ocultos.length === 0
                      ? 'Nada a restaurar.'
                      : `Padrão restaurado: ${ocultos.length} ${ocultos.length === 1 ? 'métrica voltou' : 'métricas voltaram'} a aparecer.`,
                  )
                  setAberto(false)
                  confirmou.current = true
                  // Depois de confirmar o foco vai ao "Desfazer" (ou ao gatilho, se nada foi restaurado).
                  setTimeout(() => (desfazer.current ?? gatilho.current)?.focus(), 0)
                }}
              >
                Restaurar
              </Botao>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-sm"
        data-testid="restauracao"
      >
        {podeDesfazerRestauracao && (
          <>
            <span>
              Padrão restaurado: {restauradas}{' '}
              {restauradas === 1 ? 'métrica voltou' : 'métricas voltaram'} a aparecer.
            </span>
            <Botao ref={desfazer} onClick={() => sair(desfazerRestauracao)}>
              Desfazer
            </Botao>
            <Botao onClick={() => sair(dispensarDesfazer)}>Dispensar</Botao>
          </>
        )}
        {!podeDesfazerRestauracao && <span className="sr-only">{anuncio}</span>}
      </div>
    </>
  )
}

/** `/preferencias`: o padrão pessoal de métricas visíveis, por painel. Aplica na hora, sem botão Salvar. */
/** Na tela, a visão Sustentação vem logo depois do Operacional (a ordem dos dados não muda). */
const ORDEM_NA_TELA = [
  'operacional',
  'sustentacao',
  ...PAINEIS_COM_CARTOES.filter((p) => p !== 'operacional' && p !== 'sustentacao'),
] as const

export default function PreferenciasPage() {
  const prefs = usePreferencias()
  const codigosOcultos = PAINEIS_COM_CARTOES.flatMap((p) =>
    cartoesDoPainel(p)
      .filter((c) => prefs.ocultosSalvos(p).includes(c.id))
      .map((c) => c.codigo),
  )
  return (
    <div className="flex flex-col gap-4">
      <h1 tabIndex={-1} data-foco-rota className="text-2xl font-bold">
        Preferências de métricas
      </h1>
      <p className="text-sm text-texto-2">
        Suas escolhas ficam salvas neste navegador. Ninguém as vê e elas não entram em nenhum
        cálculo.
      </p>
      {!prefs.pronto ? (
        <div role="status" aria-busy="true" data-testid="preferencias-carregando">
          <span className="sr-only">Carregando suas preferências…</span>
          <div className="h-64 animate-pulse rounded-lg bg-superficie-2 motion-reduce:animate-none" />
        </div>
      ) : (
        <>
          <section
            aria-labelledby="marcadores-titulo"
            className="flex flex-col gap-2 rounded-lg border border-borda bg-superficie p-4"
          >
            <h2 id="marcadores-titulo" className="text-base font-bold">
              Métricas ocultas nos painéis
            </h2>
            <p className="text-sm text-texto-2">
              O que você oculta num painel continua oculto até você mandar mostrar.
            </p>
            <OpcaoMarcadores />
          </section>
          {ORDEM_NA_TELA.map((p) => (
            <GrupoPainel key={p} painel={p} />
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <RestaurarPadrao ocultos={codigosOcultos} />
            {/* Região permanente: o texto entra e o leitor de tela anuncia (CA-2). */}
            <div role="status">
              {prefs.estadoSalvar === 'salvo' && (
                <p className="flex items-center gap-2 text-sm text-ok">
                  <Icone nome="check" /> Salvo neste navegador
                </p>
              )}
            </div>
            {prefs.estadoSalvar === 'versao-nova' && (
              <p role="alert" className="flex items-center gap-2 text-sm text-alerta">
                <Icone nome="alerta" /> Suas preferências foram salvas por uma versão mais nova do
                sistema e não serão alteradas aqui.
              </p>
            )}
            {prefs.estadoSalvar === 'erro' && (
              <p role="alert" className="flex items-center gap-2 text-sm text-alerta">
                <Icone nome="alerta" /> Não foi possível salvar suas preferências. Tente de novo.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export const handle = { titulo: 'Preferências de métricas' }
