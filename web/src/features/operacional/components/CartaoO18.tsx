import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras } from '@/components/charts'
import { CartaoMetrica, NumeroGrande } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtDataCurta, fmtInteiro, fmtMes, fmtNumero } from '@/lib/formatar'
import { NOTAS_OPERACIONAL } from '../notas'
import { propsCartao, textoTaxa } from '../propsCartao'

/** O18: entregas com e sem bug. Meses ainda dentro dos 30 dias de vínculo aparecem "em apuração", listrados. */
export function CartaoO18({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O18', filtros)
  const d = q.dados
  const t = d?.totais
  const dens = (e: { status: 'ok' | 'insuficiente'; n: number; valor?: number }) =>
    e.status === 'ok' && e.valor !== undefined ? fmtNumero(e.valor, 2) : 'indisponível'
  const fechado = d
    ? [...d.meses]
        .reverse()
        .find((m) => !m.emAndamento && !m.emApuracaoAte && m.taxaLimpa.status === 'ok')
    : undefined
  const leitura =
    d && t
      ? fechado && fechado.taxaLimpa.status === 'ok'
        ? `Em ${fmtMes(fechado.mes)}, ${textoTaxa(fechado.taxaLimpa)} das entregas saíram sem bug.${fechado.densidadeGeral.status === 'ok' && fechado.densidadeAfetados.status === 'ok' ? ` A densidade foi de ${fmtNumero(fechado.densidadeGeral.valor, 2)} bug por card; entre os cards com bug, ${fmtNumero(fechado.densidadeAfetados.valor, 2)}.` : ''}`
        : `No período, ${fmtInteiro(t.comBug)} de ${fmtInteiro(t.entregues)} cards entregues tiveram bug vinculado.`
      : undefined
  return (
    <CartaoMetrica
      {...propsCartao('O18', q, NOTAS_OPERACIONAL.O18)}
      {...(leitura ? { leitura } : {})}
      className="lg:col-span-6"
    >
      {d && t && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <NumeroGrande
              data-testid="o18-taxa-limpa"
              valor={textoTaxa(t.taxaLimpa)}
              rotulo={
                t.taxaLimpa.status === 'ok'
                  ? 'taxa de entrega limpa'
                  : 'cards (taxa só com 20 cards)'
              }
              textoCompleto={`Taxa de entrega limpa: ${textoTaxa(t.taxaLimpa)}`}
            />
            <NumeroGrande
              data-testid="o18-dens-geral"
              valor={dens(t.densidadeGeral)}
              rotulo="bugs por card, no geral"
              textoCompleto={`Densidade geral: ${dens(t.densidadeGeral)} bugs por card`}
            />
            <NumeroGrande
              data-testid="o18-dens-afetados"
              valor={dens(t.densidadeAfetados)}
              rotulo="bugs por card, entre os afetados"
              textoCompleto={`Densidade entre os cards afetados: ${dens(t.densidadeAfetados)} bugs por card`}
            />
          </div>
          <Barras
            descricao="Entregas por mês, com e sem bug, e densidade de bugs"
            unidade="cards"
            modo="empilhado"
            categorias={d.meses.map((m) => ({
              rotulo: m.emApuracaoAte
                ? `${fmtMes(m.mes)} (em apuração até ${fmtDataCurta(m.emApuracaoAte)})`
                : fmtMes(m.mes),
              emAndamento: m.emAndamento || m.emApuracaoAte !== null,
              valores: {
                semBug: m.semBug,
                comBug: m.comBug,
                densidade: m.densidadeGeral.status === 'ok' ? m.densidadeGeral.valor : null,
              },
            }))}
            series={[
              { chave: 'semBug', rotulo: 'Entregas sem bug', cor: 1, padrao: 'liso' },
              { chave: 'comBug', rotulo: 'Entregas com bug', cor: 2, padrao: 'hachura' },
            ]}
            linha={{
              chave: 'densidade',
              rotulo: 'Bugs por card',
              unidade: 'bugs por card',
              formatar: (v) => fmtNumero(v, 2),
            }}
          />
          <p className="text-sm">
            Leia junto com a vazão:{' '}
            <a href="#o4" className="alvo inline-flex items-center text-acento underline">
              Ver vazão (O4)
            </a>
          </p>
        </div>
      )}
    </CartaoMetrica>
  )
}
