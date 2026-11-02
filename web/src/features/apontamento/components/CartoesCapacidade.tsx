import { Barras } from '@/components/charts'
import { CelulaInsuficiente, TabelaDados } from '@/components/ui'
import { fmtData, fmtInteiro, fmtMes, fmtNumero } from '@/lib/formatar'
import { useDadosAba, useRotulos } from '../dados'
import { fmtHoras, pctOuNulo } from '../formatar'
import { ordenarPorTotal } from '../ordem'
import { CARTOES } from '../textos'
import type { PctComPiso, RespostaApontamento } from '../types'
import { CartaoApontamento } from './CartaoApontamento'
import { NotaNaoIdentificada } from './NotaNaoIdentificada'
import { SeloLeituraRelativa } from './SeloLeituraRelativa'

/** "Utilização: 19%" ou, abaixo do piso, só a marca de amostra insuficiente (o3). Nunca cor, faixa nem média. */
function Utilizacao({ u }: { u: PctComPiso }) {
  return u.status === 'ok' ? (
    <span>Utilização: {fmtNumero(u.pct, 0)}%</span>
  ) : (
    <CelulaInsuficiente />
  )
}

function CapacidadeMensal({ r }: { r: RespostaApontamento }) {
  const { capacidade } = r
  const horas = (s: number) => s / 3600
  return (
    <div className="flex flex-col gap-3">
      <SeloLeituraRelativa />
      <Barras
        descricao="Capacidade e tempo apontado por mês (horas), com a utilização"
        unidade="h"
        formatar={(v) => fmtNumero(v, 0)}
        linha={{
          chave: 'util',
          rotulo: 'Utilização',
          unidade: '%',
          formatar: (v) => `${fmtNumero(v, 0)}%`,
        }}
        categorias={capacidade.mensal.map((m) => ({
          rotulo: fmtMes(m.mes),
          emAndamento: m.parcialAte !== null,
          valores: {
            capacidade: horas(m.capacidadeSegundos),
            realizado: horas(m.realizadoSegundos),
            util: pctOuNulo(m.utilizacao),
          },
        }))}
        series={[
          { chave: 'capacidade', rotulo: 'Capacidade', cor: 1 },
          { chave: 'realizado', rotulo: 'Apontado', cor: 2 },
        ]}
      />
      <TabelaDados
        codigo="AP-CAPACIDADE-MENSAL-detalhe"
        legenda="Capacidade mensal da equipe: capacidade, apontado e utilização; a utilização só aparece com 20 apontamentos ou mais"
        colunas={[
          { chave: 'm', titulo: 'Mês' },
          { chave: 'c', titulo: 'Capacidade', alinhar: 'direita' },
          { chave: 'r', titulo: 'Apontado', alinhar: 'direita' },
          { chave: 'a', titulo: 'Apontamentos', alinhar: 'direita' },
          { chave: 'u', titulo: 'Utilização', alinhar: 'direita' },
        ]}
        linhas={capacidade.mensal.map((m) => ({
          m: m.parcialAte ? `${fmtMes(m.mes)} (até ${fmtData(m.parcialAte)})` : fmtMes(m.mes),
          c: fmtHoras(m.capacidadeSegundos, 0),
          r: fmtHoras(m.realizadoSegundos),
          a: fmtInteiro(m.apontamentos),
          u: <Utilizacao u={m.utilizacao} />,
        }))}
      />
    </div>
  )
}

export function CartaoCapacidadeMensal() {
  const { resposta } = useDadosAba()
  const ultimo = resposta?.capacidade.mensal.at(-1)
  const leitura = ultimo
    ? ultimo.utilizacao.status === 'ok'
      ? `A utilização da equipe em ${fmtMes(ultimo.mes)} foi de ${fmtNumero(ultimo.utilizacao.pct, 0)}%.`
      : `Em ${fmtMes(ultimo.mes)} foram ${fmtHoras(ultimo.realizadoSegundos)} apontadas; a utilização aparece com 20 apontamentos ou mais.`
    : undefined
  return (
    <CartaoApontamento
      codigo="AP-CAPACIDADE-MENSAL"
      titulo="Capacidade mensal (equipe)"
      texto={CARTOES.capacidadeMensal}
      leitura={leitura}
      criterios={(resposta?.criterios ?? []).filter((c) => c.id.startsWith('calendario'))}
      className="lg:col-span-6"
    >
      {(r) => <CapacidadeMensal r={r} />}
    </CartaoApontamento>
  )
}

function CapacidadePessoa({ r }: { r: RespostaApontamento }) {
  const { capacidade } = r
  const { ordem } = useDadosAba()
  const rotulos = useRotulos(r)
  const linhas = ordenarPorTotal(capacidade.porPessoa, ordem, (l) => l.realizadoSegundos)
  return (
    <div className="flex flex-col gap-3">
      <SeloLeituraRelativa />
      <TabelaDados
        codigo="AP-CAPACIDADE-PESSOA-detalhe"
        legenda="Capacidade por pessoa: intervalo, dias úteis, capacidade, apontado e utilização; sem meta nem faixa de bom ou ruim"
        colunas={[
          { chave: 'p', titulo: 'Pessoa' },
          { chave: 'i', titulo: 'Intervalo' },
          { chave: 'd', titulo: 'Dias úteis', alinhar: 'direita' },
          { chave: 'c', titulo: 'Capacidade', alinhar: 'direita' },
          { chave: 'r', titulo: 'Apontado', alinhar: 'direita' },
          { chave: 'a', titulo: 'Apontamentos', alinhar: 'direita' },
          { chave: 'u', titulo: 'Utilização', alinhar: 'direita' },
        ]}
        linhas={linhas.map((l) => ({
          p: rotulos.de(l.pessoaRef),
          i: `${fmtData(l.inicio)} a ${fmtData(l.fim)}`,
          d: fmtInteiro(l.diasUteis),
          c: fmtHoras(l.capacidadeSegundos, 0),
          r: fmtHoras(l.realizadoSegundos),
          a: fmtInteiro(l.apontamentos),
          u: <Utilizacao u={l.utilizacao} />,
        }))}
      />
      <NotaNaoIdentificada r={r} />
    </div>
  )
}

export function CartaoCapacidadePessoa() {
  const { resposta } = useDadosAba()
  return (
    <CartaoApontamento
      codigo="AP-CAPACIDADE-PESSOA"
      titulo="Capacidade por pessoa"
      texto={CARTOES.capacidadePessoa}
      semTabela
      criterios={(resposta?.criterios ?? []).filter((c) => c.id.startsWith('calendario'))}
      className="lg:col-span-6"
    >
      {(r) => <CapacidadePessoa r={r} />}
    </CartaoApontamento>
  )
}
