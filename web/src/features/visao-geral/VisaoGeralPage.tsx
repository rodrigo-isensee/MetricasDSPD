import { Link } from 'react-router'
import {
  Botao,
  CabecalhoPainel,
  EsqueletoCartao,
  ErroPagina,
  FaixaAtencao,
  SeloCalibracao,
  StatusMeta,
  useCalibracaoPronta,
  useEmCalibracao,
  type ItemAtencao,
} from '@/components/ui'
import type { ResultadoVisaoGeral } from '@metricas-dspd/contratos'
import { FaixaCalibracaoFonte } from '@/features/coleta/CalibracaoDasFontes'
import { FrescorFonte } from '@/features/coleta/FrescorFonte'
import { BotaoExportar } from '@/features/exportar'
import { useDataReferencia, useErroDePainelSimulado, useMetrica, useModoMock } from '@/data'
import { fmtData, fmtInteiro, fmtNumero, fmtPct } from '@/lib/formatar'
import {
  NOME_DO_NIVEL,
  ROTA_DO_NIVEL,
  resumirEspera,
  textoAlerta,
  textoIndicador,
  type Indicador,
} from './textos'

type Nivel = ResultadoVisaoGeral['niveis'][number]
type StatusNivel = Nivel['status']

const intervalo = (j: { inicio: string; fim: string }) => `${fmtData(j.inicio)} a ${fmtData(j.fim)}`

/** O10 e O12 só existem na cadência semanal do Operacional: o link já a seleciona (VG-03). */
const CADENCIA_SEMANAL = new Set(['O10', 'O12'])
const destinoAlerta = (a: { nivel: keyof typeof ROTA_DO_NIVEL; metrica: string; ancora: string }) =>
  `${ROTA_DO_NIVEL[a.nivel]}${a.nivel === 'operacional' && CADENCIA_SEMANAL.has(a.metrica) ? '?cadencia=semanal' : ''}#${a.ancora}`

function StatusIndicador({ i }: { i: Indicador }) {
  // Em calibração a meta não é avaliada: nada de Dentro/Fora (CA-05).
  if (useEmCalibracao()(i.codigo)) return <SeloCalibracao testid={`calibracao-${i.codigo}`} />
  if (i.status === 'insuficiente')
    return <StatusMeta status="sem-referencia" texto="Amostra insuficiente" />
  return <StatusMeta status={i.status === 'sem-meta' ? 'sem-meta' : i.status} />
}

const ROTULO_STATUS: Record<
  StatusNivel,
  { status: 'dentro' | 'fora' | 'sem-referencia' | 'sem-meta'; texto: string }
> = {
  atencao: { status: 'fora', texto: 'Atenção' },
  dentro: { status: 'dentro', texto: 'Dentro da meta' },
  insuficiente: { status: 'sem-referencia', texto: 'Amostra insuficiente' },
  'sem-meta': { status: 'sem-meta', texto: 'Sem meta numérica' },
}

function CartaoNivel({ n }: { n: Nivel }) {
  const nome = NOME_DO_NIVEL[n.nivel]
  const st = ROTULO_STATUS[n.status]
  const emCalibracao = useEmCalibracao()
  const calibrando = n.indicadores.some((i) => emCalibracao(i.codigo))
  return (
    <section
      aria-labelledby={`nivel-${n.nivel}-titulo`}
      data-testid={`nivel-${n.nivel}`}
      id={`nivel-${n.nivel}`}
      className="flex flex-col gap-2 rounded-lg border border-borda bg-superficie p-4 lg:col-span-3"
    >
      <h3 id={`nivel-${n.nivel}-titulo`} className="text-base font-semibold">
        {nome}
      </h3>
      {calibrando ? (
        <span className="w-fit">
          <SeloCalibracao testid={`calibracao-nivel-${n.nivel}`} />
        </span>
      ) : (
        <StatusMeta status={st.status} texto={st.texto} className="w-fit" />
      )}
      <ul className="flex flex-1 flex-col gap-2 text-sm">
        {n.indicadores.slice(0, 3).map((i) => (
          <li
            key={i.codigo}
            data-testid={`indicador-${i.codigo}`}
            className="flex flex-col gap-0.5"
          >
            <span>{textoIndicador(i)}</span>
            <span className="flex flex-wrap items-center gap-x-2 text-xs text-texto-2">
              <StatusIndicador i={i} />
              {i.status !== 'insuficiente' && `em ${fmtInteiro(i.base.n)} ${i.base.unidade}`}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-texto-2">Fonte: {n.fonte}</p>
      <Link
        to={ROTA_DO_NIVEL[n.nivel]}
        className="alvo w-fit rounded text-sm font-medium text-acento underline"
      >
        Abrir {nome}
      </Link>
    </section>
  )
}

const EI_NIVEIS = {
  FL1: {
    rotulo: 'Operacional',
    rota: '/operacional?cadencia=semanal#ei-fl1',
    link: 'Ver todos os tipos',
    entidade: 'demandas',
  },
  FL2: {
    rotulo: 'Tático',
    rota: '/tatico#ei-fl2',
    link: 'Detalhar',
    entidade: 'frentes',
  },
  FL3: {
    rotulo: 'Estratégico',
    rota: '/estrategico#ei-fl3',
    link: 'Ver todos os tipos',
    entidade: 'projetos',
  },
  SUST: {
    rotulo: 'Sustentação',
    rota: '/sustentacao#ei-sust',
    link: 'Ver todas as prioridades',
    entidade: 'chamados',
  },
} as const

function LinhaEspera({ e }: { e: ResultadoVisaoGeral['esperaInvisivel'][number] }) {
  const cfg = EI_NIVEIS[e.nivel]
  const r = resumirEspera(e.segmentos)
  const un = e.unidade === 'horas-uteis' ? 'h úteis' : 'dias úteis'
  const casas = e.unidade === 'horas-uteis' ? 2 : 1
  const ok = r.escolhido
  return (
    <li
      className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
      data-testid={`ei-resumo-${e.nivel.toLowerCase()}`}
    >
      <span className="font-semibold">{cfg.rotulo}:</span>
      {ok ? (
        <span>
          {ok.rotulo ? `${ok.rotulo}: ` : ''}cliente {fmtNumero(ok.est.valor.cliente, casas)} {un},
          time {fmtNumero(ok.est.valor.time, casas)} {un}, espera invisível{' '}
          <strong>{fmtPct(ok.est.valor.indicePct, 0)}</strong> ({fmtInteiro(ok.est.n)}{' '}
          {cfg.entidade})
        </span>
      ) : (
        <span>
          Amostra insuficiente
          {r.maiorInsuficiente
            ? ` (${fmtInteiro(r.maiorInsuficiente.n)} de 20 ${cfg.entidade}${r.maiorInsuficiente.rotulo ? `, no maior segmento: ${r.maiorInsuficiente.rotulo}` : ''})`
            : ''}
        </span>
      )}
      <Link to={cfg.rota} className="alvo text-sm text-acento underline">
        {cfg.link}
      </Link>
    </li>
  )
}

const REUNIOES = [
  ['Daily de fluxo', 'Qual item mais velho não andou desde ontem?', '/operacional?cadencia=diaria'],
  [
    'Revisão de fluxo semanal',
    'O que mudou na nossa distribuição de tempo?',
    '/operacional?cadencia=semanal',
  ],
  ['Reunião de serviço', 'Estamos cumprindo o que publicamos?', '/tatico#t2'],
  ['Reposição e priorização', 'O que entra, e o que sai da fila para isso caber?', '/tatico#t4'],
  ['Revisão de portfólio', 'Estamos terminando ou só começando?', '/estrategico#e1'],
  ['Revisão estratégica', 'O que entregamos mudou algum número do negócio?', '/estrategico#e3'],
] as const

export default function VisaoGeralPage() {
  const data = useDataReferencia()
  const q = useMetrica('VISAO_GERAL', {})
  const pronta = useCalibracaoPronta()
  const carregandoSimulado = useModoMock() === 'carregando'
  const aguardando = !pronta && !carregandoSimulado
  if (useErroDePainelSimulado())
    return <ErroPagina erro="Erro simulado (mock=erro)" onTentarDeNovo={() => undefined} />
  // Antes de saber o que está em calibração, nenhum status é mostrado (some depois = pior que esperar).
  const d = pronta ? q.dados : undefined
  const itens: ItemAtencao[] =
    d?.alertas.map((a) => ({
      id: `${a.nivel}-${a.codigo}`,
      texto: `${NOME_DO_NIVEL[a.nivel]}: ${textoAlerta(a)}`,
      para: destinoAlerta(a),
      codigo: a.metrica,
    })) ?? []
  const fluxo = d?.esperaInvisivel.filter((e) => e.fonte === 'BusinessMap') ?? []
  const sust = d?.esperaInvisivel.filter((e) => e.fonte === 'Acelerato') ?? []
  return (
    <div className="flex flex-col gap-4">
      <CabecalhoPainel
        titulo="Visão geral"
        pergunta="O que pede atenção agora?"
        dataCorte={data}
        fonte="BusinessMap e Acelerato (blocos separados)"
        slug="visao-geral"
        frescor={
          <div className="flex flex-col gap-1" data-testid="frescor-fontes">
            <FrescorFonte dominio="businessmap" comNome />
            <FrescorFonte dominio="acelerato" comNome />
          </div>
        }
        publico="Consolidado de todas as equipes (o sistema não compara equipes), sem filtros nesta tela."
      />
      <p className="text-sm text-texto-2" data-testid="preferencias-valem">
        As preferências de métricas valem para os painéis. Esta tela mostra tudo.{' '}
        <Link to="/preferencias" className="text-acento underline">
          Preferências
        </Link>
      </p>
      <div className="flex flex-wrap items-center gap-2" data-testid="barra-exportar">
        <BotaoExportar base="visao-geral" />
        <BotaoExportar base="personalizada" />
      </div>
      {pronta && (
        <>
          <FaixaCalibracaoFonte dominio="businessmap" />
          <FaixaCalibracaoFonte dominio="acelerato" />
        </>
      )}
      {d && (
        <p
          className="rounded-md border border-borda bg-superficie p-3 text-sm"
          data-testid="recorte-visao-geral"
        >
          Consolidado de todas as equipes · últimas 12 semanas. Recorte fixo, igual ao dos painéis:
          Operacional e Tático em {intervalo(d.recortes.fluxo)}; Estratégico em{' '}
          {intervalo(d.recortes.estrategico)}; Sustentação em {intervalo(d.recortes.sustentacao)}.
        </p>
      )}
      {aguardando && (
        <div className="min-h-screen" aria-hidden="true" data-testid="aguardando-coleta" />
      )}
      {!aguardando && (q.estado === 'carregando' || (q.estado === 'ok' && !pronta)) && (
        // Em tela larga reserva uma tela inteira: o conteúdo real é mais alto e o rodapé, ao descer, não gera CLS.
        <div className="lg:min-h-screen">
          <EsqueletoCartao codigo="VISAO_GERAL" titulo="Visão geral" altura={320} />
        </div>
      )}
      {q.estado === 'erro' && (
        <div
          role="alert"
          className="rounded-lg border border-alerta bg-alerta-fundo p-4"
          data-testid="estado-erro-VISAO_GERAL"
        >
          <p>Não foi possível carregar a visão geral.</p>
          <Botao onClick={q.recarregar} className="mt-2">
            Tentar de novo
          </Botao>
        </div>
      )}
      {d && (
        <>
          <FaixaAtencao momento="hoje" titulo="O que pede atenção agora" itens={itens} maximo={6} />
          <section aria-labelledby="vg-niveis" className="flex flex-col gap-2">
            <h2 id="vg-niveis" className="text-lg font-bold">
              Por nível
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {d.niveis.map((n) => (
                <CartaoNivel key={n.nivel} n={n} />
              ))}
            </div>
          </section>
          <section
            aria-labelledby="vg-ei"
            className="flex flex-col gap-2 rounded-lg border border-borda bg-superficie p-4"
            data-testid="ei-resumo"
          >
            <h2 id="vg-ei" className="text-lg font-bold">
              Espera invisível
            </h2>
            <p className="text-sm text-texto-2">
              Sempre as duas visões, de um segmento nomeado por nível: o de maior índice entre os
              com 20 itens ou mais.
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              {fluxo.map((e) => (
                <LinhaEspera key={e.nivel} e={e} />
              ))}
            </ul>
            <hr className="border-borda" />
            <p className="text-xs text-texto-2" data-testid="ei-fonte-sust">
              Fonte diferente (Acelerato). Não comparável com os níveis acima.
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              {sust.map((e) => (
                <LinhaEspera key={e.nivel} e={e} />
              ))}
            </ul>
          </section>
          <section aria-labelledby="vg-reuniao" className="flex flex-col gap-2">
            <h2 id="vg-reuniao" className="text-lg font-bold">
              Por reunião
            </h2>
            <ul className="grid gap-2 lg:grid-cols-3">
              {REUNIOES.map(([nome, pergunta, para]) => (
                <li key={nome} className="rounded-md border border-borda bg-superficie p-3 text-sm">
                  <Link to={para} className="alvo font-semibold text-acento underline">
                    {nome}
                  </Link>
                  <p className="text-texto-2">{pergunta}</p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}

export const handle = { titulo: 'Visão geral' }
