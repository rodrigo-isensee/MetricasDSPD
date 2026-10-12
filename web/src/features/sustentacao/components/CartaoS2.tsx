import { Barras } from '@/components/charts'
import { CartaoMetrica, StatusMeta, TabelaDados } from '@/components/ui'
import type { FiltrosSustentacao, ResultadoS2 } from '@metricas-dspd/contratos'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtPct } from '@/lib/formatar'
import { NOTAS_SUSTENTACAO } from '../notas'
import { TextoInsuficiente } from './comuns'
import { LeiaJunto } from '@/features/complementares/LeiaJunto'

type Celula = ResultadoS2['prioridades'][number]['restauracao']

function Resultado({ c }: { c: Celula }) {
  const t = c.taxa
  return (
    <div className="flex flex-col items-end gap-1">
      <span>
        {t.status === 'ok' ? `${fmtPct(t.pct, 1)} · ` : ''}
        {fmtInteiro(t.k)} de {fmtInteiro(t.n)}
      </span>
      {t.status === 'ok' ? (
        <StatusMeta
          status={c.statusMeta}
          texto={c.statusMeta === 'dentro' ? 'Acima de 90%' : 'Abaixo de 90%'}
        />
      ) : (
        <TextoInsuficiente n={t.n} />
      )}
    </div>
  )
}

export function CartaoS2({ filtros }: { filtros: FiltrosSustentacao }) {
  const m = entradaDoCatalogo('S2')
  const q = useMetrica('S2', filtros)
  const d = q.dados
  const ref = d?.prioridades.find(
    (p) => p.primeiroAtendimento.taxa.status === 'ok' && p.restauracao.taxa.status === 'ok',
  )
  const pa = ref?.primeiroAtendimento.taxa
  const re = ref?.restauracao.taxa
  const leitura = d
    ? ref && pa?.status === 'ok' && re?.status === 'ok'
      ? `${ref.prioridade}: primeiro atendimento no prazo em ${fmtPct(pa.pct, 1)} dos chamados (${fmtInteiro(pa.k)} de ${fmtInteiro(pa.n)}); restauração no prazo em ${fmtPct(re.pct, 1)} (${fmtInteiro(re.k)} de ${fmtInteiro(re.n)}).`
      : 'Nenhuma prioridade tem 20 chamados para publicar o percentual dentro do prazo.'
    : undefined
  const pct = (c: Celula) => (c.taxa.status === 'ok' ? c.taxa.pct : null)
  return (
    <CartaoMetrica
      codigo="S2"
      titulo={m.nome}
      pergunta={m.pergunta}
      estado={q.estado}
      atualizando={q.atualizando}
      {...(d
        ? {
            base: d.base,
            criterios: d.criterios,
            baseVariante: d.prioridades.every(
              (p) => p.primeiroAtendimento.taxa.status === 'insuficiente',
            )
              ? ('insuficiente' as const)
              : ('ok' as const),
          }
        : {})}
      {...(leitura ? { leitura } : {})}
      nota={NOTAS_SUSTENTACAO.S2 as NonNullable<(typeof NOTAS_SUSTENTACAO)[string]>}
      meta={m.meta}
      fonte={m.fonte}
      granularidade={m.granularidade}
      onTentarDeNovo={q.recarregar}
      erro={q.erro}
      className="lg:col-span-12"
    >
      {d && (
        <div className="flex flex-col gap-3">
          <Barras
            descricao="Chamados dentro do prazo, por prioridade, primeiro atendimento e restauração"
            unidade="% dentro do prazo"
            formatar={(v) => fmtPct(v, 1)}
            categorias={d.prioridades.map((p) => ({
              rotulo: p.prioridade,
              valores: { pa: pct(p.primeiroAtendimento), re: pct(p.restauracao) },
            }))}
            series={[
              { chave: 'pa', rotulo: 'Primeiro atendimento' },
              { chave: 're', rotulo: 'Restauração' },
            ]}
            referencias={[{ valor: 90, rotulo: 'Meta: acima de 90%' }]}
          />
          <TabelaDados
            codigo="S2-detalhe"
            legenda="Chamados dentro do prazo (k de n) por prioridade; abaixo de 20 chamados só o k de n"
            colunas={[
              { chave: 'p', titulo: 'Prioridade' },
              { chave: 'pa', titulo: 'Primeiro atendimento', alinhar: 'direita' },
              { chave: 're', titulo: 'Restauração', alinhar: 'direita' },
            ]}
            linhas={d.prioridades.map((p) => ({
              p: p.prioridade,
              pa: <Resultado c={p.primeiroAtendimento} />,
              re: <Resultado c={p.restauracao} />,
            }))}
          />
          <LeiaJunto id="s2" />
        </div>
      )}
    </CartaoMetrica>
  )
}
