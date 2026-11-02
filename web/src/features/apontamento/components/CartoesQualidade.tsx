import { Barras } from '@/components/charts'
import { AmostraInsuficiente, CelulaInsuficiente, TabelaDados } from '@/components/ui'
import { fmtInteiro, fmtNumero } from '@/lib/formatar'
import { useDadosAba, useRotulos, useTotaisPorPessoa } from '../dados'
import { ordenarPorTotal } from '../ordem'
import { CARTOES, FLAGS } from '../textos'
import type { PctComPiso, QualidadePorFlag, RespostaApontamento } from '../types'
import { CartaoApontamento } from './CartaoApontamento'
import { NotaNaoIdentificada } from './NotaNaoIdentificada'
import { NotaOutraArea } from './NotaOutraArea'

/** Contagem sempre; percentual só quando a biblioteca o publicou (piso de 20, o3). */
function ContagemEPct({ ap, pct }: { ap: number; pct: PctComPiso }) {
  return pct.status === 'ok' ? (
    <span>
      {fmtInteiro(ap)} ({fmtNumero(pct.pct, 0)}%)
    </span>
  ) : (
    <span>
      {fmtInteiro(ap)} <CelulaInsuficiente />
    </span>
  )
}

function QualidadeGeral({ r }: { r: RespostaApontamento }) {
  const { qualidade } = r
  const { completos, porFlag } = qualidade.geral
  const categorias = [
    { rotulo: FLAGS.completo, valores: { n: completos.k } },
    ...porFlag.map((f) => ({ rotulo: FLAGS[f.flag], valores: { n: f.apontamentos } })),
  ]
  return (
    <div className="flex flex-col gap-3">
      {completos.status === 'insuficiente' && (
        <AmostraInsuficiente
          n={completos.n}
          codigo="AP-QUALIDADE"
          oQue="Os percentuais de qualidade"
        />
      )}
      <Barras
        orientacao="horizontal"
        descricao="Apontamentos por problema de qualidade (um apontamento pode ter mais de um)"
        unidade="apontamentos"
        larguraRotulos={190}
        altura={Math.max(200, categorias.length * 40)}
        semLegenda
        categorias={categorias}
        series={[{ chave: 'n', rotulo: 'Apontamentos', cor: 2 }]}
      />
      <TabelaDados
        codigo="AP-QUALIDADE-detalhe"
        legenda="Qualidade geral: as flags não são excludentes, por isso a soma dos percentuais passa de 100%"
        colunas={[
          { chave: 'f', titulo: 'Situação' },
          { chave: 'a', titulo: 'Apontamentos (parte)', alinhar: 'direita' },
        ]}
        linhas={[
          {
            f: FLAGS.completo,
            a:
              completos.status === 'ok' ? (
                <span>
                  {fmtInteiro(completos.k)} ({fmtNumero(completos.pct, 0)}%)
                </span>
              ) : (
                <span>
                  {fmtInteiro(completos.k)} <CelulaInsuficiente />
                </span>
              ),
          },
          ...porFlag.map((f) => ({
            f: FLAGS[f.flag],
            a: <ContagemEPct ap={f.apontamentos} pct={f.pct} />,
          })),
        ]}
      />
    </div>
  )
}

export function CartaoQualidadeGeral() {
  const { resposta } = useDadosAba()
  const g = resposta?.qualidade.geral
  const leitura = g
    ? g.completos.status === 'ok'
      ? `${fmtNumero(g.completos.pct, 0)}% dos apontamentos estão completos (${fmtInteiro(g.completos.k)} de ${fmtInteiro(g.completos.n)}).`
      : `${fmtInteiro(g.completos.k)} de ${fmtInteiro(g.completos.n)} apontamentos estão completos; o percentual aparece com 20 apontamentos ou mais.`
    : undefined
  return (
    <CartaoApontamento
      codigo="AP-QUALIDADE"
      titulo="Qualidade geral"
      texto={CARTOES.qualidadeGeral}
      leitura={leitura}
      base={g ? { n: g.completos.n, unidade: 'apontamentos' } : undefined}
      baseInsuficiente={g?.completos.status === 'insuficiente'}
      criterios={(resposta?.criterios ?? []).filter((c) => c.id.startsWith('dicionario'))}
      familiaCriterio="dicionario"
      className="lg:col-span-6"
    >
      {(r) => <QualidadeGeral r={r} />}
    </CartaoApontamento>
  )
}

const celulaFlag = (porFlag: QualidadePorFlag[], flag: QualidadePorFlag['flag']) => {
  const f = porFlag.find((x) => x.flag === flag)
  return f ? <ContagemEPct ap={f.apontamentos} pct={f.pct} /> : '—'
}

function QualidadePessoa({ r }: { r: RespostaApontamento }) {
  const { ordem } = useDadosAba()
  const rotulos = useRotulos(r)
  const total = useTotaisPorPessoa(r)
  const linhas = ordenarPorTotal(r.qualidade.porPessoa, ordem, (l) => total(l.pessoaRef))
  const flags = r.qualidade.geral.porFlag.map((f) => f.flag)
  return (
    <div className="flex flex-col gap-2">
      <TabelaDados
        codigo="AP-QUALIDADE-PESSOA-detalhe"
        legenda="Qualidade por pessoa: contagem por problema; o percentual só aparece com 20 apontamentos ou mais"
        colunas={[
          { chave: 'p', titulo: 'Pessoa' },
          { chave: 'a', titulo: 'Apontamentos', alinhar: 'direita' },
          { chave: 'c', titulo: FLAGS.completo, alinhar: 'direita' },
          ...flags.map((f) => ({ chave: f, titulo: FLAGS[f], alinhar: 'direita' as const })),
        ]}
        linhas={linhas.map((l) => ({
          p: rotulos.de(l.pessoaRef),
          a: fmtInteiro(l.apontamentos),
          c:
            l.completos.status === 'ok' ? (
              <span>
                {fmtInteiro(l.completos.k)} ({fmtNumero(l.completos.pct, 0)}%)
              </span>
            ) : (
              <span>
                {fmtInteiro(l.completos.k)} <CelulaInsuficiente />
              </span>
            ),
          ...Object.fromEntries(flags.map((f) => [f, celulaFlag(l.porFlag, f)])),
        }))}
      />
      <NotaNaoIdentificada r={r} />
      <NotaOutraArea linhas={linhas} />
    </div>
  )
}

export function CartaoQualidadePessoa() {
  return (
    <CartaoApontamento
      codigo="AP-QUALIDADE-PESSOA"
      titulo="Qualidade por pessoa"
      texto={CARTOES.qualidadePessoa}
      semTabela
      familiaCriterio="dicionario"
      className="lg:col-span-12"
    >
      {(r) => <QualidadePessoa r={r} />}
    </CartaoApontamento>
  )
}
