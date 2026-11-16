import type { FiltrosFluxo, ResultadoO27 } from '@metricas-dspd/contratos'
import { useMetrica } from '@/data'
import { fmtData, fmtInteiro, fmtPct } from '@/lib/formatar'
import { CartaoComplementar } from './CartaoComplementar'
import { Leia, LinkO15 } from './comuns'

type Coluna = ResultadoO27['porTipo'][number]
type Causa = NonNullable<Coluna['causas']>[number]

const MINIMO = 20
const ID_CRITERIO = 'criterio-2026-11-16-o27-causa-raiz-bug'

const bugs = (n: number): string => `${fmtInteiro(n)} ${n === 1 ? 'bug' : 'bugs'}`

const cabecalho = (c: Coluna): string => `${c.tipo} (${c.n === 0 ? 'nenhum bug' : bugs(c.n)})`

/** As 3 maiores causas por n, com todas as empatadas no 3º lugar; causa com n = 0 nunca entra. A ordem das linhas não muda. */
function tresMaiores(causas: readonly Causa[]): ReadonlySet<string> {
  const positivas = causas.filter((c) => c.n > 0).map((c) => c.n)
  const corte = [...positivas].sort((a, b) => b - a)[Math.min(2, positivas.length - 1)] as number
  return new Set(causas.filter((c) => c.n > 0 && c.n >= corte).map((c) => c.causa))
}

function ListaDeCausas({ causas }: { causas: readonly Causa[] }) {
  const maiores = tresMaiores(causas)
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
      {causas.map((c) => {
        const destaque = maiores.has(c.causa)
        return (
          <li key={c.causa} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
              <span className="text-texto">{c.rotulo}</span>
              <span className="tabular-nums text-texto">
                {fmtInteiro(c.n)} ({fmtPct(c.pct, 0)})
                {destaque && (
                  <span className="ml-2 font-semibold text-acento" data-testid="o27-maior">
                    3 maiores
                  </span>
                )}
              </span>
            </div>
            <div aria-hidden="true" className="h-2 w-full rounded-sm bg-superficie-2">
              <div
                className={`h-2 rounded-sm ${destaque ? 'bg-acento' : 'bg-texto-2/40'}`}
                style={{ width: `${Math.max(0, Math.min(100, c.pct))}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function ColunaTipo({ c }: { c: Coluna }) {
  return (
    <section
      className="flex flex-col gap-3 rounded-md border border-borda p-3"
      aria-labelledby={`o27-${c.tipo === 'Bug interno' ? 'interno' : 'producao'}`}
      data-testid={`o27-coluna-${c.tipo === 'Bug interno' ? 'interno' : 'producao'}`}
    >
      <h3
        id={`o27-${c.tipo === 'Bug interno' ? 'interno' : 'producao'}`}
        className="text-base font-semibold text-texto"
      >
        {cabecalho(c)}
      </h3>
      {c.causas ? (
        <>
          <ListaDeCausas causas={c.causas} />
          <p className="text-sm text-texto-2" data-testid="o27-base">
            Base dos percentuais: {bugs(c.comCausa)} com causa.
          </p>
          <p className="text-sm text-texto" data-testid="o27-nao-informada">
            Causa não informada: {bugs(c.naoInformada)}
          </p>
        </>
      ) : (
        <div className="flex flex-col gap-1 text-sm text-texto">
          <p>Bugs do tipo: {fmtInteiro(c.n)}</p>
          <p data-testid="o27-nao-informada">Causa não informada: {fmtInteiro(c.naoInformada)}</p>
          <p>Bugs com causa: {fmtInteiro(c.comCausa)}</p>
          <p data-testid="o27-aviso">
            Menos de {MINIMO} bugs com causa ({fmtInteiro(c.comCausa)} de {MINIMO} mínimos); a
            distribuição não é mostrada.
          </p>
        </div>
      )}
    </section>
  )
}

/** O27: causa raiz dos bugs do BusinessMap, uma coluna por tipo, nunca somadas; sem pessoa. */
export function CartaoO27({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('O27', filtros)
  return (
    <CartaoComplementar id="O27" q={q} semBase className="lg:col-span-12">
      {(r) => {
        const marca = [...r.criterios.serie, ...r.criterios.janela].find(
          (m) => m.id === ID_CRITERIO,
        )
        return (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-texto" data-testid="o27-nota">
              Bug do BusinessMap, não incidente do Acelerato. Não somar com o O17 nem com o S3.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {r.porTipo.map((c) => (
                <ColunaTipo key={c.tipo} c={c} />
              ))}
            </div>
            <p className="text-sm text-texto-2">Por sistema: {r.motivoPorSistema}.</p>
            <Leia>
              Leia junto com <LinkO15 />, Estoque e idade de bugs (O16) e, na visão Sustentação
              (Acelerato), Causa raiz e concentração (O17).
            </Leia>
            {marca && <p className="text-xs text-texto-2">Critério desde {fmtData(marca.data)}.</p>}
          </div>
        )
      }}
    </CartaoComplementar>
  )
}
