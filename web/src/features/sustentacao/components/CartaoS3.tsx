import { Barras } from '@/components/charts'
import { CartaoMetrica, TabelaDados } from '@/components/ui'
import { PRIORIDADES, type FiltrosSustentacao } from '@metricas-dspd/contratos'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtMes, fmtPct } from '@/lib/formatar'
import { useParametroLocal } from '@/features/filtros'
import { NOTAS_SUSTENTACAO } from '../notas'

const MODOS = ['absoluto', 'proporcao'] as const

export function CartaoS3({ filtros }: { filtros: FiltrosSustentacao }) {
  const m = entradaDoCatalogo('S3')
  const q = useMetrica('S3', filtros)
  const [modo, setModo] = useParametroLocal('s3', MODOS, 'absoluto')
  const d = q.dados
  const prop = modo === 'proporcao'
  const ultimo = d && [...d.meses].reverse().find((x) => !x.emAndamento && x.total > 0)
  const leitura = d
    ? ultimo
      ? `Em ${fmtMes(ultimo.mes)} entraram ${fmtInteiro(ultimo.total)} chamados${ultimo.p1p2Pct === null ? '; a proporção de P1 e P2 não é publicada com menos de 20 chamados no mês.' : `, com ${fmtPct(ultimo.p1p2Pct, 0)} em P1 e P2.`}`
      : 'Sem mês fechado com chamados no período.'
    : undefined
  const semProporcao = d?.meses.filter((x) => x.total < 20) ?? []
  return (
    <CartaoMetrica
      codigo="S3"
      titulo={m.nome}
      pergunta={m.pergunta}
      estado={q.estado}
      atualizando={q.atualizando}
      {...(d ? { base: d.base, criterios: d.criterios } : {})}
      {...(leitura ? { leitura } : {})}
      nota={NOTAS_SUSTENTACAO.S3 as NonNullable<(typeof NOTAS_SUSTENTACAO)[string]>}
      meta={m.meta}
      fonte={m.fonte}
      granularidade={m.granularidade}
      onTentarDeNovo={q.recarregar}
      erro={q.erro}
      className="lg:col-span-12"
      acoes={
        <div role="group" aria-label="Visão do volume" className="flex gap-1 text-xs">
          {MODOS.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={modo === v}
              onClick={() => setModo(v)}
              className={`alvo rounded border px-2 ${modo === v ? 'border-acento bg-acento-fundo font-semibold' : 'border-borda-controle'}`}
            >
              {v === 'absoluto' ? 'Absoluto' : 'Proporção'}
            </button>
          ))}
        </div>
      }
    >
      {d && (
        <div className="flex flex-col gap-3">
          <Barras
            descricao={
              prop
                ? 'Proporção de chamados por prioridade, por mês'
                : 'Chamados por prioridade, por mês'
            }
            unidade={prop ? '%' : 'chamados'}
            formatar={prop ? (v) => fmtPct(v, 0) : fmtInteiro}
            modo="empilhado"
            categorias={d.meses.map((x) => ({
              rotulo: fmtMes(x.mes),
              emAndamento: x.emAndamento,
              valores: {
                ...Object.fromEntries(
                  x.porPrioridade.map((p) => [p.prioridade, prop ? p.pct : p.n]),
                ),
                ...(prop ? { p1p2: x.p1p2Pct } : {}),
              },
            }))}
            series={PRIORIDADES.map((p) => ({ chave: p, rotulo: p }))}
            {...(prop
              ? {
                  linha: {
                    chave: 'p1p2',
                    rotulo: 'P1 + P2',
                    unidade: '%',
                    formatar: (v: number) => fmtPct(v, 0),
                  },
                }
              : {})}
          />
          {prop && semProporcao.length > 0 && (
            <p className="text-sm text-texto-2" data-testid="s3-sem-proporcao">
              Sem proporção (menos de 20 chamados no mês; o absoluto permanece):{' '}
              {semProporcao.map((x) => fmtMes(x.mes)).join(', ')}.
            </p>
          )}
          <TabelaDados
            codigo="S3-resumo"
            legenda="Chamados por mês, proporção de P1 e P2 e ajustes manuais de prioridade no mês (cruzamento com S7)"
            colunas={[
              { chave: 'mes', titulo: 'Mês' },
              { chave: 'total', titulo: 'Chamados', alinhar: 'direita' },
              { chave: 'p1p2', titulo: 'P1 + P2', alinhar: 'direita' },
              {
                chave: 'aj',
                titulo: 'Ajustes manuais de prioridade no mês (S7)',
                alinhar: 'direita',
              },
            ]}
            linhas={d.meses.map((x) => ({
              mes: x.emAndamento ? `${fmtMes(x.mes)} (em andamento)` : fmtMes(x.mes),
              total: fmtInteiro(x.total),
              p1p2: x.p1p2Pct === null ? '— menos de 20 chamados' : fmtPct(x.p1p2Pct, 0),
              aj: fmtInteiro(x.ajustesManuais),
            }))}
          />
        </div>
      )}
    </CartaoMetrica>
  )
}
