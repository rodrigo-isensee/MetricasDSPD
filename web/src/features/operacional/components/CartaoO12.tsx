import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras } from '@/components/charts'
import { CartaoMetrica, NumeroGrande } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtMes } from '@/lib/formatar'
import { NOTAS_OPERACIONAL } from '../notas'
import { propsCartao, textoTaxa } from '../propsCartao'

/** O12: acordos e vencidos por mês, empilhado por responsabilidade do atraso. % só com 20 acordos no mês; abaixo, "k de n". */
export function CartaoO12({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O12', filtros)
  const d = q.dados
  const t = d?.totais
  const leitura =
    d && t
      ? `Vencidos por causa interna: ${fmtInteiro(d.vencidosCausaInterna)}. ${fmtInteiro(t.vencidos)} de ${fmtInteiro(t.acordos)} acordos venceram${t.pctVencidos.status === 'ok' ? ` (${textoTaxa(t.pctVencidos)})` : ''}.`
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
          <NumeroGrande
            data-testid="o12-causa-interna"
            valor={fmtInteiro(d.vencidosCausaInterna)}
            rotulo="vencidos por causa interna no período"
            textoCompleto={`Vencidos por causa interna no período: ${fmtInteiro(d.vencidosCausaInterna)}`}
          />
          <Barras
            descricao="Acordos por mês, com os vencidos por responsabilidade do atraso"
            unidade="acordos"
            modo="empilhado"
            categorias={d.meses.map((m) => ({
              rotulo: fmtMes(m.mes),
              emAndamento: m.emAndamento,
              valores: {
                semVencer: m.acordos - m.vencidos,
                interno: m.porResponsabilidade.Interno,
                solicitante: m.porResponsabilidade.Solicitante,
                terceiro: m.porResponsabilidade.Terceiro,
                naoClassificado: m.porResponsabilidade.naoClassificado,
                pct: m.pctVencidos.status === 'ok' ? m.pctVencidos.pct : null,
              },
            }))}
            series={[
              { chave: 'semVencer', rotulo: 'Acordos sem vencer', cor: 7, padrao: 'liso' },
              { chave: 'interno', rotulo: 'Vencido: Interno', cor: 2, padrao: 'hachura' },
              { chave: 'solicitante', rotulo: 'Vencido: Solicitante', cor: 3, padrao: 'listras' },
              { chave: 'terceiro', rotulo: 'Vencido: Terceiro', cor: 4, padrao: 'pontos' },
              {
                chave: 'naoClassificado',
                rotulo: 'Vencido: Não classificado',
                cor: 5,
                padrao: 'cruzado',
              },
            ]}
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
