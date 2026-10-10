import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras } from '@/components/charts'
import { CartaoMetrica, Icone, TabelaDados } from '@/components/ui'
import { useMetrica } from '@/data'
import { diffDias, fmtInteiro, fmtMes } from '@/lib/formatar'
import { NOTAS_OPERACIONAL } from '../notas'
import { propsCartao } from '../propsCartao'

const SITUACAO = { cresce: 'A fila cresce', estavel: 'Estável', diminui: 'A fila diminui' } as const

/** O7: entrada x saída por tipo, um pequeno múltiplo por tipo (escala própria). R9: `saldoAcumulado` NÃO é exibido até a UX definir o cálculo. */
export function CartaoO7({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O7', filtros)
  const d = q.dados
  const p = filtros.periodo
  // O cartão mostra no mínimo 6 meses; avisa quando o período escolhido é menor.
  const curto =
    p.tipo === '4s' || p.tipo === '12s' || (p.tipo === 'custom' && diffDias(p.de, p.ate) < 180)
  const ordenado = d ? [...d.porTipo].sort((a, b) => b.saldoPeriodo - a.saldoPeriodo) : []
  const acima = ordenado.filter((t) => t.entradaAcimaDaSaidaNoTrimestre)
  const leitura = d
    ? `Entraram ${fmtInteiro(d.totais.entrou)} e saíram ${fmtInteiro(d.totais.saiu)} cards em ${fmtInteiro(d.mesesExibidos)} meses.${acima.length ? ` Entrada acima da saída no trimestre: ${acima.map((t) => t.tipo).join(', ')}.` : ' Nenhum tipo tem entrada acima da saída no trimestre.'}`
    : undefined
  return (
    <CartaoMetrica
      {...propsCartao('O7', q, NOTAS_OPERACIONAL.O7)}
      {...(leitura ? { leitura } : {})}
      className="lg:col-span-12"
    >
      {d && (
        <div className="flex flex-col gap-4">
          {curto && (
            <p className="flex items-center gap-2 text-sm" data-testid="o7-aviso-6-meses">
              <Icone nome="info" className="size-4" /> Este gráfico mostra no mínimo 6 meses.
            </p>
          )}
          <TabelaDados
            codigo="O7-resumo"
            legenda="Entrada e saída por tipo no período"
            colunas={[
              { chave: 'tipo', titulo: 'Tipo' },
              { chave: 'entrou', titulo: 'Entrou', alinhar: 'direita' },
              { chave: 'saiu', titulo: 'Saiu', alinhar: 'direita' },
              { chave: 'saldo', titulo: 'Saldo do período', alinhar: 'direita' },
              { chave: 'situacao', titulo: 'Situação' },
            ]}
            linhas={ordenado.map((t) => ({
              tipo: t.tipo,
              entrou: fmtInteiro(t.entrou),
              saiu: fmtInteiro(t.saiu),
              saldo: `${t.saldoPeriodo > 0 ? '+' : ''}${fmtInteiro(t.saldoPeriodo)}`,
              situacao: (
                <span className="inline-flex flex-wrap items-center gap-2">
                  {SITUACAO[t.situacao]}
                  {t.entradaAcimaDaSaidaNoTrimestre && (
                    <span className="inline-flex items-center gap-1 rounded bg-alerta-fundo px-2 py-0.5 text-sm font-semibold text-alerta">
                      <Icone nome="alerta" className="size-3.5" /> Entrada acima da saída
                    </span>
                  )}
                </span>
              ),
            }))}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {d.porTipo.map((t) => (
              <section key={t.tipo} aria-label={`${t.tipo}, escala própria`}>
                <h4 className="text-sm font-semibold">
                  {t.tipo} <span className="font-normal text-texto-2">(escala própria)</span>
                </h4>
                <Barras
                  descricao={`Entrada e saída por mês: ${t.tipo}`}
                  unidade="cards"
                  altura={180}
                  categorias={t.meses.map((m) => ({
                    rotulo: fmtMes(m.mes),
                    emAndamento: m.emAndamento,
                    valores: { entrada: m.entrada, saida: m.saida },
                  }))}
                  series={[
                    { chave: 'entrada', rotulo: 'Entrada', cor: 1, padrao: 'liso' },
                    { chave: 'saida', rotulo: 'Saída', cor: 2, padrao: 'listras' },
                  ]}
                />
              </section>
            ))}
          </div>
        </div>
      )}
    </CartaoMetrica>
  )
}
