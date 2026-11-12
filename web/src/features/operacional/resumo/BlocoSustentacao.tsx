import { useMemo } from 'react'
import { Link } from 'react-router'
import { FaixaAtencao, estadoFaixa } from '@/components/ui'
import { useMetrica } from '@/data'
import { itensSustentacao } from '../atencao'
import { ROTULO_VISAO } from '@/features/navegacao/visao'
import { useFiltros } from '@/features/filtros'
import { textoPeriodoCurto } from '@/features/filtros/paineis'
import { BlocoResumo } from './BlocoResumo'
import { FILTROS_SUST_RESUMO, filtrosTendencia, useReferenciaDasTendencias } from './consultas'
import { useDestinoDaVisao, useDestinoNaVisao } from './destinos'
import { numeroS1, numeroS2, numeroS3 } from './modelo'
import { FiltroEquipeBloco } from './FiltroEquipeBloco'
import { NumeroChave } from './NumeroChave'
import { TendenciaSustentacao } from './TendenciaSustentacao'

/** Janela do alerta do Resumo, escrita na tela: sai dos mesmos filtros que alimentam as consultas (U1 = (a), decidida pelo usuário em 2026-10-14). */
const JANELA_ALERTA = textoPeriodoCurto(FILTROS_SUST_RESUMO.periodo)

function ConteudoSustentacao() {
  // Mesmo prefixo da visão Sustentação (`sust_equipe`): o link "Ver na Sustentação" leva a equipe junto.
  const uso = useFiltros('sustentacao', { prefixo: 'sust_' })
  const f = useMemo(
    () => ({ ...FILTROS_SUST_RESUMO, equipe: uso.filtros.equipe }),
    [uso.filtros.equipe],
  )
  const destinoDe = useDestinoNaVisao()
  const destinoVisao = useDestinoDaVisao()
  const referencia = useReferenciaDasTendencias()
  const qS2 = useMetrica('S2', f)
  const qS1 = useMetrica('S1', f)
  const qS3 = useMetrica('S3', f)
  const qT = useMetrica('TENDENCIA_SUST', filtrosTendencia(referencia.dataReferencia, f.equipe), {
    habilitada: referencia.pronta && [qS2, qS1, qS3].every((q) => q.estado !== 'carregando'),
  })
  const itens = itensSustentacao(qS2.dados, qS1.dados).map((i) => ({
    ...i,
    para: destinoDe(i.para),
  }))
  const { estado, recarregar } = estadoFaixa([qS2, qS1])
  return (
    <>
      <FiltroEquipeBloco bloco="sustentacao" uso={uso} />
      <FaixaAtencao
        nivel="h3"
        titulo="Pede atenção · Sustentação (Acelerato)"
        vazio={`Nada pede atenção na Sustentação nas últimas ${JANELA_ALERTA}.`}
        janela={`Janela: últimas ${JANELA_ALERTA}`}
        itens={itens}
        estado={estado}
        onTentarDeNovo={recarregar}
        reserva={{ mobile: 108, desktop: 88 }}
      />
      <p className="text-xs text-texto-2" data-testid="nota-janelas-alerta">
        Mesmo alerta, janelas diferentes: aqui as últimas {JANELA_ALERTA}; na visão Sustentação, o
        período do filtro (padrão 6 meses). Por isso o resultado pode diferir.{' '}
        <Link to={destinoVisao('sustentacao')} className="alvo text-acento underline">
          Ver na Sustentação
        </Link>
      </p>
      <dl className="m-0 grid grid-cols-2 gap-3 lg:grid-cols-3" data-testid="numeros-sustentacao">
        <NumeroChave
          id="s2"
          codigo="S2"
          rotulo="Prioridades com aderência ao SLA abaixo de 90%"
          visao="sustentacao"
          estado={qS2.estado}
          erro={qS2.erro}
          modelo={qS2.dados ? numeroS2(qS2.dados) : null}
          onTentarDeNovo={qS2.recarregar}
        />
        <NumeroChave
          id="s1"
          codigo="S1"
          rotulo="Prioridades com mediana de restauração acima do alvo"
          visao="sustentacao"
          estado={qS1.estado}
          erro={qS1.erro}
          modelo={qS1.dados ? numeroS1(qS1.dados) : null}
          onTentarDeNovo={qS1.recarregar}
        />
        <NumeroChave
          id="volume"
          codigo="S3"
          rotulo="Volume de chamados na janela"
          visao="sustentacao"
          estado={qS3.estado}
          erro={qS3.erro}
          modelo={qS3.dados ? numeroS3(qS3.dados) : null}
          onTentarDeNovo={qS3.recarregar}
        />
      </dl>
      <TendenciaSustentacao q={qT} />
      <p className="text-sm">
        <Link
          to={destinoVisao('sustentacao')}
          className="alvo inline-flex items-center rounded-md bg-acento px-3 py-1.5 font-semibold text-acento-texto"
        >
          Ver na {ROTULO_VISAO.sustentacao}
        </Link>
      </p>
    </>
  )
}

/** Bloco "Sustentação · Acelerato" do Resumo: alertas, números-chave, tendência e link. Só o Acelerato. */
export function BlocoSustentacao() {
  return (
    <BlocoResumo
      id="resumo-sustentacao"
      titulo="Sustentação · Acelerato"
      dominio="acelerato"
      painel="sustentacao"
      reserva={560}
    >
      <ConteudoSustentacao />
    </BlocoResumo>
  )
}
