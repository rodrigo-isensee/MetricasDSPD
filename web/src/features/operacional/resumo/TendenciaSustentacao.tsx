import { JANELA_PERCENTIS_PADRAO, type ResultadoDe } from '@metricas-dspd/contratos'
import { usePreferenciasPainel } from '@/components/ui'
import type { MetricaQuery } from '@/data'
import { textoJanela } from '@/lib/formatar'
import { fraseDaSerie, marcacoesUnicas, serieSla, serieVolume } from './modelo'
import { SerieMensal } from './SerieMensal'
import { EsqueletoTendencia, ErroTendencia } from './TendenciaFluxo'

const JANELA = textoJanela(JANELA_PERCENTIS_PADRAO)

/**
 * Tendência dos 6 últimos meses fechados da Sustentação: prioridades fora do alvo ("k de m avaliadas", por
 * prioridade, nunca agregadas) e chamados abertos no mês (a base do S3). A série de uma métrica oculta some.
 */
export function TendenciaSustentacao({ q }: { q: MetricaQuery<ResultadoDe<'TENDENCIA_SUST'>> }) {
  const prefs = usePreferenciasPainel()
  const id = 'tendencia-sustentacao'
  const verSla = !prefs?.estaOculto('s2')
  const verVolume = !prefs?.estaOculto('s3')
  if (!verSla && !verVolume) return null
  if (q.estado === 'carregando') return <EsqueletoTendencia id={id} />
  if (q.estado === 'erro') return <ErroTendencia id={id} onTentarDeNovo={q.recarregar} />
  const t = q.dados as ResultadoDe<'TENDENCIA_SUST'>
  const sla = serieSla(t)
  const volume = serieVolume(t)
  return (
    <div
      id={id}
      className="flex flex-col gap-4"
      role="group"
      aria-label="Tendência mês a mês, últimos 6 meses"
      data-testid={id}
    >
      {verSla && (
        <SerieMensal
          id="tendencia-sustentacao-sla"
          titulo="Prioridades com aderência ao SLA abaixo de 90%, últimos 6 meses"
          subtitulo={`Cada ponto: janela de ${JANELA} até o fim do mês; k de m prioridades avaliadas (20 chamados ou mais)`}
          unidade="prioridades"
          forma="linha"
          pontos={sla}
          marcacoes={marcacoesUnicas(t.criterios)}
          frase={fraseDaSerie(sla, false)}
          colunaValor="Fora do alvo (k de m avaliadas)"
          eixoMax={5}
        />
      )}
      {verVolume && (
        <SerieMensal
          id="tendencia-sustentacao-volume"
          titulo="Chamados abertos por mês, últimos 6 meses"
          subtitulo="Contagem do mês-calendário, pela data de abertura (a base do S3)"
          unidade="chamados"
          forma="barras"
          pontos={volume}
          marcacoes={t.criterios.serie}
          frase={fraseDaSerie(volume, true)}
          colunaValor="Chamados abertos"
        />
      )}
    </div>
  )
}
