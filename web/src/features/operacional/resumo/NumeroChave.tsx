import { Link } from 'react-router'
import {
  Botao,
  Icone,
  SeloCalibracao,
  StatusMeta,
  useEmCalibracao,
  usePreferenciasPainel,
} from '@/components/ui'
import type { EstadoMetrica } from '@/data'
import { ROTULO_VISAO, type Visao } from '@/features/navegacao/visao'
import { useDestinoNaVisao } from './destinos'
import type { NumeroModelo } from './modelo'

interface Props {
  /** Estado da consulta da métrica de origem; `vazio` (nenhum item no recorte) mostra o modelo como veio. */
  estado: EstadoMetrica
  modelo: NumeroModelo | null
  /** Rótulo do número enquanto não há modelo (carregando e erro). */
  rotulo: string
  id: NumeroModelo['id']
  codigo: string
  onTentarDeNovo: () => void
  /** Visão dona do cartão de origem (o link "Ver O3 na Semanal"). */
  visao: Visao
}

/** Um número-chave do Resumo: valor, unidade, base, meta e situação em texto com ícone, e o link para a visão dona. */
export function NumeroChave({ estado, modelo, rotulo, id, codigo, onTentarDeNovo, visao }: Props) {
  const destinoDe = useDestinoNaVisao()
  const prefs = usePreferenciasPainel()
  const emCalibracao = useEmCalibracao()
  const cartao = codigo.toLowerCase()
  const oculto = prefs?.estaOculto(cartao) ?? false
  let corpo
  if (oculto) {
    corpo = (
      <div className="flex flex-col items-start gap-1 text-sm" data-testid={`numero-${id}-oculto`}>
        <span>{codigo} oculta nas suas preferências.</span>
        <Botao className="text-xs" onClick={() => prefs?.mostrar(cartao)}>
          Mostrar {codigo}
        </Botao>
      </div>
    )
  } else if (estado === 'erro') {
    corpo = (
      <div
        className="flex flex-col items-start gap-1 text-sm text-alerta"
        data-testid={`numero-${id}-erro`}
      >
        <span className="flex items-center gap-1">
          <Icone nome="alerta" /> Não foi possível carregar este número.
        </span>
        <Botao className="text-xs" onClick={onTentarDeNovo}>
          Tentar de novo
        </Botao>
      </div>
    )
  } else if (estado === 'carregando' || !modelo) {
    corpo = (
      <div
        className="min-h-[98px] text-sm text-texto-2"
        aria-busy="true"
        data-testid={`numero-${id}-carregando`}
      >
        <span className="sr-only">Carregando {codigo}…</span>
        <span aria-hidden="true" className="block h-8 w-24 rounded bg-superficie-2" />
      </div>
    )
  } else {
    corpo = (
      <div className="flex flex-col gap-1">
        {modelo.valor === null ? (
          <span className="text-sm" data-testid={`numero-${id}-insuficiente`}>
            {modelo.insuficiente}
          </span>
        ) : (
          <span className="text-2xl font-bold tabular-nums" data-testid={`numero-${id}-valor`}>
            {modelo.valor}{' '}
            <span className="text-sm font-normal text-texto-2">{modelo.unidade}</span>
          </span>
        )}
        {modelo.secundario && <span className="text-xs text-texto-2">{modelo.secundario}</span>}
        <span className="text-xs text-texto-2">Base: {modelo.base}</span>
        {modelo.meta && <span className="text-xs text-texto-2">{modelo.meta}</span>}
        {emCalibracao(codigo) ? (
          <SeloCalibracao texto="Em calibração: sem avaliação de meta" />
        ) : (
          modelo.status && <StatusMeta status={modelo.status} />
        )}
      </div>
    )
  }
  // `dl` só aceita `dt` e `dd` (ou `div` que os agrupe): o conteúdo e o link ficam dentro do `dd`.
  return (
    <div
      className="flex flex-col gap-1 rounded-md border border-borda bg-superficie-2 p-3"
      data-testid={`numero-${id}`}
    >
      <dt className="text-sm font-semibold">{modelo?.rotulo ?? rotulo}</dt>
      <dd className="m-0 flex flex-col gap-1">
        {corpo}
        {!oculto && (
          <Link
            to={destinoDe(`#${cartao}`)}
            className="alvo inline-flex items-center text-sm text-acento underline"
          >
            Ver {codigo} na {ROTULO_VISAO[visao]}
          </Link>
        )}
      </dd>
    </div>
  )
}
