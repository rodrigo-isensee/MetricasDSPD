import { Barras } from '@/components/charts'
import {
  CartaoMetrica,
  ModoTabelaContext,
  StatusMeta,
  TabelaDados,
  useModoTabela,
} from '@/components/ui'
import type { FiltrosSustentacao, Prioridade, ResultadoS1 } from '@metricas-dspd/contratos'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtPct } from '@/lib/formatar'
import { fmtTempoPrioridade } from '../formatar'
import { NOTAS_SUSTENTACAO } from '../notas'
import { TextoInsuficiente } from './comuns'
import { LeiaJunto } from '@/features/complementares/LeiaJunto'

type Linha = ResultadoS1['prioridades'][number]
type Classe = Linha['restauracao']
type Medida = 'primeiroAtendimento' | 'restauracao'

const MEDIDAS: { chave: Medida; titulo: string; sigla: string }[] = [
  { chave: 'primeiroAtendimento', titulo: 'Primeiro atendimento', sigla: 'MTTA' },
  { chave: 'restauracao', titulo: 'Restauração', sigla: 'MTTR' },
]

const celula = (c: Classe, p: Prioridade, campo: 'p50' | 'p85' | 'p95' | 'media') =>
  c.estatistica.status === 'ok' ? fmtTempoPrioridade(c.estatistica.valor[campo], p) : '—'

function Bloco({ medida, linhas }: { medida: (typeof MEDIDAS)[number]; linhas: readonly Linha[] }) {
  const ctx = useModoTabela()
  const modo = ctx.modo
  const k = medida.sigla
  return (
    <ModoTabelaContext.Provider value={{ ...ctx, codigo: `S1-${k}` }}>
      <section aria-label={`${medida.titulo} (${k})`} data-testid={`s1-${k.toLowerCase()}`}>
        <h4 className="mb-1 text-sm font-semibold">
          {medida.titulo} ({k})
        </h4>
        <Barras
          orientacao="horizontal"
          descricao={`${medida.titulo}: tempo como proporção do alvo de cada prioridade`}
          unidade="% do alvo"
          formatar={(v) => fmtPct(v, 0)}
          larguraRotulos={170}
          altura={230}
          categorias={linhas.map((l) => {
            const c = l[medida.chave]
            return {
              rotulo: `${l.prioridade} · alvo ${fmtTempoPrioridade(c.alvoHoras, l.prioridade)}`,
              valores: {
                p50: c.razaoMediana === null ? null : c.razaoMediana * 100,
                p85: c.razaoP85 === null ? null : c.razaoP85 * 100,
              },
            }
          })}
          series={[
            { chave: 'p50', rotulo: 'Mediana' },
            { chave: 'p85', rotulo: 'P85' },
          ]}
          referencias={[{ valor: 100, rotulo: 'Alvo (100%)' }]}
        />
        {modo === 'grafico' && (
          <ul className="mt-1 text-sm">
            {linhas.map((l) => {
              const c = l[medida.chave]
              return c.estatistica.status === 'insuficiente' ? (
                <li key={l.prioridade}>
                  {l.prioridade}:{' '}
                  <TextoInsuficiente
                    n={c.n}
                    testid={`s1-insuficiente-${k.toLowerCase()}-${l.prioridade.toLowerCase()}`}
                  />
                </li>
              ) : null
            })}
          </ul>
        )}
        <div className="mt-2">
          <TabelaDados
            codigo={`S1-${k}-detalhe`}
            legenda={`${medida.titulo}: alvo, mediana, P85, P95 e média por prioridade (a média nunca aparece sozinha)`}
            colunas={[
              { chave: 'p', titulo: 'Prioridade' },
              { chave: 'alvo', titulo: 'Alvo', alinhar: 'direita' },
              { chave: 'p50', titulo: 'Mediana', alinhar: 'direita' },
              { chave: 'p85', titulo: 'P85', alinhar: 'direita' },
              { chave: 'p95', titulo: 'P95', alinhar: 'direita' },
              { chave: 'media', titulo: 'Média (referência)', alinhar: 'direita' },
              { chave: 'base', titulo: 'Base', alinhar: 'direita' },
              { chave: 'status', titulo: 'Situação' },
            ]}
            linhas={linhas.map((l) => {
              const c = l[medida.chave]
              return {
                p: l.prioridade,
                alvo: fmtTempoPrioridade(c.alvoHoras, l.prioridade),
                p50: celula(c, l.prioridade, 'p50'),
                p85: celula(c, l.prioridade, 'p85'),
                p95: celula(c, l.prioridade, 'p95'),
                media: celula(c, l.prioridade, 'media'),
                base: `${fmtInteiro(c.n)} chamados`,
                status:
                  c.statusMeta === 'sem-referencia' ? (
                    <TextoInsuficiente n={c.n} />
                  ) : (
                    <StatusMeta
                      status={c.statusMeta}
                      texto={
                        c.statusMeta === 'dentro'
                          ? 'Mediana dentro do alvo'
                          : 'Mediana acima do alvo'
                      }
                    />
                  ),
              }
            })}
          />
        </div>
      </section>
    </ModoTabelaContext.Provider>
  )
}

export function CartaoS1({ filtros }: { filtros: FiltrosSustentacao }) {
  const m = entradaDoCatalogo('S1')
  const q = useMetrica('S1', filtros)
  const d = q.dados
  const primeira = d?.prioridades.find((l) => l.restauracao.estatistica.status === 'ok')
  const e = primeira?.restauracao.estatistica
  const leitura =
    d &&
    (primeira && e?.status === 'ok'
      ? `${primeira.prioridade}: metade dos chamados restaura em até ${fmtTempoPrioridade(e.valor.p50, primeira.prioridade)} (alvo: ${fmtTempoPrioridade(primeira.restauracao.alvoHoras, primeira.prioridade)}); 85% em até ${fmtTempoPrioridade(e.valor.p85, primeira.prioridade)}.`
      : 'Nenhuma prioridade tem 20 chamados para publicar mediana e P85.')
  const todasInsuf = d?.prioridades.every(
    (l) => l.restauracao.estatistica.status === 'insuficiente',
  )
  return (
    <CartaoMetrica
      codigo="S1"
      titulo={m.nome}
      pergunta={m.pergunta}
      estado={q.estado}
      atualizando={q.atualizando}
      {...(d
        ? {
            base: d.base,
            criterios: d.criterios,
            baseVariante: todasInsuf ? ('insuficiente' as const) : ('ok' as const),
            janelaPercentis: {
              unidade: d.janelaPercentis.unidade,
              quantidade: d.janelaPercentis.quantidade,
            },
            periodo: filtros.periodo,
          }
        : {})}
      {...(leitura ? { leitura } : {})}
      nota={NOTAS_SUSTENTACAO.S1 as NonNullable<(typeof NOTAS_SUSTENTACAO)[string]>}
      meta={m.meta}
      fonte={m.fonte}
      granularidade={m.granularidade}
      onTentarDeNovo={q.recarregar}
      erro={q.erro}
      className="lg:col-span-12"
    >
      {d && (
        <div className="flex flex-col gap-6">
          <p className="text-sm text-texto-2" data-testid="s1-excecoes">
            {fmtInteiro(d.excecoesForaDaApuracao)}{' '}
            {d.excecoesForaDaApuracao === 1 ? 'chamado com' : 'chamados com'} exceção de registro
            posterior (fora desta apuração).
          </p>
          {MEDIDAS.map((medida) => (
            <Bloco key={medida.chave} medida={medida} linhas={d.prioridades} />
          ))}
          <LeiaJunto id="s1" />
        </div>
      )}
    </CartaoMetrica>
  )
}
