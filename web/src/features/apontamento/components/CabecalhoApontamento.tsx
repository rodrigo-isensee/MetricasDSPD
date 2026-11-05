import { SeloFrescor, Icone } from '@/components/ui'
import { fmtData, fmtDataCurta } from '@/lib/formatar'
import { useId, useState } from 'react'
import { horasDesde } from '../formatar'
import {
  AVISO_NOME_REAL,
  AVISO_NOME_REAL_DETALHE,
  CLAUSULAS,
  FINALIDADE_CURTA,
  FINALIDADE_LONGA_ABERTURA,
  FINALIDADE_LONGA_FECHO,
} from '../textos'
import type { RespostaApontamento } from '../types'

const AVISO_PARCIAL_FIM = 'alguns apontamentos podem estar faltando.'

/** Última coleta parcial mais nova que a última ok (ou sem ok): devolve o fim dela; senão, null. */
function fimParcialRecente(frescor: RespostaApontamento['frescor']): string | null {
  const t = frescor.ultimaTentativa
  if (t?.resultado !== 'parcial') return null
  if (frescor.ultimaColetaOk && Date.parse(t.fim) <= Date.parse(frescor.ultimaColetaOk)) return null
  return t.fim
}

/** Selo de frescor da fonte BusinessMap e período dos dados (CA-1); sem resposta, só o aviso de carregamento. */
export function FrescorEPeriodo({ resposta }: { resposta: RespostaApontamento | undefined }) {
  if (!resposta)
    return (
      // O anúncio fica na região viva da página; este texto é só visual, para não ser lido duas vezes.
      <p aria-hidden="true" className="text-sm text-texto-2" data-testid="frescor-carregando">
        Carregando apontamentos
      </p>
    )
  const fimParcial = fimParcialRecente(resposta.frescor)
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SeloFrescor
        selo={resposta.frescor.selo}
        horas={horasDesde(resposta.frescor.ultimaColetaOk)}
        testid="selo-frescor-businessmap"
      />
      {fimParcial && (
        <span className="flex items-center gap-1 text-sm text-atencao" data-testid="aviso-parcial">
          <Icone nome="alerta" className="size-4" /> Última coleta parcial em{' '}
          {fmtDataCurta(fimParcial)} às {fimParcial.slice(11, 16)}: {AVISO_PARCIAL_FIM}
        </span>
      )}
      <span className="text-sm text-texto-2" data-testid="periodo-dos-dados">
        Dados de {fmtData(resposta.periodo.de)} a {fmtData(resposta.periodo.ate)}
      </span>
      {resposta.frescor.selo === 'atrasado' && (
        <span className="flex items-center gap-1 text-sm text-atencao" data-testid="aviso-defasado">
          <Icone nome="relogio" className="size-4" /> Os dados abaixo são da última coleta e podem
          estar desatualizados.
        </span>
      )}
    </div>
  )
}

/** Legenda persistente da finalidade, com "Saiba mais" (texto longo com as quatro cláusulas). */
export function LegendaFinalidade() {
  const [aberta, setAberta] = useState(false)
  const id = useId()
  return (
    <div className="flex flex-col gap-1 text-sm" data-testid="legenda-finalidade">
      <p className="text-texto">
        {FINALIDADE_CURTA}{' '}
        <button
          type="button"
          className="alvo inline-flex items-center text-acento underline"
          aria-expanded={aberta}
          aria-controls={id}
          onClick={() => setAberta((a) => !a)}
        >
          Saiba mais
        </button>
      </p>
      <div
        id={id}
        hidden={!aberta}
        className="rounded-md border border-borda bg-superficie-2 p-3 text-texto-2"
      >
        <p>{FINALIDADE_LONGA_ABERTURA}</p>
        <ul className="my-1 list-disc pl-5">
          {CLAUSULAS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p>{FINALIDADE_LONGA_FECHO}</p>
      </div>
    </div>
  )
}

/** Faixa fixa quando `nomesReais`: ícone e texto, `role="status"`, não dispensável nem ocultável por preferência. */
export function AvisoNomeReal() {
  return (
    <div
      role="status"
      className="flex flex-col gap-1 rounded-md border border-atencao bg-atencao-fundo p-3 text-sm text-texto"
      data-testid="aviso-nome-real"
    >
      <p className="flex items-center gap-2 font-semibold">
        <Icone nome="alerta" className="size-4 text-atencao" /> {AVISO_NOME_REAL}
      </p>
      <details className="text-texto-2">
        <summary className="cursor-pointer">Por que os nomes aparecem</summary>
        <p className="mt-1">{AVISO_NOME_REAL_DETALHE}</p>
      </details>
    </div>
  )
}
