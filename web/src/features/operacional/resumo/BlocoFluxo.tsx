import { FaixaAtencao, estadoFaixa } from '@/components/ui'
import { useMetrica } from '@/data'
import { itensDiaria, itensSemanal } from '../atencao'
import { ROTULO_VISAO } from '@/features/navegacao/visao'
import { Link } from 'react-router'
import { textoPeriodoCurto } from '@/features/filtros/paineis'
import { BlocoResumo } from './BlocoResumo'
import { FILTROS_FLUXO_RESUMO, filtrosTendencia, useReferenciaDasTendencias } from './consultas'
import { useDestinoDaVisao, useDestinoNaVisao } from './destinos'
import {
  numeroAcimaP95,
  numeroP85,
  numeroVazao,
  numeroVencidosInternos,
  type NumeroModelo,
} from './modelo'
import { NumeroChave } from './NumeroChave'
import { TendenciaFluxo } from './TendenciaFluxo'

const f = FILTROS_FLUXO_RESUMO

function ConteudoFluxo() {
  const destinoDe = useDestinoNaVisao()
  const destinoVisao = useDestinoDaVisao()
  const referencia = useReferenciaDasTendencias()
  const qO3 = useMetrica('O3', f)
  const qO4 = useMetrica('O4', f)
  const qO2 = useMetrica('O2', f)
  const qO12 = useMetrica('O12', f)
  // Os demais alimentam só o "Pede atenção" (as mesmas consultas da Diária e da Semanal).
  const qBL = useMetrica('BLOQUEADOS', f)
  const qO1 = useMetrica('O1', f)
  const qO10 = useMetrica('O10', f)
  const todas = [qO3, qO4, qO2, qO12, qBL, qO1, qO10]
  // A tendência só dispara depois dos números e dos alertas do bloco (resolvidos, com sucesso ou não).
  const qT = useMetrica('TENDENCIA_FLUXO', filtrosTendencia(referencia.dataReferencia), {
    habilitada: referencia.pronta && todas.every((q) => q.estado !== 'carregando'),
  })
  const itens = [
    ...itensDiaria(qO2.dados, qBL.dados, qO1.dados),
    ...itensSemanal(qO3.dados, qO10.dados, qO12.dados),
  ].map((i) => ({ ...i, para: destinoDe(i.para) }))
  const { estado, recarregar } = estadoFaixa([qO2, qBL, qO1, qO3, qO10, qO12])
  const numeros: {
    q: { estado: Parameters<typeof NumeroChave>[0]['estado']; recarregar: () => void }
    modelo: NumeroModelo | null
    id: NumeroModelo['id']
    codigo: string
    rotulo: string
    visao: 'diaria' | 'semanal'
  }[] = [
    {
      q: qO3,
      modelo: qO3.dados ? numeroP85(qO3.dados) : null,
      id: 'p85',
      codigo: 'O3',
      rotulo: 'P85 do tempo de ciclo',
      visao: 'semanal',
    },
    {
      q: qO4,
      modelo: qO4.dados ? numeroVazao(qO4.dados) : null,
      id: 'vazao',
      codigo: 'O4',
      rotulo: 'Vazão da última semana fechada',
      visao: 'semanal',
    },
    {
      q: qO2,
      modelo: qO2.dados ? numeroAcimaP95(qO2.dados) : null,
      id: 'acima-p95',
      codigo: 'O2',
      rotulo: 'Itens abertos acima do P95',
      visao: 'diaria',
    },
    {
      q: qO12,
      modelo: qO12.dados ? numeroVencidosInternos(qO12.dados) : null,
      id: 'vencidos-internos',
      codigo: 'O12',
      rotulo: 'Vencidos por causa interna',
      visao: 'semanal',
    },
  ]
  return (
    <>
      <FaixaAtencao
        nivel="h3"
        titulo="Pede atenção · Fluxo de projeto (BusinessMap)"
        vazio="Nada pede atenção no fluxo de projeto agora."
        janela={`Janela: últimas ${textoPeriodoCurto(f.periodo)}`}
        itens={itens}
        estado={estado}
        onTentarDeNovo={recarregar}
        reserva={{ mobile: 448, desktop: 192 }}
      />
      <dl className="m-0 grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="numeros-fluxo">
        {numeros.map((n) => (
          <NumeroChave
            key={n.id}
            id={n.id}
            codigo={n.codigo}
            rotulo={n.rotulo}
            visao={n.visao}
            estado={n.q.estado}
            modelo={n.modelo}
            onTentarDeNovo={n.q.recarregar}
          />
        ))}
      </dl>
      <TendenciaFluxo q={qT} qO3={qO3} />
      <p className="flex flex-wrap items-center gap-4 text-sm">
        <Link
          to={destinoVisao('semanal')}
          className="alvo inline-flex items-center rounded-md bg-acento px-3 py-1.5 font-semibold text-acento-texto"
        >
          Ver na {ROTULO_VISAO.semanal}
        </Link>
        <Link
          to={destinoVisao('diaria')}
          className="alvo inline-flex items-center text-acento underline"
        >
          Ver na {ROTULO_VISAO.diaria}
        </Link>
      </p>
    </>
  )
}

/** Bloco "Fluxo de projeto · BusinessMap" do Resumo: alertas, números-chave, tendência e links. Só o BusinessMap. */
export function BlocoFluxo() {
  return (
    <BlocoResumo
      id="resumo-fluxo"
      titulo="Fluxo de projeto · BusinessMap"
      dominio="businessmap"
      painel="operacional"
      reserva={{ mobile: 1890, desktop: 950 }}
    >
      <ConteudoFluxo />
    </BlocoResumo>
  )
}
