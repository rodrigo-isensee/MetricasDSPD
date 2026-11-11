import { useState, type CSSProperties } from 'react'
import {
  TIPOS_FILTRO,
  type TipoFiltro,
  type FiltrosFluxo,
  type ResultadoT10,
  type ResultadoT12,
  type ResultadoT13,
  type ResultadoT14,
} from '@metricas-dspd/contratos'
import { Icone, SeletorLocal, TabelaDados } from '@/components/ui'
import { useMetrica, type MetricaQuery } from '@/data'
import { fmtInteiro, fmtNumero, plural } from '@/lib/formatar'
import { textoTaxa } from '@/features/painel/propsCartao'
import { CartaoComplementar } from './CartaoComplementar'
import { Leia } from './comuns'

interface P {
  filtros: FiltrosFluxo
}

const num = (n: number) => fmtNumero(n, n % 1 === 0 ? 0 : 1)
const dias = (n: number) => `${num(n)} ${plural(n, 'dia útil', 'dias úteis')}`
const SEM_AMOSTRA = '— amostra insuficiente'
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** Estado "sem itens" com texto próprio do cartão: o cartão segue em `ok` e o corpo diz o que falta. */
const comoOk = <R,>(q: MetricaQuery<R>, quando: boolean): MetricaQuery<R> =>
  quando && q.estado === 'vazio' ? { ...q, estado: 'ok' } : q

function AvisoInfo({ children, testid }: { children: React.ReactNode; testid: string }) {
  return (
    <p
      className="inline-flex items-center gap-1 rounded-md border border-borda bg-superficie-2 p-2 text-sm text-texto-2"
      data-testid={testid}
    >
      <Icone nome="info" className="size-4" />
      {children}
    </p>
  )
}

/* ---------------------------------------------------------------- T10 */

function leituraT10(d: ResultadoT10): string | undefined {
  if (d.fornecedores.length === 0) return undefined
  const f = d.fornecedores.find((x) => x.duracao.status === 'ok')
  const resposta =
    f && f.duracao.status === 'ok'
      ? ` ${f.fornecedor} respondeu em até ${dias(f.duracao.valor.p85)} em 85% dos casos.`
      : ''
  return `Os bloqueios por fornecedor somaram ${dias(d.totalDiasUteis)} no período.${resposta} Prazo contratado não informado.`
}

/** T10: uma linha por fornecedor, como vem da API (nome já normalizado e em ordem alfabética, B11-001 e CA-11). */
export function CartaoT10({ filtros }: P) {
  const q0 = useMetrica('T10', filtros)
  const q = comoOk(q0, true)
  const d = q.dados
  return (
    <CartaoComplementar
      id="T10"
      q={q}
      semTabela
      baseVariante="censo"
      periodo={filtros.periodo}
      className="lg:col-span-12"
      leitura={d ? leituraT10(d) : undefined}
    >
      {(r) => {
        // Escala das barras: o maior P85 (piso 1 para nunca dividir por zero).
        const maior = r.fornecedores.reduce(
          (m, f) => (f.duracao.status === 'ok' ? Math.max(m, f.duracao.valor.p85) : m),
          1,
        )
        if (r.fornecedores.length === 0)
          return (
            <div className="flex flex-col gap-3">
              <AvisoInfo testid="t10-sem-fornecedor">
                Nenhum bloqueio por fornecedor no período.
              </AvisoInfo>
              <Leia>Prazo contratado não informado.</Leia>
            </div>
          )
        return (
          <div className="flex flex-col gap-3">
            <TabelaDados
              codigo="T10"
              legenda="Bloqueios por fornecedor, em ordem alfabética: contagem, dias úteis somados e duração P50 e P85"
              colunas={[
                { chave: 'f', titulo: 'Fornecedor' },
                { chave: 'b', titulo: 'Bloqueios', alinhar: 'direita' },
                { chave: 'd', titulo: 'Dias úteis somados', alinhar: 'direita' },
                { chave: 'p', titulo: 'Duração (P50 e P85)' },
              ]}
              linhas={r.fornecedores.map((f) => ({
                f: f.fornecedor,
                b: fmtInteiro(f.bloqueios),
                d: fmtNumero(f.diasUteis, f.diasUteis % 1 === 0 ? 0 : 1),
                p:
                  f.duracao.status === 'ok' ? (
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="relative block h-3 w-40 rounded bg-superficie-2"
                      >
                        <span
                          className="absolute inset-y-0 left-0 rounded"
                          style={{
                            width: `${(f.duracao.valor.p85 / maior) * 100}%`,
                            background: 'var(--serie-1)',
                          }}
                        />
                        <span
                          className="absolute inset-y-[-2px] w-0.5 bg-texto"
                          style={{
                            left: `${(f.duracao.valor.p50 / maior) * 100}%`,
                          }}
                        />
                      </span>
                      <span>
                        P50 {fmtNumero(f.duracao.valor.p50)} · P85 {fmtNumero(f.duracao.valor.p85)}{' '}
                        dias úteis
                      </span>
                    </div>
                  ) : (
                    SEM_AMOSTRA
                  ),
              }))}
            />
            <Leia>
              Prazo contratado não informado. P50 e P85 só com 20 bloqueios ou mais no fornecedor,
              na janela de 12 semanas; a contagem e a soma seguem o período do painel. A barra vai
              até o P85 e a marca indica o P50. Leia junto com os bloqueados agora e os acordos e
              vencidos (O12).
            </Leia>
          </div>
        )
      }}
    </CartaoComplementar>
  )
}

/* ---------------------------------------------------------------- T11 */

/** Listras do mês corrente (em andamento), sobre a rampa da célula. */
const LISTRADO: CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(45deg, transparent 0 4px, color-mix(in srgb, var(--texto) 25%, transparent) 4px 6px)',
}

/** T11: mapa de calor mês × ano da chegada; um tipo por vez, ou todos (o tipo vira filtro da consulta). */
export function CartaoT11({ filtros }: P) {
  const [tipo, setTipo] = useState<TipoFiltro | ''>('')
  const q0 = useMetrica('T11', tipo ? { ...filtros, tipo: [tipo] } : filtros)
  // Com um tipo escolhido e sem pedidos, o seletor precisa continuar na tela: o cartão não vira "vazio".
  const q = comoOk(q0, tipo !== '')
  const d = q.dados
  const filtroDeTipo = filtros.tipo.length > 0
  return (
    <CartaoComplementar
      id="T11"
      q={q}
      semTabela
      baseVariante="censo"
      aplicaveis={['equipe', 'tipo', 'sistema']}
      className="lg:col-span-12"
      leitura={
        d && d.mediaMensal !== null
          ? `Média mensal de referência: ${fmtNumero(d.mediaMensal)} pedidos por mês, em ${fmtInteiro(d.mesesComDado)} ${plural(d.mesesComDado, 'mês fechado', 'meses fechados')}. O mapa mostra todos os meses.`
          : undefined
      }
    >
      {(r) => {
        const todos = r.anos.flatMap((a) => a.meses.flatMap((m) => m.entradas ?? 0))
        const max = todos.reduce((m, v) => Math.max(m, v), 1)
        const nivel = (v: number) => (v === 0 ? 0 : (Math.ceil((v / max) * 5) as 1 | 2 | 3 | 4 | 5))
        const mapa = (
          <div className="flex flex-col gap-3">
            {r.historicoCurto && (
              <AvisoInfo testid="t11-historico-curto">
                Com menos de dois anos, ainda não dá para separar padrão de acaso.
              </AvisoInfo>
            )}
            <div
              role="region"
              aria-label="Tabela de pedidos que chegaram por mês e ano, role para os lados"
              tabIndex={0}
              className="max-w-full overflow-x-auto rounded-md border border-borda"
              data-testid="tabela-T11"
            >
              <table className="w-full min-w-max border-collapse text-sm">
                <caption className="px-3 py-2 text-left text-xs text-texto-2">
                  Pedidos que chegaram por mês e ano; o mês em andamento é parcial
                </caption>
                <thead className="bg-superficie-2">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left font-semibold">
                      Ano
                    </th>
                    {MESES.map((m) => (
                      <th key={m} scope="col" className="px-3 py-2 text-right font-semibold">
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {r.anos.map((a) => (
                    <tr key={a.ano} className="border-t border-borda">
                      <th scope="row" className="px-3 py-2 text-left font-medium">
                        {a.ano}
                      </th>
                      {MESES.map((nome, i) => {
                        const m = a.meses.find((x) => x.mes === i + 1)
                        if (!m || m.entradas === null)
                          return (
                            <td
                              key={nome}
                              className="px-3 py-2 text-right text-texto-2"
                              aria-label={`${nome} de ${a.ano}: sem dado`}
                            >
                              —
                            </td>
                          )
                        const n = nivel(m.entradas)
                        return (
                          <td
                            key={nome}
                            className="px-3 py-2 text-right font-semibold tabular-nums"
                            style={{
                              ...(n === 0
                                ? {}
                                : {
                                    background: `var(--rampa-${n})`,
                                    color: `var(--rampa-${n}-fg)`,
                                  }),
                              ...(m.emAndamento ? LISTRADO : {}),
                            }}
                            data-em-andamento={m.emAndamento ? 'sim' : undefined}
                          >
                            {fmtInteiro(m.entradas)}
                            {m.emAndamento && (
                              <span className="block text-xs font-normal">em andamento</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Leia>
              Contagem de demandas criadas por mês, nos 24 meses fechados mais o corrente. O filtro
              de período não se aplica. A média mensal é só referência de contagem. Leia junto com
              demanda × capacidade (T4) e a previsão probabilística (T6).
            </Leia>
          </div>
        )
        return filtroDeTipo ? (
          mapa
        ) : (
          <SeletorLocal
            codigo="T11"
            rotulo="Tipo de demanda"
            valor={tipo}
            onChange={(v) => setTipo(v as TipoFiltro | '')}
            anuncio={tipo ? `Tipo ${tipo}.` : 'Todos os tipos.'}
            itens={[
              { valor: '', rotulo: 'Todos os tipos' },
              ...TIPOS_FILTRO.map((t) => ({ valor: t, rotulo: t })),
            ]}
          >
            <div className="mt-3">{mapa}</div>
          </SeletorLocal>
        )
      }}
    </CartaoComplementar>
  )
}

/* ---------------------------------------------------------------- T12 */

const COR_SEM = { background: 'var(--serie-1)' } as const
const COR_COM = {
  background:
    'repeating-linear-gradient(45deg, var(--serie-2) 0 2px, transparent 2px 5px), repeating-linear-gradient(-45deg, var(--serie-2) 0 2px, transparent 2px 5px)',
} as const

function leituraT12(d: ResultadoT12): string | undefined {
  const geral =
    d.total.status === 'ok'
      ? `${fmtNumero(d.total.pct, 0)}% das demandas do período precisaram de ida e volta antes de começar.`
      : `${fmtInteiro(d.total.k)} de ${fmtInteiro(d.total.n)} demandas do período precisaram de ida e volta antes de começar.`
  const a = d.areas[0]
  return a
    ? `${geral} Na área ${a.area}, ${fmtInteiro(a.taxa.k)} de ${fmtInteiro(a.taxa.n)}.`
    : geral
}

/** T12: por área solicitante, em ordem de volume (a ordem da API), "com ida e volta" × "sem" com k de n. */
export function CartaoT12({ filtros }: P) {
  const q = useMetrica('T12', filtros)
  const d = q.dados
  return (
    <CartaoComplementar
      id="T12"
      q={q}
      semTabela
      baseVariante={d?.total.status === 'ok' ? 'ok' : 'insuficiente'}
      className="lg:col-span-6"
      leitura={d ? leituraT12(d) : undefined}
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          <ul className="flex flex-wrap gap-3 text-sm" aria-label="Legenda das barras">
            <li>Sem ida e volta: sólido</li>
            <li>Com ida e volta: hachura cruzada</li>
          </ul>
          <ul className="m-0 flex list-none flex-col gap-3 p-0" data-testid="t12-areas">
            {r.areas.map((a) => (
              <li key={a.area} className="flex flex-col gap-1">
                <span className="text-sm font-medium">{a.area}</span>
                {a.taxa.status === 'ok' ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="flex h-4 w-full max-w-md gap-px overflow-hidden rounded"
                    >
                      <span style={{ ...COR_SEM, flexGrow: a.taxa.n - a.taxa.k }} />
                      <span style={{ ...COR_COM, flexGrow: a.taxa.k }} />
                    </span>
                    <span className="text-sm text-texto-2">
                      {fmtInteiro(a.taxa.k)} de {fmtInteiro(a.taxa.n)} com ida e volta (
                      {textoTaxa(a.taxa)})
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-texto-2">
                    {fmtInteiro(a.taxa.k)} de {fmtInteiro(a.taxa.n)} com ida e volta (percentual não
                    publicado, menos de 20)
                  </span>
                )}
              </li>
            ))}
          </ul>
          <TabelaDados
            codigo="T12"
            legenda="Demandas com ida e volta por área solicitante, em ordem de volume"
            colunas={[
              { chave: 'a', titulo: 'Área solicitante' },
              { chave: 'k', titulo: 'Com ida e volta', alinhar: 'direita' },
              { chave: 'n', titulo: 'Demandas', alinhar: 'direita' },
              { chave: 'p', titulo: 'Percentual', alinhar: 'direita' },
            ]}
            linhas={r.areas.map((a) => ({
              a: a.area,
              k: fmtInteiro(a.taxa.k),
              n: fmtInteiro(a.taxa.n),
              p: a.taxa.status === 'ok' ? textoTaxa(a.taxa) : '— menos de 20',
            }))}
          />
          <Leia>
            Mede a clareza do pedido que chega, para combinar com a área o que um pedido precisa
            trazer. Não é nota da área. Leia junto com a origem da demanda (O14) e a composição do
            backlog (O11).
          </Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}

/* ---------------------------------------------------------------- T13 */

type Gran = 'story' | 'frente'
const ROTULO_GRAN: Record<Gran, string> = { story: 'Demandas', frente: 'Frentes' }
const SUBSTANTIVO_GRAN: Record<Gran, string> = { story: 'demandas', frente: 'frentes' }

const GRUPO_ABAIXO: Record<'com' | 'sem' | 'ambos', string> = {
  com: 'o grupo com dependência tem',
  sem: 'o grupo sem dependência tem',
  ambos: 'os dois grupos, com e sem dependência, têm',
}

function leituraT13(d: ResultadoT13, g: Gran): string | undefined {
  const b = d.porGranularidade.find((x) => x.granularidade === g)
  if (!b || b.entregas.n === 0) return undefined
  const nome = SUBSTANTIVO_GRAN[g]
  const parte1 =
    b.entregas.status === 'ok'
      ? `${fmtNumero(b.entregas.pct, 0)}% das ${nome} entregues dependeram de trabalho de outro quadro.`
      : `${fmtInteiro(b.entregas.k)} de ${fmtInteiro(b.entregas.n)} ${nome} entregues dependeram de trabalho de outro quadro.`
  const c = b.comparacoes.find((x) => x.com.status === 'ok' && x.sem.status === 'ok')
  const parte2 =
    c && c.com.status === 'ok' && c.sem.status === 'ok'
      ? ` Em ${c.tipo}, essas tiveram P85 de ${dias(c.com.valor.p85)}, contra ${num(c.sem.valor.p85)} das que não dependeram.`
      : ''
  return parte1 + parte2
}

/** T13: uma granularidade por vez (demandas ou frentes), nunca juntas; o par com × sem é por tipo. */
export function CartaoT13({ filtros }: P) {
  const q = useMetrica('T13', filtros)
  const [gran, setGran] = useState<Gran>('story')
  const [tipo, setTipo] = useState<string | null>(null)
  const d = q.dados
  const b0 = d?.porGranularidade.find((x) => x.granularidade === gran)
  return (
    <CartaoComplementar
      id="T13"
      q={q}
      semTabela
      baseVariante={b0?.entregas.status === 'ok' ? 'ok' : 'insuficiente'}
      baseDoCartao={(x) => {
        const bg = x.porGranularidade.find((y) => y.granularidade === gran)
        if (!bg || bg.entregas.status === 'ok' || gran === 'story') return x.base
        // Em Frentes o selo de insuficiência usa o n das frentes, nunca o das demandas (L2T-001).
        const { complemento: _c, ...resto } = x.base
        return { ...resto, n: bg.entregas.n, unidade: SUBSTANTIVO_GRAN[gran] }
      }}
      className="lg:col-span-6"
      leitura={d ? leituraT13(d, gran) : undefined}
    >
      {(r) => {
        const b = r.porGranularidade.find((x) => x.granularidade === gran)
        const grans = r.porGranularidade.map((x) => x.granularidade)
        const nome = SUBSTANTIVO_GRAN[gran]
        const tiposC = b?.comparacoes.map((c) => c.tipo) ?? []
        const atual = tipo && tiposC.includes(tipo as never) ? tipo : (tiposC[0] ?? null)
        const comp = b?.comparacoes.find((c) => c.tipo === atual)
        const par = comp ? (
          <div className="flex flex-col gap-2" data-testid="t13-par">
            {comp.com.status === 'ok' && comp.sem.status === 'ok' ? (
              <TabelaDados
                codigo="T13"
                legenda={`Lead time (dias úteis) das ${nome} entregues do tipo ${comp.tipo}, com × sem dependência`}
                colunas={[
                  { chave: 'g', titulo: 'Grupo' },
                  { chave: 'n', titulo: 'Entregas', alinhar: 'direita' },
                  { chave: 'p50', titulo: 'P50', alinhar: 'direita' },
                  { chave: 'p85', titulo: 'P85', alinhar: 'direita' },
                ]}
                linhas={[
                  {
                    g: 'Com dependência',
                    n: fmtInteiro(comp.com.n),
                    p50: fmtNumero(comp.com.valor.p50),
                    p85: fmtNumero(comp.com.valor.p85),
                  },
                  {
                    g: 'Sem dependência',
                    n: fmtInteiro(comp.sem.n),
                    p50: fmtNumero(comp.sem.valor.p50),
                    p85: fmtNumero(comp.sem.valor.p85),
                  },
                ]}
              />
            ) : (
              <AvisoInfo testid="t13-par-insuficiente">
                Comparação não exibida em {comp.tipo}:{' '}
                {GRUPO_ABAIXO[comp.grupoAbaixoDoMinimo ?? 'ambos']} menos de 20 itens no tipo.
              </AvisoInfo>
            )}
          </div>
        ) : (
          <AvisoInfo testid="t13-sem-par">
            Nenhum tipo com entregas para comparar com e sem dependência.
          </AvisoInfo>
        )
        const corpo = b && (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-base font-semibold" data-testid="t13-destaque">
              {b.entregas.status === 'ok'
                ? `${fmtInteiro(b.entregas.k)} de ${fmtInteiro(b.entregas.n)} entregas (${fmtNumero(b.entregas.pct, 0)}%) dependeram de outro quadro`
                : `${fmtInteiro(b.entregas.k)} de ${fmtInteiro(b.entregas.n)} entregas dependeram de outro quadro (percentual não publicado, menos de 20)`}
            </p>
            {b.semDado > 0 && (
              <AvisoInfo testid="t13-sem-dado">
                {fmtInteiro(b.semDado)} {plural(b.semDado, 'entrega', 'entregas')} com o quadro do
                vínculo desconhecido ficam à parte; não contam como "não dependeu".
              </AvisoInfo>
            )}
            {tiposC.length > 1 && comp ? (
              <SeletorLocal
                codigo="T13-tipo"
                rotulo="Tipo de demanda"
                valor={comp.tipo}
                onChange={setTipo}
                itens={tiposC.map((t) => ({ valor: t, rotulo: t }))}
              >
                <div className="mt-2">{par}</div>
              </SeletorLocal>
            ) : (
              par
            )}
          </div>
        )
        return (
          <div className="flex flex-col gap-3">
            {grans.length > 1 ? (
              <SeletorLocal
                codigo="T13"
                rotulo="Contar"
                valor={gran}
                onChange={(v) => {
                  setGran(v as Gran)
                  setTipo(null)
                }}
                anuncio={`Contando ${SUBSTANTIVO_GRAN[gran]}.`}
                itens={grans.map((g) => ({ valor: g, rotulo: ROTULO_GRAN[g] }))}
              >
                {corpo}
              </SeletorLocal>
            ) : (
              corpo
            )}
            <Leia>
              Só conta o vínculo predecessor com card de outro quadro; pai/filho e relacionado ficam
              fora. O outro quadro não é identificado. Leia junto com o lead time ponta a ponta
              (T1).
            </Leia>
          </div>
        )
      }}
    </CartaoComplementar>
  )
}

/* ---------------------------------------------------------------- T14 */

function leituraT14(b: ResultadoT14['porGranularidade'][number], g: Gran): string | undefined {
  // K-130: o total do bloco soma só os projetos visíveis (o oculto nunca entra), então pode ser escrito.
  if (b.total.n === 0) return undefined
  const nome = SUBSTANTIVO_GRAN[g]
  const parte1 =
    b.total.status === 'ok'
      ? `${fmtInteiro(b.total.k)} de ${fmtInteiro(b.total.n)} ${nome} com time informado (${fmtNumero(b.total.pct, 0)}%) são do meu time.`
      : `${fmtInteiro(b.total.k)} de ${fmtInteiro(b.total.n)} ${nome} com time informado são do meu time.`
  const menor = b.projetos
    .flatMap((p) =>
      !p.oculto && p.meuTime.status === 'ok' ? [{ codigo: p.codigo, t: p.meuTime }] : [],
    )
    .sort((x, y) => x.t.pct - y.t.pct)[0]
  const parte2 = menor
    ? ` No ${menor.codigo}, ${fmtInteiro(menor.t.k)} de ${fmtInteiro(menor.t.n)} (${fmtNumero(menor.t.pct, 0)}%) são do meu time.`
    : ''
  return parte1 + parte2
}

/** T14: participação do meu time em cada projeto. Equipe obrigatória; nunca nomeia nem ordena outros times. */
export function CartaoT14({ filtros }: P) {
  const q0 = useMetrica('T14', filtros)
  const [gran, setGran] = useState<Gran>('story')
  const d0 = q0.dados
  // Sem equipe a API devolve base 0 (estado "vazio" do cartão); aqui o corpo diz o que fazer (CA-28).
  const q = comoOk(q0, d0?.semEquipe === true)
  const d = q.dados
  const b0 = d?.porGranularidade.find((x) => x.granularidade === gran)
  return (
    <CartaoComplementar
      id="T14"
      q={q}
      semTabela
      baseVariante="censo"
      // A base soma só os projetos visíveis (K-130): pode aparecer mesmo com projeto oculto.
      semBase={d?.semEquipe === true}
      className="lg:col-span-12"
      leitura={b0 ? leituraT14(b0, gran) : undefined}
    >
      {(r) => {
        if (r.semEquipe)
          return (
            <AvisoInfo testid="t14-sem-equipe">
              Escolha uma equipe para ver a participação do meu time.
            </AvisoInfo>
          )
        const b = r.porGranularidade.find((x) => x.granularidade === gran)
        const grans = r.porGranularidade.map((x) => x.granularidade)
        const corpo = b && (
          <div className="mt-3 flex flex-col gap-3">
            <p
              className="inline-flex items-center gap-1 text-sm font-semibold text-texto"
              data-testid="t14-selo"
            >
              <Icone nome="info" className="size-4" />
              Só mostra meu time e os outros somados. Não compara times.
            </p>
            {b.projetos.some((p) => p.oculto) && (
              <AvisoInfo testid="t14-oculto">
                O total não inclui projetos com outros times ocultos. Neles só a parte do meu time é
                mostrada.
              </AvisoInfo>
            )}
            <ul className="flex flex-wrap gap-3 text-sm" aria-label="Legenda das barras">
              <li>Meu time: sólido</li>
              <li>Outros times (somados): hachura</li>
              <li>Sem time informado: contorno</li>
            </ul>
            {b.projetos.length === 0 ? (
              <AvisoInfo testid="t14-sem-projetos">
                Nenhum projeto em andamento no período para esta equipe.
              </AvisoInfo>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-4 p-0" data-testid="t14-projetos">
                {b.projetos.map((p) => (
                  <li key={p.projetoId} className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      {p.codigo} {p.titulo}
                    </span>
                    {p.oculto ? (
                      <span className="text-sm text-texto-2" data-testid={`t14-fatia-${p.codigo}`}>
                        Meu time: {fmtInteiro(p.meuTime.k)}{' '}
                        {gran === 'story'
                          ? plural(p.meuTime.k, 'demanda', 'demandas')
                          : plural(p.meuTime.k, 'frente', 'frentes')}
                      </span>
                    ) : (
                      <>
                        <span
                          aria-hidden="true"
                          className="flex h-4 w-full max-w-md gap-px overflow-hidden rounded"
                        >
                          <span style={{ ...COR_SEM, flexGrow: p.meuTime.k }} />
                          <span
                            style={{
                              background:
                                'repeating-linear-gradient(45deg, var(--serie-2) 0 2px, transparent 2px 5px)',
                              flexGrow: p.outrosTimes,
                            }}
                          />
                          <span
                            style={{ border: '1px solid var(--texto-2)', flexGrow: p.semTime }}
                          />
                        </span>
                        <span className="text-sm text-texto-2">
                          {p.meuTime.status === 'ok'
                            ? `${fmtInteiro(p.meuTime.k)} de ${fmtInteiro(p.meuTime.n)} (${textoTaxa(p.meuTime)}) meu time`
                            : `${fmtInteiro(p.meuTime.k)} de ${fmtInteiro(p.meuTime.n)} meu time (percentual não publicado, menos de 20)`}
                          {p.semTime > 0 && ` · ${fmtInteiro(p.semTime)} sem time informado`}
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <TabelaDados
              codigo="T14"
              legenda={`Participação do meu time por projeto (${SUBSTANTIVO_GRAN[gran]}), na ordem da API (projetos com outros times ocultos ao fim)`}
              colunas={[
                { chave: 'p', titulo: 'Projeto' },
                { chave: 'm', titulo: 'Meu time', alinhar: 'direita' },
                { chave: 'o', titulo: 'Outros times (somados)', alinhar: 'direita' },
                { chave: 's', titulo: 'Sem time informado', alinhar: 'direita' },
                { chave: 'x', titulo: 'Participação do meu time', alinhar: 'direita' },
              ]}
              linhas={b.projetos.map((p) =>
                p.oculto
                  ? {
                      p: `${p.codigo} ${p.titulo}`,
                      m: fmtInteiro(p.meuTime.k),
                      o: 'não exibido',
                      s: 'não exibido',
                      x: 'não exibido',
                    }
                  : {
                      p: `${p.codigo} ${p.titulo}`,
                      m: fmtInteiro(p.meuTime.k),
                      o: fmtInteiro(p.outrosTimes),
                      s: fmtInteiro(p.semTime),
                      x:
                        p.meuTime.status === 'ok'
                          ? textoTaxa(p.meuTime)
                          : `${fmtInteiro(p.meuTime.k)} de ${fmtInteiro(p.meuTime.n)} (percentual não publicado, menos de 20)`,
                    },
              )}
            />
          </div>
        )
        return (
          <div className="flex flex-col gap-3">
            {grans.length > 1 ? (
              <SeletorLocal
                codigo="T14"
                rotulo="Contar"
                valor={gran}
                onChange={(v) => setGran(v as Gran)}
                anuncio={`Contando ${SUBSTANTIVO_GRAN[gran]}.`}
                itens={grans.map((g) => ({ valor: g, rotulo: ROTULO_GRAN[g] }))}
              >
                {corpo}
              </SeletorLocal>
            ) : (
              corpo
            )}
            <Leia>
              Mostra a parte do projeto que é do meu time, para entender a cobrança por entregas em
              que atuo pouco. Não é nota do time nem comparação. Leia junto com as dependências
              entre quadros (T13) e o avanço real e escopo (T9).
            </Leia>
          </div>
        )
      }}
    </CartaoComplementar>
  )
}
