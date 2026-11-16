import { useState } from 'react'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras } from '@/components/charts'
import { AmostraInsuficiente, CartaoMetrica, Dica } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtNumero, fmtPct } from '@/lib/formatar'
import { NOTAS_TATICO } from '../notas'
import { propsCartao } from '@/features/painel/propsCartao'

type Contagem = 'itens' | 'tempo'

/** Selo de desvio da natureza. */
function SeloDesvio() {
  return (
    <span className="rounded bg-alerta-fundo px-2 py-0.5 text-xs font-semibold text-alerta">
      Desvio acima de 10 p.p.
    </span>
  )
}

export function CartaoT3({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('T3', filtros)
  const [contagem, setContagem] = useState<Contagem>('itens')
  const d = q.dados
  const ok = d?.status === 'ok'
  const med = (n: NonNullable<typeof d>['naturezas'][number]) => n[contagem]
  const maiores = d
    ? [...d.naturezas]
        .filter((n) => n.acordadoPct !== null && med(n).desvioPP !== null && med(n).pct !== null)
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
              `${n.natureza} consumiu ${fmtPct(med(n).pct as number)} da capacidade (acordado: ${fmtPct(n.acordadoPct as number)}).`,
          )
          .join(' ')
      : ok
        ? 'O cartão mostra como a capacidade foi dividida entre as naturezas, sem comparar com o combinado.'
        : 'Percentuais indisponíveis: menos de 20 itens entregues no total.'
  const semAcordado = !!d && d.naturezas.every((n) => n.acordadoPct === null)
  const unidade = contagem === 'itens' ? 'itens' : 'h úteis em execução'
  return (
    <CartaoMetrica
      {...propsCartao('T3', q, NOTAS_TATICO.T3)}
      {...(d && !ok ? { baseVariante: 'insuficiente' as const } : {})}
      {...(leitura ? { leitura } : {})}
      className="lg:col-span-6"
      acoes={
        <fieldset className="flex flex-wrap items-center gap-1 text-sm">
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
              descricao={`Alocação da capacidade por natureza${semAcordado ? ' realizada' : ', acordado e realizado'} (${unidade})`}
              orientacao="horizontal"
              unidade="% da capacidade"
              formatar={(v) => fmtPct(v)}
              categorias={d.naturezas.map((n) => ({
                rotulo: n.natureza,
                valores: { acordado: n.acordadoPct, realizado: med(n).pct },
              }))}
              series={[
                ...(semAcordado
                  ? []
                  : [
                      {
                        chave: 'acordado',
                        rotulo: 'Acordado',
                        cor: 2,
                        padrao: 'contorno',
                      } as const,
                    ]),
                { chave: 'realizado', rotulo: 'Realizado', cor: 1, padrao: 'liso' } as const,
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
                      ? `realizado ${fmtPct(m.pct)}${n.acordadoPct === null ? '' : ` · acordado ${fmtPct(n.acordadoPct)}`}${m.desvioPP === null ? '' : ` · desvio ${m.desvioPP > 0 ? '+' : ''}${fmtNumero(m.desvioPP, 1)} p.p.`}`
                      : `${fmtInteiro(m.quantidade)} ${unidade}${n.acordadoPct === null ? '' : ` · acordado ${fmtPct(n.acordadoPct)}`}`}
                  </span>
                  {ok && m.statusMeta === 'fora' && <SeloDesvio />}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </CartaoMetrica>
  )
}
