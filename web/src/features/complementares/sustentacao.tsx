import { useState } from 'react'
import type { FiltrosSustentacao } from '@metricas-dspd/contratos'
import { Barras, Histograma } from '@/components/charts'
import {
  AmostraInsuficiente,
  CelulaInsuficiente,
  SeletorLocal,
  StatusMeta,
  TabelaDados,
} from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtMes, fmtPct, textoJanela } from '@/lib/formatar'
import { textoTaxa } from '@/features/painel/propsCartao'
import { fmtTempoPrioridade } from '@/features/sustentacao/formatar'
import { fmtHorasUteis } from '@/lib/formatar'
import { CartaoComplementar } from './CartaoComplementar'
import { Leia } from './comuns'

interface P {
  filtros: FiltrosSustentacao
}

/** O17: causa raiz e concentração por sistema dos incidentes encerrados (Acelerato). */
export function CartaoO17({ filtros }: P) {
  const q = useMetrica('O17', filtros)
  const d = q.dados
  const topo = d?.porCausa.reduce((a, b) => (b.n > a.n ? b : a), { causa: '', n: -1 })
  return (
    <CartaoComplementar
      id="O17"
      q={q}
      leitura={
        topo && topo.n >= 0
          ? `A causa raiz mais frequente é ${topo.causa}, com ${fmtInteiro(topo.n)} incidentes.`
          : undefined
      }
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          <Barras
            descricao="Incidentes encerrados por causa raiz"
            orientacao="horizontal"
            unidade="incidentes"
            semLegenda
            larguraRotulos={140}
            categorias={r.porCausa.map((c) => ({ rotulo: c.causa, valores: { n: c.n } }))}
            series={[{ chave: 'n', rotulo: 'Incidentes' }]}
          />
          <Barras
            descricao="Incidentes encerrados por sistema"
            orientacao="horizontal"
            unidade="incidentes"
            semLegenda
            larguraRotulos={140}
            categorias={r.porSistema.map((c) => ({ rotulo: c.sistema, valores: { n: c.n } }))}
            series={[{ chave: 'n', rotulo: 'Incidentes' }]}
          />
          <Leia>A lista de causas é provisória até a decisão final do critério.</Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}

/** S8: taxa de reabertura de incidentes, com a referência do briefing. */
export function CartaoS8({ filtros }: P) {
  const q = useMetrica('S8', filtros)
  const d = q.dados
  return (
    <CartaoComplementar
      id="S8"
      q={q}
      baseVariante={d?.total.status === 'ok' ? 'ok' : 'insuficiente'}
      leitura={
        d
          ? `${textoTaxa(d.total)} dos incidentes abertos no período são reincidentes (chamado com ticket anterior informado no campo de reincidência).`
          : undefined
      }
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          <Barras
            descricao="Taxa de reincidência de incidentes por mês, pelo mês de abertura"
            unidade="% reincidentes"
            semLegenda
            formatar={(v) => fmtPct(v, 1)}
            categorias={r.meses.map((m) => ({
              rotulo: fmtMes(m.mes),
              emAndamento: m.emAndamento,
              valores: { taxa: m.taxa.status === 'ok' ? m.taxa.pct : null },
            }))}
            series={[{ chave: 'taxa', rotulo: '% reincidentes' }]}
            referencias={[
              { valor: r.metaMaxPct, rotulo: `Referência: abaixo de ${fmtPct(r.metaMaxPct)}` },
            ]}
          />
          {r.cobertura.n < r.cobertura.total && (
            <p className="text-sm text-atencao" data-testid="cobertura-S8">
              Campo preenchido em {fmtInteiro(r.cobertura.n)} de {fmtInteiro(r.cobertura.total)}{' '}
              chamados. A taxa considera só o que foi informado.
            </p>
          )}
          {r.total.status === 'ok' ? (
            <StatusMeta
              status={r.statusMeta}
              texto={r.statusMeta === 'dentro' ? 'Abaixo de 5%' : 'Acima de 5%'}
            />
          ) : (
            <AmostraInsuficiente n={r.total.n} codigo="S8" oQue="A taxa de reincidência" />
          )}
        </div>
      )}
    </CartaoComplementar>
  )
}

/** S9: tempo em pendência por motivo (horas úteis) e cumprimento da previsão de retorno. */
export function CartaoS9({ filtros }: P) {
  const q = useMetrica('S9', filtros)
  const d = q.dados
  const ok = d?.porMotivo.filter((m) => m.estatistica.status === 'ok') ?? []
  return (
    <CartaoComplementar
      id="S9"
      q={q}
      semTabela
      periodo={filtros.periodo}
      janelaPercentis={d?.janelaPercentis}
      baseVariante={ok.length === 0 ? 'insuficiente' : 'ok'}
      leitura={
        d
          ? `Retorno dentro da previsão em ${textoTaxa(d.cumprimentoPrevisao)} das pendências com previsão. Janela de ${textoJanela(d.janelaPercentis)}.`
          : undefined
      }
    >
      {(r) => (
        <TabelaDados
          codigo="S9"
          legenda="Horas úteis em Pendente, por motivo: P50, P85 e P95"
          colunas={[
            { chave: 'm', titulo: 'Motivo' },
            { chave: 'n', titulo: 'Pendências', alinhar: 'direita' },
            { chave: 'p50', titulo: 'P50', alinhar: 'direita' },
            { chave: 'p85', titulo: 'P85', alinhar: 'direita' },
            { chave: 'p95', titulo: 'P95', alinhar: 'direita' },
          ]}
          linhas={r.porMotivo.map((m) => {
            const v = m.estatistica.status === 'ok' ? m.estatistica.valor : undefined
            const c = (k: 'p50' | 'p85' | 'p95') =>
              v ? fmtHorasUteis(v[k]) : <CelulaInsuficiente />
            return { m: m.motivo, n: fmtInteiro(m.n), p50: c('p50'), p85: c('p85'), p95: c('p95') }
          })}
        />
      )}
    </CartaoComplementar>
  )
}

/** S10: fila de atribuição por prioridade (percentis, histograma e % aceito em até 15 min). */
export function CartaoS10({ filtros }: P) {
  const q = useMetrica('S10', filtros)
  const [prioridade, setPrioridade] = useState<string | null>(null)
  const d = q.dados
  const atual = d?.prioridades.find((p) => p.prioridade === prioridade) ?? d?.prioridades[0]
  const algumaOk = !!d?.prioridades.some((p) => p.estatistica.status === 'ok')
  return (
    <CartaoComplementar
      id="S10"
      q={q}
      periodo={filtros.periodo}
      janelaPercentis={d?.janelaPercentis}
      baseVariante={algumaOk ? 'ok' : 'insuficiente'}
    >
      {(r) =>
        atual && (
          <SeletorLocal
            codigo="S10"
            rotulo="Prioridade"
            valor={atual.prioridade}
            onChange={setPrioridade}
            itens={r.prioridades.map((p) => ({
              valor: p.prioridade,
              rotulo: p.prioridade,
              contagem: p.n,
              insuficiente: p.estatistica.status === 'insuficiente',
            }))}
          >
            <div className="mt-3 flex flex-col gap-3">
              {atual.estatistica.status === 'ok' ? (
                <>
                  <p className="text-sm font-medium" data-testid="percentis-S10">
                    P50 {fmtTempoPrioridade(atual.estatistica.valor.p50, atual.prioridade)} · P85{' '}
                    {fmtTempoPrioridade(atual.estatistica.valor.p85, atual.prioridade)} · P95{' '}
                    {fmtTempoPrioridade(atual.estatistica.valor.p95, atual.prioridade)}
                  </p>
                  {atual.histograma && (
                    <Histograma
                      faixas={atual.histograma}
                      unidadeX="horas úteis"
                      unidadeY="chamados"
                      descricao={`Horas úteis em Aguardando atribuição, ${atual.prioridade}`}
                    />
                  )}
                </>
              ) : (
                <AmostraInsuficiente n={atual.n} codigo="S10" oQue="Percentis e histograma" />
              )}
              <p className="text-sm">
                Aceitos em até 15 minutos: {textoTaxa(atual.aceitosEm15min)}.
              </p>
            </div>
          </SeletorLocal>
        )
      }
    </CartaoComplementar>
  )
}

/** S11: avaliação de Problema em P1, P2 e encerrados por contorno. */
export function CartaoS11({ filtros }: P) {
  const q = useMetrica('S11', filtros)
  const d = q.dados
  const celula = (t: Parameters<typeof textoTaxa>[0]) =>
    t.status === 'ok' ? textoTaxa(t) : `${fmtInteiro(t.k)} de ${fmtInteiro(t.n)}`
  return (
    <CartaoComplementar
      id="S11"
      q={q}
      semTabela
      baseVariante={d?.escopo.status === 'ok' ? 'ok' : 'insuficiente'}
      leitura={
        d
          ? `${textoTaxa(d.escopo)} dos chamados P1, P2 e encerrados por contorno têm avaliação de Problema.`
          : undefined
      }
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          <TabelaDados
            codigo="S11"
            legenda="Chamados com avaliação de Problema registrada, por grupo (os grupos se sobrepõem)"
            colunas={[
              { chave: 'g', titulo: 'Grupo' },
              { chave: 't', titulo: 'Com avaliação', alinhar: 'direita' },
            ]}
            linhas={[
              ...r.porGrupo.map((g) => ({
                g: g.grupo === 'Contorno' ? 'Encerrados por contorno' : g.grupo,
                t: celula(g.taxa),
              })),
              { g: 'Avaliações que viraram Registro de Problema', t: celula(r.conversao) },
            ]}
          />
          <Leia>
            Um chamado pode estar em mais de um grupo; o total do escopo conta cada um uma vez.
          </Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}

type R12 = NonNullable<ReturnType<typeof useMetrica<'S12'>>['dados']>

const totaisPorSistema = (d: R12): [string, number][] => {
  const totais = new Map<string, number>()
  for (const m of d.meses)
    for (const x of m.porSistema) totais.set(x.sistema, (totais.get(x.sistema) ?? 0) + x.n)
  return [...totais.entries()].sort((a, b) => b[1] - a[1])
}

const leituraS12 = (d: R12, [sistema, n]: [string, number]) =>
  `${sistema} é o sistema com mais chamados no período: ${fmtInteiro(n)}. Exceção de SLA por registro posterior: ${textoTaxa(d.excecaoSla)}.`

/** S12: volume por sistema, reincidência e exceção de SLA por registro posterior. */
export function CartaoS12({ filtros }: P) {
  const q = useMetrica('S12', filtros)
  const d = q.dados
  const ordenados = d ? totaisPorSistema(d) : []
  return (
    <CartaoComplementar
      id="S12"
      q={q}
      leitura={d && ordenados[0] ? leituraS12(d, ordenados[0]) : undefined}
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          <Barras
            descricao="Chamados por sistema no período (soma dos meses)"
            orientacao="horizontal"
            unidade="chamados"
            semLegenda
            larguraRotulos={140}
            categorias={ordenados.map(([sistema, n]) => ({ rotulo: sistema, valores: { n } }))}
            series={[{ chave: 'n', rotulo: 'Chamados' }]}
          />
          <TabelaDados
            codigo="S12-reincidencia"
            legenda={`Reincidência por sistema nas últimas ${fmtInteiro(r.parametros.janelaSemanas)} semanas`}
            vazio="Nenhum chamado na janela."
            colunas={[
              { chave: 's', titulo: 'Sistema' },
              { chave: 'n', titulo: 'Chamados', alinhar: 'direita' },
              { chave: 'r', titulo: 'Reincidentes', alinhar: 'direita' },
              { chave: 'p', titulo: 'Proporção', alinhar: 'direita' },
            ]}
            linhas={r.reincidencia.map((x) => ({
              s: x.sistema,
              n: fmtInteiro(x.chamados),
              r: fmtInteiro(x.reincidentes),
              p: textoTaxa(x.proporcao),
            }))}
          />
          <Leia>
            Por sistema, nunca por pessoa. Reincidente é o chamado com ticket anterior informado.
          </Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}
