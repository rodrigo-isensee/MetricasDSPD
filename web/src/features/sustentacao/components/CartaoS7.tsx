import { Barras } from '@/components/charts'
import { CartaoMetrica, NumeroGrande, StatusMeta, TabelaDados } from '@/components/ui'
import type { FiltrosSustentacao, ResultadoS7 } from '@metricas-dspd/contratos'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtMes, fmtPct } from '@/lib/formatar'
import { NOTAS_SUSTENTACAO } from '../notas'
import { TextoInsuficiente } from './comuns'

type Bloco = ResultadoS7['reclassificacaoDeTipo']

function BlocoMensal({
  id,
  titulo,
  bloco,
  complemento,
}: {
  id: string
  titulo: string
  bloco: Bloco
  complemento?: React.ReactNode
}) {
  return (
    <section aria-label={titulo} data-testid={`s7-${id}`} className="flex min-w-0 flex-col gap-2">
      <h4 className="text-sm font-semibold">{titulo}</h4>
      <NumeroGrande
        className="w-fit"
        valor={fmtInteiro(bloco.totais.ocorrencias)}
        rotulo={`em ${fmtInteiro(bloco.totais.total)} chamados`}
        textoCompleto={`${titulo}: ${bloco.totais.ocorrencias} em ${bloco.totais.total} chamados`}
        data-testid={`s7-${id}-total`}
      />
      {complemento}
      <Barras
        descricao={`${titulo}: chamados por mês`}
        unidade="chamados"
        semLegenda
        altura={200}
        categorias={bloco.meses.map((m) => ({
          rotulo: fmtMes(m.mes),
          emAndamento: m.emAndamento,
          valores: { n: m.ocorrencias },
        }))}
        series={[{ chave: 'n', rotulo: titulo, cor: id === 'prioridade' ? 1 : 2 }]}
      />
      <TabelaDados
        codigo={`S7-${id}`}
        legenda={`${titulo}: contagem e % dos chamados do mês (a % some com menos de 20 chamados no mês)`}
        colunas={[
          { chave: 'mes', titulo: 'Mês' },
          { chave: 'n', titulo: 'Ocorrências', alinhar: 'direita' },
          { chave: 'total', titulo: 'Chamados do mês', alinhar: 'direita' },
          { chave: 'pct', titulo: '% dos chamados', alinhar: 'direita' },
        ]}
        linhas={bloco.meses.map((m) => ({
          mes: m.emAndamento ? `${fmtMes(m.mes)} (em andamento)` : fmtMes(m.mes),
          n: fmtInteiro(m.ocorrencias),
          total: fmtInteiro(m.total),
          pct: m.pct.status === 'ok' ? fmtPct(m.pct.pct, 1) : <TextoInsuficiente n={m.pct.n} />,
        }))}
      />
    </section>
  )
}

export function CartaoS7({ filtros }: { filtros: FiltrosSustentacao }) {
  const m = entradaDoCatalogo('S7')
  const q = useMetrica('S7', filtros)
  const d = q.dados
  const j = d?.ajusteDePrioridade.justificados
  const leitura = d
    ? `${fmtInteiro(d.ajusteDePrioridade.totais.ocorrencias)} chamados tiveram a prioridade ajustada manualmente (${fmtInteiro(d.ajusteDePrioridade.justificados.k)} de ${fmtInteiro(d.ajusteDePrioridade.justificados.n)} justificados) e ${fmtInteiro(d.reclassificacaoDeTipo.totais.ocorrencias)} foram encerrados como "Reclassificado, não é incidente".`
    : undefined
  return (
    <CartaoMetrica
      codigo="S7"
      titulo={m.nome}
      pergunta={m.pergunta}
      estado={q.estado}
      atualizando={q.atualizando}
      {...(d ? { base: d.base, criterios: d.criterios } : {})}
      {...(leitura ? { leitura } : {})}
      nota={NOTAS_SUSTENTACAO.S7 as NonNullable<(typeof NOTAS_SUSTENTACAO)[string]>}
      meta={m.meta}
      fonte={m.fonte}
      granularidade={m.granularidade}
      onTentarDeNovo={q.recarregar}
      erro={q.erro}
      className="lg:col-span-12"
    >
      {d && j && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BlocoMensal
            id="prioridade"
            titulo="Ajuste manual de prioridade"
            bloco={d.ajusteDePrioridade}
            complemento={
              <p
                className="flex flex-wrap items-center gap-2 text-sm"
                data-testid="s7-justificados"
              >
                Justificados: {fmtInteiro(j.k)} de {fmtInteiro(j.n)}
                <StatusMeta
                  status={j.k === j.n ? 'dentro' : 'fora'}
                  texto={j.k === j.n ? 'Todos justificados' : 'Há ajustes sem justificativa'}
                />
              </p>
            }
          />
          <BlocoMensal
            id="tipo"
            titulo="Reclassificado, não é incidente"
            bloco={d.reclassificacaoDeTipo}
          />
        </div>
      )}
    </CartaoMetrica>
  )
}
