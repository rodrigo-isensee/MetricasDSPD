import type { ResultadoPV1 } from '@metricas-dspd/contratos'
import { CartaoMetrica, Icone } from '@/components/ui'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtPct } from '@/lib/formatar'
import { BaseInsuficiente, Distribuicao, LegendaFaixas } from './Distribuicao'
import { Tendencia } from './Tendencia'
import { fmtTri } from './formatar'
import { NOTA_PV1 } from './notas'

type Ok = Extract<ResultadoPV1, { status: 'ok' }>

/** A PV1 não tem filtros (só `dataReferencia`): o objeto é sempre o mesmo, para a chave de cache ficar estável. */
const SEM_FILTROS: Record<string, never> = {}

function SemPesquisa() {
  return (
    <div
      className="flex flex-col items-start gap-1 rounded-md border border-dashed border-borda-controle p-4 text-sm"
      data-testid="pv1-sem-pesquisa"
    >
      <p className="flex items-center gap-2 font-semibold">
        <Icone nome="info" /> Nenhuma pesquisa carregada
      </p>
      <p className="text-texto-2">
        A coordenação da sustentação publica o resultado depois de cada trimestre. Ainda não há
        resultado.
      </p>
    </div>
  )
}

/** O resultado já decide: faixa sem percentual é a que ficou abaixo de 20 respostas. */
type Publicado = Extract<Ok['consolidado'], { status: 'publicado' }>

function temSoKDeN(b: Pick<Publicado, 'perguntas'>) {
  return b.perguntas.some((p) => p.faixas.some((f) => f.contagem.status === 'insuficiente'))
}

function PorArea({ d }: { d: Ok }) {
  const p = d.porArea
  const areaKDeN = p.status === 'publicado' && p.areas.some((a) => temSoKDeN(a.bloco))
  return (
    <section aria-labelledby="pv1-por-area" className="flex flex-col gap-3" data-testid="por-area">
      <h4 id="pv1-por-area" className="text-sm font-bold">
        Por área
      </h4>
      {p.status === 'nao-publicado' ? (
        <p
          className="flex items-start gap-2 rounded-md border border-dashed border-borda-controle bg-superficie-2 p-3 text-sm"
          data-testid="pv1-area-nao-publicada"
        >
          <Icone nome="info" className="mt-0.5 size-4 shrink-0" />
          {p.motivo === 'primeiro-ciclo'
            ? 'Por área, nada é publicado no primeiro ciclo: só o consolidado, para proteger o anonimato.'
            : 'Por área, nada é publicado: nenhuma área tem respostas suficientes para aparecer sozinha. Vale só o consolidado.'}
        </p>
      ) : (
        <>
          <p className="text-sm text-texto-2">
            Em ordem alfabética, nunca em ranking. Áreas com poucas respostas são somadas em "Outras
            áreas".
          </p>
          <LegendaFaixas />
          {areaKDeN && (
            <p className="text-xs text-texto-2" data-testid="pv1-so-k-de-n-area">
              Com menos de 20 respostas só aparece a quantidade (k de n), sem percentual.
            </p>
          )}
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {p.areas.map((a) => (
              <li key={a.outras ? 'outras' : a.rotulo} data-testid="pv1-area">
                <h5 className="text-sm font-semibold">
                  {a.outras ? 'Outras áreas' : a.rotulo}{' '}
                  <span className="font-normal text-texto-2" data-testid="n-grupo">
                    · {fmtInteiro(a.bloco.n)} respostas
                  </span>
                </h5>
                <Distribuicao
                  bloco={a.bloco}
                  perguntas={d.questionario.perguntas}
                  codigo={a.outras ? 'outras' : a.rotulo}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function OQueMudou({ d }: { d: Ok }) {
  return (
    <section
      aria-labelledby="pv1-o-que-mudou"
      className="flex flex-col gap-1"
      data-testid="o-que-mudou"
    >
      <h4 id="pv1-o-que-mudou" className="text-sm font-bold">
        O que mudou por causa da pesquisa
      </h4>
      {d.oQueMudou ? (
        <>
          <p className="text-xs text-texto-2">
            Em resposta à pesquisa de {fmtTri(d.oQueMudou.trimestre)}
          </p>
          {/* Texto puro: nunca HTML. */}
          <p className="whitespace-pre-line text-sm" data-testid="pv1-o-que-mudou">
            {d.oQueMudou.texto}
          </p>
        </>
      ) : (
        <p className="text-sm text-texto-2" data-testid="pv1-o-que-mudou-vazio">
          A coordenação ainda não registrou o que mudou neste ciclo.
        </p>
      )}
    </section>
  )
}

function Corpo({ d }: { d: Ok }) {
  const { participacao: part, consolidado } = d
  // O resultado já decide: faixa sem percentual é a que ficou abaixo de 20 respostas.
  const soKDeN = consolidado.status === 'publicado' && temSoKDeN(consolidado)
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm" data-testid="pv1-participacao">
        Participação: {fmtInteiro(part.respondentes)} de {fmtInteiro(part.convidados)} convidados
        {part.taxa.status === 'ok' ? ` (${fmtPct(part.taxa.pct)})` : ''}. Sem meta de participação.
      </p>
      <p className="text-sm text-texto-2" data-testid="pv1-nao-se-aplica">
        Os filtros do painel (equipe, prioridade e período) não se aplicam a esta seção.
      </p>
      <section aria-labelledby="pv1-distribuicao" className="flex flex-col gap-2">
        <h4 id="pv1-distribuicao" className="text-sm font-bold">
          Distribuição das respostas por pergunta (consolidado)
        </h4>
        {consolidado.status === 'base-insuficiente' ? (
          <BaseInsuficiente
            n={consolidado.n}
            minimo={consolidado.minimo}
            testid="pv1-base-insuficiente"
          />
        ) : (
          <>
            <LegendaFaixas />
            <Distribuicao
              bloco={consolidado}
              perguntas={d.questionario.perguntas}
              codigo="consolidado"
            />
            {soKDeN && (
              <p className="text-xs text-texto-2" data-testid="pv1-so-k-de-n">
                Com menos de 20 respostas só aparece a quantidade (k de n), sem percentual.
              </p>
            )}
          </>
        )}
      </section>
      {d.tendencia.length > 1 && <Tendencia d={d} />}
      {d.tendencia.length === 1 && (
        <p className="text-sm text-texto-2" data-testid="pv1-sem-tendencia">
          Primeiro ciclo: ainda sem tendência. A comparação por trimestre começa no segundo ciclo.
        </p>
      )}
      <PorArea d={d} />
      <OQueMudou d={d} />
      <p className="text-sm text-texto-2" data-testid="pv1-rodape">
        O sistema não avalia pessoas nem compara áreas ou equipes. Sem meta de satisfação.
      </p>
    </div>
  )
}

/**
 * PV1: percepção de valor do serviço (pesquisa trimestral). Terceira fonte: nunca se mistura com o Acelerato
 * e não entra em nenhum cálculo com S1 a S12. O cartão só desenha o que o resultado traz (a regra do mínimo e
 * do anonimato é da biblioteca); o comentário livre nunca chega até aqui.
 */
export function CartaoPV1() {
  const q = useMetrica('PV1', SEM_FILTROS)
  const m = entradaDoCatalogo('PV1')
  const d = q.dados
  const ok = d?.status === 'ok' ? d : null
  return (
    <CartaoMetrica
      codigo="PV1"
      titulo={m.nome}
      pergunta={m.pergunta}
      estado={q.estado}
      atualizando={q.atualizando}
      {...(ok ? { base: ok.base, criterios: ok.criterios } : {})}
      {...(ok
        ? {
            leitura: `Pesquisa de ${fmtTri(ok.trimestre)}: ${fmtInteiro(ok.participacao.respondentes)} de ${fmtInteiro(ok.participacao.convidados)} convidados responderam.`,
          }
        : {})}
      nota={NOTA_PV1}
      meta={m.meta}
      fonte={m.fonte}
      granularidade={m.granularidade}
      aplicaveis={[]}
      selos={
        <>
          {ok && (
            <span
              className="inline-flex items-center rounded-md border border-borda bg-superficie-2 px-2 py-0.5 text-sm text-texto-2"
              data-testid="pv1-trimestre"
            >
              Pesquisa de {fmtTri(ok.trimestre)}
            </span>
          )}
        </>
      }
      {...(ok ? {} : { semTabela: true })}
      onTentarDeNovo={q.recarregar}
      erro={q.erro}
      className="lg:col-span-12"
    >
      {d && (ok ? <Corpo d={ok} /> : <SemPesquisa />)}
    </CartaoMetrica>
  )
}
