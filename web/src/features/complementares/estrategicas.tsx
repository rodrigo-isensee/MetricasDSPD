import { useState } from 'react'
import type { FiltrosFluxo, ResultadoE6, ResultadoE7, ResultadoE8 } from '@metricas-dspd/contratos'
import { Barras, Dispersao, type FormaPonto } from '@/components/charts'
import { AmostraInsuficiente, Icone, SeletorLocal, TabelaDados } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtData, fmtInteiro, fmtNumero, plural, semanasDoIntervalo } from '@/lib/formatar'
import { textoTaxa } from '@/features/painel/propsCartao'
import { CartaoComplementar } from './CartaoComplementar'
import { Leia } from './comuns'

interface P {
  filtros: FiltrosFluxo
}

const dias = (n: number) => `${fmtInteiro(n)} ${plural(n, 'dia útil', 'dias úteis')}`

/** Faixas de espera do E9, na ordem do contrato (limite superior inclusivo). */
const FAIXAS_E9 = ['0–30', '31–90', '91–180', 'mais de 180'] as const
const formaE9 = (idade: number): FormaPonto =>
  idade > 180 ? 'triangulo' : idade > 90 ? 'losango' : 'circulo'

/** E9: projetos aprovados e ainda não iniciados. Retrato do dia; P85 de referência por tipo, um tipo por vez. */
export function CartaoE9({ filtros }: P) {
  const q = useMetrica('E9', filtros)
  const [tipo, setTipo] = useState<string | null>(null)
  const d = q.dados
  const projetos = d?.projetos ?? []
  const mais = projetos.reduce((m, p) => Math.max(m, p.idadeDiasUteis), 0)
  const acima90 = projetos.filter((p) => p.idadeDiasUteis > 90).length
  const n = projetos.length
  return (
    <CartaoComplementar
      id="E9"
      q={q}
      semTabela
      baseVariante="censo"
      aplicaveis={['sistema']}
      className="lg:col-span-12"
      leitura={
        d && n > 0
          ? `${fmtInteiro(n)} ${plural(n, 'projeto aprovado ainda não começou', 'projetos aprovados ainda não começaram')}. O mais antigo espera há ${dias(Math.round(mais))}; ${fmtInteiro(acima90)} ${plural(acima90, 'espera', 'esperam')} há mais de 90.`
          : undefined
      }
    >
      {(r) => {
        const tipos = [
          ...new Set([...r.projetos.map((p) => p.tipo), ...r.referenciasP85.map((x) => x.tipo)]),
        ].sort()
        const atual =
          tipos.find((t) => t === tipo) ??
          tipos.find((t) => r.projetos.some((p) => p.tipo === t)) ??
          tipos[0]
        const doTipo = r.projetos.filter((p) => p.tipo === atual)
        const ref = r.referenciasP85.find((x) => x.tipo === atual)?.referenciaP85
        const referencias =
          ref?.status === 'ok'
            ? [
                {
                  valor: ref.valor.p85,
                  rotulo: `P85 do tempo antes do início (E1): ${fmtNumero(ref.valor.p85, 0)}`,
                  traco: 'tracejado' as const,
                },
              ]
            : []
        const grafico = (
          <div className="mt-3 flex flex-col gap-3">
            {doTipo.length > 0 && (
              <Dispersao
                descricao={`Idade em dias úteis dos ${fmtInteiro(doTipo.length)} projetos aguardando início, por faixa de espera`}
                eixoX={{ tipo: 'categorias', categorias: FAIXAS_E9 }}
                rotuloY="Espera (dias úteis)"
                pontos={doTipo.map((p) => ({
                  id: p.cardId,
                  x: Math.max(0, FAIXAS_E9.indexOf(p.faixa as (typeof FAIXAS_E9)[number])),
                  y: p.idadeDiasUteis,
                  forma: formaE9(p.idadeDiasUteis),
                  rotulo: `${p.codigo} ${p.titulo}`,
                }))}
                referencias={referencias}
                legendaFormas={{
                  circulo: 'até 90 dias úteis',
                  losango: '91 a 180',
                  triangulo: 'mais de 180',
                }}
                altura={260}
              />
            )}
            {ref?.status === 'insuficiente' && (
              <p
                className="inline-flex items-center gap-1 rounded-md border border-borda bg-superficie-2 p-2 text-sm text-texto-2"
                data-testid="e9-sem-referencia"
              >
                <Icone nome="info" className="size-4" />
                Sem referência: menos de 20 projetos concluídos ({atual}, {fmtInteiro(ref.n)} de
                20).
              </p>
            )}
          </div>
        )
        return (
          <div className="flex flex-col gap-3">
            {atual && tipos.length > 1 ? (
              <SeletorLocal
                codigo="E9"
                rotulo="Tipo de projeto"
                valor={atual}
                onChange={setTipo}
                itens={tipos.map((t) => ({
                  valor: t,
                  rotulo: t,
                  contagem: r.projetos.filter((p) => p.tipo === t).length,
                }))}
              >
                {grafico}
              </SeletorLocal>
            ) : (
              grafico
            )}
            <TabelaDados
              codigo="E9"
              legenda="Projetos aprovados e ainda não iniciados, do mais antigo para o mais novo"
              colunas={[
                { chave: 'p', titulo: 'Projeto' },
                { chave: 't', titulo: 'Tipo' },
                { chave: 'a', titulo: 'Aprovado em' },
                { chave: 'e', titulo: 'Espera (dias úteis)', alinhar: 'direita' },
              ]}
              linhas={r.projetos.map((p) => ({
                p: `${p.codigo} ${p.titulo}`,
                t: p.tipo,
                a: fmtData(p.criadoEm),
                e: fmtInteiro(Math.round(p.idadeDiasUteis)),
              }))}
            />
            <Leia>
              A espera conta da criação do card de projeto, que nasce com a aprovação na comissão.
              Retrato do dia: o filtro de período não se aplica. Leia junto com o lead time de
              projetos (E1) e as iniciadas × concluídas (E4).
            </Leia>
          </div>
        )
      }}
    </CartaoComplementar>
  )
}

const formaE6 = (replanejamentos: number): FormaPonto =>
  replanejamentos >= 2 ? 'triangulo' : replanejamentos === 1 ? 'losango' : 'circulo'

function leituraE6(d: ResultadoE6): string | undefined {
  const n = d.projetos.length
  if (n === 0) return undefined
  const atrasos = d.projetos.filter((p) => p.deslizeDiasUteis > 0).map((p) => p.deslizeDiasUteis)
  const replan = d.projetos.filter((p) => p.replanejamentos > 0).length
  const naData = n - atrasos.length
  const parte1 = `${fmtInteiro(naData)} de ${fmtInteiro(n)} ${plural(n, 'projeto concluído', 'projetos concluídos')} no período ${plural(n, 'saiu', 'saíram')} na data comprometida.`
  const menor = atrasos.reduce((a, b) => Math.min(a, b), Infinity)
  const maior = atrasos.reduce((a, b) => Math.max(a, b), -Infinity)
  const parte2 =
    atrasos.length === 0
      ? ' Nenhum atrasou;'
      : menor === maior
        ? ` ${plural(atrasos.length, 'O outro atrasou', 'Os demais atrasaram')} ${dias(maior)};`
        : ` Os demais atrasaram de ${fmtInteiro(menor)} a ${dias(maior)};`
  return `${parte1}${parte2} ${fmtInteiro(replan)} ${plural(replan, 'teve', 'tiveram')} a data replanejada ao menos uma vez.`
}

/** E6: deslize de cada projeto concluído em relação à data comprometida (a registrada no compromisso). */
export function CartaoE6({ filtros }: P) {
  const q = useMetrica('E6', filtros)
  const d = q.dados
  return (
    <CartaoComplementar
      id="E6"
      q={q}
      semTabela
      baseVariante={d?.naData.status === 'ok' ? 'ok' : 'insuficiente'}
      aplicaveis={['sistema', 'periodo']}
      className="lg:col-span-12"
      leitura={d ? leituraE6(d) : undefined}
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          {r.naData.status === 'ok' ? (
            <p className="text-sm" data-testid="e6-estatistica">
              {textoTaxa(r.naData)} na data comprometida ({fmtInteiro(r.naData.k)} de{' '}
              {fmtInteiro(r.naData.n)}).
              {r.deslize.status === 'ok' &&
                ` Deslize: P50 ${dias(r.deslize.valor.p50)} e P85 ${dias(r.deslize.valor.p85)}.`}
            </p>
          ) : (
            <AmostraInsuficiente
              n={r.naData.n}
              codigo="E6"
              oQue="O percentual e os percentis do deslize"
              variante="lenta"
              entidade="projetos"
              {...(r.base.janela
                ? {
                    janela: {
                      unidade: 'semanas' as const,
                      quantidade: semanasDoIntervalo(r.base.janela),
                    },
                  }
                : {})}
            />
          )}
          {r.projetos.length > 0 && (
            <Dispersao
              descricao={`Deslize em dias úteis de ${fmtInteiro(r.projetos.length)} projetos concluídos em relação à data comprometida`}
              eixoX={{ tipo: 'categorias', categorias: r.projetos.map((p) => p.codigo) }}
              rotuloY="Deslize (dias úteis)"
              pontos={r.projetos.map((p, i) => ({
                id: p.cardId,
                x: i,
                y: p.deslizeDiasUteis,
                forma: formaE6(p.replanejamentos),
                rotulo: `${p.codigo} ${p.titulo} · ${p.replanejamentos} ${plural(p.replanejamentos, 'replanejamento', 'replanejamentos')}`,
              }))}
              referencias={[{ valor: 0, rotulo: 'data comprometida', traco: 'solido' }]}
              legendaFormas={{
                circulo: 'nenhum replanejamento',
                losango: '1 replanejamento',
                triangulo: '2 ou mais',
              }}
              altura={280}
            />
          )}
          <TabelaDados
            codigo="E6"
            legenda="Deslize por projeto concluído (negativo = antes da data comprometida; 0 = na data)"
            colunas={[
              { chave: 'p', titulo: 'Projeto' },
              { chave: 'd', titulo: 'Deslize (dias úteis)', alinhar: 'direita' },
              { chave: 'r', titulo: 'Replanejamentos', alinhar: 'direita' },
            ]}
            linhas={r.projetos.map((p) => ({
              p: `${p.codigo} ${p.titulo}`,
              d: fmtInteiro(p.deslizeDiasUteis),
              r: fmtInteiro(p.replanejamentos),
            }))}
          />
          {r.semData > 0 && (
            <Leia>
              {fmtInteiro(r.semData)}{' '}
              {plural(
                r.semData,
                'projeto concluído sem data comprometida registrada ficou',
                'projetos concluídos sem data comprometida registrada ficaram',
              )}{' '}
              fora desta conta.
            </Leia>
          )}
          <Leia>
            Data comprometida: a registrada no compromisso; mudanças posteriores contam como
            replanejamentos. Tolerância zero: entregar até a data é cumprir. Leia junto com a
            previsão de término (E5) e o avanço real e escopo (T9).
          </Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}

const NATUREZAS = [
  { chave: 'Sustentação', cor: 1, padrao: 'liso' },
  { chave: 'Evolução', cor: 2, padrao: 'hachura' },
  { chave: 'Projetos', cor: 3, padrao: 'pontos' },
  { chave: 'Dívida técnica', cor: 4, padrao: 'listras' },
] as const

function leituraE7(d: ResultadoE7): string | undefined {
  const s = d.sistemas[0]
  if (!s) return undefined
  if (s.participacao?.status !== 'ok')
    return `${fmtInteiro(d.total)} ${plural(d.total, 'entrega', 'entregas')} no período: abaixo de 20, só a contagem por sistema é publicada.`
  const sust = s.porNatureza.find((x) => x.natureza === 'Sustentação')?.taxa
  return `${s.sistema}: ${textoTaxa(s.participacao)} das entregas do período${sust?.status === 'ok' ? `, ${textoTaxa(sust)} delas de sustentação` : ''}.`
}

/**
 * E7: participação de cada sistema nas entregas do período (decisão D2 = A: sem valores monetários, mesmo que a
 * API ainda devolva os campos de custo; eles nunca são lidos aqui).
 */
export function CartaoE7({ filtros }: P) {
  const q = useMetrica('E7', filtros)
  const d = q.dados
  return (
    <CartaoComplementar
      id="E7"
      q={q}
      semTabela
      baseVariante={d && d.total >= 20 ? 'ok' : 'insuficiente'}
      aplicaveis={['sistema', 'periodo']}
      leitura={d ? leituraE7(d) : undefined}
    >
      {(r) => {
        const rotulo = (s: ResultadoE7['sistemas'][number]) =>
          s.participacao?.status === 'ok'
            ? `${s.sistema} · ${textoTaxa(s.participacao)} (${fmtInteiro(s.entregas)})`
            : `${s.sistema} · ${fmtInteiro(s.entregas)} de ${fmtInteiro(r.total)}`
        return (
          <div className="flex flex-col gap-3">
            {r.total < 20 && (
              <AmostraInsuficiente n={r.total} codigo="E7" oQue="A participação percentual" />
            )}
            {r.sistemas.length > 0 && (
              <Barras
                descricao="Participação de cada sistema nas entregas do período, dividida por natureza"
                orientacao="horizontal"
                modo="percentual"
                unidade="% das entregas do sistema"
                larguraRotulos={190}
                altura={60 + 34 * r.sistemas.length}
                categorias={r.sistemas.map((s) => ({
                  rotulo: rotulo(s),
                  valores: Object.fromEntries(
                    NATUREZAS.map((n) => {
                      const t = s.porNatureza.find((x) => x.natureza === n.chave)?.taxa
                      return [n.chave, t?.status === 'ok' ? t.pct : null]
                    }),
                  ),
                }))}
                series={NATUREZAS.map((n) => ({
                  chave: n.chave,
                  rotulo: n.chave,
                  cor: n.cor,
                  padrao: n.padrao,
                }))}
              />
            )}
            <TabelaDados
              codigo="E7"
              legenda="Entregas e participação por sistema, por volume; sistemas com menos de 20 entregas mostram k de n"
              colunas={[
                { chave: 's', titulo: 'Sistema' },
                { chave: 'p', titulo: 'Participação nas entregas', alinhar: 'direita' },
                { chave: 'e', titulo: 'Entregas', alinhar: 'direita' },
              ]}
              linhas={r.sistemas.map((s) => ({
                s: s.sistema,
                p:
                  s.participacao?.status === 'ok'
                    ? textoTaxa(s.participacao)
                    : `${fmtInteiro(s.entregas)} de ${fmtInteiro(r.total)} (percentual não publicado, menos de 20)`,
                e: fmtInteiro(s.entregas),
              }))}
            />
            <Leia>
              Participação por contagem de demandas entregues, sem subtarefa. Nunca horas apontadas.
              Não inclui os chamados da sustentação (Acelerato), que estão no S12. Leia junto com a
              alocação da capacidade (T3) e a capacidade por objetivo (E2).
            </Leia>
          </div>
        )
      }}
    </CartaoComplementar>
  )
}

function leituraE8(d: ResultadoE8): string | undefined {
  if (d.recortePequeno || !d.faixas) return undefined
  const u = d.faixas.uma
  return `${fmtInteiro(u)} dos ${fmtInteiro(d.sistemasComEntrega)} sistemas com entregas nos últimos ${fmtInteiro(d.janelaMeses)} meses ${plural(u, 'teve', 'tiveram')} todas as entregas feitas por uma única pessoa.`
}

/** E8: só a contagem de sistemas por faixa de pessoas (R-1 = B): nenhum sistema nem pessoa é nomeado. */
export function CartaoE8({ filtros }: P) {
  const q = useMetrica('E8', filtros)
  const d = q.dados
  return (
    <CartaoComplementar
      id="E8"
      q={q}
      semTabela
      baseVariante="censo"
      aplicaveis={[]}
      leitura={d ? leituraE8(d) : undefined}
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          <p
            className="inline-flex items-center gap-1 text-sm font-semibold text-texto"
            data-testid="e8-selo"
          >
            <Icone nome="info" className="size-4" />
            Mede risco de continuidade do parque. Não mostra nem avalia pessoas.
          </p>
          {r.recortePequeno || !r.faixas ? (
            <div
              className="rounded-md border border-borda bg-superficie-2 p-3 text-sm text-texto"
              data-testid="e8-recorte-pequeno"
            >
              <p className="font-semibold">
                Recorte pequeno demais para mostrar a concentração sem identificar pessoas.
              </p>
              <p className="mt-1 text-texto-2">
                Há {fmtInteiro(r.sistemasComEntrega)}{' '}
                {plural(r.sistemasComEntrega, 'sistema com entregas', 'sistemas com entregas')}; as
                faixas ficam ocultas.
              </p>
            </div>
          ) : (
            <>
              <dl className="grid grid-cols-3 gap-3" data-testid="e8-faixas">
                {[
                  ['Sistemas com entregas de 1 pessoa', r.faixas.uma],
                  ['de 2 pessoas', r.faixas.duas],
                  ['de 3 ou mais', r.faixas.tresOuMais],
                ].map(([titulo, n]) => (
                  <div key={titulo as string}>
                    <dt className="text-sm text-texto-2">{titulo}</dt>
                    <dd className="m-0 text-3xl font-bold">{fmtInteiro(n as number)}</dd>
                  </div>
                ))}
              </dl>
              <Barras
                descricao={`${fmtInteiro(r.sistemasComEntrega)} sistemas com entregas, por faixa de pessoas que entregaram`}
                orientacao="horizontal"
                modo="percentual"
                unidade="sistemas"
                altura={110}
                categorias={[
                  {
                    rotulo: 'Sistemas',
                    valores: {
                      uma: r.faixas.uma,
                      duas: r.faixas.duas,
                      tres: r.faixas.tresOuMais,
                    },
                  },
                ]}
                series={[
                  { chave: 'uma', rotulo: '1 pessoa', cor: 2, padrao: 'hachura' },
                  { chave: 'duas', rotulo: '2 pessoas', cor: 5, padrao: 'pontos' },
                  { chave: 'tres', rotulo: '3 ou mais', cor: 1, padrao: 'liso' },
                ]}
              />
            </>
          )}
          <Leia>
            Janela de {fmtInteiro(r.janelaMeses)} meses, fixa. O número de pessoas por sistema chega
            já contado: nenhum nome de pessoa nem de sistema aparece aqui. Leia junto com a
            capacidade por sistema (E7).
          </Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}
