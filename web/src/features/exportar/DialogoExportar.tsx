import { useEffect, useId, useRef, useState } from 'react'
import { Dialog } from 'radix-ui'
import { Link } from 'react-router'
import { Botao, Icone } from '@/components/ui'
import { LIMITE_METRICAS, RODAPE_PADRAO, TEXTO_FICTICIO } from './modelo'
import {
  NIVEIS,
  previa,
  selecaoInicial,
  type ItemExportavel,
  type NivelExportacao,
} from './selecao'

export type BaseExportacao = 'visao-geral' | 'personalizada' | NivelExportacao

export interface ArquivoGerado {
  nome: string
  blob: Blob
}

type Estado =
  | { tipo: 'ocioso' }
  | { tipo: 'gerando' }
  | { tipo: 'pronto'; nome: string; url: string }
  | { tipo: 'erro' }

const OCIOSO: Estado = { tipo: 'ocioso' }

interface Props {
  base: BaseExportacao
  /** Métricas VISÍVEIS dos níveis do diálogo (as ocultas nunca chegam aqui). */
  itens: readonly ItemExportavel[]
  mock: boolean
  /** Preferências ainda carregando: a lista de visíveis não é confiável. */
  carregando?: boolean
  gerar: (selecionados: readonly ItemExportavel[]) => Promise<ArquivoGerado>
  /** Relógio injetado (nome do arquivo na prévia). */
  agora: () => Date
}

const TITULO: Record<'visao-geral' | 'personalizada' | 'painel', string> = {
  'visao-geral': 'Exportar a Visão geral',
  personalizada: 'Exportação personalizada',
  painel: 'Exportar métricas',
}

/**
 * Diálogo de exportação (pedido 008): marca as métricas visíveis, mostra a prévia do arquivo e gera o PDF.
 * No "Exportar" do painel nasce com tudo marcado; na personalizada, vazio, nível a nível. A Visão geral
 * não tem escolha: exporta o resumo inteiro. Foco preso, Esc e retorno do foco vêm do Radix.
 */
export function DialogoExportar({ base, itens, mock, carregando = false, gerar, agora }: Props) {
  const [aberto, setAberto] = useState(false)
  const [sel, setSel] = useState<string[]>([])
  const [estado, setEstado] = useState<Estado>(OCIOSO)
  const descartar = useRef(false)
  const baixar = useRef<HTMLAnchorElement>(null)
  const idLimite = useId()
  const visaoGeral = base === 'visao-geral'
  const personalizada = base === 'personalizada'
  const nivelUnico = !visaoGeral && !personalizada
  const selecionados = itens.filter((i) => sel.includes(i.chave))
  const noLimite = sel.length >= LIMITE_METRICAS
  const semNada = !visaoGeral && itens.length === 0 && !carregando
  const pode = !carregando && estado.tipo !== 'gerando' && (visaoGeral || selecionados.length > 0)
  const urlAtual = estado.tipo === 'pronto' ? estado.url : null

  // Libera o arquivo da memória quando a URL muda ou o diálogo sai de cena.
  useEffect(() => (urlAtual ? () => URL.revokeObjectURL(urlAtual) : undefined), [urlAtual])
  useEffect(() => {
    if (estado.tipo === 'pronto') baixar.current?.focus()
  }, [estado.tipo])

  const abrir = (v: boolean) => {
    descartar.current = !v
    if (v) {
      setSel(personalizada || visaoGeral ? [] : selecaoInicial(itens))
      setEstado(OCIOSO)
    }
    setAberto(v)
  }

  const alternar = (chave: string, marcar: boolean) => {
    setSel((s) => (marcar ? [...s, chave] : s.filter((x) => x !== chave)))
    setEstado(OCIOSO)
  }

  const aoGerar = async () => {
    setEstado({ tipo: 'gerando' })
    try {
      const arquivo = await gerar(selecionados)
      if (descartar.current) return
      setEstado({ tipo: 'pronto', nome: arquivo.nome, url: URL.createObjectURL(arquivo.blob) })
    } catch {
      // Sem detalhe técnico e sem arquivo parcial (plano 008, seção 5).
      if (!descartar.current) setEstado({ tipo: 'erro' })
    }
  }

  const p = previa(base, selecionados, agora(), mock)
  const rotuloBotao = personalizada ? 'Exportação personalizada' : 'Exportar'
  const niveis = personalizada ? NIVEIS : NIVEIS.filter((n) => n.id === base)

  return (
    <Dialog.Root open={aberto} onOpenChange={abrir}>
      <Dialog.Trigger asChild>
        <Botao
          aria-haspopup="dialog"
          data-testid={personalizada ? 'botao-exportar-personalizada' : 'botao-exportar'}
        >
          <Icone nome="seta" className="size-4 rotate-90" />
          <span>{rotuloBotao}</span>
        </Botao>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col overflow-hidden rounded-t-lg border border-borda-controle bg-superficie shadow-xl lg:inset-auto lg:left-1/2 lg:top-1/2 lg:max-h-[85dvh] lg:w-[52rem] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-lg"
          data-testid="dialogo-exportar"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-4" data-testid="exportar-corpo">
            <Dialog.Title className="text-lg font-bold">
              {TITULO[visaoGeral || personalizada ? base : 'painel']}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-texto-2">
              Gera um arquivo PDF só com o que está visível na tela, com base, janela, filtros e
              notas de cada métrica. Sem nomes de pessoas.
            </Dialog.Description>
            <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col gap-3">
                {carregando && (
                  <p role="status" className="text-sm" data-testid="exportar-carregando">
                    Carregando as métricas visíveis...
                  </p>
                )}
                {visaoGeral && (
                  <p className="text-sm">
                    A Visão geral é exportada inteira: Operacional, Tático e Estratégico
                    (BusinessMap) e Sustentação (Acelerato), cada um em bloco separado.
                  </p>
                )}
                {semNada && (
                  <div data-testid="exportar-vazio" className="text-sm">
                    <p className="font-semibold">
                      Nenhuma métrica visível para exportar. Marque ao menos uma.
                    </p>
                    <p className="text-texto-2">
                      Escolha as métricas em &quot;Métricas&quot; neste painel ou em{' '}
                      <Link to="/preferencias" className="text-acento underline">
                        Preferências
                      </Link>
                      .
                    </p>
                  </div>
                )}
                {!visaoGeral &&
                  !carregando &&
                  !semNada &&
                  niveis.map((n) => {
                    const doNivel = itens.filter((i) => i.nivel === n.id)
                    return (
                      <fieldset key={n.id} className="m-0 min-w-0 border-0 p-0">
                        <legend className="text-sm font-semibold">{n.rotulo}</legend>
                        {doNivel.length === 0 ? (
                          <p className="text-sm text-texto-2">
                            Nenhuma métrica visível neste nível.
                          </p>
                        ) : (
                          <ul className="m-0 list-none p-0">
                            {doNivel.map((i) => {
                              const marcado = sel.includes(i.chave)
                              return (
                                <li key={i.chave}>
                                  <label className="alvo flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-superficie-2">
                                    <input
                                      type="checkbox"
                                      className="size-4 accent-[var(--acento)]"
                                      checked={marcado}
                                      disabled={!marcado && noLimite}
                                      aria-describedby={!marcado && noLimite ? idLimite : undefined}
                                      onChange={(e) => alternar(i.chave, e.target.checked)}
                                    />
                                    <span>
                                      <strong>{i.codigo}</strong> {i.rotulo}{' '}
                                      <span className="text-xs text-texto-2">({i.fonte})</span>
                                    </span>
                                  </label>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </fieldset>
                    )
                  })}
                {nivelUnico || personalizada ? (
                  <p id={idLimite} className="text-xs text-texto-2">
                    {noLimite
                      ? `Limite de ${LIMITE_METRICAS} métricas por arquivo. Desmarque uma para incluir outra.`
                      : `${sel.length} de ${LIMITE_METRICAS} métricas por arquivo.`}
                  </p>
                ) : null}
              </div>
              <section
                aria-label="Prévia do arquivo"
                className="min-w-0 rounded-md border border-borda bg-superficie-2 p-3 text-sm"
                data-testid="exportar-previa"
              >
                <h3 className="font-semibold">Prévia do arquivo</h3>
                <p className="break-all text-xs text-texto-2">{p.nome}</p>
                {mock && (
                  <p className="mt-1 w-fit rounded border border-atencao bg-atencao-fundo px-2 text-xs font-semibold text-atencao">
                    {TEXTO_FICTICIO} em todas as páginas
                  </p>
                )}
                {visaoGeral ? (
                  <p className="mt-2">Seções: BusinessMap, depois Acelerato.</p>
                ) : p.secoes.length === 0 ? (
                  <p className="mt-2 text-texto-2">
                    Marque ao menos uma métrica para ver a prévia.
                  </p>
                ) : (
                  <ul className="mt-2 list-none p-0">
                    {p.secoes.map((s) => (
                      <li key={s.fonte}>
                        <strong>{s.fonte}</strong> ({s.codigos.length}): {s.codigos.join(', ')}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-xs text-texto-2">{RODAPE_PADRAO}</p>
              </section>
            </div>
          </div>
          <div
            className="shrink-0 border-t border-borda bg-superficie p-4"
            data-testid="exportar-rodape"
          >
            <div
              role="status"
              aria-live="polite"
              className="min-h-5 text-sm"
              data-testid="exportar-status"
            >
              {estado.tipo === 'gerando' && 'Gerando...'}
              {estado.tipo === 'pronto' && `Arquivo pronto: ${estado.nome}.`}
            </div>
            {estado.tipo === 'erro' && (
              <p
                role="alert"
                className="mt-2 rounded border border-alerta bg-alerta-fundo p-2 text-sm font-semibold text-alerta"
                data-testid="exportar-erro"
              >
                Não foi possível gerar o arquivo. Tente de novo.
              </p>
            )}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto">
              {estado.tipo === 'pronto' ? (
                <a
                  ref={baixar}
                  href={estado.url}
                  download={estado.nome}
                  className="alvo inline-flex items-center justify-center rounded-md border border-transparent bg-acento px-3 py-1.5 text-sm font-medium text-acento-texto hover:underline"
                >
                  Baixar
                </a>
              ) : (
                <Botao variante="primario" disabled={!pode} onClick={() => void aoGerar()}>
                  Gerar arquivo
                </Botao>
              )}
              {!visaoGeral &&
                !carregando &&
                !semNada &&
                selecionados.length < Math.min(itens.length, LIMITE_METRICAS) && (
                  <Botao
                    onClick={() => {
                      setSel(itens.slice(0, LIMITE_METRICAS).map((i) => i.chave))
                      setEstado(OCIOSO)
                    }}
                  >
                    {`Marcar todas (até ${LIMITE_METRICAS})`}
                  </Botao>
                )}
              {sel.length > 0 && !visaoGeral && (
                <Botao
                  onClick={() => {
                    setSel([])
                    setEstado(OCIOSO)
                  }}
                >
                  Limpar seleção
                </Botao>
              )}
              <Dialog.Close asChild>
                <Botao>{estado.tipo === 'pronto' ? 'Fechar' : 'Cancelar'}</Botao>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
