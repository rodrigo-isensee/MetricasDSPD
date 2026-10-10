import type { ReactNode } from 'react'
import { Barras } from '@/components/charts'
import { CartaoMetrica, TabelaDados } from '@/components/ui'
import type { BaseAmostral } from '@metricas-dspd/contratos'
import { useParametroLocal } from '@/features/filtros'
import { fmtInteiro, fmtMes, fmtPct } from '@/lib/formatar'
import type { CartaoMetricaProps } from '@/components/ui'

interface Motivo {
  motivo: string
  n: number
  pct: number | null
}
interface Mes {
  mes: string
  emAndamento: boolean
  n: number
  motivos: readonly Motivo[]
}

const VISOES = ['distribuicao', 'evolucao'] as const

/** Distribuição e evolução mensal de um domínio fechado (S5 e S6): percentuais somem com menos de 20. */
export function CartaoMotivos({
  chave,
  motivos,
  evolucao,
  estadoProps,
  base,
  total,
  foco,
  extra,
  naoInformado,
}: {
  chave: 's5' | 's6'
  motivos: readonly Motivo[]
  evolucao: readonly Mes[]
  estadoProps: Omit<CartaoMetricaProps, 'children' | 'acoes'>
  base: BaseAmostral | undefined
  total: number
  /** Motivo destacado com contorno e rótulo "Foco da meta". */
  foco?: string
  extra?: ReactNode
  naoInformado?: number
}) {
  const [visao, setVisao] = useParametroLocal(chave, VISOES, 'distribuicao')
  const sufixo = chave.toUpperCase()
  return (
    <CartaoMetrica
      {...estadoProps}
      {...(base ? { base } : {})}
      className="lg:col-span-6"
      acoes={
        <div role="group" aria-label="Visão" className="flex gap-1 text-xs">
          {VISOES.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={visao === v}
              onClick={() => setVisao(v)}
              className={`alvo rounded border px-2 ${visao === v ? 'border-acento bg-acento-fundo font-semibold' : 'border-borda-controle'}`}
            >
              {v === 'distribuicao' ? 'Distribuição' : 'Evolução mensal'}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {extra}
        {visao === 'distribuicao' ? (
          <>
            <Barras
              orientacao="horizontal"
              descricao={`Distribuição dos motivos (${sufixo})`}
              unidade="chamados"
              larguraRotulos={200}
              altura={240}
              semLegenda
              categorias={motivos.map((m) => ({
                rotulo: m.motivo === foco ? `${m.motivo} (Foco da meta)` : m.motivo,
                valores: { n: m.n },
              }))}
              series={[{ chave: 'n', rotulo: 'Chamados', cor: 1 }]}
            />
            <TabelaDados
              codigo={`${sufixo}-detalhe`}
              legenda={`Motivos (${sufixo}): contagem e percentual; o percentual some com menos de 20 chamados`}
              colunas={[
                { chave: 'm', titulo: 'Motivo' },
                { chave: 'n', titulo: 'Chamados', alinhar: 'direita' },
                { chave: 'p', titulo: '%', alinhar: 'direita' },
              ]}
              linhas={[
                ...motivos.map((m) => ({
                  m: m.motivo === foco ? `${m.motivo} (Foco da meta)` : m.motivo,
                  n: fmtInteiro(m.n),
                  p: m.pct === null ? '—' : fmtPct(m.pct, 0),
                })),
                ...(naoInformado !== undefined
                  ? [{ m: 'Não informado', n: fmtInteiro(naoInformado), p: '—' }]
                  : []),
              ]}
            />
            {total < 20 && (
              <p className="text-sm text-atencao" data-testid={`${chave}-sem-percentual`}>
                Amostra insuficiente ({fmtInteiro(total)} de 20 itens mínimos): percentuais não
                publicados; as contagens permanecem.
              </p>
            )}
          </>
        ) : (
          <Barras
            descricao={`Evolução mensal dos motivos (${sufixo}), 100% empilhado`}
            unidade="%"
            modo="empilhado"
            formatar={(v) => fmtPct(v, 0)}
            categorias={evolucao.map((e) => ({
              rotulo: fmtMes(e.mes),
              emAndamento: e.emAndamento,
              valores: Object.fromEntries(e.motivos.map((m) => [m.motivo, m.pct])),
            }))}
            series={motivos.map((m) => ({ chave: m.motivo, rotulo: m.motivo }))}
          />
        )}
      </div>
    </CartaoMetrica>
  )
}
