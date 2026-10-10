import { Botao, CabecalhoPainel, EsqueletoCartao, ErroPagina } from '@/components/ui'
import { useDataReferencia, useErroDePainelSimulado, useMetrica } from '@/data'

/** Placeholder da fase A: já consome `VISAO_GERAL` para provar o fluxo de dados. A fase B monta a tela da spec 3.1. */
export default function VisaoGeralPage() {
  const data = useDataReferencia()
  const q = useMetrica('VISAO_GERAL', {})
  if (useErroDePainelSimulado())
    return <ErroPagina erro="Erro simulado (mock=erro)" onTentarDeNovo={() => undefined} />
  return (
    <div className="flex flex-col gap-4">
      <CabecalhoPainel
        titulo="Visão geral"
        pergunta="O que pede atenção agora?"
        dataCorte={data}
        fonte="BusinessMap e Acelerato (blocos separados)"
        slug="visao-geral"
        publico="Consolidado de todas as equipes, sem filtros nesta tela."
      />
      <section
        aria-labelledby="vg-titulo"
        className="rounded-lg border border-dashed border-borda-controle p-4"
        data-testid="placeholder-painel"
      >
        <h2 id="vg-titulo" className="text-lg font-bold">
          Painel em construção
        </h2>
        {q.estado === 'carregando' && (
          <EsqueletoCartao codigo="VISAO_GERAL" titulo="Visão geral" altura={96} />
        )}
        {q.estado === 'erro' && (
          <p role="alert">
            Não foi possível carregar a visão geral.{' '}
            <Botao onClick={q.recarregar}>Tentar de novo</Botao>
          </p>
        )}
        {q.dados && (
          <p className="text-sm text-texto-2">
            {q.dados.alertas.length} alertas e {q.dados.niveis.length} níveis calculados a partir da
            base fictícia.
          </p>
        )}
      </section>
    </div>
  )
}

export const handle = { titulo: 'Visão geral' }
