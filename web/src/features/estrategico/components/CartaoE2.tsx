import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras } from '@/components/charts'
import { CartaoMetrica, NumeroGrande, TabelaDados } from '@/components/ui'
import { useMetrica } from '@/data'
import { propsCartao } from '@/features/painel/propsCartao'
import { fmtInteiro, fmtPct, fmtTrimestre } from '@/lib/formatar'
import { NOTAS_ESTRATEGICO } from '../notas'

export function CartaoE2({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('E2', filtros)
  const d = q.dados
  const tri = d?.trimestres ?? []
  const publicados = tri.filter(
    // O limiar de 20 itens é da biblioteca: o trimestre é publicado quando o DTO traz percentuais.
    (t) => t.evolucaoVinculada.status === 'ok' || t.segmentos.some((s) => s.pct !== null),
  )
  const ocultos = tri.filter((t) => !publicados.includes(t))
  const nomes = [...new Set(tri.flatMap((t) => t.segmentos.map((s) => s.categoria)))]
  const tipoDe = (c: string) => tri.flatMap((t) => t.segmentos).find((s) => s.categoria === c)?.tipo
  const ev = d?.evolucaoVinculada
  const ultimo = [...publicados]
    .reverse()
    .find((t) => t.segmentos.some((s) => s.tipo === 'fora-de-objetivo' && s.pct !== null))
  const fora = ultimo?.segmentos.find((s) => s.tipo === 'fora-de-objetivo')
  const leitura = d
    ? ev?.status === 'ok'
      ? `${fmtPct(ev.pct)} da capacidade de evolução está ligada a um objetivo${fora?.pct != null ? `; ${fmtPct(fora.pct)} está fora de qualquer objetivo` : ''}.`
      : `Percentuais indisponíveis: ${ev ? `${fmtInteiro(ev.n)} de 20 itens mínimos` : 'amostra insuficiente'}.`
    : undefined
  return (
    <CartaoMetrica
      {...propsCartao('E2', q, NOTAS_ESTRATEGICO.E2)}
      {...(d && ev?.status === 'insuficiente' ? { baseVariante: 'insuficiente' as const } : {})}
      {...(leitura ? { leitura } : {})}
      {...(d ? { statusMeta: d.statusMeta } : {})}
      className="lg:col-span-6"
    >
      {d && ev && (
        <div className="flex flex-col gap-3">
          <NumeroGrande
            data-testid="e2-kpi"
            valor={ev.status === 'ok' ? fmtPct(ev.pct) : '—'}
            rotulo="evolução vinculada a objetivo (meta ≥ 60%)"
            textoCompleto={
              ev.status === 'ok'
                ? `Evolução vinculada a objetivo: ${fmtPct(ev.pct)}`
                : `Evolução vinculada indisponível: ${ev.k} de ${ev.n} itens`
            }
            complemento={`${fmtInteiro(ev.k)} de ${fmtInteiro(ev.n)} itens de evolução (Melhoria, Iniciativa e Dívida técnica)`}
          />
          {publicados.length > 0 && (
            <Barras
              descricao="Capacidade entregue por objetivo estratégico, por trimestre"
              orientacao="horizontal"
              modo="percentual"
              unidade="% da capacidade"
              larguraRotulos={110}
              categorias={publicados.map((t) => ({
                rotulo: fmtTrimestre(t.trimestre),
                emAndamento: t.emAndamento,
                valores: Object.fromEntries(
                  nomes.map((n) => [n, t.segmentos.find((s) => s.categoria === n)?.n ?? 0]),
                ),
              }))}
              series={nomes.map((n, i) =>
                tipoDe(n) === 'fora-de-objetivo'
                  ? {
                      chave: n,
                      rotulo: `${n} (destaque)`,
                      cor: 6 as const,
                      padrao: 'cruzado' as const,
                    }
                  : { chave: n, rotulo: n, cor: ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5 },
              )}
            />
          )}
          {ocultos.length > 0 && (
            <ul className="text-sm" data-testid="e2-sem-percentual">
              {ocultos.map((t) => (
                <li key={t.trimestre}>
                  {fmtTrimestre(t.trimestre)}: {fmtInteiro(t.n)} itens entregues; percentuais
                  indisponíveis ({fmtInteiro(t.n)} de 20 itens mínimos).
                </li>
              ))}
            </ul>
          )}
          <TabelaDados
            legenda="Itens entregues por objetivo e trimestre"
            colunas={[
              { chave: 'tri', titulo: 'Trimestre' },
              { chave: 'cat', titulo: 'Categoria' },
              { chave: 'n', titulo: 'Itens', alinhar: 'direita' },
              { chave: 'pct', titulo: '%', alinhar: 'direita' },
            ]}
            linhas={tri.flatMap((t) =>
              t.segmentos.map((s) => ({
                tri: fmtTrimestre(t.trimestre),
                cat: s.categoria,
                n: fmtInteiro(s.n),
                pct: s.pct === null ? '—' : fmtPct(s.pct),
              })),
            )}
          />
        </div>
      )}
    </CartaoMetrica>
  )
}
