import clsx from 'clsx'
import type { ResultadoPV1 } from '@metricas-dspd/contratos'
import { Icone, RegiaoRolavel } from '@/components/ui'
import { fmtData, fmtInteiro } from '@/lib/formatar'
import { fmtTri, textoContagem } from './formatar'

type Ok = Extract<ResultadoPV1, { status: 'ok' }>

type Ponto = Ok['tendencia'][number]

/** " em dd/mm/aaaa" quando há data da quebra (L-8); vazio quando não há. */
function textoDataQuebra(d: Ok, anterior: Ponto, atual: Ponto): string {
  const data = dataDaQuebra(d, anterior, atual)
  return data ? ` em ${fmtData(data)}` : ''
}

/** Trimestre (`2026-T2`) em que cai uma data ISO. */
const trimestreDaData = (iso: string): string =>
  `${iso.slice(0, 4)}-T${Math.ceil(Number(iso.slice(5, 7)) / 3)}`

/**
 * Data da quebra de série entre dois trimestres seguidos (L-8): a marca T2.6 (`criterios.serie`) que cai entre o trimestre
 * anterior (exclusive) e este (inclusive); sem marca, a data de vigência do questionário só quando a versão é a
 * vigente. Sem nenhuma das duas, a coluna fica sem data.
 */
function dataDaQuebra(d: Ok, anterior: Ponto, atual: Ponto): string | undefined {
  const marca = d.criterios.serie.find((m) => {
    const t = trimestreDaData(m.data)
    return t > anterior.trimestre && t <= atual.trimestre
  })
  if (marca) return marca.data
  return atual.versaoId === d.questionario.versaoId ? d.questionario.vigenteDesde : undefined
}

/**
 * Tendência dos últimos trimestres: respostas "Concordam" (faixas 4 e 5), por pergunta, em "k de n".
 * Uma troca de versão do questionário entre dois trimestres quebra a série (T2.6): a coluna ganha marca
 * e borda tracejada, e o texto diz para não comparar com a anterior. Nada aqui é calculado.
 */
export function Tendencia({ d }: { d: Ok }) {
  const pontos = d.tendencia
  const perguntas = [...d.questionario.perguntas].sort((a, b) => a.ordem - b.ordem)
  const quebra = (i: number) => i > 0 && pontos[i - 1]?.versaoId !== pontos[i]?.versaoId
  const insuficientes = pontos.flatMap((p) =>
    p.bloco.status === 'base-insuficiente'
      ? [{ trimestre: p.trimestre, n: p.bloco.n, minimo: p.bloco.minimo }]
      : [],
  )
  return (
    <section
      aria-labelledby="pv1-tendencia"
      className="flex flex-col gap-2"
      data-testid="tendencia"
    >
      <h4 id="pv1-tendencia" className="text-sm font-bold">
        Tendência: respostas "Concordo" e "Concordo totalmente" por trimestre
      </h4>
      <RegiaoRolavel
        rotulo="Tendência por trimestre das respostas que concordam"
        testid="tendencia-PV1"
      >
        <table className="w-full border-collapse text-sm">
          <caption className="px-3 py-2 text-left text-xs text-texto-2">
            Só o lado que concorda (faixas 4 e 5), por pergunta, em k de n respostas. Para o lado
            que discorda, leia a distribuição acima. O "n" muda de um trimestre para outro.
          </caption>
          <thead className="bg-superficie-2">
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-40 border-r border-borda bg-superficie-2 px-3 py-2 text-left font-semibold"
              >
                Pergunta
              </th>
              {pontos.map((p, i) => (
                <th
                  key={p.trimestre}
                  scope="col"
                  data-testid="ponto-trimestre"
                  data-quebra={quebra(i) || undefined}
                  className={clsx(
                    'min-w-28 px-3 py-2 text-right font-semibold',
                    quebra(i) && 'border-l-2 border-dashed border-atencao',
                  )}
                >
                  {fmtTri(p.trimestre)}
                  <span className="block text-xs font-normal text-texto-2">
                    {fmtInteiro(p.bloco.n)} {p.bloco.n === 1 ? 'resposta' : 'respostas'}
                  </span>
                  {quebra(i) && (
                    <span
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-atencao"
                      data-testid="quebra-serie"
                    >
                      <Icone nome="alerta" className="size-3" />
                      Questionário alterado
                      {textoDataQuebra(d, pontos[i - 1] as Ponto, p)}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perguntas.map((q) => (
              <tr key={q.codigo} className="border-t border-borda">
                <th
                  scope="row"
                  className="sticky left-0 z-10 min-w-40 border-r border-borda bg-superficie px-3 py-2 text-left font-medium"
                >
                  {q.texto}
                </th>
                {pontos.map((p, i) => {
                  const celula =
                    p.bloco.status === 'publicado'
                      ? p.bloco.concordam.find((c) => c.codigo === q.codigo)
                      : undefined
                  return (
                    <td
                      key={p.trimestre}
                      className={clsx(
                        'px-3 py-2 text-right tabular-nums',
                        quebra(i) && 'border-l-2 border-dashed border-atencao',
                      )}
                    >
                      {celula ? (
                        textoContagem(celula.contagem)
                      ) : (
                        <>
                          <span aria-hidden="true">—</span>
                          <span className="sr-only">base insuficiente</span>
                        </>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </RegiaoRolavel>
      {insuficientes.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm text-atencao">
          {insuficientes.map((p) => (
            <li key={p.trimestre} className="inline-flex items-center gap-1">
              <Icone nome="alerta" className="size-3.5" />
              {fmtTri(p.trimestre)}: base insuficiente, {fmtInteiro(p.n)}{' '}
              {p.n === 1 ? 'resposta' : 'respostas'}. Mínimo {fmtInteiro(p.minimo)} para publicar.
            </li>
          ))}
        </ul>
      )}
      {pontos.some((_, i) => quebra(i)) && (
        <p className="text-sm text-texto-2" data-testid="aviso-quebra-serie">
          A pergunta ou a escala mudou entre dois trimestres (linha tracejada). Não compare os
          números antes e depois da marca.
        </p>
      )}
    </section>
  )
}
