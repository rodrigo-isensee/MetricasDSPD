import { SeletorCadencia, TabelaDados } from '@/components/ui'
import { fmtInteiro, fmtNumero } from '@/lib/formatar'
import { useDadosAba, useRotulos } from '../dados'
import { fmtHoras } from '../formatar'
import { ordenarPorTotal } from '../ordem'
import { CARTOES, NIVEIS, ROTULO_NIVEL } from '../textos'
import type { RespostaApontamento } from '../types'

import { CartaoApontamento } from './CartaoApontamento'
import { NotaNaoIdentificada } from './NotaNaoIdentificada'
import { NotaNomesOcultos } from './NotaNomesOcultos'
import { NotaOutraArea } from './NotaOutraArea'

function Matriz({ r }: { r: RespostaApontamento }) {
  const { ordem } = useDadosAba()
  const rotulos = useRotulos(r)
  const { matriz } = r
  const nivel = ROTULO_NIVEL[matriz.nivel]
  const linhas = ordenarPorTotal(matriz.linhas, ordem, (l) => l.segundos)
  return (
    <div className="flex flex-col gap-2">
      <TabelaDados
        codigo="AP-MATRIZ-detalhe"
        legenda={`Pessoa por ${nivel.toLowerCase()}: horas e parte da linha; a parte só aparece com 20 apontamentos ou mais`}
        colunas={[
          { chave: 'p', titulo: 'Pessoa' },
          ...matriz.colunas.map((c) => ({
            chave: c.id,
            titulo: c.rotulo,
            alinhar: 'direita' as const,
          })),
          { chave: 't', titulo: 'Total da linha', alinhar: 'direita' },
        ]}
        linhas={linhas.map((l) => ({
          p: rotulos.de(l.pessoaRef),
          ...Object.fromEntries(
            matriz.colunas.map((c) => {
              const cel = l.celulas.find((x) => x.colunaId === c.id)
              if (!cel) return [c.id, '—']
              return [
                c.id,
                cel.participacao.status === 'ok'
                  ? `${fmtHoras(cel.segundos)} · ${fmtNumero(cel.participacao.pct, 0)}%`
                  : fmtHoras(cel.segundos),
              ]
            }),
          ),
          t: `${fmtHoras(l.segundos)} · ${fmtInteiro(l.apontamentos)} apontamentos`,
        }))}
      />
      <NotaNomesOcultos r={r} />
      <NotaNaoIdentificada r={r} />
      <NotaOutraArea linhas={linhas} />
    </div>
  )
}

export function CartaoMatriz() {
  const d = useDadosAba()
  return (
    <CartaoApontamento
      codigo="AP-MATRIZ"
      titulo="Pessoa × categoria"
      texto={CARTOES.matriz}
      semTabela
      acoes={
        <SeletorCadencia
          rotulo="Agrupar por"
          valor={d.nivelMatriz}
          onChange={d.definirNivel}
          opcoes={NIVEIS}
        />
      }
      familiaCriterio="dicionario"
      className="lg:col-span-12"
    >
      {(r) => <Matriz r={r} />}
    </CartaoApontamento>
  )
}
