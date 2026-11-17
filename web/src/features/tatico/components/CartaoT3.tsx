import { useState } from 'react'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras } from '@/components/charts'
import { AmostraInsuficiente, CartaoMetrica, Dica } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtPct } from '@/lib/formatar'
import { NOTAS_TATICO } from '../notas'
import { propsCartao } from '@/features/painel/propsCartao'

type Contagem = 'itens' | 'tempo'

export function CartaoT3({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('T3', filtros)
  const [contagem, setContagem] = useState<Contagem>('itens')
  const d = q.dados
  const ok = d?.status === 'ok'
  const med = (n: NonNullable<typeof d>['naturezas'][number]) => n[contagem]
  const publicadas = d ? d.naturezas.filter((n) => med(n).pct !== null) : []
  const algumaAbaixo = !!d && d.naturezas.some((n) => n.abaixoDe20)
  const leitura = !d
    ? undefined
    : ok
      ? `O cartão mostra como as entregas se dividiram entre as fatias, sem comparar com combinado.${algumaAbaixo ? ' Fatia com menos de 20 entregas mostra só a contagem; a soma dos percentuais mostrados fica abaixo de 100%.' : ''}`
      : 'Percentuais indisponíveis: menos de 20 itens entregues no total.'
  const unidade = contagem === 'itens' ? 'itens' : 'dias úteis em execução'
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
          {ok && publicadas.length === 0 ? (
            <p className="text-sm" data-testid="t3-sem-fatia">
              Nenhuma fatia chegou a 20 entregas: só a contagem de cada uma aparece abaixo.
            </p>
          ) : ok ? (
            <Barras
              descricao={`Divisão das entregas por fatia, realizado (${unidade})`}
              orientacao="horizontal"
              unidade="% das entregas"
              formatar={(v) => fmtPct(v)}
              categorias={publicadas.map((n) => ({
                rotulo: n.natureza,
                valores: { realizado: med(n).pct },
              }))}
              series={[{ chave: 'realizado', rotulo: 'Entregas', cor: 1, padrao: 'liso' } as const]}
            />
          ) : (
            <AmostraInsuficiente n={d.base.n} codigo="T3" oQue="Percentuais de alocação" />
          )}
          <ul className="flex flex-col gap-1 text-sm" aria-label="Divisão por fatia">
            {d.naturezas.map((n) => {
              const m = med(n)
              return (
                <li key={n.natureza} className="flex flex-wrap items-center gap-2">
                  <strong>{n.natureza}:</strong>
                  <span>
                    {ok && m.pct !== null
                      ? `realizado ${fmtPct(m.pct)} · ${fmtInteiro(m.quantidade)} ${unidade}`
                      : `${fmtInteiro(m.quantidade)} ${unidade}${n.abaixoDe20 ? ' · menos de 20 entregas' : ''}`}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </CartaoMetrica>
  )
}
