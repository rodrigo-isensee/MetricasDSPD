import { TIPOS_CARD, type FiltrosFluxo } from '@metricas-dspd/contratos'
import { Dispersao, SerieLinhas } from '@/components/charts'
import {
  AmostraInsuficiente,
  CartaoMetrica,
  CelulaInsuficiente,
  NumeroGrande,
  SeletorLocal,
  TabelaDados,
} from '@/components/ui'
import { useMetrica } from '@/data'
import { useParametroLocal } from '@/features/filtros'
import { fmtData, fmtDataCurta, fmtDiasUteis, fmtInteiro, fmtNumero, plural } from '@/lib/formatar'
import { NOTAS_OPERACIONAL } from '../notas'
import { diaNum, isoDoDia, propsCartao, slug } from '@/features/painel/propsCartao'
import { LeiaJunto } from '@/features/complementares/LeiaJunto'
import { tipoPredominante } from '../resumo/modelo'

const VALORES = TIPOS_CARD.map(slug)

/** O3: tempo de ciclo, UM tipo por vez. Percentis só com 20 itens ou mais; média nunca é exibida. */
export function CartaoO3({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O3', filtros)
  const d = q.dados
  const maior = d ? tipoPredominante(d)?.tipo : undefined
  const [aba, setAba] = useParametroLocal('o3', VALORES, slug(maior ?? TIPOS_CARD[0]))
  const c = d?.classes.find((x) => slug(x.tipo) === aba)
  const est = c?.estatistica
  const p = est?.status === 'ok' ? est.valor : undefined
  const acima = p && c ? c.pontos.filter((x) => x.cicloDiasUteis > p.p95).length : 0
  const leitura =
    c && p
      ? `${c.tipo}: 85% ficam prontos em até ${fmtDiasUteis(p.p85, 0)}; metade em até ${fmtDiasUteis(p.p50, 0)}. ${fmtInteiro(acima)} ${plural(acima, 'item passou', 'itens passaram')} do P95.`
      : c
        ? `${c.tipo}: percentis indisponíveis, ${fmtInteiro(c.n)} de 20 itens mínimos.`
        : undefined
  const v = c?.variacaoP85
  return (
    <CartaoMetrica
      {...propsCartao('O3', q, NOTAS_OPERACIONAL.O3)}
      notasDoCartao={d?.notas}
      {...(d && est?.status === 'insuficiente' ? { baseVariante: 'insuficiente' as const } : {})}
      {...(leitura ? { leitura } : {})}
      {...(d ? { janelaPercentis: d.janelaPercentis, periodo: filtros.periodo } : {})}
      className="lg:col-span-12"
    >
      {d && (
        <div className="flex flex-col gap-4">
          <TabelaDados
            codigo="O3-resumo"
            legenda="Resumo por tipo: itens e percentis do tempo de ciclo"
            colunas={[
              { chave: 'tipo', titulo: 'Tipo' },
              { chave: 'n', titulo: 'Itens', alinhar: 'direita' },
              { chave: 'p50', titulo: 'P50 (dias úteis)', alinhar: 'direita' },
              { chave: 'p85', titulo: 'P85 (dias úteis)', alinhar: 'direita' },
              { chave: 'p95', titulo: 'P95 (dias úteis)', alinhar: 'direita' },
            ]}
            linhas={d.classes.map((x) => {
              const e = x.estatistica
              return {
                tipo: x.tipo,
                n: fmtInteiro(x.n),
                p50: e.status === 'ok' ? fmtNumero(e.valor.p50, 0) : <CelulaInsuficiente />,
                p85: e.status === 'ok' ? fmtNumero(e.valor.p85, 0) : <CelulaInsuficiente />,
                p95: e.status === 'ok' ? fmtNumero(e.valor.p95, 0) : <CelulaInsuficiente />,
              }
            })}
          />
          <SeletorLocal
            codigo="O3"
            rotulo="Ver por tipo"
            valor={aba}
            onChange={(x) => setAba(x)}
            itens={d.classes.map((x) => ({
              valor: slug(x.tipo),
              rotulo: x.tipo,
              contagem: x.n,
              insuficiente: x.estatistica.status === 'insuficiente',
            }))}
          >
            {c && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-8">
                    <Dispersao
                      descricao={`Tempo de ciclo por data de entrega (${c.tipo})`}
                      rotuloY="Tempo de ciclo (dias úteis)"
                      eixoX={{ tipo: 'data', formatar: (x) => fmtDataCurta(isoDoDia(x)) }}
                      pontos={c.pontos.map((x) => ({
                        id: x.cardId,
                        rotulo: `${x.cardId} ${x.titulo}`,
                        x: diaNum(x.dataEntrega),
                        y: x.cicloDiasUteis,
                        forma: p && x.cicloDiasUteis > p.p95 ? 'triangulo' : 'circulo',
                      }))}
                      referencias={
                        p
                          ? [
                              { valor: p.p50, rotulo: 'P50', traco: 'pontilhado' },
                              { valor: p.p85, rotulo: 'P85', traco: 'tracejado' },
                              { valor: p.p95, rotulo: 'P95', traco: 'solido' },
                            ]
                          : []
                      }
                      legendaFormas={p ? { triangulo: 'acima do P95' } : {}}
                    />
                  </div>
                  <div className="flex flex-col gap-2 lg:col-span-4">
                    {p ? (
                      <>
                        <NumeroGrande
                          valor={fmtNumero(p.p50, 0)}
                          rotulo="dias úteis · 50% em até"
                          textoCompleto={`50% em até ${fmtDiasUteis(p.p50, 0)}`}
                        />
                        <NumeroGrande
                          valor={fmtNumero(p.p85, 0)}
                          rotulo="dias úteis · 85% em até"
                          textoCompleto={`85% em até ${fmtDiasUteis(p.p85, 0)}`}
                        />
                        <NumeroGrande
                          valor={fmtNumero(p.p95, 0)}
                          rotulo="dias úteis · 95% em até"
                          textoCompleto={`95% em até ${fmtDiasUteis(p.p95, 0)}`}
                        />
                      </>
                    ) : (
                      est?.status === 'insuficiente' && (
                        <AmostraInsuficiente n={est.n} codigo="O3" oQue="Percentis" />
                      )
                    )}
                  </div>
                </div>
                {v && (
                  <p className="text-sm" data-testid="o3-variacao">
                    {v.status === 'ok' && v.variacaoPct !== null
                      ? `P85 hoje comparado à janela anterior (${fmtData(v.janelaAnterior.inicio)} a ${fmtData(v.janelaAnterior.fim)}): ${v.variacaoPct >= 0 ? '+' : '−'}${fmtNumero(Math.abs(v.variacaoPct), 0)}%.`
                      : 'Comparação indisponível: amostra insuficiente em uma das janelas.'}
                  </p>
                )}
                <SerieLinhas
                  descricao={`Como o P85 evoluiu (${c.tipo})`}
                  unidade="dias úteis"
                  formatarX={(x) => fmtDataCurta(x)}
                  pontos={c.serieP85.map((s) => ({ x: s.semana, valores: { p85: s.p85 } }))}
                  series={[{ chave: 'p85', rotulo: 'P85 (janela móvel)', cor: 1, traco: 'solido' }]}
                  marcacoes={d.criterios.serie}
                  altura={200}
                />
              </div>
            )}
          </SeletorLocal>
          <LeiaJunto id="o3" />
        </div>
      )}
    </CartaoMetrica>
  )
}
