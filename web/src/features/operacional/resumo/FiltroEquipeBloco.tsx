import { Botao, Icone } from '@/components/ui'
import { useOpcoesFiltro } from '@/data'
import { ChipsFiltros } from '@/features/filtros/ChipsFiltros'
import { FiltroMulti } from '@/features/filtros/FiltroMulti'
import type { UseFiltros } from '@/features/filtros'
import type { FiltrosFluxo, FiltrosSustentacao } from '@metricas-dspd/contratos'

const ROTULO = 'Equipe'

/**
 * Filtro Equipe de UM bloco do Resumo (097, CA-1 a CA-6): só as equipes da fonte do bloco, valor inicial "Todas",
 * estado na URL (`equipe` no fluxo, `sust_equipe` na Sustentação). Cada filtro muda só o seu bloco. Com duas ou
 * mais equipes o resultado é um conjunto só (aviso consolidado); nunca há números por equipe.
 */
export function FiltroEquipeBloco({
  bloco,
  uso,
}: {
  bloco: 'fluxo' | 'sustentacao'
  uso: UseFiltros<FiltrosFluxo> | UseFiltros<FiltrosSustentacao>
}) {
  const opcoes = useOpcoesFiltro(bloco === 'fluxo' ? 'businessmap' : 'acelerato')
  const equipes = opcoes.data?.equipes ?? []
  const selecionadas = (uso.filtros as FiltrosFluxo).equipe
  // Só os chips de equipe: os outros filtros guardados na URL não pertencem ao Resumo.
  const chips = uso.chips.filter((c) => c.chave === 'equipe').map((c) => ({ ...c, rotulo: ROTULO }))
  const definir = uso.definir as (p: { equipe: string[] }, o?: { replace?: boolean }) => void

  let controle
  if (opcoes.isError)
    controle = (
      <div role="alert" className="flex flex-wrap items-center gap-2 text-sm">
        <Botao disabled data-testid={`equipe-${bloco}-indisponivel`}>
          {ROTULO}: indisponível
        </Botao>
        <span>Não foi possível carregar as opções de {ROTULO}.</span>
        <Botao onClick={() => void opcoes.refetch()}>Tentar de novo</Botao>
      </div>
    )
  else if (opcoes.isPending)
    controle = (
      <div role="status">
        <Botao disabled data-testid={`equipe-${bloco}-carregando`}>
          {ROTULO}: carregando…
        </Botao>
      </div>
    )
  else if (equipes.length === 0)
    controle = (
      <div role="status" className="flex flex-wrap items-center gap-2 text-sm">
        <Botao disabled data-testid={`equipe-${bloco}-vazio`}>
          {ROTULO}: sem opções
        </Botao>
        <span className="text-texto-2">
          Ainda não há equipes na base para este período. O filtro aparece quando houver dados.
        </span>
      </div>
    )
  else
    controle = (
      <div className="flex flex-wrap items-center gap-2">
        <FiltroMulti
          id={`equipe-${bloco}`}
          rotulo={ROTULO}
          opcoes={equipes}
          selecionados={selecionadas}
          onChange={(ids, replace) => definir({ equipe: ids }, { replace })}
        />
        {selecionadas.length > 0 && (
          <Botao
            variante="fantasma"
            onClick={() => definir({ equipe: [] })}
            aria-label={`Limpar filtros de ${ROTULO} do bloco ${bloco === 'fluxo' ? 'Fluxo' : 'Sustentação'}`}
            data-testid={`limpar-equipe-${bloco}`}
          >
            Limpar filtros
          </Botao>
        )}
      </div>
    )

  return (
    <div className="flex min-h-10 flex-col gap-2" data-testid={`filtro-bloco-${bloco}`}>
      {controle}
      {selecionadas.length >= 2 && (
        <p
          className="flex items-center gap-2 text-sm text-texto-2"
          data-testid={`aviso-consolidado-${bloco}`}
        >
          <Icone nome="info" className="size-4" />
          Resultado consolidado de {selecionadas.length} equipes. O sistema não compara equipes.
        </p>
      )}
      <ChipsFiltros chips={chips} onRemover={uso.remover} />
    </div>
  )
}
