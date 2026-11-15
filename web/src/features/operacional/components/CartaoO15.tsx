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

type DadosO15 = NonNullable<ReturnType<typeof useMetrica<'O15'>>['dados']>

function juntarNomes(nomes: string[]): string {
  return nomes.length < 2
    ? nomes.join('')
    : `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`
}

function textoFora(n: number, m: number): string {
  return n === 1
    ? `1 de ${fmtInteiro(m)} ${m === 1 ? 'bug' : 'bugs'} do período ficou fora desta conta: não tem fase de detecção na base.`
    : `${fmtInteiro(n)} de ${fmtInteiro(m)} bugs do período ficaram fora desta conta: não têm fase de detecção na base.`
}

function montarLeitura(d: DadosO15): string {
  const taxas =
    d.contencao.status === 'ok' && d.escape.status === 'ok'
      ? `${textoTaxa(d.contencao)} dos bugs foram contidos antes da homologação; ${textoTaxa(d.escape)} chegaram à produção.`
      : `Percentuais indisponíveis: ${fmtInteiro(d.base.n)} de 20 bugs mínimos.`
  const nulas = d.fases.filter((f) => f.contagem === null).length
  if (nulas === 0) return taxas
  if (nulas < d.fases.length)
    return `${taxas} Fases com menos de 20 bugs aparecem sem contagem (—).`
  return d.base.n === 0
    ? `${taxas} Nenhum bug com fase de detecção no período.`
    : `${taxas} Nenhuma fase chegou a 20 bugs, por isso o gráfico não mostra contagens.`
}

/** O15: onde os bugs são encontrados, fases na ordem do processo. Sem meta nem status sobre o volume (E2). */
export function CartaoO15({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O15', filtros)
  const d = q.dados
  const leitura = d ? montarLeitura(d) : undefined
  const semContagem = d ? d.fases.filter((f) => f.contagem === null).map((f) => f.fase) : []
  const todasNulas = !!d && d.fases.length > 0 && semContagem.length === d.fases.length
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
          {d.bugsSemFase > 0 && (
            <p className="text-sm" data-testid="o15-fora">
              {textoFora(d.bugsSemFase, d.base.n + d.bugsSemFase)} O O15 conta só bugs ligados a um
              card da demanda; bug sem card da demanda, ligado a Sprint ou a item em backlog não
              entra.
            </p>
          )}
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
          {!todasNulas && (
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
          )}
          {semContagem.length > 0 && (
            <p className="text-sm" data-testid="o15-fases-sem-contagem">
              {semContagem.length === 1
                ? `Fase sem contagem (menos de 20 bugs): ${semContagem[0]}.`
                : `Fases sem contagem (menos de 20 bugs cada): ${juntarNomes(semContagem)}.`}
            </p>
          )}
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
