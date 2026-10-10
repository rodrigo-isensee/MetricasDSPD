import clsx from 'clsx'
import { useEffect, useId, useState, type ReactNode } from 'react'
import {
  JANELA_PERCENTIS_PADRAO,
  type BaseAmostral,
  type CriteriosResultado,
  type Periodo,
} from '@metricas-dspd/contratos'
import type { FiltroFluxoChave } from '@metricas-dspd/contratos'
import { fmtData, fmtDataCurta } from '@/lib/formatar'
import { AlternarTabela } from './AlternarTabela'
import { AvisoCriterio } from './AvisoCriterio'
import { BadgeBase } from './BadgeBase'
import { ChipFiltros, ChipFonte, ChipGranularidade, ChipMeta } from './Chips'
import { useContextoPainel } from './ContextoPainel'
import { ALTURAS_ESQUELETO } from './alturasEsqueleto'
import { ALTURA_ESQUELETO_PADRAO, EsqueletoCartao, useEsqueleto } from './EsqueletoCartao'
import { EstadoErro } from './EstadoErro'
import { EstadoVazio } from './EstadoVazio'
import { ModoTabelaContext, type ModoVisual } from './ModoTabela'
import { BlocoNota, BotaoNota, type TextoNota } from './NotaMetodologica'
import { SeloJanela } from './SeloJanela'
import { StatusMeta } from './StatusMeta'
import type { StatusMeta as Status } from '@metricas-dspd/contratos'

export type EstadoCartao = 'carregando' | 'erro' | 'vazio' | 'ok'

export interface CartaoMetricaProps {
  /** Código da métrica (O2, T9, S1, EI). Vira o `id` (minúsculo) e o `data-testid` (`metrica-O2`). */
  codigo: string
  titulo: string
  /** A pergunta que o gráfico responde, em linguagem do dia a dia. */
  pergunta: string
  estado: EstadoCartao
  /** Esmaece o conteúdo anterior enquanto busca novos dados (6.1). */
  atualizando?: boolean
  base?: BaseAmostral
  /** `insuficiente`: a estatística principal não é publicada; `censo`: "k de n". */
  baseVariante?: 'ok' | 'insuficiente' | 'censo'
  baseK?: number
  /** Frase de leitura gerada a partir dos dados (princípio 4). */
  leitura?: string
  nota: TextoNota
  /** Texto da meta ("Reduzir o P85 em 20% no semestre"). */
  meta?: ReactNode
  /** Status da meta; só quando a meta é numérica (D10). */
  statusMeta?: Status | 'sem-meta'
  textoStatus?: string
  fonte: 'BusinessMap' | 'Acelerato'
  granularidade: 'demanda' | 'frente' | 'projeto' | 'chamado'
  /** Filtros que atuam no cartão (tabela 2.2). Omitido = todos os ativos atuam (sustentação). */
  aplicaveis?: readonly FiltroFluxoChave[]
  criterios?: CriteriosResultado
  /**
   * Janela de percentis do resultado (`janelaPercentis` do DTO) e período escolhido: com os dois, o
   * cartão decide sozinho se mostra "Janela fixa: N semanas" (quando o período difere da janela).
   */
  janelaPercentis?: { unidade: 'semanas' | 'meses'; quantidade: number }
  periodo?: Periodo
  /** Selos extras. */
  selos?: ReactNode
  /** Controles do cabeçalho do cartão além de "Como ler" e "Ver como tabela". */
  acoes?: ReactNode
  /** Sem alternativa em tabela (listas que já são tabelas). */
  semTabela?: boolean
  variante?: 'padrao' | 'compacto'
  onTentarDeNovo?: () => void
  erro?: Error | null
  className?: string
  /** Altura reservada para o esqueleto (padrão: gráfico + frase de leitura, sem salto de layout). */
  alturaEsqueleto?: number
  children?: ReactNode
}

const ROTULO_FILTRO: Record<string, string> = {
  equipe: 'Equipe',
  tipo: 'Tipo de demanda',
  sistema: 'Sistema',
  periodo: 'Período',
  prioridade: 'Prioridade',
}

/**
 * Cartão de métrica (anatomia 4.0): cabeçalho (código, título, nota, tabela, base), pergunta, frase
 * de leitura, corpo e rodapé. Trata os quatro estados; "amostra insuficiente" é por estatística,
 * dentro do corpo (use `AmostraInsuficiente`). Nenhum número é escrito aqui.
 */
/** Períodos que coincidem com a janela de percentis (em semanas): nestes o selo "Janela fixa" não aparece. */
const SEMANAS_DO_PERIODO: Partial<Record<Periodo['tipo'], number>> = { '4s': 4, '12s': 12 }

export function CartaoMetrica(p: CartaoMetricaProps) {
  const [modo, setModo] = useState<ModoVisual>('grafico')
  const [notaAberta, setNotaAberta] = useState(false)
  const idTitulo = useId()
  const idLeitura = useId()
  const idNota = useId()
  const { filtrosAtivos, reportarAtualizando } = useContextoPainel()
  const id = p.codigo.toLowerCase()
  // O tempo mínimo do esqueleto vive aqui, que continua montado quando os dados chegam (6.1).
  const esq = useEsqueleto(p.estado === 'carregando')
  const estado = esq.mostrar ? 'carregando' : p.estado
  const ok = estado === 'ok'
  const alturaCorpo = p.alturaEsqueleto ?? ALTURAS_ESQUELETO[p.codigo] ?? ALTURA_ESQUELETO_PADRAO
  const atualizando = ok && !!p.atualizando

  useEffect(() => {
    reportarAtualizando(id, atualizando)
    return () => reportarAtualizando(id, false)
  }, [id, atualizando, reportarAtualizando])

  const aplicados = filtrosAtivos.filter(
    (f) => !p.aplicaveis || p.aplicaveis.includes(f.chave as FiltroFluxoChave),
  )
  const naoAfetam = [
    ...new Set(
      filtrosAtivos
        .filter((f) => p.aplicaveis && !p.aplicaveis.includes(f.chave as FiltroFluxoChave))
        .map((f) => ROTULO_FILTRO[f.chave] ?? f.rotulo),
    ),
  ]
  const textoAplicados = aplicados.map((f) => `${f.rotulo} ${f.valor}`)

  const j = p.base?.janela
  const janelaTxt = p.janelaPercentis ?? JANELA_PERCENTIS_PADRAO
  const semanasJanela = janelaTxt.unidade === 'semanas' ? janelaTxt.quantidade : null
  const janelaFixa =
    !!p.janelaPercentis &&
    !!p.periodo &&
    (semanasJanela === null || SEMANAS_DO_PERIODO[p.periodo.tipo] !== semanasJanela)
  const nesta = {
    janela: j ? `${fmtDataCurta(j.inicio)} a ${fmtData(j.fim)}` : null,
    filtros: textoAplicados.length ? textoAplicados.join(' · ') : null,
    base: p.base ? `${p.base.n} ${p.base.unidade}` : null,
  }
  // Esmaece só se a atualização passar de 150 ms (6.1): resposta rápida não faz o cartão piscar.
  const [demora, setDemora] = useState(false)
  useEffect(() => {
    if (!atualizando) return
    const t = setTimeout(() => setDemora(true), 150)
    return () => {
      clearTimeout(t)
      setDemora(false)
    }
  }, [atualizando])
  const esmaece = clsx('transition-opacity motion-reduce:transition-none', demora && 'opacity-80')

  return (
    <div
      id={id}
      role="group"
      data-testid={`metrica-${p.codigo}`}
      aria-labelledby={idTitulo}
      aria-busy={estado === 'carregando' || atualizando || undefined}
      data-estado={atualizando ? 'atualizando' : estado}
      className={clsx(
        'rounded-lg border border-borda bg-superficie text-texto',
        p.variante === 'compacto' ? 'p-3' : 'p-4',
        p.className,
      )}
    >
      <header>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded bg-acento-fundo px-2 py-0.5 text-xs font-bold text-acento">
              {p.codigo}
            </span>
            <h3 id={idTitulo} tabIndex={-1} data-cartao-titulo className="text-base font-semibold">
              {p.titulo}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BotaoNota
              aberta={notaAberta}
              onAlternar={() => setNotaAberta((a) => !a)}
              controla={idNota}
            />
            {p.acoes}
            {ok && !p.semTabela && (
              <AlternarTabela
                modo={modo}
                onAlternar={() => setModo((m) => (m === 'grafico' ? 'tabela' : 'grafico'))}
                codigo={p.codigo}
              />
            )}
          </div>
        </div>
        {/* Base e selos na linha do título; a altura é reservada para não saltar ao carregar. */}
        <div className={clsx('mt-1 flex min-h-6 flex-wrap items-center gap-2', esmaece)}>
          {p.base && (
            <BadgeBase
              base={p.base}
              variante={p.baseVariante ?? 'ok'}
              {...(p.baseK !== undefined ? { k: p.baseK } : {})}
              data-testid={`base-${p.codigo}`}
            />
          )}
          {janelaFixa && <SeloJanela janela={janelaTxt} />}
          {p.selos}
        </div>
        <BlocoNota
          id={idNota}
          aberta={notaAberta}
          nota={p.nota}
          nestaTela={nesta}
          testid={`nota-${p.codigo}`}
        />
      </header>

      <p className="mt-2 text-sm text-texto-2">{p.pergunta}</p>

      {estado === 'carregando' && (
        <div className="mt-3">
          <EsqueletoCartao
            codigo={p.codigo}
            titulo={p.titulo}
            altura={alturaCorpo}
            brilho={esq.brilho}
          />
        </div>
      )}
      {estado === 'erro' && (
        <div className="mt-3">
          <EstadoErro
            codigo={p.codigo}
            erro={p.erro ?? null}
            {...(p.onTentarDeNovo ? { onTentarDeNovo: p.onTentarDeNovo } : {})}
          />
        </div>
      )}
      {estado === 'vazio' && (
        <div className="mt-3">
          <EstadoVazio codigo={p.codigo} />
        </div>
      )}

      {ok && (
        <ModoTabelaContext.Provider
          value={{
            modo,
            idLeitura,
            legenda: `${p.codigo} ${p.titulo}. ${p.pergunta}`,
            codigo: p.codigo,
          }}
        >
          <div className="mt-1" style={{ minHeight: alturaCorpo }}>
            {p.leitura && (
              <p
                id={idLeitura}
                className={clsx('mt-2 text-sm font-medium', esmaece)}
                data-testid={`leitura-${p.codigo}`}
              >
                {p.leitura}
              </p>
            )}
            {p.criterios && (
              <div className="mt-2 flex flex-col gap-2">
                <AvisoCriterio marcacoes={p.criterios.serie} />
                <AvisoCriterio
                  marcacoes={p.criterios.janela.filter(
                    (m) => !p.criterios?.serie.some((s) => s.id === m.id),
                  )}
                  tipo="janela"
                  janela={janelaTxt}
                />
              </div>
            )}
            <div className={clsx('mt-3', esmaece)}>{p.children}</div>
          </div>
        </ModoTabelaContext.Provider>
      )}

      <footer className="mt-3 flex flex-wrap items-center gap-2">
        {p.meta && <ChipMeta>{p.meta}</ChipMeta>}
        {p.statusMeta && ok && (
          <StatusMeta status={p.statusMeta} {...(p.textoStatus ? { texto: p.textoStatus } : {})} />
        )}
        <ChipFonte fonte={p.fonte} />
        <ChipGranularidade granularidade={p.granularidade} />
        <ChipFiltros aplicados={textoAplicados} naoAfetam={naoAfetam} />
      </footer>
    </div>
  )
}
