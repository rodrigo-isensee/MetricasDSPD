import { TIPOS_CARD, type FiltrosFluxo } from '@metricas-dspd/contratos'
import { Histograma, SerieLinhas } from '@/components/charts'
import { AmostraInsuficiente, CartaoMetrica, NumeroGrande, SeletorLocal } from '@/components/ui'
import { useMetrica } from '@/data'
import { useParametroLocal } from '@/features/filtros'
import { fmtData, fmtInteiro, fmtMes, plural } from '@/lib/formatar'
import { NOTAS_OPERACIONAL } from '../notas'
import { propsCartao, slug } from '@/features/painel/propsCartao'

const VALORES = TIPOS_CARD.map(slug)

/** O10: envelhecimento do backlog (dias corridos). O contador ">180 dias" é contagem e fica com n<20; histogramas e evolução somem. */
export function CartaoO10({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O10', filtros)
  const d = q.dados
  const [aba, setAba] = useParametroLocal('o10', VALORES, slug(TIPOS_CARD[0]))
  const evo = d?.evolucao.find((e) => slug(e.tipo) === aba)
  const leitura = d
    ? `${fmtInteiro(d.acimaDe180.time)} ${plural(d.acimaDe180.time, 'item está parado', 'itens estão parados')} há mais de 180 dias na visão do time e ${fmtInteiro(d.acimaDe180.cliente)} na visão do cliente.`
    : undefined
  const lados = d
    ? ([
        { id: 'time', titulo: 'Tudo o que está registrado', v: d.time },
        { id: 'cliente', titulo: 'O que alguém de fora ainda espera', v: d.cliente },
      ] as const)
    : []
  return (
    <CartaoMetrica
      {...propsCartao('O10', q, NOTAS_OPERACIONAL.O10)}
      {...(leitura ? { leitura } : {})}
      {...(d ? { statusMeta: d.statusMeta } : {})}
      {...(d
        ? {
            selos: (
              <span className="rounded-full border border-borda bg-superficie-2 px-2 py-0.5 text-sm">
                Time: {fmtInteiro(d.time.n)} · Cliente: {fmtInteiro(d.cliente.n)} itens não
                iniciados em {fmtData(d.referencia)}
              </span>
            ),
          }
        : {})}
      className="lg:col-span-12"
    >
      {d && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumeroGrande
              data-testid="o10-time-180"
              valor={fmtInteiro(d.acimaDe180.time)}
              rotulo="itens com mais de 180 dias · visão do time"
              textoCompleto={`${fmtInteiro(d.acimaDe180.time)} itens com mais de 180 dias na visão do time`}
            />
            <NumeroGrande
              data-testid="o10-cliente-180"
              valor={fmtInteiro(d.acimaDe180.cliente)}
              rotulo="itens com mais de 180 dias · visão do cliente"
              textoCompleto={`${fmtInteiro(d.acimaDe180.cliente)} itens com mais de 180 dias na visão do cliente`}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {lados.map(({ id, titulo, v }) => (
              <div key={id}>
                <h4 className="text-sm font-semibold">{titulo}</h4>
                {v.histograma.status === 'ok' ? (
                  <Histograma
                    faixas={v.histograma.valor.faixas}
                    unidadeX="dias corridos"
                    descricao={`Idade do backlog: ${titulo}`}
                  />
                ) : (
                  <AmostraInsuficiente
                    n={v.histograma.n}
                    codigo={`O10-${id}`}
                    oQue="Histograma"
                    className="mt-2"
                  />
                )}
              </div>
            ))}
          </div>
          {d.time.histograma.status === 'ok' ? (
            <SeletorLocal
              codigo="O10"
              rotulo="Evolução por tipo"
              valor={aba}
              onChange={setAba}
              itens={d.evolucao.map((e) => ({ valor: slug(e.tipo), rotulo: e.tipo }))}
            >
              {evo && (
                <SerieLinhas
                  descricao={`Evolução mensal da idade do backlog: mediana e P85 (${evo.tipo})`}
                  unidade="dias"
                  formatarX={fmtMes}
                  pontos={evo.serie.map((s) => ({ x: s.mes, valores: { p50: s.p50, p85: s.p85 } }))}
                  series={[
                    { chave: 'p50', rotulo: 'Mediana (P50)', cor: 1, traco: 'solido' },
                    { chave: 'p85', rotulo: 'P85', cor: 2, traco: 'tracejado' },
                  ]}
                  marcacoes={d.criterios.serie}
                  altura={200}
                />
              )}
            </SeletorLocal>
          ) : (
            <AmostraInsuficiente
              n={d.time.histograma.n}
              codigo="O10-evolucao"
              oQue="Evolução da idade do backlog"
            />
          )}
        </div>
      )}
    </CartaoMetrica>
  )
}
