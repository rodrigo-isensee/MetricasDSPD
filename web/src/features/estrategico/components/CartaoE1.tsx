import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras, Dispersao } from '@/components/charts'
import { AmostraInsuficiente, CartaoMetrica, NumeroGrande, SeletorLocal } from '@/components/ui'
import { useMetrica } from '@/data'
import { useParametroLocal } from '@/features/filtros'
import { propsCartao } from '@/features/painel/propsCartao'
import { fmtDiasUteis, fmtInteiro, fmtPct, fmtTrimestre, textoJanela } from '@/lib/formatar'
import { NOTAS_ESTRATEGICO } from '../notas'

export function CartaoE1({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('E1', filtros)
  const d = q.dados
  const segmentos = d?.segmentos ?? []
  const chaves = segmentos.map((s) => s.chave)
  const [escolhido, setEscolhido] = useParametroLocal('e1', chaves, chaves[0] ?? '')
  // Um tipo de projeto por vez: Iniciativa e Melhoria nunca no mesmo cálculo nem gráfico.
  const seg = segmentos.find((s) => s.chave === escolhido) ?? segmentos[0]
  const e = seg?.estatistica
  const trimestres = seg ? [...new Set(seg.pontos.map((p) => p.trimestre))].sort() : []
  const variacao = seg?.variacaoMediana
  const leitura =
    !seg || !e
      ? undefined
      : e.status === 'ok'
        ? `A mediana do lead time dos projetos de ${seg.rotulo} é ${fmtDiasUteis(e.valor.total.p50, 0)}. ${fmtPct(e.valor.fracaoAntesPct)} desse tempo passa antes de o trabalho começar.`
        : `Foram concluídos ${fmtInteiro(e.n)} projetos de ${seg.rotulo} nas últimas ${textoJanela(d?.janelaPercentis ?? { unidade: 'semanas', quantidade: 12 })}. Abaixo de 20 não publicamos mediana nem P85; cada projeto aparece como ponto.`
  return (
    <CartaoMetrica
      {...propsCartao('E1', q, NOTAS_ESTRATEGICO.E1)}
      {...(d
        ? {
            base: e?.status === 'insuficiente' ? { ...d.base, n: e.n } : d.base,
            baseVariante:
              e?.status === 'insuficiente' ? ('insuficiente' as const) : ('ok' as const),
            janelaPercentis: d.janelaPercentis,
            periodo: filtros.periodo,
          }
        : {})}
      {...(leitura ? { leitura } : {})}
      className="lg:col-span-12"
    >
      {d && (
        <SeletorLocal
          codigo="e1"
          rotulo="Tipo de projeto (um por vez)"
          valor={seg?.chave ?? ''}
          onChange={setEscolhido}
          itens={segmentos.map((s) => ({
            valor: s.chave,
            rotulo: s.rotulo,
            contagem: s.pontos.length,
            insuficiente: s.estatistica.status === 'insuficiente',
          }))}
        >
          {seg && e && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-texto-2" data-testid="e1-bases">
                Pontos: {fmtInteiro(seg.pontos.length)} projetos concluídos no período · Percentis:{' '}
                {fmtInteiro(e.n)}{' '}
                {e.status === 'insuficiente' ? 'de 20 projetos mínimos' : 'projetos'} nas últimas{' '}
                {textoJanela(d.janelaPercentis)}
              </p>
              {seg.pontos.length > 0 && (
                <Dispersao
                  descricao={`Lead time de cada projeto concluído, ${seg.rotulo}, por trimestre`}
                  rotuloY="Lead time (dias úteis)"
                  eixoX={{ tipo: 'categorias', categorias: trimestres.map(fmtTrimestre) }}
                  pontos={seg.pontos.map((p) => ({
                    id: p.cardId,
                    rotulo: p.titulo,
                    x: trimestres.indexOf(p.trimestre),
                    y: p.leadTimeDiasUteis,
                  }))}
                  {...(e.status === 'ok'
                    ? {
                        referencias: [
                          {
                            valor: e.valor.total.p50,
                            rotulo: 'Mediana',
                            traco: 'tracejado' as const,
                          },
                          { valor: e.valor.total.p85, rotulo: 'P85', traco: 'pontilhado' as const },
                        ],
                      }
                    : {})}
                />
              )}
              {e.status === 'ok' ? (
                <>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <NumeroGrande
                      valor={fmtInteiro(e.valor.total.p50)}
                      rotulo="mediana, dias úteis"
                      textoCompleto={`Mediana: ${fmtDiasUteis(e.valor.total.p50, 0)}`}
                    />
                    <NumeroGrande
                      valor={fmtInteiro(e.valor.total.p85)}
                      rotulo="P85, dias úteis"
                      textoCompleto={`P85: ${fmtDiasUteis(e.valor.total.p85, 0)}`}
                    />
                    <NumeroGrande
                      valor={fmtPct(e.valor.fracaoAntesPct)}
                      rotulo="fração antes do início"
                      textoCompleto={`Fração antes do início: ${fmtPct(e.valor.fracaoAntesPct)}`}
                    />
                  </div>
                  <Barras
                    descricao="Mediana do tempo antes do início e na execução"
                    orientacao="horizontal"
                    unidade="dias úteis"
                    categorias={[
                      {
                        rotulo: seg.rotulo,
                        valores: {
                          antes: e.valor.medianaAntesDoInicio,
                          exec: e.valor.medianaExecucao,
                        },
                      },
                    ]}
                    series={[
                      { chave: 'antes', rotulo: 'Antes do início' },
                      { chave: 'exec', rotulo: 'Execução' },
                    ]}
                    altura={140}
                  />
                </>
              ) : (
                <AmostraInsuficiente
                  variante="lenta"
                  entidade="projetos"
                  n={e.n}
                  codigo="E1"
                  janela={d.janelaPercentis}
                />
              )}
              <p className="text-sm" data-testid="e1-variacao">
                {variacao?.status === 'ok' && variacao.variacaoPct !== null
                  ? `Variação da mediana: ${variacao.variacaoPct > 0 ? '+' : ''}${fmtPct(variacao.variacaoPct)} contra a janela anterior (meta −25% ao ano).`
                  : 'Comparação indisponível: amostra insuficiente em uma das janelas.'}
              </p>
            </div>
          )}
        </SeletorLocal>
      )}
    </CartaoMetrica>
  )
}
