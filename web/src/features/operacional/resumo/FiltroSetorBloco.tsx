import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Botao, Icone } from '@/components/ui'
import { useOpcoesFiltro } from '@/data'
import { ChipsFiltros } from '@/features/filtros/ChipsFiltros'
import { FiltroMulti } from '@/features/filtros/FiltroMulti'
import type { UseFiltros } from '@/features/filtros'

const ROTULO = 'Setor'

/**
 * Filtro Setor do bloco Fluxo do Resumo (097 L11, CA-39, CA-43, CA-49): só existe no bloco do BusinessMap, nunca
 * no da Sustentação (o Acelerato não tem setor). Valor inicial "Todos", estado na URL (`setor`). Com dois ou mais
 * setores o resultado é um conjunto só (aviso consolidado); nunca há números, séries nem linhas por setor.
 */
export function FiltroSetorBloco({ uso }: { uso: UseFiltros<FiltrosFluxo> }) {
  const opcoes = useOpcoesFiltro('businessmap')
  const setores = opcoes.data?.dominio === 'businessmap' ? (opcoes.data.setores ?? []) : []
  const selecionados = uso.filtros.setor ?? []
  // Só os chips de setor: os outros filtros guardados na URL não pertencem ao Resumo.
  const chips = uso.chips.filter((c) => c.chave === 'setor')
  const definir = uso.definir as (p: { setor: string[] }, o?: { replace?: boolean }) => void

  let controle
  if (opcoes.isError)
    controle = (
      <div role="alert" className="flex flex-wrap items-center gap-2 text-sm">
        <Botao disabled data-testid="setor-fluxo-indisponivel">
          {ROTULO}: indisponível
        </Botao>
        <span>Não foi possível carregar as opções de {ROTULO}.</span>
        <Botao onClick={() => void opcoes.refetch()}>Tentar de novo</Botao>
      </div>
    )
  else if (opcoes.isPending)
    controle = (
      <div role="status">
        <Botao disabled data-testid="setor-fluxo-carregando">
          {ROTULO}: carregando…
        </Botao>
      </div>
    )
  else if (setores.length === 0)
    controle = (
      <div role="status" className="flex flex-wrap items-center gap-2 text-sm">
        <Botao disabled data-testid="setor-fluxo-vazio">
          {ROTULO}: sem opções
        </Botao>
        <span className="text-texto-2">
          Ainda não há setores na base. O filtro aparece quando houver dados.
        </span>
      </div>
    )
  else
    controle = (
      <div className="flex flex-wrap items-center gap-2">
        <FiltroMulti
          id="setor-fluxo"
          rotulo={ROTULO}
          genero="m"
          opcoes={setores}
          selecionados={selecionados}
          onChange={(ids, replace) => definir({ setor: ids }, { replace })}
        />
        {selecionados.length > 0 && (
          <Botao
            variante="fantasma"
            onClick={() => definir({ setor: [] })}
            aria-label="Limpar filtros de Setor do bloco Fluxo"
            data-testid="limpar-setor-fluxo"
          >
            Limpar filtros
          </Botao>
        )}
      </div>
    )

  return (
    <div className="flex min-h-10 flex-col gap-2" data-testid="filtro-setor-bloco-fluxo">
      {controle}
      {selecionados.length >= 2 && (
        <p
          className="flex items-center gap-2 text-sm text-texto-2"
          data-testid="aviso-consolidado-setor-fluxo"
        >
          <Icone nome="info" className="size-4" />
          Resultado consolidado de {selecionados.length} setores. O sistema não compara setores.
        </p>
      )}
      <ChipsFiltros chips={chips} onRemover={uso.remover} />
    </div>
  )
}
