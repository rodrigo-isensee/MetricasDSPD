import { useId, useRef, useState, type KeyboardEvent } from 'react'
import clsx from 'clsx'
import { Icone, RegiaoRolavel, TabelaDados, useModoTabela } from '@/components/ui'
import { fmtData, fmtDataCurta, fmtNumero } from '@/lib/formatar'
import { useDadosAba, useRotulos } from '../dados'
import { diaMes, fmtHoras } from '../formatar'
import { ordenarPorTotal } from '../ordem'
import { rolarCelulaParaVista } from '../rolagem'
import { ANOMALIA, CARTOES, DIARIO_VAZIO, FAIXAS } from '../textos'
import {
  PESSOA_OUTRA_AREA,
  type DiarioApontamento,
  type FaixaDiario,
  type RespostaApontamento,
} from '../types'
import { CartaoApontamento } from './CartaoApontamento'
import { NotaNaoIdentificada } from './NotaNaoIdentificada'
import { NotaNomesOcultos } from './NotaNomesOcultos'

/** Faixas fixas (M-6): a mesma cor significa sempre a mesma faixa; o valor em horas está em cada célula. */
const ESTILO_FAIXA: Record<FaixaDiario, React.CSSProperties | undefined> = {
  zero: undefined,
  'ate-4h': { background: 'var(--rampa-2)', color: 'var(--rampa-2-fg)' },
  '4h-a-8h': { background: 'var(--rampa-3)', color: 'var(--rampa-3-fg)' },
  'mais-de-8h': { background: 'var(--rampa-5)', color: 'var(--rampa-5-fg)' },
}
const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const diaDaSemana = (iso: string) => SEMANA[new Date(`${iso}T00:00:00Z`).getUTCDay()]

function LegendaMapa({ limite }: { limite: number }) {
  return (
    <ul
      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-texto-2"
      aria-label="Legenda do mapa"
      data-testid="legenda-diario"
    >
      {(['ate-4h', '4h-a-8h', 'mais-de-8h'] as const).map((f) => (
        <li key={f} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block size-4 rounded-sm border border-borda"
            style={ESTILO_FAIXA[f]}
          />
          {FAIXAS[f]}
        </li>
      ))}
      <li className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="inline-block size-4 rounded-sm border border-borda-controle bg-superficie"
        />
        Dia útil sem apontamento ({FAIXAS.zero})
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="inline-block size-4 rounded-sm border border-borda bg-superficie-2"
        />
        Fim de semana ou feriado
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="inline-block size-4 rounded-sm border border-dashed border-texto-2"
          style={ESTILO_FAIXA['4h-a-8h']}
        />
        Apontamento em fim de semana ou feriado
      </li>
      <li className="inline-flex items-center gap-1.5">
        <Icone nome="alerta" className="size-4 text-atencao" />
        {ANOMALIA.marca} (mais de {fmtNumero(limite / 3600, 0)} h no dia)
      </li>
    </ul>
  )
}

interface Celula {
  segundos: number
  faixa: FaixaDiario
  atipico: boolean
}

/** ", da equipe X" quando há recorte por Equipe; só o nome da equipe, nunca de pessoa. */
const daEquipe = (equipes: string[]) =>
  equipes.length === 0
    ? ''
    : `, ${equipes.length === 1 ? 'da equipe' : 'das equipes'} ${equipes.join(', ')}`

function Mapa({
  diario,
  linhas,
  r,
}: {
  diario: DiarioApontamento
  linhas: DiarioApontamento['linhas']
  r: RespostaApontamento
}) {
  const { equipes } = useDadosAba()
  const rotulos = useRotulos(r)
  const grade = useRef<HTMLTableElement>(null)
  const [ativaBruta, setAtiva] = useState<[number, number]>([0, 0])
  // Depois de filtrar pessoa ou encurtar a janela, a célula ativa não pode ficar fora da grade (Tab sem parada).
  const ativa: [number, number] = [
    Math.min(ativaBruta[0], Math.max(0, linhas.length - 1)),
    Math.min(ativaBruta[1], Math.max(0, diario.dias.length - 1)),
  ]
  const limiteH = diario.limiteAtipicoSegundos / 3600
  const mover = (e: KeyboardEvent<HTMLTableElement>) => {
    const [l, c] = ativa
    const passos: Record<string, [number, number]> = {
      ArrowRight: [0, 1],
      ArrowLeft: [0, -1],
      ArrowDown: [1, 0],
      ArrowUp: [-1, 0],
    }
    const p = passos[e.key]
    if (!p) return
    e.preventDefault()
    const nl = Math.min(linhas.length - 1, Math.max(0, l + p[0]))
    const nc = Math.min(diario.dias.length - 1, Math.max(0, c + p[1]))
    setAtiva([nl, nc])
    grade.current?.querySelector<HTMLElement>(`[data-lin="${nl}"][data-col="${nc}"]`)?.focus()
  }
  return (
    <RegiaoRolavel rotulo="Mapa de calor pessoa por dia" testid="mapa-diario">
      <table
        ref={grade}
        role="grid"
        aria-label={`Horas apontadas por pessoa e dia${daEquipe(equipes)}, de ${fmtData(diario.de)} a ${fmtData(diario.ate)}`}
        onKeyDown={mover}
        className="w-full min-w-max border-collapse text-xs"
      >
        <thead className="bg-superficie-2">
          <tr>
            <th
              scope="col"
              className="sticky left-0 z-10 min-w-32 bg-superficie-2 px-2 py-2 text-left font-semibold"
            >
              Pessoa
            </th>
            {diario.dias.map((d) => (
              <th key={d.data} scope="col" className="min-w-10 px-1 py-2 text-center font-semibold">
                <span className="block">{fmtDataCurta(d.data).slice(0, 2)}</span>
                <span className="block font-normal text-texto-2">{diaDaSemana(d.data)}</span>
              </th>
            ))}
            <th
              scope="col"
              className="sticky right-0 z-10 min-w-16 bg-superficie-2 px-2 py-2 text-right font-semibold"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((lin, i) => {
            const porData = new Map<string, Celula>(lin.celulas.map((c) => [c.data, c]))
            const nome = rotulos.de(lin.pessoaRef)
            return (
              <tr key={lin.pessoaRef} className="border-t border-borda">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-superficie px-2 py-1 text-left font-medium"
                >
                  {nome}
                </th>
                {diario.dias.map((d, j) => {
                  const c = porData.get(d.data)
                  const faixa: FaixaDiario = c?.faixa ?? 'zero'
                  const naoUtil = !d.util
                  const motivo = naoUtil ? (d.feriado ? 'feriado' : 'fim de semana') : null
                  // Dia não útil sem apontamento é neutro; com apontamento, mostra a faixa e diz o motivo (A-5).
                  const neutro = naoUtil && !c
                  const horas = `${fmtNumero((c?.segundos ?? 0) / 3600, 1)} horas, faixa ${FAIXAS[faixa]}`
                  const rotulo = `${nome}, ${diaMes(d.data)}, ${neutro ? motivo : `${motivo ? `${motivo}, ` : ''}${horas}`}${c?.atipico ? `, ${ANOMALIA.marca}` : ''}`
                  return (
                    <td
                      key={d.data}
                      role="gridcell"
                      tabIndex={ativa[0] === i && ativa[1] === j ? 0 : -1}
                      data-lin={i}
                      data-col={j}
                      data-faixa={neutro ? 'neutro' : faixa}
                      data-nao-util={naoUtil ? 'true' : undefined}
                      data-atipico={c?.atipico ? 'true' : undefined}
                      aria-label={rotulo}
                      onFocus={(e) => {
                        setAtiva([i, j])
                        rolarCelulaParaVista(e.currentTarget)
                      }}
                      style={neutro ? undefined : ESTILO_FAIXA[faixa]}
                      className={clsx(
                        'relative h-8 min-w-10 border border-borda px-1 text-center tabular-nums outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-acento',
                        neutro && 'bg-superficie-2',
                        !neutro && naoUtil && 'border-dashed border-texto-2',
                        !neutro &&
                          !naoUtil &&
                          faixa === 'zero' &&
                          'border-borda-controle bg-superficie',
                      )}
                    >
                      {c ? fmtNumero(c.segundos / 3600, 1) : ''}
                      {c?.atipico && (
                        <>
                          <Icone nome="alerta" className="absolute right-0 top-0 size-3" />
                          <span className="sr-only">{ANOMALIA.marca}</span>
                        </>
                      )}
                    </td>
                  )
                })}
                <td className="sticky right-0 z-10 bg-superficie px-2 py-1 text-right font-semibold tabular-nums">
                  {fmtHoras(lin.segundos)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="sr-only">
        Limite de {fmtNumero(limiteH, 0)} horas por pessoa e dia para marcar possível erro de
        apontamento.
      </p>
    </RegiaoRolavel>
  )
}

function TabelaDoMapa({
  diario,
  linhas,
  r,
}: {
  diario: DiarioApontamento
  linhas: DiarioApontamento['linhas']
  r: RespostaApontamento
}) {
  const rotulos = useRotulos(r)
  const { equipes } = useDadosAba()
  return (
    <TabelaDados
      codigo="AP-DIARIO"
      legenda={`Horas apontadas por pessoa e dia${daEquipe(equipes)}, de ${fmtData(diario.de)} a ${fmtData(diario.ate)}`}
      colunas={[
        { chave: 'p', titulo: 'Pessoa' },
        { chave: 'd', titulo: 'Dia' },
        { chave: 'h', titulo: 'Horas', alinhar: 'direita' },
        { chave: 'f', titulo: 'Faixa' },
        { chave: 'o', titulo: 'Observação' },
      ]}
      linhas={linhas.flatMap((l) =>
        l.celulas.map((c) => ({
          p: rotulos.de(l.pessoaRef),
          d: fmtData(c.data),
          h: fmtHoras(c.segundos),
          f: FAIXAS[c.faixa],
          o: c.atipico ? ANOMALIA.marca : '',
        })),
      )}
    />
  )
}

/** "Outra área" soma várias pessoas: faixas e limite de possível erro valem por pessoa e dia, então ela fica fora do mapa (A-4). */
const soPessoas = (d: DiarioApontamento) =>
  d.linhas.filter((l) => l.pessoaRef !== PESSOA_OUTRA_AREA)

function Diario({ r }: { r: RespostaApontamento }) {
  const { ordem, equipes, removerEquipe } = useDadosAba()
  const { modo } = useModoTabela()
  const diario = r.diario
  const pessoas = soPessoas(diario)
  const linhas = ordenarPorTotal(pessoas, ordem, (l) => l.segundos)
  const temAtipico = pessoas.some((l) => l.celulas.some((c) => c.atipico))
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium" data-testid="intervalo-diario">
        Período do mapa: {fmtData(diario.de)} a {fmtData(diario.ate)}
      </p>
      {linhas.length > 0 && <NotaNomesOcultos r={r} />}
      {linhas.length === 0 ? (
        <div className="flex flex-col items-start gap-2 text-sm" data-testid="diario-sem-pessoas">
          <p>{equipes.length > 0 ? DIARIO_VAZIO.comEquipe : DIARIO_VAZIO.semEquipe}</p>
          {equipes.length > 0 && (
            <button
              type="button"
              onClick={removerEquipe}
              className="alvo rounded border border-borda-controle bg-superficie px-3 text-sm"
            >
              Remover filtro Equipe
            </button>
          )}
        </div>
      ) : modo === 'tabela' ? (
        <TabelaDoMapa diario={diario} linhas={linhas} r={r} />
      ) : (
        <>
          <LegendaMapa limite={diario.limiteAtipicoSegundos} />
          <Mapa diario={diario} linhas={linhas} r={r} />
        </>
      )}
      {temAtipico && (
        <p className="flex items-start gap-1 text-xs text-texto-2" data-testid="dica-anomalia">
          <Icone nome="alerta" className="mt-0.5 size-3.5 shrink-0" />
          {ANOMALIA.marca}: {ANOMALIA.dica(diario.limiteAtipicoSegundos / 3600)}
          {equipes.length > 0 && ` ${ANOMALIA.dicaRecorteEquipe}`}
        </p>
      )}
      <NotaNaoIdentificada r={r} />
    </div>
  )
}

function SeletorJanela() {
  const d = useDadosAba()
  const idDe = useId()
  const idAte = useId()
  const de = d.diarioDe ?? d.resposta?.diario.de ?? ''
  const ate = d.diarioAte ?? d.resposta?.diario.ate ?? ''
  const mudar = (novoDe: string, novoAte: string) =>
    novoDe && novoAte ? d.definirDiario(novoDe, novoAte) : d.definirDiario(null, null)
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <label htmlFor={idDe} className="text-texto-2">
        Mapa de
      </label>
      <input
        id={idDe}
        type="date"
        value={de}
        onChange={(e) => mudar(e.target.value, ate)}
        className="alvo rounded border border-borda-controle bg-superficie px-1"
      />
      <label htmlFor={idAte} className="text-texto-2">
        até
      </label>
      <input
        id={idAte}
        type="date"
        value={ate}
        onChange={(e) => mudar(de, e.target.value)}
        className="alvo rounded border border-borda-controle bg-superficie px-1"
      />
    </div>
  )
}

export function CartaoDiario() {
  const { resposta } = useDadosAba()
  const dia = resposta?.diario
  const nPessoas = dia ? soPessoas(dia).length : 0
  const leitura = dia
    ? `${nPessoas} ${nPessoas === 1 ? 'pessoa' : 'pessoas'} no mapa de ${fmtData(dia.de)} a ${fmtData(dia.ate)}, em faixas fixas de horas.`
    : undefined
  return (
    <CartaoApontamento
      codigo="AP-DIARIO"
      titulo="Mapa de calor pessoa × dia"
      texto={CARTOES.diario}
      leitura={leitura}
      aplicaveis={['equipe']} // o servidor recorta o mapa pela Equipe (K-286); os demais filtros não o afetam e a janela é a própria
      familiaCriterio="calendario"
      acoes={<SeletorJanela />}
      className="lg:col-span-12"
    >
      {(r) => <Diario r={r} />}
    </CartaoApontamento>
  )
}
