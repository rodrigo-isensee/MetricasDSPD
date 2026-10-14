import { useId, useState } from 'react'
import type { MarcacaoCriterio } from '@metricas-dspd/contratos'
import { GraficoMensal } from '@/components/charts'
import { Botao, TabelaDados } from '@/components/ui'
import { fmtData, fmtInteiro, fmtMes } from '@/lib/formatar'
import { mesPorExtenso, type PontoMensal } from './modelo'

export interface SerieMensalProps {
  /** Âncora e prefixo dos `data-testid` (`tendencia-fluxo-p85`). */
  id: string
  titulo: string
  /** Como o ponto é calculado, sempre escrito ("janela de 12 semanas até o fim do mês"). */
  subtitulo?: string
  unidade: string
  /** `linha` para estatística (ponto sem valor = marcador vazado, sem linha); `barras` para contagem (zero na base). */
  forma: 'linha' | 'barras'
  pontos: readonly PontoMensal[]
  marcacoes: readonly MarcacaoCriterio[]
  frase: string
  /** Título da coluna de valor da tabela. */
  colunaValor: string
  /** Teto fixo do eixo (ex.: 5 prioridades). */
  eixoMax?: number
}

/** Posição da mudança de critério no eixo: o primeiro mês em/depois da data. */
const mesDaMarcacao = (pontos: readonly PontoMensal[], m: MarcacaoCriterio): string | null =>
  pontos.find((p) => p.mes >= m.data.slice(0, 7))?.mes ?? null

/**
 * Série mensal pequena do Resumo: gráfico (`role="img"` com resumo em texto), frase de leitura, "Ver como
 * tabela" (o equivalente acessível) e a mudança de critério (T2.6) como linha vertical rotulada com a data.
 */
export function SerieMensal({
  id,
  titulo,
  subtitulo,
  unidade,
  forma,
  pontos,
  marcacoes,
  frase,
  colunaValor,
  eixoMax,
}: SerieMensalProps) {
  const [tabela, setTabela] = useState(false)
  const idTitulo = useId()
  const publicados = pontos.filter((p) => p.valor !== null)
  const semHistorico = forma === 'linha' && publicados.length === 0
  const semValor = new Set(pontos.filter((p) => p.valor === null).map((p) => p.mes))
  const marcadas = marcacoes
    .map((m) => ({ m, mes: mesDaMarcacao(pontos, m) }))
    .filter((x): x is { m: MarcacaoCriterio; mes: string } => x.mes !== null)
  const resumo = `${titulo}. ${pontos.map((p) => `${mesPorExtenso(p.mes)}: ${p.texto}`).join('; ')}.`
  return (
    <section id={id} aria-labelledby={idTitulo} className="flex flex-col gap-2" data-testid={id}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id={idTitulo} className="text-base font-semibold">
            {titulo}
          </h3>
          {subtitulo && <p className="text-xs text-texto-2">{subtitulo}</p>}
        </div>
        {!semHistorico && pontos.length > 0 && (
          <Botao
            aria-pressed={tabela}
            onClick={() => setTabela((t) => !t)}
            data-testid={`${id}-alternar`}
            className="text-xs"
          >
            {tabela ? 'Ver como gráfico' : 'Ver como tabela'}
          </Botao>
        )}
      </div>
      {semHistorico || pontos.length === 0 ? (
        <p className="text-sm text-texto-2" data-testid={`${id}-vazio`}>
          Ainda não há histórico suficiente: nenhum dos últimos 6 meses atinge 20 itens.
        </p>
      ) : tabela ? (
        <TabelaDados
          codigo={id}
          legenda={`${titulo}, por mês`}
          colunas={[
            { chave: 'mes', titulo: 'Mês' },
            { chave: 'valor', titulo: colunaValor, alinhar: 'direita' },
            { chave: 'n', titulo: 'Base (n)', alinhar: 'direita' },
            { chave: 'situacao', titulo: 'Situação' },
          ]}
          linhas={pontos.map((p) => ({
            mes: fmtMes(p.mes),
            valor: p.valor === null ? '—' : p.texto,
            n: p.n === null ? '—' : fmtInteiro(p.n),
            situacao: p.valor === null ? `n=${fmtInteiro(p.n ?? 0)} · não publicado` : 'publicado',
          }))}
        />
      ) : (
        <figure className="m-0">
          <div
            role="img"
            aria-label={resumo}
            className="h-[200px] w-full text-xs md:h-[160px]"
            data-testid={`${id}-grafico`}
          >
            <GraficoMensal
              dados={pontos}
              forma={forma}
              unidade={unidade}
              marcas={marcadas.map(({ m, mes }) => ({ id: m.id, mes, data: m.data }))}
              {...(eixoMax !== undefined ? { eixoMax } : {})}
            />
          </div>
          <figcaption className="sr-only">{resumo}</figcaption>
        </figure>
      )}
      {frase && !semHistorico && pontos.length > 0 && (
        <p className="text-sm" data-testid={`${id}-frase`}>
          {frase}
        </p>
      )}
      {!semHistorico && semValor.size > 0 && (
        <ul className="m-0 list-none p-0 text-xs text-texto-2" data-testid={`${id}-sem-valor`}>
          {pontos
            .filter((p) => p.valor === null)
            .map((p) => (
              <li key={p.mes}>
                <span aria-hidden="true">○ </span>
                {fmtMes(p.mes)} · {p.texto}
              </li>
            ))}
        </ul>
      )}
      {marcadas.length > 0 && (
        <ul className="m-0 list-none space-y-1 p-0 text-xs text-texto-2">
          {marcadas.map(({ m }) => (
            <li key={m.id} data-testid="marcador-criterio">
              <span aria-hidden="true">⚑ </span>
              Mudança de critério em {fmtData(m.data)}: {m.descricao}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
