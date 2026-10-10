import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ParEspera, SerieLinhas } from '@/components/charts'
import {
  AmostraInsuficiente,
  CartaoMetrica,
  ModoTabelaContext,
  useModoTabela,
  NumeroGrande,
  SeletorLocal,
  type TextoNota,
} from '@/components/ui'
import type {
  FiltroFluxoChave,
  FiltrosFluxo,
  FiltrosSustentacao,
  ResultadoEI,
} from '@metricas-dspd/contratos'
import { APLICABILIDADE_FLUXO } from '@metricas-dspd/contratos'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { useMetrica, type MetricaQuery } from '@/data'
import { useParametroLocal } from '@/features/filtros'
import { fmtInteiro, fmtMes, fmtNumero, fmtPct } from '@/lib/formatar'
import { NOTAS_EI } from '../notas'

/** A evolução tem a própria tabela equivalente: testid `tabela-EI-FL1-evolucao`, sem repetir o do par. */
function ComTabelaPropria({ codigo, children }: { codigo: string; children: ReactNode }) {
  const ctx = useModoTabela()
  return (
    <ModoTabelaContext.Provider value={{ ...ctx, codigo }}>{children}</ModoTabelaContext.Provider>
  )
}

type Nivel = ResultadoEI['nivel']

interface Config {
  id: 'EI_FL1' | 'EI_FL2' | 'EI_FL3' | 'EI_SUST'
  rotulo: string
  /** Unidade escrita na interface. */
  unidade: string
  entidade: 'demandas' | 'frentes' | 'projetos' | 'chamados'
  /** Visual neutro (ícone "i") para o estado esperado de poucos itens (6.3.1). */
  lenta: boolean
}

/** Altura reservada do corpo (completo), medida em desktop; evita salto de layout (ADR 0003 F2). */
const ALTURA_EI: Partial<Record<Nivel, number>> = { FL1: 620, FL2: 570, FL3: 420, SUST: 420 }

const CFG: Record<Nivel, Config> = {
  FL1: {
    id: 'EI_FL1',
    rotulo: 'Operacional',
    unidade: 'dias úteis',
    entidade: 'demandas',
    lenta: false,
  },
  FL2: { id: 'EI_FL2', rotulo: 'Tático', unidade: 'dias úteis', entidade: 'frentes', lenta: true },
  FL3: {
    id: 'EI_FL3',
    rotulo: 'Estratégico',
    unidade: 'dias úteis',
    entidade: 'projetos',
    lenta: true,
  },
  SUST: {
    id: 'EI_SUST',
    rotulo: 'Sustentação',
    unidade: 'h úteis',
    entidade: 'chamados',
    lenta: false,
  },
}

interface Props {
  nivel: Nivel
  q: MetricaQuery<ResultadoEI>
  /** Compacto (painéis de nível): par e índice da aba escolhida + link "Ver evolução". */
  variante?: 'completo' | 'compacto'
  aplicaveis?: readonly FiltroFluxoChave[]
  periodo?: FiltrosFluxo['periodo']
  className?: string
}

const maiusculo = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Cartão de Espera invisível de UM nível: abas por segmento (uma classe por vez), sempre as duas visões juntas. */
export function CartaoEI({
  nivel,
  q,
  variante = 'completo',
  aplicaveis,
  periodo,
  className,
}: Props) {
  const cfg = CFG[nivel]
  const sufixo = nivel.toLowerCase()
  const m = entradaDoCatalogo(cfg.id)
  const d = q.dados
  const chaves = (d?.segmentos ?? []).map((s) => s.chave ?? '')
  const [aba, setAba] = useParametroLocal(`ei_${sufixo}`, chaves, chaves[0] ?? '')
  const seg = d && (d.segmentos.find((s) => (s.chave ?? '') === aba) ?? d.segmentos[0])
  const segmentado = !!d?.segmentoPor
  const rotuloSeg = seg?.rotulo ? maiusculo(seg.rotulo) : null
  const idSeg = seg?.chave ? `${sufixo}-${seg.chave}` : sufixo
  const est = seg?.estatistica
  const fmt = (v: number) =>
    nivel === 'SUST' ? `${fmtNumero(v, 2)} h úteis` : `${fmtNumero(v, 1)} dias úteis`
  const nome = rotuloSeg ? `${rotuloSeg}: ` : ''
  let leitura: string | undefined
  if (d && seg && est) {
    leitura =
      est.status === 'ok'
        ? `${nome}o cliente espera ${fmt(est.valor.cliente)} (mediana); o time tem o pedido por ${fmt(est.valor.time)}. ${fmtPct(est.valor.indicePct, 0)} do tempo do solicitante acontece fora da nossa gestão.${est.valor.acimaDe50 ? ' Acima de 50% a discussão é de fila, não de produtividade da equipe.' : ''}`
        : `${nome}${fmtInteiro(est.n)} de 20 itens mínimos: nenhuma das duas visões é publicada.`
  }
  const compacto = variante === 'compacto'

  const corpo =
    seg && est ? (
      <div className="flex flex-col gap-3" data-testid={`ei-segmento-${idSeg}`}>
        {est.status === 'ok' ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              <NumeroGrande
                data-testid={`ei-cliente-${idSeg}`}
                valor={fmtNumero(est.valor.cliente, nivel === 'SUST' ? 2 : 1)}
                rotulo={`Visão do cliente (${cfg.unidade})`}
                textoCompleto={`Visão do cliente: ${fmt(est.valor.cliente)}`}
              />
              <NumeroGrande
                data-testid={`ei-time-${idSeg}`}
                valor={fmtNumero(est.valor.time, nivel === 'SUST' ? 2 : 1)}
                rotulo={`Visão do time (${cfg.unidade})`}
                textoCompleto={`Visão do time: ${fmt(est.valor.time)}`}
              />
              <NumeroGrande
                data-testid={`ei-indice-${idSeg}`}
                valor={fmtPct(est.valor.indicePct, 0)}
                rotulo="Espera invisível"
                textoCompleto={`Espera invisível: ${fmtPct(est.valor.indicePct, 0)}`}
              />
            </div>
            <ParEspera
              cliente={est.valor.cliente}
              time={est.valor.time}
              indicePct={est.valor.indicePct}
              unidade={cfg.unidade}
              descricao={`Espera invisível, ${cfg.rotulo}`}
              segmento={rotuloSeg}
            />
          </>
        ) : (
          <AmostraInsuficiente
            n={est.n}
            codigo={`EI-${nivel}`}
            oQue="As duas visões"
            variante={cfg.lenta ? 'lenta' : 'padrao'}
            {...(cfg.entidade === 'frentes' || cfg.entidade === 'projetos'
              ? { entidade: cfg.entidade }
              : {})}
            janela={d.janelaPercentis}
          />
        )}
        {!compacto && seg.serie.some((p) => p.cliente !== null) && (
          <ComTabelaPropria codigo={`EI-${nivel}-evolucao`}>
            <SerieLinhas
              descricao={`Evolução mensal da espera invisível, ${cfg.rotulo}${rotuloSeg ? `, ${rotuloSeg}` : ''}`}
              unidade={cfg.unidade}
              formatarX={fmtMes}
              formatar={fmt}
              marcacoes={d.criterios.serie}
              pontos={seg.serie.map((p) => ({
                x: p.mes,
                valores: { cliente: p.cliente, time: p.time },
              }))}
              series={[
                { chave: 'cliente', rotulo: 'Visão do cliente', cor: 1, traco: 'solido' },
                { chave: 'time', rotulo: 'Visão do time', cor: 2, traco: 'tracejado' },
              ]}
              faixas={[{ de: 'cliente', ate: 'time', rotulo: 'Espera invisível' }]}
            />
          </ComTabelaPropria>
        )}
        {compacto && (
          <Link
            to={`/espera-invisivel#ei-${sufixo}`}
            className="alvo w-fit text-sm text-acento underline"
          >
            Ver evolução
          </Link>
        )}
        {nivel === 'SUST' && (
          <p className="text-sm text-texto-2" data-testid="ei-fonte-sust">
            Fonte diferente (Acelerato), em horas úteis. Não comparável com os níveis do BusinessMap
            (FL1 a FL3).
          </p>
        )}
      </div>
    ) : null

  return (
    <CartaoMetrica
      codigo={`EI-${nivel}`}
      titulo={`${m.nome}${rotuloSeg && compacto ? ` · ${rotuloSeg}` : ''}`}
      pergunta={m.pergunta}
      estado={q.estado}
      atualizando={q.atualizando}
      variante={compacto ? 'compacto' : 'padrao'}
      {...(d
        ? {
            base: d.base,
            criterios: d.criterios,
            janelaPercentis: d.janelaPercentis,
            ...(periodo ? { periodo } : {}),
            baseVariante: d.segmentos.every((s) => s.estatistica.status === 'insuficiente')
              ? ('insuficiente' as const)
              : ('ok' as const),
          }
        : {})}
      {...(leitura ? { leitura } : {})}
      nota={NOTAS_EI[nivel] satisfies TextoNota}
      meta={m.meta}
      fonte={m.fonte}
      granularidade={m.granularidade}
      {...(aplicaveis ? { aplicaveis } : {})}
      onTentarDeNovo={q.recarregar}
      erro={q.erro}
      className={className ?? 'lg:col-span-12'}
      alturaEsqueleto={compacto ? 300 : (ALTURA_EI[nivel] ?? 420)}
    >
      {d && seg && corpo && segmentado ? (
        <SeletorLocal
          codigo={`EI-${nivel}`}
          rotulo={d.segmentoPor === 'prioridade' ? 'Prioridade' : 'Tipo'}
          valor={seg.chave ?? ''}
          onChange={setAba}
          itens={d.segmentos.map((s) => ({
            valor: s.chave ?? '',
            rotulo: s.rotulo ?? '',
            contagem: s.n,
            insuficiente: s.estatistica.status === 'insuficiente',
          }))}
        >
          {corpo}
        </SeletorLocal>
      ) : (
        corpo
      )}
    </CartaoMetrica>
  )
}

export function CartaoEIFL1({
  filtros,
  ...p
}: { filtros: FiltrosFluxo } & Omit<Props, 'nivel' | 'q'>) {
  return (
    <CartaoEI
      nivel="FL1"
      q={useMetrica('EI_FL1', filtros)}
      aplicaveis={APLICABILIDADE_FLUXO.EI_FL1 ?? []}
      periodo={filtros.periodo}
      {...p}
    />
  )
}
export function CartaoEIFL2({
  filtros,
  ...p
}: { filtros: FiltrosFluxo } & Omit<Props, 'nivel' | 'q'>) {
  return (
    <CartaoEI
      nivel="FL2"
      q={useMetrica('EI_FL2', filtros)}
      aplicaveis={APLICABILIDADE_FLUXO.EI_FL2 ?? []}
      periodo={filtros.periodo}
      {...p}
    />
  )
}
export function CartaoEIFL3({
  filtros,
  ...p
}: { filtros: FiltrosFluxo } & Omit<Props, 'nivel' | 'q'>) {
  return (
    <CartaoEI
      nivel="FL3"
      q={useMetrica('EI_FL3', filtros)}
      aplicaveis={APLICABILIDADE_FLUXO.EI_FL3 ?? []}
      periodo={filtros.periodo}
      {...p}
    />
  )
}
/** Sustentação (Acelerato): filtros próprios; nunca recebe filtros do fluxo. */
export function CartaoEISust({
  filtros,
  ...p
}: { filtros: FiltrosSustentacao } & Omit<Props, 'nivel' | 'q'>) {
  return (
    <CartaoEI nivel="SUST" q={useMetrica('EI_SUST', filtros)} periodo={filtros.periodo} {...p} />
  )
}
