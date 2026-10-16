import type { ReactNode } from 'react'
import { useLocation, useNavigate, type Location } from 'react-router'
import { CabecalhoPainel, ErroPagina } from '@/components/ui'
import { useDataReferencia, useErroDePainelSimulado } from '@/data'
import { FrescorFonte } from '@/features/coleta/FrescorFonte'
import { BotaoExportar } from '@/features/exportar'
import { LinhaFiltrosGuardados } from '@/features/filtros'
import { AvisoFiltrosInvalidos } from '@/features/filtros/AvisoFiltrosInvalidos'
import { BlocoFluxo } from './BlocoFluxo'
import { BlocoSustentacao } from './BlocoSustentacao'

/**
 * "Exportar vários painéis" nasce com as métricas dos números-chave dos dois blocos (Operacional e Operacional ·
 * Sustentação, cada uma na sua fonte): o arquivo tem limite de métricas, então a pré-seleção é o que o Resumo mostra.
 */
const PRE_SELECAO = [
  'operacional:o3',
  'operacional:o4',
  'operacional:o2',
  'operacional:o12',
  'sustentacao:s2',
  'sustentacao:s1',
  'sustentacao:s3',
]

/**
 * Visão Resumo (padrão do Operacional): "Estamos bem?". Dois blocos empilhados, um por fonte (nunca lado a lado,
 * nunca somados). Sem barra de filtros: usa sempre os padrões e só avisa dos filtros guardados nas outras visões.
 * Não calcula nada: reaproveita os DTOs dos cartões e as duas tendências mensais.
 */
export function VisaoResumo({ extra }: { extra: ReactNode }) {
  const dataCorte = useDataReferencia()
  const erroSimulado = useErroDePainelSimulado()
  const navigate = useNavigate()
  const { state, pathname, search, hash } = useLocation() as Location<{
    filtrosInvalidos?: string[]
  } | null>
  if (erroSimulado)
    return <ErroPagina erro="Erro simulado (mock=erro)" onTentarDeNovo={() => undefined} />
  return (
    <div className="flex flex-col gap-4">
      <CabecalhoPainel
        titulo="Operacional"
        pergunta="Estamos bem?"
        publico="Para coordenadores e líderes · uma leitura rápida das duas fontes."
        dataCorte={dataCorte}
        fonte="BusinessMap e Acelerato (blocos separados)"
        slug="operacional"
        frescor={
          <div className="flex flex-col gap-1" data-testid="frescor-fontes">
            <FrescorFonte dominio="businessmap" comNome reservarFalha />
            <FrescorFonte dominio="acelerato" comNome reservarFalha />
          </div>
        }
      />
      {extra}
      <AvisoFiltrosInvalidos
        invalidos={state?.filtrosInvalidos ?? []}
        onEntendi={() => void navigate({ pathname, search, hash }, { replace: true, state: null })}
      />
      <div className="flex flex-wrap items-center gap-2" data-testid="barra-metricas">
        <BotaoExportar base="personalizada" preSelecionar={PRE_SELECAO} />
      </div>
      <LinhaFiltrosGuardados visao="resumo" />
      <BlocoFluxo />
      <BlocoSustentacao />
    </div>
  )
}
