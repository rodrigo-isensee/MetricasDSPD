import { Dialog } from 'radix-ui'
import { useRef, useState } from 'react'
import { Botao, Dica, Icone } from '@/components/ui'
import { useAlturaCss } from '@/lib/useAlturaCss'
import type { FiltrosFluxo, FiltrosSustentacao, OpcaoFiltro } from '@metricas-dspd/contratos'
import { TIPOS_FILTRO } from '@metricas-dspd/contratos'
import { TIPO_ID } from '@metricas-dspd/contratos'
import { AvisoFiltrosInvalidos } from './AvisoFiltrosInvalidos'
import { ChipsFiltros } from './ChipsFiltros'
import { FiltroMulti } from './FiltroMulti'
import { FiltroPeriodo } from './FiltroPeriodo'
import type { UseFiltros } from './useFiltros'

type Uso = UseFiltros<FiltrosFluxo> | UseFiltros<FiltrosSustentacao>

const TEXTO_ESTRATEGICO =
  'O nível estratégico olha projetos, que envolvem várias equipes. Por isso não há filtro por equipe.'
const TEXTO_TIPO =
  'Aqui são cards do BusinessMap. Chamados do Acelerato estão no painel Sustentação.'

function Controles({ uso, variante }: { uso: Uso; variante: 'popover' | 'lista' }) {
  const { config, opcoes } = uso
  const f = uso.filtros as FiltrosFluxo & FiltrosSustentacao
  const definir = uso.definir
  const tiposOpc: OpcaoFiltro[] = TIPOS_FILTRO.map((t) => ({ id: TIPO_ID[t], nome: t }))
  const bm = opcoes?.dominio === 'businessmap' ? opcoes : undefined
  const ac = opcoes?.dominio === 'acelerato' ? opcoes : undefined
  return (
    <>
      {config.filtros.includes('equipe') && (
        <FiltroMulti
          id="equipe"
          rotulo="Equipe"
          opcoes={opcoes?.equipes ?? []}
          selecionados={f.equipe}
          variante={variante}
          onChange={(ids, replace) => definir({ equipe: ids as never }, { replace })}
        />
      )}
      {config.filtros.includes('tipo') && (
        <FiltroMulti
          id="tipo"
          rotulo="Tipo de demanda"
          genero="m"
          opcoes={tiposOpc}
          selecionados={f.tipo.map((t) => TIPO_ID[t])}
          variante={variante}
          dica={<Dica texto={TEXTO_TIPO} rotulo="Sobre o filtro de tipo" />}
          onChange={(ids, replace) =>
            definir({ tipo: TIPOS_FILTRO.filter((t) => ids.includes(TIPO_ID[t])) }, { replace })
          }
        />
      )}
      {config.filtros.includes('sistema') && (
        <FiltroMulti
          id="sistema"
          rotulo="Sistema"
          genero="m"
          opcoes={bm?.sistemas ?? []}
          selecionados={f.sistema}
          variante={variante}
          onChange={(ids, replace) => definir({ sistema: ids }, { replace })}
        />
      )}
      {config.filtros.includes('prioridade') && (
        <FiltroMulti
          id="prioridade"
          rotulo="Prioridade"
          opcoes={ac?.prioridades ?? []}
          selecionados={f.prioridade.map((p) => p.toLowerCase())}
          variante={variante}
          onChange={(ids, replace) =>
            definir(
              { prioridade: ids.map((i) => i.toUpperCase()) as FiltrosSustentacao['prioridade'] },
              { replace },
            )
          }
        />
      )}
      {config.filtros.includes('periodo') && (
        <FiltroPeriodo
          periodo={f.periodo}
          historico={opcoes?.historico}
          periodos={config.periodos}
          personalizado={config.personalizado}
          variante={variante}
          onChange={(periodo, replace) => definir({ periodo }, { replace })}
        />
      )}
    </>
  )
}

/** "A", "A e B", "A, B e C". */
const listaE = (v: readonly string[]): string =>
  v.length <= 1 ? (v[0] ?? '') : `${v.slice(0, -1).join(', ')} e ${v[v.length - 1]}`

/**
 * Barra de filtros do painel (spec 2): só os filtros que se aplicam, aplicação imediata, chips dos
 * ativos, "Limpar filtros", anúncio para leitores de tela e folha em telas estreitas. Fixa (sticky)
 * a partir de 768 px, sem cobrir o foco (scroll-padding no CSS).
 */
export function BarraFiltros({ uso, estrategico = false }: { uso: Uso; estrategico?: boolean }) {
  const [folha, setFolha] = useState(false)
  const [interagiu, setInteragiu] = useState(false)
  const barra = useRef<HTMLDivElement>(null)
  // A folha mobile inteira conta como UMA mudança de histórico: a primeira empilha, as demais substituem.
  const mudouNaFolha = useRef(false)
  useAlturaCss(barra, '--h-filtros')
  // "Filtros (n)" conta filtros fora do padrão, não valores (Equipe com 3 valores = 1).
  const n = new Set(uso.chips.map((c) => c.chave)).size
  const f = uso.filtros as FiltrosFluxo & FiltrosSustentacao
  // Equipes somadas no resultado: seleção, ou todas (padrão) quando o painel tem filtro de equipe.
  const equipes = uso.config.filtros.includes('equipe')
    ? f.equipe.length || (uso.opcoes?.equipes.length ?? 0)
    : 0

  // Anúncio agrupado por filtro: "Equipe: A e B. Período: Últimas 4 semanas."
  const grupos = new Map<string, string[]>()
  for (const c of uso.chips) grupos.set(c.rotulo, [...(grupos.get(c.rotulo) ?? []), c.valor])
  const resumo = [...grupos].map(([rotulo, valores]) => `${rotulo}: ${listaE(valores)}`).join('. ')
  const anuncio = n === 0 ? 'Filtros limpos.' : `Filtros atualizados. ${resumo}.`

  const envolver =
    <A extends unknown[]>(fn: (...a: A) => void) =>
    (...a: A) => {
      setInteragiu(true)
      fn(...a)
    }
  const usoA: Uso = {
    ...uso,
    definir: envolver(uso.definir as (...a: unknown[]) => void) as Uso['definir'],
    remover: envolver(uso.remover),
    limpar: envolver(uso.limpar),
  } as Uso
  const usoFolha: Uso = {
    ...usoA,
    definir: ((parcial: never, op: { replace?: boolean } = {}) => {
      const replace = mudouNaFolha.current || (op.replace ?? false)
      mudouNaFolha.current = true
      ;(usoA.definir as (p: never, o: { replace: boolean }) => void)(parcial, { replace })
    }) as Uso['definir'],
  } as Uso

  return (
    // `contents`: a barra sticky precisa do contêiner alto do painel, não deste invólucro (bug 003).
    <div className="contents">
      <AvisoFiltrosInvalidos invalidos={uso.invalidos} onEntendi={uso.dispensarInvalidos} />
      <div
        ref={barra}
        className="z-30 border-y border-borda bg-fundo py-2 md:sticky md:top-[var(--h-cabecalho)]"
        data-testid="barra-filtros"
      >
        <div
          className="hidden flex-wrap items-center gap-2 md:flex"
          role="group"
          aria-label="Filtros"
        >
          <Controles uso={usoA} variante="popover" />
          {estrategico && (
            <Dica texto={TEXTO_ESTRATEGICO} rotulo="Por que não há filtro de equipe?" />
          )}
          {uso.foraDoPadrao && (
            <Botao variante="fantasma" onClick={usoA.limpar} data-testid="limpar-filtros">
              Limpar filtros
            </Botao>
          )}
        </div>
        <div className="md:hidden">
          <Dialog.Root
            open={folha}
            onOpenChange={(aberta) => {
              if (aberta) mudouNaFolha.current = false
              setFolha(aberta)
            }}
          >
            <Dialog.Trigger asChild>
              <Botao data-testid="abrir-filtros">
                <Icone nome="filtro" /> Filtros ({n})
              </Botao>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
              <Dialog.Content
                className="fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-auto rounded-t-xl border border-borda-controle bg-superficie p-4 shadow-xl"
                aria-describedby={undefined}
              >
                <Dialog.Title className="mb-3 text-lg font-bold">Filtros</Dialog.Title>
                <div className="flex flex-col gap-4">
                  <Controles uso={usoFolha} variante="lista" />
                  {estrategico && <p className="text-sm text-texto-2">{TEXTO_ESTRATEGICO}</p>}
                </div>
                <div className="mt-4 flex flex-wrap justify-between gap-2">
                  {uso.foraDoPadrao && (
                    <Botao onClick={usoA.limpar} data-testid="limpar-filtros-folha">
                      Limpar filtros
                    </Botao>
                  )}
                  <Dialog.Close asChild>
                    <Botao variante="primario">Ver resultados</Botao>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
      {equipes >= 2 && (
        <p className="text-sm text-texto-2" data-testid="aviso-consolidado">
          Resultado consolidado de {equipes} equipes. O sistema não compara equipes.
        </p>
      )}
      {uso.guardadosNaoAplicaveis.length > 0 && (
        <p
          className="flex items-center gap-2 text-sm text-texto-2"
          data-testid="aviso-filtros-nao-aplicaveis"
        >
          <Icone nome="info" className="size-4" />
          {listaE(uso.guardadosNaoAplicaveis)}{' '}
          {uso.guardadosNaoAplicaveis.length > 1 ? 'não se aplicam' : 'não se aplica'} ao nível
          estratégico.{' '}
          {uso.guardadosNaoAplicaveis.length > 1
            ? 'Seus filtros foram guardados e voltam'
            : 'Seu filtro foi guardado e volta'}{' '}
          quando você abrir outro painel de fluxo.
        </p>
      )}
      <ChipsFiltros chips={uso.chips} onRemover={usoA.remover} />
      <div role="status" aria-live="polite" className="sr-only">
        {interagiu ? anuncio : ''}
      </div>
    </div>
  )
}
