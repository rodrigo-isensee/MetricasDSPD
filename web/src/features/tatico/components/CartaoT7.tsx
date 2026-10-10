import type { FiltrosFluxo } from '@metricas-dspd/contratos'
import { Barras, Dispersao, Histograma } from '@/components/charts'
import {
  AmostraInsuficiente,
  CartaoMetrica,
  NumeroGrande,
  StatusMeta,
  TabelaDados,
} from '@/components/ui'
import { useMetrica } from '@/data'
import { fmtDiasUteis, fmtInteiro } from '@/lib/formatar'
import { NOTAS_TATICO } from '../notas'
import { propsCartao } from '@/features/painel/propsCartao'

export function CartaoT7({ filtros }: { filtros: FiltrosFluxo }) {
  const q = useMetrica('T7', filtros)
  const d = q.dados
  const ref = d?.referencia
  const hist = d?.histograma
  const sem = ref?.status === 'insuficiente' || hist?.status === 'insuficiente'
  const projetos = d
    ? [...d.porProjeto].sort(
        (a, b) => b.abertas - a.abertas || a.projeto.localeCompare(b.projeto, 'pt-BR'),
      )
    : []
  // Ordem temporal (aging): da frente mais velha para a mais nova.
  const idades = d ? [...d.idades].sort((a, b) => b.idadeDiasUteis - a.idadeDiasUteis) : []
  const acima = idades.filter(
    (i) => i.situacao === 'acima-p95' || i.situacao === 'entre-p85-p95',
  ).length
  const leitura = d
    ? `${fmtInteiro(d.kpis.projetosComFrentes)} projetos têm frentes em andamento (${fmtInteiro(d.kpis.frentesEmAndamento)} abertas).${ref?.status === 'ok' ? ` ${fmtInteiro(acima)} estão acima do P85.` : ''}`
    : undefined
  const nomesProjetos = projetos.map((p) => p.projeto)
  return (
    <CartaoMetrica
      {...propsCartao('T7', q, NOTAS_TATICO.T7)}
      {...(d
        ? {
            base: sem && ref ? { ...d.base, n: ref.n } : d.base,
            baseVariante: sem ? ('insuficiente' as const) : ('ok' as const),
            janelaPercentis: d.janelaPercentis,
            periodo: filtros.periodo,
          }
        : {})}
      {...(leitura ? { leitura } : {})}
      statusMeta={d ? (d.kpis.acimaDoLimite ? 'fora' : 'dentro') : 'sem-meta'}
      className="lg:col-span-6"
    >
      {d && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <NumeroGrande
              valor={fmtInteiro(d.kpis.frentesEmAndamento)}
              rotulo="frentes em andamento"
              textoCompleto={`${d.kpis.frentesEmAndamento} frentes em andamento`}
            />
            <NumeroGrande
              valor={fmtInteiro(d.kpis.projetosComFrentes)}
              rotulo="projetos com frentes ao mesmo tempo"
              textoCompleto={`${d.kpis.projetosComFrentes} projetos com frentes ao mesmo tempo`}
            />
            <NumeroGrande
              valor={fmtInteiro(d.kpis.limiteFrentes)}
              rotulo="limite de frentes simultâneas"
              textoCompleto={`Limite de ${d.kpis.limiteFrentes} frentes simultâneas`}
              complemento={
                <StatusMeta
                  status={d.kpis.acimaDoLimite ? 'fora' : 'dentro'}
                  texto={d.kpis.acimaDoLimite ? 'Acima do limite' : 'Dentro do limite'}
                />
              }
            />
          </div>
          {projetos.length > 0 && (
            <Barras
              descricao="Frentes abertas por projeto"
              orientacao="horizontal"
              unidade="frentes"
              categorias={projetos.map((p) => ({
                rotulo: p.projeto,
                valores: { abertas: p.abertas },
              }))}
              series={[{ chave: 'abertas', rotulo: 'Frentes abertas', cor: 1 }]}
              semLegenda
            />
          )}
          {idades.length > 0 && (
            <Dispersao
              descricao="Idade das frentes abertas por projeto, em dias úteis"
              rotuloY="Idade (dias úteis)"
              eixoX={{ tipo: 'categorias', categorias: nomesProjetos }}
              pontos={idades.map((i) => ({
                id: i.cardId,
                rotulo: i.titulo,
                x: Math.max(0, nomesProjetos.indexOf(i.projeto)),
                y: i.idadeDiasUteis,
                forma:
                  i.situacao === 'acima-p95'
                    ? 'triangulo'
                    : i.situacao === 'entre-p85-p95'
                      ? 'losango'
                      : 'circulo',
              }))}
              legendaFormas={{ triangulo: 'Acima do P95', losango: 'Entre P85 e P95' }}
              {...(ref?.status === 'ok'
                ? {
                    referencias: [
                      { valor: ref.valor.p50, rotulo: 'P50', traco: 'pontilhado' as const },
                      { valor: ref.valor.p85, rotulo: 'P85', traco: 'tracejado' as const },
                      { valor: ref.valor.p95, rotulo: 'P95', traco: 'solido' as const },
                    ],
                  }
                : {})}
            />
          )}
          <TabelaDados
            legenda="Frentes abertas, da mais antiga para a mais nova"
            colunas={[
              { chave: 'frente', titulo: 'Frente' },
              { chave: 'projeto', titulo: 'Projeto' },
              { chave: 'idade', titulo: 'Idade', alinhar: 'direita' },
            ]}
            linhas={idades.map((i) => ({
              frente: i.titulo,
              projeto: i.projeto,
              idade: fmtDiasUteis(i.idadeDiasUteis, 0),
            }))}
            vazio="Nenhuma frente aberta."
          />
          {sem && ref && (
            <AmostraInsuficiente
              variante="lenta"
              entidade="frentes"
              n={ref.n}
              codigo="T7"
              janela={d.janelaPercentis}
            />
          )}
          {hist?.status === 'ok' && (
            <Histograma
              descricao="Tempo de ciclo das frentes concluídas"
              unidadeX="dias úteis"
              unidadeY="frentes"
              faixas={hist.valor.faixas}
            />
          )}
        </div>
      )}
    </CartaoMetrica>
  )
}
