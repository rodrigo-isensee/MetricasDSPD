import { CLASSES_SERVICO, type FiltrosFluxo } from '@metricas-dspd/contratos'
import { SerieLinhas } from '@/components/charts'
import {
  AmostraInsuficiente,
  CartaoMetrica,
  SeletorLocal,
  StatusMeta,
  TabelaDados,
} from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtDataCurta, fmtInteiro, fmtNumero } from '@/lib/formatar'
import { useParametroLocal } from '@/features/filtros/useParametroLocal'
import { NOTAS_TATICO } from '../notas'
import { propsCartao, slug } from '@/features/painel/propsCartao'

const VALORES = CLASSES_SERVICO.map(slug)

export function CartaoT4({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('T4', filtros)
  const d = q.dados
  const [aba, setAba] = useParametroLocal('t4', VALORES, 'padrao')
  const classes = d?.classes ?? []
  const sel = classes.find((c) => slug(c.classe) === aba)
  const e = sel?.estatistica
  const leitura =
    sel && e?.status === 'ok'
      ? `${sel.classe}: chegam ${fmtNumero(e.valor.chegada.mediana)} itens por semana e saem ${fmtNumero(e.valor.vazao.mediana)} (medianas). ${e.valor.filaCresce ? 'A fila cresce: chegam mais itens do que saem.' : `Semanas para zerar a fila: ${fmtNumero(e.valor.semanasParaZerar ?? 0)}.`}`
      : sel && e
        ? `${sel.classe}: razão, faixas e semanas para zerar indisponíveis (${fmtInteiro(e.n)} de 20 itens mínimos).`
        : undefined
  const faixa = (f: { min: number; max: number; mediana: number }) =>
    `${fmtNumero(f.min)} a ${fmtNumero(f.max)} (mediana ${fmtNumero(f.mediana)})`
  return (
    <CartaoMetrica
      {...propsCartao('T4', q, NOTAS_TATICO.T4)}
      {...(leitura ? { leitura } : {})}
      className="lg:col-span-6"
    >
      {d && (
        <div className="flex flex-col gap-3">
          <TabelaDados
            codigo="T4-classes"
            legenda="Demanda × capacidade por classe de serviço (itens por semana)"
            colunas={[
              { chave: 'classe', titulo: 'Classe' },
              { chave: 'chegada', titulo: 'Chegada por semana' },
              { chave: 'vazao', titulo: 'Vazão por semana' },
              { chave: 'razao', titulo: 'Razão chegada/vazão', alinhar: 'direita' },
              { chave: 'backlog', titulo: 'Backlog', alinhar: 'direita' },
              { chave: 'zerar', titulo: 'Semanas para zerar' },
              { chave: 'status', titulo: 'Meta 0,9 a 1,0' },
            ]}
            linhas={classes.map((c) => {
              const v = c.estatistica
              if (v.status === 'insuficiente')
                return {
                  classe: c.classe,
                  chegada: `Chegadas: ${fmtInteiro(c.totais.chegadas)}`,
                  vazao: `Saídas: ${fmtInteiro(c.totais.saidas)}`,
                  razao: '—',
                  backlog: '—',
                  zerar: `${fmtInteiro(v.n)} de 20 itens mínimos`,
                  status: '—',
                }
              return {
                classe: c.classe,
                chegada: faixa(v.valor.chegada),
                vazao: faixa(v.valor.vazao),
                razao:
                  v.valor.razao === null
                    ? 'Indefinida (sem chegadas)'
                    : fmtNumero(v.valor.razao, 2),
                backlog: fmtInteiro(v.valor.backlog),
                zerar: v.valor.filaCresce
                  ? 'A fila cresce: chegam mais itens do que saem'
                  : v.valor.semanasParaZerar === null
                    ? '—'
                    : fmtNumero(v.valor.semanasParaZerar),
                status: <StatusMeta status={c.statusMeta} />,
              }
            })}
          />
          <SeletorLocal
            codigo="t4"
            rotulo="Classe de serviço (uma por vez)"
            valor={sel ? aba : 'padrao'}
            onChange={setAba}
            itens={classes.map((c) => ({
              valor: slug(c.classe),
              rotulo: c.classe,
              insuficiente: c.estatistica.status === 'insuficiente',
            }))}
          >
            {sel && sel.estatistica.status === 'ok' ? (
              <SerieLinhas
                descricao={`Chegada e vazão por semana, classe ${sel.classe}`}
                unidade="itens por semana"
                formatarX={fmtDataCurta}
                pontos={sel.semanas.map((w) => ({
                  x: w.semana,
                  emAndamento: w.emAndamento,
                  valores: { chegada: w.chegada, vazao: w.vazao },
                }))}
                series={[
                  { chave: 'chegada', rotulo: 'Chegada', cor: 2, traco: 'tracejado' },
                  { chave: 'vazao', rotulo: 'Vazão', cor: 1, traco: 'solido' },
                ]}
                faixas={[
                  { de: 'chegada', ate: 'vazao', rotulo: 'Diferença entre chegada e vazão' },
                ]}
              />
            ) : sel ? (
              <AmostraInsuficiente n={sel.estatistica.n} codigo="T4" oQue="Razão e faixas" />
            ) : null}
          </SeletorLocal>
          <p className="text-sm">
            <a className="alvo text-acento underline" href="#t1">
              Veja o lead time (T1)
            </a>
          </p>
        </div>
      )}
    </CartaoMetrica>
  )
}
