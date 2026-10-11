import { useState } from 'react'
import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras } from '@/components/charts'
import { AmostraInsuficiente, SeletorLocal, TabelaDados } from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtData, fmtInteiro, fmtPct, fmtTrimestre, plural, textoJanela } from '@/lib/formatar'
import { textoTaxa } from '@/features/painel/propsCartao'
import { CartaoComplementar } from './CartaoComplementar'
import { Leia } from './comuns'

interface P {
  filtros: FiltrosFluxo
}

const periodos = (n: number, g: 'dia' | 'semana') =>
  `${fmtInteiro(n)} ${g === 'semana' ? plural(n, 'semana', 'semanas') : plural(n, 'dia', 'dias')}`

type Pct = { p50: number; p85: number; p95: number }

/** T6: previsão probabilística por classe de serviço (Monte Carlo sobre a vazão semanal). */
export function CartaoT6({ filtros }: P) {
  const q = useMetrica('T6', filtros)
  const [classe, setClasse] = useState<string | null>(null)
  const d = q.dados
  const atual = d?.classes.find((c) => c.classe === classe) ?? d?.classes[0]
  const algumaOk = !!d?.classes.some((c) => c.n >= 20)
  return (
    <CartaoComplementar
      id="T6"
      q={q}
      periodo={filtros.periodo}
      janelaPercentis={d?.janelaPercentis}
      baseVariante={algumaOk ? 'ok' : 'insuficiente'}
      className="lg:col-span-12"
      leitura={
        d
          ? `Previsão pela vazão semanal das últimas ${textoJanela(d.janelaPercentis)}. Para compromisso externo use o P85.`
          : undefined
      }
    >
      {(r) =>
        atual && (
          <SeletorLocal
            codigo="T6"
            rotulo="Classe de serviço"
            valor={atual.classe}
            onChange={setClasse}
            itens={r.classes.map((c) => ({
              valor: c.classe,
              rotulo: c.classe,
              contagem: c.n,
              insuficiente: c.n < 20,
            }))}
          >
            <div className="mt-3 flex flex-col gap-3">
              {atual.n < 20 ? (
                <AmostraInsuficiente n={atual.n} codigo="T6" oQue="A previsão" />
              ) : (
                <>
                  <TabelaDados
                    codigo="T6-termino"
                    legenda={`Quando terminam N itens da classe ${atual.classe} (P50, P85 e P95)`}
                    colunas={[
                      { chave: 'n', titulo: 'Itens a terminar' },
                      { chave: 'p50', titulo: 'P50', alinhar: 'direita' },
                      { chave: 'p85', titulo: 'P85', alinhar: 'direita' },
                      { chave: 'p95', titulo: 'P95', alinhar: 'direita' },
                    ]}
                    linhas={atual.termino.map((t) => {
                      const v = t.previsao.status === 'ok' ? t.previsao.valor : undefined
                      const c = (k: keyof Pct) =>
                        v ? periodos(v.periodos[k], v.granularidade) : 'amostra insuficiente'
                      return { n: fmtInteiro(t.itens), p50: c('p50'), p85: c('p85'), p95: c('p95') }
                    })}
                  />
                  <TabelaDados
                    codigo="T6-itens"
                    legenda={`Quantos itens da classe ${atual.classe} cabem em N semanas (P50, P85 e P95)`}
                    colunas={[
                      { chave: 's', titulo: 'Semanas disponíveis' },
                      { chave: 'p50', titulo: 'P50', alinhar: 'direita' },
                      { chave: 'p85', titulo: 'P85', alinhar: 'direita' },
                      { chave: 'p95', titulo: 'P95', alinhar: 'direita' },
                    ]}
                    linhas={atual.itens.map((t) => {
                      const v = t.previsao.status === 'ok' ? t.previsao.valor : undefined
                      const c = (k: keyof Pct) =>
                        v ? `${fmtInteiro(v.itens[k])} itens` : 'amostra insuficiente'
                      return {
                        s: fmtInteiro(t.semanas),
                        p50: c('p50'),
                        p85: c('p85'),
                        p95: c('p95'),
                      }
                    })}
                  />
                </>
              )}
              <Leia>
                O P50 é uma chance de meio a meio. A previsão vale se o escopo não crescer; uma
                classe por vez.
              </Leia>
            </div>
          </SeletorLocal>
        )
      }
    </CartaoComplementar>
  )
}

/** T8: sprint, sempre com a entrada não planejada ao lado e sem alvo de 100%. */
export function CartaoT8({ filtros }: P) {
  const q = useMetrica('T8', filtros)
  const d = q.dados
  const ag = d?.agregado
  const pct = (t: { status: string; pct?: number }) => (t.status === 'ok' ? (t.pct ?? null) : null)
  return (
    <CartaoComplementar
      id="T8"
      q={q}
      baseVariante={ag?.entreguePct.status === 'ok' ? 'ok' : 'insuficiente'}
      leitura={
        ag
          ? `No conjunto das sprints, ${textoTaxa(ag.entreguePct)} do comprometido foi entregue e ${textoTaxa(ag.naoPlanejadoPct)} da entrada não foi planejada.`
          : undefined
      }
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          <Barras
            descricao="Por sprint: % do comprometido entregue e % de entrada não planejada"
            unidade="%"
            formatar={(v) => fmtPct(v, 0)}
            categorias={r.sprints.map((s) => ({
              rotulo: fmtData(s.fim).slice(0, 5),
              emAndamento: s.emAndamento,
              valores: { entregue: pct(s.entreguePct), naoPlanejado: pct(s.naoPlanejadoPct) },
            }))}
            series={[
              { chave: 'entregue', rotulo: 'Entregue do comprometido', cor: 1, padrao: 'liso' },
              { chave: 'naoPlanejado', rotulo: 'Entrada não planejada', cor: 2, padrao: 'hachura' },
            ]}
          />
          <TabelaDados
            codigo="T8-detalhe"
            legenda="Sprints: comprometido, entregue, carry-over e adicionados; abaixo de 20 itens só k de n"
            colunas={[
              { chave: 's', titulo: 'Sprint (fim)' },
              { chave: 'c', titulo: 'Comprometidos', alinhar: 'direita' },
              { chave: 'e', titulo: 'Entregues', alinhar: 'direita' },
              { chave: 'co', titulo: 'Carry-over', alinhar: 'direita' },
              { chave: 'a', titulo: 'Adicionados', alinhar: 'direita' },
              { chave: 'pe', titulo: 'Entregue', alinhar: 'direita' },
              { chave: 'np', titulo: 'Não planejada', alinhar: 'direita' },
            ]}
            linhas={r.sprints.map((s) => ({
              s: fmtData(s.fim),
              c: fmtInteiro(s.comprometidos),
              e: fmtInteiro(s.entreguesDoComprometido),
              co: fmtInteiro(s.carryOver),
              a: fmtInteiro(s.adicionados),
              pe: textoTaxa(s.entreguePct),
              np: textoTaxa(s.naoPlanejadoPct),
            }))}
          />
          <Leia>
            Sem alvo de 100%: leia sempre junto com a entrada não planejada. Agregado das sprints,
            sem comparar times.
          </Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}

/** E4: projetos iniciados e concluídos por trimestre. */
export function CartaoE4({ filtros }: P) {
  const q = useMetrica('E4', filtros)
  const d = q.dados
  const ultimo = d?.trimestres.at(-1)
  return (
    <CartaoComplementar
      id="E4"
      q={q}
      leitura={
        ultimo
          ? `Em ${fmtTrimestre(ultimo.trimestre)}: ${fmtInteiro(ultimo.iniciados)} projetos iniciados, ${fmtInteiro(ultimo.concluidos)} concluídos e ${fmtInteiro(ultimo.emAbertoAcumulado)} em aberto.`
          : undefined
      }
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          <Barras
            descricao="Projetos iniciados e concluídos por trimestre, com o acumulado em aberto"
            unidade="projetos"
            categorias={r.trimestres.map((t) => ({
              rotulo: fmtTrimestre(t.trimestre),
              emAndamento: t.emAndamento,
              valores: {
                iniciados: t.iniciados,
                concluidos: t.concluidos,
                aberto: t.emAbertoAcumulado,
              },
            }))}
            series={[
              { chave: 'iniciados', rotulo: 'Iniciados', cor: 2, padrao: 'hachura' },
              { chave: 'concluidos', rotulo: 'Concluídos', cor: 1, padrao: 'liso' },
            ]}
            linha={{
              chave: 'aberto',
              rotulo: 'Em aberto (acumulado)',
              unidade: 'projetos em aberto',
            }}
          />
          <p className="text-sm" data-testid="natureza-E4">
            Iniciados no período: {fmtInteiro(porNatureza(r.trimestres, 'Manter'))} para manter e{' '}
            {fmtInteiro(porNatureza(r.trimestres, 'Evoluir'))} para evoluir.
          </p>
        </div>
      )}
    </CartaoComplementar>
  )
}

/** E5: previsão de término por projeto, SEMPRE com as frentes adicionadas após o início ao lado. */
export function CartaoE5({ filtros }: P) {
  const q = useMetrica('E5', filtros)
  const d = q.dados
  const algumaOk = !!d?.projetos.some((p) => p.previsao.status === 'ok')
  return (
    <CartaoComplementar
      id="E5"
      q={q}
      semTabela
      periodo={filtros.periodo}
      janelaPercentis={d?.janelaPercentis}
      baseVariante={algumaOk ? 'ok' : 'insuficiente'}
      className="lg:col-span-12"
      leitura={
        d
          ? `Previsão pela vazão de frentes das últimas ${textoJanela(d.janelaPercentis)}. Para compromisso externo use o P85.`
          : undefined
      }
    >
      {(r) => (
        <div className="flex flex-col gap-3">
          {!algumaOk && (
            <AmostraInsuficiente
              n={r.vazaoSemanal.n}
              codigo="E5"
              oQue="A previsão de término"
              variante="lenta"
              entidade="frentes"
              janela={r.janelaPercentis}
            />
          )}
          <TabelaDados
            codigo="E5"
            legenda="Previsão de término por projeto, com as frentes restantes e as adicionadas após o início"
            colunas={[
              { chave: 'p', titulo: 'Projeto' },
              { chave: 'fr', titulo: 'Frentes restantes', alinhar: 'direita' },
              { chave: 'fa', titulo: 'Adicionadas após o início', alinhar: 'direita' },
              { chave: 'p50', titulo: 'P50', alinhar: 'direita' },
              { chave: 'p85', titulo: 'P85', alinhar: 'direita' },
              { chave: 'p95', titulo: 'P95', alinhar: 'direita' },
            ]}
            linhas={r.projetos.map((p) => {
              const v = p.previsao.status === 'ok' ? p.previsao.valor : undefined
              const c = (k: keyof Pct) =>
                v ? periodos(v.periodos[k], v.granularidade) : 'amostra insuficiente'
              return {
                p: p.projeto,
                fr: fmtInteiro(p.frentesRestantes),
                fa: fmtInteiro(p.frentesAdicionadasAposInicio),
                p50: c('p50'),
                p85: c('p85'),
                p95: c('p95'),
              }
            })}
          />
          <Leia>
            A previsão nunca é lida sem o crescimento de escopo ao lado (frentes adicionadas após o
            início). Granularidade: frentes, por projeto.
          </Leia>
        </div>
      )}
    </CartaoComplementar>
  )
}

type Trimestres = { iniciadosPorNatureza: { natureza: string; n: number }[] }[]

function porNatureza(trimestres: Trimestres, n: 'Manter' | 'Evoluir'): number {
  let soma = 0
  for (const t of trimestres) soma += t.iniciadosPorNatureza.find((x) => x.natureza === n)?.n ?? 0
  return soma
}
