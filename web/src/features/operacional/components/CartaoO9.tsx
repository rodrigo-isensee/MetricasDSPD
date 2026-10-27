import { TIPOS_CARD, type FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras, Histograma, SerieLinhas } from '@/components/charts'
import { AmostraInsuficiente, CartaoMetrica, SeletorLocal, TabelaDados } from '@/components/ui'
import { useMetrica } from '@/data'
import { useParametroLocal } from '@/features/filtros'
import { fmtInteiro, fmtMes, fmtNumero } from '@/lib/formatar'
import { LeiaJunto } from '@/features/complementares/LeiaJunto'
import { NOTAS_OPERACIONAL } from '../notas'
import { propsCartao, slug } from '@/features/painel/propsCartao'

const VALORES = TIPOS_CARD.map(slug)
const RELOGIOS = [
  { chave: 'cliente', rotulo: 'Cliente (entrada até entrega)' },
  { chave: 'equipe', rotulo: 'Equipe (compromisso até entrega)' },
  { chave: 'ciclo', rotulo: 'Ciclo (início até entrega)' },
] as const

/** O9: os três relógios, UM tipo por vez, mesma escala. Percentis e histogramas só com 20 itens ou mais. */
export function CartaoO9({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O9', filtros)
  const d = q.dados
  const maior = d ? [...d.classes].sort((a, b) => b.n - a.n)[0]?.tipo : undefined
  const [aba, setAba] = useParametroLocal('o9', VALORES, slug(maior ?? TIPOS_CARD[0]))
  const c = d?.classes.find((x) => slug(x.tipo) === aba)
  const r = c?.relogios.status === 'ok' ? c.relogios.valor : undefined
  const h = c?.histogramas.status === 'ok' ? c.histogramas.valor : undefined
  const leitura =
    c && r
      ? `Para ${c.tipo}, o cliente espera ${fmtNumero(r.cliente.p50, 0)} dias úteis (mediana), a equipe tem a demanda por ${fmtNumero(r.equipe.p50, 0)} e trabalha nela por ${fmtNumero(r.ciclo.p50, 0)}.`
      : c
        ? `${c.tipo}: relógios indisponíveis, ${fmtInteiro(c.n)} de 20 itens mínimos.`
        : undefined
  return (
    <CartaoMetrica
      {...propsCartao('O9', q, NOTAS_OPERACIONAL.O9)}
      {...(d && c?.relogios.status === 'insuficiente'
        ? { baseVariante: 'insuficiente' as const }
        : {})}
      {...(leitura ? { leitura } : {})}
      {...(d ? { janelaPercentis: d.janelaPercentis, periodo: filtros.periodo } : {})}
      {...(r
        ? {
            selos: (
              <span className="rounded-full border border-borda bg-superficie-2 px-2 py-0.5 text-sm">
                Distância cliente–ciclo: mediana {fmtNumero(r.distanciaClienteCicloP50, 0)} dias
                úteis
              </span>
            ),
          }
        : {})}
      className="lg:col-span-12"
    >
      {d && (
        <SeletorLocal
          codigo="O9"
          rotulo="Ver por tipo"
          valor={aba}
          onChange={setAba}
          itens={d.classes.map((x) => ({
            valor: slug(x.tipo),
            rotulo: x.tipo,
            contagem: x.n,
            insuficiente: x.relogios.status === 'insuficiente',
          }))}
        >
          {c && (
            <div className="flex flex-col gap-4">
              {r ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Barras
                    descricao={`Os três relógios, mediana e P85, mesma escala (${c.tipo})`}
                    orientacao="horizontal"
                    unidade="dias úteis"
                    altura={170}
                    larguraRotulos={110}
                    categorias={RELOGIOS.map((x) => ({
                      rotulo:
                        x.chave === 'cliente'
                          ? 'Cliente'
                          : x.chave === 'equipe'
                            ? 'Equipe'
                            : 'Ciclo',
                      valores: { p50: r[x.chave].p50, p85: r[x.chave].p85 },
                    }))}
                    series={[
                      { chave: 'p50', rotulo: 'P50 (mediana)', cor: 1, padrao: 'liso' },
                      { chave: 'p85', rotulo: 'P85', cor: 1, padrao: 'listras' },
                    ]}
                  />
                  <TabelaDados
                    codigo="O9-relogios"
                    legenda={`Percentis dos três relógios (${c.tipo})`}
                    colunas={[
                      { chave: 'rel', titulo: 'Relógio' },
                      { chave: 'p50', titulo: 'P50 (dias úteis)', alinhar: 'direita' },
                      { chave: 'p85', titulo: 'P85 (dias úteis)', alinhar: 'direita' },
                      { chave: 'p95', titulo: 'P95 (dias úteis)', alinhar: 'direita' },
                    ]}
                    linhas={RELOGIOS.map((x) => ({
                      rel: x.rotulo,
                      p50: fmtNumero(r[x.chave].p50, 0),
                      p85: fmtNumero(r[x.chave].p85, 0),
                      p95: fmtNumero(r[x.chave].p95, 0),
                    }))}
                  />
                </div>
              ) : (
                c.relogios.status === 'insuficiente' && (
                  <AmostraInsuficiente
                    n={c.relogios.n}
                    codigo="O9"
                    oQue="Percentis e histogramas"
                  />
                )
              )}
              {h && (
                <div className="flex flex-col gap-3">
                  {RELOGIOS.map((x) => (
                    <div key={x.chave}>
                      <h4 className="text-sm font-semibold">{x.rotulo}</h4>
                      <Histograma
                        faixas={h[x.chave]}
                        unidadeX="dias úteis"
                        descricao={`Histograma do relógio ${x.rotulo} (${c.tipo})`}
                        altura={150}
                      />
                    </div>
                  ))}
                </div>
              )}
              <SerieLinhas
                descricao={`Série mensal de P50 e P85 por relógio (${c.tipo})`}
                unidade="dias úteis"
                formatarX={fmtMes}
                pontos={c.serieMensal.map((m) => ({
                  x: m.mes,
                  valores: {
                    clienteP50: m.cliente?.p50 ?? null,
                    clienteP85: m.cliente?.p85 ?? null,
                    equipeP50: m.equipe?.p50 ?? null,
                    equipeP85: m.equipe?.p85 ?? null,
                    cicloP50: m.ciclo?.p50 ?? null,
                    cicloP85: m.ciclo?.p85 ?? null,
                  },
                }))}
                series={[
                  { chave: 'clienteP50', rotulo: 'Cliente P50', cor: 1, traco: 'solido' },
                  { chave: 'clienteP85', rotulo: 'Cliente P85', cor: 1, traco: 'tracejado' },
                  { chave: 'equipeP50', rotulo: 'Equipe P50', cor: 2, traco: 'solido' },
                  { chave: 'equipeP85', rotulo: 'Equipe P85', cor: 2, traco: 'tracejado' },
                  { chave: 'cicloP50', rotulo: 'Ciclo P50', cor: 3, traco: 'solido' },
                  { chave: 'cicloP85', rotulo: 'Ciclo P85', cor: 3, traco: 'tracejado' },
                ]}
                marcacoes={d.criterios.serie}
                altura={220}
              />
            </div>
          )}
        </SeletorLocal>
      )}
      <LeiaJunto id="o9" />
    </CartaoMetrica>
  )
}
