import { Barras } from '@/components/charts'
import { CartaoMetrica, SeletorLocal, TabelaDados } from '@/components/ui'
import { PRIORIDADES, type FiltrosSustentacao } from '@metricas-dspd/contratos'
import { entradaDoCatalogo } from '@/content/catalogo-metricas'
import { useMetrica } from '@/data'
import { fmtInteiro, fmtPct } from '@/lib/formatar'
import { useParametroLocal } from '@/features/filtros'
import { fmtHU, minusculo } from '../formatar'
import { NOTAS_SUSTENTACAO } from '../notas'
import { TextoInsuficiente } from './comuns'

const VALORES = PRIORIDADES.map(minusculo)

export function CartaoS4({ filtros }: { filtros: FiltrosSustentacao }) {
  const m = entradaDoCatalogo('S4')
  const q = useMetrica('S4', filtros)
  const [aba, setAba] = useParametroLocal('s4', VALORES, 'p1')
  const d = q.dados
  const ativa =
    d && (d.prioridades.find((p) => minusculo(p.prioridade) === aba) ?? d.prioridades[0])
  const maior = ativa?.niveis.find((x) => x.pct !== null && x.nivel === 'N1')
  const leitura = ativa
    ? maior?.pct != null
      ? `${ativa.prioridade}: o N1 resolveu ${fmtPct(maior.pct, 0)} dos ${fmtInteiro(ativa.n)} chamados fechados.`
      : `${ativa.prioridade}: ${fmtInteiro(ativa.n)} chamados fechados; percentuais e tempos só aparecem com 20 ou mais.`
    : undefined
  return (
    <CartaoMetrica
      codigo="S4"
      titulo={m.nome}
      pergunta={m.pergunta}
      estado={q.estado}
      atualizando={q.atualizando}
      {...(d ? { base: d.base, criterios: d.criterios } : {})}
      {...(leitura ? { leitura } : {})}
      nota={NOTAS_SUSTENTACAO.S4 as NonNullable<(typeof NOTAS_SUSTENTACAO)[string]>}
      meta="Sem meta isolada"
      fonte={m.fonte}
      granularidade={m.granularidade}
      onTentarDeNovo={q.recarregar}
      erro={q.erro}
      className="lg:col-span-12"
    >
      {d && ativa && (
        <SeletorLocal
          codigo="S4"
          rotulo="Prioridade"
          valor={minusculo(ativa.prioridade)}
          onChange={setAba}
          itens={d.prioridades.map((p) => ({
            valor: minusculo(p.prioridade),
            rotulo: p.prioridade,
            contagem: p.n,
            insuficiente: p.n < 20,
          }))}
        >
          <div className="flex flex-col gap-3" data-testid={`s4-${minusculo(ativa.prioridade)}`}>
            <p className="text-sm text-texto-2">
              Leia ao lado de S1 (tempo) e da reabertura; sem meta isolada.
            </p>
            <Barras
              orientacao="horizontal"
              descricao={`Chamados ${ativa.prioridade} resolvidos por nível`}
              unidade="chamados"
              larguraRotulos={90}
              altura={200}
              semLegenda
              categorias={ativa.niveis.map((x) => ({ rotulo: x.nivel, valores: { n: x.n } }))}
              series={[{ chave: 'n', rotulo: 'Chamados resolvidos', cor: 7 }]}
            />
            <TabelaDados
              codigo="S4-detalhe"
              legenda={`Chamados ${ativa.prioridade} por nível de resolução: volume, percentual da prioridade e tempo na etapa de atendimento`}
              colunas={[
                { chave: 'nivel', titulo: 'Nível' },
                { chave: 'n', titulo: 'Chamados', alinhar: 'direita' },
                { chave: 'pct', titulo: `% de ${ativa.prioridade}`, alinhar: 'direita' },
                { chave: 'p50', titulo: 'Etapa: mediana', alinhar: 'direita' },
                { chave: 'p85', titulo: 'Etapa: P85', alinhar: 'direita' },
              ]}
              linhas={ativa.niveis.map((x) => {
                const t = x.tempoEtapa
                return {
                  nivel: x.nivel,
                  n: fmtInteiro(x.n),
                  pct: x.pct === null ? '—' : fmtPct(x.pct, 0),
                  p50:
                    t === null ? (
                      'não se aplica'
                    ) : t.status === 'ok' ? (
                      fmtHU(t.valor.p50)
                    ) : (
                      <TextoInsuficiente n={t.n} />
                    ),
                  p85: t === null ? 'não se aplica' : t.status === 'ok' ? fmtHU(t.valor.p85) : '—',
                }
              })}
            />
            {ativa.n < 20 && (
              <p className="text-sm" data-testid="s4-insuficiente">
                <TextoInsuficiente n={ativa.n} /> · percentuais e tempos não são publicados; as
                contagens permanecem.
              </p>
            )}
          </div>
        </SeletorLocal>
      )}
    </CartaoMetrica>
  )
}
