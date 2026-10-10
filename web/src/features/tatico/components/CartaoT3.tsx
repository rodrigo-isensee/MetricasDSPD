import { useState } from 'react'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras } from '@/components/charts'
import { AmostraInsuficiente, CartaoMetrica, Dica } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtNumero, fmtPct } from '@/lib/formatar'
import { NOTAS_TATICO } from '../notas'
import { propsCartao } from '@/features/painel/propsCartao'

type Contagem = 'itens' | 'tempo'

export function CartaoT3({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('T3', filtros)
  const [contagem, setContagem] = useState<Contagem>('itens')
  const d = q.dados
  const ok = d?.status === 'ok'
  const med = (n: NonNullable<typeof d>['naturezas'][number]) => n[contagem]
  const maiores = d
    ? [...d.naturezas]
        .filter((n) => med(n).desvioPP !== null && med(n).pct !== null)
        .sort(
          // O filtro acima só deixa passar desvio e percentual publicados.
          (a, b) => Math.abs(med(b).desvioPP as number) - Math.abs(med(a).desvioPP as number),
        )
        .slice(0, 2)
    : []
  const leitura = !d
    ? undefined
    : ok && maiores.length
      ? maiores
          .map(
            (n) =>
              `${n.natureza} consumiu ${fmtPct(med(n).pct as number)} da capacidade (acordado: ${fmtPct(n.acordadoPct)}).`,
          )
          .join(' ')
      : 'Percentuais indisponíveis: menos de 20 itens entregues no total.'
  const unidade = contagem === 'itens' ? 'itens' : 'h úteis em execução'
  return (
    <CartaoMetrica
      {...propsCartao('T3', q, NOTAS_TATICO.T3)}
      {...(d && !ok ? { baseVariante: 'insuficiente' as const } : {})}
      {...(leitura ? { leitura } : {})}
      className="lg:col-span-6"
      acoes={
        <fieldset className="flex items-center gap-1 text-sm">
          <legend className="sr-only">Contar por</legend>
          <span aria-hidden="true">Contar por:</span>
          {(
            [
              ['itens', 'Itens'],
              ['tempo', 'Tempo em execução'],
            ] as const
          ).map(([v, r]) => (
            <label key={v} className="alvo flex cursor-pointer items-center gap-1 rounded px-1">
              <input
                type="radio"
                name="t3-contagem"
                className="size-4 accent-[var(--acento)]"
                checked={contagem === v}
                onChange={() => setContagem(v)}
              />
              {r}
            </label>
          ))}
          <Dica texto="Use 'Tempo em execução' quando os itens têm tamanhos muito diferentes." />
        </fieldset>
      }
    >
      {d && (
        <div className="flex flex-col gap-3">
          {ok ? (
            <Barras
              descricao={`Alocação da capacidade por natureza, acordado e realizado (${unidade})`}
              orientacao="horizontal"
              unidade="% da capacidade"
              formatar={(v) => fmtPct(v)}
              categorias={d.naturezas.map((n) => ({
                rotulo: n.natureza,
                valores: { acordado: n.acordadoPct, realizado: med(n).pct },
              }))}
              series={[
                { chave: 'acordado', rotulo: 'Acordado', cor: 2, padrao: 'contorno' },
                { chave: 'realizado', rotulo: 'Realizado', cor: 1, padrao: 'liso' },
              ]}
            />
          ) : (
            <AmostraInsuficiente n={d.base.n} codigo="T3" oQue="Percentuais de alocação" />
          )}
          <ul className="flex flex-col gap-1 text-sm" aria-label="Desvio por natureza">
            {d.naturezas.map((n) => {
              const m = med(n)
              return (
                <li key={n.natureza} className="flex flex-wrap items-center gap-2">
                  <strong>{n.natureza}:</strong>
                  <span>
                    {ok && m.pct !== null
                      ? `realizado ${fmtPct(m.pct)} · acordado ${fmtPct(n.acordadoPct)} · desvio ${m.desvioPP !== null && m.desvioPP > 0 ? '+' : ''}${fmtNumero(m.desvioPP ?? 0, 1)} p.p.`
                      : `${fmtInteiro(m.quantidade)} ${unidade} · acordado ${fmtPct(n.acordadoPct)}`}
                  </span>
                  {ok && m.statusMeta === 'fora' && (
                    <span className="rounded bg-alerta-fundo px-2 py-0.5 text-xs font-semibold text-alerta">
                      Desvio acima de 10 p.p.
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </CartaoMetrica>
  )
}
