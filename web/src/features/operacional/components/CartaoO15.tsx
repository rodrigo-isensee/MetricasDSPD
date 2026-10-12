import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras, SerieLinhas } from '@/components/charts'
import { CartaoMetrica, NumeroGrande } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtMes } from '@/lib/formatar'
import { NOTAS_OPERACIONAL } from '../notas'
import { propsCartao, textoTaxa } from '@/features/painel/propsCartao'
import { LeiaJunto } from '@/features/complementares/LeiaJunto'

const GRUPOS = [
  { chave: 'contido', rotulo: 'Contido pela equipe', padrao: 'liso' },
  { chave: 'negocio', rotulo: 'Chegou ao negócio', padrao: 'listras' },
  { chave: 'producao', rotulo: 'Escapou para produção', padrao: 'cruzado' },
] as const

/** O15: onde os bugs são encontrados, fases na ordem do processo. Sem meta nem status sobre o volume (E2). */
export function CartaoO15({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O15', filtros)
  const d = q.dados
  const leitura =
    d && d.contencao.status === 'ok' && d.escape.status === 'ok'
      ? `${textoTaxa(d.contencao)} dos bugs foram contidos antes da homologação; ${textoTaxa(d.escape)} chegaram à produção.`
      : d
        ? `Percentuais indisponíveis: ${fmtInteiro(d.base.n)} de 20 bugs mínimos. As contagens por fase estão no gráfico.`
        : undefined
  return (
    <CartaoMetrica
      {...propsCartao('O15', q, NOTAS_OPERACIONAL.O15)}
      {...(d && d.contencao.status === 'insuficiente'
        ? { baseVariante: 'insuficiente' as const }
        : {})}
      {...(leitura ? { leitura } : {})}
      className="lg:col-span-6"
    >
      {d && (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium" data-testid="o15-texto-fixo">
            O que se cobra é a taxa de escape, não o volume de bugs internos.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumeroGrande
              data-testid="o15-contencao"
              valor={textoTaxa(d.contencao)}
              rotulo={
                d.contencao.status === 'ok'
                  ? 'taxa de contenção'
                  : 'bugs contidos (taxa só com 20 bugs)'
              }
              textoCompleto={`Taxa de contenção: ${textoTaxa(d.contencao)}`}
            />
            <NumeroGrande
              data-testid="o15-escape"
              valor={textoTaxa(d.escape)}
              rotulo={
                d.escape.status === 'ok'
                  ? 'taxa de escape'
                  : 'bugs em produção (taxa só com 20 bugs)'
              }
              textoCompleto={`Taxa de escape: ${textoTaxa(d.escape)}`}
            />
          </div>
          <Barras
            descricao="Bugs por fase de detecção, na ordem do processo"
            unidade="bugs"
            modo="empilhado"
            categorias={d.fases.map((f) => ({
              rotulo: f.fase,
              valores: Object.fromEntries(
                GRUPOS.map((g) => [g.chave, f.grupo === g.chave ? f.contagem : null]),
              ),
            }))}
            series={GRUPOS.map((g) => ({
              chave: g.chave,
              rotulo: g.rotulo,
              cor: 7 as const,
              padrao: g.padrao,
            }))}
          />
          {d.contencao.status === 'ok' && (
            <SerieLinhas
              descricao="Contenção e escape por mês"
              unidade="%"
              formatarX={fmtMes}
              formatar={(v) => `${fmtInteiro(v)}%`}
              pontos={d.serieMensal.map((m) => ({
                x: m.mes,
                emAndamento: m.emAndamento,
                valores: {
                  contencao: m.contencao.status === 'ok' ? m.contencao.pct : null,
                  escape: m.escape.status === 'ok' ? m.escape.pct : null,
                },
              }))}
              series={[
                { chave: 'contencao', rotulo: 'Contenção', cor: 1, traco: 'solido' },
                { chave: 'escape', rotulo: 'Escape', cor: 2, traco: 'tracejado' },
              ]}
              marcacoes={d.criterios.serie}
              altura={200}
            />
          )}
          <LeiaJunto id="o15" />
        </div>
      )}
    </CartaoMetrica>
  )
}
