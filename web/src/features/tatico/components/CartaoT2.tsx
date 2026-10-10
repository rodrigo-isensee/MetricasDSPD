import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras, MapaCalor } from '@/components/charts'
import { CartaoMetrica, StatusMeta } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtData, fmtDiasUteis, fmtInteiro, fmtPct } from '@/lib/formatar'
import { META_ADERENCIA_SLE_PCT } from '@metricas-dspd/contratos'
import { NOTAS_TATICO } from '../notas'
import { propsCartao } from '@/features/painel/propsCartao'

const ETAPAS = ['Fila', 'Espera', 'Execução', 'Homologação'] as const

export function CartaoT2({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('T2', filtros)
  const d = q.dados
  const classes = d?.classes ?? []
  const publicadas = classes.flatMap((c) =>
    c.dentroDoSle?.status === 'ok' ? [{ c, t: c.dentroDoSle }] : [],
  )
  const comSle = classes.filter((c) => c.sle)
  const leitura = publicadas.length
    ? publicadas.map(({ c, t }) => `${c.classe}: ${fmtPct(t.pct, 1)} dentro do SLE.`).join(' ')
    : d
      ? 'Nenhuma classe tem amostra suficiente para publicar a aderência ao SLE.'
      : undefined
  return (
    <CartaoMetrica
      {...propsCartao('T2', q, NOTAS_TATICO.T2)}
      {...(d && publicadas.length === 0 ? { baseVariante: 'insuficiente' as const } : {})}
      {...(leitura ? { leitura } : {})}
      {...(d ? { janelaPercentis: d.janelaPercentis, periodo: filtros.periodo } : {})}
      className="lg:col-span-6"
    >
      {d && (
        <div className="flex flex-col gap-3">
          {publicadas.length > 0 && (
            <Barras
              descricao="Percentual dentro do SLE por classe de serviço"
              orientacao="horizontal"
              unidade="%"
              formatar={(v) => fmtPct(v, 1)}
              categorias={publicadas.map(({ c, t }) => ({
                rotulo: c.classe,
                valores: { pct: t.pct },
              }))}
              series={[{ chave: 'pct', rotulo: 'Dentro do SLE', cor: 1 }]}
              referencias={[
                { valor: META_ADERENCIA_SLE_PCT, rotulo: `Meta ${META_ADERENCIA_SLE_PCT}%` },
              ]}
              semLegenda
            />
          )}
          <ul className="flex flex-col gap-2 text-sm" aria-label="Aderência por classe">
            {classes.map((c) => (
              <li
                key={c.classe}
                className="flex flex-wrap items-center gap-2"
                data-testid={`t2-${c.classe}`}
              >
                <strong>{c.classe}:</strong>
                {c.classe === 'Intangível' ? (
                  <span>Sem SLE (cota fixa de capacidade), fora do cálculo.</span>
                ) : c.dentroDoSle?.status === 'ok' && c.sle ? (
                  <>
                    <span>
                      {fmtInteiro(c.dentroDoSle.k)} de {fmtInteiro(c.dentroDoSle.n)} entregues
                      dentro do SLE de {fmtDiasUteis(c.sle.diasUteis, 0)} (publicado em{' '}
                      {fmtData(c.sle.publicadoEm)}): <strong>{fmtPct(c.dentroDoSle.pct, 1)}</strong>
                    </span>
                    <StatusMeta status={c.statusMeta} />
                  </>
                ) : (
                  <span>
                    Amostra insuficiente ({fmtInteiro(c.n)} de 20 itens mínimos). SLE: não
                    publicado.
                  </span>
                )}
              </li>
            ))}
          </ul>
          {comSle.length > 0 && (
            <MapaCalor
              descricao="Estouros do SLE por etapa de maior duração (contagem de itens)"
              rotuloLinhas="Classe"
              linhas={comSle.map((c) => c.classe)}
              colunas={[...ETAPAS]}
              valores={comSle.map((c) =>
                ETAPAS.map((e) => c.estouros.porEtapa.find((p) => p.etapa === e)?.contagem ?? 0),
              )}
            />
          )}
        </div>
      )}
    </CartaoMetrica>
  )
}
