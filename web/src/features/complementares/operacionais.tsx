import { useState } from 'react'
import {
  JANELA_PERCENTIS_PADRAO,
  type FiltrosFluxo,
  type ResultadoO19,
  type ResultadoO20,
  type ResultadoO21,
  type ResultadoO22,
  type ResultadoO24,
  type ResultadoO25,
  type ResultadoO26,
} from '@metricas-dspd/contratos'
import { AreaEmpilhada, Barras } from '@/components/charts'
import { AmostraInsuficiente, Icone, SeletorLocal, TabelaDados } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtData, fmtDataCurta, fmtInteiro, fmtMes, fmtNumero, plural } from '@/lib/formatar'
import { textoTaxa } from '@/features/painel/propsCartao'
import { CartaoComplementar } from './CartaoComplementar'
import { Leia } from './comuns'
import { LeiaJunto } from './LeiaJunto'

/**
 * Lote 3 do pedido 011 no Operacional (O19 a O22 e O24 a O26; o O23 é um bloco do O2). Fonte única: BusinessMap.
 * Nenhum cartão mostra, filtra ou ordena por pessoa; percentil e percentual só com 20 itens (o contrato já
 * garante pelo tipo e a tela só escreve o que vem pronto); toda distribuição de tempo é por tipo, um por vez.
 */
interface P {
  filtros: FiltrosFluxo
}

const num = (n: number) => fmtNumero(n, n % 1 === 0 ? 0 : 1)
const dias = (n: number) => `${num(n)} ${plural(n, 'dia útil', 'dias úteis')}`
const SEM_AMOSTRA = '— amostra insuficiente'
const GRUPO_ABAIXO: Record<'com' | 'sem' | 'ambos', string> = {
  com: 'com retorno',
  sem: 'sem retorno',
  ambos: 'com e sem retorno',
}

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

/** Lista as mudanças de critério do período em texto (T2.6), para quem não enxerga a marca do gráfico. */
function Marcacoes({
  itens,
}: {
  itens: readonly { id: string; data: string; descricao: string }[]
}) {
  if (itens.length === 0) return null
  return (
    <ul className="m-0 list-none p-0 text-sm text-texto-2" data-testid="marcacoes-criterio">
      {itens.map((m) => (
        <li key={m.id}>
          ⚑ {fmtData(m.data)}: {m.descricao}
        </li>
      ))}
    </ul>
  )
}

/** Escolhe o tipo mostrado: o selecionado, se ainda existe, ou o primeiro. */
const tipoAtual = (escolhido: string | null, tipos: readonly string[]): string | null =>
  escolhido && tipos.includes(escolhido) ? escolhido : (tipos[0] ?? null)

function PorTipo({
  codigo,
  tipos,
  atual,
  aoEscolher,
  children,
}: {
  codigo: string
  tipos: readonly string[]
  atual: string
  aoEscolher: (t: string) => void
  children: React.ReactNode
}) {
  if (tipos.length <= 1) return <>{children}</>
  return (
    <SeletorLocal
      codigo={codigo}
      rotulo="Tipo de demanda"
      valor={atual}
      onChange={aoEscolher}
      anuncio={`Mostrando ${atual}.`}
      itens={tipos.map((t) => ({ valor: t, rotulo: t }))}
    >
      <div className="mt-2">{children}</div>
    </SeletorLocal>
  )
}

/* ---------------------------------------------------------------- O19 */

function leituraO19(d: ResultadoO19): string | undefined {
  const m = [...d.motivos].sort((a, b) => b.diasUteis - a.diasUteis)[0]
  if (!m || d.totalDiasUteis === 0) return undefined
  const pct = m.pctDoTotal.status === 'ok' ? `, ${fmtNumero(m.pctDoTotal.pct, 0)}% do total` : ''
  return `${m.motivo} somou ${dias(m.diasUteis)} de bloqueio no período${pct}.`
}

/** O19: barras por motivo (ordem por dias somados, nunca por pessoa); P50/P85 só com 20 bloqueios na causa. */
export function CartaoO19({ filtros }: P) {
  const q = useMetrica('O19', filtros)
  const d = q.dados
  return (
    <CartaoComplementar
      id="O19"
      q={q}
      baseVariante="censo"
      periodo={filtros.periodo}
      className="lg:col-span-12"
      leitura={d ? leituraO19(d) : undefined}
    >
      {(r) => {
        const motivos = [...r.motivos].sort((a, b) => b.diasUteis - a.diasUteis)
        return (
          <div className="flex flex-col gap-3">
            <Barras
              descricao="Dias úteis bloqueados por motivo, no período"
              orientacao="horizontal"
              unidade="dias úteis"
              larguraRotulos={220}
              semLegenda
              categorias={motivos.map((m) => ({
                rotulo: `${m.motivo} · ${fmtInteiro(m.bloqueios)} ${plural(m.bloqueios, 'bloqueio', 'bloqueios')}`,
                valores: { dias: m.diasUteis },
              }))}
              series={[{ chave: 'dias', rotulo: 'Dias úteis bloqueados' }]}
            />
            <TabelaDados
              codigo="O19"
              legenda="Bloqueios por causa: bloqueios, dias úteis, participação nos dias e duração P50 e P85"
              colunas={[
                { chave: 'm', titulo: 'Motivo' },
                { chave: 'b', titulo: 'Bloqueios', alinhar: 'direita' },
                { chave: 'd', titulo: 'Dias úteis', alinhar: 'direita' },
                { chave: 'p', titulo: '% dos dias úteis', alinhar: 'direita' },
                { chave: 'e', titulo: 'Duração (P50 e P85)' },
              ]}
              linhas={motivos.map((m) => ({
                m: m.motivo,
                b: fmtInteiro(m.bloqueios),
                d: num(m.diasUteis),
                p:
                  m.pctDoTotal.status === 'ok'
                    ? `${fmtNumero(m.pctDoTotal.pct, 0)}%`
                    : `— menos de 20 bloqueios`,
                e:
                  m.duracao.status === 'ok'
                    ? `P50 ${fmtNumero(m.duracao.valor.p50)} · P85 ${fmtNumero(m.duracao.valor.p85)} dias úteis`
                    : SEM_AMOSTRA,
              }))}
            />
            {r.abertosForaDaSoma > 0 && (
              <AvisoInfo testid="o19-abertos">
                {fmtInteiro(r.abertosForaDaSoma)}{' '}
                {plural(
                  r.abertosForaDaSoma,
                  'bloqueio ainda aberto não entra',
                  'bloqueios ainda abertos não entram',
                )}{' '}
                na soma; eles estão em "Bloqueados agora".
              </AvisoInfo>
            )}
            <Leia>
              A soma e a contagem valem sempre; o percentual e o P50 e P85 só saem com 20 bloqueios
              ou mais na causa.
            </Leia>
            <LeiaJunto id="o19" />
          </div>
        )
      }}
    </CartaoComplementar>
  )
}

/* ---------------------------------------------------------------- O20 */

function leituraO20(d: ResultadoO20): string | undefined {
  if (d.dias.length === 0) return undefined
  if (!d.destaque) return 'Nenhuma etapa acumulou trabalho no período.'
  const f = d.faixas.find((x) => x.chave === d.destaque?.faixa)
  const nome = f?.rotulo ?? d.destaque.faixa
  return `No período, a faixa "${nome}" cresceu de ${fmtInteiro(d.destaque.de)} para ${fmtInteiro(d.destaque.para)} itens: o acúmulo está aí.`
}

/** O20: fluxo cumulativo diário. Uma faixa por coluna (uma equipe) ou por papel ("Todas"). */
export function CartaoO20({ filtros }: P) {
  const q = useMetrica('O20', filtros)
  const d = q.dados
  return (
    <CartaoComplementar
      id="O20"
      q={q}
      baseVariante="censo"
      className="lg:col-span-12"
      leitura={d ? leituraO20(d) : undefined}
    >
      {(r) => {
        const faixas = [...r.faixas].sort((a, b) => a.ordem - b.ordem)
        return (
          <div className="flex flex-col gap-3">
            {r.dias.length === 0 ? (
              <AvisoInfo testid="o20-sem-transicao">
                Nenhuma transição de coluna no período.
              </AvisoInfo>
            ) : (
              <AreaEmpilhada
                descricao={`Itens por ${r.agrupamento === 'coluna' ? 'coluna do quadro' : 'papel da coluna'}, dia a dia`}
                unidade="itens"
                formatarX={(x) => fmtDataCurta(x)}
                series={faixas.map((f) => ({ chave: f.chave, rotulo: f.rotulo }))}
                pontos={r.dias.map((dia) => ({
                  x: dia.dia,
                  valores: Object.fromEntries(
                    faixas.map((f) => [f.chave, dia.contagens[r.faixas.indexOf(f)] ?? 0]),
                  ),
                }))}
              />
            )}
            <Marcacoes itens={r.mudancasCriterio} />
            <Leia>
              O Backlog aparece no gráfico, mas nunca é o destaque da frase: só as filas a partir do
              compromisso. Leia junto com o WIP e o limite (O1) e a entrada × saída (O7).
            </Leia>
            <LeiaJunto id="o20" />
          </div>
        )
      }}
    </CartaoComplementar>
  )
}

/* ---------------------------------------------------------------- O21 */

const destaqueTaxa = (t: ResultadoO21['entregas'], o: string) =>
  t.status === 'ok'
    ? `${fmtInteiro(t.k)} de ${fmtInteiro(t.n)} entregas (${fmtNumero(t.pct, 0)}%) ${o}`
    : `${fmtInteiro(t.k)} de ${fmtInteiro(t.n)} entregas ${o} (percentual não publicado, menos de 20)`

function leituraO21(d: ResultadoO21): string | undefined {
  if (d.entregas.n === 0) return undefined
  const maior = [...d.matriz.celulas].sort((a, b) => b.retornos - a.retornos)[0]
  const t1 =
    d.entregas.status === 'ok'
      ? `${fmtNumero(d.entregas.pct, 0)}% das entregas voltaram ao menos uma vez.`
      : `${fmtInteiro(d.entregas.k)} de ${fmtInteiro(d.entregas.n)} entregas voltaram ao menos uma vez.`
  const t2 = maior
    ? ` A volta mais comum é de "${maior.origem}" para "${maior.destino}" (${fmtInteiro(maior.retornos)} ${plural(maior.retornos, 'vez', 'vezes')}).`
    : ''
  const c = d.comparacoes.find((x) => x.com.status === 'ok' && x.sem.status === 'ok')
  const t3 =
    c && c.com.status === 'ok' && c.sem.status === 'ok'
      ? ` Em ${c.tipo}, quem volta tem P85 de ${dias(c.com.valor.p85)} contra ${num(c.sem.valor.p85)} de quem não volta.`
      : ''
  return t1 + t2 + t3
}

/** O21: destaque, matriz origem × destino só de retornos (reabertura em linha própria) e o par com × sem por tipo. */
export function CartaoO21({ filtros }: P) {
  const q = useMetrica('O21', filtros)
  const [tipo, setTipo] = useState<string | null>(null)
  const d = q.dados
  return (
    <CartaoComplementar
      id="O21"
      q={q}
      semTabela
      baseVariante={d?.entregas.status === 'ok' ? 'ok' : 'insuficiente'}
      periodo={filtros.periodo}
      className="lg:col-span-12"
      leitura={d ? leituraO21(d) : undefined}
    >
      {(r) => {
        const origens = [...new Set(r.matriz.celulas.map((c) => c.origem))]
        const destinos = [...new Set(r.matriz.celulas.map((c) => c.destino))]
        const reaberta = (o: string) => r.matriz.celulas.some((c) => c.origem === o && c.reaberto)
        const tipos = r.comparacoes.map((c) => c.tipo)
        const atual = tipoAtual(tipo, tipos)
        const comp = r.comparacoes.find((c) => c.tipo === atual)
        return (
          <div className="flex flex-col gap-3">
            <p className="text-base font-semibold" data-testid="o21-destaque">
              {destaqueTaxa(r.entregas, 'voltaram ao menos uma vez')}
            </p>
            {origens.length === 0 ? (
              <AvisoInfo testid="o21-sem-retorno">Nenhum retorno de etapa no período.</AvisoInfo>
            ) : (
              <div data-testid="o21-matriz">
                <MatrizRetornos
                  origens={origens}
                  destinos={destinos}
                  reaberta={reaberta}
                  celulas={r.matriz.celulas}
                  eixo={r.matriz.eixo}
                />
              </div>
            )}
            {r.reaberturas > 0 && (
              <p className="text-sm text-texto-2" data-testid="o21-reaberturas">
                Reaberto (volta a partir de "Entregue"): {fmtInteiro(r.reaberturas)}{' '}
                {plural(r.reaberturas, 'vez', 'vezes')}.
              </p>
            )}
            {comp ? (
              <PorTipo codigo="O21-tipo" tipos={tipos} atual={comp.tipo} aoEscolher={setTipo}>
                {comp.com.status === 'ok' && comp.sem.status === 'ok' ? (
                  <TabelaDados
                    codigo="O21"
                    legenda={`Tempo de ciclo (dias úteis) das entregas do tipo ${comp.tipo}, com × sem retorno`}
                    colunas={[
                      { chave: 'g', titulo: 'Grupo' },
                      { chave: 'n', titulo: 'Entregas', alinhar: 'direita' },
                      { chave: 'p50', titulo: 'P50', alinhar: 'direita' },
                      { chave: 'p85', titulo: 'P85', alinhar: 'direita' },
                    ]}
                    linhas={[
                      {
                        g: 'Com retorno',
                        n: fmtInteiro(comp.com.n),
                        p50: fmtNumero(comp.com.valor.p50),
                        p85: fmtNumero(comp.com.valor.p85),
                      },
                      {
                        g: 'Sem retorno',
                        n: fmtInteiro(comp.sem.n),
                        p50: fmtNumero(comp.sem.valor.p50),
                        p85: fmtNumero(comp.sem.valor.p85),
                      },
                    ]}
                  />
                ) : (
                  <div data-testid="o21-par-insuficiente" className="flex flex-col gap-2">
                    <AvisoInfo testid="o21-grupo-abaixo">
                      Comparação não exibida em {comp.tipo}: o grupo{' '}
                      {GRUPO_ABAIXO[comp.grupoAbaixoDoMinimo ?? 'ambos']} tem menos de 20 itens no
                      tipo.
                    </AvisoInfo>
                    <AmostraInsuficiente
                      n={Math.min(comp.com.n, comp.sem.n)}
                      codigo="O21"
                      oQue={`Comparação com × sem retorno em ${comp.tipo}`}
                    />
                  </div>
                )}
              </PorTipo>
            ) : (
              <AvisoInfo testid="o21-sem-par">
                Nenhum tipo com entregas para comparar com e sem retorno.
              </AvisoInfo>
            )}
            <Leia>
              Conta voltas de etapa, não quem as causou. Com "Todas" as equipes, a matriz usa o
              papel da coluna. Leia junto com a vazão de defeitos (O13) e a eficiência de fluxo
              (O5).
            </Leia>
            <LeiaJunto id="o21" />
          </div>
        )
      }}
    </CartaoComplementar>
  )
}

/** Matriz origem × destino: o NÚMERO está na célula; a linha de reabertura é rotulada em texto. */
function MatrizRetornos({
  origens,
  destinos,
  reaberta,
  celulas,
  eixo,
}: {
  origens: readonly string[]
  destinos: readonly string[]
  reaberta: (o: string) => boolean
  celulas: ResultadoO21['matriz']['celulas']
  eixo: 'coluna' | 'papel'
}) {
  const max = celulas.reduce((m, c) => Math.max(m, c.retornos), 1)
  const nivel = (v: number) => (v === 0 ? 0 : (Math.ceil((v / max) * 5) as 1 | 2 | 3 | 4 | 5))
  return (
    <div
      role="region"
      aria-label="Tabela de retornos por origem e destino, role para os lados"
      tabIndex={0}
      className="max-w-full overflow-x-auto rounded-md border border-borda"
    >
      <table className="w-full min-w-max border-collapse text-sm">
        <caption className="px-3 py-2 text-left text-xs text-texto-2">
          Retornos de etapa: de onde o item voltou (linhas) para onde (colunas), por{' '}
          {eixo === 'coluna' ? 'coluna' : 'papel da coluna'}
        </caption>
        <thead className="bg-superficie-2">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-semibold">
              Voltou de
            </th>
            {destinos.map((x) => (
              <th key={x} scope="col" className="px-3 py-2 text-right font-semibold">
                para {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {origens.map((o) => (
            <tr
              key={o}
              className={`border-t border-borda ${reaberta(o) ? 'bg-atencao-fundo' : ''}`}
            >
              <th scope="row" className="px-3 py-2 text-left font-medium">
                {o}
                {reaberta(o) && <span className="ml-1 font-semibold">(reaberto)</span>}
              </th>
              {destinos.map((x) => {
                const v = celulas.find((c) => c.origem === o && c.destino === x)?.retornos ?? 0
                return (
                  <td
                    key={x}
                    className="px-3 py-2 text-right tabular-nums"
                    style={{
                      background:
                        nivel(v) === 0
                          ? undefined
                          : `color-mix(in srgb, var(--serie-1) ${nivel(v) * 16}%, transparent)`,
                    }}
                  >
                    {fmtInteiro(v)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------------------------------------------------------- O22 */

function leituraO22(d: ResultadoO22, tipo: string | null): string | undefined {
  const b = d.porTipo.find((x) => x.tipo === tipo)
  if (!b) return undefined
  const sem = b.semToque.itens
  const t2 =
    sem > 0
      ? ` Há ${fmtInteiro(sem)} ${plural(sem, 'pedido ainda sem nenhuma reação', 'pedidos ainda sem nenhuma reação')}${
          b.semToque.maisAntigoDiasUteis !== null
            ? `, o mais antigo há ${dias(b.semToque.maisAntigoDiasUteis)}`
            : ''
        }.`
      : ''
  if (b.distribuicao.status !== 'ok')
    return `Em ${b.tipo}, só ${fmtInteiro(b.distribuicao.n)} pedidos foram tocados: o tempo até a primeira reação não é publicado.${t2}`
  return `Metade dos pedidos de ${b.tipo} recebe a primeira reação em até ${dias(b.distribuicao.valor.p50)}; 85% em até ${num(b.distribuicao.valor.p85)}.${t2}`
}

/** O22: tempo até a primeira reação humana, por tipo (um por vez), e o retrato dos pedidos ainda sem toque. */
export function CartaoO22({ filtros }: P) {
  const q = useMetrica('O22', filtros)
  const [tipo, setTipo] = useState<string | null>(null)
  const d = q.dados
  const tipos = d?.porTipo.map((t) => t.tipo) ?? []
  const atual = tipoAtual(tipo, tipos)
  const b0 = d?.porTipo.find((x) => x.tipo === atual)
  return (
    <CartaoComplementar
      id="O22"
      q={q}
      baseVariante={b0?.distribuicao.status === 'ok' ? 'ok' : 'insuficiente'}
      periodo={filtros.periodo}
      janelaPercentis={d?.base.janela && b0 ? JANELA_PERCENTIS_PADRAO : undefined}
      className="lg:col-span-12"
      leitura={d ? leituraO22(d, atual) : undefined}
    >
      {(r) => {
        const b = r.porTipo.find((x) => x.tipo === atual)
        if (!b || !atual) return null
        const dist = b.distribuicao
        return (
          <PorTipo codigo="O22" tipos={tipos} atual={atual} aoEscolher={setTipo}>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="flex flex-col gap-3 lg:col-span-8">
                  {dist.status === 'ok' && b.histograma ? (
                    <>
                      <p className="text-sm font-semibold" data-testid="o22-faixa">
                        P50 {num(dist.valor.p50)} · P85 {num(dist.valor.p85)} · P95{' '}
                        {num(dist.valor.p95)} dias úteis
                      </p>
                      <Barras
                        descricao={`Pedidos de ${atual} por tempo até a primeira reação (faixas em dias úteis)`}
                        unidade="pedidos"
                        semLegenda
                        espaco={2}
                        categorias={b.histograma.map((f) => ({
                          rotulo: f.faixa,
                          valores: { itens: f.itens },
                        }))}
                        series={[{ chave: 'itens', rotulo: 'Pedidos' }]}
                      />
                    </>
                  ) : (
                    <AmostraInsuficiente
                      n={dist.n}
                      codigo="O22"
                      oQue="Percentis e histograma do primeiro toque"
                    />
                  )}
                </div>
                <div
                  className="rounded-md border border-borda bg-superficie-2 p-3 lg:col-span-4"
                  data-testid="o22-sem-toque"
                >
                  <h4 className="text-sm font-semibold">Ainda sem toque</h4>
                  <p className="mt-1 text-sm">
                    {fmtInteiro(b.semToque.itens)}{' '}
                    {plural(b.semToque.itens, 'pedido aberto', 'pedidos abertos')} sem nenhuma
                    reação
                    {b.semToque.maisAntigoDiasUteis !== null
                      ? `; o mais antigo espera há ${dias(b.semToque.maisAntigoDiasUteis)}`
                      : ''}
                    .
                  </p>
                </div>
              </div>
              <Leia>
                Só o comentário conta como reação; mudar de coluna ou atribuir não conta. O cartão
                guarda o instante, nunca quem comentou nem o texto. Leia junto com os três relógios
                (O9) e o envelhecimento do backlog (O10).
              </Leia>
              <LeiaJunto id="o22" />
            </div>
          </PorTipo>
        )
      }}
    </CartaoComplementar>
  )
}

/* ---------------------------------------------------------------- O24 */

function leituraO24(d: ResultadoO24): string | undefined {
  if (d.inicios.n === 0) return undefined
  const t1 =
    d.inicios.status === 'ok'
      ? `${fmtNumero(d.inicios.pct, 0)}% dos inícios da classe Padrão passaram na frente de um pedido mais antigo do mesmo tipo, na fila da mesma equipe.`
      : `${fmtInteiro(d.inicios.k)} de ${fmtInteiro(d.inicios.n)} inícios da classe Padrão passaram na frente de um pedido mais antigo do mesmo tipo.`
  const c = d.custo.porTipo.find((x) => x.estatistica.status === 'ok')
  const t2 =
    c && c.estatistica.status === 'ok'
      ? ` Em ${c.tipo}, os ultrapassados esperaram, depois de ultrapassados, ${dias(c.estatistica.valor.p85)} até começar (P85).`
      : ''
  return t1 + t2
}

/** O24: ordem de chegada na classe Padrão. Mostra o custo de passar na frente, não um erro. */
export function CartaoO24({ filtros }: P) {
  const q = useMetrica('O24', filtros)
  const [tipo, setTipo] = useState<string | null>(null)
  const d = q.dados
  return (
    <CartaoComplementar
      id="O24"
      q={q}
      semTabela
      baseVariante={d?.inicios.status === 'ok' ? 'ok' : 'insuficiente'}
      periodo={filtros.periodo}
      className="lg:col-span-12"
      leitura={d ? leituraO24(d) : undefined}
    >
      {(r) => {
        const tipos = r.custo.porTipo.map((c) => c.tipo)
        const atual = tipoAtual(tipo, tipos)
        const c = r.custo.porTipo.find((x) => x.tipo === atual)
        return (
          <div className="flex flex-col gap-3">
            <p className="text-base font-semibold" data-testid="o24-destaque">
              {r.inicios.status === 'ok'
                ? `${fmtInteiro(r.inicios.k)} de ${fmtInteiro(r.inicios.n)} inícios (${fmtNumero(r.inicios.pct, 0)}%) passaram na frente de um pedido mais antigo`
                : `${fmtInteiro(r.inicios.k)} de ${fmtInteiro(r.inicios.n)} inícios passaram na frente de um pedido mais antigo (percentual não publicado, menos de 20)`}
            </p>
            <Barras
              descricao="Inícios por mês: em ordem de chegada e fora de ordem"
              modo="empilhado"
              unidade="inícios"
              categorias={r.meses.map((m) => ({
                rotulo: fmtMes(m.mes),
                emAndamento: m.emAndamento,
                valores: { emOrdem: m.emOrdem, foraDeOrdem: m.foraDeOrdem },
              }))}
              series={[
                { chave: 'emOrdem', rotulo: 'Em ordem' },
                { chave: 'foraDeOrdem', rotulo: 'Fora de ordem' },
              ]}
            />
            <Marcacoes itens={r.marcacoes} />
            {c ? (
              <PorTipo codigo="O24-tipo" tipos={tipos} atual={c.tipo} aoEscolher={setTipo}>
                {c.estatistica.status === 'ok' ? (
                  <p className="text-sm" data-testid="o24-custo">
                    Em {c.tipo}, {fmtInteiro(c.ultrapassados)}{' '}
                    {plural(c.ultrapassados, 'ultrapassado esperou', 'ultrapassados esperaram')},
                    depois de ultrapassados, P50 {num(c.estatistica.valor.p50)} e P85{' '}
                    {num(c.estatistica.valor.p85)} dias úteis até começar.
                  </p>
                ) : (
                  <AmostraInsuficiente
                    n={c.estatistica.n}
                    codigo="O24"
                    oQue={`Espera dos ultrapassados em ${c.tipo}`}
                  />
                )}
              </PorTipo>
            ) : null}
            <Leia>
              A ordem de chegada é a política da classe Padrão. Urgente, Prazo fixo e Intangível têm
              regra própria e ficam fora. O cartão mostra o custo de passar na frente, não um erro.
            </Leia>
            <LeiaJunto id="o24" />
          </div>
        )
      }}
    </CartaoComplementar>
  )
}

/* ---------------------------------------------------------------- O25 */

function leituraO25(d: ResultadoO25): string | undefined {
  if (d.encerrados.n === 0) return undefined
  const k = d.encerrados.k
  const pct =
    d.encerrados.status === 'ok' ? ` (${fmtNumero(d.encerrados.pct, 1)}% do que encerrou)` : ''
  const dep = d.consumido.depoisDoInicio
  const fila = d.consumido.antesDoInicio.itens
  return `${fmtInteiro(k)} ${plural(k, 'item foi descartado', 'itens foram descartados')} no período${pct}. Eles tinham consumido ${dias(dep.diasUteis)} depois de começar; ${fmtInteiro(fila)} ${plural(fila, 'foi descartado', 'foram descartados')} ainda na fila, sem trabalho iniciado.`
}

/** O25: taxa de descarte e o tempo já consumido, separando "antes do início" (saudável) de "depois do início". */
export function CartaoO25({ filtros }: P) {
  const q = useMetrica('O25', filtros)
  const [tipo, setTipo] = useState<string | null>(null)
  const d = q.dados
  return (
    <CartaoComplementar
      id="O25"
      q={q}
      semTabela
      baseVariante={d?.encerrados.status === 'ok' ? 'ok' : 'insuficiente'}
      periodo={filtros.periodo}
      className="lg:col-span-12"
      leitura={d ? leituraO25(d) : undefined}
    >
      {(r) => {
        const dep = r.consumido.depoisDoInicio
        const tipos = dep.porTipo.map((t) => t.tipo)
        const atual = tipoAtual(tipo, tipos)
        const c = dep.porTipo.find((t) => t.tipo === atual)
        return (
          <div className="flex flex-col gap-3">
            <p className="text-base font-semibold" data-testid="o25-destaque">
              {r.encerrados.status === 'ok'
                ? `${fmtInteiro(r.encerrados.k)} descartados de ${fmtInteiro(r.encerrados.n)} encerrados (${fmtNumero(r.encerrados.pct, 1)}%)`
                : `${fmtInteiro(r.encerrados.k)} descartados de ${fmtInteiro(r.encerrados.n)} encerrados (percentual não publicado, menos de 20)`}
            </p>
            <Barras
              descricao="Taxa de descarte por mês (descartados ÷ encerrados)"
              unidade="% dos encerrados"
              formatar={(v) => `${fmtNumero(v, 1)}%`}
              semLegenda
              categorias={r.meses.map((m) => ({
                rotulo: fmtMes(m.mes),
                emAndamento: m.emAndamento,
                valores: { taxa: m.taxa.status === 'ok' ? m.taxa.pct : null },
              }))}
              series={[{ chave: 'taxa', rotulo: 'Taxa de descarte' }]}
            />
            <Marcacoes itens={r.marcacoes} />
            <div
              className="rounded-md border border-borda bg-superficie-2 p-3 text-sm"
              data-testid="o25-consumido"
            >
              <h4 className="font-semibold">Tempo já consumido no que foi descartado</h4>
              <ul className="m-0 mt-1 list-none p-0">
                <li>
                  Antes do início (decidido na fila): {fmtInteiro(r.consumido.antesDoInicio.itens)}{' '}
                  {plural(r.consumido.antesDoInicio.itens, 'item', 'itens')}, sem trabalho iniciado.
                </li>
                <li>
                  Depois do início (trabalho jogado fora): {fmtInteiro(dep.itens)}{' '}
                  {plural(dep.itens, 'item', 'itens')}, somando {dias(dep.diasUteis)}.
                </li>
              </ul>
              {c && (
                <div className="mt-2">
                  <PorTipo codigo="O25-tipo" tipos={tipos} atual={c.tipo} aoEscolher={setTipo}>
                    {c.estatistica.status === 'ok' ? (
                      <p data-testid="o25-percentis">
                        Em {c.tipo}: P50 {num(c.estatistica.valor.p50)} e P85{' '}
                        {num(c.estatistica.valor.p85)} dias úteis consumidos depois do início.
                      </p>
                    ) : (
                      <p data-testid="o25-percentis">
                        Em {c.tipo}: {fmtInteiro(c.itens)} descartados depois do início, soma{' '}
                        {dias(c.diasUteis)}. P50 e P85 não publicados (menos de 20).
                      </p>
                    )}
                  </PorTipo>
                </div>
              )}
            </div>
            {r.instanteAproximado.itens > 0 && (
              <AvisoInfo testid="o25-aproximado">
                {fmtInteiro(r.instanteAproximado.itens)}{' '}
                {plural(
                  r.instanteAproximado.itens,
                  'descarte tem instante aproximado',
                  'descartes têm instante aproximado',
                )}{' '}
                (última revisão do card).
              </AvisoInfo>
            )}
            {r.avisoPreenchimento.itens > 0 && (
              <AvisoInfo testid="o25-aviso-preenchimento">
                Aviso de preenchimento: {fmtInteiro(r.avisoPreenchimento.itens)}{' '}
                {plural(r.avisoPreenchimento.itens, 'card tem', 'cards têm')} motivo de descarte sem
                estar descartado nem excluído; fora da taxa.
              </AvisoInfo>
            )}
            {r.porMotivo && r.porMotivo.length > 0 && (
              <TabelaDados
                codigo="O25"
                legenda="Descartes por motivo"
                colunas={[
                  { chave: 'm', titulo: 'Motivo' },
                  { chave: 'i', titulo: 'Itens', alinhar: 'direita' },
                ]}
                linhas={r.porMotivo.map((m) => ({ m: m.motivo, i: fmtInteiro(m.itens) }))}
              />
            )}
            <Leia>
              Descartar cedo é saudável; o custo está no que foi descartado depois de começar.
              {!(r.porMotivo && r.porMotivo.length > 0) && ' Nesta fase não há divisão por motivo.'}
            </Leia>
            <LeiaJunto id="o25" />
          </div>
        )
      }}
    </CartaoComplementar>
  )
}

/* ---------------------------------------------------------------- O26 */

function leituraO26(d: ResultadoO26, tipo: string | null): string | undefined {
  const b = d.porTipo.find((x) => x.tipo === tipo)
  if (!b || b.entregas === 0) return undefined
  const maior = [...b.faixas].sort((x, y) => y.itens - x.itens)[0]
  if (!maior) return undefined
  const pct = maior.pct.status === 'ok' ? ` (${fmtNumero(maior.pct.pct, 0)}%)` : ''
  return `Em ${b.tipo}, ${fmtInteiro(b.entregas)} ${plural(b.entregas, 'entrega', 'entregas')}; a faixa mais comum é a de ${maior.faixa} ${maior.faixa === '1' ? 'passagem' : 'passagens'} de mão: ${fmtInteiro(maior.itens)}${pct}.`
}

/** O26: histograma de entregas por número de trocas de responsável; conta trocas, nunca quem. */
export function CartaoO26({ filtros }: P) {
  const q = useMetrica('O26', filtros)
  const [tipo, setTipo] = useState<string | null>(null)
  const d = q.dados
  const tipos = d?.porTipo.map((t) => t.tipo) ?? []
  const atual = tipoAtual(tipo, tipos)
  return (
    <CartaoComplementar
      id="O26"
      q={q}
      baseVariante="censo"
      periodo={filtros.periodo}
      className="lg:col-span-12"
      leitura={d ? leituraO26(d, atual) : undefined}
    >
      {(r) => {
        const b = r.porTipo.find((x) => x.tipo === atual)
        if (!b || !atual) return null
        return (
          <PorTipo codigo="O26" tipos={tipos} atual={atual} aoEscolher={setTipo}>
            <div className="flex flex-col gap-3">
              <p
                className="inline-flex w-fit items-center gap-1 rounded border border-borda bg-superficie-2 px-2 py-0.5 text-xs font-semibold"
                data-testid="o26-selo"
              >
                <Icone nome="info" className="size-3.5" />
                Conta trocas, nunca quem.
              </p>
              <Barras
                descricao={`Entregas de ${atual} por número de passagens de mão`}
                unidade="entregas"
                semLegenda
                espaco={2}
                categorias={b.faixas.map((f) => ({
                  rotulo: f.faixa === '4+' ? '4 ou mais' : f.faixa,
                  valores: { itens: f.itens },
                }))}
                series={[{ chave: 'itens', rotulo: 'Entregas' }]}
              />
              <TabelaDados
                codigo="O26"
                legenda={`Entregas de ${atual} por faixa de passagens, percentual e P85 do tempo de ciclo`}
                colunas={[
                  { chave: 'f', titulo: 'Passagens' },
                  { chave: 'i', titulo: 'Entregas', alinhar: 'direita' },
                  { chave: 'p', titulo: 'Percentual', alinhar: 'direita' },
                  { chave: 'c', titulo: 'P85 do ciclo', alinhar: 'direita' },
                ]}
                linhas={b.faixas.map((f) => ({
                  f: f.faixa === '4+' ? '4 ou mais' : f.faixa,
                  i: fmtInteiro(f.itens),
                  p: f.pct.status === 'ok' ? textoTaxa(f.pct) : '— menos de 20',
                  c:
                    f.cicloP85.status === 'ok'
                      ? `${num(f.cicloP85.valor.p85)} dias úteis`
                      : SEM_AMOSTRA,
                }))}
              />
              {b.semDado > 0 && (
                <AvisoInfo testid="o26-sem-dado">
                  {fmtInteiro(b.semDado)}{' '}
                  {plural(
                    b.semDado,
                    'entrega sem a contagem de passagens fica à parte',
                    'entregas sem a contagem de passagens ficam à parte',
                  )}
                  ; não contam como "zero passagens".
                </AvisoInfo>
              )}
              <Leia>
                Não existe filtro nem abertura por pessoa. Percentual e P85 só com 20 entregas ou
                mais na faixa. Leia junto com a eficiência de fluxo (O5) e o tempo de ciclo (O3).
              </Leia>
              <LeiaJunto id="o26" />
            </div>
          </PorTipo>
        )
      }}
    </CartaoComplementar>
  )
}
