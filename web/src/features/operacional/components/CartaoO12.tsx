import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras, type SerieBarra } from '@/components/charts'
import { CartaoMetrica, EstadoSemDadoReal, NumeroGrande } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtMes } from '@/lib/formatar'
import { NOTAS_OPERACIONAL } from '../notas'
import { propsCartao, textoTaxa } from '@/features/painel/propsCartao'

/**
 * O12: acordos e vencidos por mês. Com o campo de responsabilidade do atraso no quadro, empilha por responsabilidade; sem ele (099, Q-099-4 = A)
 * a parte vem nula com o motivo: "Sem dado real" no lugar do número, uma série só de vencidos, nunca 0. % só com 20 acordos no mês; abaixo, "k de n".
 */
export function CartaoO12({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O12', filtros)
  const d = q.dados
  const t = d?.totais
  const semResponsabilidade = d?.vencidosCausaInterna === null
  const series: SerieBarra[] = [
    { chave: 'semVencer', rotulo: 'Acordos sem vencer', cor: 7, padrao: 'liso' },
    ...(semResponsabilidade
      ? [{ chave: 'vencidos', rotulo: 'Vencidos', cor: 2, padrao: 'hachura' } as const]
      : ([
          { chave: 'interno', rotulo: 'Vencido: Interno', cor: 2, padrao: 'hachura' },
          { chave: 'solicitante', rotulo: 'Vencido: Solicitante', cor: 3, padrao: 'listras' },
          { chave: 'terceiro', rotulo: 'Vencido: Terceiro', cor: 4, padrao: 'pontos' },
          {
            chave: 'naoClassificado',
            rotulo: 'Vencido: Não classificado',
            cor: 5,
            padrao: 'cruzado',
          },
        ] as const)),
  ]
  const aguardando = 'Aguardando o campo de responsabilidade do atraso no quadro do BusinessMap.'
  const resto =
    d && t
      ? `${fmtInteiro(t.vencidos)} de ${fmtInteiro(t.acordos)} acordos venceram${t.pctVencidos.status === 'ok' ? ` (${textoTaxa(t.pctVencidos)})` : ''}.`
      : ''
  const leitura =
    d && t
      ? semResponsabilidade
        ? `Vencidos por causa interna: sem dado real, aguardando o campo de responsabilidade do atraso no quadro. ${resto}`
        : `Vencidos por causa interna: ${fmtInteiro(d.vencidosCausaInterna as number)}. ${resto}`
      : undefined
  return (
    <CartaoMetrica
      {...propsCartao('O12', q, NOTAS_OPERACIONAL.O12)}
      {...(leitura ? { leitura } : {})}
      {...(d ? { statusMeta: d.statusMeta } : {})}
      className="lg:col-span-12"
    >
      {d && (
        <div className="flex flex-col gap-4">
          {d.vencidosCausaInterna === null ? (
            <EstadoSemDadoReal
              codigo="O12-causa-interna"
              motivo={`${aguardando} O prazo do card diz quando venceu, não de quem foi o atraso.`}
            />
          ) : (
            <NumeroGrande
              data-testid="o12-causa-interna"
              valor={fmtInteiro(d.vencidosCausaInterna)}
              rotulo="vencidos por causa interna no período"
              textoCompleto={`Vencidos por causa interna no período: ${fmtInteiro(d.vencidosCausaInterna)}`}
            />
          )}
          {semResponsabilidade && (
            <p className="text-sm text-texto-2" data-testid="o12-faixa-sem-responsabilidade">
              Divisão por responsabilidade do atraso: sem dado real. Aguardando o campo no quadro do
              BusinessMap.
            </p>
          )}
          <Barras
            descricao={
              semResponsabilidade
                ? 'Acordos por mês, com os vencidos. A divisão por responsabilidade do atraso está sem dado real.'
                : 'Acordos por mês, com os vencidos por responsabilidade do atraso'
            }
            unidade="acordos"
            modo="empilhado"
            categorias={d.meses.map((m) => ({
              rotulo: fmtMes(m.mes),
              emAndamento: m.emAndamento,
              valores: {
                semVencer: m.acordos - m.vencidos,
                ...(m.porResponsabilidade === null
                  ? { vencidos: m.vencidos }
                  : {
                      interno: m.porResponsabilidade.Interno,
                      solicitante: m.porResponsabilidade.Solicitante,
                      terceiro: m.porResponsabilidade.Terceiro,
                      naoClassificado: m.porResponsabilidade.naoClassificado,
                    }),
                pct: m.pctVencidos.status === 'ok' ? m.pctVencidos.pct : null,
              },
            }))}
            series={series}
            linha={{
              chave: 'pct',
              rotulo: '% vencidos',
              unidade: '%',
              formatar: (v) => `${fmtInteiro(v)}%`,
            }}
          />
          <ul className="text-sm text-texto-2" aria-label="Vencidos por mês, k de n">
            {d.meses.map((m) => (
              <li key={m.mes} data-testid={`o12-mes-${m.mes}`}>
                {fmtMes(m.mes)}: {textoTaxa(m.pctVencidos)}
                {m.pctVencidos.status === 'ok'
                  ? ' vencidos'
                  : ' acordos vencidos (percentual só com 20 acordos ou mais)'}
                {m.emAndamento ? ' (em andamento)' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </CartaoMetrica>
  )
}
