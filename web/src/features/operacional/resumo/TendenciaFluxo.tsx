import { JANELA_PERCENTIS_PADRAO, type ResultadoDe } from '@metricas-dspd/contratos'
import { EstadoErro, usePreferenciasPainel } from '@/components/ui'
import type { MetricaQuery } from '@/data'
import { textoJanela } from '@/lib/formatar'
import {
  fraseDaSerie,
  marcacoesUnicas,
  serieConcluidos,
  serieP85,
  tipoPredominante,
} from './modelo'
import { SerieMensal } from './SerieMensal'

const JANELA = textoJanela(JANELA_PERCENTIS_PADRAO)

/** Esqueleto de altura fixa da tendência (160 px a 1280, 200 px a 375): o bloco não salta quando ela chega. */
export function EsqueletoTendencia({ id }: { id: string }) {
  return (
    <div className="h-[200px] md:h-[160px]" aria-busy="true" data-testid={`${id}-carregando`}>
      <span className="sr-only">Carregando a tendência…</span>
      <div aria-hidden="true" className="esqueleto h-full rounded-md" />
    </div>
  )
}

/** Erro só da tendência: o bloco continua de pé, com "Tentar de novo" (7.8). */
export function ErroTendencia({ id, onTentarDeNovo }: { id: string; onTentarDeNovo: () => void }) {
  return (
    <div data-testid={`${id}-erro`}>
      <EstadoErro
        codigo={id}
        titulo="Não foi possível carregar a tendência"
        texto="Os números e os alertas acima continuam valendo."
        onTentarDeNovo={onTentarDeNovo}
      />
    </div>
  )
}

/**
 * Tendência dos 6 últimos meses fechados do fluxo: P85 do tipo predominante (o mesmo dos números) e itens concluídos
 * no mês. Cada ponto de P85 é a janela móvel de 12 semanas até o fim do mês (calculada pela biblioteca, ADR 0019).
 * A série de uma métrica oculta pela pessoa some junto com o número.
 */
export function TendenciaFluxo({
  q,
  o3,
}: {
  q: MetricaQuery<ResultadoDe<'TENDENCIA_FLUXO'>>
  o3: ResultadoDe<'O3'> | undefined
}) {
  const prefs = usePreferenciasPainel()
  const id = 'tendencia-fluxo'
  const verP85 = !prefs?.estaOculto('o3')
  const verConcluidos = !prefs?.estaOculto('o4')
  if (!verP85 && !verConcluidos) return null
  if (q.estado === 'carregando') return <EsqueletoTendencia id={id} />
  if (q.estado === 'erro') return <ErroTendencia id={id} onTentarDeNovo={q.recarregar} />
  const t = q.dados as ResultadoDe<'TENDENCIA_FLUXO'>
  const tipo = o3 ? tipoPredominante(o3)?.tipo : undefined
  const p85 = serieP85(t, tipo)
  const concl = serieConcluidos(t)
  return (
    <div
      id={id}
      className="flex flex-col gap-4"
      role="group"
      aria-label="Tendência mês a mês, últimos 6 meses"
      data-testid={id}
    >
      {verP85 && (
        <SerieMensal
          id="tendencia-fluxo-p85"
          titulo={`P85 do tempo de ciclo${tipo ? ` · ${tipo}` : ''}, em dias úteis, últimos 6 meses`}
          subtitulo={`Cada ponto: janela de ${JANELA} até o fim do mês`}
          unidade="dias úteis"
          forma="linha"
          pontos={p85}
          marcacoes={marcacoesUnicas(t.criterios)}
          frase={fraseDaSerie(p85, true)}
          colunaValor="P85 (dias úteis)"
        />
      )}
      {verConcluidos && (
        <SerieMensal
          id="tendencia-fluxo-concluidos"
          titulo="Itens concluídos por mês, últimos 6 meses"
          subtitulo="Contagem do mês-calendário, pela data de conclusão"
          unidade="itens"
          forma="barras"
          pontos={concl}
          marcacoes={t.criterios.serie}
          frase={fraseDaSerie(concl, true)}
          colunaValor="Itens concluídos"
        />
      )}
    </div>
  )
}
